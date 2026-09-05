import { asc, eq, isNull, and } from "drizzle-orm";

import { categories, habits, users, type RlsClient } from "@syn/db";
import type { CategoryView, HabitSummaryView } from "@syn/types";

import {
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
 * uncategorised last (Epic 1 LB-01). It is done here rather than in SQL
 * because "uncategorised last" is a rule about a null, and expressing it in
 * `ORDER BY` costs a `CASE` that reads worse than the sentence it implements.
 */

export type HabitListResult = {
  habits: HabitSummaryView[];
  categories: Array<CategoryView & { id: string; habitCount: number }>;
};

export async function listHabits(
  rls: RlsClient,
  userId: string,
  options: { includeArchived?: boolean } = {},
): Promise<HabitListResult> {
  return rls.execute(async (tx) => {
    const [account] = await tx
      .select({ wakeAnchorHabitId: users.wakeAnchorHabitId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const categoryRows = await tx
      .select({
        id: categories.id,
        name: categories.name,
        colorKey: categories.colorKey,
      })
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.name));

    const habitRows = await tx
      .select({
        id: habits.id,
        title: habits.title,
        icon: habits.icon,
        type: habits.type,
        durationMinMin: habits.durationMinMin,
        durationMaxMin: habits.durationMaxMin,
        lifePriority: habits.lifePriority,
        archivedAt: habits.archivedAt,
        categoryId: habits.categoryId,
      })
      .from(habits)
      .where(
        options.includeArchived
          ? eq(habits.userId, userId)
          : and(eq(habits.userId, userId), isNull(habits.archivedAt)),
      );

    const byId = new Map<string, CategoryRow>(
      categoryRows.map((row) => [row.id, row]),
    );

    const views = habitRows.map((row) =>
      toHabitSummaryView(row, byId, account?.wakeAnchorHabitId ?? null),
    );

    views.sort(compareForLibrary);

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
