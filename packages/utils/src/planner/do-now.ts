import { buildPlan, spanOf, type RoomOccurrence } from "./room/day";
import { slideEdits } from "./room/slide";

/**
 * Do now on the close card (USE-26; D-USE-30, D-USE-72): each item left with
 * its consequence before the tap, and the slide the tap writes when it runs
 * past the block's end. The card's line and the write both come from here,
 * so what the line says is what happens.
 */

const MIN_MS = 60_000;

/** One item left, in the card's order. A missing length counts as none. */
export interface DoNowItem {
  id: string;
  lengthMin: number | null;
}

/**
 * One item's consequence, counting the items above it as done now too:
 * it fits by a time; or it runs `overrunMin` past the block's end, so the
 * next block would start at a time (or, with none after, the block would
 * end at one).
 */
export type DoNowLine =
  | { id: string; fitsBy: Date }
  | { id: string; overrunMin: number; nextStartsAt: Date }
  | { id: string; overrunMin: number; endsAt: Date };

export function doNowLines({
  block,
  left,
  next,
  now,
}: {
  block: { end: Date };
  left: readonly DoNowItem[];
  next: { name: string; start: Date } | null;
  now: Date;
}): DoNowLine[] {
  // Counted from the minute, as Now's clock reads it: seconds never tip a line.
  let at = Math.floor(now.getTime() / MIN_MS) * MIN_MS;
  return left.map(({ id, lengthMin }) => {
    at += (lengthMin ?? 0) * MIN_MS;
    const by = new Date(at);
    if (at <= block.end.getTime()) return { id, fitsBy: by };
    // Whole minutes from the item's planned end to the block's end.
    const overrunMin = Math.ceil((at - block.end.getTime()) / MIN_MS);
    return next === null
      ? { id, overrunMin, endsAt: shift(block.end, overrunMin) }
      : { id, overrunMin, nextStartsAt: shift(next.start, overrunMin) };
  });
}

const shift = (at: Date, minutes: number) =>
  new Date(at.getTime() + minutes * MIN_MS);

/** A date's `block_changes` row as written: `blockChangeInput`'s shape. */
export interface SlideChange {
  blockId: string;
  onDate: string;
  startsAt: string;
  endsAt: string;
}

/**
 * The flat slide past a block's end, on the room engine (A later start's
 * Phase 1 default): the block's end and every later block today move by the
 * overrun, each keeping its length, Orient never. Today only: changes to the
 * date's `block_changes` rows, read from the date's times, so a change
 * already on the date is carried and replaced, never stacked. Day events are
 * not blocks and never move. Null when a block would pass 24:00.
 */
export function slideAfter({
  blocks,
  fromBlockId,
  overrunMin,
  dateKey,
}: {
  blocks: readonly Omit<RoomOccurrence, "slots">[];
  fromBlockId: string;
  overrunMin: number;
  dateKey: string;
}): SlideChange[] | null {
  const from = blocks.find((occurrence) => occurrence.block.id === fromBlockId);
  if (!from || overrunMin <= 0) return [];
  const day = {
    dateKey,
    blocks: blocks.map((occurrence) => ({ ...occurrence, slots: [] })),
    events: [],
  };
  const span = spanOf({ ...from, slots: [] });
  const edits = slideEdits(day, { from: span.end, minutes: overrunMin });
  edits.blocks.set(from.block.id, {
    start: span.start,
    end: span.end + overrunMin,
  });
  const result = buildPlan(day, edits, null);
  if (result.kind === "refused") return null;
  const usual = new Map(blocks.map(({ block }) => [block.id, block]));
  return result.plan.changes.flatMap((change): SlideChange[] => {
    if (change.kind === "block_times") {
      const { blockId, onDate, startsAt, endsAt } = change;
      return [{ blockId, onDate, startsAt, endsAt }];
    }
    // Back on its usual times: written as them, which reads the same.
    const block = change.kind === "block_usual" && usual.get(change.blockId);
    return block
      ? [
          {
            blockId: block.id,
            onDate: change.onDate,
            startsAt: block.startsAt,
            endsAt: block.endsAt,
          },
        ]
      : [];
  });
}
