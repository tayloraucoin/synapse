import { and, count, desc, eq, inArray, isNotNull, isNull, lt } from "drizzle-orm";

import { dayItems, days, type RlsClient } from "@syn/db";

/**
 * The days that owe a decision — RV-00's middle region.
 *
 * A DAY IS PENDING WHEN IT IS CLOSED, NOT REVIEWED, AND HAS AN UNDECIDED
 * ITEM. All three: a closed day with everything decided owes nothing, and an
 * open day owes nothing yet — the day is still happening.
 *
 * TODAY IS NOT LISTED HERE even if it has somehow closed early; RV-00's Today
 * region speaks for today, and a date appearing in two regions would read as
 * two things to do.
 *
 * IT COUNTS THE SAME FIELD THE SHELL DOT READS, so the tab's list and the
 * chrome's dot can never disagree about whether anything is owed.
 */
export type PendingDay = { date: string; count: number };

export async function pendingDays(
  rls: RlsClient,
  userId: string,
  todayKey: string,
  limit = 14,
): Promise<PendingDay[]> {
  return rls.execute(async (tx) => {
    const closedUnreviewed = await tx
      .select({ id: days.id, date: days.date })
      .from(days)
      .where(
        and(
          eq(days.userId, userId),
          isNotNull(days.closedAt),
          isNull(days.reviewedAt),
          lt(days.date, todayKey),
        ),
      )
      .orderBy(desc(days.date))
      .limit(limit);

    if (closedUnreviewed.length === 0) return [];

    const counts = await tx
      .select({ dayId: dayItems.dayId, value: count() })
      .from(dayItems)
      .where(
        and(
          eq(dayItems.userId, userId),
          inArray(
            dayItems.dayId,
            closedUnreviewed.map((row) => row.id),
          ),
          eq(dayItems.assignmentState, "assigned"),
          inArray(dayItems.completionState, [
            "pending_review",
            "upcoming",
            "active",
          ]),
        ),
      )
      .groupBy(dayItems.dayId);

    const byDay = new Map(counts.map((row) => [row.dayId, Number(row.value)]));

    return closedUnreviewed
      .map((row) => ({
        date: String(row.date),
        count: byDay.get(row.id) ?? 0,
      }))
      .filter((row) => row.count > 0);
  });
}
