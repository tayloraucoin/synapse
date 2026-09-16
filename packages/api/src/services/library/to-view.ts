import { habits } from "@syn/db";
import type {
  CategoryView,
  HabitSummaryView,
  HabitVersion,
  IconValue,
  WorkoutLocation,
} from "@syn/types";

/**
 * Rows → view models. `@syn/ui` never sees a row (placement rule 5).
 *
 * There is no wake anchor since UX v1.1 R11 (the orient frame is the wake
 * moment); v1.0's *wake-up* tag left with `users.wake_anchor_habit_id` in
 * `0006` (DYN-21).
 *
 * UX v1.2 (RUN-3): the summary carries versions (§3.5) and, for a workout,
 * its type, location and travel (§3.7). `HABIT_SUMMARY_COLUMNS` is the one
 * select every list and read uses, so a column added here reaches every view.
 */

export const HABIT_SUMMARY_COLUMNS = {
  id: habits.id,
  title: habits.title,
  icon: habits.icon,
  type: habits.type,
  durationMinMin: habits.durationMinMin,
  durationMaxMin: habits.durationMaxMin,
  lifePriority: habits.lifePriority,
  archivedAt: habits.archivedAt,
  categoryId: habits.categoryId,
  blockKind: habits.blockKind,
  weeklyTarget: habits.weeklyTarget,
  typicalDays: habits.typicalDays,
  versions: habits.versions,
  workoutType: habits.workoutType,
  location: habits.location,
  travelThereMin: habits.travelThereMin,
  travelBackMin: habits.travelBackMin,
  planTravel: habits.planTravel,
} as const;

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
  /** UX v1.2 §11.2 (0007). */
  versions: HabitVersion[] | null;
  workoutType: string | null;
  location: WorkoutLocation | null;
  travelThereMin: number;
  travelBackMin: number;
  planTravel: boolean;
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
  const isWorkout = row.type === "workout";

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
    versions: row.versions && row.versions.length > 0 ? row.versions : null,
    // The workout columns are read only off a workout, so a stray value on a
    // habit (there should be none — the service refuses them) never renders.
    workoutType: isWorkout ? row.workoutType : null,
    location: isWorkout ? row.location : null,
    travel: isWorkout
      ? {
          thereMin: row.travelThereMin,
          backMin: row.travelBackMin,
          planned: row.planTravel,
        }
      : null,
  };
}
