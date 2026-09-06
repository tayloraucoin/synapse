import { and, eq, inArray } from "drizzle-orm";

import { dayItems, misses, type RlsClient } from "@syn/db";
import type { MissTier } from "@syn/types";
import { isOffSchedule, type ScoredItem } from "@syn/utils";

/**
 * Rows → the resolver's input.
 *
 * THE TRADED ITEM IS RESOLVED IN MEMORY from the day's own rows, not by a
 * second query per miss. A day has tens of items and at most a handful of
 * traded-up misses; fetching the day once and looking across it is one round
 * trip where the obvious shape would be one per excuse.
 *
 * A TRADED ITEM ON ANOTHER DAY is fetched separately, because *stayed on
 * something more important* can point at anything the person did — including
 * something from a different day, once REV-3's editing exists. It is rare
 * enough to be a second query only when it happens.
 *
 * `offSchedule` IS USE-1's, not a local comparison. The rule for "this moved"
 * lives in one function; re-deriving it here would be a second definition of
 * the thing the violet band and the word *moved* both mean.
 */
export type ScoredRow = {
  id: string;
  priority: number;
  timeMode: "fixed_time" | "window" | "unscheduled";
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  originalScheduledStart: Date | null;
  doneAt: Date | null;
  deferredAt: Date | null;
  assignmentState: "assigned" | "not_assigned" | "cut_by_shift";
  completionState:
    | "upcoming"
    | "active"
    | "done"
    | "missed"
    | "carried"
    | "pending_review";
};

export type MissRow = {
  dayItemId: string;
  tier: MissTier;
  reasonKey: string | null;
  tradedUpItemId: string | null;
};

export async function toScoredItems(
  rls: RlsClient,
  userId: string,
  rows: readonly ScoredRow[],
  missRows: readonly MissRow[],
): Promise<ScoredItem[]> {
  const missByItem = new Map(missRows.map((miss) => [miss.dayItemId, miss]));

  // Which traded items are not already in this day's rows.
  const known = new Map(rows.map((row) => [row.id, row]));
  const foreign = missRows
    .map((miss) => miss.tradedUpItemId)
    .filter((id): id is string => id !== null && !known.has(id));

  const extra =
    foreign.length === 0
      ? []
      : await rls.execute((tx) =>
          tx
            .select({
              id: dayItems.id,
              priority: dayItems.priority,
              completionState: dayItems.completionState,
            })
            .from(dayItems)
            .where(
              and(
                eq(dayItems.userId, userId),
                inArray(dayItems.id, foreign),
              ),
            ),
        );

  const tradedById = new Map<string, { done: boolean; priority: number }>();
  for (const row of rows) {
    tradedById.set(row.id, {
      done: row.completionState === "done",
      priority: row.priority,
    });
  }
  for (const row of extra) {
    tradedById.set(row.id, {
      done: row.completionState === "done",
      priority: row.priority,
    });
  }

  return rows.map((row) => {
    const miss = missByItem.get(row.id) ?? null;

    return {
      id: row.id,
      priority: row.priority,
      done: row.completionState === "done",
      // "Done outside the window it was planned for" — USE-1's definition,
      // which reads `done_at` against the plan rather than comparing the two
      // start columns. It needs the whole row, so it gets the whole row.
      offSchedule: isOffSchedule({
        assignmentState: row.assignmentState,
        completionState: row.completionState,
        timeMode: row.timeMode,
        scheduledStart: row.scheduledStart,
        scheduledEnd: row.scheduledEnd,
        originalScheduledStart: row.originalScheduledStart,
        doneAt: row.doneAt,
        deferredAt: row.deferredAt,
        hasRunningSession: false,
      }),
      assignmentState: row.assignmentState,
      completionState: row.completionState,
      miss:
        miss === null
          ? null
          : {
              tier: miss.tier,
              reasonKey: miss.reasonKey,
              /*
               * A `traded_up_item_id` that no longer resolves — the one-off it
               * pointed at was deleted, and the FK is ON DELETE SET NULL —
               * lands here as null, which the resolver treats as unverified.
               * Half, not excluded: the claim can no longer be checked, and an
               * unverifiable excuse is not a verified one.
               */
              tradedUp:
                miss.tradedUpItemId === null
                  ? null
                  : (tradedById.get(miss.tradedUpItemId) ?? null),
            },
    };
  });
}

/** The day's misses, in one query. */
export async function readMisses(
  rls: RlsClient,
  userId: string,
  itemIds: readonly string[],
): Promise<MissRow[]> {
  if (itemIds.length === 0) return [];

  return rls.execute((tx) =>
    tx
      .select({
        dayItemId: misses.dayItemId,
        tier: misses.tier,
        reasonKey: misses.reasonKey,
        tradedUpItemId: misses.tradedUpItemId,
      })
      .from(misses)
      .where(
        and(
          eq(misses.userId, userId),
          inArray(misses.dayItemId, [...itemIds]),
        ),
      ),
  );
}
