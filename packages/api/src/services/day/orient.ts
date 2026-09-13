import { and, eq, gte, lte } from "drizzle-orm";

import { days, users, type RlsClient } from "@syn/db";
import { ORIENT_READBACK_KEYS } from "@syn/constants";
import { SKIP_LINE_WINDOW_DAYS, addDays, shouldShowSkipLine } from "@syn/utils";

import { getLastNight } from "./journal";
import { ensureDayRow, readDayProfile } from "./materialize-day";

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
 * answers by key (`ORIENT_READBACK_KEYS`), the passage, whether the gratitude
 * line is asked at all, and the one fact behind the R18 line — computed by
 * `shouldShowSkipLine` from the last eight mornings' `morning_gratitude`
 * (yesterday first; a day with no row is a day nothing was written).
 */

export type OrientView = {
  date: string;
  /** Null when there is no entry for last night, or the switch is off. */
  lastNight: {
    makeHappen: string | null;
    visualisation: string | null;
    lookingForward: string | null;
  } | null;
  passage: string | null;
  askGratitude: boolean;
  skippedYesterday: boolean;
  gratitude: string | null;
  intention: string | null;
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
      .select({ gratitude: days.morningGratitude, intention: days.intention })
      .from(days)
      .where(eq(days.id, day.id))
      .limit(1);

    const [account] = await tx
      .select({
        passage: users.orientPassage,
        askGratitude: users.orientAskGratitude,
        showLastNight: users.orientShowLastNight,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

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

    return {
      gratitude: lines?.gratitude ?? null,
      intention: lines?.intention ?? null,
      passage: account?.passage ?? null,
      askGratitude: account?.askGratitude ?? true,
      showLastNight: account?.showLastNight ?? true,
      skips,
    };
  });

  const entry = row.showLastNight ? await getLastNight(rls, userId, date) : null;
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
    passage: nonEmpty(row.passage ?? undefined),
    askGratitude: row.askGratitude,
    skippedYesterday: row.askGratitude && shouldShowSkipLine(row.skips),
    gratitude: row.gratitude,
    intention: row.intention,
  };
}

/** The two optional lines, autosaved by the frame — `days.morning_gratitude`, `days.intention`. */
export async function saveMorning(
  rls: RlsClient,
  userId: string,
  input: { date: string; gratitude?: string | null; intention?: string | null },
): Promise<{ saved: true }> {
  await rls.execute(async (tx) => {
    const profile = await readDayProfile(tx, userId);
    const day = await ensureDayRow(tx, userId, profile, { date: input.date });
    const patch: { morningGratitude?: string | null; intention?: string | null } = {};
    if (input.gratitude !== undefined) patch.morningGratitude = nonEmpty(input.gratitude ?? undefined);
    if (input.intention !== undefined) patch.intention = nonEmpty(input.intention ?? undefined);
    if (Object.keys(patch).length === 0) return;
    await tx
      .update(days)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(days.id, day.id));
  });
  return { saved: true };
}
