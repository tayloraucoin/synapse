import { and, eq, gt, inArray, isNull, sql } from "drizzle-orm";

import { dayItems, misses, shifts, type RlsClient } from "@syn/db";
import { SHIFT_UNDO_WINDOW_MS } from "@syn/constants";

/**
 * *Undo this shift* — cross-cutting §8.1, Epic 2 §12 call 6.
 *
 * A TRUE REVERSAL, OR NOTHING. Within ten minutes a shift is a mistake being
 * corrected; after that it is a fact, and the only way past a fact is another
 * shift, which is also recorded. There is no soft middle where some of it comes
 * back.
 *
 * THREE REFUSALS, EACH PROTECTING SOMETHING DIFFERENT:
 *
 *  - **Past ten minutes.** The record has settled.
 *  - **A later shift exists.** Undoing the earlier one would subtract its delta
 *    from times the later shift has since moved again, leaving the day at a
 *    position nobody ever chose. Shifts compound; they do not commute.
 *  - **A cut item was done anyway.** Someone went and did the thing. Undoing
 *    would restore it to `upcoming` and delete the miss — erasing work that
 *    actually happened, which is the one outcome the record must never produce.
 *
 * WHAT COMES BACK, AND WHY THAT SET. The document's `shifts` row carries no
 * list of moved ids, so the reversal derives the set the same way the shift
 * derived it: soft, undone, assigned items on the day. An item finished in the
 * meantime is excluded and keeps its moved time — it is a record now, and its
 * `done_at` is real regardless of what its planned time says. Logged as the
 * rule in the track's `DEVIATIONS.md`.
 */

export class UndoRefusedError extends Error {
  readonly reason: "expired" | "later_shift" | "done_anyway";

  constructor(reason: "expired" | "later_shift" | "done_anyway") {
    super(`shift undo refused: ${reason}`);
    this.name = "UndoRefusedError";
    this.reason = reason;
  }
}

export type UndoEligibility =
  | { canUndo: true }
  | { canUndo: false; reason: "expired" | "later_shift" | "done_anyway" };

/** Why a shift can or cannot be undone — SC-02 reads this to decide the action. */
export async function shiftUndoEligibility(
  rls: RlsClient,
  userId: string,
  shiftId: string,
  now: Date = new Date(),
): Promise<UndoEligibility | null> {
  return rls.execute(async (tx) => {
    const [shift] = await tx
      .select({
        id: shifts.id,
        at: shifts.at,
        dayId: shifts.dayId,
        deltaMin: shifts.deltaMin,
      })
      .from(shifts)
      .where(and(eq(shifts.id, shiftId), eq(shifts.userId, userId)))
      .limit(1);

    if (!shift) return null;

    if (now.getTime() - shift.at.getTime() > SHIFT_UNDO_WINDOW_MS) {
      return { canUndo: false, reason: "expired" };
    }

    const [later] = await tx
      .select({ id: shifts.id })
      .from(shifts)
      .where(
        and(
          eq(shifts.userId, userId),
          eq(shifts.dayId, shift.dayId),
          gt(shifts.at, shift.at),
        ),
      )
      .limit(1);

    if (later) return { canUndo: false, reason: "later_shift" };

    /*
     * *Do it anyway* (USE-2) returns a cut item to `assigned`. So a miss that
     * still points at this shift, on a row no longer `cut_by_shift`, is
     * something the person went and did after the shift cut it.
     */
    const [doneAnyway] = await tx
      .select({ id: dayItems.id })
      .from(misses)
      .innerJoin(dayItems, eq(dayItems.id, misses.dayItemId))
      .where(
        and(
          eq(misses.userId, userId),
          eq(misses.shiftId, shift.id),
          eq(dayItems.assignmentState, "assigned"),
        ),
      )
      .limit(1);

    if (doneAnyway) return { canUndo: false, reason: "done_anyway" };

    return { canUndo: true };
  });
}

export async function undoShift(
  rls: RlsClient,
  userId: string,
  shiftId: string,
  now: Date = new Date(),
): Promise<{ restored: number; uncut: number }> {
  const eligibility = await shiftUndoEligibility(rls, userId, shiftId, now);
  if (eligibility === null) throw new Error("no such shift");
  if (!eligibility.canUndo) throw new UndoRefusedError(eligibility.reason);

  return rls.execute(async (tx) => {
    const [shift] = await tx
      .select({ id: shifts.id, dayId: shifts.dayId, deltaMin: shifts.deltaMin })
      .from(shifts)
      .where(and(eq(shifts.id, shiftId), eq(shifts.userId, userId)))
      .limit(1);

    if (!shift) throw new Error("no such shift");

    // The cut items, back to being part of the day.
    const cutRows = await tx
      .select({ dayItemId: misses.dayItemId })
      .from(misses)
      .where(and(eq(misses.userId, userId), eq(misses.shiftId, shift.id)));

    const cutIds = cutRows.map((row) => row.dayItemId);

    if (cutIds.length > 0) {
      await tx
        .delete(misses)
        .where(and(eq(misses.userId, userId), eq(misses.shiftId, shift.id)));

      await tx
        .update(dayItems)
        .set({
          assignmentState: "assigned",
          completionState: "upcoming",
          updatedAt: now,
        })
        .where(and(eq(dayItems.userId, userId), inArray(dayItems.id, cutIds)));
    }

    /*
     * The moved set, derived rather than stored — see the header. A cut item
     * has just been restored to `upcoming`, and it was never moved, so it is
     * excluded explicitly.
     */
    const moveBack = and(
      eq(dayItems.userId, userId),
      eq(dayItems.dayId, shift.dayId),
      eq(dayItems.scheduling, "soft"),
      eq(dayItems.assignmentState, "assigned"),
      eq(dayItems.completionState, "upcoming"),
      isNull(dayItems.deferredAt),
      ...(cutIds.length === 0
        ? []
        : [sql`${dayItems.id} <> ALL(ARRAY[${sql.join(cutIds.map((id) => sql`${id}::uuid`), sql`, `)}])`]),
    );

    const restored = await tx
      .update(dayItems)
      .set({
        scheduledStart: sql`${dayItems.scheduledStart} - make_interval(mins => ${shift.deltaMin})`,
        scheduledEnd: sql`CASE WHEN ${dayItems.scheduledEnd} IS NULL THEN NULL ELSE ${dayItems.scheduledEnd} - make_interval(mins => ${shift.deltaMin}) END`,
        updatedAt: now,
      })
      .where(moveBack)
      .returning({ id: dayItems.id });

    await tx.delete(shifts).where(eq(shifts.id, shift.id));

    return { restored: restored.length, uncut: cutIds.length };
  });
}
