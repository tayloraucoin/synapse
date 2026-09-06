import { and, eq } from "drizzle-orm";

import { dayItems, misses, type RlsClient } from "@syn/db";

/**
 * LS-02's *Bring back* and LS-03's *Do it anyway* — the two ways a faded row
 * rejoins the day.
 *
 * THEY ARE LIST ACTIONS, NOT UNDO. USE-7 writes the trim and USE-6 writes the
 * shift; these are what a person does about the result, from the screen where
 * they can see it. Neither reverses a shift or restores a capacity — they move
 * one item back into the day and leave the record of why it left.
 *
 * *DO IT ANYWAY* MAKES THE ITEM UNSCHEDULED (Epic 2 §12, call 2). Its time was
 * taken by the shift; putting it back at a time that has passed would be a row
 * that reads *passed* the moment it returns. *Anytime* is the honest place for
 * something a person has decided to do despite the day moving.
 *
 * THE MISS IS DELETED, not annotated. A miss records that something did not
 * happen; doing it anyway means it did, and a miss row left behind would count
 * against the day in the review for an item that got done.
 */
export async function bringBackItem(
  rls: RlsClient,
  userId: string,
  itemId: string,
): Promise<{ id: string }> {
  return rls.execute(async (tx) => {
    const rows = await tx
      .update(dayItems)
      .set({
        assignmentState: "assigned",
        completionState: "upcoming",
        updatedAt: new Date(),
      })
      .where(and(eq(dayItems.id, itemId), eq(dayItems.userId, userId)))
      .returning({ id: dayItems.id });

    const row = rows[0];
    if (!row) throw new Error("no such item");
    return row;
  });
}

export async function doItemAnyway(
  rls: RlsClient,
  userId: string,
  itemId: string,
): Promise<{ id: string }> {
  return rls.execute(async (tx) => {
    const rows = await tx
      .update(dayItems)
      .set({
        assignmentState: "assigned",
        completionState: "upcoming",
        // Its slot in the day is gone; it becomes something to do today.
        timeMode: "unscheduled",
        scheduledStart: null,
        scheduledEnd: null,
        updatedAt: new Date(),
      })
      .where(and(eq(dayItems.id, itemId), eq(dayItems.userId, userId)))
      .returning({ id: dayItems.id });

    const row = rows[0];
    if (!row) throw new Error("no such item");

    await tx
      .delete(misses)
      .where(and(eq(misses.dayItemId, itemId), eq(misses.userId, userId)));

    return row;
  });
}
