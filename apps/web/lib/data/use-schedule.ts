"use client";

import type { WorkTier } from "@syn/types";
import {
  clockMinutes,
  instantToWallClockMinutes,
  placeEvents,
  scheduleMark,
  underWay,
  wallClockToInstant,
  type ReflowItem,
  type ScheduleMark,
} from "@syn/utils";
import type { DayEventRecord } from "@syn/validators";
import { useNow as useMinute } from "@/lib/hooks/use-now";
import type { Today } from "./derive-today";
import { useDataSource } from "./source";
import { isAllDay, phaseOf, type NowPhase } from "./use-now";
import {
  deriveReviewDay,
  type ReviewBlock,
  type ReviewItem,
  type ReviewTier,
} from "./use-review-day";
import { useToday } from "./use-today";

/**
 * Schedule's data (USE-27; day/schedule/): the whole day as the day column
 * draws it, from `useToday`'s records. Review the day's blocks and items
 * (`deriveReviewDay`), with what this moment adds: each item's mark from its
 * slot and clock, each block past (faded) or the one under way (the edge),
 * meetings as bands inside their blocks, the all-day checklist as the strip,
 * events on their own, and the now line.
 *
 * THE MINUTE IS APART. `now` holds the line's minute alone; everything else
 * is the same between two minutes unless a block's end passes, so the line
 * moves and nothing else does (C-USE-schedule-during-go-3).
 */

export interface ScheduleItem extends ReviewItem {
  mark: ScheduleMark;
}

export interface ScheduleTier {
  tier: WorkTier;
  items: ScheduleItem[];
}

export interface ScheduleEvent {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  tag: DayEventRecord["tag"];
  /** A palette key or hex; null is plum (D-USE-38). */
  color: string | null;
  /** On its own and holding now: the one edge. */
  underWay: boolean;
}

export interface ScheduleSegment {
  items: ScheduleItem[];
  tiers: ScheduleTier[];
}

export interface ScheduleBlockView extends Omit<
  ReviewBlock,
  "items" | "tiers"
> {
  items: ScheduleItem[];
  tiers: ScheduleTier[];
  state: "done" | "now" | null;
  /** Meetings inside the block, by start. */
  bands: ScheduleEvent[];
  /** With bands: the items before, between and after them. */
  segments: ScheduleSegment[] | undefined;
}

export interface ScheduleAllDay {
  id: string;
  name: string;
  rows: { id: string; label: string; checked: boolean }[];
  underWay: boolean;
}

export interface ScheduleView {
  dateKey: string;
  timeZone: string;
  phase: NowPhase;
  /** The column's hours, minutes from midnight, on whole hours. */
  startMin: number;
  endMin: number;
  blocks: ScheduleBlockView[];
  /** Events inside no block. */
  events: ScheduleEvent[];
  allDay: ScheduleAllDay | null;
  /** Nothing on the day: no block, no checklist, no event. */
  empty: boolean;
}

export interface ScheduleNow {
  atMin: number;
  /** "10:20" */
  label: string;
}

type Occurrence = Today["occurrences"]["blocks"][number];

/** The now line's minute in the day's zone. */
export function scheduleNow(now: Date, timeZone: string): ScheduleNow {
  const atMin = instantToWallClockMinutes(now, timeZone);
  const minute = String(atMin % 60).padStart(2, "0");
  return { atMin, label: `${Math.floor(atMin / 60)}:${minute}` };
}

/** Each slot's mark, by the id the column's items carry (the slot's). */
function marksOf(today: Today): Map<string, ScheduleMark> {
  const marks = new Map<string, ScheduleMark>();
  for (const occurrence of today.occurrences.blocks) {
    for (const slot of occurrence.slots) {
      marks.set(slot.id, scheduleMark(slot, today.clock.slots.get(slot.id)));
    }
  }
  return marks;
}

/** An item's length and pinned time, for the band's re-flow. */
function reflowOf(item: ReviewItem, today: Today, occurrence: Occurrence) {
  const { blockItems } = today.records;
  const slot = occurrence.slots.find((row) => row.id === item.id) ?? null;
  const set = blockItems.find(
    (row) => row.id === (slot?.blockItemId ?? item.id),
  );
  return {
    id: item.id,
    lengthMin: slot?.lengthMin ?? set?.lengthMin ?? null,
    atTime: set?.atTime ?? null,
  } satisfies ReflowItem;
}

const eventView = (event: DayEventRecord): ScheduleEvent => ({
  id: event.id,
  title: event.title,
  startsAt: event.startsAt,
  endsAt: event.endsAt,
  tag: event.tag,
  color: event.color,
  underWay: false,
});

/** Schedule from a day at an instant: pure, so a test reads what the screen reads. */
export function deriveSchedule(today: Today, now: Date): ScheduleView {
  const { records } = today;
  const review = deriveReviewDay(today);
  const phase = phaseOf(records.dayRecord);
  const marks = marksOf(today);
  const mark = (item: ReviewItem): ScheduleItem => ({
    ...item,
    mark: marks.get(item.id) ?? "planned",
  });
  const markTiers = (tiers: ReviewTier[]): ScheduleTier[] =>
    tiers.map(({ tier, items }) => ({ tier, items: items.map(mark) }));

  const occurrenceOf = (id: string) =>
    today.occurrences.blocks.find((entry) => entry.block.id === id)!;
  const allDayEntry =
    today.occurrences.blocks.find((entry) =>
      isAllDay(entry.block, entry.startsAt, entry.endsAt),
    ) ?? null;

  // Meetings: a band of the block they sit inside; the rest on their own.
  const events = records.dayEvents.map(eventView);
  const placed = placeEvents(
    review.blocks.map((block) => {
      const occurrence = occurrenceOf(block.id);
      const order =
        block.form === "work"
          ? block.tiers.flatMap((tier) => tier.items)
          : block.items;
      return {
        id: block.id,
        startsAt: block.startsAt,
        endsAt: block.endsAt,
        items: order.map((item) => reflowOf(item, today, occurrence)),
      };
    }),
    events,
  );

  const edge = underWay({
    blocks: [
      ...review.blocks.map((block) => {
        const occurrence = occurrenceOf(block.id);
        return { id: block.id, start: occurrence.start, end: occurrence.end };
      }),
      ...placed.free.map((event) => ({
        id: event.id,
        start: wallClockToInstant(
          records.date,
          event.startsAt,
          records.timeZone,
        ),
        end: wallClockToInstant(records.date, event.endsAt, records.timeZone),
      })),
    ],
    allDay: allDayEntry ? { id: allDayEntry.block.id } : null,
    now,
    phase,
  });
  const edged = (id: string) => edge?.kind === "block" && edge.id === id;

  const blocks = review.blocks.map((block): ScheduleBlockView => {
    const occurrence = occurrenceOf(block.id);
    const items = block.items.map(mark);
    const tiers = markTiers(block.tiers);
    const inside = placed.inBlocks.get(block.id);
    const segments = inside?.segments.map((ids): ScheduleSegment => {
      const keep = new Set(ids);
      return {
        items: items.filter((item) => keep.has(item.id)),
        tiers: tiers
          .map(({ tier, items: rows }) => ({
            tier,
            items: rows.filter((item) => keep.has(item.id)),
          }))
          .filter((tier) => tier.items.length > 0),
      };
    });
    return {
      ...block,
      items,
      tiers,
      state: edged(block.id)
        ? "now"
        : occurrence.end.getTime() <= now.getTime()
          ? "done"
          : null,
      bands: inside?.bands ?? [],
      segments,
    };
  });

  const free = placed.free.map((event) => ({
    ...event,
    underWay: edged(event.id),
  }));

  const allDay: ScheduleAllDay | null = allDayEntry
    ? {
        id: allDayEntry.block.id,
        name: allDayEntry.block.name,
        rows: checklistRows(allDayEntry, today),
        underWay: edge?.kind === "all-day",
      }
    : null;

  // The column runs from the earlier of Up at and the first start to the
  // later of the last end and an hour past now, on whole hours.
  const nowMin = instantToWallClockMinutes(now, records.timeZone);
  const starts = [...blocks, ...free].map((row) => clockMinutes(row.startsAt));
  const ends = [...blocks, ...free].map((row) => clockMinutes(row.endsAt));
  const first = Math.min(
    clockMinutes(records.usualWakeTime),
    nowMin,
    ...starts,
  );
  const last = Math.max(first + 60, nowMin + 60, ...ends);
  return {
    dateKey: records.date,
    timeZone: records.timeZone,
    phase,
    startMin: Math.floor(first / 60) * 60,
    endMin: Math.min(24 * 60, Math.ceil(last / 60) * 60),
    blocks,
    events: free,
    allDay,
    empty: blocks.length === 0 && free.length === 0 && allDay === null,
  };
}

/** The all-day checklist's rows in order, checked from the date's slots. */
function checklistRows(occurrence: Occurrence, today: Today) {
  const { records } = today;
  return records.blockItems
    .filter(
      (item) =>
        item.blockId === occurrence.block.id &&
        (item.onDate === null || item.onDate === records.date),
    )
    .flatMap((item) => {
      const slot = occurrence.slots.find((row) => row.blockItemId === item.id);
      if (slot?.skipped) return [];
      return [
        {
          id: item.id,
          label: item.title,
          checked: slot?.doneAt != null,
          order: slot?.sortOrder ?? item.sortOrder,
        },
      ];
    })
    .sort((a, b) => a.order - b.order)
    .map(({ id, label, checked }) => ({ id, label, checked }));
}

export function useSchedule(dateKey: string) {
  const source = useDataSource();
  // A render each minute, so the line moves and a block's end fades it.
  useMinute();
  const query = useToday(dateKey);
  const now = source.now();
  const view =
    query.today === undefined ? undefined : deriveSchedule(query.today, now);
  return {
    ...query,
    view,
    now: view === undefined ? null : scheduleNow(now, view.timeZone),
  };
}
