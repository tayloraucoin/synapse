import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";

import {
  dayBlocks,
  dayItems,
  days,
  fixtures,
  habits,
  templateSlots,
  templates,
  users,
  type RlsClient,
} from "@syn/db";
import { DEFAULT_BLOCK_ORDER } from "@syn/constants";
import type {
  AnchorDirection,
  BlockFlow,
  BlockKind,
  BlockStructure,
  DayBlockState,
  DayShape,
  IconValue,
  ItemOrigin,
  ItemType,
  OverflowMode,
  Scheduling,
  SlotRole,
  TrainingPlacement,
  WorkDays,
} from "@syn/types";
import {
  clockMinutes,
  instantToWallClockMinutes,
  wallClockToInstant,
  weekdayIndex,
} from "@syn/utils";

import { ensurePhoneAwayHabit } from "../library/placed-habits";
import { walkDurationOf } from "../plan/to-view";
import {
  layOutDay,
  type DayLayout,
  type LayoutBlock,
  type LayoutItem,
} from "./lay-out-day";
import {
  isUntouchedBlock,
  isUntouchedItem,
  type TouchableRow,
} from "./untouched";

/**
 * THE materialiser, rebuilt around blocks — UX v1.1 §11.11, TD-2, TD-5, TD-8.
 *
 * One function, six callers: apply a template to a block, change a day's
 * start, remove a block's template, re-apply after a template edit, the
 * week's pre-fill, and the zone-change re-lay. And one more, from inside:
 * `confirmDay` runs the same passes after resolving the pools.
 *
 * IT RECONCILES; IT DOES NOT REBUILD — at two levels now. Blocks are matched
 * by kind, items by slot (or by the fixture's title, or by being the marker).
 * The untouched are updated, the missing inserted, the gone deleted; anything
 * touched is left exactly as it is and, at most, loses its template link.
 * `isUntouchedItem` and `isUntouchedBlock` are the only two opinions about
 * what may be rewritten.
 *
 * NOTHING DERIVED FROM THE PICK EXISTS BEFORE THE PICK (R23). A pooled block
 * is a row with no items; an alternates group materialises its default only;
 * a training block has no workout until it is placed. And
 * `original_scheduled_start` is null on everything the pick can still move —
 * it is written at build for fixtures and pins alone, and at *Set the day*
 * for the rest, once, by the one path that ever includes it in a write.
 *
 * THE WALK IS `layOutDay` → `stackBlock`. Minutes come out; they become
 * instants only through `wallClockToInstant` in the day's OWN snapshotted
 * zone (cross-cutting §7.3). There is no local date arithmetic in this file
 * and there must not be.
 */

export type BlockAssignment = {
  kind: BlockKind;
  /** Null: no template. `"pool"`: decided in the morning, holds nothing yet. */
  templateId: string | null | "pool";
};

export type MaterializeInput = {
  date: string;
  /** The day's blocks, or `"keep"` to re-lay what is there. */
  blocks: BlockAssignment[] | "keep";
  shape?: DayShape;
  /** Overrides the wake anchor for this day. */
  anchorTime?: string;
  /** The week's focus for a work day. */
  focusHabitId?: string | null;
  /**
   * An anchor change is the ONE case that writes to touched rows, and only
   * their two scheduled-time columns (Epic 1 WK-02).
   */
  recomputeTouchedTimes?: boolean;
};

export type MaterializeCounts = {
  inserted: number;
  updated: number;
  deleted: number;
  kept: number;
};

export type MaterializeResult = MaterializeCounts & {
  dayId: string;
  blocks: MaterializeCounts;
  items: MaterializeCounts;
};

export type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

/* ------------------------------------------------------------ profile -- */

export type DayProfile = {
  timezone: string;
  dayCloseTime: string;
  usualWakeTime: string;
  workStartTime: string | null;
  workEndTime: string | null;
  lightsOutTime: string | null;
  devicesOffTime: string | null;
  anchorDirection: AnchorDirection | null;
  overflowMode: OverflowMode;
  workDays: WorkDays | null;
  blockOrder: BlockKind[];
};

export async function readDayProfile(tx: Tx, userId: string): Promise<DayProfile> {
  const [row] = await tx
    .select({
      timezone: users.timezone,
      dayCloseTime: users.dayCloseTime,
      usualWakeTime: users.usualWakeTime,
      workStartTime: users.workStartTime,
      workEndTime: users.workEndTime,
      lightsOutTime: users.lightsOutTime,
      devicesOffTime: users.devicesOffTime,
      anchorDirection: users.anchorDirection,
      overflowMode: users.overflowMode,
      workDays: users.workDays,
      blockOrder: users.blockOrder,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) throw new Error("no account row");

  return {
    ...row,
    blockOrder:
      row.blockOrder && row.blockOrder.length > 0
        ? (row.blockOrder as BlockKind[])
        : [...DEFAULT_BLOCK_ORDER],
  };
}

/** The anchor's hardness by profile — the pick's answer overrides under *depends*. */
export function anchorIsHardFor(direction: AnchorDirection | null): boolean {
  return direction !== "work_waits";
}

/* ---------------------------------------------------------------- day -- */

export type DayRow = {
  id: string;
  date: string;
  timezone: string;
  anchorTime: string;
  wokeAt: Date | null;
  shape: DayShape;
  confirmedAt: Date | null;
  closedAt: Date | null;
  anchorIsHard: boolean | null;
  workStartTime: string | null;
  workFocusHabitId: string | null;
};

const DAY_COLUMNS = {
  id: days.id,
  date: days.date,
  timezone: days.timezone,
  anchorTime: days.anchorTime,
  wokeAt: days.wokeAt,
  shape: days.shape,
  confirmedAt: days.confirmedAt,
  closedAt: days.closedAt,
  anchorIsHard: days.anchorIsHard,
  workStartTime: days.workStartTime,
  workFocusHabitId: days.workFocusHabitId,
} as const;

export async function readDay(
  tx: Tx,
  userId: string,
  date: string,
): Promise<DayRow | null> {
  const [row] = await tx
    .select(DAY_COLUMNS)
    .from(days)
    .where(and(eq(days.userId, userId), eq(days.date, date)))
    .limit(1);
  return row ? { ...row, date: String(row.date) } : null;
}

/**
 * The day row, created from the profile if absent. Zone and close time are
 * snapshotted ON INSERT ONLY (cross-cutting §7.3); `template_id` is never
 * written (deprecated since 0005, TD-1).
 */
export async function ensureDayRow(
  tx: Tx,
  userId: string,
  profile: DayProfile,
  input: { date: string; shape?: DayShape; anchorTime?: string; focusHabitId?: string | null },
): Promise<DayRow> {
  const existing = await readDay(tx, userId, input.date);

  if (existing) {
    const patch: Record<string, unknown> = {};
    if (input.anchorTime !== undefined) patch.anchorTime = input.anchorTime;
    if (input.shape !== undefined) patch.shape = input.shape;
    if (input.focusHabitId !== undefined) patch.workFocusHabitId = input.focusHabitId;
    if (Object.keys(patch).length > 0) {
      await tx
        .update(days)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(days.id, existing.id));
    }
    return {
      ...existing,
      anchorTime: input.anchorTime ?? existing.anchorTime,
      shape: input.shape ?? existing.shape,
      workFocusHabitId:
        input.focusHabitId === undefined ? existing.workFocusHabitId : input.focusHabitId,
    };
  }

  const [created] = await tx
    .insert(days)
    .values({
      userId,
      date: input.date,
      anchorTime: input.anchorTime ?? profile.usualWakeTime,
      shape: input.shape ?? "structured",
      timezone: profile.timezone,
      dayCloseTime: profile.dayCloseTime,
      workFocusHabitId: input.focusHabitId ?? null,
    })
    .returning(DAY_COLUMNS);

  if (!created) throw new Error("day insert returned no row");
  return { ...created, date: String(created.date) };
}

/* ------------------------------------------------------------- blocks -- */

export type ItemRow = TouchableRow & {
  id: string;
  dayBlockId: string | null;
  templateSlotId: string | null;
  origin: ItemOrigin;
  habitId: string | null;
  title: string;
  type: ItemType;
  timeMode: "fixed_time" | "window" | "unscheduled";
  pinned: boolean;
  sortOrder: number;
  durationMin: number | null;
  gapBeforeMin: number;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  originalScheduledStart: Date | null;
  multitaskId: string | null;
  alternatesId: string | null;
  alternatesChosen: boolean | null;
  scheduling: Scheduling;
  priority: number;
};

export type BlockRow = {
  id: string;
  kind: BlockKind;
  templateId: string | null;
  templateNameSnapshot: string | null;
  state: DayBlockState;
  placement: TrainingPlacement | null;
  sortOrder: number;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  originalScheduledStart: Date | null;
  items: ItemRow[];
};

const ITEM_COLUMNS = {
  id: dayItems.id,
  dayBlockId: dayItems.dayBlockId,
  templateSlotId: dayItems.templateSlotId,
  origin: dayItems.origin,
  habitId: dayItems.habitId,
  title: dayItems.title,
  type: dayItems.type,
  timeMode: dayItems.timeMode,
  pinned: dayItems.pinned,
  sortOrder: dayItems.sortOrder,
  durationMin: dayItems.durationMin,
  gapBeforeMin: dayItems.gapBeforeMin,
  scheduledStart: dayItems.scheduledStart,
  scheduledEnd: dayItems.scheduledEnd,
  originalScheduledStart: dayItems.originalScheduledStart,
  multitaskId: dayItems.multitaskId,
  alternatesId: dayItems.alternatesId,
  alternatesChosen: dayItems.alternatesChosen,
  scheduling: dayItems.scheduling,
  priority: dayItems.priority,
  assignmentState: dayItems.assignmentState,
  completionState: dayItems.completionState,
  deferredAt: dayItems.deferredAt,
  doneAt: dayItems.doneAt,
  sessionCount: sql<number>`(SELECT COUNT(*)::int FROM timer_sessions ts WHERE ts.day_item_id = ${dayItems.id})`,
  missCount: sql<number>`(SELECT COUNT(*)::int FROM misses m WHERE m.day_item_id = ${dayItems.id})`,
} as const;

export async function readDayItems(
  tx: Tx,
  userId: string,
  dayId: string,
): Promise<ItemRow[]> {
  const rows = await tx
    .select(ITEM_COLUMNS)
    .from(dayItems)
    .where(and(eq(dayItems.dayId, dayId), eq(dayItems.userId, userId)))
    .orderBy(asc(dayItems.sortOrder), asc(dayItems.createdAt));
  return rows.map((row) => ({
    ...row,
    sessionCount: Number(row.sessionCount),
    missCount: Number(row.missCount),
  }));
}

/** The day's blocks with their items, in `sort_order`. */
export async function readDayBlocks(
  tx: Tx,
  userId: string,
  dayId: string,
): Promise<BlockRow[]> {
  const blockRows = await tx
    .select({
      id: dayBlocks.id,
      kind: dayBlocks.kind,
      templateId: dayBlocks.templateId,
      templateNameSnapshot: dayBlocks.templateNameSnapshot,
      state: dayBlocks.state,
      placement: dayBlocks.placement,
      sortOrder: dayBlocks.sortOrder,
      scheduledStart: dayBlocks.scheduledStart,
      scheduledEnd: dayBlocks.scheduledEnd,
      originalScheduledStart: dayBlocks.originalScheduledStart,
    })
    .from(dayBlocks)
    .where(and(eq(dayBlocks.dayId, dayId), eq(dayBlocks.userId, userId)))
    .orderBy(asc(dayBlocks.sortOrder), asc(dayBlocks.createdAt));

  const items = await readDayItems(tx, userId, dayId);
  const byBlock = new Map<string, ItemRow[]>();
  for (const item of items) {
    if (item.dayBlockId === null) continue;
    const list = byBlock.get(item.dayBlockId) ?? [];
    list.push(item);
    byBlock.set(item.dayBlockId, list);
  }

  return blockRows.map((row) => ({ ...row, items: byBlock.get(row.id) ?? [] }));
}

/* ---------------------------------------------------------- templates -- */

export type TemplateRow = {
  id: string;
  name: string;
  kind: BlockKind;
  flow: BlockFlow;
  structure: BlockStructure;
  anchorTime: string | null;
};

export type SlotRowFull = {
  id: string;
  habitId: string;
  timeMode: "fixed_time" | "window" | "unscheduled";
  offsetStartMin: number | null;
  offsetEndMin: number | null;
  durationMin: number;
  gapBeforeMin: number;
  pinnedAt: string | null;
  role: SlotRole;
  priorityOverride: number | null;
  scheduling: Scheduling;
  multitaskGroup: string | null;
  alternatesGroup: string | null;
  alternatesDefault: boolean;
  sortOrder: number;
  habitTitle: string;
  habitIcon: IconValue;
  habitType: ItemType;
  habitLifePriority: number;
  habitQuantityUnit: string | null;
  habitReflectionAxes: string[];
  habitPreflight: string | null;
};

export async function readTemplates(
  tx: Tx,
  userId: string,
  ids: readonly string[],
): Promise<Map<string, TemplateRow>> {
  if (ids.length === 0) return new Map();
  const rows = await tx
    .select({
      id: templates.id,
      name: templates.name,
      kind: templates.kind,
      flow: templates.flow,
      structure: templates.structure,
      anchorTime: templates.anchorTime,
    })
    .from(templates)
    .where(and(eq(templates.userId, userId), inArray(templates.id, [...ids])));
  return new Map(rows.map((row) => [row.id, row]));
}

export async function readTemplateSlots(
  tx: Tx,
  userId: string,
  templateId: string,
): Promise<SlotRowFull[]> {
  return tx
    .select({
      id: templateSlots.id,
      habitId: templateSlots.habitId,
      timeMode: templateSlots.timeMode,
      offsetStartMin: templateSlots.offsetStartMin,
      offsetEndMin: templateSlots.offsetEndMin,
      durationMin: templateSlots.durationMin,
      gapBeforeMin: templateSlots.gapBeforeMin,
      pinnedAt: templateSlots.pinnedAt,
      role: templateSlots.role,
      priorityOverride: templateSlots.priorityOverride,
      scheduling: templateSlots.scheduling,
      multitaskGroup: templateSlots.multitaskGroup,
      alternatesGroup: templateSlots.alternatesGroup,
      alternatesDefault: templateSlots.alternatesDefault,
      sortOrder: templateSlots.sortOrder,
      habitTitle: habits.title,
      habitIcon: habits.icon,
      habitType: habits.type,
      habitLifePriority: habits.lifePriority,
      habitQuantityUnit: habits.quantityUnit,
      habitReflectionAxes: habits.reflectionAxes,
      habitPreflight: habits.defaultNotesPreflight,
    })
    .from(templateSlots)
    .innerJoin(habits, eq(habits.id, templateSlots.habitId))
    .where(
      and(
        eq(templateSlots.templateId, templateId),
        eq(templateSlots.userId, userId),
      ),
    )
    .orderBy(asc(templateSlots.sortOrder), asc(templateSlots.createdAt));
}

/** The person's first active template of a kind — the default assignment. */
export async function defaultTemplateFor(
  tx: Tx,
  userId: string,
  kind: BlockKind,
): Promise<string | null> {
  const [row] = await tx
    .select({ id: templates.id })
    .from(templates)
    .where(
      and(
        eq(templates.userId, userId),
        eq(templates.kind, kind),
        isNull(templates.archivedAt),
      ),
    )
    .orderBy(asc(templates.createdAt))
    .limit(1);
  return row?.id ?? null;
}

/* ------------------------------------------------------- block order -- */

/**
 * Where each block sits — the profile's order for the six, and the two
 * placeable kinds by their placement (after the morning until placed).
 */
export function orderBlocks<T extends { kind: BlockKind; placement: TrainingPlacement | null; splitIndex: 0 | 1 | null }>(
  blocks: readonly T[],
  blockOrder: readonly BlockKind[],
): T[] {
  const rank = new Map<BlockKind, number>();
  blockOrder.forEach((kind, index) => rank.set(kind, index * 10));
  for (const kind of DEFAULT_BLOCK_ORDER) {
    if (!rank.has(kind)) rank.set(kind, rank.size * 10);
  }

  const position = (block: T): number => {
    const own = rank.get(block.kind);
    if (own !== undefined) {
      // The second half of a split container follows the training inside it.
      return block.kind === "work" && block.splitIndex === 1 ? own + 6 : own;
    }
    const morning = rank.get("morning") ?? 10;
    const work = rank.get("work") ?? 30;
    const bias = block.kind === "training" ? 0 : 1;
    switch (block.placement) {
      case "before_morning":
        return morning - 5 + bias;
      case "inside_work":
        return work + 3 + bias;
      case "after_work":
        return work + 8 + bias;
      case "in_break":
        return work + 8 + bias;
      case "after_morning":
      case null:
        return morning + 5 + bias;
    }
  };

  return [...blocks].sort((a, b) => position(a) - position(b));
}

/* ------------------------------------------------------------ desired -- */

type DesiredBlock = {
  kind: BlockKind;
  templateId: string | null;
  pooled: boolean;
  splitIndex: 0 | 1 | null;
};

export type DesiredItem = {
  key: string;
  templateSlotId: string | null;
  origin: ItemOrigin;
  habitId: string | null;
  title: string;
  icon: IconValue;
  type: ItemType;
  quantityUnit: string | null;
  reflectionAxes: string[];
  notesPreflight: string | null;
  durationMin: number;
  gapBeforeMin: number;
  pinnedAtMin: number | null;
  scheduling: Scheduling;
  priority: number;
  sortOrder: number;
  multitaskGroup: string | null;
  alternatesGroup: string | null;
  alternatesChosen: boolean;
  templateNameSnapshot: string | null;
  /** Fixtures and pins: the time is decided, so the ghost can start now. */
  originalAtBuild: boolean;
  spansBlock: boolean;
  /** The slot's role, for the marker's position; absent off a template. */
  role?: SlotRole;
};

const FIXTURE_ICON: IconValue = { kind: "curated", value: "dot", colorKey: null };

/** `HH:mm:ss` from the driver → `HH:mm`. */
function clockOf(time: string): string {
  return time.slice(0, 5);
}

/** Minutes from midnight → "HH:mm", allowing past 24:00 for USE-1 to roll. */
export function minutesToClock(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = ((minutes % 60) + 60) % 60;
  return `${hour}:${String(minute).padStart(2, "0")}`;
}

export function slotToDesired(
  slot: SlotRowFull,
  template: TemplateRow,
  sortOrder: number,
): DesiredItem {
  return {
    key: `slot:${slot.id}`,
    templateSlotId: slot.id,
    origin: "template",
    habitId: slot.habitId,
    title: slot.habitTitle,
    icon: slot.habitIcon,
    type: slot.habitType,
    quantityUnit: slot.habitQuantityUnit,
    reflectionAxes: slot.habitReflectionAxes,
    notesPreflight: slot.habitPreflight,
    durationMin: walkDurationOf(slot),
    gapBeforeMin: slot.pinnedAt === null ? slot.gapBeforeMin : 0,
    pinnedAtMin: slot.pinnedAt === null ? null : clockMinutes(clockOf(slot.pinnedAt)),
    scheduling: slot.scheduling,
    // §6.6: the slot's override, else the habit's life priority.
    priority: slot.priorityOverride ?? slot.habitLifePriority,
    sortOrder,
    multitaskGroup: slot.multitaskGroup,
    alternatesGroup: slot.alternatesGroup,
    alternatesChosen: slot.alternatesGroup === null ? false : slot.alternatesDefault,
    templateNameSnapshot: template.name,
    originalAtBuild: slot.pinnedAt !== null,
    spansBlock: false,
    role: slot.role,
  };
}

/**
 * What a decided block holds at build — UX v1.1 §11.11 phase 1.
 *
 * Opener · pool · closer: the opener and closer only; the pool is the pick's.
 * A *one of* group: its default member only; the other is created at the
 * pick if chosen. `chosenSlotIds` is confirm's way of saying which.
 */
export function desiredTemplateItems(
  template: TemplateRow,
  slots: readonly SlotRowFull[],
  options: { includePool: boolean; chosenSlotIds?: ReadonlySet<string> },
): DesiredItem[] {
  const chosenGroups = new Set<string>();
  if (options.chosenSlotIds) {
    for (const slot of slots) {
      if (slot.alternatesGroup !== null && options.chosenSlotIds.has(slot.id)) {
        chosenGroups.add(slot.alternatesGroup);
      }
    }
  }

  const items: DesiredItem[] = [];
  let sortOrder = 0;
  for (const slot of slots) {
    if (
      template.structure === "opener_pool_closer" &&
      slot.role === "pool" &&
      !options.includePool
    ) {
      continue;
    }
    if (slot.alternatesGroup !== null) {
      const chosen = chosenGroups.has(slot.alternatesGroup)
        ? options.chosenSlotIds?.has(slot.id) === true
        : slot.alternatesDefault;
      if (!chosen) continue;
      items.push({ ...slotToDesired(slot, template, sortOrder), alternatesChosen: true });
    } else {
      items.push(slotToDesired(slot, template, sortOrder));
    }
    sortOrder += 1;
  }
  return items;
}

/**
 * Where the devices-off marker goes in the wind-down stack (§7.1): after the
 * closer — the journal, which needs the phone — and before everything that
 * does not. In a plain stack, after the slot whose habit is the journal, if
 * there is one; else first, so every item is after devices-off.
 */
function markerPosition(items: readonly DesiredItem[]): number {
  let position = -1;
  items.forEach((item, index) => {
    if (item.role === "closer") position = index;
  });
  if (position === -1) {
    items.forEach((item, index) => {
      if (item.title.trim().toLowerCase() === "journal") position = index;
    });
  }
  return position + 1;
}

/* --------------------------------------------------------- reconcile -- */

export type BlockRowWithSplit = BlockRow & { splitIndex: 0 | 1 | null };

type ReconcileBlocksResult = {
  blocks: BlockRowWithSplit[];
  counts: MaterializeCounts;
};

/**
 * Blocks: match by kind (and half, for a split container); create the
 * missing, re-point the untouched, delete the untouched whose assignment is
 * gone — a touched block keeps its rows and loses only its link (SET-6's
 * rule, one level up).
 */
async function reconcileBlocks(
  tx: Tx,
  userId: string,
  day: DayRow,
  existing: readonly BlockRow[],
  desired: readonly DesiredBlock[],
  templatesById: ReadonlyMap<string, TemplateRow>,
  blockOrder: readonly BlockKind[],
): Promise<ReconcileBlocksResult> {
  const counts: MaterializeCounts = { inserted: 0, updated: 0, deleted: 0, kept: 0 };

  const remaining = [...existing].sort((a, b) => a.sortOrder - b.sortOrder);
  const survivors: BlockRowWithSplit[] = [];

  for (const want of desired) {
    const index = remaining.findIndex((row) => row.kind === want.kind);
    const template = want.templateId === null ? null : templatesById.get(want.templateId) ?? null;
    const state: DayBlockState = want.pooled ? "pooled" : "planned";

    if (index === -1) {
      const [created] = await tx
        .insert(dayBlocks)
        .values({
          userId,
          dayId: day.id,
          kind: want.kind,
          templateId: template?.id ?? null,
          templateNameSnapshot: template?.name ?? null,
          state,
          // Provisional; the two-pass renumber below writes the real order.
          sortOrder: -1 - survivors.length,
        })
        .returning({ id: dayBlocks.id });
      if (!created) throw new Error("day_blocks insert returned no row");
      counts.inserted += 1;
      survivors.push({
        id: created.id,
        kind: want.kind,
        templateId: template?.id ?? null,
        templateNameSnapshot: template?.name ?? null,
        state,
        placement: null,
        sortOrder: 0,
        scheduledStart: null,
        scheduledEnd: null,
        originalScheduledStart: null,
        items: [],
        splitIndex: want.splitIndex,
      });
      continue;
    }

    const [row] = remaining.splice(index, 1);
    if (!row) continue;

    if (isUntouchedBlock(row)) {
      const nextState: DayBlockState =
        row.state === "not_today" ? row.state : want.pooled ? "pooled" : "planned";
      await tx
        .update(dayBlocks)
        .set({
          templateId: template?.id ?? null,
          templateNameSnapshot: template?.name ?? row.templateNameSnapshot,
          state: nextState,
          updatedAt: new Date(),
        })
        .where(eq(dayBlocks.id, row.id));
      counts.updated += 1;
      survivors.push({
        ...row,
        templateId: template?.id ?? null,
        templateNameSnapshot: template?.name ?? row.templateNameSnapshot,
        state: nextState,
        splitIndex: want.splitIndex,
      });
      continue;
    }

    // Touched: the rows stay; only the link may change.
    if (row.templateId !== (template?.id ?? null)) {
      await tx
        .update(dayBlocks)
        .set({ templateId: template?.id ?? null, updatedAt: new Date() })
        .where(eq(dayBlocks.id, row.id));
    }
    counts.kept += 1;
    survivors.push({ ...row, templateId: template?.id ?? null, splitIndex: want.splitIndex });
  }

  // Blocks whose assignment is gone.
  for (const row of remaining) {
    if (isUntouchedBlock(row)) {
      // Items cascade — every one of them is untouched, by the predicate.
      await tx.delete(dayBlocks).where(eq(dayBlocks.id, row.id));
      counts.deleted += 1;
      continue;
    }
    if (row.templateId !== null) {
      await tx
        .update(dayBlocks)
        .set({ templateId: null, updatedAt: new Date() })
        .where(eq(dayBlocks.id, row.id));
    }
    counts.kept += 1;
    survivors.push({ ...row, templateId: null, splitIndex: row.kind === "work" ? 0 : null });
  }

  // Two work rows: the earlier is the first half.
  const workRows = survivors.filter((row) => row.kind === "work");
  if (workRows.length >= 2) {
    workRows.sort((a, b) => a.sortOrder - b.sortOrder);
    workRows.forEach((row, index) => {
      row.splitIndex = index === 0 ? 0 : 1;
    });
  }

  const ordered = await renumberBlocks(tx, survivors, blockOrder);
  return { blocks: ordered, counts };
}

/**
 * The order, written in two passes so the unique (day, kind, sort) index
 * never sees two rows swap through the same value.
 */
export async function renumberBlocks(
  tx: Tx,
  blocks: readonly BlockRowWithSplit[],
  blockOrder: readonly BlockKind[],
): Promise<BlockRowWithSplit[]> {
  const ordered = orderBlocks(blocks, blockOrder);
  for (const [index, row] of ordered.entries()) {
    await tx
      .update(dayBlocks)
      .set({ sortOrder: -100 - index })
      .where(eq(dayBlocks.id, row.id));
  }
  for (const [index, row] of ordered.entries()) {
    await tx.update(dayBlocks).set({ sortOrder: index }).where(eq(dayBlocks.id, row.id));
    row.sortOrder = index;
  }
  return ordered;
}

/**
 * Items in one block: match by key, update the untouched, insert the
 * missing, delete the untouched whose source is gone. Rows this pass did not
 * ask for — menu items, the workout, the focus, one-offs — are left alone;
 * they are the pick's and the person's, not the template's.
 */
export async function reconcileItems(
  tx: Tx,
  userId: string,
  day: DayRow,
  block: BlockRow,
  desired: readonly DesiredItem[],
  markerHabitId: string | null,
  recomputeTouchedTimes: boolean,
): Promise<MaterializeCounts> {
  const counts: MaterializeCounts = { inserted: 0, updated: 0, deleted: 0, kept: 0 };

  const keyOf = (row: ItemRow): string | null => {
    if (row.templateSlotId !== null) return `slot:${row.templateSlotId}`;
    if (row.origin === "fixture") return `fixture:${row.title}`;
    if (
      markerHabitId !== null &&
      row.habitId === markerHabitId &&
      row.pinned &&
      row.origin === "template"
    ) {
      return "marker";
    }
    return null;
  };

  const byKey = new Map<string, ItemRow>();
  for (const row of block.items) {
    const key = keyOf(row);
    if (key !== null && !byKey.has(key)) byKey.set(key, row);
  }

  // One id per group per day, kept across re-materialisation.
  const multitaskIds = new Map<string, string>();
  const alternatesIds = new Map<string, string>();
  for (const want of desired) {
    const match = byKey.get(want.key);
    if (want.multitaskGroup !== null && !multitaskIds.has(want.multitaskGroup)) {
      multitaskIds.set(want.multitaskGroup, match?.multitaskId ?? crypto.randomUUID());
    }
    if (want.alternatesGroup !== null && !alternatesIds.has(want.alternatesGroup)) {
      alternatesIds.set(want.alternatesGroup, match?.alternatesId ?? crypto.randomUUID());
    }
  }

  const seen = new Set<string>();

  for (const want of desired) {
    seen.add(want.key);
    const pinStart =
      want.pinnedAtMin === null
        ? null
        : wallClockToInstant(day.date, minutesToClock(want.pinnedAtMin), day.timezone);
    const pinEnd =
      pinStart === null ? null : new Date(pinStart.getTime() + want.durationMin * 60000);

    const shared = {
      title: want.title,
      icon: want.icon,
      type: want.type,
      quantityUnit: want.quantityUnit,
      reflectionAxes: want.reflectionAxes,
      notesPreflight: want.notesPreflight,
      timeMode: "fixed_time" as const,
      durationMin: want.durationMin,
      gapBeforeMin: want.gapBeforeMin,
      pinned: want.pinnedAtMin !== null,
      priority: want.priority,
      scheduling: want.scheduling,
      sortOrder: want.sortOrder,
      multitaskId:
        want.multitaskGroup === null ? null : (multitaskIds.get(want.multitaskGroup) ?? null),
      alternatesId:
        want.alternatesGroup === null ? null : (alternatesIds.get(want.alternatesGroup) ?? null),
      alternatesChosen: want.alternatesGroup === null ? null : want.alternatesChosen,
      templateNameSnapshot: want.templateNameSnapshot,
      dayBlockId: block.id,
    };

    const match = byKey.get(want.key);

    if (!match) {
      await tx.insert(dayItems).values({
        ...shared,
        userId,
        dayId: day.id,
        habitId: want.habitId,
        templateSlotId: want.templateSlotId,
        origin: want.origin,
        // Pins and fixtures have a decided time; everything else waits for
        // the pick (TD-5). The only INSERT that carries the column.
        scheduledStart: pinStart,
        scheduledEnd: pinEnd,
        originalScheduledStart: want.originalAtBuild ? pinStart : null,
      });
      counts.inserted += 1;
      continue;
    }

    if (isUntouchedItem(match)) {
      await tx
        .update(dayItems)
        .set({
          ...shared,
          ...(pinStart === null ? {} : { scheduledStart: pinStart, scheduledEnd: pinEnd }),
          updatedAt: new Date(),
        })
        .where(eq(dayItems.id, match.id));
      counts.updated += 1;
      continue;
    }

    if (recomputeTouchedTimes && pinStart !== null) {
      await tx
        .update(dayItems)
        .set({ scheduledStart: pinStart, scheduledEnd: pinEnd, updatedAt: new Date() })
        .where(eq(dayItems.id, match.id));
    }
    counts.kept += 1;
  }

  // Sources that are gone: untouched rows go, touched rows stay unlinked.
  const orphaned = block.items.filter((row) => {
    const key = keyOf(row);
    return key !== null && !seen.has(key);
  });
  const removable = orphaned.filter(isUntouchedItem).map((row) => row.id);
  const survivors = orphaned.filter((row) => !isUntouchedItem(row));

  if (removable.length > 0) {
    const gone = await tx
      .delete(dayItems)
      .where(inArray(dayItems.id, removable))
      .returning({ id: dayItems.id });
    counts.deleted += gone.length;
  }
  if (survivors.length > 0) {
    await tx
      .update(dayItems)
      .set({ templateSlotId: null, updatedAt: new Date() })
      .where(
        inArray(
          dayItems.id,
          survivors.map((row) => row.id),
        ),
      );
    counts.kept += survivors.length;
  }

  return counts;
}

/* ------------------------------------------------------------- layout -- */

export type LayoutContext = {
  day: DayRow;
  profile: DayProfile;
  /** Confirm's answer; the profile's direction otherwise. */
  anchorIsHard: boolean;
  /** Today's work anchor if it has slid; the profile's otherwise. */
  workStartTime: string | null;
};

/** A row → a stack item, in the day's zone. Pins keep their stored clock. */
function rowToLayoutItem(row: ItemRow, zone: string, wakeMin: number): LayoutItem | null {
  if (row.assignmentState !== "assigned") return null;
  if (row.timeMode === "unscheduled") return null;
  let pinnedAtMin: number | null = null;
  if (row.pinned) {
    if (row.scheduledStart === null) return null;
    pinnedAtMin = instantToWallClockMinutes(row.scheduledStart, zone);
    if (pinnedAtMin < wakeMin) pinnedAtMin += 1440;
  }
  return {
    id: row.id,
    durationMin: row.durationMin ?? 0,
    gapBeforeMin: row.gapBeforeMin,
    pinnedAtMin,
    scheduling: row.scheduling,
    priority: row.priority,
    multitaskId: row.multitaskId,
    alternatesId: row.alternatesId,
    alternatesChosen: row.alternatesChosen ?? undefined,
    spansBlock: row.type === "deep_work" && row.templateSlotId === null,
  };
}

export function wakeMinutesOf(day: DayRow): number {
  return day.wokeAt === null
    ? clockMinutes(clockOf(day.anchorTime))
    : instantToWallClockMinutes(day.wokeAt, day.timezone);
}

export function toLayoutBlocks(
  blocks: readonly BlockRow[],
  day: DayRow,
): LayoutBlock[] {
  const wakeMin = wakeMinutesOf(day);
  const workRows = blocks.filter((row) => row.kind === "work");
  return blocks.map((row) => ({
    id: row.id,
    kind: row.kind,
    flow: row.kind === "prep" || row.kind === "wind_down" ? "backward" : "forward",
    sortOrder: row.sortOrder,
    state: row.state,
    placement: row.placement,
    splitIndex:
      row.kind === "work" && workRows.length >= 2
        ? workRows.indexOf(row) === 0
          ? 0
          : 1
        : null,
    items: row.items
      .map((item) => rowToLayoutItem(item, day.timezone, wakeMin))
      .filter((item): item is LayoutItem => item !== null),
  }));
}

export function layoutFor(blocks: readonly BlockRow[], context: LayoutContext): DayLayout {
  const { day, profile } = context;
  const minutes = (clock: string | null): number | null =>
    clock === null ? null : clockMinutes(clockOf(clock));
  return layOutDay(toLayoutBlocks(blocks, day), {
    wakeMin: wakeMinutesOf(day),
    workStartMin: minutes(context.workStartTime ?? profile.workStartTime),
    workEndMin: minutes(profile.workEndTime),
    lightsOutMin: minutes(profile.lightsOutTime),
    anchorIsHard: context.anchorIsHard,
  });
}

/**
 * Write the walk's minutes as instants — untouched items always, touched
 * items only on an anchor change, block spans always. Never the originals:
 * those are confirm's, in `confirm-day.ts`, and the trigger stands behind it.
 */
export async function writeLayout(
  tx: Tx,
  blocks: readonly BlockRow[],
  layout: DayLayout,
  day: DayRow,
  recomputeTouchedTimes: boolean,
): Promise<void> {
  const instant = (minutes: number | null): Date | null =>
    minutes === null ? null : wallClockToInstant(day.date, minutesToClock(minutes), day.timezone);

  for (const block of blocks) {
    const laid = layout.blocks.find((entry) => entry.id === block.id);
    if (!laid) continue;

    const start = instant(laid.startMin);
    const end = instant(laid.endMin);
    if (
      (block.scheduledStart?.getTime() ?? null) !== (start?.getTime() ?? null) ||
      (block.scheduledEnd?.getTime() ?? null) !== (end?.getTime() ?? null)
    ) {
      await tx
        .update(dayBlocks)
        .set({ scheduledStart: start, scheduledEnd: end, updatedAt: new Date() })
        .where(eq(dayBlocks.id, block.id));
    }

    for (const item of block.items) {
      const placed = laid.items.get(item.id);
      if (!placed) continue;
      if (!isUntouchedItem(item) && !recomputeTouchedTimes) continue;
      const itemStart = instant(placed.startMin);
      const itemEnd = instant(placed.endMin);
      if (
        (item.scheduledStart?.getTime() ?? null) === (itemStart?.getTime() ?? null) &&
        (item.scheduledEnd?.getTime() ?? null) === (itemEnd?.getTime() ?? null)
      ) {
        continue;
      }
      await tx
        .update(dayItems)
        .set({ scheduledStart: itemStart, scheduledEnd: itemEnd, updatedAt: new Date() })
        .where(eq(dayItems.id, item.id));
    }
  }
}

/* --------------------------------------------------------------- main -- */

/**
 * The passes, inside a caller's transaction, so `confirmDay` can run them
 * and then resolve the pools in the same commit.
 */
export async function materializeInTx(
  tx: Tx,
  userId: string,
  input: MaterializeInput,
): Promise<{ result: MaterializeResult; day: DayRow; profile: DayProfile; blocks: BlockRow[] }> {
  const profile = await readDayProfile(tx, userId);
  const day = await ensureDayRow(tx, userId, profile, input);
  const existing = await readDayBlocks(tx, userId, day.id);

  /* -- 1. desired blocks ------------------------------------------------ */

  const wanted = new Map<BlockKind, DesiredBlock>();
  const put = (kind: BlockKind, templateId: string | null | "pool"): void => {
    wanted.set(kind, {
      kind,
      templateId: templateId === "pool" ? null : templateId,
      pooled: templateId === "pool",
      splitIndex: null,
    });
  };

  if (input.blocks === "keep") {
    for (const row of existing) {
      if (row.kind === "work" && wanted.has("work")) continue;
      put(row.kind, row.state === "pooled" ? "pool" : row.templateId);
    }
  } else {
    for (const assignment of input.blocks) put(assignment.kind, assignment.templateId);
  }

  if (day.shape === "unstructured") {
    // Orient and wind-down only; everything else is added on the day (§3.9).
    for (const kind of [...wanted.keys()]) {
      if (kind !== "orient" && kind !== "wind_down") wanted.delete(kind);
    }
  }

  // Every day has its frame: orient and wind-down, from the person's default
  // template of each kind when nothing named one.
  for (const kind of ["orient", "wind_down"] as const) {
    if (wanted.has(kind)) continue;
    const kept = existing.find((row) => row.kind === kind);
    put(kind, kept ? kept.templateId : await defaultTemplateFor(tx, userId, kind));
  }

  // A fixture lands in its block whatever the day's shape; a block that does
  // not exist for it is created, empty of everything else.
  const weekday = weekdayIndex(day.date);
  const fixtureRows = await tx
    .select({
      id: fixtures.id,
      title: fixtures.title,
      weekdays: fixtures.weekdays,
      atTime: fixtures.atTime,
      durationMin: fixtures.durationMin,
      blockKind: fixtures.blockKind,
      scheduling: fixtures.scheduling,
      habitId: fixtures.habitId,
      habitTitle: habits.title,
      habitIcon: habits.icon,
      habitType: habits.type,
      habitQuantityUnit: habits.quantityUnit,
      habitReflectionAxes: habits.reflectionAxes,
      habitPreflight: habits.defaultNotesPreflight,
    })
    .from(fixtures)
    .leftJoin(habits, eq(habits.id, fixtures.habitId))
    .where(and(eq(fixtures.userId, userId), isNull(fixtures.archivedAt)));
  const todaysFixtures = fixtureRows.filter((row) => row.weekdays.includes(weekday));
  for (const fixture of todaysFixtures) {
    const kind: BlockKind =
      day.shape === "unstructured" && fixture.blockKind === "work"
        ? "activity"
        : fixture.blockKind;
    if (!wanted.has(kind)) put(kind, null);
  }

  // A split container survives as two rows while it is touched.
  const desiredBlocks = [...wanted.values()];
  const existingWork = existing.filter((row) => row.kind === "work");
  if (wanted.has("work") && existingWork.length >= 2) {
    const [, second] = existingWork.sort((a, b) => a.sortOrder - b.sortOrder);
    if (second && !isUntouchedBlock(second)) {
      const first = wanted.get("work");
      if (first) {
        first.splitIndex = 0;
        desiredBlocks.push({ ...first, splitIndex: 1 });
      }
    }
  }

  const templateIds = desiredBlocks
    .map((block) => block.templateId)
    .filter((id): id is string => id !== null);
  const templatesById = await readTemplates(tx, userId, templateIds);
  for (const block of desiredBlocks) {
    if (block.templateId !== null && !templatesById.has(block.templateId)) {
      throw new Error("no such template");
    }
  }

  /* -- 2. reconcile blocks --------------------------------------------- */

  const reconciled = await reconcileBlocks(
    tx,
    userId,
    day,
    existing,
    desiredBlocks,
    templatesById,
    profile.blockOrder,
  );

  /* -- 3. desired items per block, and reconcile ------------------------ */

  const itemCounts: MaterializeCounts = { inserted: 0, updated: 0, deleted: 0, kept: 0 };
  const markerHabitId =
    profile.devicesOffTime === null ? null : await ensurePhoneAwayHabit(tx, userId);

  for (const block of reconciled.blocks) {
    const desired: DesiredItem[] = [];

    // A split container's second half holds the focus and its fixtures only;
    // the template's own slots are the first half's.
    if (block.state !== "pooled" && block.templateId !== null && block.splitIndex !== 1) {
      const template = templatesById.get(block.templateId);
      if (template) {
        const slots = await readTemplateSlots(tx, userId, template.id);
        desired.push(...desiredTemplateItems(template, slots, { includePool: false }));
      }
    }

    // The devices-off marker — a pin in the wind-down block (§7.1).
    if (block.kind === "wind_down" && markerHabitId !== null && profile.devicesOffTime !== null) {
      const at = markerPosition(desired);
      const marker: DesiredItem = {
        key: "marker",
        templateSlotId: null,
        origin: "template",
        habitId: markerHabitId,
        title: "Phone away",
        icon: FIXTURE_ICON,
        type: "task_appointment",
        quantityUnit: null,
        reflectionAxes: [],
        notesPreflight: null,
        durationMin: 1,
        gapBeforeMin: 0,
        pinnedAtMin: clockMinutes(clockOf(profile.devicesOffTime)),
        scheduling: "hard",
        priority: 6,
        sortOrder: at,
        multitaskGroup: null,
        alternatesGroup: null,
        alternatesChosen: false,
        templateNameSnapshot: block.templateNameSnapshot,
        originalAtBuild: true,
        spansBlock: false,
      };
      desired.splice(at, 0, marker);
      desired.forEach((item, index) => {
        item.sortOrder = index;
      });
    }

    // Fixtures for this weekday, in their block, as pins (TD-8).
    const targetKind = (fixtureKind: BlockKind): BlockKind =>
      day.shape === "unstructured" && fixtureKind === "work" ? "activity" : fixtureKind;
    for (const fixture of todaysFixtures) {
      if (targetKind(fixture.blockKind) !== block.kind) continue;
      // On a split container the first half takes the fixtures; DYN-6's moves
      // put one in the second half when its clock says so.
      if (block.kind === "work" && block.splitIndex === 1) continue;
      desired.push({
        key: `fixture:${fixture.title}`,
        templateSlotId: null,
        origin: "fixture",
        habitId: fixture.habitId,
        title: fixture.title,
        icon: fixture.habitIcon ?? FIXTURE_ICON,
        type: fixture.habitType ?? "task_appointment",
        quantityUnit: fixture.habitQuantityUnit ?? null,
        reflectionAxes: fixture.habitReflectionAxes ?? [],
        notesPreflight: fixture.habitPreflight ?? null,
        durationMin: fixture.durationMin,
        gapBeforeMin: 0,
        pinnedAtMin: clockMinutes(clockOf(fixture.atTime)),
        scheduling: fixture.scheduling,
        priority: fixture.scheduling === "hard" ? 7 : 5,
        sortOrder: desired.length,
        multitaskGroup: null,
        alternatesGroup: null,
        alternatesChosen: false,
        templateNameSnapshot: null,
        originalAtBuild: true,
        spansBlock: false,
      });
    }

    const counts = await reconcileItems(
      tx,
      userId,
      day,
      block,
      desired,
      markerHabitId,
      input.recomputeTouchedTimes ?? false,
    );
    itemCounts.inserted += counts.inserted;
    itemCounts.updated += counts.updated;
    itemCounts.deleted += counts.deleted;
    itemCounts.kept += counts.kept;
  }

  /* -- 4. lay out and write the times ----------------------------------- */

  const blocks = await readDayBlocks(tx, userId, day.id);
  const layout = layoutFor(blocks, {
    day,
    profile,
    anchorIsHard: day.anchorIsHard ?? anchorIsHardFor(profile.anchorDirection),
    workStartTime: day.workStartTime,
  });
  await writeLayout(tx, blocks, layout, day, input.recomputeTouchedTimes ?? false);

  const result: MaterializeResult = {
    dayId: day.id,
    blocks: reconciled.counts,
    items: itemCounts,
    // The v1.0 shape — item counts — for the callers that still read it.
    ...itemCounts,
  };

  return { result, day, profile, blocks: await readDayBlocks(tx, userId, day.id) };
}

export async function materializeDay(
  rls: RlsClient,
  userId: string,
  input: MaterializeInput,
): Promise<MaterializeResult> {
  return rls.execute(async (tx) => (await materializeInTx(tx, userId, input)).result);
}

/**
 * The v1.0 door: one template onto one day. The template's own kind names
 * the block; every other block on the day is kept as it is.
 */
export async function applyTemplateToDay(
  rls: RlsClient,
  userId: string,
  input: { date: string; templateId: string; anchorTime?: string },
): Promise<MaterializeResult> {
  return rls.execute(async (tx) => {
    const [template] = await tx
      .select({ id: templates.id, kind: templates.kind })
      .from(templates)
      .where(and(eq(templates.id, input.templateId), eq(templates.userId, userId)))
      .limit(1);
    if (!template) throw new Error("no such template");

    const day = await readDay(tx, userId, input.date);
    const existing = day ? await readDayBlocks(tx, userId, day.id) : [];
    const blocks: BlockAssignment[] = existing
      .filter((row) => row.kind !== template.kind)
      .map((row) => ({
        kind: row.kind,
        templateId: row.state === "pooled" ? "pool" : row.templateId,
      }));
    blocks.push({ kind: template.kind, templateId: template.id });

    // Applying a routine to an unstructured day makes it structured; the two
    // frame kinds fit either shape.
    const structural = template.kind !== "orient" && template.kind !== "wind_down";
    const { result } = await materializeInTx(tx, userId, {
      date: input.date,
      blocks,
      anchorTime: input.anchorTime,
      ...(structural ? { shape: "structured" as const } : {}),
    });
    return result;
  });
}
