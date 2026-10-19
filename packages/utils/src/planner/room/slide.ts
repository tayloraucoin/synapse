import {
  buildPlan,
  dayEndOf,
  emptyEdits,
  isOrient,
  liveBlocks,
  movesOf,
  spanOf,
  splitsOf,
  type BlockMove,
  type PlanEdits,
  type RoomDay,
  type RoomResult,
  type SetTimeSplit,
} from "./day";

/**
 * Slide the day back (later-start/states/slide.md), the Phase 1 flat slide:
 * every block from a time moves by the same minutes and keeps its length.
 * Orient never moves. A set-time item and a day event stay at their time;
 * a block whose new span takes one in runs on either side of it, which is
 * how it "splits around it" with no write to the item. The slide may run
 * past Lights out (the sheet names the new end); a block past 24:00 refuses.
 */

export interface SlideSummary {
  minutes: number;
  /** Each block's old start beside its new one, by start. */
  moves: BlockMove[];
  splits: SetTimeSplit[];
  /** "The day ends <n> min later: Lights out at <time>." */
  dayEnd: { from: string; to: string };
}

/** Every live block but Orient starting at or after `from`, moved `minutes`. */
export function slideEdits(
  day: RoomDay,
  { from, minutes }: { from: number; minutes: number },
): PlanEdits {
  const edits = emptyEdits();
  for (const occurrence of liveBlocks(day)) {
    if (isOrient(occurrence)) continue;
    const span = spanOf(occurrence);
    if (span.start < from) continue;
    edits.blocks.set(occurrence.block.id, {
      start: span.start + minutes,
      end: span.end + minutes,
    });
  }
  return edits;
}

export function summarizeSlide(
  day: RoomDay,
  edits: PlanEdits,
  minutes: number,
): SlideSummary {
  return {
    minutes,
    moves: movesOf(day, edits),
    splits: splitsOf(day, edits),
    dayEnd: dayEndOf(day, edits),
  };
}

export function slideDay(
  day: RoomDay,
  { from, minutes }: { from: number; minutes: number },
): RoomResult<SlideSummary> {
  const edits = slideEdits(day, { from, minutes });
  return buildPlan(day, edits, summarizeSlide(day, edits, minutes));
}
