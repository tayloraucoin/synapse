import { and, eq, isNull, notExists, sql } from "drizzle-orm";

import {
  dayItems,
  days,
  habits,
  timerSessions,
  type RlsClient,
} from "@syn/db";
import { DEFAULT_HABIT_ICON } from "@syn/db";
import { WORKOUT_TYPES } from "@syn/constants";
import type { IconValue } from "@syn/types";
import { toDateKey } from "@syn/utils";
import type {
  CreateStepInput,
  HabitFormInput,
  HabitPatchInput,
  RotationHabitInput,
  WorkoutDetailsInput,
  WorkoutPatchInput,
} from "@syn/validators";

/**
 * Create and update one habit, plus the two things a save can move: the wake
 * anchor (deprecated, UX v1.1 R11; still honoured until DYN-13), and the
 * snapshots on tomorrow's already-materialised items.
 *
 * THE FORM NEVER SETS `type` (UX v1.1 §4.15, W6). `createHabit` writes a
 * `habit`; `createRotationHabit` writes a `workout` or a `deep_work` focus
 * with its rotation (TD-3); one-offs and fixtures have their own services.
 * `updateHabit` never changes a row's type.
 *
 * UX v1.2 (RUN-3) ADDS THE PER-FACT WRITES. The setup cards write one
 * control at a time (§2 guardrail 5): `patchHabit` for a habit's priority,
 * range, versions, name or glyph; `patchWorkout` for a workout's rotation,
 * type, where and travel; `createStep` for a step before work (R33). The
 * type rules live here — the patch schemas cannot know the row's type.
 */

export type SavedHabit = { id: string };

/** A per-fact write on a row whose type does not carry that fact (UX v1.2 §3.5, §3.7). */
export class HabitRuleError extends Error {
  readonly code: "not_workout" | "versions_on_non_habit";
  constructor(code: HabitRuleError["code"]) {
    super(code);
    this.name = "HabitRuleError";
    this.code = code;
  }
}

/** The curated type's glyph, or null for *Other* / an unknown key (UX v1.2 §4.10). */
export function workoutTypeIcon(workoutType: string | null | undefined): IconValue | null {
  if (!workoutType || workoutType === "other") return null;
  return WORKOUT_TYPES.find((entry) => entry.key === workoutType)?.icon ?? null;
}

export async function createHabit(
  rls: RlsClient,
  userId: string,
  input: HabitFormInput,
): Promise<SavedHabit> {
  return rls.execute(async (tx) => {
    const [row] = await tx
      .insert(habits)
      .values({
        userId,
        title: input.title,
        type: "habit",
        icon: input.icon,
        categoryId: input.categoryId,
        blockKind: input.blockKind,
        durationMinMin: input.durationMinMin,
        durationMaxMin: input.durationMaxMin,
        lifePriority: input.lifePriority,
        quantityUnit: input.quantityUnit,
        reflectionAxes: input.reflectionAxes,
        defaultNotesPreflight: input.defaultNotesPreflight,
      })
      .returning({ id: habits.id });

    if (!row) throw new Error("habit insert returned no row");

    return { id: row.id };
  });
}

export async function updateHabit(
  rls: RlsClient,
  userId: string,
  id: string,
  input: HabitFormInput,
  timeZone: string,
): Promise<SavedHabit | null> {
  return rls.execute(async (tx) => {
    const [existing] = await tx
      .select({ id: habits.id, title: habits.title, icon: habits.icon })
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .limit(1);

    if (!existing) return null;

    const [row] = await tx
      .update(habits)
      .set({
        title: input.title,
        icon: input.icon,
        categoryId: input.categoryId,
        blockKind: input.blockKind,
        durationMinMin: input.durationMinMin,
        durationMaxMin: input.durationMaxMin,
        lifePriority: input.lifePriority,
        quantityUnit: input.quantityUnit,
        reflectionAxes: input.reflectionAxes,
        defaultNotesPreflight: input.defaultNotesPreflight,
        updatedAt: new Date(),
      })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning({ id: habits.id });

    if (!row) return null;

    const identityChanged =
      existing.title !== input.title ||
      JSON.stringify(existing.icon) !== JSON.stringify(input.icon);

    if (identityChanged) {
      await resnapshotUntouchedFutureItems(tx, userId, id, input, timeZone);
    }

    return { id: row.id };
  });
}

/**
 * A workout or a focus — a habit with a rotation (UX v1.1 §3.7, §3.8, TD-3).
 * The caller says which; the block follows the type. A focus has no range (a
 * work block is as long as the work day); a workout's typical length is its
 * range, min and max alike, until the person widens it in the library.
 */
export async function createRotationHabit(
  rls: RlsClient,
  userId: string,
  type: "workout" | "deep_work",
  input: RotationHabitInput,
  /** UX v1.2 §3.7 — a workout's type, where and travel; ignored for a focus. */
  details: Partial<WorkoutDetailsInput> & { icon?: IconValue | null } = {},
): Promise<SavedHabit> {
  if (type !== "workout" && hasWorkoutDetails(details)) {
    throw new HabitRuleError("not_workout");
  }
  const rows = await rls.execute((tx) =>
    tx
      .insert(habits)
      .values({
        userId,
        title: input.title,
        type,
        // A workout takes its type's glyph when the card sent none (§4.10);
        // a focus is the one noun where a blank is the honest default (§4.12).
        icon:
          details.icon ??
          (type === "workout" ? workoutTypeIcon(details.workoutType) : null) ??
          DEFAULT_HABIT_ICON,
        blockKind: type === "workout" ? "training" : "work",
        durationMinMin: type === "workout" ? input.durationMin : null,
        durationMaxMin: type === "workout" ? input.durationMin : null,
        lifePriority: input.lifePriority,
        weeklyTarget: input.weeklyTarget,
        typicalDays:
          input.typicalDays === null || input.typicalDays.length === 0
            ? null
            : [...new Set(input.typicalDays)].sort((a, b) => a - b),
        reflectionAxes: [],
        ...(type === "workout"
          ? {
              workoutType: details.workoutType ?? null,
              location: details.location ?? null,
              travelThereMin: details.travelThereMin ?? 0,
              travelBackMin: details.travelBackMin ?? 0,
              planTravel: details.planTravel ?? true,
            }
          : {}),
      })
      .returning({ id: habits.id }),
  );
  const row = rows[0];
  if (!row) throw new Error("habit insert returned no row");
  return { id: row.id };
}

function hasWorkoutDetails(details: Partial<WorkoutDetailsInput>): boolean {
  return (
    details.workoutType !== undefined ||
    details.location !== undefined ||
    details.travelThereMin !== undefined ||
    details.travelBackMin !== undefined ||
    details.planTravel !== undefined
  );
}

/**
 * A step before work — UX v1.2 R33, §4.7: a name, a glyph and a rough range,
 * nothing else. The same table as a habit (TD-3's reasoning), a different
 * word: `block_kind = prep`, priority 7, hard, exactly as DYN-11's screen 7
 * wrote its rows. The sheet never asks a block or a priority.
 */
export async function createStep(
  rls: RlsClient,
  userId: string,
  input: CreateStepInput,
): Promise<SavedHabit> {
  const rows = await rls.execute((tx) =>
    tx
      .insert(habits)
      .values({
        userId,
        title: input.title,
        type: "habit",
        icon: input.icon ?? { kind: "emoji", value: "📌" },
        blockKind: "prep",
        durationMinMin: input.rangeMin,
        durationMaxMin: input.rangeMax,
        lifePriority: 7,
        reflectionAxes: [],
      })
      .returning({ id: habits.id }),
  );
  const row = rows[0];
  if (!row) throw new Error("habit insert returned no row");
  return { id: row.id };
}

/**
 * One fact at a time on a habit (UX v1.2 §2 guardrail 5, §4.9). Versions are a
 * `habit`'s alone: a workout's variants are workouts, a focus has no length.
 * The range is never a clamp (R21) — `versions` and the range are written as
 * sent. A changed name or glyph re-snapshots tomorrow's untouched items, as
 * `updateHabit` does.
 */
export async function patchHabit(
  rls: RlsClient,
  userId: string,
  id: string,
  patch: HabitPatchInput,
  timeZone: string,
): Promise<SavedHabit | null> {
  return rls.execute(async (tx) => {
    const [existing] = await tx
      .select({
        id: habits.id,
        type: habits.type,
        title: habits.title,
        icon: habits.icon,
        quantityUnit: habits.quantityUnit,
        reflectionAxes: habits.reflectionAxes,
        defaultNotesPreflight: habits.defaultNotesPreflight,
      })
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .limit(1);
    if (!existing) return null;
    if (patch.versions !== undefined && existing.type !== "habit") {
      throw new HabitRuleError("versions_on_non_habit");
    }

    const [row] = await tx
      .update(habits)
      .set({
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.icon !== undefined ? { icon: patch.icon } : {}),
        ...(patch.lifePriority !== undefined ? { lifePriority: patch.lifePriority } : {}),
        ...(patch.durationMinMin !== undefined
          ? { durationMinMin: patch.durationMinMin }
          : {}),
        ...(patch.durationMaxMin !== undefined
          ? { durationMaxMin: patch.durationMaxMin }
          : {}),
        ...(patch.versions !== undefined ? { versions: patch.versions } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning({ id: habits.id });
    if (!row) return null;

    const title = patch.title ?? existing.title;
    const icon = patch.icon ?? existing.icon;
    const identityChanged =
      title !== existing.title ||
      JSON.stringify(icon) !== JSON.stringify(existing.icon);
    if (identityChanged) {
      await resnapshotUntouchedFutureItems(
        tx,
        userId,
        id,
        {
          title,
          icon,
          quantityUnit: existing.quantityUnit,
          reflectionAxes: existing.reflectionAxes,
          defaultNotesPreflight: existing.defaultNotesPreflight,
        },
        timeZone,
      );
    }

    return { id: row.id };
  });
}

/**
 * One fact at a time on a workout (UX v1.2 §4.10, §3.7). Refused on any other
 * type — the where and the travel are a workout's alone (R35). The travel is
 * stored beside the length and never added to it.
 */
export async function patchWorkout(
  rls: RlsClient,
  userId: string,
  id: string,
  patch: WorkoutPatchInput,
  timeZone: string,
): Promise<SavedHabit | null> {
  return rls.execute(async (tx) => {
    const [existing] = await tx
      .select({
        id: habits.id,
        type: habits.type,
        title: habits.title,
        icon: habits.icon,
      })
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .limit(1);
    if (!existing) return null;
    if (existing.type !== "workout") throw new HabitRuleError("not_workout");

    const [row] = await tx
      .update(habits)
      .set({
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.icon !== undefined ? { icon: patch.icon } : {}),
        ...(patch.weeklyTarget !== undefined ? { weeklyTarget: patch.weeklyTarget } : {}),
        ...(patch.typicalDays !== undefined
          ? {
              typicalDays:
                patch.typicalDays === null || patch.typicalDays.length === 0
                  ? null
                  : [...new Set(patch.typicalDays)].sort((a, b) => a - b),
            }
          : {}),
        ...(patch.durationMin !== undefined
          ? { durationMinMin: patch.durationMin, durationMaxMin: patch.durationMin }
          : {}),
        ...(patch.workoutType !== undefined ? { workoutType: patch.workoutType } : {}),
        ...(patch.location !== undefined ? { location: patch.location } : {}),
        ...(patch.travelThereMin !== undefined
          ? { travelThereMin: patch.travelThereMin }
          : {}),
        ...(patch.travelBackMin !== undefined ? { travelBackMin: patch.travelBackMin } : {}),
        ...(patch.planTravel !== undefined ? { planTravel: patch.planTravel } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning({ id: habits.id });
    if (!row) return null;

    const title = patch.title ?? existing.title;
    const icon = patch.icon ?? existing.icon;
    if (
      title !== existing.title ||
      JSON.stringify(icon) !== JSON.stringify(existing.icon)
    ) {
      await resnapshotUntouchedFutureItems(
        tx,
        userId,
        id,
        { title, icon, quantityUnit: null, reflectionAxes: [], defaultNotesPreflight: null },
        timeZone,
      );
    }

    return { id: row.id };
  });
}

export class RotationRuleError extends Error {
  readonly code: "not_rotation";
  constructor() {
    super("not_rotation");
    this.name = "RotationRuleError";
    this.code = "not_rotation";
  }
}

/**
 * The rotation fields may only be written on a workout or a focus; on a
 * habit they are meaningless and refused (v1.1 §11.3, AC 11).
 */
export async function updateRotationHabit(
  rls: RlsClient,
  userId: string,
  id: string,
  input: RotationHabitInput,
): Promise<SavedHabit | null> {
  return rls.execute(async (tx) => {
    const [existing] = await tx
      .select({ id: habits.id, type: habits.type })
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .limit(1);
    if (!existing) return null;
    if (existing.type !== "workout" && existing.type !== "deep_work") {
      throw new RotationRuleError();
    }

    const [row] = await tx
      .update(habits)
      .set({
        title: input.title,
        lifePriority: input.lifePriority,
        weeklyTarget: input.weeklyTarget,
        typicalDays:
          input.typicalDays === null || input.typicalDays.length === 0
            ? null
            : [...new Set(input.typicalDays)].sort((a, b) => a - b),
        ...(existing.type === "workout" && input.durationMin !== null
          ? { durationMinMin: input.durationMin, durationMaxMin: input.durationMin }
          : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning({ id: habits.id });
    return row ? { id: row.id } : null;
  });
}

/**
 * Rewrite `title` and `icon` on items that have not been lived yet.
 *
 * WHY THIS EXISTS. Cross-cutting §8.1 says past items keep their snapshot and
 * says nothing about tomorrow's, which are already materialised — so a person
 * who renames *Run* to *Morning run* would see *Run* on tomorrow's list and
 * file a bug. This is SET-4's `[PROVISIONAL — Vesper]` ruling.
 *
 * "UNTOUCHED" IS EXACTLY THIS PREDICATE, and every clause earns its place:
 * still assigned, still upcoming, never deferred, no timer ever started on it,
 * on a day that is not closed and is not in the past. Anything that fails one
 * of those is a record, and a record is annotated, never rewritten.
 *
 * RANGE AND IMPORTANCE ARE NOT PROPAGATED: a slot owns its duration and its
 * priority (official spec §3.5), so changing the habit's range must not reach
 * back through a plan someone made deliberately.
 */
async function resnapshotUntouchedFutureItems(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  userId: string,
  habitId: string,
  input: Pick<
    HabitFormInput,
    "title" | "icon" | "quantityUnit" | "reflectionAxes" | "defaultNotesPreflight"
  >,
  timeZone: string,
): Promise<void> {
  /*
   * [REVISIT: USE-1] `$today` is the CALENDAR date in the person's zone, not
   * `resolveDayKey`'s day key, because a day that has not closed yet is the
   * only thing this predicate cares about and `closed_at IS NULL` already
   * carries that. When USE-1 lands, switch to `resolveDayKey` so a day whose
   * close time has passed but whose row is not yet closed is excluded too.
   * SET-4's advisory note permits the simpler form and requires this marker.
   */
  const today = toDateKey(new Date(), timeZone);

  await tx
    .update(dayItems)
    .set({
      title: input.title,
      icon: input.icon,
      quantityUnit: input.quantityUnit,
      reflectionAxes: input.reflectionAxes,
      notesPreflight: input.defaultNotesPreflight,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(dayItems.userId, userId),
        eq(dayItems.habitId, habitId),
        eq(dayItems.assignmentState, "assigned"),
        eq(dayItems.completionState, "upcoming"),
        isNull(dayItems.deferredAt),
        notExists(
          tx
            .select({ one: sql`1` })
            .from(timerSessions)
            .where(eq(timerSessions.dayItemId, dayItems.id)),
        ),
        sql`${dayItems.dayId} IN (
          SELECT ${days.id} FROM ${days}
          WHERE ${days.userId} = ${userId}
            AND ${days.closedAt} IS NULL
            AND ${days.date} >= ${today}
        )`,
      ),
    );
}

