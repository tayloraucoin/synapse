import { WORK_SIZES } from "@syn/constants";
import { tierRank, type WorkTier } from "./next";

/**
 * Whether an item fits a Work block (USE-8; the size dev note, Place's
 * doesn't-fit, the meeting-inside-a-block dev note, D-USE-57).
 *
 * The day plans with the TOP of every range, in whole minutes. The item goes
 * at the end of its tier, after the tiers above it; lower tiers slide (Stretch
 * gives first), so only the tiers at and above it count. A meeting inside the
 * block is a pinned span: the block's free time shrinks by it, overlapping
 * meetings counted once, and times flow around it. A done slot still holds
 * its top: this is the plan, not the clock.
 *
 * Lengths only, never words: each surface words its own line.
 */

export type WorkSize = (typeof WORK_SIZES)[number];

const MIN = 60_000;

/** The top of each size's default range; Huge (4 h or more) has none. */
const SIZE_TOP_MIN: Record<WorkSize, number | null> = {
  quick: 30,
  small: 60,
  medium: 120,
  large: 240,
  huge: null,
};

const positive = (value: number | null | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

/**
 * A slot's top: the session's own length, then the item's top, then its
 * size's default top. `null` is no top (Huge with no range); an unsized item
 * with no length counts 0.
 */
export function topMinutes(input: {
  lengthMin: number | null;
  lengthMaxMin: number | null;
  size: WorkSize | null;
}): number | null {
  if (positive(input.lengthMin)) return Math.ceil(input.lengthMin);
  if (positive(input.lengthMaxMin)) return Math.ceil(input.lengthMaxMin);
  if (input.size === null || !(input.size in SIZE_TOP_MIN)) return 0;
  return SIZE_TOP_MIN[input.size];
}

export interface BlockSpan {
  start: Date;
  end: Date;
}

export interface BlockFitSlot {
  tier: WorkTier;
  topMin: number | null;
}

export type BlockFit =
  | { fits: true; runsTo: Date; freeMin: number }
  | { fits: false; runsTo: Date | null; overMin: number | null };

/** Minutes from the block's start; NaN reads as 0. */
function offsetMin(at: Date, start: number): number {
  const ms = at.getTime() - start;
  return Number.isFinite(ms) ? ms / MIN : 0;
}

/** The meetings inside the block as merged whole-minute spans, ascending. */
function busySpans(
  busy: readonly BlockSpan[],
  start: number,
  lengthMin: number,
): [number, number][] {
  const clipped = busy
    .map((span): [number, number] => [
      Math.max(0, Math.floor(offsetMin(span.start, start))),
      Math.min(lengthMin, Math.ceil(offsetMin(span.end, start))),
    ])
    .filter(([from, to]) => to > from)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const merged: [number, number][] = [];
  for (const [from, to] of clipped) {
    const last = merged.at(-1);
    if (last && from <= last[1]) last[1] = Math.max(last[1], to);
    else merged.push([from, to]);
  }
  return merged;
}

/** Where `needMin` of free time runs out, walking around the meetings. */
function endAfter(needMin: number, spans: readonly [number, number][]): number {
  let at = 0;
  let left = needMin;
  for (const [from, to] of spans) {
    if (left <= from - at) return at + left;
    left -= from - at;
    at = to;
  }
  // Past the last meeting, and past the block's end when it doesn't fit.
  return at + left;
}

export function fitInBlock(input: {
  block: BlockSpan;
  slots: readonly BlockFitSlot[];
  busy: readonly BlockSpan[];
  tier: WorkTier;
  topMin: number | null;
}): BlockFit {
  const start = input.block.start.getTime();
  const end = input.block.end.getTime();
  const lengthMin =
    Number.isFinite(start) && Number.isFinite(end) && end > start
      ? Math.floor((end - start) / MIN)
      : 0;

  const rank = tierRank(input.tier);
  const held = input.slots
    .filter((slot) => tierRank(slot.tier) <= rank)
    .map((slot) => slot.topMin);
  if (input.topMin === null || held.includes(null)) {
    return { fits: false, runsTo: null, overMin: null };
  }

  const toWhole = (value: number | null): number =>
    positive(value) ? Math.ceil(value) : 0;
  const needMin =
    held.reduce<number>((sum, top) => sum + toWhole(top), 0) +
    toWhole(input.topMin);

  const spans = busySpans(input.busy, start, lengthMin);
  const busyMin = spans.reduce((sum, [from, to]) => sum + (to - from), 0);
  const freeMin = lengthMin - busyMin - needMin;

  const origin = Number.isFinite(start) ? start : 0;
  const runsTo = new Date(origin + endAfter(needMin, spans) * MIN);
  return freeMin >= 0
    ? { fits: true, runsTo, freeMin }
    : { fits: false, runsTo, overMin: -freeMin };
}

export interface BlockFitDay {
  dateKey: string;
  block: BlockSpan | null;
  slots: readonly BlockFitSlot[];
  busy: readonly BlockSpan[];
}

/**
 * The next day with room: the first day, by date, whose Work block holds the
 * item in its tier at the top of its range. The caller passes the later days
 * of the week [ASSUMPTION, as doesnt-fit.md says].
 */
export function firstDayWithRoom(
  days: readonly BlockFitDay[],
  tier: WorkTier,
  topMin: number | null,
): string | null {
  const byDate = [...days].sort((a, b) =>
    a.dateKey < b.dateKey ? -1 : a.dateKey > b.dateKey ? 1 : 0,
  );
  for (const day of byDate) {
    if (day.block === null) continue;
    const fit = fitInBlock({
      block: day.block,
      slots: day.slots,
      busy: day.busy,
      tier,
      topMin,
    });
    if (fit.fits) return day.dateKey;
  }
  return null;
}
