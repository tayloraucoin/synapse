import {
  blockItemRecord,
  blockRecord,
  dayBoundsRecord,
  dayEventRecord,
  slotRecord,
  workItemRecord,
} from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { emptyRecords } from "./base-day";
import type { Scenario } from "./index";

/**
 * Setting up the days (USE-36): the usual week as usual-week.md draws it,
 * this week 12 to 18 Oct as the-week.md draws it, and the first day with
 * nothing set. The clock stands at Sunday 11 October, 21:10, so Monday 12
 * has not begun and This week is the default. Bracketed names are the
 * boards' placeholders.
 *
 * Every record is built through its schema's `parse`, as the base day's.
 */

export const SET_UP_NOW = "2026-10-11T21:10:00-04:00";

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

const DAY_CODES = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

/** Weekly on the given weekdays (Monday 0), from 1 October. */
function weekly(...weekdays: number[]): string {
  const days = weekdays.map((day) => DAY_CODES[day]).join(",");
  return `DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=${days}`;
}

const MON_FRI = [0, 1, 2, 3, 4];
const MON_THU = [0, 1, 2, 3];

/** Set-up ids count from 101, clear of the base day's. */
const id = (table: number, n: number) => fixtureId(table, 100 + n);

export const SET_UP_IDS = {
  blocks: {
    wellness: id(1, 1),
    training: id(1, 2),
    rest: id(1, 3),
    breakfast: id(1, 4),
    work: id(1, 5),
    lunch: id(1, 6),
    workAfternoon: id(1, 7),
    evening: id(1, 8),
    climbing: id(1, 9),
    dinner: id(1, 10),
    errandsFriday: id(1, 11),
    wellnessSaturday: id(1, 12),
    breakfastSaturday: id(1, 13),
    errandsSaturday: id(1, 14),
    lunchSaturday: id(1, 15),
    outWithFriends: id(1, 16),
    eveningSaturday: id(1, 17),
    sundayChecklist: id(1, 18),
    sundayReset: id(1, 19),
  },
  items: {
    peeAndWeigh: id(2, 1),
    water: id(2, 2),
    startColdBath: id(2, 3),
    meditate: id(2, 4),
    stretch: id(2, 5),
    driveToGym: id(2, 6),
    workout: id(2, 7),
    driveHome: id(2, 8),
  },
  workItems: {
    syncSpec: id(4, 1),
    paperHandoff: id(4, 2),
    retryBackoff: id(4, 3),
    linearBacklog: id(4, 4),
  },
  dentist: id(8, 1),
} as const;

const B = SET_UP_IDS.blocks;
const I = SET_UP_IDS.items;

type BlockSeed = {
  id: string;
  kind: string;
  name: string;
  startsAt: string;
  endsAt: string;
  rrule: string;
  fill?: string | null;
  checklist?: boolean;
  meal?: boolean;
};

function block(seed: BlockSeed) {
  return blockRecord.parse({
    ...stamps,
    icon: null,
    color: null,
    onDate: null,
    fill: null,
    checklist: false,
    meal: false,
    notify: false,
    archivedAt: null,
    ...seed,
  });
}

type ItemSeed = {
  id?: string;
  title: string;
  atTime?: string;
  lengthMin?: number;
  isTransition?: boolean;
};

/** A block's set items, in order; ids past the named ones count on. */
function items(blockId: string, seeds: ItemSeed[], from: number) {
  return seeds.map((seed, index) =>
    blockItemRecord.parse({
      ...stamps,
      id: seed.id ?? id(2, from + index),
      blockId,
      title: seed.title,
      icon: null,
      isTransition: seed.isTransition ?? false,
      atTime: seed.atTime ?? null,
      lengthMin: seed.lengthMin ?? null,
      meal: false,
      onDate: null,
      sortOrder: index,
    }),
  );
}

function bounds(n: number, weekday: number, upAt: string, lightsOut: string) {
  return dayBoundsRecord.parse({
    ...stamps,
    id: fixtureId(0, 50 + n),
    weekday,
    onDate: null,
    upAt,
    lightsOut,
  });
}

/** The weekday mornings both weeks share: Wellness to the afternoon's Work. */
function weekdayBlocks(days: number[]) {
  const training = days.filter((day) => day !== 2);
  return [
    block({
      id: B.wellness,
      kind: "wellness",
      name: "Wellness",
      startsAt: "07:05",
      endsAt: "08:00",
      rrule: weekly(...days),
      fill: "set_items",
      checklist: true,
    }),
    block({
      id: B.training,
      kind: "training",
      name: "Training",
      startsAt: "08:00",
      endsAt: "08:57",
      rrule: weekly(...training),
      fill: "set_items",
    }),
    block({
      id: B.rest,
      kind: "training",
      name: "Rest",
      startsAt: "08:00",
      endsAt: "08:57",
      rrule: weekly(2),
      fill: "set_items",
    }),
    block({
      id: B.breakfast,
      kind: "break",
      name: "Breakfast",
      startsAt: "09:00",
      endsAt: "09:30",
      rrule: weekly(...days),
      meal: true,
    }),
    block({
      id: B.work,
      kind: "work",
      name: "Work",
      startsAt: "09:30",
      endsAt: "12:00",
      rrule: weekly(...days),
      fill: "tasks_for_the_day",
    }),
    block({
      id: B.lunch,
      kind: "break",
      name: "Lunch",
      startsAt: "12:00",
      endsAt: "13:00",
      rrule: weekly(...days),
      meal: true,
    }),
    block({
      id: B.workAfternoon,
      kind: "work",
      name: "Work",
      startsAt: "13:00",
      endsAt: "15:00",
      rrule: weekly(...days),
      fill: "tasks_for_the_day",
    }),
  ];
}

function weekdayItems() {
  return [
    ...items(
      B.wellness,
      [
        { id: I.peeAndWeigh, title: "Pee and weigh" },
        { id: I.water, title: "Water" },
        { id: I.startColdBath, title: "Start the cold bath" },
        { id: I.meditate, title: "Meditate" },
        { id: I.stretch, title: "Stretch" },
      ],
      0,
    ),
    ...items(
      B.training,
      [
        {
          id: I.driveToGym,
          title: "Drive to the YMCA",
          isTransition: true,
          atTime: "08:00",
          lengthMin: 10,
        },
        { id: I.workout, title: "Workout: gym", lengthMin: 37 },
        {
          id: I.driveHome,
          title: "Drive home",
          isTransition: true,
          atTime: "08:47",
          lengthMin: 10,
        },
      ],
      0,
    ),
    ...items(B.rest, [{ title: "Abs" }, { title: "Yoga" }], 11),
  ];
}

function sundayChecklist() {
  // [ASSUMPTION] "One checklist, no times" is a checklist block over the whole date.
  return block({
    id: B.sundayChecklist,
    kind: "wellness",
    name: "Sunday checklist",
    startsAt: "00:00",
    endsAt: "24:00",
    rrule: weekly(6),
    fill: "set_items",
    checklist: true,
  });
}

/** usual-week.md's seven rows. */
export function setUpUsualRecords(): FixtureRecords {
  const blocks = [
    ...weekdayBlocks(MON_FRI),
    block({
      id: B.evening,
      kind: "evening",
      name: "Evening",
      startsAt: "21:30",
      endsAt: "22:30",
      rrule: weekly(...MON_FRI),
      fill: "set_items",
    }),
    block({
      id: B.climbing,
      kind: "life",
      name: "Climbing [placeholder]",
      startsAt: "19:00",
      endsAt: "21:00",
      rrule: weekly(1),
      fill: "set_items",
    }),
    block({
      id: B.dinner,
      kind: "life",
      name: "Dinner with friends [placeholder]",
      startsAt: "19:00",
      endsAt: "21:00",
      rrule: weekly(3),
      fill: "set_items",
    }),
    block({
      id: B.errandsFriday,
      kind: "todos",
      name: "Errands",
      startsAt: "17:30",
      endsAt: "19:00",
      rrule: weekly(4),
      fill: "from_todos",
    }),
    block({
      id: B.wellnessSaturday,
      kind: "wellness",
      name: "Wellness",
      startsAt: "08:05",
      endsAt: "09:30",
      rrule: weekly(5),
      fill: "set_items",
      checklist: true,
    }),
    block({
      id: B.breakfastSaturday,
      kind: "break",
      name: "Breakfast",
      startsAt: "09:30",
      endsAt: "10:00",
      rrule: weekly(5),
      meal: true,
    }),
    block({
      id: B.errandsSaturday,
      kind: "todos",
      name: "Errands",
      startsAt: "10:00",
      endsAt: "12:30",
      rrule: weekly(5),
      fill: "from_todos",
    }),
    block({
      id: B.lunchSaturday,
      kind: "break",
      name: "Lunch",
      startsAt: "12:30",
      endsAt: "13:30",
      rrule: weekly(5),
      meal: true,
    }),
    block({
      id: B.outWithFriends,
      kind: "life",
      name: "Out with friends [placeholder]",
      startsAt: "19:00",
      endsAt: "21:40",
      rrule: weekly(5),
      fill: "set_items",
    }),
    block({
      id: B.eveningSaturday,
      kind: "evening",
      name: "Evening",
      startsAt: "22:00",
      endsAt: "23:00",
      rrule: weekly(5),
      fill: "set_items",
    }),
    sundayChecklist(),
    block({
      id: B.sundayReset,
      kind: "todos",
      name: "Sunday reset",
      startsAt: "13:00",
      endsAt: "16:00",
      rrule: weekly(6),
      fill: "from_todos",
    }),
  ];
  const blockItems = [
    ...weekdayItems(),
    ...items(
      B.evening,
      [{ title: "Wind-down journal" }, { title: "Lights out" }],
      21,
    ),
    ...items(B.climbing, [{ title: "Climbing [placeholder]" }], 31),
    ...items(
      B.dinner,
      [
        {
          title: "Drive to Marco's [placeholder]",
          isTransition: true,
          atTime: "19:00",
          lengthMin: 15,
        },
        { title: "Dinner", lengthMin: 90 },
        {
          title: "Drive home",
          isTransition: true,
          atTime: "20:45",
          lengthMin: 15,
        },
      ],
      41,
    ),
    ...items(
      B.wellnessSaturday,
      [{ title: "Walk" }, { title: "Coffee outside" }, { title: "Meditate" }],
      51,
    ),
    ...items(
      B.eveningSaturday,
      [{ title: "Wind-down journal" }, { title: "Lights out" }],
      61,
    ),
    ...items(
      B.sundayChecklist,
      [{ title: "Plan the week" }, { title: "Laundry" }],
      71,
    ),
  ];
  return {
    ...emptyRecords(),
    blocks,
    blockItems,
    dayBounds: [
      ...MON_FRI.map((day) => bounds(day + 1, day, "07:00", "22:30")),
      bounds(6, 5, "08:00", "23:00"),
    ],
  };
}

/** the-week.md: 12 to 18 Oct, Monday slotted, Thursday's dentist, Fri 16 and Sat 17 not set. */
export function setUpThisWeekRecords(): FixtureRecords {
  const W = SET_UP_IDS.workItems;
  const workItems = [
    {
      id: W.syncSpec,
      title: "[Write the sync spec]",
      linearIdentifier: "ENG-123",
    },
    {
      id: W.paperHandoff,
      title: "[Review the Paper handoff]",
      linearIdentifier: null,
    },
    {
      id: W.retryBackoff,
      title: "[Fix the retry backoff]",
      linearIdentifier: "ENG-140",
    },
    {
      id: W.linearBacklog,
      title: "[Tidy the Linear backlog]",
      linearIdentifier: null,
    },
  ].map((item) =>
    workItemRecord.parse({
      ...stamps,
      notes: null,
      icon: null,
      size: null,
      clientId: null,
      lengthMinMin: null,
      lengthMaxMin: null,
      dueOn: null,
      parentWorkItemId: null,
      doneAt: null,
      doneSource: null,
      archivedAt: null,
      linearConnectionId: null,
      linearIssueId: null,
      ...item,
    }),
  );
  const tiers = [
    [W.syncSpec, "primary"],
    [W.paperHandoff, "primary"],
    [W.retryBackoff, "secondary"],
    [W.linearBacklog, "stretch"],
  ] as const;
  const slots = tiers.map(([workItemId, tier], index) =>
    slotRecord.parse({
      ...stamps,
      id: id(3, index + 1),
      blockId: B.work,
      onDate: "2026-10-12",
      skipped: false,
      sortOrder: index,
      blockItemId: null,
      todoId: null,
      workItemId,
      tier,
      lengthMin: null,
      tookMin: null,
      doneAt: null,
    }),
  );
  return {
    ...emptyRecords(),
    blocks: [...weekdayBlocks(MON_THU), sundayChecklist()],
    blockItems: [
      ...weekdayItems(),
      ...items(
        B.sundayChecklist,
        [{ title: "Plan the week" }, { title: "Laundry" }],
        71,
      ),
    ],
    workItems,
    slots,
    dayEvents: [
      dayEventRecord.parse({
        ...stamps,
        id: SET_UP_IDS.dentist,
        onDate: "2026-10-15",
        rrule: null,
        title: "Dentist [placeholder]",
        icon: null,
        startsAt: "14:00",
        endsAt: "15:00",
        tag: "personal",
        notes: null,
        color: null,
        clientId: null,
      }),
    ],
    dayBounds: MON_THU.map((day) => bounds(day + 1, day, "07:00", "22:30")),
  };
}

function setUp(
  name: string,
  records: () => FixtureRecords,
  options: Partial<Scenario> = {},
): () => Scenario {
  return () => ({
    name,
    now: SET_UP_NOW,
    records: records(),
    mode: "ready",
    ...options,
  });
}

export const SET_UP_SCENARIOS: Record<string, () => Scenario> = {
  "set-up-usual": setUp("set-up-usual", setUpUsualRecords),
  "set-up-this-week": setUp("set-up-this-week", setUpThisWeekRecords),
  "set-up-first-day": setUp("set-up-first-day", emptyRecords),
  // D-USE-82: the day's own controls are read-only; block writes wait.
  "set-up-offline": setUp("set-up-offline", setUpThisWeekRecords, {
    offline: true,
  }),
};
