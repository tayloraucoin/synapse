"use client";

import {
  useMutation,
  useQueryClient,
  type MutationOptions,
  type QueryClient,
} from "@tanstack/react-query";
import { WORK_TIERS } from "@syn/constants";
import type { StoredBlockKind, WorkTier } from "@syn/types";
import { clockFromMinutes, clockMinutes, layoutFromWake } from "@syn/utils";
import type { DayEventRecord, DayRecordRecord } from "@syn/validators";
import type { Today } from "./derive-today";
import { lateWakeOf, roomDayOf } from "./late-wake";
import { useDataSource, type DataSource } from "./source";
import { itemsOnDate, type TodayRecords } from "./today-records";
import { whenConnected } from "./use-connection";
import { isAllDay } from "./use-now";
import { todayQueryKey, useToday } from "./use-today";

/**
 * Review the day's data (USE-31; day/review-the-day/): the date's blocks as
 * the day column draws them, derived from `useToday`'s records. A block's
 * items are its set items in the date's order (a transition kept, as a dash),
 * then what was pulled in; Work's are its slots by tier. Orient's locked
 * line sits at the day's Up at.
 *
 * Ready, go writes `readyAt` once; the server keeps the first (D-USE-71).
 *
 * A LATE WAKE (USE-38; late.md) lays the day out from the wake, on read and
 * never stored: Orient's line at the wake, a block under way starting after
 * it and keeping its end, and every block that ended by then folded out of
 * the column into `passed`. Nothing marks a passed block; it is words.
 */

/** Orient's length on the column [ASSUMPTION: set-up-times' five minutes]. */
export const ORIENT_LENGTH_MIN = 5;

export interface ReviewItem {
  /** The slot's id, or the set item's until it is first touched. */
  id: string;
  label: string;
  tone: "dot" | "transition";
}

export interface ReviewTier {
  tier: WorkTier;
  items: ReviewItem[];
}

export type ReviewBlockForm = "items" | "meal" | "work";

export interface ReviewBlock {
  id: string;
  kind: StoredBlockKind;
  name: string;
  /** "HH:MM", the date's times. */
  startsAt: string;
  endsAt: string;
  form: ReviewBlockForm;
  /** A checklist with a span: its box is as tall as its rows. */
  checklist: boolean;
  items: ReviewItem[];
  /** Work's tiers that hold something, in tier order. */
  tiers: ReviewTier[];
}

/** The date's checklist with no span: the All day strip (D-USE-28). */
export interface ReviewAllDay {
  id: string;
  name: string;
  rows: { id: string; label: string; checked: boolean }[];
}

/** An event inside no block, on the rail at its hour (USE-40). */
export interface ReviewEvent {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  tag: DayEventRecord["tag"];
  /** A palette key or hex; null is plum (D-USE-38). */
  color: string | null;
}

/** A block that ended by Orient's end on a late wake, at its planned times. */
export interface ReviewPassedBlock {
  id: string;
  kind: StoredBlockKind;
  name: string;
  /** "HH:MM", as planned for the date. */
  startsAt: string;
  endsAt: string;
}

export interface ReviewDayView {
  dateKey: string;
  timeZone: string;
  /** The column's hours, minutes from midnight, on whole hours. */
  startMin: number;
  endMin: number;
  /** Orient's locked line at Up at, or at a late wake; null with no wake time. */
  orient: { atMin: number; lengthMin: number } | null;
  blocks: ReviewBlock[];
  /**
   * A late wake: the wake as "HH:MM" and the blocks it passed, in order;
   * null on a day that starts as planned.
   */
  late: { wokeAt: string; passed: ReviewPassedBlock[] } | null;
  /** Ready, go already given today. */
  readied: boolean;
  /** USE-40: the checklist with no span, above the rail. */
  allDay: ReviewAllDay | null;
  /** USE-40: events inside no block. */
  events: ReviewEvent[];
  /** Nothing set (D-USE-68): no block, no checklist, no event. */
  empty: boolean;
}

type Occurrence = Today["occurrences"]["blocks"][number];

function itemsOf(occurrence: Occurrence, today: Today): ReviewItem[] {
  const { records } = today;
  const { block, slots } = occurrence;
  const set = itemsOnDate(records)
    .filter(
      (item) =>
        item.blockId === block.id &&
        (item.onDate === null || item.onDate === records.date),
    )
    .flatMap((item) => {
      const slot = slots.find((row) => row.blockItemId === item.id) ?? null;
      // Not today (D-USE-70): the date's slot is skipped.
      if (slot?.skipped) return [];
      return [
        {
          id: slot?.id ?? item.id,
          label: item.title,
          tone: item.isTransition ? ("transition" as const) : ("dot" as const),
          order: slot?.sortOrder ?? item.sortOrder,
        },
      ];
    });
  const pooled = slots
    .filter(
      (slot) =>
        slot.blockItemId === null && !slot.skipped && slot.workItemId === null,
    )
    .flatMap((slot) => {
      const todo = records.todos.find((row) => row.id === slot.todoId);
      return todo
        ? [
            {
              id: slot.id,
              label: todo.title,
              tone: "dot" as const,
              order: slot.sortOrder,
            },
          ]
        : [];
    });
  return [...set, ...pooled]
    .sort((a, b) => a.order - b.order)
    .map(({ id, label, tone }) => ({ id, label, tone }));
}

function tiersOf(occurrence: Occurrence, today: Today): ReviewTier[] {
  const { workItems } = today.records;
  return WORK_TIERS.flatMap((tier) => {
    const items = occurrence.slots
      .filter((slot) => slot.tier === tier && !slot.skipped && slot.workItemId)
      .flatMap((slot) => {
        const work = workItems.find((row) => row.id === slot.workItemId);
        if (!work) return [];
        const label = work.linearIdentifier
          ? `${work.title} · ${work.linearIdentifier}`
          : work.title;
        return [{ id: slot.id, label, tone: "dot" as const }];
      });
    return items.length > 0 ? [{ tier, items }] : [];
  });
}

/** Review the day from a day: pure, so a test reads what the screen reads. */
export function deriveReviewDay(today: Today): ReviewDayView {
  const { records } = today;
  const blocks = today.occurrences.blocks
    // The all-day checklist is the loose day's strip, not a block in time.
    .filter(
      (occurrence) =>
        !isAllDay(occurrence.block, occurrence.startsAt, occurrence.endsAt),
    )
    .map((occurrence): ReviewBlock => {
      const { block } = occurrence;
      const form: ReviewBlockForm = block.meal
        ? "meal"
        : block.kind === "work"
          ? "work"
          : "items";
      return {
        id: block.id,
        kind: block.kind,
        name: block.name,
        startsAt: occurrence.startsAt,
        endsAt: occurrence.endsAt,
        form,
        checklist: block.checklist,
        items: form === "items" ? itemsOf(occurrence, today) : [],
        tiers: form === "work" ? tiersOf(occurrence, today) : [],
      };
    });
  const wake = records.usualWakeTime;
  const laid = lateLayout(today, blocks);
  const shown = laid?.blocks ?? blocks;
  const events = freeEvents(records.dayEvents, shown);
  const allDay = allDayOf(today);
  const timed = [...shown, ...events];
  const starts = timed.map((row) => clockMinutes(row.startsAt));
  const ends = timed.map((row) => clockMinutes(row.endsAt));
  const orientAt = laid?.wokeAt ?? (wake ? clockMinutes(wake) : null);
  const first = Math.min(
    ...(orientAt !== null ? [orientAt] : []),
    ...starts,
    ...(starts.length === 0 && orientAt === null ? [7 * 60] : []),
  );
  const last = Math.max(first + 60, ...ends);
  return {
    dateKey: records.date,
    timeZone: records.timeZone,
    startMin: Math.floor(first / 60) * 60,
    endMin: Math.min(24 * 60, Math.ceil(last / 60) * 60),
    orient:
      orientAt !== null
        ? { atMin: orientAt, lengthMin: ORIENT_LENGTH_MIN }
        : null,
    blocks: shown,
    late: laid
      ? { wokeAt: clockFromMinutes(laid.wokeAt), passed: laid.passed }
      : null,
    readied: records.dayRecord?.readyAt != null,
    allDay,
    events,
    empty: shown.length === 0 && events.length === 0 && allDay === null,
  };
}

/** Events no block holds wholly; a meeting inside a block is the block's. */
function freeEvents(
  dayEvents: readonly DayEventRecord[],
  blocks: readonly ReviewBlock[],
): ReviewEvent[] {
  return dayEvents
    .filter(
      (event) =>
        !blocks.some(
          (block) =>
            clockMinutes(block.startsAt) <= clockMinutes(event.startsAt) &&
            clockMinutes(event.endsAt) <= clockMinutes(block.endsAt),
        ),
    )
    .sort((a, b) => clockMinutes(a.startsAt) - clockMinutes(b.startsAt))
    .map(({ id, title, startsAt, endsAt, tag, color }) => ({
      id,
      title,
      startsAt,
      endsAt,
      tag,
      color,
    }));
}

function allDayOf(today: Today): ReviewAllDay | null {
  const entry = today.occurrences.blocks.find((occurrence) =>
    isAllDay(occurrence.block, occurrence.startsAt, occurrence.endsAt),
  );
  return entry
    ? {
        id: entry.block.id,
        name: entry.block.name,
        rows: checklistRows(entry, today),
      }
    : null;
}

/** The all-day checklist's rows in order, checked from the date's slots. */
export function checklistRows(occurrence: Occurrence, today: Today) {
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

/**
 * The day laid out from a late wake (`layoutFromWake`, USE-35): the passed
 * blocks out of the column, the one under way moved to start after Orient.
 * Null when Orient opened by Up at.
 */
function lateLayout(
  today: Today,
  blocks: ReviewBlock[],
): {
  wokeAt: number;
  blocks: ReviewBlock[];
  passed: ReviewPassedBlock[];
} | null {
  const wake = lateWakeOf(today);
  if (wake === null) return null;
  const plan = layoutFromWake(roomDayOf(today), wake);
  const folded = new Set(plan.summary.folded);
  const moved = new Map(
    plan.summary.moves.map((move) => [move.blockId, move.to]),
  );
  return {
    wokeAt: wake.wokeAt,
    blocks: blocks
      .filter((block) => !folded.has(block.id))
      .map((block) => {
        const to = moved.get(block.id);
        return to === undefined ? block : { ...block, startsAt: to };
      }),
    passed: plan.summary.folded.flatMap((id) => {
      const block = blocks.find((entry) => entry.id === id);
      return block
        ? [
            {
              id: block.id,
              kind: block.kind,
              name: block.name,
              startsAt: block.startsAt,
              endsAt: block.endsAt,
            },
          ]
        : [];
    }),
  };
}

export function useReviewDay(dateKey: string) {
  const query = useToday(dateKey);
  return {
    ...query,
    view: query.today === undefined ? undefined : deriveReviewDay(query.today),
  };
}

/**
 * Ready, go's write (USE-31, USE-34): `readyAt` once, at the fixture clock's
 * now; the server keeps the first. The day reads it at once (optimistic), so
 * the entry tree goes on to the welcome even offline; with no connection the
 * write is held on the phone until the connection is back, then applied
 * (D-USE-56, D-USE-64). Pure options, so a test drives what the screen does.
 *
 * [ASSUMPTION] Held by `whenConnected`, not TanStack's `onlineManager`:
 * flipping the manager pauses every offline scenario's writes app-wide. The
 * offline-persistence ticket moves this to paused mutations.
 */
export function readyGoOptions(
  source: Pick<DataSource, "scenario" | "server" | "now">,
  queryClient: QueryClient,
): MutationOptions<
  DayRecordRecord,
  Error,
  string,
  { previous: TodayRecords | undefined }
> {
  const keyOf = (dateKey: string) =>
    todayQueryKey(source.scenario.name, dateKey);
  return {
    // Fixed at the press, so a write held offline keeps its moment.
    mutationFn: async (dateKey) => {
      const at = source.now().toISOString();
      await whenConnected(source);
      return source.server.readyGo(dateKey, at);
    },
    onMutate: async (dateKey) => {
      const queryKey = keyOf(dateKey);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TodayRecords>(queryKey);
      if (previous !== undefined) {
        queryClient.setQueryData<TodayRecords>(queryKey, {
          ...previous,
          dayRecord: readiedRecord(
            previous.dayRecord,
            dateKey,
            source.now().toISOString(),
          ),
        });
      }
      return { previous };
    },
    // Refused online: the day as it was, and the button back.
    onError: (_error, dateKey, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(keyOf(dateKey), context.previous);
      }
    },
    onSettled: (_record, _error, dateKey) =>
      queryClient.invalidateQueries({ queryKey: keyOf(dateKey) }),
  };
}

/** The day's record with Ready, go given, as the server will keep it. */
function readiedRecord(
  record: DayRecordRecord | null,
  dateKey: string,
  at: string,
): DayRecordRecord {
  if (record !== null) {
    return record.readyAt === null ? { ...record, readyAt: at } : record;
  }
  return {
    id: crypto.randomUUID(),
    createdAt: at,
    updatedAt: at,
    onDate: dateKey,
    orientedAt: at,
    readyAt: at,
    closedAt: null,
  };
}

export function useReadyGo() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  return useMutation(readyGoOptions(source, queryClient));
}
