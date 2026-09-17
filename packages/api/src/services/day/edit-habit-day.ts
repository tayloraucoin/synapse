import { and, eq } from "drizzle-orm";

import { dayItems, days, habits, type RlsClient } from "@syn/db";
import type { HabitDayEditInput } from "@syn/validators";
import { wallClockToInstant } from "@syn/utils";

import { resolveVersion } from "./habit-item";
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
 *
 * UX v1.2 (RUN-6). *Takes* may name one of the habit's versions instead
 * (§3.5, TD-11): the key is resolved on the habit, `duration_min` and
 * `version_key` are written together, and an unknown key is refused. A
 * hand-set `durationMin` in the same call wins and clears the key — a
 * hand-set length is not a version. A workout's *Leave out today* takes its
 * travel rows with it and *Bring back* returns them (§3.7, TD-12); a travel
 * row is the app's row and is not edited on its own.
 */

export type EditHabitDayCode =
  | "not_found"
  | "fixture"
  | "travel"
  | "done"
  | "closed"
  | "unknown_version";

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
        type: dayItems.type,
        habitId: dayItems.habitId,
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
    if (item.origin === "travel") throw new EditHabitDayError("travel");
    if (item.closedAt !== null) throw new EditHabitDayError("closed");

    const lengthChange = input.durationMin !== undefined || input.versionKey !== undefined;
    const settled = item.doneAt !== null || item.completionState === "active";
    if (settled && (lengthChange || input.at !== undefined)) {
      throw new EditHabitDayError("done");
    }

    const patch: Record<string, unknown> = { updatedAt: now };
    let durationMin = input.durationMin ?? item.durationMin ?? 0;
    if (input.durationMin !== undefined) {
      patch.durationMin = input.durationMin;
      patch.versionKey = null;
    } else if (input.versionKey !== undefined) {
      const [habit] = item.habitId
        ? await tx
            .select({ versions: habits.versions })
            .from(habits)
            .where(and(eq(habits.id, item.habitId), eq(habits.userId, userId)))
            .limit(1)
        : [];
      const version = habit ? resolveVersion(habit, input.versionKey) : null;
      if (!version) throw new EditHabitDayError("unknown_version");
      durationMin = version.minutes;
      patch.durationMin = version.minutes;
      patch.versionKey = version.key;
    }
    if (input.priority !== undefined) patch.priority = input.priority;
    if (input.leaveOut !== undefined) {
      patch.assignmentState = input.leaveOut ? "not_assigned" : "assigned";
      // A workout's travel rows go and come back with it (UX v1.2 §3.7).
      if (item.type === "workout") {
        await tx
          .update(dayItems)
          .set({ assignmentState: patch.assignmentState as "not_assigned" | "assigned", updatedAt: now })
          .where(and(eq(dayItems.parentItemId, item.id), eq(dayItems.origin, "travel")));
      }
    }

    let start = item.scheduledStart;
    if (input.at?.kind === "clock") {
      start = wallClockToInstant(String(item.date), input.at.clock, item.timezone);
      patch.pinned = true;
      patch.scheduledStart = start;
    } else if (input.at?.kind === "stack") {
      patch.pinned = false;
    }
    if (start !== null && (lengthChange || input.at?.kind === "clock")) {
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
