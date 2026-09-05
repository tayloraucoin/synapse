/**
 * One template — *Morning*, anchored at 07:00, holding the first five starter
 * habits as fixed slots.
 *
 * Offsets are 0, 2, 10, 30 and 60 minutes from the anchor, and each slot's
 * duration is the midpoint of its habit's range, so the template is a
 * plausible morning rather than five things at once. Every slot is
 * `fixed_time`; the wake-up habit is `hard` because it is the anchor of the
 * day and must not move under a shift (official spec §5.6), and the rest are
 * `soft`.
 *
 * Idempotent by "a template named Morning already exists → do nothing".
 */
import { eq } from "drizzle-orm";

import { habits, templateSlots, templates } from "../schema";
import type { Db } from "../client";

const TEMPLATE_NAME = "Morning";
const ANCHOR_TIME = "07:00";

/** Minutes from the anchor, one per slot, in order. */
const SLOT_OFFSETS = [0, 2, 10, 30, 60];

function midpoint(min: number | null, max: number | null): number {
  if (min === null || max === null) return 15;
  return Math.round((min + max) / 2);
}

export async function seedMorningTemplate(
  db: Db,
  userId: string,
): Promise<{ slots: number; template: number }> {
  const existing = await db
    .select({ id: templates.id })
    .from(templates)
    .where(eq(templates.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return { slots: 0, template: 0 };
  }

  const library = await db
    .select({
      id: habits.id,
      durationMaxMin: habits.durationMaxMin,
      durationMinMin: habits.durationMinMin,
      lifePriority: habits.lifePriority,
    })
    .from(habits)
    .where(eq(habits.userId, userId))
    .orderBy(habits.createdAt)
    .limit(SLOT_OFFSETS.length);

  if (library.length === 0) {
    return { slots: 0, template: 0 };
  }

  const [template] = await db
    .insert(templates)
    .values({
      anchorTime: ANCHOR_TIME,
      name: TEMPLATE_NAME,
      typicalDays: [0, 1, 2, 3, 4],
      userId,
      weeklyTarget: 5,
    })
    .returning({ id: templates.id });

  if (template === undefined) {
    return { slots: 0, template: 0 };
  }

  const slots = library.map((habit, index) => ({
    durationMin: midpoint(habit.durationMinMin, habit.durationMaxMin),
    habitId: habit.id,
    offsetStartMin: SLOT_OFFSETS[index] ?? 0,
    // The wake-up habit is the day's anchor: hard, so a shift never moves it.
    scheduling: index === 0 ? ("hard" as const) : ("soft" as const),
    sortOrder: index,
    templateId: template.id,
    timeMode: "fixed_time" as const,
    userId,
  }));

  const insertedSlots = await db
    .insert(templateSlots)
    .values(slots)
    .returning({ id: templateSlots.id });

  return { slots: insertedSlots.length, template: 1 };
}
