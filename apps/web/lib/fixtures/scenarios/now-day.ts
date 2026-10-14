import {
  blockItemRecord,
  blockRecord,
  slotRecord,
  todoRecord,
} from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_DATE, emptyRecords } from "./base-day";

/**
 * Taylor's Monday (USE-16; D-USE-8), the day Now's captures are drawn on:
 * Wellness 7:05 to 8:00 with its five items, Training, Breakfast and Work.
 * Same date and zone as the base day; ids count from 101 so they never meet
 * the base day's.
 *
 * `nowDayRecords(done)` takes the Wellness items already checked, each done
 * at its planned end with its planned length, as a plain Done records it.
 */

/** An instant on the date, `HH:MM` in Toronto (EDT, -04:00). */
export function onNowDay(time: string): string {
  return `${BASE_DATE}T${time}:00-04:00`;
}

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };
const DAILY = "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=DAILY";
const WEEKDAYS =
  "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR";

export const NOW_IDS = {
  blocks: {
    wellness: fixtureId(1, 101),
    training: fixtureId(1, 102),
    breakfast: fixtureId(1, 103),
    work: fixtureId(1, 104),
  },
  items: {
    peeAndWeigh: fixtureId(2, 101),
    water: fixtureId(2, 102),
    startColdBath: fixtureId(2, 103),
    meditate: fixtureId(2, 104),
    coldBath: fixtureId(2, 105),
  },
  slots: {
    peeAndWeigh: fixtureId(3, 101),
    water: fixtureId(3, 102),
    startColdBath: fixtureId(3, 103),
    meditate: fixtureId(3, 104),
    coldBath: fixtureId(3, 105),
  },
  todos: { mechanic: fixtureId(6, 101), pharmacy: fixtureId(6, 102) },
} as const;

export type NowItemName = keyof typeof NOW_IDS.items;

const B = NOW_IDS.blocks;

const blocks = [
  {
    id: B.wellness,
    kind: "wellness",
    name: "Wellness",
    startsAt: "07:05",
    endsAt: "08:00",
    rrule: DAILY,
    fill: "set_items",
  },
  {
    id: B.training,
    kind: "training",
    name: "Training",
    startsAt: "08:00",
    endsAt: "08:57",
    rrule: WEEKDAYS,
    fill: "set_items",
  },
  {
    id: B.breakfast,
    kind: "break",
    name: "Breakfast",
    startsAt: "09:00",
    endsAt: "09:30",
    rrule: DAILY,
    fill: null,
    meal: true,
  },
  {
    id: B.work,
    kind: "work",
    name: "Work",
    startsAt: "09:30",
    endsAt: "12:00",
    rrule: WEEKDAYS,
    fill: "tasks_for_the_day",
  },
].map((block) =>
  blockRecord.parse({
    ...stamps,
    icon: null,
    color: null,
    onDate: null,
    checklist: false,
    meal: false,
    notify: false,
    archivedAt: null,
    ...block,
  }),
);

/** The Wellness items in order, with their glyphs and lengths. */
const WELLNESS: {
  name: NowItemName;
  title: string;
  glyph: string;
  lengthMin: number;
  /** The planned end, when a fixture checks it. */
  endsAt: string;
}[] = [
  {
    name: "peeAndWeigh",
    title: "Pee and weigh",
    glyph: "heart-pulse",
    lengthMin: 2,
    endsAt: "07:07",
  },
  {
    name: "water",
    title: "Water",
    glyph: "glass-water",
    lengthMin: 1,
    endsAt: "07:08",
  },
  {
    name: "startColdBath",
    title: "Start the cold bath",
    glyph: "bath",
    lengthMin: 2,
    endsAt: "07:10",
  },
  {
    name: "meditate",
    title: "Meditate",
    glyph: "brain",
    lengthMin: 10,
    endsAt: "07:20",
  },
  {
    name: "coldBath",
    title: "Cold bath",
    glyph: "droplets",
    lengthMin: 10,
    endsAt: "07:30",
  },
];

const blockItems = WELLNESS.map((item, sortOrder) =>
  blockItemRecord.parse({
    ...stamps,
    id: NOW_IDS.items[item.name],
    blockId: B.wellness,
    title: item.title,
    icon: { kind: "curated", value: item.glyph, colorKey: "leaf" },
    isTransition: false,
    atTime: null,
    lengthMin: item.lengthMin,
    meal: false,
    onDate: null,
    sortOrder,
  }),
);

const todos = [
  {
    id: NOW_IDS.todos.mechanic,
    title: "Call the mechanic about the brakes",
    type: "call",
  },
  {
    id: NOW_IDS.todos.pharmacy,
    title: "Pick up the prescription",
    type: "errand",
  },
].map((todo) =>
  todoRecord.parse({
    ...stamps,
    icon: null,
    lengthMin: null,
    notes: null,
    onDate: BASE_DATE,
    rrule: null,
    remindAt: null,
    remindOn: null,
    doneAt: null,
    archivedAt: null,
    ...todo,
  }),
);

/** The Monday with `done` checked as planned; nothing else touched. */
export function nowDayRecords(done: readonly NowItemName[]): FixtureRecords {
  const slots = WELLNESS.flatMap((item, sortOrder) =>
    done.includes(item.name)
      ? [
          slotRecord.parse({
            ...stamps,
            id: NOW_IDS.slots[item.name],
            blockId: B.wellness,
            onDate: BASE_DATE,
            skipped: false,
            sortOrder,
            blockItemId: NOW_IDS.items[item.name],
            todoId: null,
            workItemId: null,
            tier: null,
            lengthMin: null,
            tookMin: item.lengthMin,
            doneAt: onNowDay(item.endsAt),
          }),
        ]
      : [],
  );
  return structuredClone({
    ...emptyRecords(),
    blocks,
    blockItems,
    todos,
    slots,
  });
}
