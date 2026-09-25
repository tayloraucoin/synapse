import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import { dayItems, habits } from "@syn/db";
import type { HabitVersion, IconValue, WorkoutLocation } from "@syn/types";
import { wallClockToInstant, weekdayIndex } from "@syn/utils";

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

  await writeTravelRows(
    tx,
    userId,
    dayId,
    block,
    { id: workoutId, lifePriority: workout.lifePriority, thereTitle: travelDestination(workout.location) },
    { thereMin: workout.travelThereMin, backMin: workout.travelBackMin, planned: workout.planTravel },
    { kind: "stacked" },
  );

  return { workoutId };
}

/**
 * Where a parent's two travel rows go (UX v1.3 TD-27):
 *
 *  - `stacked` — a workout's: sort 0 and sort 2 around the workout at sort 1,
 *    flowing in the training block's stack (TD-12, as RUN-6 wrote them).
 *  - `pinned` — a fixture's: a pin that ends where the fixture starts and a
 *    pin that starts where it ends, in the fixture's block, because that block
 *    holds other items and only a pin sits exactly beside a pin. A *there*
 *    that would start before midnight of the day is not written.
 */
export type TravelPosition =
  | { kind: "stacked" }
  | { kind: "pinned"; date: string; timezone: string; startMin: number; durationMin: number };

/**
 * The two travel rows beside a parent item — a workout (TD-12) or a fixture
 * (UX v1.3 R51, TD-27): *→ {there}* and *← Home*, `origin = travel`,
 * `parent_item_id` = the parent. One writer for both parents, so the rows are
 * always the same rows. The parent's own length never includes them. A row is
 * recognised by its arrow (the *there* row's title starts `→`); an untouched
 * row is rewritten, a touched one is a record and left, and an untouched end
 * whose travel is no longer planned goes.
 */
export async function writeTravelRows(
  tx: Tx,
  userId: string,
  dayId: string,
  block: Pick<BlockRow, "id" | "items">,
  parent: { id: string; lifePriority: number; thereTitle: string },
  travel: { thereMin: number; backMin: number; planned: boolean },
  position: TravelPosition,
): Promise<void> {
  const ends = block.items.filter((item) => item.origin === "travel" && item.parentItemId === parent.id);
  const isThereRow = (item: { title: string }) => item.title.startsWith("→");

  type End = { key: "there" | "back"; minutes: number; sortOrder: number; pinAtMin: number | null };
  const wanted: End[] = [];
  const pinned = position.kind === "pinned";
  if (travel.planned && travel.thereMin > 0) {
    const pinAtMin = pinned ? position.startMin - travel.thereMin : null;
    if (pinAtMin === null || pinAtMin >= 0) {
      wanted.push({ key: "there", minutes: travel.thereMin, sortOrder: 0, pinAtMin });
    }
  }
  if (travel.planned && travel.backMin > 0) {
    wanted.push({
      key: "back",
      minutes: travel.backMin,
      sortOrder: 2,
      pinAtMin: pinned ? position.startMin + position.durationMin : null,
    });
  }

  for (const end of wanted) {
    const isThere = end.key === "there";
    const found = ends.find((item) => isThereRow(item) === isThere);
    const pinStart =
      position.kind === "pinned" && end.pinAtMin !== null
        ? wallClockToInstant(position.date, minutesToClock(end.pinAtMin), position.timezone)
        : null;
    const row = {
      title: isThere ? `→ ${parent.thereTitle}` : "← Home",
      icon: isThere ? TRAVEL_THERE_ICON : TRAVEL_BACK_ICON,
      type: "task_appointment" as const,
      quantityUnit: null,
      reflectionAxes: [] as string[],
      notesPreflight: null,
      timeMode: "fixed_time" as const,
      durationMin: end.minutes,
      gapBeforeMin: 0,
      pinned: pinStart !== null,
      priority: parent.lifePriority,
      scheduling: "soft" as const,
      sortOrder: end.sortOrder,
      templateNameSnapshot: null,
      habitId: null,
      templateSlotId: null,
      origin: "travel" as const,
      parentItemId: parent.id,
      ...(pinStart === null
        ? {}
        : { scheduledStart: pinStart, scheduledEnd: new Date(pinStart.getTime() + end.minutes * 60_000) }),
    };
    if (found && isUntouchedItem(found)) {
      await tx.update(dayItems).set({ ...row, updatedAt: new Date() }).where(eq(dayItems.id, found.id));
    } else if (!found) {
      await tx.insert(dayItems).values({
        ...row,
        userId,
        dayId,
        dayBlockId: block.id,
        // A pinned row's time is decided at build, as its fixture's is (TD-5).
        ...(pinStart === null ? {} : { originalScheduledStart: pinStart }),
      });
    }
  }

  // Travel no longer planned: the untouched ends go; a touched one is a record.
  const stale = ends.filter(
    (item) => isUntouchedItem(item) && !wanted.some((end) => (end.key === "there") === isThereRow(item)),
  );
  if (stale.length > 0) {
    await tx.delete(dayItems).where(inArray(dayItems.id, stale.map((item) => item.id)));
  }
}

/** Minutes from the day's midnight → "H:mm", past 24:00 allowed (the zone helper rolls it). */
function minutesToClock(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = ((minutes % 60) + 60) % 60;
  return `${hour}:${String(minute).padStart(2, "0")}`;
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
