/**
 * The starter library, for one person — UX v1.1 §12.4, by block.
 *
 * THIS IS THE ONLY PLACE THE STARTER SET IS WRITTEN AS ROWS. A real person
 * gets them through `habit.createFromStarterLibrary` (DYN-4), from the same
 * `STARTER_LIBRARY` in `@syn/constants` — the landscape screen offers them,
 * and each one becomes a library entry only when the person ticks it. This
 * file exists so the smoke account has a library without an app running.
 *
 * WHAT IS SEEDED: the twelve recommended morning habits (the landscape a daily
 * menu picks from), the recommended prep habits, and the wind-down set —
 * including the two `placed` rows the app places itself (§7.1): *Journal*
 * as a habit the wind-down template stacks, *Phone away* as the
 * `task_appointment` the devices-off marker points at. One extra row the
 * library does not carry: *Orient*, the three-minute item the orient block
 * holds (§3.1 — "one item and it is the person's own words"; the words are
 * `users.orient_passage`, the minutes are this habit's).
 *
 * Idempotent by "already has habits → do nothing": the rows are a unit, and
 * `habits` has no natural key to conflict on (two habits may share a title).
 *
 * The categories are the seed's own choice, not the document's: FR-02 says
 * the starter set has NO category so a first library stays uncluttered. They
 * exist here only so the smoke account exercises the category join.
 */
import { STARTER_LIBRARY } from "@syn/constants";
import { eq } from "drizzle-orm";

import { categories, habits } from "../schema";
import type { Db } from "../client";

/** Category names for the smoke account. Not product copy — see the note above. */
const SEED_CATEGORIES = [
  { name: "Health", colorKey: "leaf" as const },
  { name: "Deep work", colorKey: "sky" as const },
];

/** Which starter habits land in *Health*, BY TITLE (a positional slice drifted once). */
const HEALTH_HABIT_TITLES = new Set([
  "Cold shower",
  "Meditate",
  "Stretch",
  "Walk",
  "Breath work",
]);

/** Orient's one item — the seed's own row, not the library's. */
const ORIENT_HABIT = { title: "Orient", rangeMin: 3, rangeMax: 3, importance: 6 };

export async function seedStarterLibrary(
  db: Db,
  userId: string,
): Promise<{ categories: number; habits: number }> {
  const existing = await db
    .select({ id: habits.id })
    .from(habits)
    .where(eq(habits.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return { categories: 0, habits: 0 };
  }

  const insertedCategories = await db
    .insert(categories)
    .values(SEED_CATEGORIES.map((category) => ({ ...category, userId })))
    .onConflictDoNothing({ target: [categories.userId, categories.name] })
    .returning({ id: categories.id, name: categories.name });

  const healthId = insertedCategories.find((row) => row.name === "Health")?.id;

  const rows = [
    ...STARTER_LIBRARY.morning
      .filter((entry) => entry.recommended)
      .map((entry) => ({ ...entry, blockKind: "morning" as const })),
    ...STARTER_LIBRARY.prep
      .filter((entry) => entry.recommended)
      .map((entry) => ({ ...entry, blockKind: "prep" as const })),
    ...STARTER_LIBRARY.wind_down
      .filter((entry) => entry.recommended)
      .map((entry) => ({ ...entry, blockKind: "wind_down" as const })),
    { ...ORIENT_HABIT, recommended: true, blockKind: "orient" as const },
  ];

  const insertedHabits = await db
    .insert(habits)
    .values(
      rows.map((habit) => ({
        blockKind: habit.blockKind,
        categoryId:
          habit.blockKind === "morning" && HEALTH_HABIT_TITLES.has(habit.title)
            ? (healthId ?? null)
            : null,
        durationMaxMin: habit.rangeMax,
        durationMinMin: habit.rangeMin,
        lifePriority: habit.importance,
        title: habit.title,
        // The devices-off marker is a task, not a habit (§7.1): it is never
        // marked done, and it must not appear in the library's reporting.
        type:
          habit.title === "Phone away" ? ("task_appointment" as const) : ("habit" as const),
        userId,
      })),
    )
    .returning({ id: habits.id });

  return {
    categories: insertedCategories.length,
    habits: insertedHabits.length,
  };
}
