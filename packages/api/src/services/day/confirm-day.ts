import { and, eq, inArray, isNull, sql } from "drizzle-orm";

import { dayBlocks, dayItems, days, type RlsClient } from "@syn/db";
import type { DayShape, TrainingPlacement } from "@syn/types";
import type { ConfirmDayInput } from "@syn/validators";
import {
  addDays,
  clockFromMinutes,
  clockMinutes,
  computeBudget,
  fitToBudget,
  weekdayForDayKey,
  type FitItem,
} from "@syn/utils";

import { enqueueBlockPushes } from "../notifications/block-pushes";
import { getDay, type DayView } from "./get-day";
import { blockTotalMin } from "./lay-out-day";
import {
  anchorIsHardFor,
  desiredTemplateItems,
  assignmentsFromBlocks,
  layoutFor,
  materializeInTx,
  readDay,
  readDayBlocks,
  readDayProfile,
  readTemplateSlots,
  readTemplates,
  reconcileItems,
  renumberBlocks,
  slotToDesired,
  toLayoutBlocks,
  wakeMinutesOf,
  writeLayout,
  type BlockAssignment,
  type BlockRow,
  type BlockRowWithSplit,
  type DayProfile,
  type DayRow,
  type DesiredItem,
  type Tx,
} from "./materialize-day";
import {
  habitItem,
  midpoint,
  readHabits,
  resolveVersion,
  typicalWorkoutFor,
  writeWorkoutRows,
  type HabitLite,
} from "./habit-item";
import { defaultPlanFor } from "./prefill-week";
import { isUntouchedItem } from "./untouched";
import { afterDevicesOff } from "./wind-down";

/**
 * *Set the day* — UX v1.1 §5.3, §5.4, §7.3, §11.11 phase 2, R6, R7, R23 (DYN-5).
 *
 * THE MOMENT THE RECORD BEGINS. Everything the pick decides — the routine's
 * ticked items or its variant, each *one of*'s member, the workout and where
 * it goes, the focus, today's anchor hardness, the shape — is resolved here
 * into rows; then the whole day is walked once (`layOutDay`) forward from
 * `woke_at`, and `original_scheduled_start` is written for the first and
 * only time on every item and block that has a time. The trigger permits
 * exactly that transition; this is the one path that makes it.
 *
 * ONE TRANSACTION, IDEMPOTENT. A closed day refuses; a day already set is a
 * no-op returning the day. Nothing else refuses: over budget is a number the
 * person sees, not a gate (R7). The one exception is a workout that is
 * neither placed nor *not today* (§3.7) — the pick's primary is disabled
 * until the person answers, and the service says the same thing.
 *
 * YESTERDAY IS ANSWERED HERE TOO (§7.3). The wind-down items after
 * devices-off were never ticked live; the pick's *Last night* section says
 * which happened, and the rest become `not_confirmed` — excluded from the
 * number, never hidden.
 */

export type ConfirmRuleCode =
  | "closed"
  | "workout_unplaced"
  | "trade_day_set"
  | "no_such_habit";

export class ConfirmRuleError extends Error {
  readonly code: ConfirmRuleCode;
  /** The workout's title, or the traded day's weekday — for the sentence. */
  readonly subject: string | null;
  constructor(code: ConfirmRuleCode, subject: string | null = null) {
    super(code);
    this.name = "ConfirmRuleError";
    this.code = code;
    this.subject = subject;
  }
}

export type ConfirmContext = {
  todayKey: string;
  timeZone: string;
  dayCloseTime: string;
  now: Date;
  deviceZone?: string | null;
  /**
   * UX v1.2 R37, TD-17 — *Set from the plan* leaves yesterday's after-
   * devices-off items pending for the Today list's panel (RUN-13) rather than
   * marking the unticked ones `not_confirmed` here; the pick, which asks,
   * leaves this unset.
   */
  leaveLastNight?: boolean;
};

/* The habit → item helpers moved to `habit-item.ts` in RUN-5 (see its header); re-exported so no caller changed. */
export {
  habitItem,
  readHabits,
  typicalWorkoutFor,
  workoutLength,
  type HabitLite,
} from "./habit-item";

/* --------------------------------------------------------- the pools -- */

/** The morning: a variant, the menu, or the routine trimmed to the budget. */
async function resolveMorning(
  tx: Tx,
  userId: string,
  day: DayRow,
  profile: DayProfile,
  blocks: readonly BlockRow[],
  input: ConfirmDayInput,
): Promise<void> {
  const morning = blocks.find((block) => block.kind === "morning");
  if (!morning) return;

  const routine = input.routine ?? {};

  if (routine.variantTemplateId !== undefined) {
    const templatesById = await readTemplates(tx, userId, [routine.variantTemplateId]);
    const template = templatesById.get(routine.variantTemplateId);
    if (!template) throw new Error("no such template");
    await tx
      .update(dayBlocks)
      .set({
        templateId: template.id,
        templateNameSnapshot: template.name,
        state: "planned",
        updatedAt: new Date(),
      })
      .where(eq(dayBlocks.id, morning.id));
    const slots = await readTemplateSlots(tx, userId, template.id);
    const desired = desiredTemplateItems(template, slots, { includePool: true });
    await reconcileItems(tx, userId, day, { ...morning, templateId: template.id }, desired, null, false);
    return;
  }

  if (routine.menuHabitIds !== undefined) {
    if (morning.state === "pooled") {
      await tx
        .update(dayBlocks)
        .set({ state: "planned", updatedAt: new Date() })
        .where(eq(dayBlocks.id, morning.id));
    }
    const habitsById = await readHabits(tx, userId, routine.menuHabitIds);
    // Highest priority first; the pick's order breaks ties.
    const chosen = routine.menuHabitIds
      .map((id) => habitsById.get(id))
      .filter((habit): habit is HabitLite => habit !== undefined)
      .sort((a, b) => b.lifePriority - a.lifePriority);

    // Opener · pool · closer: the pool sits between them (§3.4).
    const closerIds = new Set<string>();
    if (morning.templateId !== null) {
      const slots = await readTemplateSlots(tx, userId, morning.templateId);
      for (const slot of slots) if (slot.role === "closer") closerIds.add(slot.id);
    }
    const openers = morning.items.filter(
      (item) => item.templateSlotId === null || !closerIds.has(item.templateSlotId),
    );
    const closers = morning.items.filter(
      (item) => item.templateSlotId !== null && closerIds.has(item.templateSlotId),
    );

    let sortOrder = 0;
    for (const item of openers) {
      if (item.sortOrder !== sortOrder) {
        await tx.update(dayItems).set({ sortOrder }).where(eq(dayItems.id, item.id));
      }
      sortOrder += 1;
    }
    for (const habit of chosen) {
      // UX v1.2 §3.5 (TD-11): a chosen habit with versions lands at its
      // DEFAULT version; a hand-set menu duration wins and carries no key.
      const menuDuration = routine.menuDurations?.[habit.id];
      const version = menuDuration === undefined ? resolveVersion(habit, null) : null;
      await tx.insert(dayItems).values({
        ...habitItem(habit, {
          durationMin:
            menuDuration ?? version?.minutes ?? midpoint(habit.durationMinMin, habit.durationMaxMin),
          sortOrder,
          // [COPY — needs Vesper sign-off: the snapshot for a menu morning.]
          snapshot: "Menu",
          versionKey: version?.key ?? null,
        }),
        userId,
        dayId: day.id,
        dayBlockId: morning.id,
      });
      sortOrder += 1;
    }
    for (const item of closers) {
      await tx.update(dayItems).set({ sortOrder }).where(eq(dayItems.id, item.id));
      sortOrder += 1;
    }
    return;
  }

  if (profile.overflowMode === "auto_trim" && morning.templateId !== null) {
    // The one routine, shortened then cut to the budget (R4, §3.10).
    const orient = blocks.find((block) => block.kind === "orient");
    const prep = blocks.find((block) => block.kind === "prep");
    const layoutBlocks = toLayoutBlocks(blocks, day);
    const totalOf = (id: string | undefined): number => {
      const block = layoutBlocks.find((entry) => entry.id === id);
      return block ? blockTotalMin(block) : 0;
    };
    const wakeMin = wakeMinutesOf(day);
    const workStartMin =
      profile.workStartTime === null ? null : clockMinutes(profile.workStartTime.slice(0, 5));
    if (workStartMin === null) return;

    const { availableMin } = computeBudget({
      wakeMin,
      workStartMin: workStartMin < wakeMin ? workStartMin + 1440 : workStartMin,
      orientMin: totalOf(orient?.id),
      prepTotalMin: totalOf(prep?.id),
    });

    const habitsById = await readHabits(
      tx,
      userId,
      morning.items.map((item) => item.habitId).filter((id): id is string => id !== null),
    );
    const fitItems: FitItem[] = morning.items.map((item) => ({
      id: item.id,
      durationMin: item.durationMin ?? 0,
      gapBeforeMin: item.gapBeforeMin,
      pinnedAtMin: null,
      scheduling: item.scheduling,
      priority: item.priority,
      multitaskId: item.multitaskId,
      alternatesId: item.alternatesId,
      alternatesChosen: item.alternatesChosen ?? undefined,
      durationMinMin: item.habitId === null ? null : (habitsById.get(item.habitId)?.durationMinMin ?? null),
      isAssigned: item.assignmentState === "assigned" && isUntouchedItem(item),
    }));
    const fit = fitToBudget(fitItems, availableMin, "shorten_then_cut");
    for (const kept of fit.keep) {
      if (!kept.shortened) continue;
      await tx
        .update(dayItems)
        .set({ durationMin: kept.durationMin, updatedAt: new Date() })
        .where(eq(dayItems.id, kept.id));
    }
    if (fit.cut.length > 0) {
      await tx
        .update(dayItems)
        .set({ assignmentState: "not_assigned", updatedAt: new Date() })
        .where(inArray(dayItems.id, fit.cut));
    }
  }
}

/** Each *one of*: the chosen member replaces the default's untouched row. */
async function resolveAlternates(
  tx: Tx,
  userId: string,
  day: DayRow,
  blocks: readonly BlockRow[],
  input: ConfirmDayInput,
): Promise<void> {
  if (!input.alternates || input.alternates.length === 0) return;

  const templateIds = blocks
    .map((block) => block.templateId)
    .filter((id): id is string => id !== null);
  const templatesById = await readTemplates(tx, userId, templateIds);

  for (const block of blocks) {
    if (block.templateId === null) continue;
    const template = templatesById.get(block.templateId);
    if (!template) continue;
    const slots = await readTemplateSlots(tx, userId, template.id);

    for (const choice of input.alternates) {
      const members = slots.filter((slot) => slot.alternatesGroup === choice.groupId);
      if (members.length === 0) continue;
      const chosenSlot = members.find((slot) => slot.id === choice.chosenSlotId);
      if (!chosenSlot) continue;

      const memberIds = new Set(members.map((slot) => slot.id));
      const existing = block.items.filter(
        (item) => item.templateSlotId !== null && memberIds.has(item.templateSlotId),
      );
      const already = existing.find((item) => item.templateSlotId === chosenSlot.id);

      if (already) {
        if (already.alternatesChosen !== true) {
          await tx
            .update(dayItems)
            .set({ alternatesChosen: true, updatedAt: new Date() })
            .where(eq(dayItems.id, already.id));
        }
        continue;
      }

      const previous = existing[0];
      // A member the person already acted on stays; the choice is theirs.
      if (previous && !isUntouchedItem(previous)) continue;

      const alternatesId = previous?.alternatesId ?? crypto.randomUUID();
      const sortOrder = previous?.sortOrder ?? block.items.length;
      if (previous) {
        await tx.delete(dayItems).where(eq(dayItems.id, previous.id));
      }

      const desired: DesiredItem = {
        ...slotToDesired(chosenSlot, template, sortOrder),
        alternatesChosen: true,
      };
      await tx.insert(dayItems).values({
        userId,
        dayId: day.id,
        dayBlockId: block.id,
        habitId: desired.habitId,
        templateSlotId: desired.templateSlotId,
        origin: "template",
        title: desired.title,
        icon: desired.icon,
        type: desired.type,
        quantityUnit: desired.quantityUnit,
        reflectionAxes: desired.reflectionAxes,
        notesPreflight: desired.notesPreflight,
        timeMode: "fixed_time",
        durationMin: desired.durationMin,
        gapBeforeMin: desired.gapBeforeMin,
        pinned: false,
        priority: desired.priority,
        scheduling: desired.scheduling,
        sortOrder,
        alternatesId,
        alternatesChosen: true,
        templateNameSnapshot: desired.templateNameSnapshot,
      });
    }
  }
}

/** The workout, its placement, and the trade. */
async function resolveTraining(
  tx: Tx,
  userId: string,
  day: DayRow,
  profile: DayProfile,
  blocks: BlockRowWithSplit[],
  input: ConfirmDayInput,
): Promise<BlockRowWithSplit[]> {
  const training = input.training;
  const typical = await typicalWorkoutFor(tx, userId, day.date);
  const workoutId =
    training === undefined
      ? (typical?.id ?? null)
      : training.workoutHabitId;
  const notToday = training?.notToday ?? false;

  let block = blocks.find((row) => row.kind === "training");

  if (notToday) {
    if (block) {
      await tx
        .update(dayBlocks)
        .set({ state: "not_today", updatedAt: new Date() })
        .where(eq(dayBlocks.id, block.id));
      // The workout's travel rows are in this block and go with it (UX v1.2
      // §3.7) — untouched ones removed here, a touched one kept as a record.
      const removable = block.items.filter(isUntouchedItem).map((item) => item.id);
      if (removable.length > 0) {
        await tx.delete(dayItems).where(inArray(dayItems.id, removable));
      }
      block.state = "not_today";
    }
    return blocks;
  }

  if (workoutId === null) return blocks;

  const workout = (await readHabits(tx, userId, [workoutId])).get(workoutId);
  if (!workout) throw new ConfirmRuleError("no_such_habit");

  const placement: TrainingPlacement | null =
    training?.placement ?? block?.placement ?? null;
  if (placement === null) throw new ConfirmRuleError("workout_unplaced", workout.title);

  if (!block) {
    const [created] = await tx
      .insert(dayBlocks)
      .values({
        userId,
        dayId: day.id,
        kind: "training",
        state: "planned",
        placement,
        sortOrder: -50,
      })
      .returning({ id: dayBlocks.id });
    if (!created) throw new Error("day_blocks insert returned no row");
    block = {
      id: created.id,
      kind: "training",
      templateId: null,
      templateNameSnapshot: null,
      state: "planned",
      placement,
      sortOrder: -50,
      scheduledStart: null,
      scheduledEnd: null,
      originalScheduledStart: null,
      items: [],
      splitIndex: null,
    };
    blocks.push(block);
  } else {
    await tx
      .update(dayBlocks)
      .set({ placement, state: "planned", updatedAt: new Date() })
      .where(eq(dayBlocks.id, block.id));
    block.placement = placement;
    block.state = "planned";
  }

  // The workout item — one per training block — and its travel rows when the
  // travel is planned (UX v1.2 §3.7, TD-12).
  await writeWorkoutRows(tx, userId, day.id, block, workout);

  // *Inside work* splits the container (§3.7): a second work row after it.
  if (placement === "inside_work") {
    const workRows = blocks.filter((row) => row.kind === "work");
    const first = workRows[0];
    if (first && workRows.length === 1) {
      const [second] = await tx
        .insert(dayBlocks)
        .values({
          userId,
          dayId: day.id,
          kind: "work",
          templateId: first.templateId,
          templateNameSnapshot: first.templateNameSnapshot,
          state: "planned",
          sortOrder: -51,
        })
        .returning({ id: dayBlocks.id });
      if (!second) throw new Error("day_blocks insert returned no row");
      first.splitIndex = 0;
      blocks.push({
        id: second.id,
        kind: "work",
        templateId: first.templateId,
        templateNameSnapshot: first.templateNameSnapshot,
        state: "planned",
        placement: null,
        sortOrder: -51,
        scheduledStart: null,
        scheduledEnd: null,
        originalScheduledStart: null,
        items: [],
        splitIndex: 1,
      });
    }
  }

  // The trade (R25): the other day takes today's typical workout, if it is
  // still open to being set.
  if (training?.tradeWithDate !== undefined && typical && typical.id !== workout.id) {
    const other = await readDay(tx, userId, training.tradeWithDate);
    if (other?.confirmedAt) {
      throw new ConfirmRuleError("trade_day_set", weekdayForDayKey(training.tradeWithDate));
    }
    const otherBlocks = await ensureTrainingBlock(tx, userId, profile, training.tradeWithDate);
    const otherTraining = otherBlocks.find((row) => row.kind === "training");
    const otherDay = otherTraining ? await readDay(tx, userId, training.tradeWithDate) : null;
    if (otherTraining && otherDay) {
      await writeWorkoutRows(tx, userId, otherDay.id, otherTraining, typical);
    }
  }

  return blocks;
}

/** The other day's training block, creating the day from its default plan if needed. */
export async function ensureTrainingBlock(
  tx: Tx,
  userId: string,
  profile: DayProfile,
  date: string,
): Promise<BlockRow[]> {
  const existing = await readDay(tx, userId, date);
  let blocks = existing ? await readDayBlocks(tx, userId, existing.id) : [];
  if (blocks.some((row) => row.kind === "training")) return blocks;

  const assignments: BlockAssignment[] = blocks.length
    ? assignmentsFromBlocks(blocks)
    : (await defaultPlanFor(tx, userId, profile, date)).blocks;
  if (!assignments.some((row) => row.kind === "training")) {
    assignments.push({ kind: "training", templateId: null });
  }
  const materialised = await materializeInTx(tx, userId, { date, blocks: assignments });
  blocks = materialised.blocks;
  return blocks;
}

/** The focus: `days.work_focus_habit_id` and one container item per work row. */
async function resolveFocus(
  tx: Tx,
  userId: string,
  day: DayRow,
  blocks: readonly BlockRow[],
  input: ConfirmDayInput,
): Promise<string | null> {
  const focusId =
    input.focusHabitId === undefined ? day.workFocusHabitId : input.focusHabitId;
  const workRows = blocks.filter((row) => row.kind === "work");

  if (focusId === null) {
    for (const block of workRows) {
      const removable = block.items
        .filter((item) => item.type === "deep_work" && item.templateSlotId === null)
        .filter(isUntouchedItem)
        .map((item) => item.id);
      if (removable.length > 0) await tx.delete(dayItems).where(inArray(dayItems.id, removable));
    }
    return null;
  }

  const focus = (await readHabits(tx, userId, [focusId])).get(focusId);
  if (!focus) throw new ConfirmRuleError("no_such_habit");

  for (const block of workRows) {
    const existing = block.items.find(
      (item) => item.type === "deep_work" && item.templateSlotId === null,
    );
    const values = habitItem(focus, { durationMin: null, sortOrder: 0, snapshot: null });
    if (existing && isUntouchedItem(existing)) {
      await tx
        .update(dayItems)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(dayItems.id, existing.id));
    } else if (!existing) {
      await tx.insert(dayItems).values({ ...values, userId, dayId: day.id, dayBlockId: block.id });
    }
  }
  return focusId;
}

/** §7.3 — yesterday's after-devices-off items, answered. */
async function confirmLastNight(
  tx: Tx,
  userId: string,
  date: string,
  doneItemIds: ReadonlySet<string>,
  now: Date,
): Promise<void> {
  const yesterday = await readDay(tx, userId, addDays(date, -1));
  if (!yesterday) return;
  const blocks = await readDayBlocks(tx, userId, yesterday.id);
  const windDown = blocks.find((block) => block.kind === "wind_down");
  if (!windDown) return;

  const pending = afterDevicesOff(windDown.items).filter(
    (item) =>
      item.assignmentState === "assigned" &&
      item.completionState === "upcoming" &&
      item.doneAt === null,
  );
  for (const item of pending) {
    if (doneItemIds.has(item.id)) {
      await tx
        .update(dayItems)
        .set({ completionState: "done", doneAt: now, updatedAt: now })
        .where(eq(dayItems.id, item.id));
    } else {
      await tx
        .update(dayItems)
        .set({ completionState: "not_confirmed", updatedAt: now })
        .where(eq(dayItems.id, item.id));
    }
  }
}

/* --------------------------------------------------------------- main -- */

export async function confirmDay(
  rls: RlsClient,
  userId: string,
  input: ConfirmDayInput,
  context: ConfirmContext,
): Promise<DayView> {
  const outcome = await rls.execute(async (tx) => {
    const profile = await readDayProfile(tx, userId);
    const existing = await readDay(tx, userId, input.date);

    if (existing?.closedAt) throw new ConfirmRuleError("closed");
    if (existing?.confirmedAt) return { dayId: existing.id, changed: false };

    /* -- the shape, and the blocks the day has -------------------------- */

    const shape: DayShape | undefined =
      input.shape ??
      (input.workingToday === undefined
        ? undefined
        : input.workingToday
          ? "structured"
          : "unstructured");

    let plan: { blocks: BlockAssignment[] | "keep"; shape?: DayShape; focusHabitId?: string | null };
    if (existing) {
      plan = { blocks: "keep", shape };
    } else {
      const defaults = await defaultPlanFor(tx, userId, profile, input.date);
      plan = {
        blocks: defaults.blocks,
        shape: shape ?? defaults.shape,
        focusHabitId: defaults.focusHabitId,
      };
    }
    const built = await materializeInTx(tx, userId, { date: input.date, ...plan });
    const day = built.day;

    /* -- resolve the pools ---------------------------------------------- */

    await resolveMorning(tx, userId, day, profile, built.blocks, input);
    await resolveAlternates(tx, userId, day, await readDayBlocks(tx, userId, day.id), input);

    let blocks: BlockRowWithSplit[] = (await readDayBlocks(tx, userId, day.id)).map((row) => ({
      ...row,
      splitIndex: null,
    }));
    if (day.shape === "structured") {
      blocks = await resolveTraining(tx, userId, day, profile, blocks, input);
    }
    // The training block's placement decides the order; write it now.
    await renumberBlocks(tx, blocks, profile.blockOrder);

    const focusId =
      day.shape === "structured"
        ? await resolveFocus(tx, userId, day, await readDayBlocks(tx, userId, day.id), input)
        : null;

    /* -- the walk, forward from wake ------------------------------------ */

    const anchorIsHard =
      profile.anchorDirection === "depends"
        ? (input.anchorIsHard ?? true)
        : anchorIsHardFor(profile.anchorDirection);

    const laidBlocks = await readDayBlocks(tx, userId, day.id);
    const layout = layoutFor(laidBlocks, {
      day,
      profile,
      anchorIsHard,
      workStartTime: profile.workStartTime,
    });
    await writeLayout(tx, laidBlocks, layout, day, false);

    /* -- the record begins ---------------------------------------------- */

    const now = context.now;
    await tx
      .update(days)
      .set({
        confirmedAt: now,
        shape: day.shape,
        anchorIsHard,
        workStartTime:
          layout.workStartMin === null ? null : clockFromMinutes(layout.workStartMin % 1440),
        workFocusHabitId: focusId,
        updatedAt: now,
      })
      .where(eq(days.id, day.id));

    // UX v1.3 TD-26 (DAY-6): a pooled FREE TIME block is not set with the day —
    // the evening is chosen, never inferred; it stays pooled until a tap.
    const blockIds = laidBlocks
      .filter((block) => !(block.kind === "activity" && block.state === "pooled"))
      .map((block) => block.id);
    await tx
      .update(dayBlocks)
      .set({ state: "set", updatedAt: now })
      .where(
        and(
          inArray(dayBlocks.id, blockIds),
          inArray(dayBlocks.state, ["planned", "pooled"]),
        ),
      );
    // The one NULL → value transition the trigger permits, made once.
    await tx
      .update(dayBlocks)
      .set({ originalScheduledStart: sql`${dayBlocks.scheduledStart}` })
      .where(and(inArray(dayBlocks.id, blockIds), isNull(dayBlocks.originalScheduledStart)));
    await tx
      .update(dayItems)
      .set({ originalScheduledStart: sql`${dayItems.scheduledStart}` })
      .where(
        and(
          eq(dayItems.dayId, day.id),
          eq(dayItems.userId, userId),
          isNull(dayItems.originalScheduledStart),
        ),
      );

    /* -- yesterday, and the pushes --------------------------------------- */

    if (!context.leaveLastNight) {
      await confirmLastNight(
        tx,
        userId,
        input.date,
        new Set(input.lastNight?.doneItemIds ?? []),
        now,
      );
    }

    return { dayId: day.id, changed: true };
  });

  if (outcome.changed) {
    await enqueueBlockPushes(rls, userId, outcome.dayId);
  }

  return getDay(rls, userId, input.date, context);
}
