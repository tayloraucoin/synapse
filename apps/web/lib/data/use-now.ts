"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IconValue, StoredBlockKind } from "@syn/types";
import { activeBlock, currentItem, nextItem, reflowItems } from "@syn/utils";
import type { SlotRecord } from "@syn/validators";
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

export interface NowBlockView {
  id: string;
  kind: StoredBlockKind;
  name: string;
  /** "HH:MM", the date's times (a change's, when it has one). */
  startsAt: string;
  endsAt: string;
}

export interface NowView {
  dateKey: string;
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
    // A transition is a band in the flow, not an item (USE-17's).
    .filter((item) => item.blockId === block.id && !item.isTransition)
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

/** Now from a day: pure, so a test reads exactly what the screen reads. */
export function deriveNow(
  today: Today,
  now: Date,
  chosenId: string | null,
): NowView {
  const { records } = today;
  const occurrence = activeBlock(today.occurrences.blocks, now);
  const items = occurrence ? itemsOf(occurrence, records) : [];
  const current = currentItem(items, chosenId);
  const tray = records.todos.find(
    (todo) =>
      todo.doneAt === null &&
      todo.archivedAt === null &&
      todo.rrule === null &&
      (todo.onDate === null || todo.onDate === records.date),
  );
  return {
    dateKey: records.date,
    block: occurrence
      ? {
          id: occurrence.block.id,
          kind: occurrence.block.kind,
          name: occurrence.block.name,
          startsAt: occurrence.startsAt,
          endsAt: occurrence.endsAt,
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
  const query = useQuery<TodayRecords, Error, NowView>({
    queryKey: todayQueryKey(source.scenario.name, dateKey),
    queryFn: () => source.server.readToday(dateKey),
    select: (records) =>
      deriveNow(deriveToday(records), source.now(), chosenId),
    retry: false,
  });
  return { ...query, view: query.data };
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
