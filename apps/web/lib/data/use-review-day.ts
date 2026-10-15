"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WORK_TIERS } from "@syn/constants";
import type { StoredBlockKind, WorkTier } from "@syn/types";
import { clockFromMinutes, clockMinutes, layoutFromWake } from "@syn/utils";
import type { DayRecordRecord } from "@syn/validators";
import type { Today } from "./derive-today";
import { lateWakeOf, roomDayOf } from "./late-wake";
import { useDataSource } from "./source";
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
  items: ReviewItem[];
  /** Work's tiers that hold something, in tier order. */
  tiers: ReviewTier[];
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
}

type Occurrence = Today["occurrences"]["blocks"][number];

function itemsOf(occurrence: Occurrence, today: Today): ReviewItem[] {
  const { records } = today;
  const { block, slots } = occurrence;
  const set = records.blockItems
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
        items: form === "items" ? itemsOf(occurrence, today) : [],
        tiers: form === "work" ? tiersOf(occurrence, today) : [],
      };
    });
  const wake = records.usualWakeTime;
  const laid = lateLayout(today, blocks);
  const shown = laid?.blocks ?? blocks;
  const starts = shown.map((block) => clockMinutes(block.startsAt));
  const ends = shown.map((block) => clockMinutes(block.endsAt));
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
  };
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

/** Ready, go: `readyAt` once, at the fixture clock's now; the server keeps the first. */
export function useReadyGo() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  return useMutation<DayRecordRecord, Error, string>({
    mutationFn: (dateKey) =>
      source.server.readyGo(dateKey, source.now().toISOString()),
    onSettled: (_record, _error, dateKey) =>
      queryClient.invalidateQueries({
        queryKey: todayQueryKey(source.scenario.name, dateKey),
      }),
  });
}
