import { and, eq, isNull } from "drizzle-orm";

import {
  dayItems,
  days,
  timerSessions,
  users,
  type RlsClient,
} from "@syn/db";

/**
 * Mark an item done, or undo it — the one write the List makes on every tap.
 *
 * IT IS IDEMPOTENT AND IT CARRIES ITS OWN TIMESTAMP. The client sends the
 * instant it happened, so a slow request records the moment of the tap rather
 * than the moment the server got round to it. On undo it sends back the
 * ORIGINAL `done_at`, which is what makes *Undo* restore a record instead of
 * writing a new one — a person who un-ticks and re-ticks within the five
 * seconds has changed nothing, and the row should say so.
 *
 * DONE CLEARS `deferred_at`. An item marked *not today* and then done was, in
 * fact, done today; leaving the deferral would sort a completed row to the
 * bottom of its part under a word that contradicts its checkmark.
 *
 * DONE ENDS A RUNNING TIMER (official spec §5.2). A session left open on a
 * finished item would keep accruing elapsed time against something nobody is
 * doing, and USE-3's timer would show it.
 *
 * THE WAKE ANCHOR SETS THE DAY'S `woke_at` in the same transaction, and undo
 * clears it only when the day's own source is `anchor` — a manually entered
 * wake time is a fact the person typed, and un-ticking a habit must not erase
 * it.
 *
 * AN EDIT TO A CLOSED DAY STAMPS `review_edited_at` (cross-cutting §8.2). The
 * record stays editable; it just stops pretending it was never touched.
 */
export type SetDoneResult = {
  id: string;
  doneAt: Date | null;
  wokeAt: Date | null;
  reviewEdited: boolean;
};

export async function setItemDone(
  rls: RlsClient,
  userId: string,
  input: { id: string; done: boolean; at: Date },
): Promise<SetDoneResult> {
  return rls.execute(async (tx) => {
    const [item] = await tx
      .select({
        id: dayItems.id,
        dayId: dayItems.dayId,
        habitId: dayItems.habitId,
      })
      .from(dayItems)
      .where(and(eq(dayItems.id, input.id), eq(dayItems.userId, userId)))
      .limit(1);

    if (!item) throw new Error("no such item");

    const [day] = await tx
      .select({
        id: days.id,
        closedAt: days.closedAt,
        wokeAt: days.wokeAt,
        wokeAtSource: days.wokeAtSource,
      })
      .from(days)
      .where(eq(days.id, item.dayId))
      .limit(1);

    if (!day) throw new Error("no such day");

    const doneAt = input.done ? input.at : null;

    await tx
      .update(dayItems)
      .set({
        doneAt,
        completionState: input.done ? "done" : "upcoming",
        // Done resolves a deferral; undone leaves it cleared, because the
        // person has now touched this item twice and "not today" is stale.
        deferredAt: null,
        updatedAt: new Date(),
      })
      .where(eq(dayItems.id, item.id));

    if (input.done) {
      await tx
        .update(timerSessions)
        .set({ endedAt: input.at })
        .where(
          and(
            eq(timerSessions.dayItemId, item.id),
            eq(timerSessions.userId, userId),
            isNull(timerSessions.endedAt),
          ),
        );
    }

    // The anchor, resolved from the account rather than from a flag on the row.
    const [account] = await tx
      .select({ wakeAnchorHabitId: users.wakeAnchorHabitId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const isAnchor =
      account?.wakeAnchorHabitId !== null &&
      account?.wakeAnchorHabitId !== undefined &&
      account.wakeAnchorHabitId === item.habitId;

    let wokeAt = day.wokeAt;

    if (isAnchor) {
      if (input.done) {
        wokeAt = input.at;
        await tx
          .update(days)
          .set({
            wokeAt: input.at,
            wokeAtSource: "anchor",
            updatedAt: new Date(),
          })
          .where(eq(days.id, day.id));
      } else if (day.wokeAtSource === "anchor") {
        // Only an anchor-set wake time is cleared. A manual one is the
        // person's own answer and outlives a checkbox.
        wokeAt = null;
        await tx
          .update(days)
          .set({ wokeAt: null, wokeAtSource: null, updatedAt: new Date() })
          .where(eq(days.id, day.id));
      }
    }

    const reviewEdited = day.closedAt !== null;
    if (reviewEdited) {
      await tx
        .update(days)
        .set({ reviewEditedAt: input.at, updatedAt: new Date() })
        .where(eq(days.id, day.id));
    }

    return { id: item.id, doneAt, wokeAt, reviewEdited };
  });
}
