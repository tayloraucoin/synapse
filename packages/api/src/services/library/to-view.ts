import type { CategoryView, HabitSummaryView, IconValue } from "@syn/types";

/**
 * Rows → view models. `@syn/ui` never sees a row (placement rule 5).
 *
 * `isWakeAnchor` IS DERIVED HERE, not stored. `habits.is_wake_anchor` does not
 * exist: "at most one per user" is a fact about the person, so
 * `users.wake_anchor_habit_id` is its one home (SET-1's ruling). Every list
 * that renders the *wake-up* tag compares against that id, and this is the
 * only place that comparison is written.
 */

export type HabitRow = {
  id: string;
  title: string;
  icon: IconValue;
  type: HabitSummaryView["type"];
  durationMinMin: number | null;
  durationMaxMin: number | null;
  lifePriority: number;
  archivedAt: Date | null;
  categoryId: string | null;
};

export type CategoryRow = {
  id: string;
  name: string;
  colorKey: CategoryView["key"];
};

export function toCategoryView(row: CategoryRow): CategoryView {
  return { key: row.colorKey, name: row.name };
}

export function toHabitSummaryView(
  row: HabitRow,
  categories: ReadonlyMap<string, CategoryRow>,
  wakeAnchorHabitId: string | null,
): HabitSummaryView {
  const category =
    row.categoryId === null ? null : categories.get(row.categoryId);

  return {
    id: row.id,
    title: row.title,
    icon: row.icon,
    type: row.type,
    category: category ? toCategoryView(category) : null,
    durationMin: row.durationMinMin,
    durationMax: row.durationMaxMin,
    lifePriority: row.lifePriority,
    isWakeAnchor: row.id === wakeAnchorHabitId,
    archived: row.archivedAt !== null,
    // UX v1.1 (§11.3): null and null until DYN-2 adds the columns and DYN-4
    // reads them. A habit with no block is *anywhere*, which is what every
    // v1.0 habit is.
    blockKind: null,
    weeklyTarget: null,
    typicalDays: null,
  };
}
