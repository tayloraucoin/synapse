import { and, asc, count, desc, eq, isNotNull, isNull } from "drizzle-orm";

import {
  dayItems,
  days,
  shifts,
  userAvatars,
  users,
  type RlsClient,
} from "@syn/db";
import {
  daysBefore,
  isLateOffer,
  resolveDayKey,
  weekdayForDayKey,
} from "@syn/utils";

/**
 * Everything the shell chrome needs, in one query.
 *
 * ONE ROUND TRIP, NOT SIX. The header, the status line, and the Review dot are
 * on every signed-in screen, so they are read together and prefetched on the
 * server — a chrome that fetches per part is a chrome that arrives in pieces.
 *
 * IT IS NOT LOAD-BEARING. Every consumer treats a failure as "no dot, no
 * status line" and renders the page anyway. The chrome telling you nothing is
 * a much smaller failure than the chrome preventing you from reading your day.
 *
 * TWO FIELDS ARE FOR LATER TICKETS. `firstFixedStartToday` and `hasShiftToday`
 * let USE-6 decide the late offer on the client's minute tick without a second
 * query, and `reviewedDayCount` is what times SYS-5's install offer. They are
 * computed here because they are one more column on queries already running.
 */

export type PendingDay = {
  /** `YYYY-MM-DD` in the person's stored zone. */
  date: string;
  /** "Thursday", or null when it is yesterday — the line says "Yesterday". */
  weekday: string | null;
  count: number;
};

export type ShellStatus = {
  /** Which day the person is in right now, per their close time. */
  todayKey: string;
  timezone: string;
  dayCloseTime: string;
  displayName: string;
  /** Bucket-qualified storage path, or null — SET-3's `assetRoute` resolves it. */
  avatarPath: string | null;
  setupIncomplete: boolean;
  setupStep: number | null;
  pendingReviewCount: number;
  /** Most recent first. The status line shows the first. */
  pendingDays: PendingDay[];
  reviewedDayCount: number;
  /**
   * USE-6's late offer. `lateOffer` is the answer now; `firstFixedStartToday`
   * is what lets the client re-derive it on the minute tick, so a line that
   * becomes true at 10:29 does not wait for a refetch.
   */
  firstFixedStartToday: Date | null;
  hasShiftToday: boolean;
  lateOffer: boolean;
};

/** How many pending days the line could ever need. */
const PENDING_DAY_LIMIT = 7;

export async function readShellStatus(
  rls: RlsClient,
  userId: string,
  now: Date = new Date(),
): Promise<ShellStatus | null> {
  return rls.execute(async (tx) => {
    const [account] = await tx
      .select({
        displayName: users.displayName,
        email: users.email,
        timezone: users.timezone,
        dayCloseTime: users.dayCloseTime,
        firstRunStep: users.firstRunStep,
        firstRunCompletedAt: users.firstRunCompletedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!account) return null;

    const todayKey = resolveDayKey(
      now,
      account.timezone,
      account.dayCloseTime,
    );

    const [avatar] = await tx
      .select({ storagePath: userAvatars.storagePath })
      .from(userAvatars)
      .where(eq(userAvatars.userId, userId))
      .limit(1);

    /*
     * A day is waiting to be reviewed when it has been closed but not
     * reviewed, and still carries items in `pending_review`. Grouping in SQL
     * rather than counting rows in JS keeps this one round trip whatever the
     * history looks like.
     */
    const pendingRows = await tx
      .select({ date: days.date, count: count(dayItems.id) })
      .from(days)
      .innerJoin(dayItems, eq(dayItems.dayId, days.id))
      .where(
        and(
          eq(days.userId, userId),
          isNotNull(days.closedAt),
          isNull(days.reviewedAt),
          eq(dayItems.completionState, "pending_review"),
        ),
      )
      .groupBy(days.date)
      .orderBy(desc(days.date))
      .limit(PENDING_DAY_LIMIT);

    const pendingDays: PendingDay[] = pendingRows.map((row) => {
      const date = String(row.date);
      return {
        date,
        // Yesterday is named "Yesterday" by the copy builder, so it gets null.
        weekday: daysBefore(date, todayKey) === 1 ? null : weekdayForDayKey(date),
        count: Number(row.count),
      };
    });

    const [reviewed] = await tx
      .select({ value: count() })
      .from(days)
      .where(and(eq(days.userId, userId), isNotNull(days.reviewedAt)));

    const [today] = await tx
      .select({ id: days.id, closedAt: days.closedAt })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, todayKey)))
      .limit(1);

    let firstFixedStartToday: Date | null = null;
    let hasShiftToday = false;
    let todayClosedAt: Date | null = null;

    if (today) {
      const [firstFixed] = await tx
        .select({ scheduledStart: dayItems.scheduledStart })
        .from(dayItems)
        .where(
          and(
            eq(dayItems.dayId, today.id),
            eq(dayItems.timeMode, "fixed_time"),
            eq(dayItems.assignmentState, "assigned"),
            // Untouched only: a first item already done is not evidence that
            // anyone is running late (USE-6).
            eq(dayItems.completionState, "upcoming"),
            isNotNull(dayItems.scheduledStart),
          ),
        )
        .orderBy(asc(dayItems.scheduledStart))
        .limit(1);

      firstFixedStartToday = firstFixed?.scheduledStart ?? null;

      const [shift] = await tx
        .select({ id: shifts.id })
        .from(shifts)
        .where(eq(shifts.dayId, today.id))
        .limit(1);

      hasShiftToday = shift !== undefined;
      todayClosedAt = today.closedAt;
    }

    return {
      todayKey,
      timezone: account.timezone,
      dayCloseTime: account.dayCloseTime,
      // The header falls back to the address when no name is set; `Avatar`
      // derives initials from whichever it gets.
      displayName: account.displayName ?? account.email ?? "",
      avatarPath: avatar?.storagePath ?? null,
      setupIncomplete: account.firstRunCompletedAt === null,
      setupStep: account.firstRunStep,
      pendingReviewCount: pendingDays.reduce((sum, day) => sum + day.count, 0),
      pendingDays,
      reviewedDayCount: Number(reviewed?.value ?? 0),
      firstFixedStartToday,
      hasShiftToday,
      lateOffer: isLateOffer({
        isToday: true,
        closedAt: todayClosedAt,
        hasShiftToday,
        firstFixedStartToday,
        now,
      }),
    };
  });
}
