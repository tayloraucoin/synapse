import { and, eq, inArray, isNull } from "drizzle-orm";

import { dayItems, days, misses, timerSessions, type RlsClient } from "@syn/db";
import { addDays } from "@syn/utils";

import { carryItemForward } from "../day/carry-item";
import { closeDay } from "../day/close-day";

/**
 * *Finish review* — the one moment a day becomes a record.
 *
 * IT REFUSES A DAY WITH AN UNDECIDED ITEM. The number is computed from
 * decisions, so finishing without them would print a percent over things
 * nobody had answered for. The client disables the button; this refuses
 * anyway, because a disabled button is a courtesy and a server check is a
 * guarantee.
 *
 * IT IS IDEMPOTENT ON `reviewed_at`. A double submit, or a retry after a
 * timeout, returns without carrying anything a second time — the carry itself
 * is idempotent too, so both layers hold.
 *
 * IT RACES THE AUTO-CLOSE SAFELY. If 03:00 passed mid-review the day is
 * already closed and `closeDay` returns without doing anything; this then
 * stamps `reviewed_at` over the auto-closed day, which is exactly the pending
 * path. One code path, two ways in.
 *
 * A RUNNING TIMER ENDS HERE. Finishing a day with a session still open would
 * leave it accruing against a day that has been put away.
 */
export type FinishResult = {
  reviewedAt: Date;
  carried: number;
  alreadyReviewed: boolean;
};

export class UndecidedItemsError extends Error {
  readonly count: number;
  constructor(count: number) {
    super("undecided_items");
    this.name = "UndecidedItemsError";
    this.count = count;
  }
}

export async function finishReview(
  rls: RlsClient,
  userId: string,
  dateKey: string,
  context: { timeZone: string; dayCloseTime: string; now: Date },
): Promise<FinishResult> {
  const day = await rls.execute(async (tx) => {
    const rows = await tx
      .select({
        id: days.id,
        closedAt: days.closedAt,
        reviewedAt: days.reviewedAt,
      })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, dateKey)))
      .limit(1);
    return rows[0] ?? null;
  });

  if (!day) throw new Error("no such day");

  if (day.reviewedAt !== null) {
    return { reviewedAt: day.reviewedAt, carried: 0, alreadyReviewed: true };
  }

  // Everything assigned, undone, and undecided. A `carried` or `missed` state
  // IS a decision; `active` and `upcoming` are not.
  const undecided = await rls.execute(async (tx) => {
    const items = await tx
      .select({ id: dayItems.id })
      .from(dayItems)
      .where(
        and(
          eq(dayItems.dayId, day.id),
          eq(dayItems.userId, userId),
          eq(dayItems.assignmentState, "assigned"),
          inArray(dayItems.completionState, ["upcoming", "active", "pending_review"]),
        ),
      );

    if (items.length === 0) return [];

    // An item with a miss row is decided even if its state lags.
    const decided = await tx
      .select({ dayItemId: misses.dayItemId })
      .from(misses)
      .where(
        and(
          eq(misses.userId, userId),
          inArray(
            misses.dayItemId,
            items.map((item) => item.id),
          ),
        ),
      );

    const decidedIds = new Set(decided.map((row) => row.dayItemId));
    return items.filter((item) => !decidedIds.has(item.id));
  });

  if (undecided.length > 0) throw new UndecidedItemsError(undecided.length);

  // End any running session before the day is put away.
  await endRunningSessionsOnDay(rls, userId, day.id, context.now);

  // Already closed by the auto-close pass? `closeDay` returns without acting.
  if (day.closedAt === null) {
    await closeDay(rls, userId, {
      dateKey,
      reason: "manual",
      timeZone: context.timeZone,
      dayCloseTime: context.dayCloseTime,
      closedAt: context.now,
    });
  }

  // Only now do the carried items reach tomorrow.
  const carriedItems = await rls.execute((tx) =>
    tx
      .select({ id: dayItems.id })
      .from(dayItems)
      .where(
        and(
          eq(dayItems.dayId, day.id),
          eq(dayItems.userId, userId),
          eq(dayItems.completionState, "carried"),
        ),
      ),
  );

  const tomorrow = addDays(dateKey, 1);
  let carried = 0;
  for (const item of carriedItems) {
    const result = await carryItemForward(rls, userId, item.id, tomorrow);
    if (result.created) carried += 1;
  }

  await rls.execute((tx) =>
    tx
      .update(days)
      .set({ reviewedAt: context.now, updatedAt: context.now })
      .where(eq(days.id, day.id)),
  );

  return { reviewedAt: context.now, carried, alreadyReviewed: false };
}

/** Every open session on this day's items. */
async function endRunningSessionsOnDay(
  rls: RlsClient,
  userId: string,
  dayId: string,
  at: Date,
): Promise<void> {
  await rls.execute(async (tx) => {
    const items = await tx
      .select({ id: dayItems.id })
      .from(dayItems)
      .where(and(eq(dayItems.dayId, dayId), eq(dayItems.userId, userId)));

    if (items.length === 0) return;

    await tx
      .update(timerSessions)
      .set({ endedAt: at })
      .where(
        and(
          eq(timerSessions.userId, userId),
          isNull(timerSessions.endedAt),
          inArray(
            timerSessions.dayItemId,
            items.map((item) => item.id),
          ),
        ),
      );
  });
}
