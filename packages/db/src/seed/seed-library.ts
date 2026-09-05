/**
 * The starter library, for one person: two categories and the ten habits of
 * Epic 1 FR-02.
 *
 * THIS IS THE ONLY PLACE THE STARTER SET IS WRITTEN AS ROWS. A real person
 * gets them through SET-4's procedure, from the same `STARTER_HABITS` in
 * `@syn/constants` — the chooser offers them, and each one becomes a library
 * entry only when the person adds it. This file exists so the smoke account
 * has a library without an app running.
 *
 * Idempotent by "already has habits → do nothing": the ten rows are a unit,
 * and `habits` has no natural key to conflict on (two habits may share a title
 * — a person can have two things called "Read" if they want).
 *
 * The categories are the seed's own choice, not the document's: FR-02 says the
 * starter set has NO category so a first library stays uncluttered. They exist
 * here only so the smoke account exercises the category join.
 */
import { STARTER_HABITS } from "@syn/constants";
import { eq } from "drizzle-orm";

import { categories, habits, users } from "../schema";
import type { Db } from "../client";

/** Category names for the smoke account. Not product copy — see the note above. */
const SEED_CATEGORIES = [
  { name: "Health", colorKey: "leaf" as const },
  { name: "Deep work", colorKey: "sky" as const },
];

/** The first four starter habits go in *Health*. */
const HEALTH_HABIT_COUNT = 4;

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

  const insertedHabits = await db
    .insert(habits)
    .values(
      STARTER_HABITS.map((habit, index) => ({
        categoryId: index < HEALTH_HABIT_COUNT ? (healthId ?? null) : null,
        durationMaxMin: habit.rangeMax,
        durationMinMin: habit.rangeMin,
        lifePriority: habit.importance,
        title: habit.title,
        type: "habit" as const,
        userId,
      })),
    )
    .returning({ id: habits.id, title: habits.title });

  // The wake anchor has one home (SET-1): the column on `users`, never a flag
  // on the habit.
  const anchorTitle = STARTER_HABITS.find((habit) => habit.wakeAnchor)?.title;
  const anchorId = insertedHabits.find((row) => row.title === anchorTitle)?.id;

  if (anchorId !== undefined) {
    await db
      .update(users)
      .set({ wakeAnchorHabitId: anchorId })
      .where(eq(users.id, userId));
  }

  return {
    categories: insertedCategories.length,
    habits: insertedHabits.length,
  };
}
