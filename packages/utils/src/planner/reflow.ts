import { clockMinutes } from "../day/wall-clock";
import { clockFromMinutes } from "./set-up-times";

/**
 * Round 8's re-flow inside one block (USE-33): items lie from the block's
 * start in their order, a set-time item and an event band stay pinned at
 * their times, and an item that would cross one moves after it whole. An
 * item is never split.
 */

/** D-USE-81: a new item with no length counts 5 minutes. */
const DEFAULT_LENGTH_MIN = 5;

export interface ReflowItem {
  id: string;
  lengthMin: number | null;
  /** A set time pins it; a transition is one. */
  atTime: string | null;
}

interface Span {
  startsAt: string;
  endsAt: string;
}

export interface Reflow {
  placed: { id: string; startsAt: string }[];
  /** Minutes past the block's end: "Runs <n> min past <end>." */
  overMin: number;
  /** Where free time starts inside the block; null when there is none. */
  freeFrom: string | null;
}

function lengthOf(item: ReflowItem): number {
  return item.lengthMin ?? DEFAULT_LENGTH_MIN;
}

export function reflowItems({
  startsAt,
  endsAt,
  items,
  bands,
}: {
  startsAt: string;
  endsAt: string;
  items: readonly ReflowItem[];
  bands: readonly Span[];
}): Reflow {
  const blockEnd = clockMinutes(endsAt);
  const pinned: { start: number; end: number }[] = [
    ...bands.map((band) => ({
      start: clockMinutes(band.startsAt),
      end: clockMinutes(band.endsAt),
    })),
    ...items
      .filter((item) => item.atTime !== null)
      .map((item) => {
        const start = clockMinutes(item.atTime as string);
        return { start, end: start + lengthOf(item) };
      }),
  ].sort((a, b) => a.start - b.start);

  /** The first start at or after `from` where `length` crosses nothing pinned. */
  const fitFrom = (from: number, length: number): number => {
    let start = from;
    for (const span of pinned) {
      if (start < span.end && start + length > span.start) start = span.end;
    }
    return start;
  };

  const placed: Reflow["placed"] = [];
  let cursor = clockMinutes(startsAt);
  let lastEnd = cursor;
  for (const item of items) {
    const length = lengthOf(item);
    const start =
      item.atTime !== null
        ? clockMinutes(item.atTime)
        : fitFrom(cursor, length);
    placed.push({ id: item.id, startsAt: clockFromMinutes(start) });
    cursor = Math.max(cursor, start + length);
    lastEnd = Math.max(lastEnd, start + length);
  }

  // Free time starts after the last item, and after any band covering that point.
  const free = fitFrom(lastEnd, 1);
  return {
    placed,
    overMin: Math.max(0, lastEnd - blockEnd),
    freeFrom: free < blockEnd ? clockFromMinutes(free) : null,
  };
}

export interface EventLanding {
  /** The block the event's start falls in, or none. */
  inside: { id: string; name: string } | null;
  /** Each item the event moves, with its start before and after. */
  moves: { id: string; from: string; to: string }[];
}

/** Add event's landing line: which block an event falls in, and what moves. */
export function eventLanding({
  event,
  blocks,
}: {
  event: Span;
  blocks: readonly (Span & {
    id: string;
    name: string;
    items: readonly ReflowItem[];
  })[];
}): EventLanding {
  const at = clockMinutes(event.startsAt);
  const block = blocks.find(
    (candidate) =>
      clockMinutes(candidate.startsAt) <= at &&
      at < clockMinutes(candidate.endsAt),
  );
  if (block === undefined) return { inside: null, moves: [] };

  const lay = (bands: readonly Span[]) =>
    reflowItems({
      startsAt: block.startsAt,
      endsAt: block.endsAt,
      items: block.items,
      bands,
    }).placed;
  const before = lay([]);
  const after = lay([event]);

  const moves: EventLanding["moves"] = [];
  before.forEach((was, index) => {
    const now = after[index];
    if (now !== undefined && now.startsAt !== was.startsAt) {
      moves.push({ id: was.id, from: was.startsAt, to: now.startsAt });
    }
  });
  return { inside: { id: block.id, name: block.name }, moves };
}
