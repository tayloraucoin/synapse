import { and, eq } from "drizzle-orm";

import { dayItems, type RlsClient } from "@syn/db";

import { ensureDay } from "./one-off";

/**
 * Put a carried task on the next day — REV-2's finish, and nothing else.
 *
 * IT RUNS ON FINISH, NEVER ON TAP. *Carry forward* records a decision; this
 * acts on it. Creating tomorrow's row the moment someone taps would mean a
 * person who carried three tasks and then chose *Finish later* had already
 * changed tomorrow — and undoing that would need a fourth state nobody asked
 * for. The decision is reversible until the review is finished, which is what
 * *Finish later* means.
 *
 * THE COPY IS UNSCHEDULED. Yesterday's 09:00 is not a plan for today; the item
 * arrives as something to do, and the person places it if they want to. The
 * time it originally had is not lost — it is on the row it came from, which
 * `carried_from_item_id` still points at.
 *
 * IT IS IDEMPOTENT ON `carried_from_item_id`. A double finish, or a retry
 * after a timeout, must not put the same task on tomorrow twice.
 */
export async function carryItemForward(
  rls: RlsClient,
  userId: string,
  itemId: string,
  toDateKey: string,
): Promise<{ created: boolean; id: string | null }> {
  return rls.execute(async (tx) => {
    const [source] = await tx
      .select({
        id: dayItems.id,
        habitId: dayItems.habitId,
        title: dayItems.title,
        icon: dayItems.icon,
        type: dayItems.type,
        durationMin: dayItems.durationMin,
        priority: dayItems.priority,
        scheduling: dayItems.scheduling,
        quantityUnit: dayItems.quantityUnit,
        reflectionAxes: dayItems.reflectionAxes,
        notesPreflight: dayItems.notesPreflight,
        templateNameSnapshot: dayItems.templateNameSnapshot,
      })
      .from(dayItems)
      .where(and(eq(dayItems.id, itemId), eq(dayItems.userId, userId)))
      .limit(1);

    if (!source) return { created: false, id: null };

    const day = await ensureDay(tx, userId, toDateKey);

    const [existing] = await tx
      .select({ id: dayItems.id })
      .from(dayItems)
      .where(
        and(
          eq(dayItems.userId, userId),
          eq(dayItems.dayId, day.id),
          eq(dayItems.carriedFromItemId, source.id),
        ),
      )
      .limit(1);

    if (existing) return { created: false, id: existing.id };

    const rows = await tx
      .insert(dayItems)
      .values({
        userId,
        dayId: day.id,
        habitId: source.habitId,
        // The snapshots travel with it, so the carried row reads the same as
        // the one it came from even if the habit is renamed tomorrow.
        title: source.title,
        icon: source.icon,
        type: source.type,
        durationMin: source.durationMin,
        priority: source.priority,
        scheduling: source.scheduling,
        quantityUnit: source.quantityUnit,
        reflectionAxes: source.reflectionAxes,
        notesPreflight: source.notesPreflight,
        templateNameSnapshot: source.templateNameSnapshot,
        origin: "carried",
        carriedFromItemId: source.id,
        timeMode: "unscheduled",
        scheduledStart: null,
        scheduledEnd: null,
        originalScheduledStart: null,
      })
      .returning({ id: dayItems.id });

    return { created: true, id: rows[0]?.id ?? null };
  });
}
