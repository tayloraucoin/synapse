"use client";

import {
  boundsEdge,
  dayStrip,
  isOwnChange,
  overlaps,
  readDay,
  type BlockOverlap,
  type StripPart,
} from "@syn/utils";
import type {
  BlockItemRecord,
  BlockRecord,
  DayEventRecord,
  SlotRecord,
} from "@syn/validators";
import { useWeekQuery } from "./use-week";
import type { SetUpDayRecords, WeekRef } from "./week-records";

/**
 * One set-up day (USE-36): its occurrences through `readDay`, then its strip,
 * bounds edges, overlaps and own changes from the set-up pure functions, all
 * in `select`. Nothing here re-derives what those functions say.
 */

export interface SetUpBlock {
  block: BlockRecord;
  /** The times it runs at on the day: the block's, or the date's change. */
  startsAt: string;
  endsAt: string;
  /** D-USE-33's "This day only": the date changed it, its items or its order. */
  ownChange: boolean;
  /** Its items in the day's order: the date's slot order first, then the item's. */
  items: BlockItemRecord[];
  /** Its slots on the date, the skipped left out; none in the usual week. */
  slots: SlotRecord[];
  /** D-USE-32: outside Up at and Lights out, kept in place and dashed. */
  edge: "before_up_at" | "after_lights_out" | null;
}

export interface SetUpDay {
  weekday: number;
  date: string | null;
  bounds: { upAt: string; lightsOut: string } | null;
  /** "Not set yet" when false: no bounds and no blocks. */
  isSet: boolean;
  /** Ordered by start. */
  blocks: SetUpBlock[];
  events: DayEventRecord[];
  strip: StripPart[];
  overlaps: BlockOverlap[];
  /** The date has its own changes (Reset to usual shows); never in the usual week. */
  ownChange: boolean;
  records: SetUpDayRecords;
}

function orderItems(
  items: readonly BlockItemRecord[],
  slots: readonly SlotRecord[],
): BlockItemRecord[] {
  const placeOf = (item: BlockItemRecord) =>
    slots.find((slot) => slot.blockItemId === item.id)?.sortOrder ??
    item.sortOrder;
  return [...items].sort(
    (a, b) =>
      placeOf(a) - placeOf(b) ||
      a.sortOrder - b.sortOrder ||
      a.id.localeCompare(b.id),
  );
}

export function deriveSetUpDay(
  day: SetUpDayRecords,
  timeZone: string,
): SetUpDay {
  const bounds = day.bounds
    ? { upAt: day.bounds.upAt, lightsOut: day.bounds.lightsOut }
    : null;
  const date = day.date;
  const spans =
    date === null
      ? [...day.blocks]
          .sort(
            (a, b) =>
              a.startsAt.localeCompare(b.startsAt) ||
              a.endsAt.localeCompare(b.endsAt),
          )
          .map((block) => ({
            block,
            startsAt: block.startsAt,
            endsAt: block.endsAt,
            slots: [] as SlotRecord[],
          }))
      : readDay({
          dateKey: date,
          timeZone,
          blocks: day.blocks,
          changes: day.changes,
          slots: day.slots,
        }).blocks;

  const blocks = spans.map((span): SetUpBlock => {
    const own = (rows: readonly { blockId: string }[]) =>
      rows.filter((row) => row.blockId === span.block.id);
    const items = own(day.items) as BlockItemRecord[];
    const slots = own(day.slots) as SlotRecord[];
    return {
      block: span.block,
      startsAt: span.startsAt,
      endsAt: span.endsAt,
      ownChange:
        date !== null &&
        isOwnChange({
          dateKey: date,
          changes: own(day.changes) as { onDate: string; blockId: string }[],
          slots,
          items,
        }),
      items: orderItems(items, slots),
      slots: span.slots.filter((slot) => !slot.skipped),
      edge: bounds ? boundsEdge(span, bounds) : null,
    };
  });

  const timed = blocks.map((b) => ({
    id: b.block.id,
    kind: b.block.kind,
    startsAt: b.startsAt,
    endsAt: b.endsAt,
  }));
  return {
    weekday: day.weekday,
    date,
    bounds,
    isSet: bounds !== null || blocks.length > 0,
    blocks,
    events: day.events,
    strip: dayStrip({
      upAt: bounds?.upAt ?? null,
      lightsOut: bounds?.lightsOut ?? null,
      blocks: timed,
    }),
    overlaps: overlaps(timed),
    ownChange:
      date !== null &&
      isOwnChange({
        dateKey: date,
        changes: day.changes,
        slots: day.slots,
        items: day.items,
      }),
    records: day,
  };
}

/** One day of a week: `day` is its weekday, Monday 0. */
export function useSetUpDay({ week, day }: { week: WeekRef; day: number }) {
  const query = useWeekQuery(week, (records) =>
    deriveSetUpDay(records.days[day]!, records.timeZone),
  );
  return { ...query, day: query.data };
}
