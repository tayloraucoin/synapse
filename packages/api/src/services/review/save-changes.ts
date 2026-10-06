import { and, eq } from "drizzle-orm";

import { days, type RlsClient } from "@syn/db";

import { applyDecision, type DecisionInput } from "./decide";

/**
 * Edit mode's one write — Epic 3 DR-01 in edit mode, cross-cutting §8.1.
 *
 * EDIT MODE BATCHES; LIVE MODE DOES NOT. The two look like the same screen and
 * behave oppositely on purpose. In live mode every tap writes, so *Finish
 * later* keeps what was decided. In edit mode nothing is written until *Save
 * changes*, because the document offers *Discard changes?* — and a change that
 * can be discarded cannot already be in the database. Logged in the track's
 * `TECHNICAL-DECISIONS.md`.
 *
 * ONE TRANSACTION, ONE STAMP. Every decision goes through the same
 * `applyDecision` live mode uses, inside a single transaction: a failure part
 * way through rolls back the whole batch rather than leaving a record half
 * edited, which is what *Discard* promises and what a loop of `decide` calls
 * could not deliver. The stamp is written once at the end rather than per item,
 * so `review_edited_at` reads as the moment the person saved.
 *
 * THE STAMP IS UNCONDITIONAL HERE. `applyDecision` stamps only a REVIEWED day,
 * which is the right rule for live mode; this procedure is only reachable in
 * edit mode, where the day is reviewed by definition, and stamping explicitly
 * means an empty-but-submitted batch cannot silently skip it.
 *
 * REFLECTIONS ARE NOT IN THE BATCH. They write through `item.rate` and
 * `item.setNote` as they change, on this screen and in the item sheet alike —
 * one write path for a rating wherever it is entered — and they never affect
 * the number, so they are not part of what *Discard* is protecting.
 */

export type SaveChangesInput = {
  date: string;
  changes: Array<{ itemId: string; decision: DecisionInput }>;
};

export async function saveReviewChanges(
  rls: RlsClient,
  userId: string,
  input: SaveChangesInput,
  at: Date = new Date(),
): Promise<{ changed: number }> {
  return rls.execute(async (tx) => {
    const [day] = await tx
      .select({ id: days.id, reviewedAt: days.reviewedAt })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, input.date)))
      .limit(1);

    if (!day) throw new Error("no such day");

    for (const change of input.changes) {
      await applyDecision(tx, userId, change.itemId, change.decision, at);
    }

    // A reviewed day that was opened, changed and saved is an edited record —
    // even when the batch turned out to be empty, because the person pressed
    // the button and the screen is about to say *edited*.
    if (day.reviewedAt !== null) {
      await tx
        .update(days)
        .set({ reviewEditedAt: at, updatedAt: at })
        .where(eq(days.id, day.id));
    }

    return { changed: input.changes.length };
  });
}
