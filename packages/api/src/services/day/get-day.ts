import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import {
  categories,
  dayItems,
  days,
  habits,
  misses,
  reasons,
  shifts,
  templates,
  timerSessions,
  users,
  type RlsClient,
} from "@syn/db";
import type {
  DayItemView,
  DayMode,
  MissTier,
  WokeAtSource,
} from "@syn/types";
import {
  dayModeFor,
  dayPartOf,
  dayPartSpans,
  dayStartInstant,
  deriveItemState,
  weekdayForDayKey,
  zoneCityLabel,
  type DayPart,
} from "@syn/utils";

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

export type DayPartView = {
  part: DayPart;
  span: { startLabel: string; endLabel: string } | null;
  items: DayItemView[];
};

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
  templateName: string | null;
  shiftedMin: number;
  parts: DayPartView[];
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
   * Which of this day's items is the wake anchor, or null — USE-2's addition.
   *
   * Marking it done sets the day's `woke_at` (official spec §5.2), and the
   * List has to know which row that is BEFORE the tap. It is resolved here
   * rather than carried on `DayItemView` because "is the anchor" is a fact
   * about the account joined to this day, not about the item: the same habit
   * is the anchor on every day at once, and putting the flag on each row would
   * be the same fact written once per row.
   *
   * It survives archiving the habit (cross-cutting §8.3): the join is on
   * `habit_id`, which an archived habit keeps.
   */
  wakeAnchorItemId: string | null;
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
};

const PART_ORDER: DayPart[] = ["morning", "afternoon", "evening", "anytime"];

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
        templateId: days.templateId,
      })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, dateKey)))
      .limit(1);

    if (!day) {
      return emptyDay(dateKey, mode, context);
    }

    const zone = safeZone(day.timezone, context.timeZone);

    // The account's wake anchor, matched to this day's rows below. One scalar.
    const [account] = await tx
      .select({ wakeAnchorHabitId: users.wakeAnchorHabitId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const anchorHabitId = account?.wakeAnchorHabitId ?? null;

    const [template] = day.templateId
      ? await tx
          .select({ name: templates.name })
          .from(templates)
          .where(eq(templates.id, day.templateId))
          .limit(1)
      : [];

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
      })
      .from(dayItems)
      .leftJoin(habits, eq(habits.id, dayItems.habitId))
      .leftJoin(categories, eq(categories.id, habits.categoryId))
      .where(and(eq(dayItems.dayId, day.id), eq(dayItems.userId, userId)))
      .orderBy(asc(dayItems.scheduledStart), asc(dayItems.sortOrder));

    const ids = itemRows.map((row) => row.id);

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

    const anchors = {
      timeZone: zone,
      dateKey,
      startInstant: dayStartInstant({
        dateKey,
        timezone: zone,
        anchorTime: day.anchorTime,
        wokeAt: day.wokeAt,
      }),
    };

    const multitaskOrder = buildMultitaskOrder(itemRows);

    const views: Array<{ view: DayItemView; part: DayPart }> = [];
    let precedingPart: DayPart | null = null;

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
        },
        { closedAt: day.closedAt, mode },
        context.now,
      );

      const part = dayPartOf(row, anchors, precedingPart);
      if (row.scheduledStart !== null) precedingPart = part;

      const startedAt = runningByItem.get(row.id);

      views.push({
        part,
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
          // UX v1.1 (§10.1, §11.8) — neutral until DYN-5 reads `day_blocks`.
          dayBlockId: null,
          blockKind: null,
          pinned: false,
          gapBeforeMin: 0,
          alternates: null,
        },
      });
    }

    const assigned = views.filter(
      (entry) =>
        entry.view.state !== "not-assigned" &&
        entry.view.state !== "cut-by-shift",
    );

    const lastScheduled = assigned
      .map((entry) => entry.view.scheduledStart)
      .filter((at): at is Date => at !== null)
      .sort((a, b) => a.getTime() - b.getTime())
      .at(-1) ?? null;

    const spans = dayPartSpans(anchors, lastScheduled);

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
      templateName: template?.name ?? null,
      shiftedMin: shiftRows.reduce((sum, row) => sum + row.deltaMin, 0),
      parts: PART_ORDER.map((part) => ({
        part,
        span: spans[part],
        items: assigned
          .filter((entry) => entry.part === part)
          .map((entry) => entry.view),
      })).filter((group) => group.items.length > 0),
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
      wakeAnchorItemId:
        anchorHabitId === null
          ? null
          : (itemRows.find((row) => row.habitId === anchorHabitId)?.id ?? null),
    };
  });
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
    templateName: null,
    shiftedMin: 0,
    parts: [],
    notAssigned: [],
    cutByShift: [],
    shifts: [],
    hasUndone: false,
    hasPending: false,
    zoneLabel: zoneLabelFor(context.timeZone, context.deviceZone ?? null),
    // A day with no items has no anchor row to mark done, and nothing to cut.
    wakeAnchorItemId: null,
    cutByShiftIds: {},
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
