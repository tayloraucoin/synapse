import {
  addDays,
  dateKeyIn,
  defaultWeek,
  weekDates,
  weekdayIndex,
  weekKeyOf,
} from "@syn/utils";
import type {
  BlockChangeRecord,
  BlockItemRecord,
  BlockRecord,
  DayBoundsRecord,
  DayEventRecord,
  SlotRecord,
  TodoRecord,
  WorkItemRecord,
} from "@syn/validators";

/**
 * What a set-up read returns (USE-36), from the fixture server now and the
 * routers in wave 3: a week of seven days as records. Every list is a
 * `@syn/validators` record type; occurrences, strips and overlaps are
 * derived in the hooks' `select`, never stored.
 */

/** The usual week, or a dated week by its ISO key (`2026-W42`). */
export type WeekRef = "usual" | string;

/** One day of the set-up area: a usual weekday, or a date. */
export type DayRef = { weekday: number } | { date: string };

export interface SetUpDayRecords {
  /** Monday 0 … Sunday 6. */
  weekday: number;
  /** The date in a dated week; null in the usual week. */
  date: string | null;
  /** The date's own row, else its weekday's; null when not set. */
  bounds: DayBoundsRecord | null;
  /** The blocks that may run: the weekday's usual ones, or the date's. */
  blocks: BlockRecord[];
  /** The date's block changes; none in the usual week. */
  changes: BlockChangeRecord[];
  /**
   * The blocks' items: every-date items, and on a date its own; a set item
   * skipped on the date is left out.
   */
  items: BlockItemRecord[];
  /** The date's slots, skipped ones included; none in the usual week. */
  slots: SlotRecord[];
  /** Events on the date, or repeating on the weekday. */
  events: DayEventRecord[];
  /** The work items and to-dos the date's slots hold. */
  workItems: WorkItemRecord[];
  todos: TodoRecord[];
}

export interface WeekRecords {
  week: WeekRef;
  timeZone: string;
  /** Seven days, Monday first. */
  days: SetUpDayRecords[];
}

/**
 * This week's key: the week of today, and from Sunday 18:00 the coming one,
 * as Set my days opens on it (`defaultWeek`). [ASSUMPTION] The same turn
 * names the week a usual change reaches.
 */
export function thisWeekKey(now: Date, timeZone: string): string {
  const today = dateKeyIn(now, timeZone);
  const turned =
    weekdayIndex(today) === 6 && defaultWeek(now, timeZone) === "this";
  return weekKeyOf(turned ? addDays(today, 1) : today);
}

export function thisWeekDates(now: Date, timeZone: string): string[] {
  return weekDates(thisWeekKey(now, timeZone));
}
