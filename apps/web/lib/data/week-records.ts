import {
  addDays,
  dateKeyIn,
  defaultWeek,
  weekDates,
  weekdayIndex,
  weekKeyOf,
} from "@syn/utils";
import type { SetUpDayRead, WeekReadOutput } from "@syn/validators";

/**
 * What a set-up read returns (USE-36): a week of seven days as records. Its
 * types are `planner.week`'s output schema (USE-91), so the fixture server
 * and the router cannot drift; occurrences, strips and overlaps are derived
 * in the hooks' `select`, never stored.
 */

/** The usual week, or a dated week by its ISO key (`2026-W42`). */
export type WeekRef = "usual" | string;

/** One day of the set-up area: a usual weekday, or a date. */
export type DayRef = { weekday: number } | { date: string };

export type SetUpDayRecords = SetUpDayRead;

export type WeekRecords = WeekReadOutput;

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
