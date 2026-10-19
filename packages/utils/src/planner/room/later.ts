import {
  buildPlan,
  emptyEdits,
  isOrient,
  liveBlocks,
  spanOf,
  toClock,
  type RoomDay,
  type RoomResult,
} from "./day";
import { summarizeSlide, type SlideSummary } from "./slide";

/**
 * Move later (D-USE-69; late-passed-open.md): a passed block comes back
 * right after Orient at the wake, keeping its length, and every block not
 * yet passed slides by that length, as "Slide the day back" does. A block
 * under way at Orient's end starts after the moved one and keeps its length
 * from Orient's end, so the day may be passed as read or as laid out from
 * the wake and lands the same. Other passed blocks stay folded.
 */

export interface MoveLaterSummary extends SlideSummary {
  blockId: string;
  startsAt: string;
}

export function moveLater(
  day: RoomDay,
  { blockId, orientEnd }: { blockId: string; orientEnd: number },
): RoomResult<MoveLaterSummary> {
  const blocks = liveBlocks(day);
  const moved = blocks.find((occurrence) => occurrence.block.id === blockId);
  if (moved === undefined) {
    return { kind: "refused", reason: "unknown", ids: [blockId] };
  }
  if (isOrient(moved)) {
    return { kind: "refused", reason: "not_eligible", ids: [blockId] };
  }

  const span = spanOf(moved);
  const length = span.end - span.start;
  const edits = emptyEdits();
  edits.blocks.set(blockId, { start: orientEnd, end: orientEnd + length });

  for (const occurrence of blocks) {
    if (occurrence === moved || isOrient(occurrence)) continue;
    const other = spanOf(occurrence);
    if (other.end <= orientEnd) continue;
    edits.blocks.set(occurrence.block.id, {
      start: Math.max(other.start, orientEnd) + length,
      end: other.end + length,
    });
  }

  return buildPlan(day, edits, {
    ...summarizeSlide(day, edits, length),
    blockId,
    startsAt: toClock(orientEnd),
  });
}
