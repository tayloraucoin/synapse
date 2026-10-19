import { clockMinutes } from "../day/wall-clock";

/**
 * Set my days' arithmetic on one day's column (USE-33): where a tap or the +
 * puts a new block, which blocks overlap and how to fix it, which sit outside
 * the day's bounds, and the day's strip.
 *
 * Times are `HH:MM` wall clock in the person's zone, as `readDay` gives them;
 * an end may be `24:00`. Nothing here reads the clock: the caller passes the
 * bounds and the blocks.
 */

/** Orient is always first and always 5 minutes (words-and-access.md). */
const ORIENT_MIN = 5;
const HALF_HOUR = 30;
const NEW_BLOCK_MIN = 60;
const DAY_END = 24 * 60;

interface Span {
  startsAt: string;
  endsAt: string;
}

/** Minutes → `HH:MM`, `24:00` kept as is. */
export function clockFromMinutes(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * A tapped time's new block: from the hour or half hour tapped to the next
 * block or one hour later, whichever is sooner. Tapping inside a block opens
 * it, so the caller never asks for one there.
 *
 * [ASSUMPTION] A rounded start that falls inside the block before it starts
 * at that block's end instead, and the end never passes Lights out (when the
 * start is before it) or 24:00.
 */
export function tappedSlot({
  at,
  blocks,
  lightsOut,
}: {
  at: string;
  blocks: readonly Span[];
  lightsOut: string;
}): Span {
  const tapped = clockMinutes(at);
  let start = Math.floor(tapped / HALF_HOUR) * HALF_HOUR;
  for (const block of blocks) {
    const blockEnd = clockMinutes(block.endsAt);
    if (clockMinutes(block.startsAt) <= start && blockEnd > start) {
      start = Math.min(blockEnd, tapped);
    }
  }

  let end = Math.min(start + NEW_BLOCK_MIN, DAY_END);
  for (const block of blocks) {
    const blockStart = clockMinutes(block.startsAt);
    if (blockStart > start) end = Math.min(end, blockStart);
  }
  const out = clockMinutes(lightsOut);
  if (out > start) end = Math.min(end, out);

  return { startsAt: clockFromMinutes(start), endsAt: clockFromMinutes(end) };
}

/** The +'s start: just after Orient on an empty day, else the last block's end. */
export function firstFreeTime({
  upAt,
  blocks,
}: {
  upAt: string;
  blocks: readonly Span[];
}): string {
  let free = clockMinutes(upAt) + ORIENT_MIN;
  for (const block of blocks) free = Math.max(free, clockMinutes(block.endsAt));
  return clockFromMinutes(free);
}

export interface BlockOverlap {
  /** The earlier block, by start. */
  a: string;
  b: string;
  /** The shared span. */
  startsAt: string;
  endsAt: string;
  /** D-USE-33's one fix: the later block starts at the earlier one's end, keeping its length. */
  fixStartsAt: string;
}

/** Each two blocks that share time (D-USE-33): both stay, and the fix is named. */
export function overlaps(
  blocks: readonly (Span & { id: string })[],
): BlockOverlap[] {
  const sorted = [...blocks].sort(
    (x, y) =>
      clockMinutes(x.startsAt) - clockMinutes(y.startsAt) ||
      clockMinutes(x.endsAt) - clockMinutes(y.endsAt) ||
      x.id.localeCompare(y.id),
  );

  const pairs: BlockOverlap[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      const a = sorted[i] as Span & { id: string };
      const b = sorted[j] as Span & { id: string };
      const shareStart = Math.max(
        clockMinutes(a.startsAt),
        clockMinutes(b.startsAt),
      );
      const shareEnd = Math.min(clockMinutes(a.endsAt), clockMinutes(b.endsAt));
      if (shareStart >= shareEnd) continue;
      pairs.push({
        a: a.id,
        b: b.id,
        startsAt: clockFromMinutes(shareStart),
        endsAt: clockFromMinutes(shareEnd),
        fixStartsAt: a.endsAt,
      });
    }
  }
  return pairs;
}

/** D-USE-32: a block before Up at or after Lights out keeps its place, dashed. */
export function boundsEdge(
  block: Span,
  bounds: { upAt: string; lightsOut: string },
): "before_up_at" | "after_lights_out" | null {
  if (clockMinutes(block.startsAt) < clockMinutes(bounds.upAt)) {
    return "before_up_at";
  }
  if (clockMinutes(block.endsAt) > clockMinutes(bounds.lightsOut)) {
    return "after_lights_out";
  }
  return null;
}

export interface StripPart {
  /** `"orient"`, `"open"` for a gap, or the block's kind. */
  part: string;
  /** Its share of the day between its bounds; the parts sum to one. */
  share: number;
}

/**
 * A day's strip: Orient's sliver first, then each block and each open gap in
 * time order, each its share of Up at to Lights out. A block's part outside
 * the bounds, or under an earlier block, is not drawn twice.
 */
export function dayStrip({
  upAt,
  lightsOut,
  blocks,
}: {
  upAt: string | null;
  lightsOut: string | null;
  blocks: readonly (Span & { kind: string })[];
}): StripPart[] {
  if (upAt === null || lightsOut === null) return [];
  const from = clockMinutes(upAt);
  const to = clockMinutes(lightsOut);
  const total = to - from;
  if (total <= 0) return [];

  const minutes: { part: string; min: number }[] = [];
  let cursor = Math.min(from + ORIENT_MIN, to);
  minutes.push({ part: "orient", min: cursor - from });

  const sorted = [...blocks].sort(
    (x, y) => clockMinutes(x.startsAt) - clockMinutes(y.startsAt),
  );
  for (const block of sorted) {
    const start = Math.max(clockMinutes(block.startsAt), cursor);
    const end = Math.min(clockMinutes(block.endsAt), to);
    if (end <= start) continue;
    if (start > cursor) minutes.push({ part: "open", min: start - cursor });
    minutes.push({ part: block.kind, min: end - start });
    cursor = end;
  }
  if (cursor < to) minutes.push({ part: "open", min: to - cursor });

  return minutes
    .filter((entry) => entry.min > 0)
    .map((entry) => ({ part: entry.part, share: entry.min / total }));
}
