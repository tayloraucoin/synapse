"use client";

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

export interface BlockView {
  block: SetUpBlock;
  /** Events whose time falls inside the block (D-USE-31), pinned as bands. */
  events: DayEventRecord[];
  reflow: Reflow;
  day: SetUpDay;
}

export type BlockViewRef =
  { blockId: string; date: string } | { blockId: string; weekday: number };

export function deriveBlockView(
  records: WeekRecords,
  blockId: string,
  weekday: number,
): BlockView | null {
  const day = deriveSetUpDay(records.days[weekday]!, records.timeZone);
  const block = day.blocks.find((b) => b.block.id === blockId);
  if (!block) return null;
  const events = day.events.filter(
    (event) =>
      event.startsAt >= block.startsAt && event.startsAt < block.endsAt,
  );
  return {
    block,
    events,
    reflow: reflowItems({
      startsAt: block.startsAt,
      endsAt: block.endsAt,
      items: block.items.map((item) => ({
        id: item.id,
        lengthMin: item.lengthMin,
        atTime: item.atTime,
      })),
      bands: events,
    }),
    day,
  };
}

/** Null `view` once read means the block is not on that day. */
export function useBlockView(ref: BlockViewRef) {
  const dated = "date" in ref;
  const week = dated ? weekKeyOf(ref.date) : "usual";
  const weekday = dated ? weekdayIndex(ref.date) : ref.weekday;
  const query = useWeekQuery(week, (records) =>
    deriveBlockView(records, ref.blockId, weekday),
  );
  return { ...query, view: query.data };
}
