import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import { habits } from "@syn/db";
import type { HabitVersion, IconValue } from "@syn/types";
import { weekdayIndex } from "@syn/utils";

import type { Tx } from "./materialize-day";

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
