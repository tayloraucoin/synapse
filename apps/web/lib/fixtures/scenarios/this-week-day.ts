import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { PLACE_SHEET_SCENARIOS } from "./place-sheet";
import { SET_UP_NOW, type SetUpScenarioStart } from "./set-up";
import { THIS_WEEK_DAY_IDS, tuesdayRecords } from "./this-week-tuesday";

/**
 * This week's day on the phone (USE-81): the place sheet's week (USE-80:
 * [Case studies: Alder intro] in sessions Mon, Tue and Wed) with Tuesday 13
 * as the board draws it. Primary: the Alder intro's 10 min session ("2 of
 * 3") and [Booking: reschedule flow] (KES-58, 3 Medium, due Wed); Secondary:
 * [Brand site: case study template] (ALD-22) for an hour; Stretch empty; and
 * "15:30 [Dentist]" on its own. Tuesday's Work then runs to 12:40, 40 min
 * past its end at the top of the ranges. Sunday 11 at 21:10, so This week is
 * 12 to 18 October; `this-week-past` stands on Wednesday 14 and opens Monday.
 * Bracketed names are the boards' placeholders.
 */

/** Wednesday 14, 21:10 in Toronto: Monday 12 is past. */
export const THIS_WEEK_PAST_NOW = "2026-10-14T21:10:00-04:00";

export { THIS_WEEK_DAY_IDS };

/** The board's Tuesday on the place sheet's week (this-week-tuesday.ts). */
export function thisWeekDayRecords(): FixtureRecords {
  const records = PLACE_SHEET_SCENARIOS["place-sheet"]!().records;
  const tuesday = tuesdayRecords({ kes58: true });
  return {
    ...records,
    slots: [...records.slots, ...tuesday.slots],
    dayEvents: [...records.dayEvents, ...tuesday.dayEvents],
  };
}

export type ThisWeekDayScenarioName =
  | "this-week-day"
  | "this-week-no-work"
  | "this-week-past"
  | "this-week-loading"
  | "this-week-error"
  | "this-week-offline";

function thisWeekDay(
  name: ThisWeekDayScenarioName,
  setUp: SetUpScenarioStart,
  options: Partial<Scenario> = {},
): [string, () => Scenario] {
  return [
    name,
    () => ({
      name,
      now: SET_UP_NOW,
      records: thisWeekDayRecords(),
      mode: "ready",
      seen: ["install-offer"],
      setUp,
      ...options,
    }),
  ];
}

export const THIS_WEEK_DAY_SCENARIOS: Record<string, () => Scenario> =
  Object.fromEntries([
    thisWeekDay("this-week-day", { week: "this", day: 1 }),
    // Saturday 17: no Work block, Pool still opens.
    thisWeekDay("this-week-no-work", { week: "this", day: 5 }),
    thisWeekDay(
      "this-week-past",
      { week: "this", day: 0 },
      { now: THIS_WEEK_PAST_NOW },
    ),
    thisWeekDay(
      "this-week-loading",
      { week: "this", day: 1 },
      { regions: { setUpColumn: "loading" } },
    ),
    thisWeekDay(
      "this-week-error",
      { week: "this", day: 1 },
      { regions: { setUpColumn: "error" } },
    ),
    thisWeekDay(
      "this-week-offline",
      { week: "this", day: 1 },
      { offline: true },
    ),
  ]);
