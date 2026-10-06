import { and, eq, gte, inArray, isNotNull, isNull, lt, ne } from "drizzle-orm";

import { buildServiceRoleAuthContext } from "@syn/auth";
import {
  createRlsClient,
  dayBlocks,
  dayItems,
  days,
  db,
  journalEntries,
  notificationPrefs,
  users,
} from "@syn/db";
import { BLOCK_KIND_WORDS, NOTIFICATION_CATALOGUE } from "@syn/constants";
import { createLogger } from "@syn/observability";
import type { BlockKind, NotificationKind } from "@syn/types";
import {
  addDays,
  wallClockToInstant,
  weekKeyOf,
  weekdayIndex,
} from "@syn/utils";

import { resolveTodayFor } from "../day/today";
import { getWeek } from "../day/week-view";
import { findDevicesOffMarker } from "../day/wind-down";
import {
  blockStartPayload,
  devicesOffPayload,
  fixtureStartPayload,
  groupedStartPayload,
  itemStartPayload,
  journalReminderPayload,
  pendingReviewPayload,
  reviewReminderPayload,
  weekBuildPayload,
} from "../notifications/build-payload";
import { effectiveEveningTimes } from "../user/preferences";
import { atMinute, claimDelivery, deliverOnce, dueSnoozed, sendClaimed } from "../notifications/deliver";
import type { ScheduledJob } from "./run-scheduled-jobs";

/**
 * The Phase-1 notification jobs — official spec §8.2, amended by UX v1.1 §9
 * (DYN-20): the four start kinds in one scan, then N4, N5, N6.
 *
 * ONE SCAN, FOUR QUESTIONS, ONE WINDOW. The scheduler runs every fifteen
 * minutes; each job asks what was due in `[now − 15 min, now)` in the PERSON'S
 * OWN zone, which `resolveTodayFor` resolves first — so a zone change that
 * came due overnight is applied before any window is computed, and a reminder
 * lands at 7:00 where the person is rather than 7:00 where the server is.
 *
 * QUIET AFTER DAY COMPLETE (§8.4) is a condition on every query rather than a
 * check afterwards: a closed day cannot produce an N1 or an N4, so there is no
 * path where one is built and then discarded.
 *
 * A PREFERENCE THAT IS OFF PRODUCES NOTHING AT ALL — not a skipped row. A
 * ledger of notifications somebody has switched off would be a log of their
 * preferences, and this table is bookkeeping about messages.
 *
 * THE ONE RLS BYPASS IS NAMED. The user list uses the singleton `db` because
 * a cron request has no session to scope by; everything after runs under
 * `buildServiceRoleAuthContext(userId)`, so every bypass in this codebase is
 * greppable by that one call.
 */

const log = createLogger("jobs/notify");

/** The scheduler's cadence, and therefore the scan window. */
const WINDOW_MS = 15 * 60 * 1000;

const DEFAULT_ENABLED = new Map(
  NOTIFICATION_CATALOGUE.map((entry) => [entry.kind, entry.defaultEnabled]),
);

type UserContext = {
  userId: string;
  rls: ReturnType<typeof createRlsClient>;
  todayKey: string;
  timeZone: string;
  dayCloseTime: string;
  from: Date;
  to: Date;
  now: Date;
};

/** Run `fn` for every account, under its own service-role context. */
async function forEachUser(
  now: Date,
  fn: (context: UserContext) => Promise<number>,
): Promise<number> {
  // System path: no session exists, so there is nothing to scope by.
  const accounts = await db.select({ id: users.id }).from(users);

  let count = 0;

  for (const account of accounts) {
    try {
      const rls = createRlsClient(buildServiceRoleAuthContext(account.id));
      // Applies any deferred zone or close-time change that has come due.
      const today = await resolveTodayFor(rls, account.id, now);
      if (!today) continue;

      count += await fn({
        userId: account.id,
        rls,
        todayKey: today.todayKey,
        timeZone: today.timeZone,
        dayCloseTime: today.dayCloseTime,
        from: new Date(now.getTime() - WINDOW_MS),
        to: now,
        now,
      });
    } catch (error) {
      log.log("user failed", {
        userId: account.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return count;
}

/** Whether a kind is on, falling back to the catalogue's default. */
async function isEnabled(
  context: UserContext,
  kind: NotificationKind,
): Promise<boolean> {
  const rows = await context.rls.execute((tx) =>
    tx
      .select({ enabled: notificationPrefs.enabled })
      .from(notificationPrefs)
      .where(
        and(
          eq(notificationPrefs.userId, context.userId),
          eq(notificationPrefs.kind, kind),
        ),
      )
      .limit(1),
  );

  return rows[0]?.enabled ?? DEFAULT_ENABLED.get(kind) ?? false;
}

/* ------------------------------------------------- N1a · N1b · N1c · N1d ---- */

/**
 * Whether `item_start` is on for a block kind — the per-block row, and only
 * it (UX v1.1 §9.3, R19). The v1.0 row with no block is not consulted: R19
 * made the kind opt-in per block, and a switch nobody can see must not fire.
 */
async function itemStartBlocks(context: UserContext): Promise<Set<BlockKind>> {
  const rows = await context.rls.execute((tx) =>
    tx
      .select({ blockKind: notificationPrefs.blockKind, enabled: notificationPrefs.enabled })
      .from(notificationPrefs)
      .where(
        and(
          eq(notificationPrefs.userId, context.userId),
          eq(notificationPrefs.kind, "item_start"),
          isNotNull(notificationPrefs.blockKind),
        ),
      ),
  );
  return new Set(
    rows.filter((row) => row.enabled && row.blockKind !== null).map((row) => row.blockKind as BlockKind),
  );
}

type StartCandidate = {
  kind: "block_start" | "item_start" | "fixture_start" | "devices_off";
  targetId: string;
  title: string;
  startsAt: Date;
  /** A single item's push keeps v1's actions; nothing else has any. */
  item: { id: string; preflightNote: string | null } | null;
};

/** Block kinds that push at their start (§9.1): never orient or morning — the person just woke. */
const BLOCK_START_KINDS: readonly BlockKind[] = ["prep", "training", "work", "break", "activity", "wind_down"];

/**
 * The four start kinds, one scan, grouped by the minute — UX v1.1 §9.1–§9.2
 * (DYN-20).
 *
 * NOTHING THE PICK DERIVES FIRES BEFORE `confirmed_at`. A block's start and
 * an item's start exist because the day was set, so both scans require
 * `days.confirmed_at`; a pin or a fixture is a time the person set whatever
 * the day's state, so N1c scans without it — "on an unconfirmed day at
 * 9:00, the only push that fires is a fixture's."
 *
 * SAME-MINUTE STARTS COLLAPSE INTO ONE. The work block at 9:00 and the
 * stand-up at 9:00 are one push, *Work · Stand-up · 9:00*; every candidate
 * in the minute claims its own delivery row first, so a later scan cannot
 * resend one of them alone, and one sentence is sent for the rows that won.
 *
 * QUIET AFTER DAY COMPLETE is `closed_at IS NULL` on every query.
 */
export async function notifyStarts(now = new Date()): Promise<number> {
  return forEachUser(now, async (context) => {
    const [blockOn, fixtureOn, devicesOffOn] = await Promise.all([
      isEnabled(context, "block_start"),
      isEnabled(context, "fixture_start"),
      isEnabled(context, "devices_off"),
    ]);
    const itemBlocks = await itemStartBlocks(context);

    const [day] = await context.rls.execute((tx) =>
      tx
        .select({ id: days.id, confirmedAt: days.confirmedAt })
        .from(days)
        .where(
          and(
            eq(days.userId, context.userId),
            eq(days.date, context.todayKey),
            // Quiet after Day Complete (§8.4).
            isNull(days.closedAt),
          ),
        )
        .limit(1),
    );
    if (!day) return 0;
    const set = day.confirmedAt !== null;

    const candidates: StartCandidate[] = [];

    // N1a — the blocks, after the pick.
    if (blockOn && set) {
      const blocks = await context.rls.execute((tx) =>
        tx
          .select({
            id: dayBlocks.id,
            kind: dayBlocks.kind,
            name: dayBlocks.templateNameSnapshot,
            scheduledStart: dayBlocks.scheduledStart,
            state: dayBlocks.state,
          })
          .from(dayBlocks)
          .where(
            and(
              eq(dayBlocks.userId, context.userId),
              eq(dayBlocks.dayId, day.id),
              inArray(dayBlocks.kind, [...BLOCK_START_KINDS]),
              inArray(dayBlocks.state, ["planned", "set"]),
              isNotNull(dayBlocks.scheduledStart),
              gte(dayBlocks.scheduledStart, context.from),
              lt(dayBlocks.scheduledStart, context.to),
            ),
          ),
      );
      for (const block of blocks) {
        if (block.scheduledStart === null) continue;
        candidates.push({
          kind: "block_start",
          targetId: block.id,
          title: block.name?.trim() || BLOCK_KIND_WORDS[block.kind],
          startsAt: block.scheduledStart,
          item: null,
        });
      }
    }

    // The items in the window — N1b, N1c and N1d are all rows of this shape.
    const items = await context.rls.execute((tx) =>
      tx
        .select({
          id: dayItems.id,
          title: dayItems.title,
          scheduledStart: dayItems.scheduledStart,
          notesPreflight: dayItems.notesPreflight,
          pinned: dayItems.pinned,
          origin: dayItems.origin,
          type: dayItems.type,
          templateSlotId: dayItems.templateSlotId,
          blockKind: dayBlocks.kind,
        })
        .from(dayItems)
        .leftJoin(dayBlocks, eq(dayBlocks.id, dayItems.dayBlockId))
        .where(
          and(
            eq(dayItems.userId, context.userId),
            eq(dayItems.dayId, day.id),
            eq(dayItems.timeMode, "fixed_time"),
            eq(dayItems.assignmentState, "assigned"),
            eq(dayItems.completionState, "upcoming"),
            isNotNull(dayItems.scheduledStart),
            gte(dayItems.scheduledStart, context.from),
            lt(dayItems.scheduledStart, context.to),
          ),
        ),
    );

    // The marker is recognised by shape, as the wind-down does (DYN-18).
    const marker = findDevicesOffMarker(
      items.filter((row) => row.blockKind === "wind_down"),
    );

    for (const row of items) {
      if (row.scheduledStart === null) continue;
      if (marker !== null && row.id === marker.id) {
        if (devicesOffOn) {
          candidates.push({
            kind: "devices_off",
            targetId: row.id,
            title: row.title,
            startsAt: row.scheduledStart,
            item: null,
          });
        }
        continue;
      }
      const fixed = row.pinned || row.origin === "fixture";
      if (fixed) {
        if (fixtureOn) {
          candidates.push({
            kind: "fixture_start",
            targetId: row.id,
            title: row.title,
            startsAt: row.scheduledStart,
            item: null,
          });
        }
        continue;
      }
      // N1b: opt-in per block; an item with no block never fires under it.
      if (set && row.blockKind !== null && itemBlocks.has(row.blockKind)) {
        candidates.push({
          kind: "item_start",
          targetId: row.id,
          title: row.title,
          startsAt: row.scheduledStart,
          item: { id: row.id, preflightNote: row.notesPreflight },
        });
      }
    }

    if (candidates.length === 0) return 0;

    // Group by the minute.
    const groups = new Map<number, StartCandidate[]>();
    for (const candidate of candidates) {
      const key = atMinute(candidate.startsAt).getTime();
      const bucket = groups.get(key);
      if (bucket) bucket.push(candidate);
      else groups.set(key, [candidate]);
    }

    /*
     * Always `/today`. This job only ever scans the person's CURRENT day, so
     * the landing is today's canonical URL — `/day/{todayKey}` would just
     * redirect there (SYS-1's rule) and cost a round trip on a phone that
     * has only just woken up.
     */
    const dayPath = "/today";
    let sent = 0;

    for (const group of groups.values()) {
      // Every candidate claims its row; the ones that won and are on time
      // are what the one sentence is about.
      const won: Array<{ rowId: string; candidate: StartCandidate }> = [];
      for (const candidate of group) {
        const claim = await claimDelivery(
          context.rls,
          context.userId,
          {
            kind: candidate.kind,
            targetId: candidate.targetId,
            targetKey: null,
            scheduledFor: candidate.startsAt,
          },
          context.now,
        );
        if (claim === "duplicate" || claim === "skipped") continue;
        won.push({ rowId: claim.id, candidate });
      }
      if (won.length === 0) continue;

      const first = won[0]?.candidate;
      if (first === undefined) continue;
      const payload =
        won.length === 1
          ? payloadFor(first, context.timeZone, dayPath)
          : groupedStartPayload({
              titles: won.map((entry) => entry.candidate.title),
              startsAt: first.startsAt,
              timeZone: context.timeZone,
              url: dayPath,
            });

      await sendClaimed(
        context.rls,
        context.userId,
        won.map((entry) => entry.rowId),
        payload,
        context.now,
      );
      sent += 1;
    }

    return sent;
  });
}

function payloadFor(candidate: StartCandidate, timeZone: string, dayPath: string) {
  switch (candidate.kind) {
    case "block_start":
      return blockStartPayload({ name: candidate.title, startsAt: candidate.startsAt, timeZone, url: dayPath });
    case "fixture_start":
      return fixtureStartPayload({ title: candidate.title, startsAt: candidate.startsAt, timeZone, url: dayPath });
    case "devices_off":
      return devicesOffPayload({ title: candidate.title, startsAt: candidate.startsAt, timeZone, url: dayPath });
    case "item_start": {
      const id = candidate.item?.id ?? candidate.targetId;
      return itemStartPayload({
        title: candidate.title,
        startsAt: candidate.startsAt,
        timeZone,
        preflightNote: candidate.item?.preflightNote ?? null,
        itemUrl: `${dayPath}?sheet=item&id=${id}`,
        startUrl: `${dayPath}?sheet=item&id=${id}&action=start`,
        doneUrl: `${dayPath}?action=done&id=${id}`,
      });
    }
  }
}

/* --------------------------------------------------------------- N4 ---- */

/** At the review-reminder time, only on an open day with something undone. */
export async function notifyReviewReminder(now = new Date()): Promise<number> {
  return forEachUser(now, async (context) => {
    if (!(await isEnabled(context, "review_reminder"))) return 0;

    const [account] = await context.rls.execute((tx) =>
      tx
        .select({ reviewReminderTime: users.reviewReminderTime })
        .from(users)
        .where(eq(users.id, context.userId))
        .limit(1),
    );
    if (!account) return 0;

    const dueAt = wallClockToInstant(
      context.todayKey,
      account.reviewReminderTime,
      context.timeZone,
    );

    const snoozedDue = await dueSnoozed(
      context.rls,
      context.userId,
      "review_reminder",
      context.from,
      context.to,
    );

    const inWindow =
      dueAt.getTime() >= context.from.getTime() &&
      dueAt.getTime() < context.to.getTime();

    if (!inWindow && snoozedDue.length === 0) return 0;

    const [day] = await context.rls.execute((tx) =>
      tx
        .select({ id: days.id })
        .from(days)
        .where(
          and(
            eq(days.userId, context.userId),
            eq(days.date, context.todayKey),
            // The catalogue's own condition: not on a closed day.
            isNull(days.closedAt),
          ),
        )
        .limit(1),
    );
    if (!day) return 0;

    const undone = await context.rls.execute((tx) =>
      tx
        .select({ id: dayItems.id })
        .from(dayItems)
        .where(
          and(
            eq(dayItems.dayId, day.id),
            eq(dayItems.userId, context.userId),
            eq(dayItems.assignmentState, "assigned"),
            ne(dayItems.completionState, "done"),
          ),
        ),
    );

    if (undone.length === 0) return 0;

    const outcome = await deliverOnce(
      context.rls,
      context.userId,
      {
        kind: "review_reminder",
        targetId: day.id,
        targetKey: null,
        scheduledFor: inWindow ? dueAt : context.now,
      },
      reviewReminderPayload({
        undoneCount: undone.length,
        reviewUrl: `/review/day/${context.todayKey}`,
        dateKey: context.todayKey,
      }),
      context.now,
    );

    return outcome === "sent" ? 1 : 0;
  });
}

/* --------------------------------------------------------------- N5 ---- */

/**
 * The morning after an AUTO-close, once.
 *
 * A day somebody closed themselves was closed deliberately; reminding them
 * about it next morning would be the product second-guessing their decision.
 * `close_reason = auto` is the whole condition.
 */
export async function notifyPendingReview(now = new Date()): Promise<number> {
  return forEachUser(now, async (context) => {
    if (!(await isEnabled(context, "pending_review"))) return 0;

    const yesterday = addDays(context.todayKey, -1);

    const [day] = await context.rls.execute((tx) =>
      tx
        .select({ id: days.id, anchorTime: days.anchorTime })
        .from(days)
        .where(
          and(
            eq(days.userId, context.userId),
            eq(days.date, yesterday),
            eq(days.closeReason, "auto"),
            isNull(days.reviewedAt),
          ),
        )
        .limit(1),
    );
    if (!day) return 0;

    // An hour after today's start, so it arrives once the day has begun.
    const anchor = wallClockToInstant(
      context.todayKey,
      day.anchorTime,
      context.timeZone,
    );
    const dueAt = new Date(anchor.getTime() + 60 * 60_000);

    if (
      dueAt.getTime() < context.from.getTime() ||
      dueAt.getTime() >= context.to.getTime()
    ) {
      return 0;
    }

    const pending = await context.rls.execute((tx) =>
      tx
        .select({ id: dayItems.id })
        .from(dayItems)
        .where(
          and(
            eq(dayItems.dayId, day.id),
            eq(dayItems.userId, context.userId),
            eq(dayItems.completionState, "pending_review"),
          ),
        ),
    );

    if (pending.length === 0) return 0;

    const outcome = await deliverOnce(
      context.rls,
      context.userId,
      {
        kind: "pending_review",
        targetId: day.id,
        targetKey: null,
        scheduledFor: dueAt,
      },
      pendingReviewPayload({
        pendingCount: pending.length,
        reviewUrl: `/review/day/${yesterday}`,
      }),
      context.now,
    );

    return outcome === "sent" ? 1 : 0;
  });
}

/* --------------------------------------------------------------- N6 ---- */

/** At the person's chosen day and time, only when next week is unplanned. */
export async function notifyWeekBuild(now = new Date()): Promise<number> {
  return forEachUser(now, async (context) => {
    if (!(await isEnabled(context, "week_build"))) return 0;

    const [account] = await context.rls.execute((tx) =>
      tx
        .select({
          weekday: users.weekBuildReminderWeekday,
          time: users.weekBuildReminderTime,
        })
        .from(users)
        .where(eq(users.id, context.userId))
        .limit(1),
    );
    if (!account) return 0;

    // `weekdayIndex` is Monday = 0, and so is the stored column — one
    // implementation, so the reminder cannot fire a day out.
    if (weekdayIndex(context.todayKey) !== account.weekday) return 0;

    const dueAt = wallClockToInstant(
      context.todayKey,
      account.time,
      context.timeZone,
    );

    if (
      dueAt.getTime() < context.from.getTime() ||
      dueAt.getTime() >= context.to.getTime()
    ) {
      return 0;
    }

    const nextWeekKey = weekKeyOf(addDays(context.todayKey, 7));
    const week = await getWeek(
      context.rls,
      context.userId,
      nextWeekKey,
      context.todayKey,
    );

    // It never arrives when the week is already planned.
    if (week.status !== "unplanned") return 0;

    const outcome = await deliverOnce(
      context.rls,
      context.userId,
      {
        kind: "week_build",
        // A week has no row to point at, so its key is the target.
        targetId: null,
        targetKey: nextWeekKey,
        scheduledFor: dueAt,
      },
      weekBuildPayload({ weekUrl: `/settings/week/${nextWeekKey}` }),
      context.now,
    );

    return outcome === "sent" ? 1 : 0;
  });
}

/* --------------------------------------------------------------- N2 ---- */

/**
 * The journal reminder — UX v1.2 §9 N2, R38 (RUN-6).
 *
 * THREE SWITCHES AND ONE FACT. The journal must be on, the reminder must be
 * on (the catalogue row AND the person's own `journal_reminder_enabled`),
 * and tonight's entry must be empty at send time — an entry with any line
 * in it means the person is already there, and a reminder would be the
 * product talking over them. The time is the person's, or an hour before
 * phone-away by the same derivation the settings screen shows
 * (`effectiveEveningTimes`), so the two never disagree.
 *
 * ONCE PER (PERSON, DAY). The claim is on the day's row and the kind, so a
 * second scan in the same window finds the row and stops. A time that has
 * already passed when the switch is turned on is not back-filled (v1.1
 * §9.2's rule): it fires at the next matching minute, tomorrow.
 */
export async function notifyJournalReminder(now = new Date()): Promise<number> {
  return forEachUser(now, async (context) => {
    if (!(await isEnabled(context, "journal_reminder"))) return 0;

    const [account] = await context.rls.execute((tx) =>
      tx
        .select({
          journalEnabled: users.journalEnabled,
          journalReminderEnabled: users.journalReminderEnabled,
          journalReminderTime: users.journalReminderTime,
          devicesOffTime: users.devicesOffTime,
          lightsOutTime: users.lightsOutTime,
        })
        .from(users)
        .where(eq(users.id, context.userId))
        .limit(1),
    );
    if (!account) return 0;
    if (!account.journalEnabled || !account.journalReminderEnabled) return 0;

    const { journalReminderTimeEffective } = effectiveEveningTimes(account);
    if (journalReminderTimeEffective === null) return 0;

    const dueAt = wallClockToInstant(context.todayKey, journalReminderTimeEffective, context.timeZone);
    if (dueAt.getTime() < context.from.getTime() || dueAt.getTime() >= context.to.getTime()) {
      return 0;
    }

    const [day] = await context.rls.execute((tx) =>
      tx
        .select({ id: days.id })
        .from(days)
        .where(
          and(
            eq(days.userId, context.userId),
            eq(days.date, context.todayKey),
            // Quiet after Day Complete (§8.4).
            isNull(days.closedAt),
          ),
        )
        .limit(1),
    );
    if (!day) return 0;

    // Tonight's entry, if any: a single non-blank line suppresses the push.
    const [entry] = await context.rls.execute((tx) =>
      tx
        .select({ answers: journalEntries.answers })
        .from(journalEntries)
        .where(and(eq(journalEntries.dayId, day.id), eq(journalEntries.userId, context.userId)))
        .limit(1),
    );
    const written = Object.values(entry?.answers ?? {}).some((line) => line.trim().length > 0);
    if (written) return 0;

    const outcome = await deliverOnce(
      context.rls,
      context.userId,
      {
        kind: "journal_reminder",
        targetId: day.id,
        targetKey: null,
        scheduledFor: dueAt,
      },
      journalReminderPayload({
        dueAt,
        timeZone: context.timeZone,
        // The journal's own page (`journalRoute` in `apps/web/lib/routes.ts`).
        journalUrl: `/day/${context.todayKey}/journal`,
      }),
      context.now,
    );

    return outcome === "sent" ? 1 : 0;
  });
}

/** N1a–N1d in one scan (DYN-20); replaces v1.0's `notify-item-start`. */
export const notifyStartsJob: ScheduledJob = {
  name: "notify-starts",
  run: () => notifyStarts(),
};

export const notifyReviewReminderJob: ScheduledJob = {
  name: "notify-review-reminder",
  run: () => notifyReviewReminder(),
};

export const notifyPendingReviewJob: ScheduledJob = {
  name: "notify-pending-review",
  run: () => notifyPendingReview(),
};

export const notifyWeekBuildJob: ScheduledJob = {
  name: "notify-week-build",
  run: () => notifyWeekBuild(),
};

/** N2 — the journal reminder (UX v1.2 §9, RUN-6). */
export const notifyJournalReminderJob: ScheduledJob = {
  name: "notify-journal-reminder",
  run: () => notifyJournalReminder(),
};
