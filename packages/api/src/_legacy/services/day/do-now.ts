import { and, eq } from "drizzle-orm";

import { dayItems, days, type RlsClient } from "@syn/db";

import { reflowBlock, type ReflowOverflow } from "./reflow-block";
import { startTimerInTx } from "./timer";

/**
 * *Do now* — UX v1.1 §6.3 (1), R8, R23 (DYN-6).
 *
 * ONE TRANSACTION, THREE THINGS: the item's `scheduled_start` moves to now,
 * its timer starts, and every later item in its block slides by the minimum
 * so nothing overlaps. A ghost stays at the original time — the column is
 * never touched — and no reason is asked.
 *
 * IT ASKS BEFORE IT PUSHES. The slide is walked first as a dry run; if it
 * would push a soft item into a pin or past the next block's start, nothing
 * is written and the overflow is named so the sheet can say *Stretch no
 * longer fits before work* with **Do now anyway** · **Adjust instead**.
 * *Anyway* makes the overflow item not assigned today and slides the rest.
 *
 * PINS AND FIXTURES DO NOT MOVE (R22) — refused here, not only in the sheet.
 * A running item is already now: no-op. An unconfirmed day has no *Do now*:
 * the item sheet's button is absent and the service refuses too.
 */

export type DoNowCode = "fixed" | "unconfirmed" | "closed" | "not_found";

export class DoNowError extends Error {
  readonly code: DoNowCode;
  constructor(code: DoNowCode) {
    super(code);
    this.name = "DoNowError";
    this.code = code;
  }
}

export type DoNowResult = {
  itemId: string;
  /** What the slide would push out — `null` when everything fits. */
  overflow: ReflowOverflow | null;
  /** True when the rows were written (no overflow, or *anyway*). */
  applied: boolean;
  startedAt: Date | null;
};

export async function doNow(
  rls: RlsClient,
  userId: string,
  input: { itemId: string; anyway?: boolean },
  context: { todayKey: string; now: Date },
): Promise<DoNowResult> {
  return rls.execute(async (tx) => {
    const [item] = await tx
      .select({
        id: dayItems.id,
        dayId: dayItems.dayId,
        dayBlockId: dayItems.dayBlockId,
        pinned: dayItems.pinned,
        origin: dayItems.origin,
        durationMin: dayItems.durationMin,
        completionState: dayItems.completionState,
        doneAt: dayItems.doneAt,
        confirmedAt: days.confirmedAt,
        closedAt: days.closedAt,
      })
      .from(dayItems)
      .innerJoin(days, eq(days.id, dayItems.dayId))
      .where(and(eq(dayItems.id, input.itemId), eq(dayItems.userId, userId)))
      .limit(1);

    if (!item) throw new DoNowError("not_found");
    if (item.pinned || item.origin === "fixture") throw new DoNowError("fixed");
    if (item.closedAt !== null) throw new DoNowError("closed");
    if (item.confirmedAt === null) throw new DoNowError("unconfirmed");

    // Already happening: nothing to move.
    if (item.completionState === "active") {
      return { itemId: item.id, overflow: null, applied: false, startedAt: null };
    }

    const now = context.now;
    const end = new Date(now.getTime() + (item.durationMin ?? 0) * 60_000);

    // The move, then the slide it forces — walked first, written second.
    await tx
      .update(dayItems)
      .set({ scheduledStart: now, scheduledEnd: end, updatedAt: now })
      .where(eq(dayItems.id, item.id));

    if (item.dayBlockId === null) {
      // A row the backfill has not reached: it moves alone.
      const started = await startTimerInTx(tx, userId, item.id, context);
      return { itemId: item.id, overflow: null, applied: true, startedAt: started.startedAt };
    }

    const preview = await reflowBlock(tx, userId, item.dayBlockId, {
      from: item.id,
      hold: [item.id],
      dryRun: true,
      now,
    });

    if (preview.overflow !== null && !input.anyway) {
      // Nothing is written: the transaction rolls the move back with the throw.
      throw new DoNowOverflow(preview.overflow);
    }

    if (preview.overflow !== null) {
      // *Do now anyway*: the overflow item is left out today (v1 R1).
      await tx
        .update(dayItems)
        .set({ assignmentState: "not_assigned", updatedAt: now })
        .where(eq(dayItems.id, preview.overflow.itemId));
    }

    await reflowBlock(tx, userId, item.dayBlockId, { from: item.id, hold: [item.id], now });
    const started = await startTimerInTx(tx, userId, item.id, context);

    return {
      itemId: item.id,
      overflow: preview.overflow,
      applied: true,
      startedAt: started.startedAt,
    };
  }).catch((error: unknown) => {
    if (error instanceof DoNowOverflow) {
      return { itemId: input.itemId, overflow: error.overflow, applied: false, startedAt: null };
    }
    throw error;
  });
}

/** Thrown inside the transaction so the tentative move rolls back with it. */
class DoNowOverflow extends Error {
  readonly overflow: ReflowOverflow;
  constructor(overflow: ReflowOverflow) {
    super("do now would overflow");
    this.name = "DoNowOverflow";
    this.overflow = overflow;
  }
}
