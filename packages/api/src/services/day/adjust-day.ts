import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";

import { ADJUST_UNDO_WINDOW_MS } from "@syn/constants";
import {
  dayBlocks,
  dayItems,
  days,
  habits,
  misses,
  reasons,
  shifts,
  users,
  type RlsClient,
} from "@syn/db";
import type { BlockKind, MissTier } from "@syn/types";
import type { AdjustPreviewInput } from "@syn/validators";
import {
  adjustFingerprintOf,
  clockFromMinutes,
  computeAdjust,
  dayWindow,
  formatClockFromMinutes,
  instantToWallClockMinutes,
  wallClockToInstant,
  type AdjustItem,
  type AdjustResult,
} from "@syn/utils";

import { anchorIsHardFor, minutesToClock } from "./materialize-day";
import { reflowBlock } from "./reflow-block";
import { DayChangedError } from "./shift-fit";
import { UndoRefusedError, shiftUndoEligibility } from "./undo-shift";

/**
 * Adjust — UX v1.1 §6.6, §11.9, R4, R7, TD-6 (DYN-6). The four steps as one
 * preview and one write.
 *
 * PREVIEW, THEN COMMIT, WITH A FINGERPRINT. The sheet renders `computeAdjust`'s
 * proposal; *Set* runs it again on the server against the live rows and
 * refuses (`CONFLICT`) if the scope changed since the sheet looked — an item
 * finished on another device, a reason archived. USE-6's pattern, over the
 * new arithmetic; `computeShiftFit` is not extended, it is retired in DYN-21.
 *
 * THE SCOPE IS COMPUTED, NOT CHOSEN: the rest of the day from now to the next
 * hard thing. Before the work anchor that is *the morning* (every block
 * before work, ending at today's `work_start_time`); after work it is *the
 * evening* (the blocks between work and the wind-down, ending where the
 * wind-down begins — which is laid backward from lights-out and does not
 * move); on a day with neither it is the day to its close. The sheet names
 * which.
 *
 * ONE `shifts` ROW, OF THE RIGHT KIND. *Start work later* is a `shift`: the
 * proposal keeps every length, the movable set runs on from now, and
 * `days.work_start_time` moves by the overrun — the work block and its focus
 * with it. Everything else is a `refit` with `delta_min = 0`. A cut is a miss
 * with the reason's tier, exactly as a shift's cut has always been (v1 R1,
 * §6.5); a *choose* leaves the unticked out today with no miss (a trim). The
 * profile's `anchor_direction` is never written here.
 *
 * UNDO (ten minutes, `ADJUST_UNDO_WINDOW_MS`) — the provisional default of
 * the ticket's `[NEEDS DECISION]`, (b): cuts come back with their misses
 * deleted, a `shift`'s anchor comes back, and the scope re-flows; lengths
 * stay shortened and *choose*'s left-out items return through *Bring back*.
 * Exact positions would need `shifts.undo_snapshot` (0006, DYN-21).
 */

export type AdjustScopeLabel = "morning" | "evening" | "day";

export type AdjustScope = {
  label: AdjustScopeLabel;
  fromClock: string;
  toClock: string;
  anchorClock: string;
  anchorIsHard: boolean;
  /** Which blocks the proposal may touch. */
  blockIds: string[];
  /** The same edges in minutes from midnight, for the arithmetic. */
  fromMin: number;
  toMin: number;
};

export type AdjustProposalItem = {
  id: string;
  title: string;
  startClock: string;
  endClock: string;
  durationMin: number;
  fixed: boolean;
  shortened: boolean;
};

export type AdjustPreview = {
  scope: AdjustScope;
  proposal: AdjustProposalItem[];
  shortened: string[];
  cut: string[];
  notAssigned: string[];
  keptHard: string[];
  slideMin: number;
  newAnchorClock: string;
  overMin: number;
  fits: boolean;
  reason: { key: string; label: string; tier: MissTier };
  fingerprint: string;
};

export type AdjustCode = "no_such_day" | "closed" | "unconfirmed" | "no_slide" | "no_reason";

export class AdjustError extends Error {
  readonly code: AdjustCode;
  constructor(code: AdjustCode) {
    super(code);
    this.name = "AdjustError";
    this.code = code;
  }
}

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

type ItemRow = {
  id: string;
  title: string;
  dayBlockId: string | null;
  pinned: boolean;
  origin: string;
  scheduling: "hard" | "soft";
  durationMin: number | null;
  durationMinMin: number | null;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  sortOrder: number;
  priority: number;
  multitaskId: string | null;
  alternatesId: string | null;
  alternatesChosen: boolean | null;
  assignmentState: string;
  completionState: string;
  doneAt: Date | null;
  deferredAt: Date | null;
  timeMode: string;
  type: string;
  templateSlotId: string | null;
};

type Context = {
  day: {
    id: string;
    date: string;
    timezone: string;
    dayCloseTime: string;
    closedAt: Date | null;
    confirmedAt: Date | null;
    anchorIsHard: boolean | null;
    workStartTime: string | null;
    anchorTime: string;
    wokeAt: Date | null;
  };
  blocks: Array<{
    id: string;
    kind: BlockKind;
    sortOrder: number;
    scheduledStart: Date | null;
    scheduledEnd: Date | null;
  }>;
  items: ItemRow[];
  anchorDirection: "work_waits" | "routine_cut" | "depends" | null;
  wakeMin: number;
  minutesOf: (at: Date) => number;
  instantOf: (minutes: number) => Date;
};

async function readContext(tx: Tx, userId: string, date: string): Promise<Context> {
  const [day] = await tx
    .select({
      id: days.id,
      date: days.date,
      timezone: days.timezone,
      dayCloseTime: days.dayCloseTime,
      closedAt: days.closedAt,
      confirmedAt: days.confirmedAt,
      anchorIsHard: days.anchorIsHard,
      workStartTime: days.workStartTime,
      anchorTime: days.anchorTime,
      wokeAt: days.wokeAt,
    })
    .from(days)
    .where(and(eq(days.userId, userId), eq(days.date, date)))
    .limit(1);
  if (!day) throw new AdjustError("no_such_day");

  const [account] = await tx
    .select({ anchorDirection: users.anchorDirection })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const blocks = await tx
    .select({
      id: dayBlocks.id,
      kind: dayBlocks.kind,
      sortOrder: dayBlocks.sortOrder,
      scheduledStart: dayBlocks.scheduledStart,
      scheduledEnd: dayBlocks.scheduledEnd,
    })
    .from(dayBlocks)
    .where(and(eq(dayBlocks.dayId, day.id), eq(dayBlocks.userId, userId)))
    .orderBy(asc(dayBlocks.sortOrder));

  const items: ItemRow[] = await tx
    .select({
      id: dayItems.id,
      title: dayItems.title,
      dayBlockId: dayItems.dayBlockId,
      pinned: dayItems.pinned,
      origin: dayItems.origin,
      scheduling: dayItems.scheduling,
      durationMin: dayItems.durationMin,
      durationMinMin: habits.durationMinMin,
      scheduledStart: dayItems.scheduledStart,
      scheduledEnd: dayItems.scheduledEnd,
      sortOrder: dayItems.sortOrder,
      priority: dayItems.priority,
      multitaskId: dayItems.multitaskId,
      alternatesId: dayItems.alternatesId,
      alternatesChosen: dayItems.alternatesChosen,
      assignmentState: dayItems.assignmentState,
      completionState: dayItems.completionState,
      doneAt: dayItems.doneAt,
      deferredAt: dayItems.deferredAt,
      timeMode: dayItems.timeMode,
      type: dayItems.type,
      templateSlotId: dayItems.templateSlotId,
    })
    .from(dayItems)
    .leftJoin(habits, eq(habits.id, dayItems.habitId))
    .where(and(eq(dayItems.dayId, day.id), eq(dayItems.userId, userId)))
    .orderBy(asc(dayItems.scheduledStart), asc(dayItems.sortOrder));

  const zone = day.timezone;
  const dateKey = String(day.date);
  const wakeMin =
    day.wokeAt === null
      ? clockMin(day.anchorTime)
      : instantToWallClockMinutes(day.wokeAt, zone);

  return {
    day: { ...day, date: dateKey },
    blocks,
    items,
    anchorDirection: account?.anchorDirection ?? null,
    wakeMin,
    minutesOf: (at) => {
      const minutes = instantToWallClockMinutes(at, zone);
      return minutes < wakeMin ? minutes + 1440 : minutes;
    },
    instantOf: (minutes) => wallClockToInstant(dateKey, minutesToClock(minutes), zone),
  };
}

function clockMin(clock: string): number {
  const [hour = "0", minute = "0"] = clock.split(":");
  return Number(hour) * 60 + Number(minute);
}

/* -------------------------------------------------------------- scope -- */

/** The rest of the day to the next hard thing — computed, never chosen. */
export function scopeOf(context: Context, nowMin: number): AdjustScope {
  const { blocks, day } = context;
  const work = blocks.find((block) => block.kind === "work" && block.scheduledStart !== null);
  const windDown = blocks.find(
    (block) => block.kind === "wind_down" && block.scheduledStart !== null,
  );
  const workStart = work?.scheduledStart ? context.minutesOf(work.scheduledStart) : null;
  const windDownStart = windDown?.scheduledStart
    ? context.minutesOf(windDown.scheduledStart)
    : null;

  const label = (minutes: number): string => formatClockFromMinutes(minutes % 1440);

  if (work && workStart !== null && nowMin < workStart) {
    return {
      label: "morning",
      fromClock: label(nowMin),
      toClock: label(workStart),
      anchorClock: label(workStart),
      anchorIsHard: day.anchorIsHard ?? anchorIsHardFor(context.anchorDirection),
      blockIds: blocks.filter((block) => block.sortOrder < work.sortOrder).map((b) => b.id),
      fromMin: nowMin,
      toMin: workStart,
    };
  }

  if (windDown && windDownStart !== null && nowMin < windDownStart) {
    const after = work?.sortOrder ?? -1;
    return {
      label: "evening",
      fromClock: label(nowMin),
      toClock: label(windDownStart),
      anchorClock: label(windDownStart),
      anchorIsHard: true,
      blockIds: blocks
        .filter((block) => block.sortOrder > after && block.sortOrder < windDown.sortOrder)
        .map((b) => b.id),
      fromMin: nowMin,
      toMin: windDownStart,
    };
  }

  const window = dayWindow(day.date, day.timezone, day.dayCloseTime);
  const closeMin = Math.max(nowMin, context.minutesOf(window.end));
  const afterWindDown = windDown?.sortOrder ?? -1;
  return {
    label: "day",
    fromClock: label(nowMin),
    toClock: label(closeMin),
    anchorClock: label(closeMin),
    anchorIsHard: true,
    blockIds: blocks
      .filter((block) => windDown === undefined || block.sortOrder >= afterWindDown)
      .map((b) => b.id),
    fromMin: nowMin,
    toMin: closeMin,
  };
}

function isFixed(row: ItemRow): boolean {
  return (
    row.pinned ||
    row.origin === "fixture" ||
    row.scheduling === "hard" ||
    row.doneAt !== null ||
    row.completionState === "done" ||
    row.completionState === "active"
  );
}

/** The scope's items, as the arithmetic sees them. */
function scopeItems(context: Context, scope: AdjustScope, nowMin: number, toMin: number) {
  const inScope = new Set(scope.blockIds);
  const rows = context.items.filter(
    (row) =>
      row.dayBlockId !== null &&
      inScope.has(row.dayBlockId) &&
      row.assignmentState === "assigned" &&
      row.timeMode !== "unscheduled" &&
      row.deferredAt === null &&
      row.scheduledStart !== null &&
      row.durationMin !== null &&
      row.completionState !== "missed" &&
      row.completionState !== "carried" &&
      row.completionState !== "not_confirmed",
  );

  const items: AdjustItem[] = [];
  const fingerprintRows: ItemRow[] = [];
  for (const row of rows) {
    const startMin = context.minutesOf(row.scheduledStart as Date);
    const fixed = isFixed(row);
    // A fixed point matters only while it occupies the scope; a movable
    // item matters wherever it is — a passed, undone one slides to now.
    if (fixed && (startMin + (row.durationMin ?? 0) <= nowMin || startMin >= toMin)) continue;
    if (!fixed && startMin >= toMin) continue;
    fingerprintRows.push(row);
    items.push({
      id: row.id,
      durationMin: row.durationMin ?? 0,
      gapBeforeMin: 0,
      pinnedAtMin: fixed ? startMin : null,
      scheduling: row.scheduling,
      priority: row.priority,
      multitaskId: row.multitaskId,
      alternatesId: row.alternatesId,
      alternatesChosen: row.alternatesChosen ?? undefined,
      startMin,
      durationMinMin: row.durationMinMin,
      isFixed: fixed,
    });
  }
  return { items, fingerprintRows };
}

/* ------------------------------------------------------------ preview -- */

type Computed = {
  context: Context;
  scope: AdjustScope;
  result: AdjustResult;
  fingerprint: string;
  nowMin: number;
  toMin: number;
  reason: { key: string; label: string; tier: MissTier };
};

async function compute(
  tx: Tx,
  userId: string,
  input: AdjustPreviewInput,
  now: Date,
): Promise<Computed> {
  const context = await readContext(tx, userId, input.date);
  if (context.day.closedAt !== null) throw new AdjustError("closed");
  if (context.day.confirmedAt === null) throw new AdjustError("unconfirmed");

  const [reason] = await tx
    .select({ key: reasons.key, label: reasons.label, tier: reasons.tier })
    .from(reasons)
    .where(
      and(eq(reasons.userId, userId), eq(reasons.key, input.reasonKey), isNull(reasons.archivedAt)),
    )
    .limit(1);
  if (!reason) throw new AdjustError("no_reason");

  const nowMin = context.minutesOf(now);
  const scope = scopeOf(context, nowMin);
  const anchorMin = scope.toMin;

  if (input.what === "slide" && scope.label !== "morning") throw new AdjustError("no_slide");

  const { items, fingerprintRows } = scopeItems(context, scope, nowMin, anchorMin);
  const result = computeAdjust({
    items,
    nowMin,
    anchor: { min: anchorMin, isHard: scope.anchorIsHard },
    what: input.what,
    how: input.how,
    chosenIds: input.chosenIds,
    keepInstead: input.keepInstead,
  });

  return {
    context,
    scope,
    result,
    fingerprint: adjustFingerprintOf(fingerprintRows),
    nowMin,
    toMin: anchorMin,
    reason,
  };
}

function toPreview(computed: Computed): AdjustPreview {
  const { context, scope, result } = computed;
  const titleOf = new Map(context.items.map((row) => [row.id, row.title]));
  const shortened = new Set(result.shortened);
  const clock = (minutes: number): string => formatClockFromMinutes(minutes % 1440);
  return {
    scope,
    proposal: result.proposal.map((entry) => ({
      id: entry.id,
      title: titleOf.get(entry.id) ?? "",
      startClock: clock(entry.startMin),
      endClock: clock(entry.endMin),
      durationMin: entry.durationMin,
      fixed: entry.fixed,
      shortened: shortened.has(entry.id),
    })),
    shortened: result.shortened,
    cut: result.cut,
    notAssigned: result.notAssigned,
    keptHard: result.keptHard,
    slideMin: result.slideMin,
    newAnchorClock: clock(result.newAnchorMin),
    overMin: result.overMin,
    fits: result.fits,
    reason: computed.reason,
    fingerprint: computed.fingerprint,
  };
}

export async function previewAdjust(
  rls: RlsClient,
  userId: string,
  input: AdjustPreviewInput,
  now: Date = new Date(),
): Promise<AdjustPreview> {
  return rls.execute(async (tx) => toPreview(await compute(tx, userId, input, now)));
}

export async function adjustScope(
  rls: RlsClient,
  userId: string,
  date: string,
  now: Date = new Date(),
): Promise<AdjustScope> {
  return rls.execute(async (tx) => {
    const context = await readContext(tx, userId, date);
    return scopeOf(context, context.minutesOf(now));
  });
}

/* -------------------------------------------------------------- apply -- */

export type AdjustApplied = {
  shiftId: string;
  kind: "shift" | "refit";
  undoUntil: Date;
  shortened: number;
  cut: number;
  notAssigned: number;
  slideMin: number;
};

export async function applyAdjust(
  rls: RlsClient,
  userId: string,
  input: AdjustPreviewInput & { fingerprint: string },
  now: Date = new Date(),
): Promise<AdjustApplied> {
  return rls.execute(async (tx) => {
    const computed = await compute(tx, userId, input, now);
    if (computed.fingerprint !== input.fingerprint) throw new DayChangedError();

    const { context, result, reason, scope } = computed;
    const kind = input.what === "slide" ? "shift" : "refit";

    const [shift] = await tx
      .insert(shifts)
      .values({
        userId,
        dayId: context.day.id,
        at: now,
        kind,
        deltaMin: result.slideMin,
        reasonKey: reason.key,
        reasonText: null,
        tier: reason.tier,
        shortenedItemIds: result.shortened,
      })
      .returning({ id: shifts.id });
    if (!shift) throw new Error("shift insert returned no row");

    // Lengths, for the shortened.
    for (const entry of result.proposal) {
      if (!result.shortened.includes(entry.id)) continue;
      await tx
        .update(dayItems)
        .set({ durationMin: entry.durationMin, updatedAt: now })
        .where(eq(dayItems.id, entry.id));
    }

    // Cuts: a miss with the reason's tier, pointing at this row (§6.5).
    if (result.cut.length > 0) {
      await tx
        .update(dayItems)
        .set({ assignmentState: "cut_by_shift", completionState: "missed", updatedAt: now })
        .where(and(eq(dayItems.userId, userId), inArray(dayItems.id, result.cut)));
      for (const id of result.cut) {
        await tx
          .insert(misses)
          .values({
            userId,
            dayItemId: id,
            tier: reason.tier,
            reasonKey: reason.key,
            reasonText: null,
            resolvedBy: "shift",
            shiftId: shift.id,
          })
          .onConflictDoUpdate({
            target: misses.dayItemId,
            set: {
              tier: reason.tier,
              reasonKey: reason.key,
              reasonText: null,
              resolvedBy: "shift",
              shiftId: shift.id,
              updatedAt: now,
            },
          });
      }
    }

    // *Choose*: left out today, no miss (v1 R1).
    if (result.notAssigned.length > 0) {
      await tx
        .update(dayItems)
        .set({ assignmentState: "not_assigned", updatedAt: now })
        .where(and(eq(dayItems.userId, userId), inArray(dayItems.id, result.notAssigned)));
    }

    // Times, for what moved — the two columns and no other.
    for (const entry of result.proposal) {
      if (entry.fixed) continue;
      await tx
        .update(dayItems)
        .set({
          scheduledStart: context.instantOf(entry.startMin),
          scheduledEnd: context.instantOf(entry.endMin),
          updatedAt: now,
        })
        .where(eq(dayItems.id, entry.id));
    }

    // A shift moves today's anchor: the day's column, the work container, its focus.
    if (kind === "shift" && result.slideMin > 0) {
      await tx
        .update(days)
        .set({
          workStartTime: clockFromMinutes(result.newAnchorMin % 1440),
          updatedAt: now,
        })
        .where(eq(days.id, context.day.id));
      const work = context.blocks.find(
        (block) => block.kind === "work" && block.scheduledStart !== null,
      );
      if (work) {
        await tx
          .update(dayBlocks)
          .set({
            scheduledStart: sql`${dayBlocks.scheduledStart} + make_interval(mins => ${result.slideMin})`,
            updatedAt: now,
          })
          .where(eq(dayBlocks.id, work.id));
        await tx
          .update(dayItems)
          .set({
            scheduledStart: sql`${dayItems.scheduledStart} + make_interval(mins => ${result.slideMin})`,
            updatedAt: now,
          })
          .where(
            and(
              eq(dayItems.dayBlockId, work.id),
              eq(dayItems.type, "deep_work"),
              isNull(dayItems.templateSlotId),
            ),
          );
      }
    }

    // The scope's block spans follow their items.
    for (const blockId of scope.blockIds) {
      await syncBlockSpan(tx, userId, blockId, context, now);
    }

    return {
      shiftId: shift.id,
      kind,
      undoUntil: new Date(now.getTime() + ADJUST_UNDO_WINDOW_MS),
      shortened: result.shortened.length,
      cut: result.cut.length,
      notAssigned: result.notAssigned.length,
      slideMin: result.slideMin,
    };
  });
}

/** A block's span from its assigned, timed items; the header reads the rows. */
async function syncBlockSpan(
  tx: Tx,
  userId: string,
  blockId: string,
  context: Context,
  now: Date,
): Promise<void> {
  const rows = await tx
    .select({ start: dayItems.scheduledStart, end: dayItems.scheduledEnd })
    .from(dayItems)
    .where(
      and(
        eq(dayItems.dayBlockId, blockId),
        eq(dayItems.userId, userId),
        eq(dayItems.assignmentState, "assigned"),
      ),
    );
  const starts = rows.map((row) => row.start).filter((at): at is Date => at !== null);
  const ends = rows.map((row) => row.end).filter((at): at is Date => at !== null);
  if (starts.length === 0) return;
  const start = new Date(Math.min(...starts.map((at) => at.getTime())));
  const end = new Date(Math.max(...ends.map((at) => at.getTime()), start.getTime()));
  void context;
  await tx
    .update(dayBlocks)
    .set({ scheduledStart: start, scheduledEnd: end, updatedAt: now })
    .where(eq(dayBlocks.id, blockId));
}

/* --------------------------------------------------------------- undo -- */

export async function adjustUndoEligibility(
  rls: RlsClient,
  userId: string,
  shiftId: string,
  now: Date = new Date(),
) {
  return shiftUndoEligibility(rls, userId, shiftId, now);
}

export async function undoAdjust(
  rls: RlsClient,
  userId: string,
  shiftId: string,
  now: Date = new Date(),
): Promise<{ uncut: number; slidBack: boolean; reflowed: number }> {
  const eligibility = await shiftUndoEligibility(rls, userId, shiftId, now);
  if (eligibility === null) throw new Error("no such shift");
  if (!eligibility.canUndo) throw new UndoRefusedError(eligibility.reason);

  return rls.execute(async (tx) => {
    const [shift] = await tx
      .select({
        id: shifts.id,
        dayId: shifts.dayId,
        kind: shifts.kind,
        deltaMin: shifts.deltaMin,
      })
      .from(shifts)
      .where(and(eq(shifts.id, shiftId), eq(shifts.userId, userId)))
      .limit(1);
    if (!shift) throw new Error("no such shift");

    // The cut items, back in the day; their misses go.
    const cutRows = await tx
      .select({ dayItemId: misses.dayItemId })
      .from(misses)
      .where(and(eq(misses.userId, userId), eq(misses.shiftId, shift.id)));
    const cutIds = cutRows.map((row) => row.dayItemId);
    if (cutIds.length > 0) {
      await tx
        .delete(misses)
        .where(and(eq(misses.userId, userId), eq(misses.shiftId, shift.id)));
      await tx
        .update(dayItems)
        .set({ assignmentState: "assigned", completionState: "upcoming", updatedAt: now })
        .where(and(eq(dayItems.userId, userId), inArray(dayItems.id, cutIds)));
    }

    // A shift's anchor comes back exactly.
    let slidBack = false;
    if (shift.kind === "shift" && shift.deltaMin > 0) {
      const [work] = await tx
        .select({ id: dayBlocks.id, start: dayBlocks.scheduledStart })
        .from(dayBlocks)
        .where(
          and(
            eq(dayBlocks.dayId, shift.dayId),
            eq(dayBlocks.userId, userId),
            eq(dayBlocks.kind, "work"),
          ),
        )
        .orderBy(asc(dayBlocks.sortOrder))
        .limit(1);
      if (work) {
        await tx
          .update(dayBlocks)
          .set({
            scheduledStart: sql`${dayBlocks.scheduledStart} - make_interval(mins => ${shift.deltaMin})`,
            updatedAt: now,
          })
          .where(eq(dayBlocks.id, work.id));
        await tx
          .update(dayItems)
          .set({
            scheduledStart: sql`${dayItems.scheduledStart} - make_interval(mins => ${shift.deltaMin})`,
            updatedAt: now,
          })
          .where(
            and(
              eq(dayItems.dayBlockId, work.id),
              eq(dayItems.type, "deep_work"),
              isNull(dayItems.templateSlotId),
            ),
          );
      }
      const [day] = await tx
        .select({ workStartTime: days.workStartTime })
        .from(days)
        .where(eq(days.id, shift.dayId))
        .limit(1);
      if (day?.workStartTime) {
        const restored = clockMin(day.workStartTime.slice(0, 5)) - shift.deltaMin;
        await tx
          .update(days)
          .set({ workStartTime: clockFromMinutes(((restored % 1440) + 1440) % 1440), updatedAt: now })
          .where(eq(days.id, shift.dayId));
      }
      slidBack = true;
    }

    await tx.delete(shifts).where(eq(shifts.id, shift.id));

    // The blocks re-flow around what came back; lengths stay as they are.
    const blocks = await tx
      .select({ id: dayBlocks.id, kind: dayBlocks.kind })
      .from(dayBlocks)
      .where(and(eq(dayBlocks.dayId, shift.dayId), eq(dayBlocks.userId, userId)));
    let reflowed = 0;
    for (const block of blocks) {
      if (block.kind === "work") continue;
      const result = await reflowBlock(tx, userId, block.id, { now });
      reflowed += result.moved.length;
    }

    return { uncut: cutIds.length, slidBack, reflowed };
  });
}
