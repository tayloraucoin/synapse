import { and, eq, gte, lte } from "drizzle-orm";

import { days, users, type RlsClient } from "@syn/db";
import { ORIENT_READBACK_KEYS } from "@syn/constants";
import type { MorningMode, PassageView, QuoteView } from "@syn/types";
import {
  SKIP_LINE_WINDOW_DAYS,
  addDays,
  shouldShowSkipLine,
  weekdayIndex,
} from "@syn/utils";

import { plannedDayFor } from "../plan/day-plans";
import { readPreferencesInTx } from "../user/preferences";
import { confirmDay } from "./confirm-day";
import { getLastNight } from "./journal";
import { ensureDayRow, readDay, readDayProfile } from "./materialize-day";
import { resolvePickDefaults } from "./quick-pick";
import { quoteSlotFor } from "./reading";

/**
 * The orient frame — UX v1.1 §5.1, §5.2 (DYN-13).
 *
 * ONE READ, AND THE STAMP RIDES IN IT. "Opening it stamps `woke_at = now`,
 * source orient (R11)" — so the query that hands the frame its words is the
 * one that writes the wake, and it writes it ONCE: a frame reloaded, or a
 * wake already corrected by hand in the day header, is never overwritten.
 * The day row is created here when it does not exist yet; the frame is often
 * the first thing that touches a day nobody planned.
 *
 * THE FRAME READS THE PERSON'S WORDS AND NOTHING ELSE. Last night's three
 * answers by key (`ORIENT_READBACK_KEYS`), the passages in cycle order with
 * today's index, the day's quote when opted in (UX v1.2 §3.12 — attributed,
 * never the app's, never keyed to the person), which of the three lines are
 * asked at all, and the one fact behind the R18 line — computed by
 * `shouldShowSkipLine` from the last eight mornings' `morning_gratitude`
 * (yesterday first; a day with no row is a day nothing was written).
 *
 * NOTHING IS WRITTEN BY READING THE FRAME except the wake stamp, once. The
 * cycle index is arithmetic over the date (`cycleIndex`), not a cursor; which
 * passage was read is never recorded (§13 #21).
 *
 * `users.orient_show_last_night` IS NO LONGER READ (v1.2 R41): last night's
 * lines are always returned when they exist, and the frame keeps them one
 * tap away behind a collapsed row. The column is dropped in `0008`.
 */

export type OrientView = {
  date: string;
  /** Null when there is no entry for last night. Rendered collapsed (R41). */
  lastNight: {
    makeHappen: string | null;
    visualisation: string | null;
    lookingForward: string | null;
  } | null;
  /* ---- UX v1.2 §3.12, §5.2 (RUN-4) ---- */
  /** The person's passages in cycle order; empty when none. */
  passages: PassageView[];
  /**
   * Which slide the frame opens on: `0…n−1` over the passages, or `n` for the
   * quote slot when one exists; null when there is nothing to read.
   */
  todayIndex: number | null;
  /** Today's quote, only when opted in and the bank has one. */
  quote: QuoteView | null;
  askGratitude: boolean;
  askIntention: boolean;
  askVisualisation: boolean;
  morningMode: MorningMode;
  skippedYesterday: boolean;
  gratitude: string | null;
  intention: string | null;
  /** *Today, as I see it* — written by RUN-9's `saveMorning`. */
  visualisation: string | null;
  /*
   * ---- UX v1.2 §5.2, R37 (RUN-13): what the primary says under *Set from
   * the plan*. Read from the plan for this weekday and the profile — the
   * frame never infers a set; it only knows what the tap will do.
   */
  todayAnchor: {
    /** A plan holds this weekday (else the tap lands on the pick). */
    hasPlan: boolean;
    /** The profile says *sometimes* for this weekday: the frame asks first. */
    sometimes: boolean;
    /** *depends on the day* — the pick asks what gives; the frame falls back to it. */
    askAnchor: boolean;
    /** "9:00" — the plan's *working by*, when the day has work. */
    workStartClock: string | null;
    /** Whether that anchor holds (`routine_cut`) — the label carries it only then. */
    anchorIsHard: boolean;
    /** The day is already set or closed — the primary only moves. */
    alreadySet: boolean;
  };
};

const [MAKE_HAPPEN, VISUALISATION, LOOKING_FORWARD] = ORIENT_READBACK_KEYS;

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

export async function readOrient(
  rls: RlsClient,
  userId: string,
  date: string,
  now: Date,
): Promise<OrientView> {
  const row = await rls.execute(async (tx) => {
    const profile = await readDayProfile(tx, userId);
    const day = await ensureDayRow(tx, userId, profile, { date });

    // The stamp — once. A closed day is never stamped: the entry rule does
    // not send anyone here for one, and a deep link should not either.
    if (day.wokeAt === null && day.closedAt === null) {
      await tx
        .update(days)
        .set({ wokeAt: now, wokeAtSource: "orient", updatedAt: now })
        .where(eq(days.id, day.id));
    }

    const [lines] = await tx
      .select({
        gratitude: days.morningGratitude,
        intention: days.intention,
        visualisation: days.visualisation,
      })
      .from(days)
      .where(eq(days.id, day.id))
      .limit(1);

    const [account] = await tx
      .select({
        askGratitude: users.orientAskGratitude,
        askIntention: users.orientAskIntention,
        askVisualisation: users.orientAskVisualisation,
        quotesOptIn: users.quotesOptIn,
        morningMode: users.morningMode,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // The reading: the passages in cycle order, and the quote when opted in.
    const { passages: passageRows, quote, todayIndex } = await quoteSlotFor(tx, userId, date);

    // The last eight mornings, yesterday first: the seven-day window plus the
    // day before it, which "second consecutive" needs.
    const from = addDays(date, -(SKIP_LINE_WINDOW_DAYS + 1));
    const to = addDays(date, -1);
    const history = await tx
      .select({ date: days.date, gratitude: days.morningGratitude })
      .from(days)
      .where(and(eq(days.userId, userId), gte(days.date, from), lte(days.date, to)));
    const byDate = new Map(history.map((entry) => [String(entry.date), entry.gratitude]));
    const skips: boolean[] = [];
    for (let i = 1; i <= SKIP_LINE_WINDOW_DAYS + 1; i += 1) {
      const key = addDays(date, -i);
      const written = byDate.get(key);
      skips.push(written === undefined || written === null || written.trim() === "");
    }

    // What the tap will do (v1.2 R37, RUN-13): the plan for this weekday,
    // the profile's word for the day, and whether the anchor holds.
    const prefs = await readPreferencesInTx(tx, userId);
    const weekday = weekdayIndex(date);
    const planned = prefs ? await plannedDayFor(tx, userId, prefs, weekday) : null;
    const workMode = prefs?.workDays?.[String(weekday) as keyof NonNullable<typeof prefs.workDays>];
    const todayAnchor: OrientView["todayAnchor"] = {
      hasPlan: planned !== null,
      sometimes: workMode === "sometimes",
      askAnchor: prefs?.anchorDirection === "depends",
      workStartClock: planned?.anchors.workStart ?? null,
      anchorIsHard: prefs?.anchorDirection !== "work_waits",
      alreadySet: day.confirmedAt !== null || day.closedAt !== null,
    };

    return {
      gratitude: lines?.gratitude ?? null,
      intention: lines?.intention ?? null,
      visualisation: lines?.visualisation ?? null,
      passages: passageRows,
      todayIndex,
      quote,
      askGratitude: account?.askGratitude ?? true,
      askIntention: account?.askIntention ?? true,
      askVisualisation: account?.askVisualisation ?? true,
      morningMode: account?.morningMode ?? ("set_from_plan" as const),
      skips,
      todayAnchor,
    };
  });

  const entry = await getLastNight(rls, userId, date);
  const lastNight =
    entry === null
      ? null
      : {
          makeHappen: nonEmpty(entry.answers[MAKE_HAPPEN]),
          visualisation: nonEmpty(entry.answers[VISUALISATION]),
          lookingForward: nonEmpty(entry.answers[LOOKING_FORWARD]),
        };
  const hasAny =
    lastNight !== null &&
    (lastNight.makeHappen !== null ||
      lastNight.visualisation !== null ||
      lastNight.lookingForward !== null);

  return {
    date,
    lastNight: hasAny ? lastNight : null,
    passages: row.passages,
    todayIndex: row.todayIndex,
    quote: row.quote,
    askGratitude: row.askGratitude,
    askIntention: row.askIntention,
    askVisualisation: row.askVisualisation,
    morningMode: row.morningMode,
    skippedYesterday: row.askGratitude && shouldShowSkipLine(row.skips),
    gratitude: row.gratitude,
    intention: row.intention,
    visualisation: row.visualisation,
    todayAnchor: row.todayAnchor,
  };
}

export type SaveMorningResult = {
  saved: true;
  /** UX v1.2 R37 — whether *Set from the plan* set the day in this call. */
  set: boolean;
  /** Why not, when it did not. `no_plan` lands the frame on the pick. */
  reason:
    | "not_asked"
    | "no_plan"
    | "sometimes_unanswered"
    | "anchor_unanswered"
    | "already_set"
    | null;
};

/**
 * The frame's optional lines, autosaved — `days.morning_gratitude`,
 * `days.intention`, and since UX v1.2 `days.visualisation`.
 *
 * `andSetDay` (UX v1.2 R37, TD-17): *Start the morning* under *Set from the
 * plan* sets the day in the same call — through the pick's own resolver and
 * the same `confirmDay` the pick calls, never a second path. The words are
 * saved first, in their own transaction, so a failure to set never loses a
 * line. A *sometimes* day's answer (`workingToday`) and, under *depends*,
 * what gives (`anchorIsHard`) come from the frame's dialog; when the frame
 * did not ask, the day is NOT set and the reason says which question is
 * open — the tap confirms, nothing infers (v1.1 §2.3).
 */
export async function saveMorning(
  rls: RlsClient,
  userId: string,
  input: {
    date: string;
    gratitude?: string | null;
    intention?: string | null;
    visualisation?: string | null;
    andSetDay?: boolean;
    workingToday?: boolean;
    anchorIsHard?: boolean;
  },
  context?: { todayKey: string; timeZone: string; dayCloseTime: string; now: Date },
): Promise<SaveMorningResult> {
  await rls.execute(async (tx) => {
    const profile = await readDayProfile(tx, userId);
    const day = await ensureDayRow(tx, userId, profile, { date: input.date });
    const patch: {
      morningGratitude?: string | null;
      intention?: string | null;
      visualisation?: string | null;
    } = {};
    if (input.gratitude !== undefined) patch.morningGratitude = nonEmpty(input.gratitude ?? undefined);
    if (input.intention !== undefined) patch.intention = nonEmpty(input.intention ?? undefined);
    if (input.visualisation !== undefined) {
      patch.visualisation = nonEmpty(input.visualisation ?? undefined);
    }
    if (Object.keys(patch).length === 0) return;
    await tx
      .update(days)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(days.id, day.id));
  });

  if (!input.andSetDay || !context) return { saved: true, set: false, reason: "not_asked" };

  const day = await rls.execute((tx) => readDay(tx, userId, input.date));
  if (day?.confirmedAt || day?.closedAt) return { saved: true, set: false, reason: "already_set" };

  // A plan-less weekday has no placement for its workout and no lists of its
  // own — the pick is the honest place for it (v1.2 §5.3's fallback).
  const planned = await rls.execute(async (tx) => {
    const prefs = await readPreferencesInTx(tx, userId);
    return prefs ? plannedDayFor(tx, userId, prefs, weekdayIndex(input.date)) : null;
  });
  if (!planned) return { saved: true, set: false, reason: "no_plan" };

  const resolved = await resolvePickDefaults(rls, userId, input.date, context, {
    workingToday: input.workingToday,
    anchorIsHard: input.anchorIsHard,
  });
  if ("blocked" in resolved) return { saved: true, set: false, reason: resolved.blocked };

  await confirmDay(rls, userId, resolved.input, { ...context, leaveLastNight: true });
  return { saved: true, set: true, reason: null };
}
