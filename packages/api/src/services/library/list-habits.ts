import { asc, eq, inArray, isNull, and } from "drizzle-orm";

import { categories, habits, type RlsClient } from "@syn/db";
import type {
  BlockKind,
  CategoryView,
  HabitSummaryView,
  ItemType,
} from "@syn/types";

import {
  HABIT_SUMMARY_COLUMNS,
  toCategoryView,
  toHabitSummaryView,
  type CategoryRow,
} from "./to-view";

/**
 * The library, and the categories it is grouped by, in one call.
 *
 * BOTH IN ONE RESPONSE because LB-02 needs the categories to render its chip
 * picker, LB-01 needs them to render the chips on rows, and CT-02's "first
 * unused hue" default is computed from them. Three consumers, one round trip —
 * and the duplicate-name note stays a client-side check over a list that is
 * already loaded rather than a query per keystroke.
 *
 * SORTING IS THE DOCUMENT'S: within a group, by category name then title, with
 * uncategorised last (Epic 1 LB-01) — unless the caller asks for `created`
 * order, which the first run's setup lists do (UX v1.3 R65). It is done here rather than in SQL
 * because "uncategorised last" is a rule about a null, and expressing it in
 * `ORDER BY` costs a `CASE` that reads worse than the sentence it implements.
 */

export type HabitListResult = {
  habits: HabitSummaryView[];
  categories: Array<CategoryView & { id: string; habitCount: number }>;
};

export type ListHabitsOptions = {
  includeArchived?: boolean;
  /** Only this block; `null` for *anywhere* (UX v1.1 §4.15). Omit for all. */
  blockKind?: BlockKind | null;
  /** Only these types — the block screens ask for workouts or focuses. */
  types?: readonly ItemType[];
  /**
   * `library` (the default) — category name, then title; `created` — the
   * order the person made them, oldest first (UX v1.3 R65, DAY-2). The setup
   * lists ask for `created`; the library and every other caller do not.
   */
  order?: "library" | "created";
};

export async function listHabits(
  rls: RlsClient,
  userId: string,
  options: ListHabitsOptions = {},
): Promise<HabitListResult> {
  return rls.execute(async (tx) => {
    const categoryRows = await tx
      .select({
        id: categories.id,
        name: categories.name,
        colorKey: categories.colorKey,
      })
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.name));

    const conditions = [eq(habits.userId, userId)];
    if (!options.includeArchived) conditions.push(isNull(habits.archivedAt));
    if (options.blockKind !== undefined) {
      conditions.push(
        options.blockKind === null
          ? isNull(habits.blockKind)
          : eq(habits.blockKind, options.blockKind),
      );
    }
    if (options.types && options.types.length > 0) {
      conditions.push(inArray(habits.type, [...options.types]));
    }

    const habitRows = await tx
      .select({ ...HABIT_SUMMARY_COLUMNS, createdAt: habits.createdAt })
      .from(habits)
      .where(and(...conditions));

    const byId = new Map<string, CategoryRow>(
      categoryRows.map((row) => [row.id, row]),
    );

    if (options.order === "created") {
      habitRows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    const views = habitRows.map((row) =>
      toHabitSummaryView(row, byId),
    );

    if (options.order !== "created") views.sort(compareForLibrary);

    const habitCounts = new Map<string, number>();
    for (const row of habitRows) {
      if (row.categoryId === null || row.archivedAt !== null) continue;
      habitCounts.set(
        row.categoryId,
        (habitCounts.get(row.categoryId) ?? 0) + 1,
      );
    }

    return {
      habits: views,
      categories: categoryRows.map((row) => ({
        ...toCategoryView(row),
        id: row.id,
        habitCount: habitCounts.get(row.id) ?? 0,
      })),
    };
  });
}

/** Category name, then title; uncategorised last. Epic 1 LB-01. */
function compareForLibrary(
  a: HabitSummaryView,
  b: HabitSummaryView,
): number {
  const aName = a.category?.name ?? null;
  const bName = b.category?.name ?? null;

  if (aName === null && bName !== null) return 1;
  if (aName !== null && bName === null) return -1;
  if (aName !== null && bName !== null && aName !== bName) {
    return aName.localeCompare(bName);
  }
  return a.title.localeCompare(b.title);
}
