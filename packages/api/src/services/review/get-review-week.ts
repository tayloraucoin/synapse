import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import {
  categories,
  dayBlocks,
  dayItems,
  days,
  habits,
  journalEntries,
  reasons,
  shifts,
  templates,
  type RlsClient,
} from "@syn/db";
import type { BlockKind, CategoryKey, IconValue, StripWeek } from "@syn/types";
import {
  computeAdherence,
  stripStateFor,
  emptyStripWeek,
  toStripWeek,
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
  /** From the ITEM's snapshot, so an archived habit still draws its strip. */
  icon: IconValue;
  days: StripWeek;
  credit: number;
  counted: number;
};

/** WR-01's *Deep work* rows — one per deep-work habit that ran this week. */
export type DeepWorkRow = {
  habitId: string | null;
  title: string;
  icon: IconValue;
  sessions: number;
  minutes: number;
  done: number;
  counted: number;
};

export type TemplateUsage = { id: string; name: string; days: number };

/** WR-03's rows — tasks that went into next week. */
export type CarriedItem = {
  id: string;
  title: string;
  icon: IconValue;
  /** The earliest day this task appears on, walking the carry chain back. */
  firstAssignedDate: string;
  carriedCount: number;
};

/** WR-04's rows — one per shift this week. */
export type WeekShiftRow = {
  id: string;
  date: string;
  at: Date;
  deltaMin: number;
  reasonLabel: string | null;
  cutCount: number;
};

export type CategorySegment = {
  key: CategoryKey;
  name: string;
  minutes: number;
};

export type ReviewWeekView = {
  weekKey: string;
  /** The person's zone — every clock in the week's rows is formatted in it. */
  timezone: string;
  planned: number;
  reviewed: number;
  /** True while the week has not finished — the number reads *so far*. */
  open: boolean;
  result: AdherenceResult | null;
  unreviewedCount: number;
  templates: TemplateUsage[];
  habits: HabitStripView[];
  deepWork: { done: number; minutes: number };
  deepWorkRows: DeepWorkRow[];
  tasks: { done: number; carried: number };
  shifts: { count: number; totalMin: number; mostCommonReason: string | null };
  shiftRows: WeekShiftRow[];
  carriedItems: CarriedItem[];
  categories: CategorySegment[];

  /* ---- UX v1.1 §8.2 (DYN-19) ---- */
  /** The counts line, one entry per pooled thing: *Morning A 2 of 2*, *Menu 3*, *2 not confirmed*. */
  counts: Array<{ label: string; used: number; target: number | null }>;
  /** Time by block — done items' lengths per kind, in block order. */
  blockMinutes: Array<{ kind: BlockKind; minutes: number }>;
  /** Reflections — the week's two journal lines per day, verbatim, dated. */
  reflections: Array<{ date: string; gratitude: string | null; lookingForward: string | null }>;
  notConfirmedCount: number;
};

const BLOCK_ORDER: readonly BlockKind[] = [
  "orient",
  "morning",
  "training",
  "prep",
  "work",
  "break",
  "activity",
  "wind_down",
];

export async function getReviewWeek(
  rls: RlsClient,
  userId: string,
  weekKey: string,
  todayKey: string,
  timezone = "UTC",
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
              icon: dayItems.icon,
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
              carriedFromItemId: dayItems.carriedFromItemId,
              dayBlockId: dayItems.dayBlockId,
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
              id: shifts.id,
              dayId: shifts.dayId,
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

    // The reason words, for WR-04's rows. An archived reason keeps its label.
    const reasonLabels = await tx
      .select({ key: reasons.key, label: reasons.label })
      .from(reasons)
      .where(eq(reasons.userId, userId));

    /*
     * UX v1.1 §8.2 (DYN-19): the day's blocks (time by block, the counts line),
     * the focus per day (the counts line), and the journal (Reflections).
     */
    const blockRows =
      dayIds.length === 0
        ? []
        : await tx
            .select({
              id: dayBlocks.id,
              dayId: dayBlocks.dayId,
              kind: dayBlocks.kind,
              state: dayBlocks.state,
              templateId: dayBlocks.templateId,
              templateNameSnapshot: dayBlocks.templateNameSnapshot,
            })
            .from(dayBlocks)
            .where(and(eq(dayBlocks.userId, userId), inArray(dayBlocks.dayId, dayIds)));

    const dayExtras =
      dayIds.length === 0
        ? []
        : await tx
            .select({
              id: days.id,
              shape: days.shape,
              confirmedAt: days.confirmedAt,
              focusTitle: habits.title,
            })
            .from(days)
            .leftJoin(habits, eq(habits.id, days.workFocusHabitId))
            .where(inArray(days.id, dayIds));

    const rotation = await tx
      .select({
        id: habits.id,
        title: habits.title,
        type: habits.type,
        weeklyTarget: habits.weeklyTarget,
      })
      .from(habits)
      .where(
        and(
          eq(habits.userId, userId),
          inArray(habits.type, ["workout", "deep_work"]),
          isNull(habits.archivedAt),
        ),
      );

    const morningTemplates = await tx
      .select({ id: templates.id, name: templates.name, weeklyTarget: templates.weeklyTarget })
      .from(templates)
      .where(and(eq(templates.userId, userId), eq(templates.kind, "morning"), isNull(templates.archivedAt)));

    const journalRows =
      dayIds.length === 0
        ? []
        : await tx
            .select({ dayId: journalEntries.dayId, answers: journalEntries.answers })
            .from(journalEntries)
            .where(and(eq(journalEntries.userId, userId), inArray(journalEntries.dayId, dayIds)));

    return { dayRows, items, shiftRows, reasonLabels, blockRows, dayExtras, rotation, morningTemplates, journalRows };
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

  /*
   * Built with a MUTABLE day array and narrowed to the seven-day tuple at the
   * boundary — the squares are filled in as the items are walked, and a
   * readonly tuple cannot be filled in. `toStripWeek` is where the invariant
   * is asserted, once, rather than trusted at every write.
   */
  const habitStrips = new Map<
    string,
    Omit<HabitStripView, "days"> & { days: StripSquare[] }
  >();

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
        icon: item.icon,
        // A day with no item for this habit is `not-assigned`, which is also
        // what an unplanned day gets — the same fact from the strip's view.
        days: [...emptyStripWeek()],
        credit: 0,
        counted: 0,
      };
      habitStrips.set(item.habitId, strip);
    }

    const verdict = allVerdicts[item.id]?.verdict ?? null;
    strip.days[index] = stripStateFor(verdict, item.completionState);

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

  /*
   * UX v1.1 §8.2 (DYN-19). TIME BY BLOCK: done items' lengths per block kind —
   * the same source as time by category, so the two bars agree. THE COUNTS
   * LINE: each pooled thing with its used-of-target — a morning variant by
   * its confirmed blocks, *Menu* by pooled mornings, a focus by the days
   * carrying it, a workout by its done items, *Unstructured* by shape, and
   * *not confirmed* by rows. Information, never a score. REFLECTIONS: the two
   * journal lines per day, verbatim, in date order, no synthesis.
   */
  const blockKindById = new Map(raw.blockRows.map((row) => [row.id, row.kind]));
  const minutesByKind = new Map<BlockKind, number>();
  for (const item of raw.items) {
    if (item.completionState !== "done" || item.dayBlockId === null) continue;
    const kind = blockKindById.get(item.dayBlockId);
    if (kind === undefined) continue;
    minutesByKind.set(kind, (minutesByKind.get(kind) ?? 0) + (item.durationMin ?? 0));
  }
  const blockMinutes = BLOCK_ORDER.filter((kind) => (minutesByKind.get(kind) ?? 0) > 0).map(
    (kind) => ({ kind, minutes: minutesByKind.get(kind) ?? 0 }),
  );

  const counts: ReviewWeekView["counts"] = [];
  const confirmedDayIds = new Set(
    raw.dayExtras.filter((row) => row.confirmedAt !== null).map((row) => row.id),
  );
  for (const template of raw.morningTemplates) {
    const used = raw.blockRows.filter(
      (row) => row.kind === "morning" && row.templateId === template.id && confirmedDayIds.has(row.dayId),
    ).length;
    if (used > 0 || template.weeklyTarget !== null) {
      counts.push({ label: template.name.trim() === "" ? "Morning" : template.name, used, target: template.weeklyTarget });
    }
  }
  const menuDays = raw.blockRows.filter(
    (row) => row.kind === "morning" && row.state === "pooled" && confirmedDayIds.has(row.dayId),
  ).length;
  if (menuDays > 0) counts.push({ label: "Menu", used: menuDays, target: null });
  for (const habit of raw.rotation) {
    const used =
      habit.type === "deep_work"
        ? raw.dayExtras.filter((row) => row.focusTitle === habit.title && confirmedDayIds.has(row.id)).length
        : raw.items.filter(
            (item) => item.habitId === habit.id && item.type === "workout" && item.completionState === "done",
          ).length;
    if (used > 0 || habit.weeklyTarget !== null) {
      counts.push({ label: habit.title, used, target: habit.weeklyTarget });
    }
  }
  const unstructured = raw.dayExtras.filter((row) => row.shape === "unstructured").length;
  if (unstructured > 0) counts.push({ label: "Unstructured", used: unstructured, target: null });
  const notConfirmedCount = raw.items.filter((item) => item.completionState === "not_confirmed").length;

  const journalByDayId = new Map(raw.journalRows.map((row) => [row.dayId, row.answers]));
  const reflections: ReviewWeekView["reflections"] = raw.dayRows
    .map((row) => {
      const answers = journalByDayId.get(row.id) ?? {};
      const gratitude = answers["gratitude_today"]?.trim() || null;
      const lookingForward = answers["looking_forward"]?.trim() || null;
      return { date: String(row.date), gratitude, lookingForward };
    })
    .filter((entry) => entry.gratitude !== null || entry.lookingForward !== null);

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

  const reasonLabelByKey = new Map(
    raw.reasonLabels.map((row) => [row.key, row.label]),
  );

  /*
   * WR-04's rows. `cutCount` is the items this shift took, by the same
   * `misses.shift_id` link the Schedule's SC-02 sheet reads — one relationship,
   * two screens.
   */
  const cutCountByShift = new Map<string, number>();
  for (const miss of missRows) {
    if (miss.shiftId === null) continue;
    cutCountByShift.set(
      miss.shiftId,
      (cutCountByShift.get(miss.shiftId) ?? 0) + 1,
    );
  }

  const weekShiftRows: WeekShiftRow[] = raw.shiftRows.map((row) => ({
    id: row.id,
    date: dateByDayId.get(row.dayId) ?? "",
    at: row.at,
    deltaMin: row.deltaMin,
    reasonLabel:
      (row.reasonKey === null
        ? null
        : (reasonLabelByKey.get(row.reasonKey) ?? null)) ?? row.reasonText,
    cutCount: cutCountByShift.get(row.id) ?? 0,
  }));

  /*
   * WR-03's rows — tasks carried out of this week.
   *
   * `firstAssignedDate` is the earliest day in the item's own carry chain that
   * falls inside the rows we read; walking further back would need another
   * query per item for a line that says "this has been moving for a while".
   * `[REVISIT: if a chain older than the week reads as wrong, this needs the
   * recursive walk `get-review-day.ts` already has.]`
   */
  const dateByItemId = new Map(
    raw.items.map((item) => [item.id, dateByDayId.get(item.dayId) ?? ""]),
  );
  const carriedFromById = new Map(
    raw.items.map((item) => [item.id, item.carriedFromItemId]),
  );

  const carriedItems: CarriedItem[] = raw.items
    .filter((item) => item.completionState === "carried")
    .map((item) => {
      let cursor: string | null = item.carriedFromItemId ?? null;
      let count = 1;
      let first = dateByItemId.get(item.id) ?? "";
      const seen = new Set<string>();

      while (cursor !== null && !seen.has(cursor)) {
        seen.add(cursor);
        const date = dateByItemId.get(cursor);
        if (date === undefined) break;
        first = date;
        count += 1;
        cursor = carriedFromById.get(cursor) ?? null;
      }

      return {
        id: item.id,
        title: item.title,
        icon: item.icon,
        firstAssignedDate: first,
        carriedCount: count,
      };
    })
    .sort((a, b) => b.carriedCount - a.carriedCount);

  const doneDeepWork = raw.items.filter(
    (item) => item.type === "deep_work" && item.completionState === "done",
  );

  /*
   * WR-01's *Deep work* rows — one per habit rather than one per item, because
   * "Writing, 4 sessions, 6 h" is what a week of deep work actually looks like;
   * four separate Writing rows would be the same fact said four times.
   *
   * `sessions` counts the ITEMS that ran, not `timer_sessions`: a block started
   * and paused twice is one sitting, and the week model does not read sessions.
   * `[REVISIT: if the distinction matters in use, this needs the session rows.]`
   */
  const deepWorkRows = new Map<string, DeepWorkRow>();
  for (const item of raw.items) {
    if (item.type !== "deep_work") continue;
    const key = item.habitId ?? `title:${item.title}`;

    let row = deepWorkRows.get(key);
    if (row === undefined) {
      row = {
        habitId: item.habitId,
        title: item.title,
        icon: item.icon,
        sessions: 0,
        minutes: 0,
        done: 0,
        counted: 0,
      };
      deepWorkRows.set(key, row);
    }

    if (item.completionState === "done") {
      row.sessions += 1;
      row.minutes += item.durationMin ?? 0;
      row.done += 1;
    }
    if (reviewedDayIds.has(item.dayId)) {
      const credit = allVerdicts[item.id]?.credit ?? null;
      if (credit !== null) row.counted += 1;
    }
  }

  return {
    weekKey,
    timezone,
    planned: raw.dayRows.filter((row) => row.templateId !== null).length,
    reviewed: reviewedDayIds.size,
    // The week is open while today is still inside it.
    open: dates.includes(todayKey) || todayKey < (dates[6] ?? ""),
    result,
    unreviewedCount: raw.dayRows.length - reviewedDayIds.size,
    templates: [...templateUsage.values()].sort((a, b) => b.days - a.days),
    // Sorted by how the week went, worst first — the point of the strip is to
    // find what slipped, not to rank what did not.
    habits: [...habitStrips.values()]
      .sort((a, b) => rate(a) - rate(b) || a.title.localeCompare(b.title))
      .map((strip) => ({ ...strip, days: toStripWeek(strip.days) })),
    deepWorkRows: [...deepWorkRows.values()].sort(
      (a, b) => b.minutes - a.minutes || a.title.localeCompare(b.title),
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
    shiftRows: weekShiftRows,
    carriedItems,
    shifts: {
      count: raw.shiftRows.length,
      totalMin: raw.shiftRows.reduce((total, row) => total + row.deltaMin, 0),
      mostCommonReason: mostCommonReason(raw.shiftRows),
    },
    categories: [...categoryMinutes.values()].sort(
      (a, b) => b.minutes - a.minutes,
    ),
    counts,
    blockMinutes,
    reflections,
    notConfirmedCount,
  };
}


/** A strip with nothing counted sorts last, not first — it did not slip. */
/** Reads only the two counters, so it serves the mutable and final shapes. */
function rate(strip: { credit: number; counted: number }): number {
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
