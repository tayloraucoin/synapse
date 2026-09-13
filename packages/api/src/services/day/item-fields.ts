import { and, eq } from "drizzle-orm";

import { dayItems, days, type RlsClient } from "@syn/db";

/**
 * The item sheet's four small writes — *Not today*, quantity, note, rating.
 *
 * THEY SHARE ONE HELPER because they share one rule: an edit to a CLOSED day
 * stamps `review_edited_at` (cross-cutting §8.2). The record stays editable;
 * it just stops pretending it was never touched. Writing that rule four times
 * is writing three chances to forget it.
 *
 * NONE OF THEM ASKS A REASON. *Not today* in particular: the Day Review asks
 * about what was missed, and asking here as well would make deferring
 * something feel like an admission (Epic 2 §4).
 */

/** Update one item and stamp the day when it is closed. Returns the day mode. */
async function patchItem(
  rls: RlsClient,
  userId: string,
  itemId: string,
  patch: Record<string, unknown>,
  at: Date,
): Promise<{ id: string; reviewEdited: boolean }> {
  return rls.execute(async (tx) => {
    const [item] = await tx
      .select({ id: dayItems.id, dayId: dayItems.dayId })
      .from(dayItems)
      .where(and(eq(dayItems.id, itemId), eq(dayItems.userId, userId)))
      .limit(1);

    if (!item) throw new Error("no such item");

    await tx
      .update(dayItems)
      .set({ ...patch, updatedAt: at })
      .where(eq(dayItems.id, item.id));

    const [day] = await tx
      .select({ id: days.id, closedAt: days.closedAt })
      .from(days)
      .where(eq(days.id, item.dayId))
      .limit(1);

    const reviewEdited = day?.closedAt != null;
    if (reviewEdited && day) {
      await tx
        .update(days)
        .set({ reviewEditedAt: at, updatedAt: at })
        .where(eq(days.id, day.id));
    }

    return { id: item.id, reviewEdited };
  });
}

/** *Not today* / *Back in the list*. Asks nothing. */
export async function deferItem(
  rls: RlsClient,
  userId: string,
  input: { id: string; deferred: boolean },
  at: Date = new Date(),
) {
  return patchItem(
    rls,
    userId,
    input.id,
    { deferredAt: input.deferred ? at : null },
    at,
  );
}

/** The quantity tail — only meaningful when the habit carries a unit. */
export async function setItemQuantity(
  rls: RlsClient,
  userId: string,
  input: { id: string; value: number | null },
  at: Date = new Date(),
) {
  return patchItem(
    rls,
    userId,
    input.id,
    // `numeric` takes a string; null clears the tail entirely.
    { quantityValue: input.value === null ? null : String(input.value) },
    at,
  );
}

export async function setItemNote(
  rls: RlsClient,
  userId: string,
  input: { id: string; note: string | null },
  at: Date = new Date(),
) {
  const note = input.note?.trim() ?? "";
  return patchItem(
    rls,
    userId,
    input.id,
    { notesReflection: note === "" ? null : note },
    at,
  );
}

/**
 * One reflection axis.
 *
 * The ratings are a JSON object keyed by axis label, so a write merges rather
 * than replaces: rating "energy" must not erase "focus". Reading first is the
 * cost of storing them as one document, and it is the right trade — the axes
 * are a snapshot of the habit's list, and a column per axis would be a schema
 * change every time somebody invents a new one.
 */
export async function rateItem(
  rls: RlsClient,
  userId: string,
  input: { id: string; axis: string; value: number | null },
  at: Date = new Date(),
) {
  return rls.execute(async (tx) => {
    const [item] = await tx
      .select({
        id: dayItems.id,
        dayId: dayItems.dayId,
        reflectionRatings: dayItems.reflectionRatings,
      })
      .from(dayItems)
      .where(and(eq(dayItems.id, input.id), eq(dayItems.userId, userId)))
      .limit(1);

    if (!item) throw new Error("no such item");

    const ratings = { ...item.reflectionRatings };
    if (input.value === null) {
      delete ratings[input.axis];
    } else {
      ratings[input.axis] = input.value;
    }

    await tx
      .update(dayItems)
      .set({ reflectionRatings: ratings, updatedAt: at })
      .where(eq(dayItems.id, item.id));

    const [day] = await tx
      .select({ id: days.id, closedAt: days.closedAt })
      .from(days)
      .where(eq(days.id, item.dayId))
      .limit(1);

    const reviewEdited = day?.closedAt != null;
    if (reviewEdited && day) {
      await tx
        .update(days)
        .set({ reviewEditedAt: at, updatedAt: at })
        .where(eq(days.id, day.id));
    }

    return { id: item.id, reviewEdited };
  });
}

/**
 * DH-02 — when the day really started.
 *
 * `woke_at_source = manual` is what protects it from the wake-anchor habit:
 * USE-2's `setItemDone` clears an anchor-set wake time when the habit is
 * un-ticked, and refuses to touch a manual one. A person who typed 07:10
 * should not lose it because they changed their mind about a checkbox.
 */
export async function setWakeTime(
  rls: RlsClient,
  userId: string,
  input: { date: string; wokeAt: Date | null; source?: "manual" | "orient" },
): Promise<{ wokeAt: Date | null }> {
  /*
   * UX v1.1 R11 — the orient frame stamps `orient` the moment it opens
   * (DYN-13); a picker stamps `manual`. A wake-time edit re-lays only an
   * UNCONFIRMED day (the walk is `confirmDay`'s, from `woke_at`); on a set
   * day it changes the header line and nothing moves — the same rule USE-3
   * gave DH-02. Nothing here re-lays: the materialiser reads `woke_at` on
   * its next pass, and a confirmed day has no next pass.
   */
  await rls.execute((tx) =>
    tx
      .update(days)
      .set({
        wokeAt: input.wokeAt,
        wokeAtSource: input.wokeAt === null ? null : (input.source ?? "manual"),
        updatedAt: new Date(),
      })
      .where(and(eq(days.userId, userId), eq(days.date, input.date))),
  );

  return { wokeAt: input.wokeAt };
}
