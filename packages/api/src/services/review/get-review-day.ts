import { and, asc, eq, inArray } from "drizzle-orm";

import { dayItems, days, misses, reasons, shifts, type RlsClient } from "@syn/db";
import type {
  DayItemView,
  DecisionState,
  MissTier,
  ReviewMode,
} from "@syn/types";
import { computeAdherence, type AdherenceResult } from "@syn/utils";

import { getDay } from "../day/get-day";
import { decisionStateFor } from "./decision-state";
import { readMisses, toScoredItems } from "./to-scored";

/**
 * Everything the Day Review renders — REV-2's read, built here so the number
 * and the rows it describes come from one query.
 *
 * `result` IS NULL UNTIL THE DAY IS REVIEWED. The number comes AFTER the
 * decisions, not alongside them: a percent computed over items nobody has
 * decided yet would be a guess shown as a fact, and the person would see it
 * move as they answered. Epic 3's whole sequence is decide, then count.
 *
 * IT RECOMPUTES EVERY TIME. Nothing is stored (official spec §3.11), so a day
 * reviewed last week whose items were since undone from the List shows the new
 * number — with `review_edited_at` saying the record was touched. A cached
 * percent would be the one number in the product that could be wrong.
 */
export type DecisionItemView = {
  item: DayItemView;
  state: DecisionState;
  decision: {
    tier: MissTier;
    reasonKey: string | null;
    reasonLabel: string | null;
    reasonText: string | null;
    tradedUpItemId: string | null;
  } | null;
  verdict: "not-counted" | "half" | "missed" | null;
  carriedCount: number;
  carriedSince: string | null;
  shiftContext: { deltaMin: number; at: Date; reasonLabel: string | null } | null;
};

export type ReviewDayView = {
  dateKey: string;
  mode: ReviewMode;
  closedAt: Date | null;
  closeReason: "manual" | "auto" | null;
  reviewedAt: Date | null;
  reviewEditedAt: Date | null;
  summary: {
    done: number;
    assigned: number;
    moved: number;
    notAssigned: number;
    cut: number;
  };
  toDecide: DecisionItemView[];
  cut: DecisionItemView[];
  doneItems: DayItemView[];
  shifts: Array<{
    id: string;
    at: Date;
    deltaMin: number;
    reasonLabel: string | null;
    tier: MissTier;
  }>;
  result: AdherenceResult | null;
  pendingCount: number;
  wakeAnchorItemId: string | null;
};

/** Never walk a carry chain further than this — a cycle would not terminate. */
const CARRY_WALK_CAP = 60;

export async function getReviewDay(
  rls: RlsClient,
  userId: string,
  dateKey: string,
  context: { todayKey: string; timeZone: string; dayCloseTime: string; now: Date },
): Promise<ReviewDayView> {
  // The rendered rows are USE-1's, so the review shows exactly what the List
  // showed — one mapping, two screens.
  const day = await getDay(rls, userId, dateKey, context);

  const raw = await rls.execute(async (tx) => {
    const [row] = await tx
      .select({
        id: days.id,
        closedAt: days.closedAt,
        closeReason: days.closeReason,
        reviewedAt: days.reviewedAt,
        reviewEditedAt: days.reviewEditedAt,
      })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, dateKey)))
      .limit(1);

    if (!row) return null;

    const items = await tx
      .select({
        id: dayItems.id,
        priority: dayItems.priority,
        timeMode: dayItems.timeMode,
        scheduledStart: dayItems.scheduledStart,
        scheduledEnd: dayItems.scheduledEnd,
        originalScheduledStart: dayItems.originalScheduledStart,
        doneAt: dayItems.doneAt,
        deferredAt: dayItems.deferredAt,
        assignmentState: dayItems.assignmentState,
        completionState: dayItems.completionState,
        carriedFromItemId: dayItems.carriedFromItemId,
        habitId: dayItems.habitId,
      })
      .from(dayItems)
      .where(and(eq(dayItems.dayId, row.id), eq(dayItems.userId, userId)))
      .orderBy(asc(dayItems.scheduledStart), asc(dayItems.sortOrder));

    return { day: row, items };
  });

  if (raw === null) {
    return emptyReview(dateKey, day.wakeAnchorItemId);
  }

  const itemIds = raw.items.map((item) => item.id);
  const missRows = await readMisses(rls, userId, itemIds);
  const scored = await toScoredItems(rls, userId, raw.items, missRows);
  const result = computeAdherence(scored);

  // The decisions, with their labels and their context.
  const detail = await rls.execute(async (tx) => {
    const fullMisses =
      itemIds.length === 0
        ? []
        : await tx
            .select({
              dayItemId: misses.dayItemId,
              tier: misses.tier,
              reasonKey: misses.reasonKey,
              reasonText: misses.reasonText,
              resolvedBy: misses.resolvedBy,
              shiftId: misses.shiftId,
              tradedUpItemId: misses.tradedUpItemId,
            })
            .from(misses)
            .where(
              and(
                eq(misses.userId, userId),
                inArray(misses.dayItemId, itemIds),
              ),
            );

    // Archived reasons are still rows, and a record made under one still
    // needs its label (the ticket's own edge case).
    const labels = await tx
      .select({ key: reasons.key, label: reasons.label })
      .from(reasons)
      .where(eq(reasons.userId, userId));

    const shiftRows = await tx
      .select({
        id: shifts.id,
        at: shifts.at,
        deltaMin: shifts.deltaMin,
        reasonKey: shifts.reasonKey,
        reasonText: shifts.reasonText,
        tier: shifts.tier,
      })
      .from(shifts)
      .where(and(eq(shifts.userId, userId), eq(shifts.dayId, raw.day.id)))
      .orderBy(asc(shifts.at));

    return { fullMisses, labels, shiftRows };
  });

  const labelByKey = new Map(detail.labels.map((row) => [row.key, row.label]));
  const missByItem = new Map(
    detail.fullMisses.map((miss) => [miss.dayItemId, miss]),
  );

  const carriedSince = await resolveCarriedSince(rls, userId, raw.items);

  const dayClosed = raw.day.closedAt !== null;
  const viewByItemId = new Map<string, DayItemView>();
  for (const part of day.parts) {
    for (const view of part.items) viewByItemId.set(view.id, view);
  }
  for (const view of day.notAssigned) viewByItemId.set(view.id, view);
  for (const view of day.cutByShift) viewByItemId.set(view.id, view);

  function decisionViewFor(itemId: string): DecisionItemView | null {
    const view = viewByItemId.get(itemId);
    const row = raw?.items.find((candidate) => candidate.id === itemId);
    if (!view || !row) return null;

    const miss = missByItem.get(itemId) ?? null;
    const verdict = result.perItem[itemId]?.verdict ?? null;
    const shift =
      miss?.shiftId === null || miss?.shiftId === undefined
        ? null
        : (detail.shiftRows.find((row) => row.id === miss.shiftId) ?? null);

    return {
      item: view,
      state: decisionStateFor(row, miss, dayClosed),
      decision:
        miss === null
          ? null
          : {
              tier: miss.tier,
              reasonKey: miss.reasonKey,
              reasonLabel:
                (miss.reasonKey === null
                  ? null
                  : (labelByKey.get(miss.reasonKey) ?? null)) ??
                miss.reasonText,
              reasonText: miss.reasonText,
              tradedUpItemId: miss.tradedUpItemId,
            },
      verdict:
        verdict === "not-counted" || verdict === "half" || verdict === "missed"
          ? verdict
          : null,
      carriedCount: carriedSince.get(itemId)?.count ?? 0,
      carriedSince: carriedSince.get(itemId)?.since ?? null,
      shiftContext:
        shift === null
          ? null
          : {
              deltaMin: shift.deltaMin,
              at: shift.at,
              reasonLabel:
                (shift.reasonKey === null
                  ? null
                  : (labelByKey.get(shift.reasonKey) ?? null)) ??
                shift.reasonText,
            },
    };
  }

  const toDecide = raw.items
    .filter(
      (row) =>
        row.assignmentState === "assigned" &&
        row.completionState !== "done" &&
        row.completionState !== "active",
    )
    .map((row) => decisionViewFor(row.id))
    .filter((view): view is DecisionItemView => view !== null);

  const cut = raw.items
    .filter((row) => row.assignmentState === "cut_by_shift")
    .map((row) => decisionViewFor(row.id))
    .filter((view): view is DecisionItemView => view !== null);

  const doneItems = raw.items
    .filter((row) => row.completionState === "done")
    .map((row) => viewByItemId.get(row.id))
    .filter((view): view is DayItemView => view !== undefined);

  const pendingCount = Object.values(result.perItem).filter(
    (entry) => entry.verdict === "pending",
  ).length;

  /*
   * THE MODE IS ABOUT WHAT THE SCREEN IS FOR, not about the calendar.
   * `live` is a day still being lived; `pending` is a closed day with
   * decisions owed; `edit` is a day already reviewed, where the screen becomes
   * a record with a way to change it.
   */
  const mode: ReviewMode =
    raw.day.reviewedAt !== null ? "edit" : dayClosed ? "pending" : "live";

  return {
    dateKey,
    mode,
    closedAt: raw.day.closedAt,
    closeReason: raw.day.closeReason,
    reviewedAt: raw.day.reviewedAt,
    reviewEditedAt: raw.day.reviewEditedAt,
    summary: {
      done: doneItems.length,
      assigned: raw.items.filter((row) => row.assignmentState === "assigned")
        .length,
      moved: result.offSchedule.moved,
      notAssigned: raw.items.filter(
        (row) => row.assignmentState === "not_assigned",
      ).length,
      cut: cut.length,
    },
    toDecide,
    cut,
    doneItems,
    shifts: detail.shiftRows.map((row) => ({
      id: row.id,
      at: row.at,
      deltaMin: row.deltaMin,
      reasonLabel:
        (row.reasonKey === null ? null : (labelByKey.get(row.reasonKey) ?? null)) ??
        row.reasonText,
      tier: row.tier,
    })),
    // The number comes after the decisions.
    result: raw.day.reviewedAt === null ? null : result,
    pendingCount,
    wakeAnchorItemId: day.wakeAnchorItemId,
  };
}

/**
 * How many days an item has been carried, and since when.
 *
 * The walk is capped: `carried_from_item_id` is a chain a person builds one
 * day at a time, but a bad migration or a hand-edited row could close it into
 * a cycle, and a review screen must not be the thing that hangs.
 */
async function resolveCarriedSince(
  rls: RlsClient,
  userId: string,
  items: readonly { id: string; carriedFromItemId: string | null }[],
): Promise<Map<string, { count: number; since: string | null }>> {
  const out = new Map<string, { count: number; since: string | null }>();
  const chained = items.filter((item) => item.carriedFromItemId !== null);
  if (chained.length === 0) return out;

  for (const item of chained) {
    let cursor = item.carriedFromItemId;
    let count = 0;
    let since: string | null = null;
    const seen = new Set<string>();

    while (cursor !== null && count < CARRY_WALK_CAP) {
      if (seen.has(cursor)) break;
      seen.add(cursor);

      const rows: Array<{ carriedFromItemId: string | null; date: string }> =
        await rls.execute((tx) =>
          tx
            .select({
              carriedFromItemId: dayItems.carriedFromItemId,
              date: days.date,
            })
            .from(dayItems)
            .innerJoin(days, eq(days.id, dayItems.dayId))
            .where(
              and(eq(dayItems.id, cursor as string), eq(dayItems.userId, userId)),
            )
            .limit(1),
        );

      const row = rows[0];
      if (!row) break;

      count += 1;
      since = String(row.date);
      cursor = row.carriedFromItemId;
    }

    out.set(item.id, { count, since });
  }

  return out;
}

/** A date with no `days` row — nothing was ever planned, so nothing to review. */
function emptyReview(
  dateKey: string,
  wakeAnchorItemId: string | null,
): ReviewDayView {
  return {
    dateKey,
    mode: "live",
    closedAt: null,
    closeReason: null,
    reviewedAt: null,
    reviewEditedAt: null,
    summary: { done: 0, assigned: 0, moved: 0, notAssigned: 0, cut: 0 },
    toDecide: [],
    cut: [],
    doneItems: [],
    shifts: [],
    result: null,
    pendingCount: 0,
    wakeAnchorItemId,
  };
}
