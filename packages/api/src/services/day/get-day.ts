import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import {
  categories,
  dayBlocks,
  dayItems,
  days,
  habits,
  misses,
  reasons,
  shifts,
  templateSlots,
  timerSessions,
  users,
  type RlsClient,
} from "@syn/db";
import type {
  DayBlockView,
  DayItemView,
  DayMode,
  DayShape,
  MissTier,
  WokeAtSource,
} from "@syn/types";
import {
  addDays,
  dayModeFor,
  deriveItemState,
  formatClock,
  formatClockFromMinutes,
  minutesFromDayStart,
  weekdayForDayKey,
  zoneCityLabel,
} from "@syn/utils";

import { afterDevicesOff, devicesOffInstant } from "./wind-down";

/**
 * The whole day, as view models, in one call.
 *
 * TIMES ARE COMPUTED IN THE DAY'S OWN ZONE — the one snapshotted on the row,
 * never the device's (cross-cutting §7.3). A past day renders as it was lived
 * even after the person moves, which is the entire reason `days.timezone`
 * exists.
 *
 * THE STATE IS COMPUTED HERE FOR FIRST PAINT and recomputed on the client
 * every minute from the same fields, by the same function. That is what stops
 * a row from disagreeing with itself a minute after it renders.
 *
 * A DATE WITH NO ROW IS A VIRTUAL EMPTY DAY, not an error: a day nobody has
 * planned is a real thing to look at, and "nothing is assigned" is the honest
 * answer to it.
 */

export type DayView = {
  dateKey: string;
  mode: DayMode;
  timezone: string;
  dayCloseTime: string;
  anchorTime: string | null;
  wokeAt: Date | null;
  wokeAtSource: WokeAtSource | null;
  closedAt: Date | null;
  closeReason: "manual" | "auto" | null;
  capacityMin: number | null;
  shiftedMin: number;
  notAssigned: DayItemView[];
  cutByShift: DayItemView[];
  shifts: Array<{
    id: string;
    at: Date;
    deltaMin: number;
    reasonLabel: string | null;
    tier: MissTier;
  }>;
  hasUndone: boolean;
  hasPending: boolean;
  /** "times in Vancouver" — only when the caller's device zone differs. */
  zoneLabel: string | null;
  /**
   * Which shift cut each cut item — USE-5's SC-02 reads it to list what one
   * shift took.
   *
   * A MAP RATHER THAN A FIELD ON THE ITEM. Being cut by a particular shift is
   * a fact about the relationship between two rows, not a property of the
   * item; `DayItemView` is rendered in six places that have no interest in it,
   * and widening it would send a shift id to every one of them.
   */
  cutByShiftIds: Record<string, string>;

  /*
   * ---- UX v1.1 (§5.4, §6.1, §7.1, §7.3, §11.7) — the day by block (DYN-5).
   * The v1.0 day parts and the wake anchor left in DYN-21.
   */
  /** The blocks in `sort_order`, each with its items in time order. */
  blocks: DayBlockView[];
  /** Assigned items with no block — one-offs, an unstructured day's adds (DYN-15). */
  unblocked: DayItemView[];
  shape: DayShape;
  /** *Set the day* — null is the unconfirmed state the quick-pick renders (R6). */
  confirmedAt: Date | null;
  /** The work anchor as the header reads it: *Work 9:00*, or *Work ~9:00* when soft. */
  anchor: { clock: string; isHard: boolean } | null;
  /** Today's focus, for the header line; null without one. */
  focusLabel: string | null;
  /** The focus's habit id — the week build's picker selects by it (DYN-12). */
  focusHabitId: string | null;
  /** The devices-off marker's instant; items from it on read *confirm in the morning*. */
  devicesOffAt: Date | null;
  /** Yesterday's after-devices-off items still to answer — only while today is unset. */
  lastNight: DayItemView[];
};


/** The v1.1 half of a `DayItemView`, before the blocks are known. */
const NO_BLOCK = {
  dayBlockId: null,
  blockKind: null,
  pinned: false,
  gapBeforeMin: 0,
  alternates: null,
  // UX v1.2 (RUN-1): neutral until RUN-6 reads `version_key` and `parent_item_id`.
  versionKey: null,
  parentItemId: null,
} as const;

export async function getDay(
  rls: RlsClient,
  userId: string,
  dateKey: string,
  context: {
    todayKey: string;
    /** The person's current settings, used only for a virtual day. */
    timeZone: string;
    dayCloseTime: string;
    now: Date;
    /** SYS-2 passes this; here it is a parameter and nothing more. */
    deviceZone?: string | null;
  },
): Promise<DayView> {
  const mode = dayModeFor(dateKey, context.todayKey);

  return rls.execute(async (tx) => {
    const [day] = await tx
      .select({
        id: days.id,
        date: days.date,
        timezone: days.timezone,
        dayCloseTime: days.dayCloseTime,
        anchorTime: days.anchorTime,
        wokeAt: days.wokeAt,
        wokeAtSource: days.wokeAtSource,
        closedAt: days.closedAt,
        closeReason: days.closeReason,
        capacityMin: days.capacityMin,
        shape: days.shape,
        confirmedAt: days.confirmedAt,
        anchorIsHard: days.anchorIsHard,
        workStartTime: days.workStartTime,
        workFocusHabitId: days.workFocusHabitId,
      })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, dateKey)))
      .limit(1);

    if (!day) {
      return emptyDay(dateKey, mode, context);
    }

    const zone = safeZone(day.timezone, context.timeZone);

    // The blocks, in order — the Today tab's sections (§6.1).
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
      })
      .from(dayBlocks)
      .where(and(eq(dayBlocks.dayId, day.id), eq(dayBlocks.userId, userId)))
      .orderBy(asc(dayBlocks.sortOrder), asc(dayBlocks.createdAt));
    const blockById = new Map(blockRows.map((row) => [row.id, row]));
    const workCount = blockRows.filter((row) => row.kind === "work").length;

    // The account's wake anchor, matched to this day's rows below. One scalar.
    const [account] = await tx
      .select({
        workStartTime: users.workStartTime,
        anchorDirection: users.anchorDirection,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);


    const itemRows = await tx
      .select({
        id: dayItems.id,
        title: dayItems.title,
        icon: dayItems.icon,
        type: dayItems.type,
        timeMode: dayItems.timeMode,
        scheduledStart: dayItems.scheduledStart,
        scheduledEnd: dayItems.scheduledEnd,
        originalScheduledStart: dayItems.originalScheduledStart,
        durationMin: dayItems.durationMin,
        priority: dayItems.priority,
        scheduling: dayItems.scheduling,
        origin: dayItems.origin,
        doneAt: dayItems.doneAt,
        deferredAt: dayItems.deferredAt,
        quantityUnit: dayItems.quantityUnit,
        quantityValue: dayItems.quantityValue,
        assignmentState: dayItems.assignmentState,
        completionState: dayItems.completionState,
        multitaskId: dayItems.multitaskId,
        sortOrder: dayItems.sortOrder,
        carriedFromItemId: dayItems.carriedFromItemId,
        habitId: dayItems.habitId,
        categoryId: habits.categoryId,
        categoryName: categories.name,
        categoryKey: categories.colorKey,
        dayBlockId: dayItems.dayBlockId,
        templateSlotId: dayItems.templateSlotId,
        pinned: dayItems.pinned,
        gapBeforeMin: dayItems.gapBeforeMin,
        alternatesId: dayItems.alternatesId,
        alternatesChosen: dayItems.alternatesChosen,
        slotAlternatesGroup: templateSlots.alternatesGroup,
        slotTemplateId: templateSlots.templateId,
      })
      .from(dayItems)
      .leftJoin(habits, eq(habits.id, dayItems.habitId))
      .leftJoin(categories, eq(categories.id, habits.categoryId))
      .leftJoin(templateSlots, eq(templateSlots.id, dayItems.templateSlotId))
      .where(and(eq(dayItems.dayId, day.id), eq(dayItems.userId, userId)))
      .orderBy(asc(dayItems.scheduledStart), asc(dayItems.sortOrder));

    const ids = itemRows.map((row) => row.id);

    /*
     * The other member of each *one of* (§3.5), named so the sheet can offer
     * the swap: the template's other slot in the same group, by title and
     * length. One query for every group on the day.
     */
    const groupKeys = itemRows
      .filter((row) => row.slotAlternatesGroup !== null && row.slotTemplateId !== null)
      .map((row) => ({
        group: row.slotAlternatesGroup as string,
        templateId: row.slotTemplateId as string,
        slotId: row.templateSlotId as string,
      }));
    const otherMembers =
      groupKeys.length === 0
        ? []
        : await tx
            .select({
              slotId: templateSlots.id,
              templateId: templateSlots.templateId,
              group: templateSlots.alternatesGroup,
              durationMin: templateSlots.durationMin,
              title: habits.title,
            })
            .from(templateSlots)
            .innerJoin(habits, eq(habits.id, templateSlots.habitId))
            .where(
              and(
                eq(templateSlots.userId, userId),
                inArray(
                  templateSlots.templateId,
                  [...new Set(groupKeys.map((key) => key.templateId))],
                ),
                inArray(
                  templateSlots.alternatesGroup,
                  [...new Set(groupKeys.map((key) => key.group))],
                ),
              ),
            );
    const otherOf = (row: (typeof itemRows)[number]) => {
      if (row.alternatesId === null || row.slotAlternatesGroup === null) return null;
      const other = otherMembers.find(
        (member) =>
          member.templateId === row.slotTemplateId &&
          member.group === row.slotAlternatesGroup &&
          member.slotId !== row.templateSlotId,
      );
      if (!other) return null;
      return {
        id: row.alternatesId,
        chosen: row.alternatesChosen === true,
        otherTitle: other.title,
        otherDurationMin: other.durationMin,
      };
    };

    // Which items sit after the phone goes away (§7.1).
    const windDown = blockRows.find((row) => row.kind === "wind_down");
    const windDownItems = itemRows
      .filter((row) => windDown !== undefined && row.dayBlockId === windDown.id)
      .map((row) => ({
        id: row.id,
        pinned: row.pinned,
        templateSlotId: row.templateSlotId,
        origin: row.origin,
        type: row.type,
        scheduledStart: row.scheduledStart,
      }));
    const devicesOffAt = devicesOffInstant(windDownItems);
    const afterDevicesOffIds = new Set(afterDevicesOff(windDownItems).map((row) => row.id));

    // Running sessions, for `active` and the elapsed count.
    const running =
      ids.length === 0
        ? []
        : await tx
            .select({
              dayItemId: timerSessions.dayItemId,
              startedAt: timerSessions.startedAt,
            })
            .from(timerSessions)
            .where(
              and(
                inArray(timerSessions.dayItemId, ids),
                eq(timerSessions.userId, userId),
                isNull(timerSessions.endedAt),
              ),
            );

    const runningByItem = new Map(
      running.map((row) => [row.dayItemId, row.startedAt]),
    );

    // A carried item names the day it came from — "carried from Thursday".
    const carriedIds = itemRows
      .map((row) => row.carriedFromItemId)
      .filter((id): id is string => id !== null);

    const carriedFrom =
      carriedIds.length === 0
        ? []
        : await tx
            .select({ id: dayItems.id, date: days.date })
            .from(dayItems)
            .innerJoin(days, eq(days.id, dayItems.dayId))
            .where(inArray(dayItems.id, carriedIds));

    const carriedDateById = new Map(
      carriedFrom.map((row) => [row.id, String(row.date)]),
    );

    const shiftRows = await tx
      .select({
        id: shifts.id,
        at: shifts.at,
        deltaMin: shifts.deltaMin,
        reasonKey: shifts.reasonKey,
        reasonText: shifts.reasonText,
        tier: shifts.tier,
      })
      .from(shifts)
      .where(and(eq(shifts.dayId, day.id), eq(shifts.userId, userId)))
      .orderBy(asc(shifts.at));

    // Reason labels come from the person's own set; an archived one still
    // renders, because the record was made under it (cross-cutting §8.1).
    const reasonKeys = shiftRows
      .map((row) => row.reasonKey)
      .filter((key): key is string => key !== null);

    const reasonRows =
      reasonKeys.length === 0
        ? []
        : await tx
            .select({ key: reasons.key, label: reasons.label })
            .from(reasons)
            .where(
              and(eq(reasons.userId, userId), inArray(reasons.key, reasonKeys)),
            );

    const labelByKey = new Map(reasonRows.map((row) => [row.key, row.label]));

    const multitaskOrder = buildMultitaskOrder(itemRows);
    const views: Array<{ view: DayItemView }> = [];

    for (const row of itemRows) {
      const state = deriveItemState(
        {
          assignmentState: row.assignmentState,
          completionState: row.completionState,
          timeMode: row.timeMode,
          scheduledStart: row.scheduledStart,
          scheduledEnd: row.scheduledEnd,
          originalScheduledStart: row.originalScheduledStart,
          doneAt: row.doneAt,
          deferredAt: row.deferredAt,
          hasRunningSession: runningByItem.has(row.id),
          isAfterDevicesOff: afterDevicesOffIds.has(row.id),
          pinned: row.pinned,
        },
        { closedAt: day.closedAt, mode },
        context.now,
      );

      const startedAt = runningByItem.get(row.id);

      views.push({
        view: {
          id: row.id,
          habitId: row.habitId,
          title: row.title,
          icon: row.icon,
          type: row.type,
          category:
            row.categoryName && row.categoryKey
              ? { key: row.categoryKey, name: row.categoryName }
              : null,
          timeMode: row.timeMode,
          scheduledStart: row.scheduledStart,
          scheduledEnd: row.scheduledEnd,
          originalScheduledStart: row.originalScheduledStart,
          durationMin: row.durationMin,
          priority: row.priority,
          scheduling: row.scheduling,
          origin: row.origin,
          carriedFromLabel:
            row.carriedFromItemId === null
              ? null
              : shortWeekday(carriedDateById.get(row.carriedFromItemId)),
          doneAt: row.doneAt,
          quantityUnit: row.quantityUnit,
          quantityValue: row.quantityValue,
          timerElapsedSec:
            startedAt === undefined
              ? null
              : Math.max(
                  0,
                  Math.floor(
                    (context.now.getTime() - startedAt.getTime()) / 1000,
                  ),
                ),
          state,
          multitask: multitaskOrder.get(row.id) ?? "none",
          dayBlockId: row.dayBlockId,
          blockKind:
            row.dayBlockId === null ? null : (blockById.get(row.dayBlockId)?.kind ?? null),
          pinned: row.pinned,
          gapBeforeMin: row.gapBeforeMin,
          alternates: otherOf(row),
          // UX v1.2 (RUN-1): neutral until RUN-6 reads the two columns.
          versionKey: null,
          parentItemId: null,
        },
      });
    }

    const dayStartClock = day.wokeAt === null ? day.anchorTime.slice(0, 5) : null;
    const minutesOf = (at: Date | null): number | null => {
      if (at === null) return null;
      const start = dayStartClock ?? formatStartClock(day.wokeAt as Date, zone);
      return minutesFromDayStart(at, start, zone);
    };

    // Assigned items that belong to no block — one-offs and an unstructured
    // day's grab-and-go — rendered under the blocks (DYN-15).
    const unblocked = views
      .filter(
        (entry) =>
          entry.view.dayBlockId === null &&
          entry.view.state !== "not-assigned" &&
          entry.view.state !== "cut-by-shift",
      )
      .map((entry) => entry.view);

    const blocks: DayBlockView[] = blockRows.map((block) => ({
      id: block.id,
      kind: block.kind,
      name: block.templateNameSnapshot,
      templateId: block.templateId,
      state: block.state,
      startLabel: block.scheduledStart === null ? null : formatClock(block.scheduledStart, zone),
      endLabel: block.scheduledEnd === null ? null : formatClock(block.scheduledEnd, zone),
      startMin: minutesOf(block.scheduledStart),
      endMin: minutesOf(block.scheduledEnd),
      startAt: block.scheduledStart,
      endAt: block.scheduledEnd,
      placement: block.placement,
      // Time order inside the block; the unscheduled by their stack position.
      items: views
        .filter((entry) => entry.view.dayBlockId === block.id)
        .map((entry) => entry.view),
      split: block.kind === "work" && workCount >= 2,
    }));

    // Yesterday's after-devices-off items, only while today is unset (§7.3).
    const lastNight =
      dateKey === context.todayKey && day.confirmedAt === null
        ? await readLastNight(tx, userId, addDays(dateKey, -1), zone, mode, context.now)
        : [];

    const [focus] = day.workFocusHabitId
      ? await tx
          .select({ title: habits.title })
          .from(habits)
          .where(eq(habits.id, day.workFocusHabitId))
          .limit(1)
      : [];

    // Today's anchor once set; the profile's until then. None on an
    // unstructured day — there is no work to anchor to (§3.9).
    const anchorClock =
      day.shape === "unstructured"
        ? null
        : (day.workStartTime ?? account?.workStartTime ?? null);
    const anchor =
      anchorClock === null
        ? null
        : {
            clock: formatClockFromMinutes(clockToMinutes(anchorClock.slice(0, 5))),
            isHard: day.anchorIsHard ?? account?.anchorDirection !== "work_waits",
          };

    const assigned = views.filter(
      (entry) =>
        entry.view.state !== "not-assigned" &&
        entry.view.state !== "cut-by-shift",
    );

    /*
     * Which shift took each cut item. `misses.shift_id` is the link (SET-1's
     * ruling: a cut item is a `day_items` row plus a `misses` row pointing at
     * the shift, never an array column on the shift), so SC-02 can list what
     * one shift cut without the shift storing a list that could go stale.
     */
    const cutIds = views
      .filter((entry) => entry.view.state === "cut-by-shift")
      .map((entry) => entry.view.id);

    const cutLinks =
      cutIds.length === 0
        ? []
        : await tx
            .select({ dayItemId: misses.dayItemId, shiftId: misses.shiftId })
            .from(misses)
            .where(
              and(
                eq(misses.userId, userId),
                inArray(misses.dayItemId, cutIds),
              ),
            );

    const cutByShiftIds: Record<string, string> = {};
    for (const link of cutLinks) {
      if (link.shiftId !== null) cutByShiftIds[link.dayItemId] = link.shiftId;
    }

    return {
      dateKey,
      mode,
      timezone: zone,
      dayCloseTime: day.dayCloseTime,
      anchorTime: day.anchorTime,
      wokeAt: day.wokeAt,
      wokeAtSource: day.wokeAtSource,
      closedAt: day.closedAt,
      closeReason: day.closeReason,
      capacityMin: day.capacityMin,
      shiftedMin: shiftRows.reduce((sum, row) => sum + row.deltaMin, 0),
      notAssigned: views
        .filter((entry) => entry.view.state === "not-assigned")
        .map((entry) => entry.view),
      cutByShift: views
        .filter((entry) => entry.view.state === "cut-by-shift")
        .map((entry) => entry.view),
      shifts: shiftRows.map((row) => ({
        id: row.id,
        at: row.at,
        deltaMin: row.deltaMin,
        reasonLabel:
          (row.reasonKey === null ? null : labelByKey.get(row.reasonKey)) ??
          row.reasonText,
        tier: row.tier,
      })),
      hasUndone: assigned.some(
        (entry) =>
          entry.view.doneAt === null && entry.view.state !== "pending-review",
      ),
      hasPending: assigned.some(
        (entry) => entry.view.state === "pending-review",
      ),
      zoneLabel: zoneLabelFor(zone, context.deviceZone ?? null),
      cutByShiftIds,
      blocks,
      unblocked,
      shape: day.shape,
      confirmedAt: day.confirmedAt,
      anchor,
      focusLabel: focus?.title ?? null,
      focusHabitId: day.workFocusHabitId ?? null,
      devicesOffAt,
      lastNight,
    };
  });
}

/** `woke_at` as `HH:mm` in the day's zone — the axis origin once the day has begun. */
function formatStartClock(wokeAt: Date, zone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: zone,
  }).formatToParts(wokeAt);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}

function clockToMinutes(clock: string): number {
  const [hour = "0", minute = "0"] = clock.split(":");
  return Number(hour) * 60 + Number(minute);
}

/**
 * Yesterday's wind-down items at or after devices-off that nobody has
 * answered — the quick-pick's *Last night* section (§7.3). Rendered with the
 * facts the checkbox rows need and nothing the day's own list would add.
 */
export async function readLastNight(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  userId: string,
  dateKey: string,
  zone: string,
  mode: DayMode,
  now: Date,
): Promise<DayItemView[]> {
  const [yesterday] = await tx
    .select({ id: days.id, closedAt: days.closedAt })
    .from(days)
    .where(and(eq(days.userId, userId), eq(days.date, dateKey)))
    .limit(1);
  if (!yesterday) return [];

  const [windDown] = await tx
    .select({ id: dayBlocks.id })
    .from(dayBlocks)
    .where(
      and(
        eq(dayBlocks.dayId, yesterday.id),
        eq(dayBlocks.userId, userId),
        eq(dayBlocks.kind, "wind_down"),
      ),
    )
    .limit(1);
  if (!windDown) return [];

  const rows = await tx
    .select({
      id: dayItems.id,
      habitId: dayItems.habitId,
      title: dayItems.title,
      icon: dayItems.icon,
      type: dayItems.type,
      timeMode: dayItems.timeMode,
      scheduledStart: dayItems.scheduledStart,
      scheduledEnd: dayItems.scheduledEnd,
      originalScheduledStart: dayItems.originalScheduledStart,
      durationMin: dayItems.durationMin,
      priority: dayItems.priority,
      scheduling: dayItems.scheduling,
      origin: dayItems.origin,
      doneAt: dayItems.doneAt,
      deferredAt: dayItems.deferredAt,
      quantityUnit: dayItems.quantityUnit,
      quantityValue: dayItems.quantityValue,
      assignmentState: dayItems.assignmentState,
      completionState: dayItems.completionState,
      pinned: dayItems.pinned,
      gapBeforeMin: dayItems.gapBeforeMin,
      templateSlotId: dayItems.templateSlotId,
    })
    .from(dayItems)
    .where(
      and(
        eq(dayItems.dayId, yesterday.id),
        eq(dayItems.userId, userId),
        eq(dayItems.dayBlockId, windDown.id),
      ),
    )
    .orderBy(asc(dayItems.scheduledStart), asc(dayItems.sortOrder));

  const pending = afterDevicesOff(rows).filter(
    (row) =>
      row.assignmentState === "assigned" &&
      row.completionState === "upcoming" &&
      row.doneAt === null,
  );
  void zone;

  return pending.map((row) => ({
    id: row.id,
    habitId: row.habitId,
    title: row.title,
    icon: row.icon,
    type: row.type,
    category: null,
    timeMode: row.timeMode,
    scheduledStart: row.scheduledStart,
    scheduledEnd: row.scheduledEnd,
    originalScheduledStart: row.originalScheduledStart,
    durationMin: row.durationMin,
    priority: row.priority,
    scheduling: row.scheduling,
    origin: row.origin,
    carriedFromLabel: null,
    doneAt: row.doneAt,
    quantityUnit: row.quantityUnit,
    quantityValue: row.quantityValue,
    timerElapsedSec: null,
    state: deriveItemState(
      {
        assignmentState: row.assignmentState,
        completionState: row.completionState,
        timeMode: row.timeMode,
        scheduledStart: row.scheduledStart,
        scheduledEnd: row.scheduledEnd,
        originalScheduledStart: row.originalScheduledStart,
        doneAt: row.doneAt,
        deferredAt: row.deferredAt,
        hasRunningSession: false,
        isAfterDevicesOff: true,
        pinned: row.pinned,
      },
      { closedAt: yesterday.closedAt, mode: mode === "live" ? "record" : mode },
      now,
    ),
    multitask: "none",
    ...NO_BLOCK,
    dayBlockId: windDown.id,
    blockKind: "wind_down",
    pinned: row.pinned,
    gapBeforeMin: row.gapBeforeMin,
  }));
}

/** A date with no row — a real day nobody has planned. */
function emptyDay(
  dateKey: string,
  mode: DayMode,
  context: { timeZone: string; dayCloseTime: string; deviceZone?: string | null },
): DayView {
  return {
    dateKey,
    mode,
    timezone: context.timeZone,
    dayCloseTime: context.dayCloseTime,
    anchorTime: null,
    wokeAt: null,
    wokeAtSource: null,
    closedAt: null,
    closeReason: null,
    capacityMin: null,
    shiftedMin: 0,
    notAssigned: [],
    cutByShift: [],
    shifts: [],
    hasUndone: false,
    hasPending: false,
    zoneLabel: zoneLabelFor(context.timeZone, context.deviceZone ?? null),
    cutByShiftIds: {},
    blocks: [],
    unblocked: [],
    shape: "structured",
    confirmedAt: null,
    anchor: null,
    focusLabel: null,
    focusHabitId: null,
    devicesOffAt: null,
    lastNight: [],
  };
}

/**
 * An unknown IANA id would make every `Intl` call throw and take the day down
 * with it. Falling back to the person's current zone renders a day whose times
 * are arguably wrong; throwing renders no day at all, which is worse.
 */
function safeZone(candidate: string, fallback: string): string {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: candidate });
    return candidate;
  } catch {
    return fallback;
  }
}

/** "times in Vancouver" — only while the day's zone differs from the device's. */
function zoneLabelFor(
  dayZone: string,
  deviceZone: string | null,
): string | null {
  if (deviceZone === null || deviceZone === dayZone) return null;
  return `times in ${zoneCityLabel(dayZone)}`;
}

function shortWeekday(dateKey: string | undefined): string | null {
  if (dateKey === undefined) return null;
  return weekdayForDayKey(dateKey).slice(0, 3);
}

/** Where each item sits in its multitask bracket, by time then sort order. */
function buildMultitaskOrder(
  rows: ReadonlyArray<{ id: string; multitaskId: string | null }>,
): Map<string, DayItemView["multitask"]> {
  const groups = new Map<string, string[]>();
  for (const row of rows) {
    if (row.multitaskId === null) continue;
    const members = groups.get(row.multitaskId) ?? [];
    members.push(row.id);
    groups.set(row.multitaskId, members);
  }

  const positions = new Map<string, DayItemView["multitask"]>();
  for (const members of groups.values()) {
    if (members.length < 2) continue;
    members.forEach((id, index) => {
      positions.set(
        id,
        index === 0 ? "first" : index === members.length - 1 ? "last" : "middle",
      );
    });
  }
  return positions;
}
