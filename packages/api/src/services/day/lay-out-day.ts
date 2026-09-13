import type {
  BlockFlow,
  BlockKind,
  DayBlockState,
  TrainingPlacement,
} from "@syn/types";
import { stackBlock, type StackItem } from "@syn/utils";

/**
 * The whole day's arithmetic, as one pure function — UX v1.1 §3.3, §3.7,
 * §7.1, §11.11 (TD-4).
 *
 * `stackBlock` walks one block. This chains the blocks: each one's anchor is
 * decided by its kind and by where the walk has reached, in `sort_order`.
 * Minutes from midnight of the day's date in, minutes out; the caller turns
 * them into instants with `wallClockToInstant` in the day's own zone, and
 * nothing here knows what a zone is.
 *
 * THE CHAIN, in the words of §3.3: "once the day is set, everything flows
 * forward from wake — routine, then prep, in order — and whatever is left
 * over lands as slack just before the anchor."
 *
 *   orient · morning · placed training ..... forward from the cursor, which
 *                                             starts at wake (`woke_at`, else
 *                                             the day's anchor)
 *   prep ................................... backward to the work anchor, so
 *                                             it ends exactly when work starts;
 *                                             the cursor becomes that anchor
 *   work ................................... the container, from the anchor
 *                                             to work end; split around an
 *                                             *inside work* placement
 *   activity ............................... forward from work's end
 *   wind_down .............................. backward to lights-out; the
 *                                             devices-off marker is a pin in
 *                                             it like any other
 *   unplaced training · break · pooled ..... no times
 *
 * THE ANCHOR'S HARDNESS is the one place the chain bends (§3.3, Q19). A hard
 * anchor stays: a routine that runs long overruns prep and the overrun is
 * reported, never clamped (R7). A soft anchor waits: work starts at the later
 * of the profile's time and where the morning actually ends plus prep, and
 * the caller writes that as today's `work_start_time`.
 *
 * THIS FUNCTION IS CALLED BY BUILD AND BY CONFIRM ALIKE. Build lays out the
 * decided blocks from the profile's anchors; confirm resolves the pools and
 * calls it again with `woke_at`. One layout, two moments — a second one
 * would be a second opinion about where 8:03 is.
 */

export type LayoutItem = StackItem & {
  /** The work focus — it takes the whole container rather than a length. */
  spansBlock?: boolean;
};

export type LayoutBlock = {
  id: string;
  kind: BlockKind;
  flow: BlockFlow;
  sortOrder: number;
  state: DayBlockState;
  placement: TrainingPlacement | null;
  /** Work only: which half of a split container this row is. */
  splitIndex: 0 | 1 | null;
  /** In the block's own item order. */
  items: LayoutItem[];
};

export type LayoutAnchors = {
  /** `woke_at` in the day's zone, else the day's anchor. */
  wakeMin: number;
  workStartMin: number | null;
  workEndMin: number | null;
  lightsOutMin: number | null;
  anchorIsHard: boolean;
};

export type PlacedItemMin = { startMin: number; endMin: number; pinned: boolean };

export type LaidBlock = {
  id: string;
  startMin: number | null;
  endMin: number | null;
  items: Map<string, PlacedItemMin>;
  /** Minutes the block runs past its bound; 0 when it fits (never clamped). */
  overrunMin: number;
  /** Minutes to spare before its bound; 0 when unbounded or over. */
  slackMin: number;
};

export type DayLayout = {
  blocks: LaidBlock[];
  /** Where work starts today after a soft anchor slides; null without work. */
  workStartMin: number | null;
  /** Where the morning ends — the routine's last minute, before prep. */
  morningEndMin: number | null;
};

const MINUTES_PER_DAY = 1440;

/** Round to the nearest five minutes — the granularity a person plans in. */
function toFive(minutes: number): number {
  return Math.round(minutes / 5) * 5;
}

/** A clock that reads earlier than the wake is tonight's, not this morning's. */
function afterWake(minutes: number | null, wakeMin: number): number | null {
  if (minutes === null) return null;
  return minutes < wakeMin ? minutes + MINUTES_PER_DAY : minutes;
}

function walk(
  block: LayoutBlock,
  flow: BlockFlow,
  anchorMin: number,
  bound: number | null,
): LaidBlock {
  const items = block.items.filter((item) => item.spansBlock !== true);
  const result = stackBlock({ items, flow, anchorMin, bound });
  const placed = new Map<string, PlacedItemMin>();
  for (const entry of result.placed) {
    placed.set(entry.id, {
      startMin: entry.startMin,
      endMin: entry.endMin,
      pinned: entry.pinned,
    });
  }
  return {
    id: block.id,
    startMin: items.length === 0 ? null : result.startMin,
    endMin: items.length === 0 ? null : result.endMin,
    items: placed,
    overrunMin: result.overrunMin,
    slackMin: result.slackMin,
  };
}

/** A block that has no times today. */
function unplaced(block: LayoutBlock): LaidBlock {
  return {
    id: block.id,
    startMin: null,
    endMin: null,
    items: new Map(),
    overrunMin: 0,
    slackMin: 0,
  };
}

/** The total a block asks for, before it is placed — prep's budget number. */
export function blockTotalMin(block: LayoutBlock): number {
  const items = block.items.filter((item) => item.spansBlock !== true);
  return stackBlock({ items, flow: block.flow, anchorMin: 0 }).totalMin;
}

export function layOutDay(
  blocks: readonly LayoutBlock[],
  anchors: LayoutAnchors,
): DayLayout {
  const ordered = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);
  const laid = new Map<string, LaidBlock>();

  const workStart = afterWake(anchors.workStartMin, anchors.wakeMin);
  const workEnd = afterWake(anchors.workEndMin, anchors.wakeMin);
  const lightsOut = afterWake(anchors.lightsOutMin, anchors.wakeMin);

  const insideWork = ordered.find(
    (block) =>
      (block.kind === "training" || block.kind === "break") &&
      block.placement === "inside_work" &&
      block.state !== "not_today",
  );
  const insideWorkMin = insideWork ? blockTotalMin(insideWork) : 0;

  let cursor = anchors.wakeMin;
  let effectiveWorkStart: number | null = null;
  let morningEndMin: number | null = null;
  /** The split point, once the first work half has fixed it. */
  let splitAt: number | null = null;

  const prep = ordered.find((block) => block.kind === "prep");
  const prepTotal = prep ? blockTotalMin(prep) : 0;

  for (const block of ordered) {
    if (block.state === "pooled" || block.state === "not_today") {
      laid.set(block.id, unplaced(block));
      continue;
    }

    switch (block.kind) {
      case "orient":
      case "morning": {
        const result = walk(block, "forward", cursor, null);
        laid.set(block.id, result);
        if (result.endMin !== null) cursor = Math.max(cursor, result.endMin);
        if (block.kind === "morning") morningEndMin = cursor;
        break;
      }

      case "training":
      case "break": {
        if (block.placement === null) {
          laid.set(block.id, unplaced(block));
          break;
        }
        if (block.placement === "inside_work") {
          // Laid when the work container fixes the split point, below.
          break;
        }
        const result = walk(block, "forward", cursor, null);
        laid.set(block.id, result);
        if (result.endMin !== null) cursor = Math.max(cursor, result.endMin);
        break;
      }

      case "prep": {
        if (workStart === null) {
          // No work anchor: prep is just the next thing after the morning.
          const result = walk(block, "forward", cursor, null);
          laid.set(block.id, result);
          if (result.endMin !== null) cursor = Math.max(cursor, result.endMin);
          break;
        }
        // A soft anchor waits for the morning; a hard one does not (§3.3).
        const anchor = anchors.anchorIsHard
          ? workStart
          : Math.max(workStart, cursor + prepTotal);
        const result = walk(block, "backward", anchor, cursor);
        laid.set(block.id, result);
        effectiveWorkStart = anchor;
        cursor = anchor;
        break;
      }

      case "work": {
        let start: number;
        if (effectiveWorkStart !== null) {
          start = effectiveWorkStart;
        } else if (workStart === null) {
          start = cursor;
        } else {
          start = anchors.anchorIsHard ? workStart : Math.max(workStart, cursor);
        }
        effectiveWorkStart = start;
        const end = workEnd === null ? start : Math.max(start, workEnd);

        let blockStart = start;
        let blockEnd = end;

        if (insideWork && block.splitIndex !== null) {
          // The workout sits at the centre of the container, on a five.
          if (splitAt === null) {
            splitAt = Math.max(
              start,
              Math.min(end - insideWorkMin, toFive(start + (end - start - insideWorkMin) / 2)),
            );
          }
          if (block.splitIndex === 0) {
            blockEnd = splitAt;
          } else {
            blockStart = splitAt + insideWorkMin;
          }
        }

        const result = walk(block, "forward", blockStart, null);
        // The container has a span whether or not anything is pinned in it.
        result.startMin = blockStart;
        result.endMin = blockEnd;
        for (const item of block.items) {
          if (item.spansBlock === true) {
            result.items.set(item.id, {
              startMin: blockStart,
              endMin: blockEnd,
              pinned: false,
            });
          }
        }
        laid.set(block.id, result);
        cursor = Math.max(cursor, end);

        if (insideWork && block.splitIndex === 0 && splitAt !== null) {
          const placed = walk(insideWork, "forward", splitAt, null);
          laid.set(insideWork.id, placed);
        }
        break;
      }

      case "activity": {
        const result = walk(block, "forward", cursor, null);
        laid.set(block.id, result);
        if (result.endMin !== null) cursor = Math.max(cursor, result.endMin);
        break;
      }

      case "wind_down": {
        if (lightsOut === null) {
          const result = walk(block, "forward", cursor, null);
          laid.set(block.id, result);
          if (result.endMin !== null) cursor = Math.max(cursor, result.endMin);
          break;
        }
        const result = walk(block, "backward", lightsOut, cursor);
        laid.set(block.id, result);
        cursor = Math.max(cursor, lightsOut);
        break;
      }
    }
  }

  // An *inside work* block on a day without a work container is unplaced.
  if (insideWork && !laid.has(insideWork.id)) {
    laid.set(insideWork.id, unplaced(insideWork));
  }

  return {
    blocks: ordered.map((block) => laid.get(block.id) ?? unplaced(block)),
    workStartMin: effectiveWorkStart,
    morningEndMin,
  };
}
