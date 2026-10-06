import { eq } from "drizzle-orm";

import { users, type RlsClient } from "@syn/db";
import { resolveDayKey } from "@syn/utils";

import { afterSettingsApplied } from "../user/apply-pending-settings";

/**
 * Which day it is for this person, right now — after applying any deferred
 * settings change that has come due.
 *
 * THE PENDING PAIR IS APPLIED ON READ (Epic 1's SET-1 decision). A time-zone
 * switch and a day-close change take effect "from tomorrow", so they sit in
 * `pending_*` with the date they start. Applying them here means the switch
 * happens the first time anything asks what day it is — an app open, or the
 * scheduler's per-user pass — rather than needing a job of its own.
 *
 * THE COMPARISON USES THE OLD VALUES, deliberately: "has tomorrow arrived" has
 * to be answered in the zone the person is still in, or a westward move would
 * apply its own switch a day early.
 *
 * PROMOTION IS HALF THE JOB (SYS-2). Changing `users.timezone` without moving
 * the plan leaves tomorrow at yesterday's instants, so `afterSettingsApplied`
 * re-lays every planned day after today at the same wall clock. It runs AFTER
 * this transaction commits, not inside it: `rls.execute` opens a real
 * transaction on the pool, and a nested call takes a second connection that
 * cannot see uncommitted work.
 */

export type TodayContext = {
  todayKey: string;
  timeZone: string;
  dayCloseTime: string;
};

export async function resolveTodayFor(
  rls: RlsClient,
  userId: string,
  now: Date = new Date(),
): Promise<TodayContext | null> {
  const resolved = await promote(rls, userId, now);
  if (resolved === null) return null;

  if (resolved.applied !== null) {
    await afterSettingsApplied(rls, userId, {
      todayKey: resolved.context.todayKey,
      ...resolved.applied,
    });
  }

  return resolved.context;
}

/** The read, the promotion, and the recomputed key — one transaction. */
async function promote(
  rls: RlsClient,
  userId: string,
  now: Date,
): Promise<{
  context: TodayContext;
  applied: { timezone?: string; dayCloseTime?: string } | null;
} | null> {
  return rls.execute(async (tx) => {
    const [row] = await tx
      .select({
        timezone: users.timezone,
        dayCloseTime: users.dayCloseTime,
        pendingTimezone: users.pendingTimezone,
        pendingTimezoneFrom: users.pendingTimezoneFrom,
        pendingDayCloseTime: users.pendingDayCloseTime,
        pendingDayCloseTimeFrom: users.pendingDayCloseTimeFrom,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!row) return null;

    // Answered in the zone and close time the person is still living in.
    const currentKey = resolveDayKey(now, row.timezone, row.dayCloseTime);

    let timeZone = row.timezone;
    let dayCloseTime = row.dayCloseTime;
    const patch: Record<string, unknown> = {};
    // What the plan pass has to react to — only values that actually moved.
    const applied: { timezone?: string; dayCloseTime?: string } = {};

    if (
      row.pendingTimezone !== null &&
      row.pendingTimezoneFrom !== null &&
      String(row.pendingTimezoneFrom) <= currentKey
    ) {
      timeZone = row.pendingTimezone;
      patch.timezone = row.pendingTimezone;
      patch.pendingTimezone = null;
      patch.pendingTimezoneFrom = null;
      if (row.pendingTimezone !== row.timezone) {
        applied.timezone = row.pendingTimezone;
      }
    }

    if (
      row.pendingDayCloseTime !== null &&
      row.pendingDayCloseTimeFrom !== null &&
      String(row.pendingDayCloseTimeFrom) <= currentKey
    ) {
      dayCloseTime = row.pendingDayCloseTime;
      patch.dayCloseTime = row.pendingDayCloseTime;
      patch.pendingDayCloseTime = null;
      patch.pendingDayCloseTimeFrom = null;
      if (row.pendingDayCloseTime !== row.dayCloseTime) {
        applied.dayCloseTime = row.pendingDayCloseTime;
      }
    }

    if (Object.keys(patch).length > 0) {
      await tx
        .update(users)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }

    /*
     * Recomputed with whatever is now in force — BUT NEVER BACKWARDS.
     *
     * A later close time is the case that needs the guard. Moving 03:00 to
     * 05:00 from tomorrow, a person opening the app at 04:30 tomorrow is in
     * tomorrow under the old rule — which is what makes the change due — and
     * recomputing with 05:00 puts them back in the day before. The day they
     * have been living since 03:00 would vanish, taking every item they had
     * already ticked onto a day that is no longer today.
     *
     * The new close time governs when the NEXT day starts, not whether the
     * current one has happened. Forward is left alone: a day arriving early is
     * a day that has genuinely started. Found by probing `resolveDayKey`
     * across the boundary, not by reading it (SYS-2 AC 7).
     */
    const recomputed = resolveDayKey(now, timeZone, dayCloseTime);

    return {
      context: {
        todayKey: recomputed < currentKey ? currentKey : recomputed,
        timeZone,
        dayCloseTime,
      },
      applied: Object.keys(applied).length > 0 ? applied : null,
    };
  });
}
