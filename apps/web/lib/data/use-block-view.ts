"use client";

import type { IconValue } from "@syn/types";
import { reflowItems, weekdayIndex, weekKeyOf, type Reflow } from "@syn/utils";
import type { DayEventRecord } from "@syn/validators";
import {
  deriveSetUpDay,
  type SetUpBlock,
  type SetUpDay,
} from "./use-set-up-day";
import { useWeekQuery } from "./use-week";
import type { WeekRecords } from "./week-records";

/**
 * Block view's data (USE-36): one block on a date or a usual weekday, its
 * items in the day's order with their planned starts from `reflowItems`
 * around the day events that fall inside it. Read from the week's query, so
 * a write anywhere in set-up shows here at once.
 */

/**
 * One row of the block (USE-48): a set item, or the date's own item, with
 * its slot on the date when it has one. Transitions are bands, not rows.
 */
export interface BlockViewItem {
  /** The block item's id. */
  id: string;
  title: string;
  /** The planned length: the slot's, else the item's. */
  lengthMin: number | null;
  atTime: string | null;
  /** The planned start, "HH:MM", from `reflowItems`. */
  startsAt: string;
  /** The date's place: the slot's order, else the item's. */
  sortOrder: number;
  slotId: string | null;
  done: boolean;
  /** The date's own item (added from the day), not the weekday's. */
  onDate: string | null;
  /** The item's icon (USE-49: editing draws it on every row). */
  icon: IconValue | null;
  /** A drive in the flow: editing draws it as an italic row (USE-49). */
  isTransition: boolean;
}

export interface BlockView {
  block: SetUpBlock;
  /** The rows in the day's order, each with its planned start. */
  items: BlockViewItem[];
  /** Events whose time falls inside the block (D-USE-31), pinned as bands. */
  events: DayEventRecord[];
  reflow: Reflow;
  day: SetUpDay;
}

export type BlockViewRef = (
  { blockId: string; date: string } | { blockId: string; weekday: number }
) & {
  /** Transitions as rows, as editing draws them (USE-49); the day leaves them out. */
  transitions?: boolean;
};

export function deriveBlockView(
  records: WeekRecords,
  blockId: string,
  weekday: number,
  transitions = false,
): BlockView | null {
  const day = deriveSetUpDay(records.days[weekday]!, records.timeZone);
  const block = day.blocks.find((b) => b.block.id === blockId);
  if (!block) return null;
  const events = day.events.filter(
    (event) =>
      event.startsAt >= block.startsAt && event.startsAt < block.endsAt,
  );
  const rows = block.items.map((item, index) => {
    const slot = block.slots.find((row) => row.blockItemId === item.id);
    return {
      item,
      slot: slot ?? null,
      sortOrder: slot?.sortOrder ?? index,
      lengthMin: slot?.lengthMin ?? item.lengthMin,
    };
  });
  const reflow = reflowRows(block, rows, events);
  const startOf = new Map(reflow.placed.map((p) => [p.id, p.startsAt]));
  return {
    block,
    items: rows
      .filter(({ item }) => transitions || !item.isTransition)
      .map(({ item, slot, sortOrder, lengthMin }) => ({
        id: item.id,
        title: item.title,
        lengthMin,
        atTime: item.atTime,
        startsAt: startOf.get(item.id) ?? block.startsAt,
        sortOrder,
        slotId: slot?.id ?? null,
        done: slot?.doneAt != null,
        onDate: item.onDate,
        icon: item.icon,
        isTransition: item.isTransition,
      })),
    events,
    reflow,
    day,
  };
}

function reflowRows(
  block: SetUpBlock,
  rows: readonly {
    item: { id: string; atTime: string | null };
    lengthMin: number | null;
  }[],
  events: readonly DayEventRecord[],
): Reflow {
  return reflowItems({
    startsAt: block.startsAt,
    endsAt: block.endsAt,
    items: rows.map(({ item, lengthMin }) => ({
      id: item.id,
      lengthMin,
      atTime: item.atTime,
    })),
    bands: events,
  });
}

/**
 * The rows in another order, their times flowed again (USE-48): a drop
 * shown before it saves, and Edit's held drag. A row `ids` does not name
 * keeps its place after the named ones.
 */
export function inOrderOf(
  view: BlockView,
  ids: readonly string[],
): { items: BlockViewItem[]; reflow: Reflow } {
  const rank = new Map(ids.map((id, index) => [id, index]));
  const ordered = [...view.items].sort(
    (a, b) =>
      (rank.get(a.id) ?? ids.length) - (rank.get(b.id) ?? ids.length) ||
      a.sortOrder - b.sortOrder,
  );
  const reflow = reflowRows(
    view.block,
    ordered.map((row) => ({ item: row, lengthMin: row.lengthMin })),
    view.events,
  );
  const startOf = new Map(reflow.placed.map((p) => [p.id, p.startsAt]));
  return {
    items: ordered.map((row) => ({
      ...row,
      startsAt: startOf.get(row.id) ?? row.startsAt,
    })),
    reflow,
  };
}

/**
 * The rows as the rail reads them (USE-49; C-USE-block-view-kind-1): by
 * planned start, so a set-time item keeps its place as well as its time
 * while the others re-flow around it; ties keep the given order.
 */
export function inTimeOrder<T extends { startsAt: string }>(
  rows: readonly T[],
): T[] {
  return rows
    .map((row, index) => ({ row, index }))
    .sort(
      (a, b) =>
        a.row.startsAt.localeCompare(b.row.startsAt) || a.index - b.index,
    )
    .map(({ row }) => row);
}

/** Null `view` once read means the block is not on that day. */
export function useBlockView(ref: BlockViewRef) {
  const dated = "date" in ref;
  const week = dated ? weekKeyOf(ref.date) : "usual";
  const weekday = dated ? weekdayIndex(ref.date) : ref.weekday;
  const query = useWeekQuery(week, (records) =>
    deriveBlockView(records, ref.blockId, weekday, ref.transitions === true),
  );
  return { ...query, view: query.data };
}
