"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IconValue, StoredBlockKind } from "@syn/types";
import {
  activeBlock,
  behindSince,
  currentItem,
  nextBlock,
  nextItem,
  reflowItems,
  type NowFocus,
} from "@syn/utils";
import type { BlockRecord, DayRecordRecord, SlotRecord } from "@syn/validators";
import type { FixtureServer } from "@/lib/fixtures/server";
import { useNow as useMinute } from "@/lib/hooks/use-now";
import { deriveToday, type Today } from "./derive-today";
import { deriveNowEnd, type NowEnd } from "./now-end";
import { useDataSource } from "./source";
import type { TodayRecords } from "./today-records";
import { useBlockFocus } from "./use-block-focus";
import { todayQueryKey } from "./use-today";
import { todosQueryKey } from "./use-todos";

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
  /** A to-do's id when the row is a to-do pulled into the block. */
  todoId: string | null;
  /** Where the row came from: the block's set items, a to-do, a work item. */
  source: "set" | "todo" | "work";
  /** A to-do's: the day it was made, `YYYY-MM-DD` ("a to-do since Tue"). */
  madeOn: string | null;
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

/** With USE-20's footer, add row and empty state (`now-end.ts`). */
export interface NowView extends NowEnd {
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
    .flatMap((item): NowItemView[] => {
      const slot = slots.find((row) => row.blockItemId === item.id) ?? null;
      // Not today (D-USE-70): the date's slot is skipped; the item stays usual.
      if (slot?.skipped) return [];
      return [
        {
          id: item.id,
          slotId: slot?.id ?? null,
          blockItemId: item.id,
          todoId: null,
          source: "set",
          madeOn: null,
          title: item.title,
          icon: item.icon,
          lengthMin: slot?.lengthMin ?? item.lengthMin,
          plannedAt: null,
          sortOrder: slot?.sortOrder ?? item.sortOrder,
          done: slot?.doneAt != null,
          doneAt: slot?.doneAt ?? null,
          tookMin: slot?.tookMin ?? null,
        },
      ];
    });
  const pooled = slots
    .filter((slot) => slot.blockItemId === null && !slot.skipped)
    .flatMap((slot): NowItemView[] => {
      const todo = records.todos.find((row) => row.id === slot.todoId);
      const source =
        todo ?? records.workItems.find((work) => work.id === slot.workItemId);
      if (!source) return [];
      return [
        {
          id: slot.id,
          slotId: slot.id,
          blockItemId: null,
          todoId: slot.todoId,
          source: todo ? "todo" : "work",
          madeOn: todo ? dayKeyIn(todo.createdAt, records.timeZone) : null,
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

/**
 * The calendar day of an instant in the person's zone: when a to-do was made
 * [ASSUMPTION: the wall-clock date, not the day close].
 */
function dayKeyIn(at: string | Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(at));
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
  /** A block put in focus early (USE-20): Start <Block> or End break. */
  focus: NowFocus | null = null,
): NowView {
  const { records } = today;
  const spans = today.occurrences.blocks.map((occurrence) => {
    const items = itemsOf(occurrence, records);
    return {
      id: occurrence.block.id,
      occurrence,
      items,
      start: occurrence.start,
      end: occurrence.end,
      allDay: formOf(occurrence) === "all-day-checklist",
      open: items.some((item) => !item.done),
    };
  });
  const active = activeBlock(spans, now, focus);
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
    ...deriveNowEnd(spans, active, form === "items" || form === "meal", now),
  };
}

/** Now for a date, with the item the person made current (or null). */
/**
 * The item the person made current on a date (a tapped row; the card a
 * reorder keeps, D-USE-26). It outlives the screen, so a sheet opened over
 * Now or a re-render never hands the card to a row dropped above it; it
 * lives as long as the day's data source does. No column holds it
 * [ASSUMPTION: per device, until the data seam names one].
 */
const chosenItems = new Map<string, string | null>();
const chosenListeners = new Set<() => void>();

export function useChosenItem(
  dateKey: string,
  seed: string | null = null,
): [string | null, (id: string | null) => void] {
  const source = useDataSource();
  const key = `${source.scenario.name}:${dateKey}`;
  if (!chosenItems.has(key) && seed !== null) chosenItems.set(key, seed);
  const chosen = React.useSyncExternalStore(
    (listener) => {
      chosenListeners.add(listener);
      return () => chosenListeners.delete(listener);
    },
    () => chosenItems.get(key) ?? null,
    () => seed,
  );
  const setChosen = React.useCallback(
    (id: string | null) => {
      chosenItems.set(key, id);
      chosenListeners.forEach((listener) => listener());
    },
    [key],
  );
  return [chosen, setChosen];
}

export function useNow(dateKey: string, chosenId: string | null = null) {
  const source = useDataSource();
  // A render each minute, so behind shows once the planned end passes.
  useMinute();
  const { focus } = useBlockFocus(dateKey);
  const query = useQuery<TodayRecords, Error, NowView>({
    queryKey: todayQueryKey(source.scenario.name, dateKey),
    queryFn: () => source.server.readToday(dateKey),
    select: (records) =>
      deriveNow(deriveToday(records), source.now(), chosenId, focus),
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

/** Where Now's rows live: the active block on the date. */
export interface NowPlace {
  dateKey: string;
  blockId: string;
}

/** The server calls Now's row writes use, so a test drives the same code. */
export type NowRowServer = Pick<
  FixtureServer,
  "writeSlots" | "removeSlot" | "undo" | "writeTodoDone"
>;

/**
 * A row's slot change (USE-21). A to-do's box is the to-do's own: its slot's
 * `doneAt` and the to-do's are written together, so the tray, which reads the
 * to-do, no longer shows it. Undone at the block's end, the slot reads as
 * returned (USE-9's `isReturned`) and nothing more is written.
 */
export async function writeRowChange(
  server: Pick<NowRowServer, "writeSlots" | "writeTodoDone">,
  slotId: string,
  item: Pick<NowItemView, "todoId">,
  change: { doneAt?: string | null; tookMin?: number | null },
): Promise<SlotRecord> {
  const slot = await server.writeSlots({ id: slotId, ...change });
  if (item.todoId !== null && change.doneAt !== undefined) {
    await server.writeTodoDone({ id: item.todoId, doneAt: change.doneAt });
  }
  return slot;
}

/**
 * The new order for every row: `ids` is the whole list after a drop or a
 * Move. Today only (D-USE-26): each row whose place changed has its slot's
 * `sortOrder` written, a set item's slot placed on first touch; the block's
 * items and its rule are never written.
 */
export async function writeReorder(
  server: NowRowServer,
  place: NowPlace,
  items: readonly NowItemView[],
  ids: readonly string[],
): Promise<void> {
  const byId = new Map(items.map((item) => [item.id, item]));
  for (const [index, id] of ids.entries()) {
    const item = byId.get(id);
    if (!item || item.sortOrder === index) continue;
    if (item.slotId !== null) {
      await server.writeSlots({ id: item.slotId, sortOrder: index });
    } else if (item.blockItemId !== null) {
      await server.writeSlots({
        blockId: place.blockId,
        onDate: place.dateKey,
        sortOrder: index,
        blockItemId: item.blockItemId,
      });
    }
  }
}

/**
 * Move up / Move down (D-USE-26), the grip's tap and keyboard fallback: the
 * row trades places with the undone row beside it, done rows staying put.
 * Null on the first undone row going up and the last going down (disabled).
 */
export function moveIds(
  items: readonly NowItemView[],
  id: string,
  direction: -1 | 1,
): string[] | null {
  const undone = items.filter((item) => !item.done).map((item) => item.id);
  const from = undone.indexOf(id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= undone.length) return null;
  const swapped = [...undone];
  [swapped[from], swapped[to]] = [swapped[to] as string, id];
  let next = 0;
  return items.map((item) =>
    item.done ? item.id : (swapped[next++] as string),
  );
}

/** How a Not today is undone: exactly what it wrote, put back. */
export type NotTodayUndo =
  /** The slot was there before: only `skipped` goes back to false. */
  | { kind: "unskip"; slotId: string }
  /** Not today placed the slot: it goes. */
  | { kind: "remove"; slotId: string }
  /** A to-do's slot was removed: the server puts the row back as it was. */
  | { kind: "restore"; token: string };

/**
 * Not today (D-USE-70): off today only. A set item's slot for the date is
 * written `skipped` (placed so on first touch); its usual day keeps it. A
 * to-do's slot is removed, so it returns to the pool (USE-9's `todoPool`).
 */
export async function writeNotToday(
  server: NowRowServer,
  place: NowPlace,
  item: NowItemView,
): Promise<NotTodayUndo> {
  if (item.blockItemId !== null) {
    if (item.slotId !== null) {
      await server.writeSlots({ id: item.slotId, skipped: true });
      return { kind: "unskip", slotId: item.slotId };
    }
    const placed = await server.writeSlots({
      blockId: place.blockId,
      onDate: place.dateKey,
      sortOrder: item.sortOrder,
      blockItemId: item.blockItemId,
      skipped: true,
    });
    return { kind: "remove", slotId: placed.id };
  }
  if (item.slotId === null) throw new Error("A pulled row has its slot.");
  const removed = await server.removeSlot({ id: item.slotId });
  return { kind: "restore", token: removed.undo };
}

/** Not today's Undo: the row is back where it was. */
export async function undoNotToday(
  server: NowRowServer,
  undo: NotTodayUndo,
): Promise<void> {
  if (undo.kind === "unskip") {
    await server.writeSlots({ id: undo.slotId, skipped: false });
  } else if (undo.kind === "remove") {
    await server.removeSlot({ id: undo.slotId });
  } else {
    await server.undo(undo.token);
  }
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

  const place = blockId === null ? null : { dateKey, blockId };

  /** A row write, then the day read again; Now is never set by hand. */
  async function settle<T>(write: Promise<T>): Promise<T> {
    try {
      return await write;
    } finally {
      await queryClient.invalidateQueries({
        queryKey: todayQueryKey(source.scenario.name),
      });
    }
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
      writeRowChange(source.server, await slotFor(item), item, change),
    onSettled: async (_, __, { item }) => {
      await queryClient.invalidateQueries({
        queryKey: todayQueryKey(source.scenario.name),
      });
      // A to-do checked in its block leaves the tray (USE-21).
      if (item.todoId !== null) {
        await queryClient.invalidateQueries({
          queryKey: todosQueryKey(source.scenario.name),
        });
      }
    },
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
    /** A drop or a Move (USE-18): the whole order, today only. */
    reorder: (items: readonly NowItemView[], ids: readonly string[]) =>
      settle(
        place === null
          ? Promise.resolve()
          : writeReorder(source.server, place, items, ids),
      ),
    /** Not today (USE-18): resolves to what its Undo takes. */
    notToday: (item: NowItemView) =>
      settle(
        place === null
          ? Promise.reject(new Error("Not today needs its block."))
          : writeNotToday(source.server, place, item),
      ),
    undoNotToday: (undo: NotTodayUndo) =>
      settle(undoNotToday(source.server, undo)),
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
