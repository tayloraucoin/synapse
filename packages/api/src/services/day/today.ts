import { eq } from "drizzle-orm";

import { users, type RlsClient } from "@syn/db";
import { resolveDayKey } from "@syn/utils";

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

    if (
      row.pendingTimezone !== null &&
      row.pendingTimezoneFrom !== null &&
      String(row.pendingTimezoneFrom) <= currentKey
    ) {
      timeZone = row.pendingTimezone;
      patch.timezone = row.pendingTimezone;
      patch.pendingTimezone = null;
      patch.pendingTimezoneFrom = null;
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
    }

    if (Object.keys(patch).length > 0) {
      await tx
        .update(users)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }

    return {
      // Recomputed with whatever is now in force.
      todayKey: resolveDayKey(now, timeZone, dayCloseTime),
      timeZone,
      dayCloseTime,
    };
  });
}
