"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IconValue, StoredBlockKind } from "@syn/types";
import {
  activeBlock,
  behindSince,
  currentItem,
  nextBlock,
  nextItem,
  reflowItems,
} from "@syn/utils";
import type { BlockRecord, DayRecordRecord, SlotRecord } from "@syn/validators";
import { useNow as useMinute } from "@/lib/hooks/use-now";
import { deriveToday, type Today } from "./derive-today";
import { useDataSource } from "./source";
import type { TodayRecords } from "./today-records";
import { todayQueryKey } from "./use-today";

/**
 * Now's data (USE-16): the active block, its items in order with their
 * planned starts, the current item and what lifts after it, all derived in
 * the query's `select` from `useToday`'s records. The screen reads this and
 * never derives a block or an item itself.
 */

/** One item of the active block, as Now shows it. */
export interface NowItemView {
  /** The set item's id, or the slot's for a to-do or work item. */
  id: string;
  /** Null until a set item is first touched (its slot is placed then). */
  slotId: string | null;
  blockItemId: string | null;
  title: string;
  icon: IconValue | null;
  /** The planned length: the slot's, else the set item's. */
  lengthMin: number | null;
  /** The planned start, "HH:MM"; times do not re-flow on a tap (note 60). */
  plannedAt: string | null;
  sortOrder: number;
  done: boolean;
  doneAt: string | null;
  tookMin: number | null;
}

/**
 * How the active block shows (USE-17): a block's items with the current one
 * lifted; a meal, one card with Done and no Start; a Checklist block, every
 * item a row with no card; the all-day checklist, the same under "All day".
 */
export type NowBlockForm = "items" | "meal" | "checklist" | "all-day-checklist";

/** Before Ready, go the tab is the day's List; after it, Now (D-USE-5). */
export type NowPhase = "before-go" | "live";

export interface NowBlockView {
  id: string;
  kind: StoredBlockKind;
  name: string;
  /** "HH:MM", the date's times (a change's, when it has one). */
  startsAt: string;
  endsAt: string;
  form: NowBlockForm;
  /** "HH:MM", the planned end, once it has passed; null before (behind). */
  behindSince: string | null;
  /** The next set-time block after now: the checklist day's "next: …". */
  next: { name: string; startsAt: string } | null;
}

/** One block in the List before Ready, go: bar, name and span. */
export interface NowDayBlockView {
  id: string;
  kind: StoredBlockKind;
  name: string;
  startsAt: string;
  endsAt: string;
  /** A meal: muted, no bar. */
  meal: boolean;
}

export interface NowView {
  dateKey: string;
  phase: NowPhase;
  /** The date's blocks in start order: the List before Ready, go. */
  dayBlocks: NowDayBlockView[];
  block: NowBlockView | null;
  items: NowItemView[];
  current: NowItemView | null;
  /** What lifts once the current item is done: "<next> is next." */
  next: NowItemView | null;
  /** The closed tray's first to-do; null when there is none. */
  trayFirst: string | null;
}

function itemsOf(
  occurrence: Today["occurrences"]["blocks"][number],
  records: TodayRecords,
): NowItemView[] {
  const { block, slots } = occurrence;
  const setItems = records.blockItems
    // A transition is a band in the flow, not an item; a dated item is its date's.
    .filter(
      (item) =>
        item.blockId === block.id &&
        !item.isTransition &&
        (item.onDate === null || item.onDate === records.date),
    )
    .map((item): NowItemView => {
      const slot = slots.find((row) => row.blockItemId === item.id) ?? null;
      return {
        id: item.id,
        slotId: slot?.id ?? null,
        blockItemId: item.id,
        title: item.title,
        icon: item.icon,
        lengthMin: slot?.lengthMin ?? item.lengthMin,
        plannedAt: null,
        sortOrder: slot?.sortOrder ?? item.sortOrder,
        done: slot?.doneAt != null,
        doneAt: slot?.doneAt ?? null,
        tookMin: slot?.tookMin ?? null,
      };
    });
  const pooled = slots
    .filter((slot) => slot.blockItemId === null)
    .flatMap((slot): NowItemView[] => {
      const source =
        records.todos.find((todo) => todo.id === slot.todoId) ??
        records.workItems.find((work) => work.id === slot.workItemId);
      if (!source) return [];
      return [
        {
          id: slot.id,
          slotId: slot.id,
          blockItemId: null,
          title: source.title,
          icon: source.icon,
          lengthMin:
            slot.lengthMin ?? ("lengthMin" in source ? source.lengthMin : null),
          plannedAt: null,
          sortOrder: slot.sortOrder,
          done: slot.doneAt !== null,
          doneAt: slot.doneAt,
          tookMin: slot.tookMin,
        },
      ];
    });
  const items = [...setItems, ...pooled].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const atTimes = new Map(
    records.blockItems.map((item) => [item.id, item.atTime]),
  );
  const { placed } = reflowItems({
    startsAt: occurrence.startsAt,
    endsAt: occurrence.endsAt,
    items: items.map((item) => ({
      id: item.id,
      lengthMin: item.lengthMin,
      atTime: atTimes.get(item.id) ?? null,
    })),
    bands: [],
  });
  const starts = new Map(placed.map((place) => [place.id, place.startsAt]));
  return items.map((item) => ({
    ...item,
    plannedAt: starts.get(item.id) ?? null,
  }));
}

/** A checklist with no span is the whole date (D-USE-28) [ASSUMPTION]. */
export function isAllDay(
  block: Pick<BlockRecord, "checklist">,
  startsAt: string,
  endsAt: string,
) {
  return block.checklist && startsAt === "00:00" && endsAt === "24:00";
}

function formOf(
  occurrence: Today["occurrences"]["blocks"][number],
): NowBlockForm {
  const { block, startsAt, endsAt } = occurrence;
  if (block.checklist) {
    return isAllDay(block, startsAt, endsAt)
      ? "all-day-checklist"
      : "checklist";
  }
  return block.meal ? "meal" : "items";
}

/** Ready, go not yet given today, and the day not closed. */
export function phaseOf(dayRecord: DayRecordRecord | null): NowPhase {
  if (dayRecord?.closedAt != null) return "live";
  return dayRecord?.readyAt == null ? "before-go" : "live";
}

/** Now from a day: pure, so a test reads exactly what the screen reads. */
export function deriveNow(
  today: Today,
  now: Date,
  chosenId: string | null,
): NowView {
  const { records } = today;
  const spans = today.occurrences.blocks.map((occurrence) => {
    const items = itemsOf(occurrence, records);
    return {
      occurrence,
      items,
      start: occurrence.start,
      end: occurrence.end,
      allDay: formOf(occurrence) === "all-day-checklist",
      open: items.some((item) => !item.done),
    };
  });
  const active = activeBlock(spans, now);
  const occurrence = active?.occurrence ?? null;
  const form = occurrence ? formOf(occurrence) : null;
  const items = active?.items ?? [];
  // A checklist has no current item: nothing lifts (USE-17).
  const lifts = form === "items" || form === "meal";
  const current = lifts ? currentItem(items, chosenId) : null;
  const behind = active ? behindSince(active, now) : null;
  const following = nextBlock(spans, now);
  const tray = records.todos.find(
    (todo) =>
      todo.doneAt === null &&
      todo.archivedAt === null &&
      todo.rrule === null &&
      (todo.onDate === null || todo.onDate === records.date),
  );
  return {
    dateKey: records.date,
    phase: phaseOf(records.dayRecord),
    dayBlocks: today.occurrences.blocks
      .filter((entry) => formOf(entry) !== "all-day-checklist")
      .map((entry) => ({
        id: entry.block.id,
        kind: entry.block.kind,
        name: entry.block.name,
        startsAt: entry.startsAt,
        endsAt: entry.endsAt,
        meal: entry.block.meal,
      })),
    block:
      occurrence && form
        ? {
            id: occurrence.block.id,
            kind: occurrence.block.kind,
            name: occurrence.block.name,
            startsAt: occurrence.startsAt,
            endsAt: occurrence.endsAt,
            form,
            // The end behindSince returns is the occurrence's own.
            behindSince: behind === null ? null : occurrence.endsAt,
            next:
              following && following.occurrence !== occurrence
                ? {
                    name: following.occurrence.block.name,
                    startsAt: following.occurrence.startsAt,
                  }
                : null,
          }
        : null,
    items,
    current,
    next: nextItem(items, current),
    trayFirst: tray?.title ?? null,
  };
}

/** Now for a date, with the item the person made current (or null). */
export function useNow(dateKey: string, chosenId: string | null = null) {
  const source = useDataSource();
  // A render each minute, so behind shows once the planned end passes.
  useMinute();
  const query = useQuery<TodayRecords, Error, NowView>({
    queryKey: todayQueryKey(source.scenario.name, dateKey),
    queryFn: () => source.server.readToday(dateKey),
    select: (records) =>
      deriveNow(deriveToday(records), source.now(), chosenId),
    retry: false,
  });
  return { ...query, view: query.data };
}

/**
 * Before Ready, go or live, for the shell's first tab word and Now's title
 * (D-USE-5). Null until the day is read: the tab keeps "Now" meanwhile.
 */
export function useDayPhase(dateKey: string): NowPhase | null {
  const source = useDataSource();
  const query = useQuery<TodayRecords, Error, NowPhase>({
    queryKey: todayQueryKey(source.scenario.name, dateKey),
    queryFn: () => source.server.readToday(dateKey),
    select: (records) => phaseOf(records.dayRecord),
    retry: false,
  });
  return query.data ?? null;
}

/** The slot change a plain Done makes: done now, at the planned length. */
export function doneChange(item: NowItemView, at: Date) {
  return { doneAt: at.toISOString(), tookMin: item.lengthMin };
}

/**
 * Now's writes (USE-16): Done, a row's box and its uncheck, and the time
 * taken. A set item's slot is placed on its first touch. The day is
 * invalidated after each and Now derived again; nothing is set by hand.
 */
export function useSlotWrites(dateKey: string, blockId: string | null) {
  const source = useDataSource();
  const queryClient = useQueryClient();

  async function slotFor(item: NowItemView): Promise<string> {
    if (item.slotId !== null) return item.slotId;
    if (blockId === null || item.blockItemId === null) {
      throw new Error("A set item needs its block to be placed.");
    }
    const placed = await source.server.writeSlots({
      blockId,
      onDate: dateKey,
      sortOrder: item.sortOrder,
      blockItemId: item.blockItemId,
    });
    return placed.id;
  }

  const mutation = useMutation<
    SlotRecord,
    Error,
    {
      item: NowItemView;
      change: { doneAt?: string | null; tookMin?: number | null };
    }
  >({
    mutationFn: async ({ item, change }) =>
      source.server.writeSlots({ id: await slotFor(item), ...change }),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: todayQueryKey(source.scenario.name),
      }),
  });

  return {
    ...mutation,
    /** Done, or a row's box: done now, the planned length as the time taken. */
    done: (item: NowItemView) =>
      mutation.mutateAsync({ item, change: doneChange(item, source.now()) }),
    /** Unchecked: the record is withdrawn. */
    undo: (item: NowItemView) =>
      mutation.mutateAsync({ item, change: { doneAt: null, tookMin: null } }),
    /** The time-taken sheet's Save. */
    setTook: (item: NowItemView, min: number) =>
      mutation.mutateAsync({ item, change: { tookMin: min } }),
  };
}

/**
 * "Add to the checklist" (USE-17): a row on this date only, at the end of
 * the list [ASSUMPTION: as making the checklist, a new row in place].
 */
export function checklistAddInput(
  blockId: string,
  dateKey: string,
  title: string,
  items: readonly NowItemView[],
) {
  const last = Math.max(-1, ...items.map((item) => item.sortOrder));
  return { blockId, title, onDate: dateKey, sortOrder: last + 1 };
}

/** The checklist's add row: the day is read again after each row lands. */
export function useChecklistAdd(dateKey: string, blockId: string | null) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { title: string; items: NowItemView[] }>({
    mutationFn: ({ title, items }) => {
      if (blockId === null) throw new Error("A row needs its checklist.");
      return source.server.writeBlockItem(
        checklistAddInput(blockId, dateKey, title, items),
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: todayQueryKey(source.scenario.name),
      }),
  });
}
