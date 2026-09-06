import { and, asc, eq, inArray } from "drizzle-orm";

import {
  categories,
  dayItems,
  days,
  habits,
  shifts,
  templates,
  type RlsClient,
} from "@syn/db";
import type { CategoryKey } from "@syn/types";
import {
  computeAdherence,
  stripStateFor,
  weekDates,
  type AdherenceResult,
  type StripSquare,
} from "@syn/utils";

import { readMisses, toScoredItems } from "./to-scored";

/**
 * The week's number and its parts — REV-4's read, and RV-00's *This week*.
 *
 * THE WEEK IS THE UNION OF ITS REVIEWED DAYS' ITEMS, NEVER AN AVERAGE OF DAY
 * PERCENTS. A day with two items and a day with twenty are not equal halves of
 * a week, and averaging their percents would let one quiet Sunday outweigh
 * four full weekdays. The same `computeAdherence` runs over every item at
 * once, which is also why the week's sentence has the same shape as a day's.
 *
 * ONLY REVIEWED DAYS COUNT. An unreviewed day has undecided items, and
 * counting them would mean the week's number moved every time someone opened a
 * review — the count of what is missing is reported instead, so the number can
 * say what it does not yet include.
 */
export type HabitStripView = {
  habitId: string;
  title: string;
  days: StripSquare[];
  credit: number;
  counted: number;
};

export type TemplateUsage = { id: string; name: string; days: number };

export type CategorySegment = {
  key: CategoryKey;
  name: string;
  minutes: number;
};

export type ReviewWeekView = {
  weekKey: string;
  planned: number;
  reviewed: number;
  /** True while the week has not finished — the number reads *so far*. */
  open: boolean;
  result: AdherenceResult | null;
  unreviewedCount: number;
  templates: TemplateUsage[];
  habits: HabitStripView[];
  deepWork: { done: number; minutes: number };
  tasks: { done: number; carried: number };
  shifts: { count: number; totalMin: number; mostCommonReason: string | null };
  categories: CategorySegment[];
};

export async function getReviewWeek(
  rls: RlsClient,
  userId: string,
  weekKey: string,
  todayKey: string,
): Promise<ReviewWeekView> {
  const dates = weekDates(weekKey);

  const raw = await rls.execute(async (tx) => {
    const dayRows = await tx
      .select({
        id: days.id,
        date: days.date,
        templateId: days.templateId,
        templateName: templates.name,
        reviewedAt: days.reviewedAt,
      })
      .from(days)
      .leftJoin(templates, eq(templates.id, days.templateId))
      .where(and(eq(days.userId, userId), inArray(days.date, dates)))
      .orderBy(asc(days.date));

    const dayIds = dayRows.map((row) => row.id);

    const items =
      dayIds.length === 0
        ? []
        : await tx
            .select({
              id: dayItems.id,
              dayId: dayItems.dayId,
              habitId: dayItems.habitId,
              title: dayItems.title,
              type: dayItems.type,
              priority: dayItems.priority,
              durationMin: dayItems.durationMin,
              timeMode: dayItems.timeMode,
              scheduledStart: dayItems.scheduledStart,
              scheduledEnd: dayItems.scheduledEnd,
              originalScheduledStart: dayItems.originalScheduledStart,
              doneAt: dayItems.doneAt,
              deferredAt: dayItems.deferredAt,
              assignmentState: dayItems.assignmentState,
              completionState: dayItems.completionState,
              categoryName: categories.name,
              categoryKey: categories.colorKey,
            })
            .from(dayItems)
            .leftJoin(habits, eq(habits.id, dayItems.habitId))
            .leftJoin(categories, eq(categories.id, habits.categoryId))
            .where(
              and(
                eq(dayItems.userId, userId),
                inArray(dayItems.dayId, dayIds),
              ),
            );

    const shiftRows =
      dayIds.length === 0
        ? []
        : await tx
            .select({
              deltaMin: shifts.deltaMin,
              reasonKey: shifts.reasonKey,
              reasonText: shifts.reasonText,
              at: shifts.at,
            })
            .from(shifts)
            .where(
              and(eq(shifts.userId, userId), inArray(shifts.dayId, dayIds)),
            )
            .orderBy(asc(shifts.at));

    return { dayRows, items, shiftRows };
  });

  const dateByDayId = new Map(
    raw.dayRows.map((row) => [row.id, String(row.date)]),
  );
  const reviewedDayIds = new Set(
    raw.dayRows.filter((row) => row.reviewedAt !== null).map((row) => row.id),
  );

  // The number runs over the reviewed days' items only.
  const scoredRows = raw.items.filter((item) =>
    reviewedDayIds.has(item.dayId),
  );
  const missRows = await readMisses(
    rls,
    userId,
    scoredRows.map((item) => item.id),
  );
  const scored = await toScoredItems(rls, userId, scoredRows, missRows);
  const result = reviewedDayIds.size === 0 ? null : computeAdherence(scored);

  /*
   * The strips run over EVERY day, reviewed or not, because a strip is a
   * picture of the week rather than a component of the number — an unreviewed
   * day shows `pending`, which is the honest square for it.
   */
  const allMisses = await readMisses(
    rls,
    userId,
    raw.items.map((item) => item.id),
  );
  const allScored = await toScoredItems(rls, userId, raw.items, allMisses);
  const allVerdicts = computeAdherence(allScored).perItem;

  const habitStrips = new Map<string, HabitStripView>();

  for (const item of raw.items) {
    if (item.habitId === null) continue;

    const dateKey = dateByDayId.get(item.dayId);
    if (dateKey === undefined) continue;
    const index = dates.indexOf(dateKey);
    if (index < 0) continue;

    let strip = habitStrips.get(item.habitId);
    if (strip === undefined) {
      strip = {
        habitId: item.habitId,
        title: item.title,
        // A day with no item for this habit is `not-assigned`, which is also
        // what an unplanned day gets — the same fact from the strip's view.
        days: Array.from({ length: 7 }, () => "not-assigned" as StripSquare),
        credit: 0,
        counted: 0,
      };
      habitStrips.set(item.habitId, strip);
    }

    const verdict = allVerdicts[item.id]?.verdict ?? null;
    strip.days[index] = stripStateFor(verdict);

    if (reviewedDayIds.has(item.dayId)) {
      const credit = allVerdicts[item.id]?.credit ?? null;
      if (credit !== null) {
        strip.credit += credit;
        strip.counted += 1;
      }
    }
  }

  const templateUsage = new Map<string, TemplateUsage>();
  for (const row of raw.dayRows) {
    if (row.templateId === null) continue;
    const existing = templateUsage.get(row.templateId);
    if (existing) existing.days += 1;
    else
      templateUsage.set(row.templateId, {
        id: row.templateId,
        name: row.templateName ?? "",
        days: 1,
      });
  }

  const categoryMinutes = new Map<string, CategorySegment>();
  for (const item of raw.items) {
    if (item.completionState !== "done") continue;
    if (item.categoryKey === null || item.categoryName === null) continue;
    const existing = categoryMinutes.get(item.categoryKey);
    const minutes = item.durationMin ?? 0;
    if (existing) existing.minutes += minutes;
    else
      categoryMinutes.set(item.categoryKey, {
        key: item.categoryKey,
        name: item.categoryName,
        minutes,
      });
  }

  const doneDeepWork = raw.items.filter(
    (item) => item.type === "deep_work" && item.completionState === "done",
  );

  return {
    weekKey,
    planned: raw.dayRows.filter((row) => row.templateId !== null).length,
    reviewed: reviewedDayIds.size,
    // The week is open while today is still inside it.
    open: dates.includes(todayKey) || todayKey < (dates[6] ?? ""),
    result,
    unreviewedCount: raw.dayRows.length - reviewedDayIds.size,
    templates: [...templateUsage.values()].sort((a, b) => b.days - a.days),
    // Sorted by how the week went, worst first — the point of the strip is to
    // find what slipped, not to rank what did not.
    habits: [...habitStrips.values()].sort(
      (a, b) => rate(a) - rate(b) || a.title.localeCompare(b.title),
    ),
    deepWork: {
      done: doneDeepWork.length,
      minutes: doneDeepWork.reduce(
        (total, item) => total + (item.durationMin ?? 0),
        0,
      ),
    },
    tasks: {
      done: raw.items.filter(
        (item) =>
          item.type === "task_appointment" && item.completionState === "done",
      ).length,
      carried: raw.items.filter((item) => item.completionState === "carried")
        .length,
    },
    shifts: {
      count: raw.shiftRows.length,
      totalMin: raw.shiftRows.reduce((total, row) => total + row.deltaMin, 0),
      mostCommonReason: mostCommonReason(raw.shiftRows),
    },
    categories: [...categoryMinutes.values()].sort(
      (a, b) => b.minutes - a.minutes,
    ),
  };
}


/** A strip with nothing counted sorts last, not first — it did not slip. */
function rate(strip: HabitStripView): number {
  return strip.counted === 0
    ? Number.POSITIVE_INFINITY
    : strip.credit / strip.counted;
}

/** Ties go to the earliest shift, which the rows are already ordered by. */
function mostCommonReason(
  rows: readonly { reasonKey: string | null; reasonText: string | null }[],
): string | null {
  const counts = new Map<string, number>();
  const firstSeen: string[] = [];

  for (const row of rows) {
    const key = row.reasonKey ?? row.reasonText;
    if (key === null) continue;
    if (!counts.has(key)) firstSeen.push(key);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  let best: string | null = null;
  let bestCount = 0;
  for (const key of firstSeen) {
    const count = counts.get(key) ?? 0;
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best;
}
