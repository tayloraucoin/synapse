import { clockMinutes } from "../day/wall-clock";
import type { SlotClock } from "./clock";
import { reflowItems, type ReflowItem } from "./reflow";

/**
 * Schedule's marks (USE-27; day/schedule/): what each bullet says, which one
 * thing takes the verdigris edge, and where a day event sits.
 *
 * Verdigris marks this moment only (D-P02): the block under way, or on a
 * checklist day the strip until a set-time block is under way; never two.
 * Firing is its own mark, never verdigris (D-USE-49).
 */

export type ScheduleMark = "done" | "running" | "firing" | "planned";

/**
 * A slot's mark from its row and its clock. Paused reads planned
 * [ASSUMPTION: only a counting clock is "this moment"]; an untouched set
 * item has no slot and is planned.
 */
export function scheduleMark(
  slot: { doneAt: string | null } | null,
  slotClock: Pick<SlotClock, "state"> | null | undefined,
): ScheduleMark {
  if (slot?.doneAt != null || slotClock?.state === "done") return "done";
  if (slotClock?.state === "running") return "running";
  if (slotClock?.state === "firing") return "firing";
  return "planned";
}

export interface UnderWaySpan {
  id: string;
  start: Date;
  end: Date;
}

export type UnderWay =
  { kind: "block"; id: string } | { kind: "all-day"; id: string } | null;

/**
 * The one thing under way: a set-time block (or a standalone event) holding
 * `now`, else the all-day checklist, else nothing. Before Ready, go nothing
 * is (D-USE-77). Overlapping spans give the latest start, then the earliest
 * end, so exactly one wins.
 */
export function underWay({
  blocks,
  allDay,
  now,
  phase,
}: {
  blocks: readonly UnderWaySpan[];
  allDay: { id: string } | null;
  now: Date;
  phase: "before-go" | "live";
}): UnderWay {
  if (phase === "before-go") return null;
  const at = now.getTime();
  const holding = blocks
    .filter((block) => block.start.getTime() <= at && at < block.end.getTime())
    .sort(
      (a, b) =>
        b.start.getTime() - a.start.getTime() ||
        a.end.getTime() - b.end.getTime(),
    );
  const first = holding[0];
  if (first) return { kind: "block", id: first.id };
  return allDay ? { kind: "all-day", id: allDay.id } : null;
}

export interface PlaceEventsBlock {
  id: string;
  /** "HH:MM" */
  startsAt: string;
  endsAt: string;
  /** In the block's order; a pinned time stays (reflow's rules). */
  items: readonly ReflowItem[];
}

export interface PlaceEventsEvent {
  id: string;
  startsAt: string;
  endsAt: string;
}

export interface BlockBands<E> {
  /** The events inside the block, by start. */
  bands: E[];
  /** Item ids before the first band, between bands, after the last: bands + 1 lists. */
  segments: string[][];
}

export interface PlacedEvents<E> {
  /** By block id: only blocks with a band. */
  inBlocks: Map<string, BlockBands<E>>;
  /** Events inside no block, drawn on their own. */
  free: E[];
}

/**
 * Day events against the blocks (the meeting dev note): an event wholly
 * inside a block is a band of that block, which keeps one header; its items
 * flow around the band by their planned times and are never split, so each
 * lands before or after it whole. An event crossing a block's edge stands on
 * its own [ASSUMPTION].
 */
export function placeEvents<E extends PlaceEventsEvent>(
  blocks: readonly PlaceEventsBlock[],
  events: readonly E[],
): PlacedEvents<E> {
  const inBlocks = new Map<string, BlockBands<E>>();
  const free: E[] = [];
  const sorted = [...events].sort(
    (a, b) => clockMinutes(a.startsAt) - clockMinutes(b.startsAt),
  );
  const host = (event: E) =>
    blocks.find(
      (block) =>
        clockMinutes(block.startsAt) <= clockMinutes(event.startsAt) &&
        clockMinutes(event.endsAt) <= clockMinutes(block.endsAt),
    );
  const bandsBy = new Map<string, E[]>();
  for (const event of sorted) {
    const block = host(event);
    if (!block) free.push(event);
    else bandsBy.set(block.id, [...(bandsBy.get(block.id) ?? []), event]);
  }
  for (const [blockId, bands] of bandsBy) {
    const block = blocks.find((row) => row.id === blockId)!;
    const { placed } = reflowItems({
      startsAt: block.startsAt,
      endsAt: block.endsAt,
      items: block.items,
      bands,
    });
    const starts = new Map(
      placed.map((place) => [place.id, clockMinutes(place.startsAt)]),
    );
    const segments: string[][] = bands.map(() => []).concat([[]]);
    for (const item of block.items) {
      const start = starts.get(item.id) ?? clockMinutes(block.startsAt);
      const index = bands.filter(
        (band) => clockMinutes(band.startsAt) <= start,
      ).length;
      segments[index]!.push(item.id);
    }
    inBlocks.set(blockId, { bands, segments });
  }
  return { inBlocks, free };
}
