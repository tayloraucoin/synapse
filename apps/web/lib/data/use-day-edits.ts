"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { IconValue, WorkTier } from "@syn/types";
import {
  clockFromMinutes,
  clockToMinutes,
  moveLater,
  type DayChange,
} from "@syn/utils";
import type { FixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { lateWakeOf, roomDayOf } from "./late-wake";
import { useDataSource } from "./source";
import type { TodayRecords } from "./today-records";
import {
  deriveItemSheet,
  undoItemWrite,
  writeItemLength,
  writeSwap,
  type ItemSheetServer,
  type ItemUndoStep,
} from "./use-item-sheet";
import { usePlannerWrites } from "./use-planner-writes";
import { ORIENT_LENGTH_MIN } from "./use-review-day";
import { todayQueryKey } from "./use-today";

/**
 * Review the day's edits (USE-37; review-the-day/states/first-edit.md,
 * "Adjusting in place"): swap, add, remove and reorder, each on one date
 * only, each with an Undo that puts back exactly what it changed. The usual
 * week, its blocks and items, never change here (note 18).
 *
 * TODAY ONLY, IN USE-14'S SHAPES. A swap is the set item left off the date
 * (a skipped slot) and the date's own copy (`onDate`) in its place, through
 * the Item sheet's `writeSwap`; the drives around it stay (D-USE-60 (1)). A
 * block that ended with its items ends with them after the swap, by the
 * date's `block_changes` row (D-USE-12: Swap names where the block ends). A
 * remove is a skipped slot, or a block's `block_changes` skip; an add is a
 * dated item, or a work item's slot on the date.
 *
 * Every call returns an undo token; `undo(token)` runs that edit's steps
 * back, last first. A token never expires, so a long morning of edits never
 * times out (C-USE-review-the-day-7).
 */

/** D-USE-81: an item with no length counts 5 minutes. */
const DEFAULT_LENGTH_MIN = 5;

/** The server calls the edits use, so a test drives the same code. */
export type DayEditsServer = ItemSheetServer &
  Pick<FixtureServer, "writeBlockChange" | "reorderItems" | "placeSlot">;

/** What a remove takes off the date. */
export type DayEditTarget =
  /** A whole block or meal: the date's `block_changes` skip. */
  | { kind: "block"; blockId: string }
  /** One item: a set item's id, the date's own copy, or a slot's id. */
  | { kind: "item"; id: string };

/** What an add puts on the date. */
export type DayAddition =
  | {
      kind: "item";
      title: string;
      lengthMin?: number;
      icon?: IconValue | null;
    }
  | { kind: "work"; workItemId: string; tier: WorkTier };

export interface DayEdit {
  undo: ItemUndoStep[];
  /** A swap's landing, for its Toaster: "Swapped for Yoga. Training ends 8:50." */
  swapped?: { item: string; block: string; endsAt: string };
  /** A removed block's name, for its Toaster. */
  removed?: string;
  /** A passed block moved later, for its Toaster: "Wellness moved to 8:15." */
  movedLater?: { block: string; startsAt: string };
}

function occurrenceOf(records: TodayRecords, blockId: string) {
  const today = deriveToday(records);
  const occurrence = today.occurrences.blocks.find(
    (entry) => entry.block.id === blockId,
  );
  if (!occurrence) throw new Error("That block is not on the date.");
  return { today, occurrence };
}

/** A bullet's id to its block item: a slot holding a set item names it. */
export function blockItemIdOf(
  records: TodayRecords,
  id: string,
): string | null {
  if (records.blockItems.some((item) => item.id === id)) return id;
  return records.slots.find((slot) => slot.id === id)?.blockItemId ?? null;
}

/** After the last of the block's rows on the date. */
function nextSortOrder(records: TodayRecords, blockId: string): number {
  const orders = [
    ...records.blockItems
      .filter(
        (item) =>
          item.blockId === blockId &&
          (item.onDate === null || item.onDate === records.date),
      )
      .map((item) => item.sortOrder),
    ...records.slots
      .filter((slot) => slot.blockId === blockId)
      .map((slot) => slot.sortOrder),
  ];
  return orders.reduce((top, order) => Math.max(top, order), -1) + 1;
}

/**
 * The length of a block's rows on the date, transitions included: set items
 * not left off, the date's own items, and what was pulled in.
 */
function rowsLengthMin(
  records: TodayRecords,
  blockId: string,
  swap?: { itemId: string; lengthMin: number },
): number {
  const slots = records.slots.filter((slot) => slot.blockId === blockId);
  const items = records.blockItems
    .filter(
      (item) =>
        item.blockId === blockId &&
        (item.onDate === null || item.onDate === records.date),
    )
    .flatMap((item) => {
      const slot = slots.find((row) => row.blockItemId === item.id);
      if (slot?.skipped) return [];
      if (item.id === swap?.itemId) return [swap.lengthMin];
      return [slot?.lengthMin ?? item.lengthMin ?? DEFAULT_LENGTH_MIN];
    });
  const pulled = slots
    .filter((slot) => slot.blockItemId === null && !slot.skipped)
    .map((slot) => slot.lengthMin ?? DEFAULT_LENGTH_MIN);
  return [...items, ...pulled].reduce((sum, length) => sum + length, 0);
}

/**
 * Swap (C-USE-review-the-day-after-swap-undo-1): `withId` from the item's
 * library in its place for the date; the rest of the block stays.
 */
export async function writeDaySwap(
  server: DayEditsServer,
  records: TodayRecords,
  id: string,
  withId: string,
): Promise<DayEdit> {
  const itemId = blockItemIdOf(records, id);
  const view =
    itemId === null ? null : deriveItemSheet(deriveToday(records), itemId);
  if (view === null) throw new Error("Nothing to swap there.");
  const pick = view.swap.find((row) => row.id === withId && !row.current);
  if (!pick) throw new Error("That is not in the library.");

  const { block } = view;
  const start = clockToMinutes(block.startsAt);
  const fitted =
    start + rowsLengthMin(records, block.id) === clockToMinutes(block.endsAt);
  const written = await writeSwap(server, view, pick);
  const undo = [...written.undo];
  let endsAt = block.endsAt;
  // A block that ended with its items ends with them still (D-USE-12).
  const after = clockFromMinutes(
    start +
      rowsLengthMin(records, block.id, {
        itemId: view.item.id,
        lengthMin: pick.lengthMin,
      }),
  );
  if (fitted && after !== block.endsAt) {
    const moved = await server.writeBlockChange({
      blockId: block.id,
      onDate: view.date,
      startsAt: block.startsAt,
      endsAt: after,
    });
    undo.push({ kind: "token", token: moved.undo });
    endsAt = after;
  }
  return {
    undo,
    swapped: { item: pick.title, block: block.name, endsAt },
  };
}

/** Add (a rail + or a block's own "Add to …"): on the date only. */
export async function writeDayAdd(
  server: DayEditsServer,
  records: TodayRecords,
  blockId: string,
  addition: DayAddition,
): Promise<DayEdit> {
  occurrenceOf(records, blockId);
  const sortOrder = nextSortOrder(records, blockId);
  if (addition.kind === "work") {
    const placed = await server.placeSlot({
      blockId,
      onDate: records.date,
      sortOrder,
      workItemId: addition.workItemId,
      tier: addition.tier,
    });
    return { undo: [{ kind: "token", token: placed.undo }] };
  }
  const written = await server.writeBlockItem({
    blockId,
    title: addition.title,
    icon: addition.icon ?? null,
    isTransition: false,
    atTime: null,
    lengthMin: addition.lengthMin ?? DEFAULT_LENGTH_MIN,
    meal: false,
    onDate: records.date,
    sortOrder,
  });
  return { undo: [{ kind: "token", token: written.undo }] };
}

/** Remove (a band swiped away, an item in the Block view): off the date only. */
export async function writeDayRemove(
  server: DayEditsServer,
  records: TodayRecords,
  target: DayEditTarget,
): Promise<DayEdit> {
  const date = records.date;
  if (target.kind === "block") {
    const { occurrence } = occurrenceOf(records, target.blockId);
    const off = await server.writeBlockChange({
      blockId: target.blockId,
      onDate: date,
      skipped: true,
    });
    return {
      undo: [{ kind: "token", token: off.undo }],
      removed: occurrence.block.name,
    };
  }
  const itemId = blockItemIdOf(records, target.id);
  if (itemId !== null) {
    // A set item is left off the date; the date's own copy goes.
    const off = await server.removeBlockItem({ id: itemId, date });
    return { undo: [{ kind: "token", token: off.undo }] };
  }
  // A to-do or work item pulled into the block: its slot is skipped.
  const slot = records.slots.find((row) => row.id === target.id);
  if (!slot) throw new Error("Nothing to remove there.");
  await server.writeSlots({ id: slot.id, skipped: true });
  return {
    undo: [{ kind: "slot", id: slot.id, change: { skipped: slot.skipped } }],
  };
}

/** Reorder (the Block view): the date's slots and own items take the order. */
export async function writeDayReorder(
  server: DayEditsServer,
  records: TodayRecords,
  blockId: string,
  ids: string[],
): Promise<DayEdit> {
  const moved = await server.reorderItems({ blockId, ids, date: records.date });
  return { undo: [{ kind: "token", token: moved.undo }] };
}

/**
 * The engine's today-only changes, written one by one, each undoable. A
 * block's are its date's `block_changes` row; a row's go the Item sheet's
 * way (USE-41): off is Not today for a set item (a drive that goes with its
 * workout too) and skipped for a pulled slot; a length is the slot's for
 * the date.
 */
export async function writeDayChanges(
  server: DayEditsServer,
  records: TodayRecords,
  changes: readonly DayChange[],
): Promise<ItemUndoStep[]> {
  const undo: ItemUndoStep[] = [];
  const today = deriveToday(records);
  for (const change of changes) {
    if (change.kind === "slot_on") {
      throw new Error("A row comes back through its write's own Undo.");
    }
    if (change.kind === "slot_length" || change.kind === "slot_off") {
      const itemId = blockItemIdOf(records, change.slotId);
      if (itemId !== null && change.kind === "slot_off") {
        const off = await server.removeBlockItem({
          id: itemId,
          date: records.date,
        });
        undo.push({ kind: "token", token: off.undo });
        continue;
      }
      const view = itemId === null ? null : deriveItemSheet(today, itemId);
      if (view !== null && change.kind === "slot_length") {
        const written = await writeItemLength(server, view, change.lengthMin);
        undo.push(...written.undo);
        continue;
      }
      const slot = records.slots.find((row) => row.id === change.slotId);
      if (!slot) throw new Error("Nothing to change there.");
      if (change.kind === "slot_off") {
        await server.writeSlots({ id: slot.id, skipped: true });
        undo.push({ kind: "slot", id: slot.id, change: { skipped: false } });
      } else {
        await server.writeSlots({ id: slot.id, lengthMin: change.lengthMin });
        undo.push({
          kind: "slot",
          id: slot.id,
          change: { lengthMin: slot.lengthMin },
        });
      }
      continue;
    }
    const written = await server.writeBlockChange({
      blockId: change.blockId,
      onDate: change.onDate,
      ...(change.kind === "block_off" ? { skipped: true } : {}),
      ...(change.kind === "block_times"
        ? { startsAt: change.startsAt, endsAt: change.endsAt }
        : {}),
    });
    undo.push({ kind: "token", token: written.undo });
  }
  return undo;
}

/**
 * Move later (USE-38; D-USE-69): a block the late wake passed comes back
 * right after Orient at the wake, keeping its length, and the blocks after
 * it slide by that length, through the engine's `moveLater`. Today only.
 */
export async function writeDayMoveLater(
  server: DayEditsServer,
  records: TodayRecords,
  blockId: string,
): Promise<DayEdit> {
  const today = deriveToday(records);
  const wake = lateWakeOf(today);
  if (wake === null) throw new Error("The day started as planned.");
  const day = roomDayOf(today);
  const result = moveLater(day, {
    blockId,
    orientEnd: wake.wokeAt + ORIENT_LENGTH_MIN,
  });
  if (result.kind !== "plan") throw new Error("That block can't move later.");
  const name =
    today.occurrences.blocks.find((entry) => entry.block.id === blockId)?.block
      .name ?? "";
  return {
    undo: await writeDayChanges(server, records, result.plan.changes),
    movedLater: { block: name, startsAt: result.plan.summary.startsAt },
  };
}

/* ---------------------------------------------------------------- hook -- */

/** Each edit's steps by token, for the life of the page. */
const edits = new Map<string, ItemUndoStep[]>();

export interface DayEditResult extends Omit<DayEdit, "undo"> {
  token: string;
}

/**
 * The edits on `dateKey`. Writes run one at a time, each on the day as the
 * last one left it; the planner's go through its queue, so offline they wait
 * on the device and land in order (D-USE-64). `onEdit` runs after each edit
 * lands (the first-change line), never after an Undo.
 */
export function useDayEdits(
  dateKey: string,
  { onEdit }: { onEdit?: () => void } = {},
) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const planner = usePlannerWrites();
  const scenario = source.scenario.name;

  const server: DayEditsServer = {
    writeSlots: source.server.writeSlots,
    removeSlot: source.server.removeSlot,
    writeBlockItem: planner.writeBlockItem,
    editBlockItem: planner.editBlockItem,
    removeBlockItem: planner.removeBlockItem,
    writeBlockChange: planner.writeBlockChange,
    reorderItems: planner.reorderItems,
    placeSlot: planner.placeSlot,
    undo: planner.undo,
  };
  const serverRef = React.useRef(server);
  serverRef.current = server;
  const onEditRef = React.useRef(onEdit);
  onEditRef.current = onEdit;
  const chain = React.useRef<Promise<unknown>>(Promise.resolve());

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: todayQueryKey(scenario) });
  }

  function run<E extends DayEdit>(
    write: (server: DayEditsServer, records: TodayRecords) => Promise<E>,
  ): Promise<Omit<E, "undo"> & { token: string }> {
    const next = chain.current.then(async () => {
      const records = await source.server.readToday(dateKey);
      const { undo, ...rest } = await write(serverRef.current, records);
      const token = crypto.randomUUID();
      edits.set(token, undo);
      await refresh();
      onEditRef.current?.();
      return { token, ...rest };
    });
    chain.current = next.catch(() => {});
    return next;
  }

  return {
    swap: (id: string, withId: string) =>
      run((s, records) => writeDaySwap(s, records, id, withId)),
    add: (blockId: string, addition: DayAddition) =>
      run((s, records) => writeDayAdd(s, records, blockId, addition)),
    remove: (target: DayEditTarget) =>
      run((s, records) => writeDayRemove(s, records, target)),
    reorder: (blockId: string, ids: string[]) =>
      run((s, records) => writeDayReorder(s, records, blockId, ids)),
    moveLater: (blockId: string) =>
      run((s, records) => writeDayMoveLater(s, records, blockId)),
    /** Any edit built on the day as it reads then (USE-41's room plans). */
    write: <E extends DayEdit>(
      edit: (server: DayEditsServer, records: TodayRecords) => Promise<E>,
    ) => run(edit),
    /** An edit's Undo: its steps back, after any write still out. Once only. */
    undo: async (token: string) => {
      const steps = edits.get(token);
      if (steps === undefined) return;
      edits.delete(token);
      await chain.current;
      await undoItemWrite(serverRef.current, steps);
      await refresh();
    },
  };
}
