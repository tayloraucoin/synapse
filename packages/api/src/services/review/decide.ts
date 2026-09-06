import { and, eq } from "drizzle-orm";

import { dayItems, days, misses, type RlsClient } from "@syn/db";
import type { MissTier } from "@syn/types";

/**
 * One decision, written as it is made — Epic 3 DR-02, DR-03.
 *
 * BOTH KINDS WRITE ON TAP, and only the carried item's CREATION waits for
 * finish. The document says decided items keep their decisions through *Finish
 * later*, which a client-side carry would not: someone who carried three tasks
 * and then left would come back to three undone items and no memory of having
 * decided anything. So `completion_state = carried` is written immediately —
 * the resolver already excludes a carried item from its own day, which is the
 * right answer while the review is unfinished — and tomorrow's row is created
 * by `review.finish` and nothing else.
 *
 * A MISS IS UPSERTED, NEVER DUPLICATED. `misses_day_item_id_idx` is unique, so
 * changing a decision updates the row rather than adding a second verdict for
 * one item.
 *
 * `resolved_by = day_review` ALWAYS, even on a row a shift created. That is
 * what DR-05 reads to say *Changed from the shift's reason.* — and the shift's
 * own record is never touched, because the miss carries `shift_id` forward.
 */
export type DecisionInput =
  | { kind: "carry" }
  | {
      kind: "missed";
      tier: MissTier;
      reasonKey: string | null;
      reasonText: string | null;
      tradedUpItemId: string | null;
    };

export async function decide(
  rls: RlsClient,
  userId: string,
  itemId: string,
  decision: DecisionInput,
  at: Date = new Date(),
): Promise<{ itemId: string }> {
  return rls.execute(async (tx) => {
    const [item] = await tx
      .select({ id: dayItems.id, dayId: dayItems.dayId })
      .from(dayItems)
      .where(and(eq(dayItems.id, itemId), eq(dayItems.userId, userId)))
      .limit(1);

    if (!item) throw new Error("no such item");

    if (decision.kind === "carry") {
      // Any earlier *Missed* on this item is withdrawn: a person who changed
      // their mind to *Carry forward* has not also missed it.
      await tx
        .delete(misses)
        .where(and(eq(misses.dayItemId, item.id), eq(misses.userId, userId)));

      await tx
        .update(dayItems)
        .set({ completionState: "carried", updatedAt: at })
        .where(eq(dayItems.id, item.id));

      return stampIfClosed(tx, userId, item.dayId, at, { itemId: item.id });
    }

    // Keep whatever `shift_id` the row already carries: a re-decision is a
    // change to the same record, not a new one, and the shift stays named.
    const [existing] = await tx
      .select({ shiftId: misses.shiftId })
      .from(misses)
      .where(and(eq(misses.dayItemId, item.id), eq(misses.userId, userId)))
      .limit(1);

    await tx
      .insert(misses)
      .values({
        userId,
        dayItemId: item.id,
        tier: decision.tier,
        reasonKey: decision.reasonKey,
        reasonText: decision.reasonText,
        tradedUpItemId: decision.tradedUpItemId,
        resolvedBy: "day_review",
        shiftId: existing?.shiftId ?? null,
      })
      .onConflictDoUpdate({
        target: misses.dayItemId,
        set: {
          tier: decision.tier,
          reasonKey: decision.reasonKey,
          reasonText: decision.reasonText,
          tradedUpItemId: decision.tradedUpItemId,
          resolvedBy: "day_review",
          updatedAt: at,
        },
      });

    await tx
      .update(dayItems)
      .set({ completionState: "missed", updatedAt: at })
      .where(eq(dayItems.id, item.id));

    return stampIfClosed(tx, userId, item.dayId, at, { itemId: item.id });
  });
}

/**
 * Deciding on a CLOSED day is a record edit and says so (cross-cutting §8.2).
 * On an open day nothing is stamped — the review has not happened yet, so
 * there is no record to have edited.
 */
async function stampIfClosed<T>(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  userId: string,
  dayId: string,
  at: Date,
  result: T,
): Promise<T> {
  const [day] = await tx
    .select({ id: days.id, closedAt: days.closedAt, reviewedAt: days.reviewedAt })
    .from(days)
    .where(and(eq(days.id, dayId), eq(days.userId, userId)))
    .limit(1);

  // Only a REVIEWED day has a record to edit. A closed-but-unreviewed day is
  // still being decided for the first time.
  if (day?.reviewedAt != null) {
    await tx
      .update(days)
      .set({ reviewEditedAt: at, updatedAt: at })
      .where(eq(days.id, day.id));
  }

  return result;
}
