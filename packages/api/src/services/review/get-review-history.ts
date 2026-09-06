import { and, asc, desc, eq, inArray, lt } from "drizzle-orm";

import { dayItems, days, type RlsClient } from "@syn/db";
import { computeAdherence, weekDates, weekKeyOf } from "@syn/utils";

import { readMisses, toScoredItems } from "./to-scored";

/**
 * HS-01's list — weeks, newest first, each with its days.
 *
 * PAGINATED BY WEEK, NOT BY DAY. History is read as "what did that week look
 * like", and a page boundary in the middle of a week would split a strip
 * across two screens. Eight weeks is two months, which is as far back as
 * anyone scrolls in one go.
 *
 * A DAY'S STATUS IS FOUR WORDS AND ONE OF THEM IS NOT A FAILURE.
 * `nothing-assigned` is a day nobody planned — not a day that went badly — and
 * it is distinguished from `not-reviewed` so the history never implies someone
 * skipped a review they were never owed.
 */
export type HistoryDay = {
  date: string;
  status: "reviewed" | "pending" | "not-reviewed" | "nothing-assigned";
  percent: number | null;
};

export type HistoryWeek = {
  weekKey: string;
  days: HistoryDay[];
  /** Over the week's reviewed days, by the same union rule as REV-4. */
  percent: number | null;
};

const DEFAULT_WEEKS = 8;

export async function getReviewHistory(
  rls: RlsClient,
  userId: string,
  input: { before?: string; limit?: number },
): Promise<{ weeks: HistoryWeek[]; nextBefore: string | null }> {
  const limit = Math.min(Math.max(input.limit ?? DEFAULT_WEEKS, 1), 26);

  const dayRows = await rls.execute((tx) =>
    tx
      .select({
        id: days.id,
        date: days.date,
        templateId: days.templateId,
        closedAt: days.closedAt,
        reviewedAt: days.reviewedAt,
      })
      .from(days)
      .where(
        and(
          eq(days.userId, userId),
          ...(input.before === undefined ? [] : [lt(days.date, input.before)]),
        ),
      )
      // Newest first, then enough rows to fill `limit` whole weeks.
      .orderBy(desc(days.date))
      .limit(limit * 7 + 7),
  );

  if (dayRows.length === 0) return { weeks: [], nextBefore: null };

  // Group into weeks, newest first, and keep only whole ones up to the limit.
  const byWeek = new Map<string, typeof dayRows>();
  for (const row of dayRows) {
    const key = weekKeyOf(String(row.date));
    const bucket = byWeek.get(key);
    if (bucket) bucket.push(row);
    else byWeek.set(key, [row]);
  }

  const weekKeys = [...byWeek.keys()].sort().reverse().slice(0, limit);

  const allIds = weekKeys.flatMap((key) =>
    (byWeek.get(key) ?? []).map((row) => row.id),
  );

  const items =
    allIds.length === 0
      ? []
      : await rls.execute((tx) =>
          tx
            .select({
              id: dayItems.id,
              dayId: dayItems.dayId,
              priority: dayItems.priority,
              timeMode: dayItems.timeMode,
              scheduledStart: dayItems.scheduledStart,
              scheduledEnd: dayItems.scheduledEnd,
              originalScheduledStart: dayItems.originalScheduledStart,
              doneAt: dayItems.doneAt,
              deferredAt: dayItems.deferredAt,
              assignmentState: dayItems.assignmentState,
              completionState: dayItems.completionState,
            })
            .from(dayItems)
            .where(
              and(
                eq(dayItems.userId, userId),
                inArray(dayItems.dayId, allIds),
              ),
            )
            .orderBy(asc(dayItems.id)),
        );

  const missRows = await readMisses(
    rls,
    userId,
    items.map((item) => item.id),
  );
  const scored = await toScoredItems(rls, userId, items, missRows);
  const scoredById = new Map(scored.map((item) => [item.id, item]));

  const itemsByDay = new Map<string, typeof items>();
  for (const item of items) {
    const bucket = itemsByDay.get(item.dayId);
    if (bucket) bucket.push(item);
    else itemsByDay.set(item.dayId, [item]);
  }

  const weeks: HistoryWeek[] = weekKeys.map((weekKey) => {
    const rowsThisWeek = byWeek.get(weekKey) ?? [];
    const rowByDate = new Map(
      rowsThisWeek.map((row) => [String(row.date), row]),
    );

    const dayViews: HistoryDay[] = weekDates(weekKey).map((date) => {
      const row = rowByDate.get(date);

      if (!row || (row.templateId === null && !itemsByDay.has(row.id))) {
        return { date, status: "nothing-assigned", percent: null };
      }

      const dayItemsHere = itemsByDay.get(row.id) ?? [];
      const dayScored = dayItemsHere
        .map((item) => scoredById.get(item.id))
        .filter((item): item is NonNullable<typeof item> => item !== undefined);

      if (row.reviewedAt !== null) {
        return {
          date,
          status: "reviewed",
          percent: computeAdherence(dayScored).percent,
        };
      }

      return {
        date,
        status: row.closedAt !== null ? "pending" : "not-reviewed",
        percent: null,
      };
    });

    // The week's own number, by the same union rule REV-4 uses.
    const reviewedIds = new Set(
      rowsThisWeek.filter((row) => row.reviewedAt !== null).map((row) => row.id),
    );
    const weekScored = items
      .filter((item) => reviewedIds.has(item.dayId))
      .map((item) => scoredById.get(item.id))
      .filter((item): item is NonNullable<typeof item> => item !== undefined);

    return {
      weekKey,
      days: dayViews,
      percent:
        reviewedIds.size === 0 ? null : computeAdherence(weekScored).percent,
    };
  });

  // The cursor is the Monday of the oldest week returned, so the next page
  // starts strictly before it and cannot repeat a week.
  const oldest = weekKeys[weekKeys.length - 1];
  const nextBefore =
    oldest === undefined || weekKeys.length < limit
      ? null
      : (weekDates(oldest)[0] ?? null);

  return { weeks, nextBefore };
}
