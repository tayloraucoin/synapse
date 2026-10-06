import { and, asc, eq, gt, isNotNull } from "drizzle-orm";

import { dayBlocks, dayItems, days, type RlsClient } from "@syn/db";
import {
  instantToWallClockMinutes,
  stackBlock,
  wallClockToInstant,
  type StackItem,
} from "@syn/utils";

import { minutesToClock } from "./materialize-day";

/**
 * The one re-lay of a set day — UX v1.1 §6.3–6.5, TD-4 (DYN-6).
 *
 * Five writers change a block after *Set the day*: Adjust, *Do now*, *Edit
 * today's*, a dragged item, a dragged band. Each moves or resizes something;
 * this is what puts the rest of the block back in order afterwards, and
 * nothing else lays out a confirmed block. It walks the block's MOVABLE items
 * with `stackBlock` from a position onward and writes `scheduled_start` and
 * `scheduled_end` — those two columns and no other.
 *
 * FIXED POINTS, and there are five kinds: a pin, a fixture, a hard item, a
 * done item, a running item. They enter the walk as pins where they are and
 * the stack flows around them. A writer that wants one moved says so by
 * moving it itself first (a confirmed pin drag); this function never does.
 *
 * `original_scheduled_start` IS NEVER HERE. The ghost is the gap between it
 * and `scheduled_start`, and every write below widens or narrows that gap
 * honestly (R23). The trigger stands behind the rule; this file honours it by
 * never naming the column in a `set`.
 *
 * OVERFLOW IS REPORTED, NEVER ABSORBED. When the walk runs a soft item into
 * a pin, or the block's movable end past the next block's start (the hard
 * anchor, the wind-down's start), the first such item is named with why.
 * *Do now* asks before writing (`dryRun`) and offers *Do now anyway*; the
 * other writers write and let the number be the feedback (R7).
 */

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

export type ReflowOverflow = {
  itemId: string;
  title: string;
  reason: "pin" | "anchor";
};

export type ReflowResult = {
  /** Items whose times the walk changed (or would change, on a dry run). */
  moved: string[];
  overflow: ReflowOverflow | null;
  /** The block's movable end after the walk, minutes from midnight. */
  endMin: number | null;
};

export type ReflowOptions = {
  /**
   * Re-lay from this item onward; everything before it keeps its time and
   * becomes a fixed point. Absent: the whole block from its first item.
   */
  from?: string;
  /** Items to treat as fixed for this walk beyond the five kinds (a moved item). */
  hold?: ReadonlyArray<string>;
  /** Compute and report, write nothing. */
  dryRun?: boolean;
  now?: Date;
};

type Row = {
  id: string;
  title: string;
  pinned: boolean;
  origin: string;
  scheduling: "hard" | "soft";
  durationMin: number | null;
  gapBeforeMin: number;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  sortOrder: number;
  multitaskId: string | null;
  alternatesId: string | null;
  alternatesChosen: boolean | null;
  priority: number;
  assignmentState: string;
  completionState: string;
  doneAt: Date | null;
  deferredAt: Date | null;
  timeMode: string;
};

export function isFixedPoint(row: {
  pinned: boolean;
  origin: string;
  scheduling: "hard" | "soft";
  completionState: string;
  doneAt: Date | null;
}): boolean {
  return (
    row.pinned ||
    row.origin === "fixture" ||
    row.scheduling === "hard" ||
    row.doneAt !== null ||
    row.completionState === "done" ||
    row.completionState === "active"
  );
}

/**
 * On the walk at all: assigned, timed, not deferred, not already over. The
 * work focus (no length of its own — it spans the container) is not.
 */
function isOnWalk(row: Row): boolean {
  return (
    row.assignmentState === "assigned" &&
    row.timeMode !== "unscheduled" &&
    row.deferredAt === null &&
    row.completionState !== "missed" &&
    row.completionState !== "carried" &&
    row.completionState !== "not_confirmed" &&
    row.scheduledStart !== null &&
    row.durationMin !== null
  );
}

export async function reflowBlock(
  tx: Tx,
  userId: string,
  blockId: string,
  options: ReflowOptions = {},
): Promise<ReflowResult> {
  const [block] = await tx
    .select({
      id: dayBlocks.id,
      dayId: dayBlocks.dayId,
      sortOrder: dayBlocks.sortOrder,
      scheduledStart: dayBlocks.scheduledStart,
      scheduledEnd: dayBlocks.scheduledEnd,
      date: days.date,
      timezone: days.timezone,
      anchorTime: days.anchorTime,
      wokeAt: days.wokeAt,
    })
    .from(dayBlocks)
    .innerJoin(days, eq(days.id, dayBlocks.dayId))
    .where(and(eq(dayBlocks.id, blockId), eq(dayBlocks.userId, userId)))
    .limit(1);
  if (!block) throw new Error("no such block");

  const zone = block.timezone;
  const date = String(block.date);
  const wakeMin =
    block.wokeAt === null
      ? clockMin(block.anchorTime)
      : instantToWallClockMinutes(block.wokeAt, zone);
  const minutesOf = (at: Date): number => {
    const minutes = instantToWallClockMinutes(at, zone);
    return minutes < wakeMin ? minutes + 1440 : minutes;
  };
  const instantOf = (minutes: number): Date =>
    wallClockToInstant(date, minutesToClock(minutes), zone);

  const rows: Row[] = await tx
    .select({
      id: dayItems.id,
      title: dayItems.title,
      pinned: dayItems.pinned,
      origin: dayItems.origin,
      scheduling: dayItems.scheduling,
      durationMin: dayItems.durationMin,
      gapBeforeMin: dayItems.gapBeforeMin,
      scheduledStart: dayItems.scheduledStart,
      scheduledEnd: dayItems.scheduledEnd,
      sortOrder: dayItems.sortOrder,
      multitaskId: dayItems.multitaskId,
      alternatesId: dayItems.alternatesId,
      alternatesChosen: dayItems.alternatesChosen,
      priority: dayItems.priority,
      assignmentState: dayItems.assignmentState,
      completionState: dayItems.completionState,
      doneAt: dayItems.doneAt,
      deferredAt: dayItems.deferredAt,
      timeMode: dayItems.timeMode,
    })
    .from(dayItems)
    .where(and(eq(dayItems.dayBlockId, blockId), eq(dayItems.userId, userId)))
    .orderBy(asc(dayItems.scheduledStart), asc(dayItems.sortOrder));

  const onWalk = rows.filter(isOnWalk);
  if (onWalk.length === 0) return { moved: [], overflow: null, endMin: null };

  // The next block's start bounds this one — the hard anchor after a
  // morning, the wind-down's start after the evening.
  const [next] = await tx
    .select({ scheduledStart: dayBlocks.scheduledStart })
    .from(dayBlocks)
    .where(
      and(
        eq(dayBlocks.dayId, block.dayId),
        eq(dayBlocks.userId, userId),
        gt(dayBlocks.sortOrder, block.sortOrder),
        isNotNull(dayBlocks.scheduledStart),
      ),
    )
    .orderBy(asc(dayBlocks.sortOrder))
    .limit(1);
  const bound = next?.scheduledStart ? minutesOf(next.scheduledStart) : null;

  const hold = new Set(options.hold ?? []);
  const fromIndex = options.from === undefined ? 0 : onWalk.findIndex((row) => row.id === options.from);
  const start = fromIndex === -1 ? 0 : fromIndex;

  const items: StackItem[] = onWalk.map((row, index) => {
    const startMin = minutesOf(row.scheduledStart as Date);
    const fixed = isFixedPoint(row) || hold.has(row.id) || index < start;
    return {
      id: row.id,
      durationMin: row.durationMin ?? 0,
      // A gap is a plan-time fact; after Set, the slide is by the minimum.
      gapBeforeMin: 0,
      pinnedAtMin: fixed ? startMin : null,
      scheduling: row.scheduling,
      priority: row.priority,
      multitaskId: row.multitaskId,
      alternatesId: row.alternatesId,
      alternatesChosen: row.alternatesChosen ?? undefined,
    };
  });

  const origin = minutesOf(onWalk[start]?.scheduledStart as Date);
  const walk = stackBlock({ items, flow: "forward", anchorMin: origin, bound });

  const placedById = new Map(walk.placed.map((entry) => [entry.id, entry]));
  const moved: string[] = [];
  const writes: Array<{ id: string; start: Date; end: Date }> = [];
  let movableEnd: number | null = null;

  for (const row of onWalk) {
    const placed = placedById.get(row.id);
    if (!placed || placed.pinned) continue;
    movableEnd = Math.max(movableEnd ?? placed.endMin, placed.endMin);
    const current = minutesOf(row.scheduledStart as Date);
    if (current === placed.startMin && row.scheduledEnd !== null) continue;
    moved.push(row.id);
    writes.push({ id: row.id, start: instantOf(placed.startMin), end: instantOf(placed.endMin) });
  }

  // Overflow: the soft item that runs into a pin, else the first past the bound.
  let overflow: ReflowOverflow | null = null;
  const overrunPin = walk.overrunPinIds[0];
  if (overrunPin !== undefined) {
    const pinIndex = items.findIndex((item) => item.id === overrunPin);
    const culprit = items
      .slice(0, pinIndex)
      .reverse()
      .find((item) => item.pinnedAtMin === null);
    const row = culprit ? onWalk.find((entry) => entry.id === culprit.id) : undefined;
    if (row) overflow = { itemId: row.id, title: row.title, reason: "pin" };
  }
  if (overflow === null && bound !== null) {
    const past = onWalk.find((row) => {
      const placed = placedById.get(row.id);
      return placed !== undefined && !placed.pinned && placed.endMin > bound;
    });
    if (past) overflow = { itemId: past.id, title: past.title, reason: "anchor" };
  }

  if (!options.dryRun) {
    const now = options.now ?? new Date();
    for (const write of writes) {
      await tx
        .update(dayItems)
        .set({ scheduledStart: write.start, scheduledEnd: write.end, updatedAt: now })
        .where(eq(dayItems.id, write.id));
    }
    // The block's span follows its items once something moved; the header
    // reads what the rows say. Rows off the walk (the work focus, a done
    // item) count with the times they have.
    if (writes.length > 0) {
      const starts: number[] = [];
      const ends: number[] = [];
      for (const row of rows) {
        if (row.scheduledStart === null || row.assignmentState !== "assigned") continue;
        const placed = placedById.get(row.id);
        starts.push(placed?.startMin ?? minutesOf(row.scheduledStart));
        ends.push(
          placed?.endMin ??
            (row.scheduledEnd === null
              ? minutesOf(row.scheduledStart) + (row.durationMin ?? 0)
              : minutesOf(row.scheduledEnd)),
        );
      }
      if (starts.length > 0) {
        const blockStart = instantOf(Math.min(...starts));
        const blockEnd = instantOf(Math.max(...ends));
        if (
          block.scheduledStart?.getTime() !== blockStart.getTime() ||
          block.scheduledEnd?.getTime() !== blockEnd.getTime()
        ) {
          await tx
            .update(dayBlocks)
            .set({ scheduledStart: blockStart, scheduledEnd: blockEnd, updatedAt: now })
            .where(eq(dayBlocks.id, block.id));
        }
      }
    }
  }

  return { moved, overflow, endMin: movableEnd };
}

function clockMin(clock: string): number {
  const [hour = "0", minute = "0"] = clock.split(":");
  return Number(hour) * 60 + Number(minute);
}
