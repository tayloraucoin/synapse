import { and, eq, gte, isNotNull, isNull, lt, ne } from "drizzle-orm";

import { buildServiceRoleAuthContext } from "@syn/auth";
import {
  createRlsClient,
  dayItems,
  days,
  db,
  notificationPrefs,
  users,
} from "@syn/db";
import { NOTIFICATION_CATALOGUE } from "@syn/constants";
import { createLogger } from "@syn/observability";
import type { NotificationKind } from "@syn/types";
import {
  addDays,
  wallClockToInstant,
  weekKeyOf,
  weekdayIndex,
} from "@syn/utils";

import { resolveTodayFor } from "../day/today";
import { getWeek } from "../day/week-view";
import {
  groupedItemStartPayload,
  itemStartPayload,
  pendingReviewPayload,
  reviewReminderPayload,
  weekBuildPayload,
} from "../notifications/build-payload";
import { deliverOnce, dueSnoozed } from "../notifications/deliver";
import type { ScheduledJob } from "./run-scheduled-jobs";

/**
 * The four Phase-1 notification jobs — official spec §8.2.
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

/* --------------------------------------------------------------- N1 ---- */

/**
 * At the minute a fixed-time item starts.
 *
 * ITEMS AT THE SAME MINUTE COLLAPSE INTO ONE. Two notifications a second apart
 * is the phone reporting a schedule rather than telling somebody what is
 * happening; the grouped payload names both and offers no actions, because
 * choosing which one *Start* means is not a choice the product makes.
 */
export async function notifyItemStart(now = new Date()): Promise<number> {
  return forEachUser(now, async (context) => {
    if (!(await isEnabled(context, "item_start"))) return 0;

    const rows = await context.rls.execute((tx) =>
      tx
        .select({
          id: dayItems.id,
          title: dayItems.title,
          scheduledStart: dayItems.scheduledStart,
          notesPreflight: dayItems.notesPreflight,
          multitaskId: dayItems.multitaskId,
        })
        .from(dayItems)
        .innerJoin(days, eq(days.id, dayItems.dayId))
        .where(
          and(
            eq(dayItems.userId, context.userId),
            eq(days.date, context.todayKey),
            // Quiet after Day Complete (§8.4).
            isNull(days.closedAt),
            eq(dayItems.timeMode, "fixed_time"),
            eq(dayItems.assignmentState, "assigned"),
            eq(dayItems.completionState, "upcoming"),
            isNotNull(dayItems.scheduledStart),
            gte(dayItems.scheduledStart, context.from),
            lt(dayItems.scheduledStart, context.to),
          ),
        ),
    );

    if (rows.length === 0) return 0;

    // Group by the minute, and by multitask group inside it.
    const groups = new Map<string, typeof rows>();
    for (const row of rows) {
      if (row.scheduledStart === null) continue;
      const minute = new Date(row.scheduledStart.getTime());
      minute.setSeconds(0, 0);
      const key = `${minute.getTime()}:${row.multitaskId ?? ""}`;
      const bucket = groups.get(key);
      if (bucket) bucket.push(row);
      else groups.set(key, [row]);
    }

    let sent = 0;

    for (const group of groups.values()) {
      const first = group[0];
      if (first?.scheduledStart == null) continue;

      /*
       * Always `/today`. This job only ever scans the person's CURRENT day, so
       * the landing is today's canonical URL — `/day/{todayKey}` would just
       * redirect there (SYS-1's rule) and cost a round trip on a phone that
       * has only just woken up.
       */
      const dayPath = "/today";

      const payload =
        group.length === 1
          ? itemStartPayload({
              title: first.title,
              startsAt: first.scheduledStart,
              timeZone: context.timeZone,
              preflightNote: first.notesPreflight,
              itemUrl: `${dayPath}?sheet=item&id=${first.id}`,
              startUrl: `${dayPath}?sheet=item&id=${first.id}&action=start`,
              doneUrl: `${dayPath}?action=done&id=${first.id}`,
            })
          : groupedItemStartPayload({
              titles: group.map((row) => row.title),
              startsAt: first.scheduledStart,
              timeZone: context.timeZone,
              focusUrl: `${dayPath}?focus=${first.id}`,
            });

      const outcome = await deliverOnce(
        context.rls,
        context.userId,
        {
          kind: "item_start",
          targetId: first.id,
          targetKey: null,
          scheduledFor: first.scheduledStart,
        },
        payload,
        context.now,
      );

      if (outcome === "sent") sent += 1;
    }

    return sent;
  });
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

export const notifyItemStartJob: ScheduledJob = {
  name: "notify-item-start",
  run: () => notifyItemStart(),
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
