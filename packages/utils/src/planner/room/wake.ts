import {
  buildPlan,
  emptyEdits,
  isOrient,
  liveBlocks,
  movesOf,
  spanOf,
  toClock,
  type BlockMove,
  type RoomDay,
  type RoomPlan,
} from "./day";

/**
 * A late wake (Review the day's late state, open-1 as drawn): the day laid
 * out from the wake. Orient takes its minutes from the wake; a block that
 * ends by then has passed and folds; a block under way starts after Orient
 * and keeps its end; nothing else moves. Orient itself is never moved here:
 * its own write is the Orient ticket's, and the plan only says where it sits.
 */

/** About 15 minutes past Up at, "A later start" offers itself (open-1). */
export const LATER_START_OFFER_MIN = 15;

/** Orient's length when the day has no Orient block to read it from. */
export const ORIENT_DEFAULT_MIN = 5;

export interface WakeSummary {
  /** Minutes from Up at to the wake; never below 0. */
  minutesLate: number;
  /** Where Orient sits: from the wake for its length. */
  orient: { startsAt: string; endsAt: string };
  /** Passed blocks, in order: "Planned before <wake> · <block>, <block>". */
  folded: string[];
  /** The block under way at Orient's end, now starting there. */
  underWay: string | null;
  /** Go mode starts here: the first block after Orient. */
  firstBlockId: string | null;
  moves: BlockMove[];
}

/** Whether the wake is far enough past Up at to offer "A later start". */
export function offerLaterStart({
  upAt,
  wokeAt,
}: {
  upAt: number;
  wokeAt: number;
}): boolean {
  return wokeAt - upAt >= LATER_START_OFFER_MIN;
}

export function layoutFromWake(
  day: RoomDay,
  { upAt, wokeAt }: { upAt: number; wokeAt: number },
): RoomPlan<WakeSummary> {
  const blocks = liveBlocks(day);
  const orient = blocks.find(isOrient);
  const orientMin = orient
    ? spanOf(orient).end - spanOf(orient).start
    : ORIENT_DEFAULT_MIN;
  const orientEnd = wokeAt + orientMin;

  const edits = emptyEdits();
  const folded: string[] = [];
  let underWay: string | null = null;
  let firstBlockId: string | null = null;

  for (const occurrence of blocks) {
    if (isOrient(occurrence)) continue;
    const span = spanOf(occurrence);
    if (span.end <= orientEnd) {
      folded.push(occurrence.block.id);
      continue;
    }
    firstBlockId ??= occurrence.block.id;
    if (span.start < orientEnd) {
      underWay ??= occurrence.block.id;
      edits.blocks.set(occurrence.block.id, {
        start: orientEnd,
        end: span.end,
      });
    }
  }

  const summary: WakeSummary = {
    minutesLate: Math.max(0, wokeAt - upAt),
    orient: { startsAt: toClock(wokeAt), endsAt: toClock(orientEnd) },
    folded,
    underWay,
    firstBlockId,
    moves: movesOf(day, edits),
  };

  // A start moved later inside its own span never passes 24:00.
  const result = buildPlan(day, edits, summary);
  if (result.kind !== "plan") {
    throw new Error("layoutFromWake: a later start passed midnight");
  }
  return result.plan;
}
