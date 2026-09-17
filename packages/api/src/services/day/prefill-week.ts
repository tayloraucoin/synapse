import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import { dayBlocks, dayItems, days, habits, templates, type RlsClient } from "@syn/db";
import type { BlockKind, DayShape, TrainingPlacement, WorkDayMode } from "@syn/types";
import { weekDates, weekdayIndex } from "@syn/utils";

import { plannedDayFor } from "../plan/day-plans";
import { readPreferencesInTx } from "../user/preferences";
import { habitItem, readHabits, workoutLength } from "./habit-item";
import {
  defaultTemplateFor,
  materializeInTx,
  readDayProfile,
  type BlockAssignment,
  type BlockRow,
  type DayProfile,
  type DayRow,
  type Tx,
} from "./materialize-day";

/**
 * The first week, pre-filled — UX v1.1 §4.13 (DYN-5), and *Copy last week*'s
 * replacement for a person whose plan is a profile rather than a week.
 *
 * NOTHING IS DECIDED THAT THE PROFILE DID NOT DECIDE. A work day gets its
 * blocks; the morning is pooled unless the overflow mode says which routine;
 * the workout and the focus land only on their typical days and only while
 * their weekly count has room; a *sometimes* day is structured and the pick
 * asks *Working today?*. Days already planned are left alone — the week
 * build's canvas is the person's, and pre-filling over it would be the app
 * second-guessing them.
 */

/**
 * The COMPUTED plan for one weekday from the profile and the rotations —
 * renamed from `DayPlan` in RUN-5 so the noun is free for the person's saved
 * `day_plans` (UX v1.2 §3.13), which `plannedDayFor` reads first.
 */
export type WeekdayDefaults = {
  shape: DayShape;
  blocks: BlockAssignment[];
  focusHabitId: string | null;
};

function workModeFor(profile: DayProfile, weekday: number): WorkDayMode {
  const key = String(weekday) as keyof NonNullable<DayProfile["workDays"]>;
  return profile.workDays?.[key] ?? (weekday < 5 ? "always" : "never");
}

/** How many days this week already carry the habit as workout or focus. */
async function usedThisWeek(
  tx: Tx,
  userId: string,
  dates: readonly string[],
): Promise<{ workouts: Map<string, number>; focuses: Map<string, number> }> {
  const workouts = new Map<string, number>();
  const focuses = new Map<string, number>();
  if (dates.length === 0) return { workouts, focuses };

  const dayRows = await tx
    .select({ id: days.id, focusId: days.workFocusHabitId })
    .from(days)
    .where(and(eq(days.userId, userId), inArray(days.date, [...dates])));
  for (const row of dayRows) {
    if (row.focusId !== null) focuses.set(row.focusId, (focuses.get(row.focusId) ?? 0) + 1);
  }

  if (dayRows.length > 0) {
    const workoutRows = await tx
      .select({ habitId: dayItems.habitId })
      .from(dayItems)
      .where(
        and(
          eq(dayItems.userId, userId),
          eq(dayItems.type, "workout"),
          inArray(
            dayItems.dayId,
            dayRows.map((row) => row.id),
          ),
        ),
      );
    for (const row of workoutRows) {
      if (row.habitId !== null) workouts.set(row.habitId, (workouts.get(row.habitId) ?? 0) + 1);
    }
  }

  return { workouts, focuses };
}

/**
 * The plan the profile implies for one date. Exported for `confirmDay`, which
 * needs the same answer when it sets a day nobody planned.
 */
export async function defaultPlanFor(
  tx: Tx,
  userId: string,
  profile: DayProfile,
  date: string,
  weekDatesForCounts: readonly string[] = [],
): Promise<WeekdayDefaults> {
  const weekday = weekdayIndex(date);
  const mode = workModeFor(profile, weekday);

  const orient = await defaultTemplateFor(tx, userId, "orient");
  const windDown = await defaultTemplateFor(tx, userId, "wind_down");

  if (mode === "never") {
    return {
      shape: "unstructured",
      blocks: [
        { kind: "orient", templateId: orient },
        { kind: "wind_down", templateId: windDown },
      ],
      focusHabitId: null,
    };
  }

  const used = await usedThisWeek(tx, userId, weekDatesForCounts);

  // The morning, by overflow mode (§3.10).
  let morning: string | null | "pool" = "pool";
  if (profile.overflowMode === "auto_trim") {
    morning = await defaultTemplateFor(tx, userId, "morning");
  } else if (profile.overflowMode === "variants") {
    const variants = await tx
      .select({
        id: templates.id,
        typicalDays: templates.typicalDays,
        weeklyTarget: templates.weeklyTarget,
      })
      .from(templates)
      .where(
        and(
          eq(templates.userId, userId),
          eq(templates.kind, "morning"),
          isNull(templates.archivedAt),
        ),
      )
      .orderBy(asc(templates.createdAt));
    const usedVariants = await tx
      .select({ templateId: dayBlocks.templateId })
      .from(dayBlocks)
      .innerJoin(days, eq(days.id, dayBlocks.dayId))
      .where(
        and(
          eq(dayBlocks.userId, userId),
          eq(dayBlocks.kind, "morning"),
          weekDatesForCounts.length === 0
            ? eq(days.date, date)
            : inArray(days.date, [...weekDatesForCounts]),
        ),
      );
    const count = new Map<string, number>();
    for (const row of usedVariants) {
      if (row.templateId !== null) count.set(row.templateId, (count.get(row.templateId) ?? 0) + 1);
    }
    const todays = variants.find(
      (variant) =>
        (variant.typicalDays ?? []).includes(weekday) &&
        (variant.weeklyTarget === null || (count.get(variant.id) ?? 0) < variant.weeklyTarget),
    );
    morning = todays?.id ?? "pool";
  }

  // The rotation: today's workout by its typical day, while its count has room.
  const rotation = await tx
    .select({
      id: habits.id,
      type: habits.type,
      typicalDays: habits.typicalDays,
      weeklyTarget: habits.weeklyTarget,
    })
    .from(habits)
    .where(
      and(
        eq(habits.userId, userId),
        inArray(habits.type, ["workout", "deep_work"]),
        isNull(habits.archivedAt),
      ),
    )
    .orderBy(asc(habits.createdAt));

  const todaysWorkout = rotation.find(
    (habit) =>
      habit.type === "workout" &&
      (habit.typicalDays ?? []).includes(weekday) &&
      (habit.weeklyTarget === null || (used.workouts.get(habit.id) ?? 0) < habit.weeklyTarget),
  );
  const todaysFocus = rotation.find(
    (habit) =>
      habit.type === "deep_work" &&
      (habit.typicalDays ?? []).includes(weekday) &&
      (habit.weeklyTarget === null || (used.focuses.get(habit.id) ?? 0) < habit.weeklyTarget),
  );

  const blocks: BlockAssignment[] = [
    { kind: "orient", templateId: orient },
    { kind: "morning", templateId: morning },
    { kind: "prep", templateId: await defaultTemplateFor(tx, userId, "prep") },
    { kind: "work", templateId: await defaultTemplateFor(tx, userId, "work") },
    { kind: "wind_down", templateId: windDown },
  ];
  if (todaysWorkout) blocks.push({ kind: "training", templateId: null });
  const activity = await defaultTemplateFor(tx, userId, "activity");
  if (activity !== null) blocks.push({ kind: "activity", templateId: activity });

  return { shape: "structured", blocks, focusHabitId: todaysFocus?.id ?? null };
}

/**
 * One date from the person's day plan for its weekday (UX v1.2 §3.13, §4.15,
 * TD-10, TD-21) — the body `prefillWeek` runs per weekday, and what RUN-13's
 * `week.applyPlan` exposes for one day. Returns null when no complete plan
 * claims the weekday, so the caller falls through to `defaultPlanFor`.
 *
 * WHAT THE PLAN DECIDES: the blocks (the three named lists; the work-day
 * type; orient and activity from the defaults), the four anchors and the
 * exclusions snapshotted onto the day, and the first placed workout. WHAT IT
 * LEAVES POOLED: the focus (typical days and counts, as before) and any list
 * the plan does not name (the morning falls to the overflow mode's default).
 *
 * ONE WORKOUT PER DAY in RUN-5: the record has one training block per day
 * (TD-2's unique index allows more; `materializeInTx` and `confirmDay`
 * assume one), so the plan's first placed workout lands and the rest are
 * logged as a follow-on. The plan stores them all.
 */
export async function applyPlanToDay(
  tx: Tx,
  userId: string,
  profile: DayProfile,
  date: string,
  weekDatesForCounts: readonly string[] = [],
): Promise<"planned" | "no_plan"> {
  const prefs = await readPreferencesInTx(tx, userId);
  if (!prefs) return "no_plan";
  const planned = await plannedDayFor(tx, userId, prefs, weekdayIndex(date));
  if (!planned) return "no_plan";
  const { plan, anchors, workout } = planned;

  const orient = await defaultTemplateFor(tx, userId, "orient");
  const windDown = plan.windDownTemplateId ?? (await defaultTemplateFor(tx, userId, "wind_down"));
  const morning: string | null | "pool" =
    plan.morningTemplateId ??
    (profile.overflowMode === "daily_menu" ? "pool" : await defaultTemplateFor(tx, userId, "morning"));
  const prep = plan.prepTemplateId ?? (await defaultTemplateFor(tx, userId, "prep"));

  const blocks: BlockAssignment[] = [
    { kind: "orient", templateId: orient },
    { kind: "morning", templateId: morning },
    { kind: "prep", templateId: prep },
    ...(plan.workTemplateId === null
      ? []
      : [{ kind: "work" as const, templateId: plan.workTemplateId }]),
    { kind: "wind_down", templateId: windDown },
  ];
  if (workout) blocks.push({ kind: "training", templateId: null });
  const activity = await defaultTemplateFor(tx, userId, "activity");
  if (activity !== null) blocks.push({ kind: "activity", templateId: activity });

  // The focus stays the rotation's (typical days, counts) — a plan does not name one.
  const defaults = await defaultPlanFor(tx, userId, profile, date, weekDatesForCounts);

  const materialised = await materializeInTx(tx, userId, {
    date,
    blocks,
    shape: "structured",
    anchorTime: anchors.wake,
    focusHabitId: defaults.focusHabitId,
    anchors: {
      workStartTime: anchors.workStart,
      workEndTime: anchors.workEnd,
      lightsOutTime: anchors.lightsOut,
      devicesOffTime: anchors.devicesOff,
      workTemplateId: plan.workTemplateId,
      excludedFixtureIds: plan.excludedFixtureIds,
    },
  });

  if (workout) await placePlannedWorkout(tx, userId, materialised.day, materialised.blocks, workout);
  return "planned";
}

/** The plan's workout onto the day's training block: its placement and its item, at build. */
async function placePlannedWorkout(
  tx: Tx,
  userId: string,
  day: DayRow,
  blocks: readonly BlockRow[],
  workout: { habitId: string; placement: TrainingPlacement },
): Promise<void> {
  const block = blocks.find((row) => row.kind === "training");
  if (!block) return;
  const habit = (await readHabits(tx, userId, [workout.habitId])).get(workout.habitId);
  if (!habit) return;

  await tx
    .update(dayBlocks)
    .set({ placement: workout.placement, state: "planned", updatedAt: new Date() })
    .where(eq(dayBlocks.id, block.id));

  const existing = block.items.find((item) => item.type === "workout");
  if (existing) return;
  await tx.insert(dayItems).values({
    ...habitItem(habit, { durationMin: workoutLength(habit), sortOrder: 0, snapshot: null }),
    userId,
    dayId: day.id,
    dayBlockId: block.id,
  });
}

export async function prefillWeek(
  rls: RlsClient,
  userId: string,
  weekKey: string,
): Promise<{ planned: number; skipped: number; dates: string[] }> {
  const dates = weekDates(weekKey);
  let planned = 0;
  let skipped = 0;
  const done: string[] = [];

  for (const date of dates) {
    const result = await rls.execute(async (tx) => {
      const profile = await readDayProfile(tx, userId);

      const [existing] = await tx
        .select({ id: dayBlocks.id })
        .from(dayBlocks)
        .innerJoin(days, eq(days.id, dayBlocks.dayId))
        .where(and(eq(dayBlocks.userId, userId), eq(days.date, date)))
        .limit(1);
      if (existing) return "skipped" as const;

      // UX v1.2 §4.15: the weekday's day plan first; the profile's defaults
      // for a weekday no plan claims.
      if ((await applyPlanToDay(tx, userId, profile, date, dates)) === "planned") {
        return "planned" as const;
      }

      const plan = await defaultPlanFor(tx, userId, profile, date, dates);
      await materializeInTx(tx, userId, {
        date,
        blocks: plan.blocks,
        shape: plan.shape,
        focusHabitId: plan.focusHabitId,
      });
      return "planned" as const;
    });

    if (result === "planned") {
      planned += 1;
      done.push(date);
    } else {
      skipped += 1;
    }
  }

  return { planned, skipped, dates: done };
}

/** The kinds a structured day carries by default, for callers that list them. */
export const STRUCTURED_KINDS: ReadonlyArray<BlockKind> = [
  "orient",
  "morning",
  "prep",
  "work",
  "wind_down",
];
