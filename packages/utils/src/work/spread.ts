import { clockMinutes } from "../day/wall-clock";

/**
 * Spread across the week (USE-77; interactions/spread, D-USE-40, D-USE-42):
 * the preview of one item placed as sessions on several days.
 *
 * Each picked day gets one session (one item sits once a day) in the block
 * the pick names: Morning Work is the day's first Work block by start,
 * Afternoon Work its later ones (the one with the most time left), Pick
 * blocks a block named per day. Nothing lands in a block not chosen. A
 * session gets the block's time left after its other work, at the top of
 * their ranges, and after the meetings inside it, in whole minutes; a set
 * length is capped by that. The sessions stop when Work left is used up.
 * Lengths only: each surface words its own lines.
 */

export interface SpreadSlot {
  /** "[Alder intro]". */
  title: string;
  /** "3/3" on a session of a longer task; null on a lone slot. */
  sessionLabel: string | null;
  /** The top of its range (`topMinutes`); null has no top and fills the block. */
  topMin: number | null;
}

export interface SpreadBlock {
  id: string;
  /** `HH:mm`. */
  start: string;
  end: string;
  /** Today's block once its start has passed: it takes no session. */
  begun: boolean;
  slots: readonly SpreadSlot[];
  /** Meetings inside the block, `HH:mm`. */
  busy: readonly { start: string; end: string }[];
}

export interface SpreadDay {
  dateKey: string;
  /** Before today. */
  past: boolean;
  /** The item already sits on this day. */
  holds: boolean;
  /** The day's Work blocks, any order. */
  blocks: readonly SpreadBlock[];
}

export type SpreadPick =
  | "morning"
  | "afternoon"
  /** Pick blocks: a block id per date; a date left out takes its first open block. */
  | { blocks: Readonly<Record<string, string>> };

export type SpreadReason = "gone" | "no-block" | "begun" | "holds";

export interface SpreadRow {
  dateKey: string;
  blockId: string;
  /** "[Alder intro] 3/3". */
  sharesWith: string[];
  getsMin: number;
}

export interface SpreadPreview {
  rows: SpreadRow[];
  totalMin: number;
  /** What stays in the pool. */
  leftMin: number;
  /** Every day in `days` that takes no session whatever is picked, and why. */
  notOffered: { dateKey: string; reason: SpreadReason }[];
}

const byStart = (a: SpreadBlock, b: SpreadBlock) =>
  clockMinutes(a.start) - clockMinutes(b.start);

/** The block's time left after its meetings and its other work, whole minutes. */
export function blockFreeMin(block: SpreadBlock): number {
  const start = clockMinutes(block.start);
  const length = clockMinutes(block.end) - start;
  if (!(length > 0)) return 0;
  if (block.slots.some((slot) => slot.topMin === null)) return 0;

  const spans = block.busy
    .map((span): [number, number] => [
      Math.max(0, clockMinutes(span.start) - start),
      Math.min(length, clockMinutes(span.end) - start),
    ])
    .filter(([from, to]) => to > from)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let busy = 0;
  let reach = 0;
  for (const [from, to] of spans) {
    const lo = Math.max(from, reach);
    if (to > lo) busy += to - lo;
    reach = Math.max(reach, to);
  }

  const held = block.slots.reduce(
    (sum, slot) => sum + Math.max(0, Math.ceil(slot.topMin ?? 0)),
    0,
  );
  return Math.max(0, Math.floor(length - busy - held));
}

/** The block a day's session lands in, or why the day takes none. */
export function spreadBlockOf(
  day: SpreadDay,
  pick: SpreadPick,
): SpreadBlock | SpreadReason {
  if (day.past) return "gone";
  const blocks = [...day.blocks].sort(byStart);
  if (blocks.length === 0) return "no-block";
  if (day.holds) return "holds";

  let candidates: SpreadBlock[];
  if (pick === "morning") candidates = blocks.slice(0, 1);
  else if (pick === "afternoon") candidates = blocks.slice(1);
  else {
    const named = pick.blocks[day.dateKey];
    candidates = named
      ? blocks.filter((block) => block.id === named)
      : blocks.filter((block) => !block.begun).slice(0, 1);
  }
  if (candidates.length === 0) return "no-block";
  const open = candidates.filter((block) => !block.begun);
  if (open.length === 0) return "begun";
  // The most time left; the earlier on a tie.
  return open.reduce((best, block) =>
    blockFreeMin(block) > blockFreeMin(best) ? block : best,
  );
}

export function spreadPreview(input: {
  workLeftMin: number;
  days: readonly SpreadDay[];
  /** The picked dates. */
  picked: readonly string[];
  pick: SpreadPick;
  /** "whole": the block's time left; a number: at most that. */
  eachMin: number | "whole";
}): SpreadPreview {
  const days = [...input.days].sort((a, b) =>
    a.dateKey < b.dateKey ? -1 : a.dateKey > b.dateKey ? 1 : 0,
  );
  const picked = new Set(input.picked);
  const notOffered: SpreadPreview["notOffered"] = [];
  const rows: SpreadRow[] = [];
  let left = Math.max(0, Math.floor(input.workLeftMin));

  for (const day of days) {
    const block = spreadBlockOf(day, input.pick);
    if (typeof block === "string") {
      notOffered.push({ dateKey: day.dateKey, reason: block });
      continue;
    }
    if (!picked.has(day.dateKey) || left === 0) continue;
    const free = blockFreeMin(block);
    const cap =
      input.eachMin === "whole"
        ? free
        : Math.min(free, Math.max(0, Math.floor(input.eachMin)));
    const getsMin = Math.min(cap, left);
    // A full block makes no session.
    if (getsMin <= 0) continue;
    left -= getsMin;
    rows.push({
      dateKey: day.dateKey,
      blockId: block.id,
      sharesWith: block.slots.map((slot) =>
        slot.sessionLabel ? `${slot.title} ${slot.sessionLabel}` : slot.title,
      ),
      getsMin,
    });
  }

  const totalMin = rows.reduce((sum, row) => sum + row.getsMin, 0);
  return { rows, totalMin, leftMin: left, notOffered };
}
