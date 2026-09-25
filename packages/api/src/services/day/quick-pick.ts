import { and, asc, eq, inArray, isNotNull, isNull } from "drizzle-orm";

import { TRAINING_PLACEMENTS } from "@syn/constants";
import { categories, dayBlocks, dayItems, days, habits, type RlsClient } from "@syn/db";
import type {
  HabitSummaryView,
  QuickPickView,
  TrainingPlacement,
  Weekday,
} from "@syn/types";
import type { ConfirmDayInput } from "@syn/validators";
import {
  clockMinutes,
  computeBudget,
  fitToBudget,
  weekDates,
  weekKeyOf,
  weekdayForDayKey,
  weekdayIndex,
  type FitItem,
} from "@syn/utils";

import {
  HABIT_SUMMARY_COLUMNS,
  toHabitSummaryView,
  type CategoryRow,
} from "../library/to-view";
import { listTemplates } from "../plan/templates";
import { getDay } from "./get-day";
import { blockTotalMin } from "./lay-out-day";
import {
  readDay,
  readDayBlocks,
  readDayProfile,
  readTemplateSlots,
  toLayoutBlocks,
  wakeMinutesOf,
  type Tx,
} from "./materialize-day";
import { defaultPlanFor } from "./prefill-week";

/**
 * The quick-pick's read model — UX v1.1 §5.3 (DYN-5). Every section already
 * answered with today's default; a section is null when the day asks no
 * question of that kind. Writes nothing: `confirmDay` is the write.
 *
 * THE DEFAULTS ARE THE PLAN'S. The menu is pre-ticked to the budget in
 * priority order (`fitToBudget`, cut only — R4's shortening is the person's
 * *Shorten to fit*, not the default); the *one of* chosen is the last choice
 * or the default member; today's workout is the rotation's typical one, with
 * the last placement for this focus; the focus is the week's assignment or
 * the remaining counts. "Remaining" is counted against confirmed days this
 * week — a plan is not a count until it is set (R23).
 */

type Remaining = Map<string, number>;

/** Weekly counts used so far: confirmed days this week, by workout and focus. */
async function usedThisWeek(
  tx: Tx,
  userId: string,
  date: string,
): Promise<{ workouts: Remaining; focuses: Remaining; placements: Map<string, TrainingPlacement> }> {
  const dates = weekDates(weekKeyOf(date));
  const workouts: Remaining = new Map();
  const focuses: Remaining = new Map();
  const placements = new Map<string, TrainingPlacement>();

  const confirmed = await tx
    .select({ id: days.id, focusId: days.workFocusHabitId, date: days.date })
    .from(days)
    .where(
      and(eq(days.userId, userId), inArray(days.date, dates), isNotNull(days.confirmedAt)),
    );
  for (const row of confirmed) {
    if (row.focusId !== null) focuses.set(row.focusId, (focuses.get(row.focusId) ?? 0) + 1);
  }
  if (confirmed.length === 0) return { workouts, focuses, placements };

  const dayIds = confirmed.map((row) => row.id);
  const workoutRows = await tx
    .select({ habitId: dayItems.habitId, placement: dayBlocks.placement, dayId: dayItems.dayId })
    .from(dayItems)
    .innerJoin(dayBlocks, eq(dayBlocks.id, dayItems.dayBlockId))
    .where(
      and(
        eq(dayItems.userId, userId),
        eq(dayItems.type, "workout"),
        eq(dayItems.assignmentState, "assigned"),
        inArray(dayItems.dayId, dayIds),
      ),
    );
  for (const row of workoutRows) {
    if (row.habitId === null) continue;
    workouts.set(row.habitId, (workouts.get(row.habitId) ?? 0) + 1);
  }

  // The last placement for each focus — "remember last placement" (§3.7).
  const focusByDay = new Map(confirmed.map((row) => [row.id, row.focusId]));
  for (const row of workoutRows) {
    const focusId = focusByDay.get(row.dayId);
    if (focusId && row.placement !== null) placements.set(focusId, row.placement);
  }

  return { workouts, focuses, placements };
}

export async function getQuickPick(
  rls: RlsClient,
  userId: string,
  date: string,
  context: { todayKey: string; timeZone: string; dayCloseTime: string; now: Date },
): Promise<QuickPickView> {
  const view = await getDay(rls, userId, date, context);

  return rls.execute(async (tx) => {
    const profile = await readDayProfile(tx, userId);
    const day = await readDay(tx, userId, date);
    const weekday = weekdayIndex(date);

    const categoryRows = await tx
      .select({ id: categories.id, name: categories.name, colorKey: categories.colorKey })
      .from(categories)
      .where(eq(categories.userId, userId));
    const categoriesById = new Map<string, CategoryRow>(categoryRows.map((row) => [row.id, row]));
    const summary = (row: Parameters<typeof toHabitSummaryView>[0]): HabitSummaryView =>
      toHabitSummaryView(row, categoriesById);

    const habitRows = await tx
      .select(HABIT_SUMMARY_COLUMNS)
      .from(habits)
      .where(and(eq(habits.userId, userId), isNull(habits.archivedAt)))
      .orderBy(asc(habits.createdAt));

    // The day's blocks, or the plan the profile implies for an unplanned day.
    const blocks = day ? await readDayBlocks(tx, userId, day.id) : [];
    const plan = day ? null : await defaultPlanFor(tx, userId, profile, date);
    const shape = day?.shape ?? plan?.shape ?? "structured";
    const blockTemplate = (kind: "morning" | "prep" | "orient"): string | null | "pool" => {
      const row = blocks.find((block) => block.kind === kind);
      if (row) return row.state === "pooled" ? "pool" : row.templateId;
      return plan?.blocks.find((block) => block.kind === kind)?.templateId ?? null;
    };

    const used = await usedThisWeek(tx, userId, date);
    const remainingOf = (habit: { id: string; weeklyTarget: number | null }, counts: Remaining) =>
      Math.max(0, (habit.weeklyTarget ?? 0) - (counts.get(habit.id) ?? 0));

    /* -- shape --------------------------------------------------------- */

    const workMode = profile.workDays?.[String(weekday) as keyof NonNullable<typeof profile.workDays>];
    const shapeSection: QuickPickView["shape"] =
      workMode === "sometimes" && day?.confirmedAt == null
        ? { asked: true, default: shape }
        : null;

    if (shape === "unstructured" && shapeSection === null) {
      return {
        date,
        lastNight: view.lastNight,
        shape: null,
        routine: null,
        prep: null,
        training: null,
        work: null,
        fixtures: fixturesOf(view),
        anchor: null,
        freeTime: await freeTimeOf(tx, userId, blocks, plan),
      };
    }

    /* -- the budget ---------------------------------------------------- */

    const layoutBlocks = day ? toLayoutBlocks(blocks, day) : [];
    const totalOf = (kind: "orient" | "prep"): number => {
      const block = layoutBlocks.find((entry) => entry.kind === kind);
      return block ? blockTotalMin(block) : 0;
    };
    const wakeMin = day ? wakeMinutesOf(day) : clockMinutes(profile.usualWakeTime.slice(0, 5));
    const workStartMin =
      profile.workStartTime === null ? null : clockMinutes(profile.workStartTime.slice(0, 5));
    const availableMin =
      workStartMin === null
        ? 0
        : computeBudget({
            wakeMin,
            workStartMin: workStartMin < wakeMin ? workStartMin + 1440 : workStartMin,
            orientMin: totalOf("orient"),
            prepTotalMin: totalOf("prep"),
          }).availableMin;

    /* -- routine ------------------------------------------------------- */

    const morningAssignment = blockTemplate("morning");
    let routine: QuickPickView["routine"] = null;

    if (profile.overflowMode === "daily_menu") {
      const landscape = habitRows
        .filter((row) => row.type === "habit" && row.blockKind === "morning")
        .sort((a, b) => b.lifePriority - a.lifePriority);
      const fitItems: FitItem[] = landscape.map((row) => ({
        id: row.id,
        durationMin: midpoint(row.durationMinMin, row.durationMaxMin),
        gapBeforeMin: 0,
        pinnedAtMin: null,
        scheduling: "soft",
        priority: row.lifePriority,
        durationMinMin: row.durationMinMin,
        isAssigned: true,
      }));
      const fit = fitToBudget(fitItems, availableMin, "cut_only");
      const ticked = new Set(fit.keep.map((entry) => entry.id));
      routine = {
        mode: "daily_menu",
        menu: {
          items: landscape.map((row) => ({
            ...summary(row),
            durationMin: midpoint(row.durationMinMin, row.durationMaxMin),
            ticked: ticked.has(row.id),
          })),
          availableMin,
        },
        assignedId: morningAssignment === "pool" ? null : morningAssignment,
      };
    } else if (profile.overflowMode === "variants") {
      const variants = await listTemplates(rls, userId, {
        includeArchived: false,
        kind: "morning",
      });
      const usedVariants = await tx
        .select({ templateId: dayBlocks.templateId })
        .from(dayBlocks)
        .innerJoin(days, eq(days.id, dayBlocks.dayId))
        .where(
          and(
            eq(dayBlocks.userId, userId),
            eq(dayBlocks.kind, "morning"),
            inArray(days.date, weekDates(weekKeyOf(date))),
            isNotNull(days.confirmedAt),
          ),
        );
      const count = new Map<string, number>();
      for (const row of usedVariants) {
        if (row.templateId !== null) count.set(row.templateId, (count.get(row.templateId) ?? 0) + 1);
      }
      routine = {
        mode: "variants",
        variants: variants.map((variant) => ({
          ...variant,
          remaining: Math.max(0, (variant.weeklyTarget ?? 0) - (count.get(variant.id) ?? 0)),
        })),
        assignedId: morningAssignment === "pool" ? null : morningAssignment,
      };
    } else {
      routine = {
        mode: "auto_trim",
        assignedId: morningAssignment === "pool" ? null : morningAssignment,
      };
    }

    /* -- prep: the one-ofs --------------------------------------------- */

    const prepTemplateId = blockTemplate("prep");
    let prep: QuickPickView["prep"] = null;
    if (prepTemplateId !== null && prepTemplateId !== "pool") {
      const slots = await readTemplateSlots(tx, userId, prepTemplateId);
      const groups = new Map<string, typeof slots>();
      for (const slot of slots) {
        if (slot.alternatesGroup === null) continue;
        const members = groups.get(slot.alternatesGroup) ?? [];
        members.push(slot);
        groups.set(slot.alternatesGroup, members);
      }
      const prepBlock = blocks.find((block) => block.kind === "prep");
      const onDay = new Set(
        (prepBlock?.items ?? [])
          .filter((item) => item.alternatesChosen === true && item.templateSlotId !== null)
          .map((item) => item.templateSlotId as string),
      );
      const alternates = [...groups.entries()]
        .filter(([, members]) => members.length >= 2)
        .map(([groupId, members]) => ({
          groupId,
          members: members.map((slot) => ({
            slotId: slot.id,
            title: slot.habitTitle,
            durationMin: slot.durationMin,
            isDefault: slot.alternatesDefault,
          })),
          chosen:
            members.find((slot) => onDay.has(slot.id))?.id ??
            members.find((slot) => slot.alternatesDefault)?.id ??
            (members[0]?.id as string),
        }));
      prep = alternates.length > 0 ? { alternates } : null;
    }

    /* -- training ------------------------------------------------------ */

    const workouts = habitRows.filter((row) => row.type === "workout");
    let training: QuickPickView["training"] = null;
    if (workouts.length > 0) {
      const trainingBlock = blocks.find((block) => block.kind === "training");
      const onDay = trainingBlock?.items.find((item) => item.type === "workout")?.habitId ?? null;
      const todays =
        workouts.find((row) => row.id === onDay) ??
        workouts.find(
          (row) =>
            (row.typicalDays ?? []).includes(weekday) &&
            remainingOf(row, used.workouts) > 0,
        ) ??
        null;
      const focusId = day?.workFocusHabitId ?? plan?.focusHabitId ?? null;
      training = {
        todays: todays ? summary(todays) : null,
        swaps: workouts
          .filter((row) => row.id !== todays?.id)
          .map((row) => ({
            ...summary(row),
            remaining: remainingOf(row, used.workouts),
            tradesWithDay: tradesWithDay(row.typicalDays, date),
          })),
        placements: TRAINING_PLACEMENTS,
        lastPlacement:
          trainingBlock?.placement ??
          (focusId === null ? null : (used.placements.get(focusId) ?? null)),
      };
    }

    /* -- work ---------------------------------------------------------- */

    const focuses = habitRows.filter((row) => row.type === "deep_work");
    const work: QuickPickView["work"] =
      shape === "structured"
        ? {
            focuses: focuses.map((row) => ({
              ...summary(row),
              remaining: remainingOf(row, used.focuses),
            })),
            assignedId: day?.workFocusHabitId ?? plan?.focusHabitId ?? null,
            askAnchor: profile.anchorDirection === "depends",
          }
        : null;

    return {
      date,
      lastNight: view.lastNight,
      shape: shapeSection,
      routine,
      prep,
      training,
      work,
      fixtures: fixturesOf(view),
      anchor: view.anchor,
      freeTime: await freeTimeOf(tx, userId, blocks, plan),
    };
  });
}

/**
 * The pick's *Free time* (UX v1.3 §5.3, TD-26; DAY-12): the pool the day's
 * free-time block waits on — the day's own pooled block, or the one the plan
 * implies for a day not yet built — as its members in rank order. A block
 * already `set` (the evening chosen) or a day with no pool has no section.
 */
async function freeTimeOf(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  userId: string,
  blocks: Awaited<ReturnType<typeof readDayBlocks>>,
  plan: Awaited<ReturnType<typeof defaultPlanFor>> | null,
): Promise<QuickPickView["freeTime"]> {
  const onDay = blocks.find((block) => block.kind === "activity");
  const templateId =
    onDay !== undefined
      ? onDay.state === "pooled"
        ? onDay.templateId
        : null
      : (plan?.blocks.find((block) => block.kind === "activity" && block.pooled === true)?.templateId ?? null);
  if (templateId === null || templateId === undefined) return null;
  const members = (await readTemplateSlots(tx, userId, templateId))
    .filter((slot) => slot.role === "pool")
    .map((slot) => ({ habitId: slot.habitId, title: slot.habitTitle, icon: slot.habitIcon, durationMin: slot.durationMin }));
  return members.length === 0 ? null : { members };
}

function midpoint(min: number | null, max: number | null): number {
  if (min === null && max === null) return 15;
  if (min === null) return max as number;
  if (max === null) return min;
  return Math.round((min + max) / 2);
}

/**
 * The pick's own defaults as the input `confirmDay` takes — UX v1.2 R37,
 * TD-17. *Set from the plan* calls this and then `confirmDay`, so there is
 * ONE resolver of "what would be preselected" and no second confirm path:
 * a plan's choices are already the day's blocks after the week build, and
 * the pick's defaults are therefore the plan's.
 *
 * Two questions the pick would have asked are answered by the caller or
 * refused: a *sometimes* day's *Working today?* (`workingToday`) and, under
 * *depends on the day*, what gives (`anchorIsHard`). Neither is inferred.
 */
export type PickDefaultsBlock = "sometimes_unanswered" | "anchor_unanswered";

export async function resolvePickDefaults(
  rls: RlsClient,
  userId: string,
  date: string,
  context: { todayKey: string; timeZone: string; dayCloseTime: string; now: Date },
  answers: { workingToday?: boolean; anchorIsHard?: boolean } = {},
): Promise<{ input: ConfirmDayInput } | { blocked: PickDefaultsBlock }> {
  const view = await getQuickPick(rls, userId, date, context);

  if (view.shape?.asked && answers.workingToday === undefined) {
    return { blocked: "sometimes_unanswered" };
  }
  if (view.work?.askAnchor && answers.anchorIsHard === undefined) {
    return { blocked: "anchor_unanswered" };
  }

  const routine: ConfirmDayInput["routine"] =
    view.routine === null
      ? undefined
      : view.routine.mode === "daily_menu"
        ? {
            menuHabitIds: (view.routine.menu?.items ?? [])
              .filter((item) => item.ticked)
              .map((item) => item.id),
          }
        : view.routine.mode === "variants"
          ? {
              variantTemplateId:
                view.routine.assignedId ??
                view.routine.variants?.find((variant) => variant.remaining > 0)?.id ??
                view.routine.variants?.[0]?.id,
            }
          : undefined;

  const training: ConfirmDayInput["training"] =
    view.training === null
      ? undefined
      : view.training.todays === null
        ? undefined
        : {
            workoutHabitId: view.training.todays.id,
            placement: view.training.lastPlacement,
            notToday: false,
          };

  return {
    input: {
      date,
      ...(answers.workingToday !== undefined ? { workingToday: answers.workingToday } : {}),
      ...(routine ? { routine } : {}),
      alternates: view.prep?.alternates.map((group) => ({
        groupId: group.groupId,
        chosenSlotId: group.chosen,
      })),
      ...(training ? { training } : {}),
      focusHabitId: view.work?.assignedId ?? undefined,
      ...(answers.anchorIsHard !== undefined ? { anchorIsHard: answers.anchorIsHard } : {}),
    },
  };
}

/** The day's fixture items, read-only under *Already in place*. */
function fixturesOf(view: Awaited<ReturnType<typeof getDay>>) {
  return view.blocks.flatMap((block) => block.items.filter((item) => item.origin === "fixture"));
}

/** "Tuesday" — the next typical day this week the swap would trade with. */
function tradesWithDay(typicalDays: number[] | null, date: string): string | null {
  if (!typicalDays || typicalDays.length === 0) return null;
  const today = weekdayIndex(date);
  const dates = weekDates(weekKeyOf(date));
  const next =
    (typicalDays as Weekday[]).find((day) => day > today) ??
    (typicalDays as Weekday[]).find((day) => day !== today);
  if (next === undefined) return null;
  const target = dates[next];
  return target === undefined ? null : weekdayForDayKey(target);
}

