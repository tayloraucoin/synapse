"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  IconValue,
  StoredBlockKind,
  WorkSize,
  WorkTier,
} from "@syn/types";
import { clockFromMinutes, clockToMinutes, reflowItems } from "@syn/utils";
import type { BlockItemRecord, SlotRecord } from "@syn/validators";
import { ITEM_SHEET_COPY } from "@/components/planner/item-sheet/copy";
import { weekOf } from "@/components/work/add/new-task/form";
import type { PlannerWrite } from "@/lib/fixtures/planner";
import type { FixtureServer } from "@/lib/fixtures/server";
import { deriveToday, type Today } from "./derive-today";
import {
  deriveLinearView,
  retryLinear,
  writeDescription,
  writeNotToday,
  writePriority,
  writeStatus,
  writeUnlink,
  type LinearSheetServer,
  type WorkLinearView,
} from "./item-sheet-linear";
import {
  ALL_TAB,
  deriveLinkList,
  undoLink,
  writeLink,
  type LinkServer,
  type LinkWrite,
} from "./item-sheet-link";
import {
  dayPicks,
  deriveSubIssues,
  writeAddSessionDay,
  writeCheckSubIssue,
  writeDropSession,
  writePlaceSubIssue,
  type SessionsServer,
  type SubIssueView,
} from "./item-sheet-sessions";
import {
  deriveWorkSheet,
  undoWorkSheetWrite,
  writeBackToPool,
  writeLength,
  writeMarkTaskDone,
  writeNotes,
  writeRemoveFromSynapse,
  writeSize,
  writeTier,
  type WorkSheetServer,
  type WorkSheetView,
  type WorkSheetWrite,
} from "./item-sheet-work";
import { useDataSource, useIsOffline } from "./source";
import type { TodayRecords } from "./today-records";
import { useAccount } from "./use-account";
import { linearQueryKey, useLinear } from "./use-linear";
import { usePlannerWrites } from "./use-planner-writes";
import { poolQueryKey, usePool } from "./use-pool";
import { deriveSetUpDay, type SetUpDay } from "./use-set-up-day";
import { todayQueryKey } from "./use-today";
import { useWeekQuery, weekQueryKey } from "./use-week";
import type { WeekRecords } from "./week-records";

/**
 * The Item sheet's data (USE-64; day/item-sheet): one plain item on today's
 * date, its block's span, the item before it, and the library of its kind
 * for Swap, all derived from `useToday`'s records. Every change saves as
 * made, for today only (D-USE-60); the usual week changes only through Make
 * it Monday's usual.
 *
 * TODAY ONLY, ON THE DATE'S SLOT (USE-87, `0015`). The slot carries the
 * date's own length, time, icon and Notes, placed on first touch; the usual
 * item is unchanged and no copy is written for them. Only Swap leaves the set
 * item off the date (a skipped slot) and writes the date's own item in its
 * place (`onDate`); edits to that item change it. Turning a set time off for
 * today when the usual item has one is a copy too [ASSUMPTION: the slot's
 * null reads the item's, so it cannot say "no time today"].
 */

/** D-USE-81: an item with no length counts 5 minutes. */
const DEFAULT_LENGTH_MIN = 5;

export interface ItemSheetItem {
  /** The block item's id: the set item, or the date's own copy. */
  id: string;
  /** Null until the item is first touched on the date. */
  slotId: string | null;
  /** The slot's own length for the date, when it has one. */
  slotLengthMin: number | null;
  /** The slot's own time and icon for the date, when it has them. */
  slotAtTime: string | null;
  slotIcon: IconValue | null;
  /** The usual item's set time, under any of the date's. */
  usualAtTime: string | null;
  /** The date's Notes, from the slot; "" when none. */
  notes: string;
  title: string;
  icon: IconValue | null;
  /** The length the date plans with: the slot's, else the item's. */
  lengthMin: number;
  /** "HH:MM" when it stays at a set time. */
  atTime: string | null;
  /** "HH:MM", where the day places it. */
  plannedAt: string | null;
  /** Its place on the date: the slot's, else the item's. */
  sortOrder: number;
  /** The date's own copy (`onDate`), not the usual item. */
  dated: boolean;
  meal: boolean;
}

export interface ItemSheetBlock {
  id: string;
  kind: StoredBlockKind;
  name: string;
  /** "HH:MM" on the date. */
  startsAt: string;
  endsAt: string;
}

/** One row of Swap: a library item laid in the current one's place. */
export interface SwapRow {
  id: string;
  title: string;
  icon: IconValue | null;
  lengthMin: number;
  /** "HH:MM": where it would start, the current item's start. */
  startsAt: string | null;
  /** "HH:MM": where the block's items end with this pick. */
  endsAt: string;
  current: boolean;
}

export interface ItemSheetView {
  date: string;
  block: ItemSheetBlock;
  item: ItemSheetItem;
  /** The item before it in the block, for "Off: follows <item>". */
  previous: { title: string } | null;
  /** The current item first, then the library of its kind (D-USE-12). */
  swap: SwapRow[];
}

interface Row {
  id: string;
  title: string;
  lengthMin: number;
  atTime: string | null;
  sortOrder: number;
}

function lengthOf(lengthMin: number | null | undefined): number {
  return lengthMin ?? DEFAULT_LENGTH_MIN;
}

/** The block's rows on the date in order: set items, dated items, pulled slots. */
function rowsOf(
  records: TodayRecords,
  occurrence: Today["occurrences"]["blocks"][number],
): Row[] {
  const { block, slots } = occurrence;
  const items = records.blockItems
    .filter(
      (item) =>
        item.blockId === block.id &&
        !item.isTransition &&
        (item.onDate === null || item.onDate === records.date),
    )
    .flatMap((item): Row[] => {
      const slot = slots.find((row) => row.blockItemId === item.id);
      if (slot?.skipped) return [];
      return [
        {
          id: item.id,
          title: item.title,
          lengthMin: lengthOf(slot?.lengthMin ?? item.lengthMin),
          atTime: slot?.atTime ?? item.atTime,
          sortOrder: slot?.sortOrder ?? item.sortOrder,
        },
      ];
    });
  const pulled = slots
    .filter((slot) => slot.blockItemId === null && !slot.skipped)
    .map((slot): Row => {
      const source =
        records.todos.find((todo) => todo.id === slot.todoId) ??
        records.workItems.find((work) => work.id === slot.workItemId);
      return {
        id: slot.id,
        title: source?.title ?? "",
        lengthMin: lengthOf(
          slot.lengthMin ??
            (source && "lengthMin" in source ? source.lengthMin : null),
        ),
        atTime: null,
        sortOrder: slot.sortOrder,
      };
    });
  return [...items, ...pulled].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Where the rows start, and where the last one ends. */
function layOut(block: ItemSheetBlock, rows: readonly Row[]) {
  const { placed } = reflowItems({
    startsAt: block.startsAt,
    endsAt: block.endsAt,
    items: rows,
    bands: [],
  });
  const starts = new Map(placed.map((place) => [place.id, place.startsAt]));
  const end = rows.reduce((last, row) => {
    const start = starts.get(row.id);
    return start === undefined
      ? last
      : Math.max(last, clockToMinutes(start) + row.lengthMin);
  }, clockToMinutes(block.startsAt));
  return { starts, endsAt: clockFromMinutes(end) };
}

/**
 * The library of a kind (refinement 7): every item in a block of that kind,
 * one per title, transitions left out [ASSUMPTION: the library has no table
 * yet; where it lives once wired is the wiring's]. What else is in the
 * current block on the date is not offered: it is already there.
 */
function libraryOf(
  records: TodayRecords,
  block: ItemSheetBlock,
  rows: readonly Row[],
): BlockItemRecord[] {
  const kinds = new Set(
    records.blocks.filter((b) => b.kind === block.kind).map((b) => b.id),
  );
  const here = new Set(rows.map((row) => row.title));
  const seen = new Set<string>();
  return records.blockItems.filter((item) => {
    if (!kinds.has(item.blockId) || item.isTransition || item.meal) {
      return false;
    }
    if (item.onDate !== null && item.onDate !== records.date) return false;
    if (here.has(item.title) || seen.has(item.title)) return false;
    seen.add(item.title);
    return true;
  });
}

/** The sheet on one item of the date: pure, so a test reads what the sheet reads. */
export function deriveItemSheet(
  today: Today,
  id: string,
): ItemSheetView | null {
  const { records } = today;
  const record = records.blockItems.find((item) => item.id === id);
  if (!record) return null;
  const occurrence = today.occurrences.blocks.find(
    (entry) => entry.block.id === record.blockId,
  );
  if (!occurrence) return null;
  const slot =
    occurrence.slots.find((row) => row.blockItemId === record.id) ?? null;
  const block: ItemSheetBlock = {
    id: occurrence.block.id,
    kind: occurrence.block.kind,
    name: occurrence.block.name,
    startsAt: occurrence.startsAt,
    endsAt: occurrence.endsAt,
  };
  const rows = rowsOf(records, occurrence);
  const { starts } = layOut(block, rows);
  const index = rows.findIndex((row) => row.id === record.id);
  const lengthMin = lengthOf(slot?.lengthMin ?? record.lengthMin);
  const item: ItemSheetItem = {
    id: record.id,
    slotId: slot?.id ?? null,
    slotLengthMin: slot?.lengthMin ?? null,
    slotAtTime: slot?.atTime ?? null,
    slotIcon: slot?.icon ?? null,
    usualAtTime: record.atTime,
    notes: slot?.notes ?? "",
    title: record.title,
    icon: slot?.icon ?? record.icon,
    lengthMin,
    atTime: slot?.atTime ?? record.atTime,
    plannedAt: starts.get(record.id) ?? null,
    sortOrder: slot?.sortOrder ?? record.sortOrder,
    dated: record.onDate !== null,
    meal: record.meal,
  };

  // Each pick laid in the current one's place: its start, and the block's end.
  const withPick = (pick: { title: string; lengthMin: number }) =>
    layOut(
      block,
      rows.map((row) => (row.id === record.id ? { ...row, ...pick } : row)),
    ).endsAt;
  const current: SwapRow = {
    id: record.id,
    title: record.title,
    icon: item.icon,
    lengthMin,
    startsAt: item.plannedAt,
    endsAt: withPick({ title: record.title, lengthMin }),
    current: true,
  };
  const library = libraryOf(records, block, rows).map((entry): SwapRow => ({
    id: entry.id,
    title: entry.title,
    icon: entry.icon,
    lengthMin: lengthOf(entry.lengthMin),
    startsAt: item.plannedAt,
    endsAt: withPick({
      title: entry.title,
      lengthMin: lengthOf(entry.lengthMin),
    }),
    current: false,
  }));

  return {
    date: records.date,
    block,
    item,
    previous: index > 0 ? { title: rows[index - 1]!.title } : null,
    swap: [current, ...library],
  };
}

/* ------------------------------------------------------------- writes -- */

/** The server calls the sheet's writes use, so a test drives the same code. */
export type ItemSheetServer = Pick<
  FixtureServer,
  | "writeSlots"
  | "removeSlot"
  | "writeBlockItem"
  | "editBlockItem"
  | "removeBlockItem"
  | "undo"
>;

/** One step of an Undo, run in reverse order of the writes. */
export type ItemUndoStep =
  /** A planner write's own Undo. */
  | { kind: "token"; token: string }
  /** A slot's fields put back as they were. */
  | { kind: "slot"; id: string; change: SlotValues & { skipped?: boolean } }
  /** A slot the write placed: it goes. */
  | { kind: "remove-slot"; id: string };

export interface ItemWrite {
  /** The item after the write: a new copy's id when the set item was left off. */
  id: string;
  undo: ItemUndoStep[];
}

/** The date's own values a slot holds (`0015`); null reads the item's. */
export type SlotValues = {
  lengthMin?: number | null;
  atTime?: string | null;
  icon?: IconValue | null;
  notes?: string | null;
};

/** The slot's values as they stand, for an Undo of `change`. */
function slotBefore(item: ItemSheetItem, change: SlotValues): SlotValues {
  const before: SlotValues = {};
  if ("lengthMin" in change) before.lengthMin = item.slotLengthMin;
  if ("atTime" in change) before.atTime = item.slotAtTime;
  if ("icon" in change) before.icon = item.slotIcon;
  if ("notes" in change) before.notes = item.notes === "" ? null : item.notes;
  return before;
}

/** The date's own values on the item's slot, placed on first touch. */
async function writeSlotValues(
  server: ItemSheetServer,
  view: ItemSheetView,
  change: SlotValues,
): Promise<ItemWrite> {
  const { item, block, date } = view;
  if (item.slotId !== null) {
    await server.writeSlots({ id: item.slotId, ...change });
    return {
      id: item.id,
      undo: [{ kind: "slot", id: item.slotId, change: slotBefore(item, change) }],
    };
  }
  const placed = await server.writeSlots({
    blockId: block.id,
    onDate: date,
    sortOrder: item.sortOrder,
    blockItemId: item.id,
    ...change,
  });
  return { id: item.id, undo: [{ kind: "remove-slot", id: placed.id }] };
}

/** Length (C-USE-item-sheet-default-2): the slot's, for the date only. */
export function writeItemLength(
  server: ItemSheetServer,
  view: ItemSheetView,
  lengthMin: number,
): Promise<ItemWrite> {
  return writeSlotValues(server, view, { lengthMin });
}

/** Notes (C-USE-item-sheet-1): the date's, on the slot; "" clears them. */
export function writeItemNotes(
  server: ItemSheetServer,
  view: ItemSheetView,
  text: string,
): Promise<ItemWrite> {
  const notes = text.trim();
  return writeSlotValues(server, view, { notes: notes === "" ? null : notes });
}

type ItemChange = {
  title?: string;
  icon?: IconValue | null;
  atTime?: string | null;
  lengthMin?: number;
};

/**
 * A change the slot cannot hold (Swap, or a usual set time off for today):
 * the date's own item is edited; a set item is left off the date and its
 * copy written in its place, carrying the date's Notes.
 */
async function writeTodayCopy(
  server: ItemSheetServer,
  view: ItemSheetView,
  change: ItemChange,
): Promise<ItemWrite> {
  const { item, block, date } = view;
  if (item.dated) {
    const edited = await server.editBlockItem({ id: item.id, ...change });
    return { id: item.id, undo: [{ kind: "token", token: edited.undo }] };
  }
  const off = await server.removeBlockItem({ id: item.id, date });
  const copy = await server.writeBlockItem({
    blockId: block.id,
    title: item.title,
    icon: item.icon,
    isTransition: false,
    atTime: item.atTime,
    lengthMin: item.lengthMin,
    meal: item.meal,
    onDate: date,
    sortOrder: item.sortOrder,
    ...change,
  });
  if (copy.id === undefined) throw new Error("The copy has its id.");
  const undo: ItemUndoStep[] = [
    { kind: "token", token: off.undo },
    { kind: "token", token: copy.undo },
  ];
  if (item.notes !== "") {
    const placed = await server.writeSlots({
      blockId: block.id,
      onDate: date,
      sortOrder: item.sortOrder,
      blockItemId: copy.id,
      notes: item.notes,
    });
    undo.push({ kind: "remove-slot", id: placed.id });
  }
  return { id: copy.id, undo };
}

/** At a set time (C-USE-item-sheet-at-a-set-time-2): on with its time, or off. */
export function writeItemAtTime(
  server: ItemSheetServer,
  view: ItemSheetView,
  atTime: string | null,
): Promise<ItemWrite> {
  const { item } = view;
  if (item.dated) return writeTodayCopy(server, view, { atTime });
  if (atTime === null && item.usualAtTime !== null) {
    return writeTodayCopy(server, view, { atTime });
  }
  return writeSlotValues(server, view, { atTime });
}

/** The icon tile's pick, for today. */
export function writeItemIcon(
  server: ItemSheetServer,
  view: ItemSheetView,
  icon: IconValue,
): Promise<ItemWrite> {
  if (view.item.dated) return writeTodayCopy(server, view, { icon });
  return writeSlotValues(server, view, { icon });
}

/**
 * Swap (D-USE-12, D-USE-60 (1)): the pick in the item's place for today, at
 * the pick's length; its set time, if it had one, stays. The rest stay.
 */
export async function writeSwap(
  server: ItemSheetServer,
  view: ItemSheetView,
  pick: SwapRow,
): Promise<ItemWrite> {
  const { item } = view;
  const steps: ItemUndoStep[] = [];
  // The date's own length was the old item's: the pick brings its own.
  if (item.dated && item.slotId !== null && item.slotLengthMin !== null) {
    await server.writeSlots({ id: item.slotId, lengthMin: null });
    steps.push({
      kind: "slot",
      id: item.slotId,
      change: { lengthMin: item.slotLengthMin },
    });
  }
  const written = await writeTodayCopy(server, view, {
    title: pick.title,
    icon: pick.icon,
    lengthMin: pick.lengthMin,
  });
  return { id: written.id, undo: [...steps, ...written.undo] };
}

/** Not today (D-USE-70): off today only; the usual day keeps it. */
export async function writeItemNotToday(
  server: ItemSheetServer,
  view: ItemSheetView,
): Promise<ItemWrite> {
  const off = await server.removeBlockItem({
    id: view.item.id,
    date: view.date,
  });
  return { id: view.item.id, undo: [{ kind: "token", token: off.undo }] };
}

/**
 * The set item a Swap's copy stands in for: the set item of the block left
 * off the date at the copy's place [ASSUMPTION: no column links them, (b)
 * `replaces_item_id` not chosen; only Swap and a usual time off write a copy].
 */
export function copyOrigin(
  records: TodayRecords,
  view: ItemSheetView,
): { id: string; slot: SlotRecord } | null {
  const { item, block, date } = view;
  for (const candidate of records.blockItems) {
    if (candidate.blockId !== block.id || candidate.onDate !== null) continue;
    const slot = records.slots.find(
      (row) =>
        row.blockItemId === candidate.id &&
        row.onDate === date &&
        row.skipped &&
        row.sortOrder === item.sortOrder,
    );
    if (slot) return { id: candidate.id, slot };
  }
  return null;
}

/**
 * Make it Monday's usual (C-USE-item-sheet-more-open-2): today's version
 * becomes the usual item, the way back from a today-only edit, and the date
 * reads the usual again. One Undo takes it all back.
 */
export async function writeMakeUsual(
  server: ItemSheetServer,
  records: TodayRecords,
  view: ItemSheetView,
): Promise<ItemWrite> {
  const { item } = view;
  const steps: ItemUndoStep[] = [];
  if (!item.dated) {
    const edited = await server.editBlockItem({
      id: item.id,
      lengthMin: item.lengthMin,
      atTime: item.atTime,
      icon: item.icon,
    });
    steps.push({ kind: "token", token: edited.undo });
    // The date reads the usual again; its Notes stay the date's.
    const own: SlotValues = {};
    if (item.slotLengthMin !== null) own.lengthMin = null;
    if (item.slotAtTime !== null) own.atTime = null;
    if (item.slotIcon !== null) own.icon = null;
    if (item.slotId !== null && Object.keys(own).length > 0) {
      await server.writeSlots({ id: item.slotId, ...own });
      steps.push({
        kind: "slot",
        id: item.slotId,
        change: slotBefore(item, own),
      });
    }
    return { id: item.id, undo: steps };
  }
  const origin = copyOrigin(records, view);
  if (origin === null) {
    // A date's own item with no set item behind it joins the usual week.
    const edited = await server.editBlockItem({ id: item.id, onDate: null });
    return { id: item.id, undo: [{ kind: "token", token: edited.undo }] };
  }
  const edited = await server.editBlockItem({
    id: origin.id,
    title: item.title,
    icon: item.icon,
    atTime: item.atTime,
    lengthMin: item.lengthMin,
  });
  steps.push({ kind: "token", token: edited.undo });
  const gone = await server.removeBlockItem({ id: item.id });
  steps.push({ kind: "token", token: gone.undo });
  // The set item's slot comes back plain, with the copy's Notes.
  const { slot } = origin;
  await server.writeSlots({
    id: slot.id,
    skipped: false,
    lengthMin: null,
    atTime: null,
    icon: null,
    notes: item.notes === "" ? null : item.notes,
  });
  steps.push({
    kind: "slot",
    id: slot.id,
    change: {
      skipped: true,
      lengthMin: slot.lengthMin,
      atTime: slot.atTime,
      icon: slot.icon,
      notes: slot.notes,
    },
  });
  return { id: origin.id, undo: steps };
}

/** A write's Undo: each step put back, last first. */
export async function undoItemWrite(
  server: ItemSheetServer,
  undo: readonly ItemUndoStep[],
): Promise<void> {
  for (const step of [...undo].reverse()) {
    if (step.kind === "token") await server.undo(step.token);
    else if (step.kind === "slot") {
      await server.writeSlots({ id: step.id, ...step.change });
    } else await server.removeSlot({ id: step.id });
  }
}

/* ---------------------------------------------------------------- hook -- */

/**
 * The sheet on `id`, on today's date. Writes run one at a time, each on the
 * day as the last one left it, so a copy written by one is the item the next
 * changes; `onMoved` hands the sheet a copy's id. The planner's writes go
 * through its queue, so offline they wait on the device and land in order
 * (D-USE-64).
 */
export function useItemSheet(
  id: string | null,
  onMoved: (id: string) => void = () => {},
) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const planner = usePlannerWrites();
  const dateKey = source.todayKey();
  const scenario = source.scenario.name;
  const queryKey = todayQueryKey(scenario, dateKey);

  const query = useQuery<TodayRecords, Error, ItemSheetView | null>({
    queryKey,
    queryFn: () => source.server.readToday(dateKey),
    select: (records) =>
      id === null ? null : deriveItemSheet(deriveToday(records), id),
    enabled: id !== null,
    retry: false,
  });

  // Notes as typed, over the stored ones until the sheet moves to another item.
  const [draft, setDraft] = React.useState<{
    id: string | null;
    text: string;
  } | null>(null);
  if (draft !== null && draft.id !== id) setDraft(null);
  const notes = draft?.text ?? query.data?.item.notes ?? "";

  const server: ItemSheetServer = {
    writeSlots: source.server.writeSlots,
    removeSlot: source.server.removeSlot,
    writeBlockItem: planner.writeBlockItem,
    editBlockItem: planner.editBlockItem,
    removeBlockItem: planner.removeBlockItem,
    undo: planner.undo,
  };
  const serverRef = React.useRef(server);
  serverRef.current = server;
  const chain = React.useRef<Promise<unknown>>(Promise.resolve());
  // An item a write left for its copy: later writes follow it there.
  const moved = React.useRef(new Map<string, string>());
  const follow = (start: string) => {
    let at = start;
    while (moved.current.has(at)) at = moved.current.get(at)!;
    return at;
  };

  /** The day as it stands now, read again, on the item a write began on. */
  async function readLatest(start: string): Promise<{
    records: TodayRecords;
    view: ItemSheetView;
  } | null> {
    await queryClient.invalidateQueries({ queryKey });
    const records = await queryClient.fetchQuery({
      queryKey,
      queryFn: () => source.server.readToday(dateKey),
    });
    const view = deriveItemSheet(deriveToday(records), follow(start));
    return view ? { records, view } : null;
  }

  /**
   * One write after the last, on the latest day. The item is taken when the
   * write is asked for, so a tap that also closes the sheet still lands.
   */
  function run(
    write: (
      server: ItemSheetServer,
      view: ItemSheetView,
      records: TodayRecords,
    ) => Promise<ItemWrite>,
  ): Promise<ItemWrite | null> {
    const start = id;
    if (start === null) return Promise.resolve(null);
    const next = chain.current.then(async () => {
      const latest = await readLatest(start);
      if (latest === null) return null;
      const written = await write(
        serverRef.current,
        latest.view,
        latest.records,
      );
      if (written.id !== latest.view.item.id) {
        moved.current.set(latest.view.item.id, written.id);
        onMoved(written.id);
      }
      await queryClient.invalidateQueries({
        queryKey: todayQueryKey(scenario),
      });
      return written;
    });
    chain.current = next.catch(() => {});
    return next;
  }

  return {
    ...query,
    view: query.data ?? null,
    notes,
    setNotes: (text: string) => {
      setDraft({ id, text });
      return run((s, view) =>
        view.item.notes === text.trim()
          ? Promise.resolve({ id: view.item.id, undo: [] })
          : writeItemNotes(s, view, text),
      );
    },
    setLength: (lengthMin: number) =>
      run((s, view) => writeItemLength(s, view, lengthMin)),
    setAtTime: (atTime: string | null) =>
      run((s, view) => writeItemAtTime(s, view, atTime)),
    setIcon: (icon: IconValue) =>
      run((s, view) => writeItemIcon(s, view, icon)),
    swap: (pick: SwapRow) => run((s, view) => writeSwap(s, view, pick)),
    notToday: () => run((s, view) => writeItemNotToday(s, view)),
    makeUsual: () =>
      run((s, view, records) => writeMakeUsual(s, records, view)),
    /** A write's Undo; the day is read again after. */
    undo: async (write: ItemWrite) => {
      await chain.current;
      await undoItemWrite(serverRef.current, write.undo);
      await queryClient.invalidateQueries({
        queryKey: todayQueryKey(scenario),
      });
    },
  };
}

/* ---------------------------------------------------------- work item -- */

/** The id names a work item, not an item of a block: the sheet hands over (USE-65). */
export function useIsWorkItem(id: string | null): boolean {
  const source = useDataSource();
  const dateKey = source.todayKey();
  const query = useQuery<TodayRecords, Error, boolean>({
    queryKey: todayQueryKey(source.scenario.name, dateKey),
    queryFn: () => source.server.readToday(dateKey),
    select: (records) =>
      id !== null && records.workItems.some((item) => item.id === id),
    enabled: id !== null,
    retry: false,
  });
  return query.data ?? false;
}

/**
 * The sheet on a work item (USE-65): `deriveWorkSheet` over the date's
 * records, the pool's slots (each session's place) and the item's issue. Its
 * fields save as made; ···'s three writes resolve to their Undo. Start and
 * Done are the work loop's (USE-59, USE-60), never this hook's.
 */
/** The week as the day picks and the fit lines read it (USE-67). */
function selectSetUpWeek(records: WeekRecords): {
  days: SetUpDay[];
  timeZone: string;
} {
  return {
    days: records.days.map((day) => deriveSetUpDay(day, records.timeZone)),
    timeZone: records.timeZone,
  };
}

export function useWorkItemSheet(id: string | null) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const dateKey = source.todayKey();
  const scenario = source.scenario.name;
  const { slots } = usePool();
  const linear = useLinear();
  const { issueFor, subIssuesFor } = linear;
  const offline = useIsOffline();
  const account = useAccount();
  const week = useWeekQuery(weekOf(dateKey).key, selectSetUpWeek).data;

  const query = useQuery<TodayRecords, Error, Today>({
    queryKey: todayQueryKey(scenario, dateKey),
    queryFn: () => source.server.readToday(dateKey),
    select: deriveToday,
    enabled: id !== null,
    retry: false,
  });
  const today = query.data;
  const record = today?.records.workItems.find((item) => item.id === id);
  const view: WorkSheetView | null =
    id === null || today === undefined || record === undefined
      ? null
      : deriveWorkSheet({
          today,
          workItemId: id,
          sessions: slots,
          issue: issueFor(record),
        });

  // A linked item's Linear side (USE-66): the line, the status list, Priority, Description.
  const issue = record ? issueFor(record) : null;
  const linearView: WorkLinearView | null =
    view === null || issue === null || record === undefined || !today
      ? null
      : deriveLinearView({
          view,
          issue,
          states: issue.team ? linear.statesFor(issue.team.id) : [],
          workspace:
            linear.connections.find((c) => c.id === issue.connectionId)
              ?.organizationName ?? "",
          item: record,
          offline,
          timeZone: today.records.timeZone,
          words: {
            priorities: ITEM_SHEET_COPY.linear.priorities,
            description: ITEM_SHEET_COPY.linear.keptDescription,
            size: ITEM_SHEET_COPY.linear.keptSize,
          },
        });
  // Its sub-issues from Linear's snapshot, each with its place once placed.
  const estimates = new Map<string, number | null>();
  for (const workspace of linear.data?.workspaces ?? []) {
    for (const sub of workspace.payload.subIssues) {
      estimates.set(sub.id, sub.estimate);
    }
  }
  const subIssues: SubIssueView[] =
    record === undefined || today === undefined
      ? []
      : deriveSubIssues({
          subs: subIssuesFor(record),
          estimates,
          workItems: today.records.workItems,
          slots: [...(slots ?? []), ...today.records.slots],
        });

  const server: WorkSheetServer &
    LinearSheetServer &
    SessionsServer &
    LinkServer = source.server;
  const viewRef = React.useRef(view);
  viewRef.current = view;
  const linearRef = React.useRef(linearView);
  linearRef.current = linearView;

  function invalidate() {
    for (const queryKey of [
      todayQueryKey(scenario),
      weekQueryKey(scenario),
      poolQueryKey(scenario),
      linearQueryKey(scenario),
    ]) {
      void queryClient.invalidateQueries({ queryKey });
    }
  }

  function run(
    write: (
      s: WorkSheetServer & LinearSheetServer & SessionsServer,
      v: WorkSheetView,
    ) => Promise<WorkSheetWrite | null>,
  ): Promise<{ write: WorkSheetWrite; view: WorkSheetView } | null> {
    const at = viewRef.current;
    if (at === null) return Promise.resolve(null);
    return write(server, at)
      .then((written) =>
        written === null ? null : { write: written, view: at },
      )
      .finally(invalidate);
  }

  return {
    view,
    isPending: query.isPending,
    /** A record row: is this id a work item on the date's records? */
    isWork: record !== undefined,
    /** Another work item's name, for the ask's words. */
    titleOf: (workItemId: string) =>
      today?.records.workItems.find((row) => row.id === workItemId)?.title ??
      "",
    setSize: (size: WorkSize) => run((s, v) => writeSize(s, v, size)),
    setLength: (range: { min: number; max: number | null }) =>
      run((s, v) => writeLength(s, v, range)),
    /** This session's tier, or every session's (the ask's All sessions). */
    setTier: (tier: WorkTier, sessions: "this" | "all" = "this") =>
      run((s, v) => writeTier(s, v, tier, sessions)),
    /** Sub-issues, the week's days and its read, for the ask and the steps. */
    subIssues,
    week: week ?? null,
    workItems: today?.records.workItems ?? [],
    slots: [...(slots ?? []), ...(today?.records.slots ?? [])],
    picks: (taken: readonly string[] = []) =>
      dayPicks(week?.days ?? [], dateKey, taken),
    /** × on a session: that day only. */
    dropSession: (slotId: string) =>
      run((s, v) => writeDropSession(s, v, slotId)),
    /** Add a day: another session, at the end of that day's Work block. */
    addSessionDay: (place: {
      dateKey: string;
      blockId: string;
      tier: WorkTier;
    }) =>
      run((s, v) =>
        writeAddSessionDay(s, v, place, sortAfter(week?.days, place)),
      ),
    /** A sub-issue's check, here and in Linear; resolves to its Undo. */
    checkSubIssue: async (sub: SubIssueView, done: boolean) => {
      const at = viewRef.current;
      if (at === null) return null;
      try {
        return await writeCheckSubIssue(server, at, sub, done);
      } finally {
        invalidate();
      }
    },
    /** Place on a day by itself: its own slot, still under its issue. */
    placeSubIssue: (
      sub: SubIssueView,
      place: { dateKey: string; blockId: string; tier: WorkTier },
    ) => run((s, v) => writePlaceSubIssue(s, v, sub, place)),
    setNotes: (notes: string) => run((s, v) => writeNotes(s, v, notes)),
    markTaskDone: () => run(writeMarkTaskDone),
    backToPool: () => run(writeBackToPool),
    removeFromSynapse: () => run(writeRemoveFromSynapse),
    /** A ··· write's Undo; the day, the week and the pool read again. */
    undo: (done: { write: WorkSheetWrite; view: WorkSheetView }) =>
      undoWorkSheetWrite(server, done.view, done.write).finally(invalidate),
    linear: linearView,
    /** The account's name: Assignee on an issue assigned to Taylor (never written). */
    // [ASSUMPTION] The first name, as the board's "Taylor".
    assignee: account.data?.name.split(" ")[0] ?? null,
    assigneePhoto: account.data?.photoUrl ?? null,
    /** A picked status and its consequence; "start" is the caller's (the work loop's). */
    setStatus: (stateId: string) => {
      const at = viewRef.current;
      const lin = linearRef.current;
      const status = lin?.statuses.find((row) => row.state.id === stateId);
      if (at === null || !lin || !status) return Promise.resolve(null);
      return writeStatus(server, at, status, lin.done).finally(invalidate);
    },
    setPriority: (priority: number) =>
      linearOnly((v) => writePriority(server, v, priority)),
    setDescription: (description: string) =>
      linearOnly((v) => writeDescription(server, v, description)),
    retryLinear: (writeId: string) =>
      retryLinear(server, writeId).finally(invalidate),
    /** Not today: the date's session off, with its Undo. */
    notToday: () => linearOnly((v) => writeNotToday(server, v)),
    /** Unlink from Linear: nothing asked, nothing written to Linear; Undo restores. */
    unlink: () => linearOnly((v) => writeUnlink(server, v)),
    undoPlanner: (write: PlannerWrite) =>
      server.undo(write.undo).finally(invalidate),
    /**
     * Link a Linear issue (USE-68): Linear's state, the open issues from the
     * snapshot on the device (no request while typing), and the link.
     */
    linearConnected:
      linear.data === undefined ? null : linear.connections.length > 0,
    linearPending: linear.isPending,
    linkList: (tab: string = ALL_TAB, query = "") =>
      linear.data === undefined || today === undefined
        ? null
        : deriveLinkList({
            linear: linear.data,
            workItems: today.records.workItems,
            slots: today.records.slots,
            dateKey,
            tab,
            query,
            words: { onToday: ITEM_SHEET_COPY.link.onToday },
          }),
    link: (pick: { connectionId: string; issueId: string }) => {
      const at = viewRef.current;
      if (at === null || linear.data === undefined) {
        return Promise.resolve(null);
      }
      return writeLink(server, at, pick, linear.data).finally(invalidate);
    },
    /** The link's Undo: the item exactly as it was, the description sent back. */
    undoLink: (written: LinkWrite) =>
      undoLink(server, written).finally(invalidate),
  };

  function linearOnly<T>(
    write: (v: WorkSheetView) => Promise<T>,
  ): Promise<T | null> {
    const at = viewRef.current;
    if (at === null) return Promise.resolve(null);
    return write(at).finally(invalidate);
  }
}

/** The next place in that day's block, after its own slots. */
function sortAfter(
  days: readonly SetUpDay[] | undefined,
  place: { dateKey: string; blockId: string },
): number {
  const day = days?.find((row) => row.date === place.dateKey);
  const block = day?.blocks.find((entry) => entry.block.id === place.blockId);
  return (
    (block?.slots ?? []).reduce(
      (top, slot) => Math.max(top, slot.sortOrder),
      -1,
    ) + 1
  );
}
