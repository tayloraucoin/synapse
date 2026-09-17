import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import { dayItems, habits } from "@syn/db";
import type { HabitVersion, IconValue, WorkoutLocation } from "@syn/types";
import { weekdayIndex } from "@syn/utils";

import type { BlockRow, Tx } from "./materialize-day";
import { isUntouchedItem } from "./untouched";

/**
 * A habit as a pick-made or plan-made item — the snapshot a `day_items` row
 * takes from its habit when no template slot mediates (UX v1.1 §11.11).
 *
 * Moved out of `confirm-day.ts` in RUN-5 so `prefill-week.ts` (a plan's
 * workout at the week build) and `confirm-day.ts` (the pick's) import the
 * same four helpers downward instead of each other. UX v1.2 adds the habit's
 * versions (TD-11): a version-aware caller resolves `versionKey` here too.
 */

export type HabitLite = {
  id: string;
  title: string;
  icon: IconValue;
  type: "habit" | "task_appointment" | "workout" | "deep_work";
  lifePriority: number;
  durationMinMin: number | null;
  durationMaxMin: number | null;
  quantityUnit: string | null;
  reflectionAxes: string[];
  defaultNotesPreflight: string | null;
  typicalDays: number[] | null;
  weeklyTarget: number | null;
  /** UX v1.2 §3.5 — up to three named lengths; the first is the default. */
  versions: HabitVersion[] | null;
  /** UX v1.2 §3.7 — a workout's where and travel (TD-12). */
  location: WorkoutLocation | null;
  travelThereMin: number;
  travelBackMin: number;
  planTravel: boolean;
};

export const HABIT_LITE = {
  id: habits.id,
  title: habits.title,
  icon: habits.icon,
  type: habits.type,
  lifePriority: habits.lifePriority,
  durationMinMin: habits.durationMinMin,
  durationMaxMin: habits.durationMaxMin,
  quantityUnit: habits.quantityUnit,
  reflectionAxes: habits.reflectionAxes,
  defaultNotesPreflight: habits.defaultNotesPreflight,
  typicalDays: habits.typicalDays,
  weeklyTarget: habits.weeklyTarget,
  versions: habits.versions,
  location: habits.location,
  travelThereMin: habits.travelThereMin,
  travelBackMin: habits.travelBackMin,
  planTravel: habits.planTravel,
} as const;

/** The rotation's typical length: the range floor, else its midpoint, else an hour. */
export function workoutLength(habit: {
  durationMinMin: number | null;
  durationMaxMin: number | null;
}): number {
  if (habit.durationMinMin !== null) return habit.durationMinMin;
  if (habit.durationMaxMin !== null) return habit.durationMaxMin;
  return 60;
}

export function midpoint(min: number | null, max: number | null): number {
  if (min === null && max === null) return 15;
  if (min === null) return max as number;
  if (max === null) return min;
  return Math.round((min + max) / 2);
}

export async function readHabits(
  tx: Tx,
  userId: string,
  ids: readonly string[],
): Promise<Map<string, HabitLite>> {
  if (ids.length === 0) return new Map();
  const rows = await tx
    .select(HABIT_LITE)
    .from(habits)
    .where(and(eq(habits.userId, userId), inArray(habits.id, [...ids])));
  return new Map(rows.map((row) => [row.id, row]));
}

/** Today's workout by the rotation's typical days — the pick's default. */
export async function typicalWorkoutFor(
  tx: Tx,
  userId: string,
  date: string,
): Promise<HabitLite | null> {
  const weekday = weekdayIndex(date);
  const rows = await tx
    .select(HABIT_LITE)
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.type, "workout"), isNull(habits.archivedAt)))
    .orderBy(asc(habits.createdAt));
  return rows.find((row) => (row.typicalDays ?? []).includes(weekday)) ?? null;
}

/**
 * A version's minutes — UX v1.2 §3.5, TD-11. The named key when the habit
 * has it; the DEFAULT version (the first) when the habit has versions and no
 * key was asked; null when the habit has no versions or the key is unknown,
 * so the caller falls back to the range and writes no `version_key`.
 */
export function resolveVersion(
  habit: Pick<HabitLite, "versions">,
  versionKey: string | null | undefined,
): { key: string; minutes: number } | null {
  const versions = habit.versions;
  if (!versions || versions.length === 0) return null;
  const chosen =
    versionKey === undefined || versionKey === null
      ? versions[0]
      : versions.find((version) => version.key === versionKey);
  return chosen ? { key: chosen.key, minutes: chosen.minutes } : null;
}

/* -------------------------------------------------------- the workout -- */

/** Where a travel row goes — the location's word, or *Out* for a workout with no location. [COPY — needs Vesper sign-off] */
function travelDestination(location: WorkoutLocation | null): string {
  switch (location) {
    case "gym":
      return "Gym";
    case "outside":
      return "Outside";
    default:
      return "Out";
  }
}

const TRAVEL_THERE_ICON: IconValue = { kind: "curated", value: "arrow-right", colorKey: null };
const TRAVEL_BACK_ICON: IconValue = { kind: "curated", value: "arrow-left", colorKey: null };

/** True when the day should carry travel rows beside this workout (UX v1.2 R35). */
export function hasPlannedTravel(workout: Pick<HabitLite, "planTravel" | "travelThereMin" | "travelBackMin">): boolean {
  return workout.planTravel && (workout.travelThereMin > 0 || workout.travelBackMin > 0);
}

/**
 * The workout on its training block — and, when the travel is planned, the
 * two rows beside it (UX v1.2 §3.7, TD-12). One writer for the pick
 * (`confirmDay`) and the week build (`applyPlanToDay`), so the three rows are
 * always the same three rows:
 *
 *   sort 0  → {Gym}   travel there   origin `travel`, parent = the workout
 *   sort 1  the workout               origin `template`
 *   sort 2  ← Home    travel back    origin `travel`, parent = the workout
 *
 * The workout's `duration_min` is its own length; the travel is never added
 * to it. Touched rows are left alone (annotate, never rewrite); a travel
 * row that exists for a workout whose travel is no longer planned stays if
 * touched and goes if untouched. Every row is an item in the block's stack —
 * `stackBlock` is unchanged.
 */
export async function writeWorkoutRows(
  tx: Tx,
  userId: string,
  dayId: string,
  block: Pick<BlockRow, "id" | "items">,
  workout: HabitLite,
): Promise<{ workoutId: string }> {
  const travel = hasPlannedTravel(workout);
  const existing = block.items.find((item) => item.type === "workout");
  const values = habitItem(workout, {
    durationMin: workoutLength(workout),
    sortOrder: travel && workout.travelThereMin > 0 ? 1 : 0,
    snapshot: null,
  });

  let workoutId: string;
  if (existing && isUntouchedItem(existing)) {
    await tx
      .update(dayItems)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(dayItems.id, existing.id));
    workoutId = existing.id;
  } else if (existing) {
    workoutId = existing.id;
  } else {
    const [row] = await tx
      .insert(dayItems)
      .values({ ...values, userId, dayId, dayBlockId: block.id })
      .returning({ id: dayItems.id });
    if (!row) throw new Error("day_items insert returned no row");
    workoutId = row.id;
  }

  const ends = block.items.filter(
    (item) => item.origin === "travel" && item.parentItemId === workoutId,
  );
  const wanted: Array<{ key: "there" | "back"; minutes: number; sortOrder: number }> = [];
  if (travel && workout.travelThereMin > 0) wanted.push({ key: "there", minutes: workout.travelThereMin, sortOrder: 0 });
  if (travel && workout.travelBackMin > 0) wanted.push({ key: "back", minutes: workout.travelBackMin, sortOrder: 2 });

  for (const end of wanted) {
    const isThere = end.key === "there";
    const found = ends.find((item) => (isThere ? item.sortOrder < 1 : item.sortOrder > 1));
    const row = {
      title: isThere ? `→ ${travelDestination(workout.location)}` : "← Home",
      icon: isThere ? TRAVEL_THERE_ICON : TRAVEL_BACK_ICON,
      type: "task_appointment" as const,
      quantityUnit: null,
      reflectionAxes: [] as string[],
      notesPreflight: null,
      timeMode: "fixed_time" as const,
      durationMin: end.minutes,
      gapBeforeMin: 0,
      pinned: false,
      priority: workout.lifePriority,
      scheduling: "soft" as const,
      sortOrder: end.sortOrder,
      templateNameSnapshot: null,
      habitId: null,
      templateSlotId: null,
      origin: "travel" as const,
      parentItemId: workoutId,
    };
    if (found && isUntouchedItem(found)) {
      await tx.update(dayItems).set({ ...row, updatedAt: new Date() }).where(eq(dayItems.id, found.id));
    } else if (!found) {
      await tx.insert(dayItems).values({ ...row, userId, dayId, dayBlockId: block.id });
    }
  }

  // Travel no longer planned: the untouched ends go; a touched one is a record.
  const stale = ends.filter(
    (item) =>
      isUntouchedItem(item) &&
      !wanted.some((end) => (end.key === "there" ? item.sortOrder < 1 : item.sortOrder > 1)),
  );
  if (stale.length > 0) {
    await tx.delete(dayItems).where(inArray(dayItems.id, stale.map((item) => item.id)));
  }

  return { workoutId };
}

/** A habit as a pick-made item: no slot, its own snapshot. */
export function habitItem(
  habit: HabitLite,
  input: { durationMin: number | null; sortOrder: number; snapshot: string | null; versionKey?: string | null },
) {
  return {
    title: habit.title,
    icon: habit.icon,
    type: habit.type,
    quantityUnit: habit.quantityUnit,
    reflectionAxes: habit.reflectionAxes,
    notesPreflight: habit.defaultNotesPreflight,
    timeMode: "fixed_time" as const,
    durationMin: input.durationMin,
    gapBeforeMin: 0,
    pinned: false,
    priority: habit.lifePriority,
    scheduling: "soft" as const,
    sortOrder: input.sortOrder,
    templateNameSnapshot: input.snapshot,
    habitId: habit.id,
    templateSlotId: null,
    origin: "template" as const,
    versionKey: input.versionKey ?? null,
  };
}
