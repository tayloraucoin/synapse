import { busySpans, endAfter, offsetMin } from "./fit";
import { tierRank, type WorkTier } from "./next";

/**
 * The plan inside one Work block (USE-62; the meeting-inside-a-work-block dev
 * note, C-USE-today-8, C-USE-today-meeting-coming-up-3).
 *
 * The block stays one block. From now, its undone rows are laid in the order
 * given (the tiers' order), the one running first, each at the top of its
 * range (`topMinutes`) in whole minutes. A meeting is a pinned span: the
 * plan's times flow around it, so every row after it moves by its length. A
 * meeting's band goes where the plan reaches its start: after the last row
 * that starts before it, so a 10:30 meeting follows the row that runs 10:20
 * to 10:50. An item is never split; a row that crosses a meeting is named
 * with it and its straight end (10:20 + 30 min = 10:50), and the plan counts
 * the rest of it after the meeting.
 *
 * When the rows no longer fit by the block's end, Stretch slides first, then
 * Secondary, the last row first [ASSUMPTION, the dev note]; Urgent, Primary
 * and the running row never slide. A slid row stays in its tier.
 *
 * Total: any input gives an answer; nothing here pauses, fires or writes.
 * The caller leaves out firing rows: an agent's time is not the plan's.
 */

const MIN = 60_000;

/** Tiers that slide when the block overflows, the first to give first. */
const SLIDES: readonly WorkTier[] = ["stretch", "secondary"];

export interface FlowRow {
  slotId: string;
  tier: WorkTier;
  /** The top of its range, whole minutes (`topMinutes`); null counts 0. */
  topMin: number | null;
  doneAt: Date | null;
  running: boolean;
}

export interface FlowEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
}

export interface FlowedRow {
  slotId: string;
  start: Date;
  /** The straight end: start plus its length, never pushed past a meeting. */
  end: Date;
  /** The first meeting the row would run past. */
  pastEvent?: { id: string; title: string };
}

export interface FlowBand {
  eventId: string;
  /** The row the band follows; null ahead of every row (or at its time). */
  afterSlotId: string | null;
}

export interface WorkBlockFlow {
  rows: FlowedRow[];
  bands: FlowBand[];
  /** Rows slid out of this block, last given first. */
  slid: string[];
}

const whole = (value: number | null): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.ceil(value)
    : 0;

interface Laid {
  rows: { slotId: string; startMin: number; lengthMin: number }[];
  endMin: number;
}

/** Free minutes in [0, at], walking around the meetings. */
function freeBefore(at: number, spans: readonly [number, number][]): number {
  let busy = 0;
  for (const [from, to] of spans) {
    if (from >= at) break;
    busy += Math.min(to, at) - from;
  }
  return at - busy;
}

/** Out of a meeting: a row never starts inside one. */
function jumpOut(at: number, spans: readonly [number, number][]): number {
  for (const [from, to] of spans) if (at >= from && at < to) return to;
  return at;
}

function lay(
  rows: readonly FlowRow[],
  cursor: number,
  spans: readonly [number, number][],
): Laid {
  let free = freeBefore(cursor, spans);
  const laid: Laid["rows"] = [];
  for (const row of rows) {
    const lengthMin = whole(row.topMin);
    laid.push({
      slotId: row.slotId,
      startMin: jumpOut(endAfter(free, spans), spans),
      lengthMin,
    });
    free += lengthMin;
  }
  return { rows: laid, endMin: Math.max(cursor, endAfter(free, spans)) };
}

export function flowWorkBlock(input: {
  block: { start: Date; end: Date };
  rows: readonly FlowRow[];
  events: readonly FlowEvent[];
  now: Date;
}): WorkBlockFlow {
  const start = input.block.start.getTime();
  const end = input.block.end.getTime();
  const origin = Number.isFinite(start) ? start : 0;
  const lengthMin =
    Number.isFinite(start) && Number.isFinite(end) && end > start
      ? Math.floor((end - start) / MIN)
      : 0;
  const cursor = Math.max(0, Math.floor(offsetMin(input.now, origin)));
  const at = (minutes: number) => new Date(origin + minutes * MIN);

  // The meetings still ahead or under way, by start.
  const events = input.events
    .map((event) => ({
      event,
      from: Math.floor(offsetMin(event.start, origin)),
      to: Math.ceil(offsetMin(event.end, origin)),
    }))
    .filter(({ from, to }) => to > from && to > cursor && from < lengthMin)
    .sort((a, b) => a.from - b.from || a.event.id.localeCompare(b.event.id));
  const spans = busySpans(
    events.map(({ event }) => event),
    origin,
    lengthMin,
  );

  // The running row first, then the tiers' order; done rows hold no time.
  const undone = input.rows.filter((row) => row.doneAt === null);
  const ordered = [
    ...undone.filter((row) => row.running),
    ...undone.filter((row) => !row.running),
  ];

  // Stretch slides first, then Secondary, the last row first.
  const slid: string[] = [];
  const candidates = SLIDES.flatMap((tier) =>
    ordered
      .filter((row) => !row.running && tierRank(row.tier) === tierRank(tier))
      .reverse(),
  );
  let laid = lay(ordered, cursor, spans);
  for (const row of candidates) {
    if (laid.endMin <= lengthMin) break;
    slid.push(row.slotId);
    laid = lay(
      ordered.filter((kept) => !slid.includes(kept.slotId)),
      cursor,
      spans,
    );
  }

  const rows = laid.rows.map((row): FlowedRow => {
    const straightEnd = row.startMin + row.lengthMin;
    const past = events.find(
      ({ from }) => from > row.startMin && from < straightEnd,
    );
    return {
      slotId: row.slotId,
      start: at(row.startMin),
      end: at(straightEnd),
      ...(past
        ? { pastEvent: { id: past.event.id, title: past.event.title } }
        : {}),
    };
  });

  const bands = events.map(({ event, from }): FlowBand => {
    if (from <= cursor) return { eventId: event.id, afterSlotId: null };
    const before = laid.rows.filter((row) => row.startMin < from).at(-1);
    return { eventId: event.id, afterSlotId: before?.slotId ?? null };
  });

  return { rows, bands, slid };
}
