import { dayEventRecord, slotRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { PLACE_SHEET_SCENARIOS } from "./place-sheet";
import { POOL_SHEET_IDS } from "./pool-sheet";
import { SET_UP_IDS, SET_UP_NOW, type SetUpScenarioStart } from "./set-up";

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

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

/** This week's day ids count from 861. */
const id = (table: number, n: number) => fixtureId(table, 860 + n);

export const THIS_WEEK_DAY_IDS = {
  slots: { kes58Tue: id(3, 1), ald22Tue: id(3, 2) },
  dentist: id(8, 1),
} as const;

const TUE = "2026-10-13";
/** Wednesday 14, 21:10 in Toronto: Monday 12 is past. */
export const THIS_WEEK_PAST_NOW = "2026-10-14T21:10:00-04:00";

const W = POOL_SHEET_IDS.workItems;
const S = THIS_WEEK_DAY_IDS.slots;

function slot(
  slotId: string,
  workItemId: string,
  tier: "primary" | "secondary",
  sortOrder: number,
  lengthMin: number | null,
) {
  return slotRecord.parse({
    ...stamps,
    id: slotId,
    blockId: SET_UP_IDS.blocks.work,
    onDate: TUE,
    skipped: false,
    sortOrder,
    blockItemId: null,
    todoId: null,
    workItemId,
    tier,
    lengthMin,
    tookMin: null,
    doneAt: null,
  });
}

/** The board's Tuesday on the place sheet's week. */
export function thisWeekDayRecords(): FixtureRecords {
  const records = PLACE_SHEET_SCENARIOS["place-sheet"]!().records;
  return {
    ...records,
    slots: [
      ...records.slots,
      slot(S.kes58Tue, W.kes58, "primary", 40, null),
      slot(S.ald22Tue, W.ald22, "secondary", 41, 60),
    ],
    dayEvents: [
      ...records.dayEvents,
      dayEventRecord.parse({
        ...stamps,
        id: THIS_WEEK_DAY_IDS.dentist,
        onDate: TUE,
        rrule: null,
        title: "[Dentist]",
        icon: null,
        startsAt: "15:30",
        endsAt: "16:30",
        tag: "personal",
        notes: null,
        color: null,
        clientId: null,
      }),
    ],
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
