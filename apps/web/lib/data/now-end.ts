import { blockEnding } from "@syn/utils";
import type { Today } from "./derive-today";

/**
 * Now at a block's end and the day's (USE-20; day/now/states all-done-*,
 * ahead, empty-break, empty-no-blocks): the all-done footer, the add row,
 * End break and the empty state, derived beside `deriveNow` so the screen
 * never decides any of them. Names and times only: nothing counts what was
 * done or left, and nothing says how far ahead.
 */

type Occurrence = Today["occurrences"]["blocks"][number];

/** A block after the active one: what Start <Block> or End break opens. */
export interface NowNextBlock {
  id: string;
  name: string;
  /** "HH:MM". */
  startsAt: string;
  /** "HH:MM": the end Start keeps (D-USE-72). */
  endsAt: string;
}

export type NowFooter =
  /**
   * Every item done (D-USE-28): "<Block> complete", "Next: <Block>, <time>"
   * and Start <Block>. `doneBefore` is the planned end while it is still
   * ahead: the quiet line and "Or a to-do until <end>" (D-USE-72).
   */
  | {
      kind: "done";
      blockName: string;
      next: NowNextBlock | null;
      doneBefore: string | null;
    }
  /** An empty Break (D-USE-74): End break opens the next block. */
  | { kind: "end-break"; next: NowNextBlock | null };

/** "Add to <Block>" and "Free until <end>" (D-USE-30, D-USE-69). */
export interface NowAddRow {
  blockId: string;
  blockName: string;
  /** "HH:MM", the block's end. */
  freeUntil: string;
}

export interface NowEnd {
  footer: NowFooter | null;
  addRow: NowAddRow | null;
  /** The day's blocks are done: no block left, the tray open (D-USE-26). */
  empty: boolean;
}

/** The parts of `deriveNow`'s spans this reads. */
export interface NowEndSpan {
  occurrence: Occurrence;
  items: readonly { id: string; done: boolean }[];
  start: Date;
  end: Date;
  allDay: boolean;
}

/**
 * The first set-time block to start after both `now` and the active
 * block's start: Wellness's is Training at 7:34, and Training put in focus
 * early has Breakfast, never itself.
 */
function nextAfter(
  spans: readonly NowEndSpan[],
  active: NowEndSpan,
  now: Date,
): NowNextBlock | null {
  const after = Math.max(now.getTime(), active.start.getTime());
  const next = spans.find(
    (span) => span !== active && !span.allDay && span.start.getTime() > after,
  );
  return next
    ? {
        id: next.occurrence.block.id,
        name: next.occurrence.block.name,
        startsAt: next.occurrence.startsAt,
        endsAt: next.occurrence.endsAt,
      }
    : null;
}

/** An empty Break: Meal off and nothing in it, a true break. */
function isEmptyBreak(span: NowEndSpan): boolean {
  const { block } = span.occurrence;
  return block.kind === "break" && !block.meal && span.items.length === 0;
}

export function deriveNowEnd(
  spans: readonly NowEndSpan[],
  active: NowEndSpan | null,
  /** Only a block's items come to an end; a checklist has no footer. */
  itemsForm: boolean,
  now: Date,
): NowEnd {
  if (active === null) {
    return { footer: null, addRow: null, empty: spans.length > 0 };
  }
  const { block, endsAt } = active.occurrence;
  if (isEmptyBreak(active)) {
    return {
      footer: { kind: "end-break", next: nextAfter(spans, active, now) },
      addRow: null,
      empty: false,
    };
  }
  const ending = blockEnding(active, active.items, now);
  if (!itemsForm || !ending.allDone) {
    return { footer: null, addRow: null, empty: false };
  }
  return {
    footer: {
      kind: "done",
      blockName: block.name,
      next: nextAfter(spans, active, now),
      doneBefore: ending.ahead ? endsAt : null,
    },
    addRow:
      ending.freeUntil !== null && !block.meal
        ? { blockId: block.id, blockName: block.name, freeUntil: endsAt }
        : null,
    empty: false,
  };
}
