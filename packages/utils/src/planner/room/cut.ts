import {
  buildPlan,
  emptyEdits,
  isOrient,
  liveBlocks,
  liveSlots,
  lockedReason,
  spanOf,
  type RoomDay,
  type RoomResult,
} from "./day";
import { summarizeSlide, type SlideSummary } from "./slide";

/**
 * Cut some, then slide the rest (later-start/states/cut-some.md). Ticked
 * items are off today only. When a block's last other item is cut, its
 * drives go too ("Drive there and home go with the workout"); a block with
 * nothing left is off today. Each cut block gives its minutes back where it
 * stands, so the blocks after it slide by what is still short: the first
 * block moves by the whole shortfall, the last by the shortfall less every
 * minute cut. Travel, set times, Urgent work and done items are never cut.
 */

export interface CutSummary extends SlideSummary {
  short: number;
  /** "<cut> of <short> min cut": the minutes the cuts free. */
  cut: number;
  /** What the last block still slides by. */
  stillShort: number;
  /** Every slot off today, the drives that went along included. */
  cutSlotIds: string[];
  /** Blocks with nothing left, off today. */
  cutBlockIds: string[];
}

export function cutAndSlide(
  day: RoomDay,
  {
    cuts,
    short,
    from = 0,
  }: { cuts: readonly string[]; short: number; from?: number },
): RoomResult<CutSummary> {
  const blocks = liveBlocks(day).filter((occurrence) => !isOrient(occurrence));
  const ticked = new Set(cuts);

  const known = new Set(
    blocks.flatMap((occurrence) =>
      liveSlots(occurrence).map((slot) => slot.id),
    ),
  );
  const unknown = cuts.filter((id) => !known.has(id));
  if (unknown.length > 0) {
    return { kind: "refused", reason: "unknown", ids: unknown };
  }

  const locked = blocks
    .flatMap(liveSlots)
    .filter((slot) => ticked.has(slot.id) && lockedReason(slot) !== null)
    .map((slot) => slot.id);
  if (locked.length > 0) {
    return { kind: "refused", reason: "not_eligible", ids: locked };
  }

  const edits = emptyEdits();
  const cutSlotIds: string[] = [];
  const cutBlockIds: string[] = [];
  let cut = 0;

  for (const occurrence of blocks) {
    const span = spanOf(occurrence);
    const slots = liveSlots(occurrence);
    const others = slots.filter((slot) => !slot.travel);
    const allOthersCut =
      others.length > 0 && others.every((slot) => ticked.has(slot.id));
    const gone = slots.filter(
      (slot) => ticked.has(slot.id) || (slot.travel && allOthersCut),
    );
    const shift = span.start >= from ? Math.max(0, short - cut) : 0;

    for (const slot of gone) {
      edits.slots.set(slot.id, "off");
      cutSlotIds.push(slot.id);
    }

    const length = span.end - span.start;
    if (gone.length > 0 && gone.length === slots.length) {
      edits.blocks.set(occurrence.block.id, "off");
      cutBlockIds.push(occurrence.block.id);
      cut += length;
      continue;
    }

    // A block keeps at least a minute; its slots held more than it ran.
    const freed = Math.min(
      length - 1,
      gone.reduce((sum, slot) => sum + slot.lengthMin, 0),
    );
    cut += freed;
    if (shift === 0 && freed === 0) continue;
    edits.blocks.set(occurrence.block.id, {
      start: span.start + shift,
      end: span.end + shift - freed,
    });
  }

  return buildPlan(day, edits, {
    ...summarizeSlide(day, edits, Math.max(0, short - cut)),
    short,
    cut,
    stillShort: Math.max(0, short - cut),
    cutSlotIds,
    cutBlockIds,
  });
}
