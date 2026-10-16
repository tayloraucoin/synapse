import {
  blockItemRecord,
  blockRecord,
  dayBoundsRecord,
  journalEntryRecord,
  slotRecord,
} from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_DATE } from "./base-day";
import type { Scenario } from "./index";
import { NOW_IDS, nowDayRecords, onNowDay, type NowItemName } from "./now-day";
import { sunday, sundayRecords } from "./review-sunday";
import { mondayEvent, TODAY_WORK_IDS, todayWorkRecords } from "./today-desk";
import { mechanicTodo, TODO_SHEET_IDS } from "./todo-sheet";

/**
 * Wave 2's loose ends (USE-110), one scenario each:
 *
 * - `ready-go-not-yet-started`: Taylor's Monday at 6:58, readied before
 *   Wellness at 7:05 (ready-go/states/not-yet-started.md).
 * - `review-nothing-set-copy`: the loose Sunday with nothing set, its
 *   weekdays built; at `/days` it opens Copy from's picker on Sunday 18
 *   (sunday-nothing-set.md's Copy another day).
 * - `todo-repeats-custom`: the To-do sheet with Custom…'s step open
 *   (todo-sheet/states/repeats-open.md).
 * - `firing-still-firing`: the week's Monday at 12:20, in Lunch, [Portal
 *   sign-in] fired at 11:58 after 40 min worked (interactions/firing.md).
 * - `wind-down-journal` and `-empty`: the Monday at 21:40 in Wind-down, its
 *   Journal row ticked by one answer written, or unticked with none
 *   (close-the-day, DYN-18).
 *
 * Ids count from 1101. Bracketed words are placeholders.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

const ALL_WELLNESS: NowItemName[] = [
  "peeAndWeigh",
  "water",
  "startColdBath",
  "meditate",
  "coldBath",
];

const WEEKDAYS =
  "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR";

export const LOOSE_END_IDS = {
  windDown: fixtureId(1, 1101),
  items: { journal: fixtureId(2, 1101), lightsOut: fixtureId(2, 1102) },
  slots: { breakfast: fixtureId(3, 1101) },
  /** The usual week's bounds, Monday to Sunday. */
  bounds: [0, 1, 2, 3, 4, 5, 6].map((weekday) => fixtureId(0, 1101 + weekday)),
} as const;

/** The Monday readied at 6:57, before its first block. */
function readiedEarly(): FixtureRecords {
  const records = nowDayRecords([]);
  records.dayRecords = records.dayRecords.map((row) =>
    row.onDate === BASE_DATE
      ? { ...row, orientedAt: onNowDay("06:50"), readyAt: onNowDay("06:57") }
      : row,
  );
  return records;
}

/** Sunday with nothing set; the Monday's blocks on weekdays only, so the week is built. */
function nothingSetWithWeekdays(): FixtureRecords {
  const monday = nowDayRecords([]);
  return sundayRecords((records) => ({
    ...records,
    blocks: monday.blocks.map((block) => ({ ...block, rrule: WEEKDAYS })),
    blockItems: monday.blockItems,
    dayEvents: [],
    // Bounds on every usual day, as an oriented Sunday has: Set my days
    // opens on the day rather than asking for them.
    dayBounds: LOOSE_END_IDS.bounds.map((id, weekday) =>
      dayBoundsRecord.parse({
        ...stamps,
        id,
        weekday,
        onDate: null,
        upAt: "07:00",
        lightsOut: "22:30",
      }),
    ),
  }));
}

/**
 * The morning done and Breakfast eaten, then Wind-down, 21:00 to 22:00, with
 * Journal and Lights out [placeholder].
 */
function windDownRecords(answers: Record<string, string> | null) {
  const records = nowDayRecords(ALL_WELLNESS);
  const breakfast = slotRecord.parse({
    ...stamps,
    id: LOOSE_END_IDS.slots.breakfast,
    blockId: NOW_IDS.blocks.breakfast,
    onDate: BASE_DATE,
    skipped: false,
    sortOrder: 0,
    blockItemId: NOW_IDS.items.breakfast,
    todoId: null,
    workItemId: null,
    tier: null,
    lengthMin: null,
    tookMin: 30,
    doneAt: onNowDay("09:30"),
  });
  const windDown = blockRecord.parse({
    ...stamps,
    id: LOOSE_END_IDS.windDown,
    kind: "wind_down",
    name: "Wind-down",
    icon: null,
    color: null,
    rrule: null,
    onDate: BASE_DATE,
    startsAt: "21:00",
    endsAt: "22:00",
    fill: "set_items",
    checklist: false,
    meal: false,
    notify: false,
    archivedAt: null,
  });
  const items = [
    { id: LOOSE_END_IDS.items.journal, title: "Journal", min: 15 },
    {
      id: LOOSE_END_IDS.items.lightsOut,
      title: "Lights out [placeholder]",
      min: 5,
    },
  ].map((item, sortOrder) =>
    blockItemRecord.parse({
      ...stamps,
      id: item.id,
      blockId: windDown.id,
      title: item.title,
      icon: null,
      isTransition: false,
      atTime: null,
      lengthMin: item.min,
      meal: false,
      onDate: null,
      sortOrder,
    }),
  );
  return {
    ...records,
    blocks: [...records.blocks, windDown],
    blockItems: [...records.blockItems, ...items],
    slots: [...records.slots, breakfast],
    journalEntries:
      answers === null
        ? []
        : [journalEntryRecord.parse({ onDate: BASE_DATE, answers })],
  };
}

const S = TODAY_WORK_IDS.slots;

export const LOOSE_END_SCENARIOS: Record<string, () => Scenario> = {
  "ready-go-not-yet-started": () => ({
    name: "ready-go-not-yet-started",
    now: onNowDay("06:58"),
    records: readiedEarly(),
    mode: "ready",
  }),
  "review-nothing-set-copy": sunday(
    "review-nothing-set-copy",
    nothingSetWithWeekdays,
    { setUp: { week: "this", day: 6, copy: "picker" } },
  ),
  "todo-repeats-custom": () => ({
    name: "todo-repeats-custom",
    now: onNowDay("07:14"),
    records: {
      ...nowDayRecords(["peeAndWeigh", "water", "startColdBath"]),
      todos: [mechanicTodo()],
    },
    mode: "ready",
    view: { open: "todo-custom" },
  }),
  "firing-still-firing": () => ({
    name: "firing-still-firing",
    now: "2026-10-12T12:20:00-04:00",
    records: todayWorkRecords([
      mondayEvent(1, S.portal, "started", "11:18"),
      mondayEvent(2, S.portal, "prompt_sent", "11:58"),
    ]),
    mode: "ready",
  }),
  "wind-down-journal": () => ({
    name: "wind-down-journal",
    now: onNowDay("21:40"),
    records: windDownRecords({
      day_went: "Slow start, but the sync spec got written. [placeholder]",
    }),
    mode: "ready",
  }),
  "wind-down-journal-empty": () => ({
    name: "wind-down-journal-empty",
    now: onNowDay("21:40"),
    records: windDownRecords(null),
    mode: "ready",
  }),
};

/** The To-do sheet's to-do, for `?sheet=todo&id=`. */
export const LOOSE_END_TODO = TODO_SHEET_IDS.mechanic;
