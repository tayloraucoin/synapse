import { and, eq, inArray, sql } from "drizzle-orm";

import { dayItems, misses, shifts, type RlsClient } from "@syn/db";
import type { MissTier } from "@syn/types";
import { computeShiftFit, dayWindow } from "@syn/utils";

import {
  DayChangedError,
  fingerprintOf,
  readShiftContext,
  toShiftItem,
} from "./shift-fit";

/**
 * *Shift and cut {c}* — official spec §5.6, §6.5.
 *
 * IT RECOMPUTES BEFORE IT WRITES. The sheet sent a delta, a reason and a cut
 * list built from a preview that may be seconds or minutes old; between then
 * and now an item may have been finished, which changes what moves. So the fit
 * is computed again here, from the same function, inside the transaction that
 * does the writing — and if the day has changed, nothing is written and the
 * sheet re-previews.
 *
 * A CUT IS A MISS WITH THE SHIFT'S OWN REASON AND TIER (§6.5, §0.3 R1). That
 * inheritance is the reason a shift cannot be applied without answering *Why?*:
 * the resolver scores a cut item by `misses.tier`, so an unattributed shift
 * would produce a day full of misses nobody explained. `resolved_by = shift`
 * and `shift_id` are what let the Day Review say *Changed from the shift's
 * reason* if the person later edits one.
 *
 * ONLY THE OVERFLOWING MAY BE CUT. A cut list naming an item that fits is
 * either a stale preview or a caller doing something else; either way this
 * refuses to mark it missed. Cutting is a consequence of not fitting, never a
 * free-standing action.
 *
 * NOTHING HERE TOUCHES A HARD, DONE, OR RUNNING ROW. The moved set comes from
 * `computeShiftFit`, which excludes all three by construction, and the update
 * is filtered to exactly those ids.
 */

export type ApplyShiftInput = {
  date: string;
  deltaMin: number;
  reason: { reasonKey: string | null; reasonText: string | null; tier: MissTier };
  cut: string[];
  /** From the preview. Absent skips the staleness check (the toast's re-shift). */
  fingerprint?: string;
};

export async function applyShift(
  rls: RlsClient,
  userId: string,
  input: ApplyShiftInput,
  now: Date = new Date(),
): Promise<{ shiftId: string; moved: number; cut: number }> {
  const context = await readShiftContext(rls, userId, input.date);
  if (context === null) throw new Error("no such day");
  if (context.day.closedAt !== null) throw new Error("day is closed");

  if (
    input.fingerprint !== undefined &&
    input.fingerprint !== fingerprintOf(context.rows)
  ) {
    throw new DayChangedError();
  }

  const items = context.rows.map(toShiftItem);
  const window = dayWindow(
    input.date,
    context.day.timezone,
    context.day.dayCloseTime,
  );

  const fit = computeShiftFit({
    items,
    deltaMin: input.deltaMin,
    windowEnd: window.end,
    now,
  });

  const overflowIds = new Set(fit.overflow.map((entry) => entry.id));
  const cutIds = input.cut.filter((id) => overflowIds.has(id));
  const cutSet = new Set(cutIds);

  // A cut item is not also moved: it is leaving the day, not sliding down it.
  const movedIds = fit.movingIds.filter((id) => !cutSet.has(id));

  return rls.execute(async (tx) => {
    const [shift] = await tx
      .insert(shifts)
      .values({
        userId,
        dayId: context.day.id,
        at: now,
        deltaMin: input.deltaMin,
        reasonKey: input.reason.reasonKey,
        reasonText: input.reason.reasonText,
        tier: input.reason.tier,
      })
      .returning({ id: shifts.id });

    if (!shift) throw new Error("shift insert returned no row");

    if (movedIds.length > 0) {
      /*
       * Moved in SQL rather than row by row: one statement, and the interval
       * is applied to whatever the column currently holds, so a second shift
       * on the same day compounds rather than recomputing from a stale read.
       */
      await tx
        .update(dayItems)
        .set({
          scheduledStart: sql`${dayItems.scheduledStart} + make_interval(mins => ${input.deltaMin})`,
          scheduledEnd: sql`CASE WHEN ${dayItems.scheduledEnd} IS NULL THEN NULL ELSE ${dayItems.scheduledEnd} + make_interval(mins => ${input.deltaMin}) END`,
          updatedAt: now,
        })
        .where(
          and(eq(dayItems.userId, userId), inArray(dayItems.id, movedIds)),
        );
    }

    if (cutIds.length > 0) {
      await tx
        .update(dayItems)
        .set({
          assignmentState: "cut_by_shift",
          completionState: "missed",
          updatedAt: now,
        })
        .where(and(eq(dayItems.userId, userId), inArray(dayItems.id, cutIds)));

      for (const id of cutIds) {
        // The miss inherits the shift's attribution wholesale (§6.5).
        await tx
          .insert(misses)
          .values({
            userId,
            dayItemId: id,
            tier: input.reason.tier,
            reasonKey: input.reason.reasonKey,
            reasonText: input.reason.reasonText,
            resolvedBy: "shift",
            shiftId: shift.id,
          })
          .onConflictDoUpdate({
            target: misses.dayItemId,
            set: {
              tier: input.reason.tier,
              reasonKey: input.reason.reasonKey,
              reasonText: input.reason.reasonText,
              resolvedBy: "shift",
              shiftId: shift.id,
              updatedAt: now,
            },
          });
      }
    }

    return { shiftId: shift.id, moved: movedIds.length, cut: cutIds.length };
  });
}
