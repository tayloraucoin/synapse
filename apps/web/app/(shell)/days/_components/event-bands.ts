import { clockMinutes } from "@syn/utils";
import type { DayEventRecord } from "@syn/validators";
import {
  ADD_EVENT_COPY,
  layBlock,
  toEventDay,
} from "@/components/planner/add-event";
import { clockLabel, spanLabel } from "@/components/planner/day-column/copy";
import type {
  DayColumnEvent,
  DayColumnItem,
  DayColumnSegment,
} from "@/components/planner/day-column/day-column";
import type { SetUpColumnBlock } from "@/lib/data/set-up-view";
import type { SetUpDay } from "@/lib/data/use-set-up-day";

/**
 * A dated day's events in its column (USE-53; event-inside-work.md,
 * event-own-block.md). The time decides: an event starting inside a block
 * is a plum band in it, pinned at its time, and the block's items lie
 * around it, an item that would cross it moved to its end whole and named
 * there with its new start ("[Review the Paper handoff] · 11:30"); when
 * they no longer fit, Stretch, then Secondary, drop out of the grid. An
 * event in no block stands as its own small block at its true height.
 * Every one opens to edit on a tap (D-USE-42).
 */

const TAG = { work: "Work", personal: "Personal" } as const;

function startsIn(event: DayEventRecord, block: SetUpColumnBlock): boolean {
  const at = clockMinutes(event.startsAt);
  return clockMinutes(block.startsAt) <= at && at < clockMinutes(block.endsAt);
}

function bandOf(
  event: DayEventRecord,
  open: (event: DayEventRecord) => void,
): DayColumnEvent {
  return {
    id: event.id,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    // D-USE-31: events are plum, told by the calendar icon and their words.
    hue: "plum",
    meta: spanLabel(event.startsAt, event.endsAt),
    event: {
      tag: TAG[event.tag],
      name: ADD_EVENT_COPY.eventName(event.title, event.startsAt, event.endsAt),
      onOpen: () => open(event),
    },
  };
}

/** The column's blocks with their bands and the items laid around them. */
export function withEventBands(
  blocks: readonly SetUpColumnBlock[],
  day: SetUpDay,
  open: (event: DayEventRecord) => void,
): SetUpColumnBlock[] {
  const eventDay = toEventDay(day);
  if (eventDay === null) return [...blocks];
  return blocks.map((block) => {
    const events = day.events
      .filter((event) => startsIn(event, block))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const weighed = eventDay.blocks.find((b) => b.id === block.id);
    if (events.length === 0 || weighed === undefined) {
      return block;
    }
    const lay = layBlock(weighed, events);
    // Each item goes to the segment its start falls in: before the first
    // band, between two, or after the last.
    const segmentOf = (id: string): number | null => {
      const at = lay.placed.get(id);
      if (at === undefined) return null;
      const start = clockMinutes(at);
      return events.filter((event) => clockMinutes(event.startsAt) <= start)
        .length;
    };
    const timed = (item: DayColumnItem, index: number): DayColumnItem => {
      const at = lay.placed.get(item.id);
      return index === 0 || at === undefined
        ? item
        : { ...item, label: `${item.label} · ${clockLabel(at)}` };
    };
    const segments: DayColumnSegment[] = Array.from(
      { length: events.length + 1 },
      (_, index) => ({
        items: block.items
          .filter((item) => segmentOf(item.id) === index)
          .map((item) => timed(item, index)),
        tiers: block.tiers.flatMap((tier) => {
          const items = tier.items
            .filter((item) => segmentOf(item.id) === index)
            .map((item) => timed(item, index));
          return items.length > 0 ? [{ tier: tier.tier, items }] : [];
        }),
      }),
    );
    return {
      ...block,
      bands: events.map((event) => bandOf(event, open)),
      segments,
    };
  });
}

/** The day's events in no block, each its own small block. */
export function ownEventCards(
  blocks: readonly SetUpColumnBlock[],
  day: SetUpDay,
  open: (event: DayEventRecord) => void,
): DayColumnEvent[] {
  return day.events
    .filter((event) => !blocks.some((block) => startsIn(event, block)))
    .map((event) => ({
      ...bandOf(event, open),
      meta: ADD_EVENT_COPY.ownMeta(
        event.startsAt,
        event.endsAt,
        event.tag,
        event.rrule === null ? day.weekday : null,
      ),
    }));
}

/** A block an event sits in draws its own tiers, not This week's parts. */
export function hasBands(block: { bands?: readonly unknown[] }): boolean {
  return (block.bands?.length ?? 0) > 0;
}
