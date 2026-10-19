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

// This week's key and dates moved to @syn/utils (USE-92), so the planner
// router reaches the same dates; kept here for their callers.
export { thisWeekDates, thisWeekKey } from "@syn/utils";
