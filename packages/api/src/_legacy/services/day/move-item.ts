import { and, eq, inArray, sql } from "drizzle-orm";

import { DRAG_SNAP_MIN } from "@syn/constants";
import { dayBlocks, dayItems, days, type RlsClient } from "@syn/db";
import { dayWindow, wallClockToInstant } from "@syn/utils";

import { minutesToClock } from "./materialize-day";
import { isFixedPoint, reflowBlock, type ReflowOverflow } from "./reflow-block";

/**
 * The Schedule's two drag writes — UX v1.1 §6.5, R22, R23 (DYN-6).
 *
 * A DRAG ON SOMETHING THAT HAS NOT HAPPENED IS A RE-PLAN: `scheduled_start`
 * moves, `original_scheduled_start` does not, and the item counts as *moved*
 * in Review — a count, never a score. Five-minute snap, so every time a
 * person reads off the axis is one they could have typed.
 *
 * DROPPING ONTO AN OCCUPIED TIME INSERTS: the moved item takes the minute,
 * and the occupant and everything after it re-stack beneath — never an
 * overlap, never a multitask by drop. That is `reflowBlock` with the moved
 * item held as a fixed point.
 *
 * PINS AND FIXTURES ARE REFUSED WITHOUT THE DIALOG'S ANSWER (`confirmed`);
 * a done item is the record and is refused outright. A band drag moves
 * every movable item in the block and the band itself by the same minutes;
 * the pins inside stay where they are. On the morning the sheet offers
 * Adjust first (§6.5) — the service is not the sheet's guard and allows it.
 */

export type MoveCode = "not_found" | "fixed" | "done" | "closed" | "past_close";

export class MoveError extends Error {
  readonly code: MoveCode;
  constructor(code: MoveCode) {
    super(code);
    this.name = "MoveError";
    this.code = code;
  }
}

function snap(minutes: number): number {
  return Math.round(minutes / DRAG_SNAP_MIN) * DRAG_SNAP_MIN;
}

export async function moveItem(
  rls: RlsClient,
  userId: string,
  input: { itemId: string; toMin: number; confirmed?: boolean },
  now: Date = new Date(),
): Promise<{ itemId: string; toMin: number; overflow: ReflowOverflow | null }> {
  return rls.execute(async (tx) => {
    const [item] = await tx
      .select({
        id: dayItems.id,
        dayBlockId: dayItems.dayBlockId,
        origin: dayItems.origin,
        pinned: dayItems.pinned,
        scheduling: dayItems.scheduling,
        durationMin: dayItems.durationMin,
        completionState: dayItems.completionState,
        doneAt: dayItems.doneAt,
        date: days.date,
        timezone: days.timezone,
        dayCloseTime: days.dayCloseTime,
        closedAt: days.closedAt,
      })
      .from(dayItems)
      .innerJoin(days, eq(days.id, dayItems.dayId))
      .where(and(eq(dayItems.id, input.itemId), eq(dayItems.userId, userId)))
      .limit(1);

    if (!item) throw new MoveError("not_found");
    if (item.closedAt !== null) throw new MoveError("closed");
    if (item.doneAt !== null || item.completionState === "done") throw new MoveError("done");
    if ((item.pinned || item.origin === "fixture") && input.confirmed !== true) {
      throw new MoveError("fixed");
    }

    const toMin = snap(input.toMin);
    const date = String(item.date);
    const start = wallClockToInstant(date, minutesToClock(toMin), item.timezone);
    const window = dayWindow(date, item.timezone, item.dayCloseTime);
    if (start.getTime() >= window.end.getTime()) throw new MoveError("past_close");

    const end = new Date(start.getTime() + (item.durationMin ?? 0) * 60_000);
    await tx
      .update(dayItems)
      .set({ scheduledStart: start, scheduledEnd: end, updatedAt: now })
      .where(eq(dayItems.id, item.id));

    // The occupant and the rest re-stack beneath the moved item.
    const overflow =
      item.dayBlockId === null
        ? null
        : (await reflowBlock(tx, userId, item.dayBlockId, { hold: [item.id], now })).overflow;

    return { itemId: item.id, toMin, overflow };
  });
}

export async function moveBlock(
  rls: RlsClient,
  userId: string,
  input: { blockId: string; deltaMin: number; confirmed?: boolean },
  now: Date = new Date(),
): Promise<{ blockId: string; deltaMin: number; moved: number }> {
  return rls.execute(async (tx) => {
    const [block] = await tx
      .select({
        id: dayBlocks.id,
        scheduledStart: dayBlocks.scheduledStart,
        scheduledEnd: dayBlocks.scheduledEnd,
        closedAt: days.closedAt,
      })
      .from(dayBlocks)
      .innerJoin(days, eq(days.id, dayBlocks.dayId))
      .where(and(eq(dayBlocks.id, input.blockId), eq(dayBlocks.userId, userId)))
      .limit(1);

    if (!block) throw new MoveError("not_found");
    if (block.closedAt !== null) throw new MoveError("closed");

    const deltaMin = snap(input.deltaMin);
    if (deltaMin === 0) return { blockId: block.id, deltaMin: 0, moved: 0 };

    const rows = await tx
      .select({
        id: dayItems.id,
        pinned: dayItems.pinned,
        origin: dayItems.origin,
        scheduling: dayItems.scheduling,
        completionState: dayItems.completionState,
        doneAt: dayItems.doneAt,
        assignmentState: dayItems.assignmentState,
        scheduledStart: dayItems.scheduledStart,
      })
      .from(dayItems)
      .where(and(eq(dayItems.dayBlockId, block.id), eq(dayItems.userId, userId)));

    // Every movable item — the five fixed kinds stay where they are.
    void input.confirmed;
    const movable = rows
      .filter(
        (row) =>
          row.assignmentState === "assigned" &&
          row.scheduledStart !== null &&
          !isFixedPoint(row),
      )
      .map((row) => row.id);

    if (movable.length > 0) {
      await tx
        .update(dayItems)
        .set({
          scheduledStart: sql`${dayItems.scheduledStart} + make_interval(mins => ${deltaMin})`,
          scheduledEnd: sql`CASE WHEN ${dayItems.scheduledEnd} IS NULL THEN NULL ELSE ${dayItems.scheduledEnd} + make_interval(mins => ${deltaMin}) END`,
          updatedAt: now,
        })
        .where(and(eq(dayItems.userId, userId), inArray(dayItems.id, movable)));
    }

    if (block.scheduledStart !== null) {
      await tx
        .update(dayBlocks)
        .set({
          scheduledStart: sql`${dayBlocks.scheduledStart} + make_interval(mins => ${deltaMin})`,
          scheduledEnd: sql`CASE WHEN ${dayBlocks.scheduledEnd} IS NULL THEN NULL ELSE ${dayBlocks.scheduledEnd} + make_interval(mins => ${deltaMin}) END`,
          updatedAt: now,
        })
        .where(eq(dayBlocks.id, block.id));
    }

    return { blockId: block.id, deltaMin, moved: movable.length };
  });
}
