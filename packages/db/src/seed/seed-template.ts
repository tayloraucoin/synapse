/**
 * Taylor's day as block templates — UX v1.1 §3.1, §3.3, §3.5, §7.1 (DYN-5).
 *
 * Four templates, one per block kind the profile lays out:
 *
 *   Orient ....... one slot, *Orient*, 3 min (forward from wake)
 *   Before work .. *Breakfast* as a one-of — meal-prepped 10 (default) ·
 *                  cook it 30 — then *Walk* 15 (backward to work start;
 *                  8:35 · 8:50 against a 9:00 anchor with the default)
 *   Morning ...... opener · pool · closer: *Breath work* opens, *Stretch*
 *                  closes; the pool is the landscape, chosen at the pick.
 *                  Unused by the default week — the profile's overflow mode
 *                  is the daily menu, which pools the morning — but present
 *                  so the variant path has a routine to exercise.
 *   Wind-down .... a stack: *Journal* · *Read* · *Stretch*, backward to
 *                  lights-out. The devices-off marker is not a slot: the
 *                  materialiser places it after the journal from the profile.
 *
 * SLOTS ARE DURATION + GAP (TD-4); no offsets are written. `sort_order` is
 * dense per template, and the two one-of members share a position — the
 * same-position rule with its third answer (DYN-4).
 *
 * Idempotent by "any template exists → do nothing".
 */
import { eq } from "drizzle-orm";

import { habits, templateSlots, templates } from "../schema";
import type { Db } from "../client";

type SlotSeed = {
  title: string;
  durationMin: number;
  gapBeforeMin?: number;
  role?: "stack" | "opener" | "pool" | "closer";
  scheduling?: "hard" | "soft";
  /** Members share a position; exactly one is the default. */
  alternatesGroup?: string;
  alternatesDefault?: boolean;
};

type TemplateSeed = {
  name: string;
  kind: "orient" | "morning" | "prep" | "wind_down";
  flow: "forward" | "backward";
  structure: "stack" | "opener_pool_closer";
  slots: SlotSeed[];
};

const TEMPLATES: TemplateSeed[] = [
  {
    name: "Orient",
    kind: "orient",
    flow: "forward",
    structure: "stack",
    slots: [{ title: "Orient", durationMin: 3, scheduling: "hard" }],
  },
  {
    name: "Before work",
    kind: "prep",
    flow: "backward",
    structure: "stack",
    slots: [
      { title: "Breakfast", durationMin: 10, alternatesGroup: "breakfast", alternatesDefault: true },
      { title: "Breakfast", durationMin: 30, alternatesGroup: "breakfast", alternatesDefault: false },
      { title: "Walk", durationMin: 15 },
    ],
  },
  {
    name: "Morning",
    kind: "morning",
    flow: "forward",
    structure: "opener_pool_closer",
    slots: [
      { title: "Breath work", durationMin: 5, role: "opener" },
      { title: "Stretch", durationMin: 10, role: "closer" },
    ],
  },
  {
    name: "Wind-down",
    kind: "wind_down",
    flow: "backward",
    structure: "stack",
    slots: [
      { title: "Journal", durationMin: 10 },
      { title: "Read", durationMin: 20 },
      { title: "Stretch", durationMin: 10 },
    ],
  },
];

export async function seedBlockTemplates(
  db: Db,
  userId: string,
): Promise<{ slots: number; templates: number }> {
  const existing = await db
    .select({ id: templates.id })
    .from(templates)
    .where(eq(templates.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return { slots: 0, templates: 0 };
  }

  const library = await db
    .select({ id: habits.id, title: habits.title, blockKind: habits.blockKind })
    .from(habits)
    .where(eq(habits.userId, userId));

  const habitFor = (kind: TemplateSeed["kind"], title: string): string | null =>
    library.find((habit) => habit.title === title && habit.blockKind === kind)?.id ??
    library.find((habit) => habit.title === title)?.id ??
    null;

  let templateCount = 0;
  let slotCount = 0;

  for (const seed of TEMPLATES) {
    const [template] = await db
      .insert(templates)
      .values({
        name: seed.name,
        kind: seed.kind,
        flow: seed.flow,
        structure: seed.structure,
        userId,
      })
      .returning({ id: templates.id });
    if (template === undefined) continue;
    templateCount += 1;

    // Dense positions; one-of members share theirs.
    let position = -1;
    let lastGroup: string | null = null;
    const rows = [];
    for (const slot of seed.slots) {
      const habitId = habitFor(seed.kind, slot.title);
      if (habitId === null) continue;
      if (slot.alternatesGroup === undefined || slot.alternatesGroup !== lastGroup) {
        position += 1;
      }
      lastGroup = slot.alternatesGroup ?? null;
      rows.push({
        alternatesDefault: slot.alternatesDefault ?? false,
        alternatesGroup: slot.alternatesGroup ?? null,
        durationMin: slot.durationMin,
        gapBeforeMin: slot.gapBeforeMin ?? 0,
        habitId,
        role: slot.role ?? ("stack" as const),
        scheduling: slot.scheduling ?? ("soft" as const),
        sortOrder: position,
        templateId: template.id,
        timeMode: "fixed_time" as const,
        userId,
      });
    }

    if (rows.length === 0) continue;
    const inserted = await db
      .insert(templateSlots)
      .values(rows)
      .returning({ id: templateSlots.id });
    slotCount += inserted.length;
  }

  return { slots: slotCount, templates: templateCount };
}
