import { and, eq, gt } from "drizzle-orm";

import { dayItems, misses, shifts, type RlsClient } from "@syn/db";
import { SHIFT_UNDO_WINDOW_MS } from "@syn/constants";

/**
 * Whether a `shifts` row can still be undone — cross-cutting §8.1, Epic 2
 * §12 call 6; since DYN-21 the one rule Adjust's undo reads (`undoAdjust`
 * in `adjust-day.ts`). v1.0's `undoShift` reversal left with its sheet.
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
