import { and, eq, ne } from "drizzle-orm";

import { dayItems, days, habits, templateSlots, type RlsClient } from "@syn/db";

import { reflowBlock, type ReflowOverflow } from "./reflow-block";

/**
 * *One of*, after the pick — UX v1.1 §6.3 (3): "for an alternates member, a
 * two-segment control at the top (*Meal-prepped · Cook it*) so the choice can
 * be changed after the pick; changing it re-flows prep."
 *
 * THE ROW IS REWRITTEN, NOT REPLACED. An alternates group materialises its
 * chosen member only (R23 — nothing derived from the pick exists before the
 * pick), so switching means the one row takes the OTHER slot's habit: its
 * id, title, icon, length and priority, and the slot it came from. The row's
 * id, its place in the block and its `original_scheduled_start` stay — the
 * record is annotated, never rewritten. A done or running member is the
 * record and is refused; a fixture is not a member.
 */

export type ChooseAlternateCode = "not_found" | "not_alternate" | "done" | "closed";

export class ChooseAlternateError extends Error {
  readonly code: ChooseAlternateCode;
  constructor(code: ChooseAlternateCode) {
    super(code);
    this.name = "ChooseAlternateError";
    this.code = code;
  }
}

export async function chooseAlternate(
  rls: RlsClient,
  userId: string,
  input: { itemId: string },
  now: Date = new Date(),
): Promise<{ itemId: string; title: string; overflow: ReflowOverflow | null }> {
  return rls.execute(async (tx) => {
    const [item] = await tx
      .select({
        id: dayItems.id,
        dayBlockId: dayItems.dayBlockId,
        templateSlotId: dayItems.templateSlotId,
        alternatesId: dayItems.alternatesId,
        scheduledStart: dayItems.scheduledStart,
        doneAt: dayItems.doneAt,
        completionState: dayItems.completionState,
        closedAt: days.closedAt,
      })
      .from(dayItems)
      .innerJoin(days, eq(days.id, dayItems.dayId))
      .where(and(eq(dayItems.id, input.itemId), eq(dayItems.userId, userId)))
      .limit(1);

    if (!item) throw new ChooseAlternateError("not_found");
    if (item.closedAt !== null) throw new ChooseAlternateError("closed");
    if (item.alternatesId === null || item.templateSlotId === null) {
      throw new ChooseAlternateError("not_alternate");
    }
    if (item.doneAt !== null || item.completionState === "active") {
      throw new ChooseAlternateError("done");
    }

    const [current] = await tx
      .select({ templateId: templateSlots.templateId, group: templateSlots.alternatesGroup })
      .from(templateSlots)
      .where(eq(templateSlots.id, item.templateSlotId))
      .limit(1);
    if (!current || current.group === null) throw new ChooseAlternateError("not_alternate");

    const [other] = await tx
      .select({
        slotId: templateSlots.id,
        durationMin: templateSlots.durationMin,
        priorityOverride: templateSlots.priorityOverride,
        scheduling: templateSlots.scheduling,
        habitId: habits.id,
        title: habits.title,
        icon: habits.icon,
        type: habits.type,
        lifePriority: habits.lifePriority,
        quantityUnit: habits.quantityUnit,
        reflectionAxes: habits.reflectionAxes,
        notesPreflight: habits.defaultNotesPreflight,
      })
      .from(templateSlots)
      .innerJoin(habits, eq(habits.id, templateSlots.habitId))
      .where(
        and(
          eq(templateSlots.userId, userId),
          eq(templateSlots.templateId, current.templateId),
          eq(templateSlots.alternatesGroup, current.group),
          ne(templateSlots.id, item.templateSlotId),
        ),
      )
      .limit(1);
    if (!other) throw new ChooseAlternateError("not_alternate");

    await tx
      .update(dayItems)
      .set({
        habitId: other.habitId,
        templateSlotId: other.slotId,
        title: other.title,
        icon: other.icon,
        type: other.type,
        quantityUnit: other.quantityUnit,
        reflectionAxes: other.reflectionAxes,
        notesPreflight: other.notesPreflight,
        durationMin: other.durationMin,
        priority: other.priorityOverride ?? other.lifePriority,
        scheduling: other.scheduling,
        scheduledEnd:
          item.scheduledStart === null
            ? null
            : new Date(item.scheduledStart.getTime() + other.durationMin * 60_000),
        updatedAt: now,
      })
      .where(eq(dayItems.id, item.id));

    // The block re-flows around the new length (§6.3).
    const overflow =
      item.dayBlockId === null
        ? null
        : (await reflowBlock(tx, userId, item.dayBlockId, { now })).overflow;

    return { itemId: item.id, title: other.title, overflow };
  });
}
