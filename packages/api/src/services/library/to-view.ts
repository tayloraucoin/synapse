import type { CategoryView, HabitSummaryView, IconValue } from "@syn/types";

/**
 * Rows → view models. `@syn/ui` never sees a row (placement rule 5).
 *
 * There is no wake anchor since UX v1.1 R11 (the orient frame is the wake
 * moment); v1.0's *wake-up* tag left with `users.wake_anchor_habit_id` in
 * `0006` (DYN-21).
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
  /** UX v1.1 §11.3 (0004). */
  blockKind: HabitSummaryView["blockKind"];
  weeklyTarget: number | null;
  typicalDays: number[] | null;
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
    archived: row.archivedAt !== null,
    blockKind: row.blockKind,
    weeklyTarget: row.weeklyTarget,
    typicalDays:
      row.typicalDays === null
        ? null
        : (row.typicalDays as HabitSummaryView["typicalDays"]),
    // UX v1.2 (RUN-1): neutral until RUN-3 reads `0007`'s columns.
    versions: null,
    workoutType: null,
    location: null,
    travel: null,
  };
}
