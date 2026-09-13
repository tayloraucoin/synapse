import { and, eq } from "drizzle-orm";

import { dayItems, days, type RlsClient } from "@syn/db";
import type { HabitDayEditInput } from "@syn/validators";
import { wallClockToInstant } from "@syn/utils";

import { reflowBlock, type ReflowOverflow } from "./reflow-block";

/**
 * *Edit today's* — UX v1.1 §6.4, R8, R21 (DYN-6). "Changes the day, not the
 * habit."
 *
 * FOUR FIELDS, ONE ROW. *Takes* writes `duration_min` with no clamp — the
 * range is muted text on the sheet, never a limit. *At* with a clock pins
 * the item for today (`pinned = true` at that instant); *In the stack*
 * unpins it and the block re-flows around where it sits. *Priority today*
 * is this row's. *Leave out today* is the same state a trim leaves — not
 * assigned, no miss, *Bring back* undoes it (USE-7).
 *
 * THE HABIT IS NEVER WRITTEN. A fixture is not a habit's day and is refused;
 * a done or running item's length and time are the record and are refused
 * too — its priority and leaving it out are still the person's to change.
 */

export type EditHabitDayCode = "not_found" | "fixture" | "done" | "closed";

export class EditHabitDayError extends Error {
  readonly code: EditHabitDayCode;
  constructor(code: EditHabitDayCode) {
    super(code);
    this.name = "EditHabitDayError";
    this.code = code;
  }
}

export async function editHabitDay(
  rls: RlsClient,
  userId: string,
  input: HabitDayEditInput,
  now: Date = new Date(),
): Promise<{ itemId: string; overflow: ReflowOverflow | null }> {
  return rls.execute(async (tx) => {
    const [item] = await tx
      .select({
        id: dayItems.id,
        dayBlockId: dayItems.dayBlockId,
        origin: dayItems.origin,
        pinned: dayItems.pinned,
        durationMin: dayItems.durationMin,
        scheduledStart: dayItems.scheduledStart,
        completionState: dayItems.completionState,
        doneAt: dayItems.doneAt,
        date: days.date,
        timezone: days.timezone,
        closedAt: days.closedAt,
      })
      .from(dayItems)
      .innerJoin(days, eq(days.id, dayItems.dayId))
      .where(and(eq(dayItems.id, input.itemId), eq(dayItems.userId, userId)))
      .limit(1);

    if (!item) throw new EditHabitDayError("not_found");
    if (item.origin === "fixture") throw new EditHabitDayError("fixture");
    if (item.closedAt !== null) throw new EditHabitDayError("closed");

    const settled = item.doneAt !== null || item.completionState === "active";
    if (settled && (input.durationMin !== undefined || input.at !== undefined)) {
      throw new EditHabitDayError("done");
    }

    const patch: Record<string, unknown> = { updatedAt: now };
    const durationMin = input.durationMin ?? item.durationMin ?? 0;
    if (input.durationMin !== undefined) patch.durationMin = input.durationMin;
    if (input.priority !== undefined) patch.priority = input.priority;
    if (input.leaveOut !== undefined) {
      patch.assignmentState = input.leaveOut ? "not_assigned" : "assigned";
    }

    let start = item.scheduledStart;
    if (input.at?.kind === "clock") {
      start = wallClockToInstant(String(item.date), input.at.clock, item.timezone);
      patch.pinned = true;
      patch.scheduledStart = start;
    } else if (input.at?.kind === "stack") {
      patch.pinned = false;
    }
    if (start !== null && (input.durationMin !== undefined || input.at?.kind === "clock")) {
      patch.scheduledEnd = new Date(start.getTime() + durationMin * 60_000);
    }

    await tx.update(dayItems).set(patch).where(eq(dayItems.id, item.id));

    // The block re-flows on save (§6.4): around a new pin, after a new length.
    const overflow =
      item.dayBlockId === null
        ? null
        : (await reflowBlock(tx, userId, item.dayBlockId, { now })).overflow;

    return { itemId: item.id, overflow };
  });
}
