import {
  blockChangeRecord,
  blockItemRecord,
  blockRecord,
  clientRecord,
  dayBoundsRecord,
  dayEventRecord,
  slotRecord,
  workItemRecord,
} from "@syn/validators";
import type { SetUpScenarioStart } from "@/lib/data/set-up-start";
import { fixtureId } from "../ids";
import {
  INTEGRATION_IDS,
  integrationId,
  integrationRecords,
} from "../integrations/workspaces";
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

export type { SetUpScenarioStart };

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

const BYDAY = /BYDAY=([A-Z,]+)/;

/**
 * The usual week kept to some weekdays: every rule loses the others, a block
 * left with none goes, and so do the other days' bounds.
 */
function keepWeekdays(
  records: FixtureRecords,
  weekdays: readonly number[],
): FixtureRecords {
  const codes = new Set(weekdays.map((day) => DAY_CODES[day]));
  const blocks = records.blocks.flatMap((row) => {
    const match = BYDAY.exec(row.rrule ?? "");
    if (!match) return [row];
    const kept = match[1]!.split(",").filter((code) => codes.has(code));
    if (kept.length === 0) return [];
    return [
      { ...row, rrule: row.rrule!.replace(BYDAY, `BYDAY=${kept.join(",")}`) },
    ];
  });
  const ids = new Set(blocks.map((row) => row.id));
  return {
    ...records,
    blocks,
    blockItems: records.blockItems.filter((row) => ids.has(row.blockId)),
    dayBounds: records.dayBounds.filter(
      (row) => row.weekday === null || weekdays.includes(row.weekday),
    ),
  };
}

/** The usual week with Thursday's blocks gone and its bounds kept (empty-day.md). */
function usualEmptyThursdayRecords(): FixtureRecords {
  const usual = setUpUsualRecords();
  const others = keepWeekdays(usual, [0, 1, 2, 4, 5, 6]);
  return { ...others, dayBounds: usual.dayBounds };
}

/**
 * Copy from's week (USE-45; empty-day.md, copy-picker.md): Monday to
 * Wednesday and Sunday built, Sunday one checklist with no times; Thursday
 * with its bounds and no blocks; Friday and Saturday not set.
 */
function copyFromRecords(): FixtureRecords {
  const usual = setUpUsualRecords();
  const kept = keepWeekdays(usual, [0, 1, 2, 6]);
  return {
    ...kept,
    blocks: kept.blocks.filter((row) => row.id !== B.sundayReset),
    dayBounds: usual.dayBounds.filter(
      (row) => row.weekday !== null && row.weekday <= 3,
    ),
  };
}

/** copy-picker.md, replace-confirm.md: the same week, Thursday part built with Wellness and Work. */
function thursdayPartBuiltRecords(): FixtureRecords {
  const records = copyFromRecords();
  const onThursday = new Set<string>([B.wellness, B.work]);
  return {
    ...records,
    blocks: records.blocks.map((row) =>
      onThursday.has(row.id) && row.rrule !== null
        ? { ...row, rrule: row.rrule.replace(BYDAY, "BYDAY=$1,TH") }
        : row,
    ),
  };
}

/** install-offer.md: Monday the only day set, just saved. */
function mondayOnlyRecords(): FixtureRecords {
  return keepWeekdays(setUpUsualRecords(), [0]);
}

/**
 * Set my days' frames (USE-39), each by `?state=`. The install offer is a
 * one-time line, so every frame but its own counts it seen. [ASSUMPTION]
 * The contract's saving, saved, not-saved, loading and error take a `days-`
 * prefix: loading and error are the app's own and not-saved the account's.
 */
function days(
  name: string,
  records: () => FixtureRecords,
  setUp: SetUpScenarioStart,
  options: Partial<Scenario> = {},
): [string, () => Scenario] {
  return [
    name,
    () => ({
      name,
      now: SET_UP_NOW,
      records: records(),
      mode: "ready",
      seen: ["install-offer"],
      setUp,
      ...options,
    }),
  ];
}

/* -------------------------------------------- This week's frames (USE-42) -- */

const emoji = (value: string) => ({ kind: "emoji" as const, value });

/** item-icons.md: each item's icon; work items their Linear project's emoji [placeholder]. */
const ITEM_ICONS: Record<string, string> = {
  [I.peeAndWeigh]: "⚖️",
  [I.water]: "💧",
  [I.startColdBath]: "🚿",
  [I.meditate]: "🧘",
  [I.stretch]: "🤸",
  [I.driveToGym]: "🚗",
  [I.workout]: "🏋️",
  [I.driveHome]: "🚗",
};
const WORK_ICONS: Record<string, string> = {
  [SET_UP_IDS.workItems.syncSpec]: "🛰️",
  [SET_UP_IDS.workItems.paperHandoff]: "🎨",
  [SET_UP_IDS.workItems.retryBackoff]: "🛰️",
  [SET_UP_IDS.workItems.linearBacklog]: "💼",
};

/** The same records with the items' icons set. */
function withIcons(records: FixtureRecords): FixtureRecords {
  return {
    ...records,
    blockItems: records.blockItems.map((row) =>
      ITEM_ICONS[row.id] ? { ...row, icon: emoji(ITEM_ICONS[row.id]!) } : row,
    ),
    workItems: records.workItems.map((row) =>
      WORK_ICONS[row.id] ? { ...row, icon: emoji(WORK_ICONS[row.id]!) } : row,
    ),
  };
}

function blockChange(
  n: number,
  blockId: string,
  onDate: string,
  startsAt: string,
  endsAt: string,
) {
  return blockChangeRecord.parse({
    ...stamps,
    id: fixtureId(9, 100 + n),
    blockId,
    onDate,
    skipped: false,
    startsAt,
    endsAt,
  });
}

/**
 * day-menu.md: Monday 12 differs from its usual, so Reset to usual shows;
 * the afternoon's Work runs to 15:30, below the frame's fold [ASSUMPTION].
 */
function mondayChangedRecords(): FixtureRecords {
  const records = setUpThisWeekRecords();
  return {
    ...records,
    blockChanges: [
      blockChange(1, B.workAfternoon, "2026-10-12", "13:00", "15:30"),
    ],
  };
}

/** overlap.md: Breakfast dragged to 8:30 on Monday 12, onto Training. */
function overlapRecords(): FixtureRecords {
  const records = withIcons(setUpThisWeekRecords());
  return {
    ...records,
    blockChanges: [blockChange(2, B.breakfast, "2026-10-12", "08:30", "09:00")],
  };
}

/**
 * day-own-change.md: Thursday 15's Training is its own (Workout: swim for
 * gym, the set item skipped on the date); its Work holds this week's tiers
 * as Monday's [placeholder].
 */
function thursdayOwnRecords(): FixtureRecords {
  const records = withIcons(setUpThisWeekRecords());
  const thursday = "2026-10-15";
  const slotOf = (n: number, change: Record<string, unknown>) =>
    slotRecord.parse({
      ...stamps,
      id: id(3, n),
      onDate: thursday,
      skipped: false,
      sortOrder: 0,
      blockItemId: null,
      todoId: null,
      workItemId: null,
      tier: null,
      lengthMin: null,
      tookMin: null,
      doneAt: null,
      ...change,
    });
  const work = records.slots
    .filter((slot) => slot.onDate === "2026-10-12")
    .map((slot, index) =>
      slotOf(11 + index, {
        blockId: slot.blockId,
        sortOrder: slot.sortOrder,
        workItemId: slot.workItemId,
        tier: slot.tier,
      }),
    );
  return {
    ...records,
    blockItems: [
      ...records.blockItems,
      blockItemRecord.parse({
        ...stamps,
        id: id(2, 90),
        blockId: B.training,
        title: "Workout: swim",
        icon: emoji("🏊"),
        isTransition: false,
        atTime: null,
        lengthMin: 37,
        meal: false,
        onDate: thursday,
        sortOrder: 1,
      }),
    ],
    slots: [
      ...records.slots,
      ...work,
      slotOf(20, {
        blockId: B.training,
        blockItemId: I.workout,
        skipped: true,
        sortOrder: 1,
      }),
    ],
  };
}

/* ------------------------------------------------ Add event (USE-53) -- */

/**
 * Monday 12's Work with lengths, so an event at 11:00 lands on planned
 * work (event-inside-work.md): [Write the sync spec] 9:30 to 11:00 and
 * [Review the Paper handoff] 11:00 to 11:30 in Primary, Secondary and
 * Stretch a quarter hour each to 12:00. A band at 11:00 moves the handoff to
 * 11:30 whole, and Primary then fills the block, so Secondary and Stretch
 * slide out of its grid. Clients on, Kestrel Health first, for the desk's
 * Client (D-USE-95).
 */
const SLOT_LENGTHS = [90, 30, 15, 15];

export const ADD_EVENT_CLIENTS = {
  kestrel: fixtureId(5, 151),
  alder: fixtureId(5, 152),
} as const;

export function addEventRecords(): FixtureRecords {
  const records = setUpThisWeekRecords();
  return {
    ...records,
    slots: records.slots.map((slot, index) =>
      slot.onDate === "2026-10-12"
        ? { ...slot, lengthMin: SLOT_LENGTHS[index] ?? null }
        : slot,
    ),
    clients: [
      {
        id: ADD_EVENT_CLIENTS.kestrel,
        name: "Kestrel Health",
        colorKey: "rose",
      },
      { id: ADD_EVENT_CLIENTS.alder, name: "Alder Studio", colorKey: "moss" },
    ].map((client, sortOrder) =>
      clientRecord.parse({
        ...stamps,
        logoPath: null,
        archivedAt: null,
        sortOrder,
        ...client,
      }),
    ),
    clientsEnabled: true,
  };
}

const DESIGN_REVIEW = {
  title: "[Design review]",
  tag: "work",
  startsAt: "11:00",
  endsAt: "11:30",
} as const;

/** Each opens on Monday 12 of This week with Add event's sheet, or its add made. */
const ADD_EVENT_DAYS: [string, () => Scenario][] = [
  days("add-event", addEventRecords, {
    week: "this",
    day: 0,
    event: DESIGN_REVIEW,
  }),
  days("event-name-needed", addEventRecords, {
    week: "this",
    day: 0,
    event: { ...DESIGN_REVIEW, title: "" },
  }),
  days("event-inside-work", addEventRecords, {
    week: "this",
    day: 0,
    event: { ...DESIGN_REVIEW, add: true },
    holdToast: true,
    holdSaved: true,
  }),
  days("event-own-block", addEventRecords, {
    week: "this",
    day: 0,
    event: {
      title: "Dentist [placeholder]",
      tag: "personal",
      startsAt: "15:30",
      endsAt: "16:15",
      add: true,
    },
    scrollTo: "12:00",
    holdToast: true,
    holdSaved: true,
  }),
];

/* ------------------------------------- Google events (USE-109) -- */

/** Google event ids: kind 4 in the integration range. */
export const GOOGLE_EVENT_IDS = {
  standup: integrationId(4, 1),
  coffee: integrationId(4, 2),
  vendorCall: integrationId(4, 3),
  holiday: integrationId(4, 4),
} as const;

/**
 * Monday 12 as google-events.md draws it: Work 9:30 to 12:00 with [Write
 * the sync spec] for an hour and [Review the Paper handoff] at 10:30 after
 * it; [Standup] 10:30 to 11:00 answered yes moves the handoff to 11:00;
 * [Coffee with Ana] at 11:00 is maybe; [Vendor call] at 11:30 was declined,
 * and [Thanksgiving] sits on Holidays, which is off. None of them is
 * Synapse's, so Add to day writes the one day event.
 */
export function googleEventsRecords(): FixtureRecords {
  const records = addEventRecords();
  const C = INTEGRATION_IDS.calendars;
  const E = GOOGLE_EVENT_IDS;
  const integrations = integrationRecords("2026-10-11T20:40:00.000Z");
  integrations.googleEvents = [
    [E.standup, C.team, "[Standup]", "10:30", "11:00", "yes"],
    [E.coffee, C.personal, "[Coffee with Ana]", "11:00", "11:30", "maybe"],
    [E.vendorCall, C.team, "[Vendor call]", "11:30", "12:00", "no"],
    [E.holiday, C.holidays, "[Thanksgiving]", "09:00", "10:00", "yes"],
  ].map(([id, calendarId, title, startsAt, endsAt, answer]) => ({
    id: id!,
    calendarId: calendarId!,
    title: title!,
    date: "2026-10-12",
    startsAt: startsAt!,
    endsAt: endsAt!,
    answer: answer as "yes" | "maybe" | "no",
  }));
  return {
    ...records,
    slots: records.slots.map((slot, index) =>
      slot.onDate === "2026-10-12"
        ? { ...slot, lengthMin: GOOGLE_SLOT_LENGTHS[index] ?? null }
        : slot,
    ),
    clientsEnabled: false,
    integrations,
  };
}

const GOOGLE_SLOT_LENGTHS = [60, 30, 15, 15];

/** `?state=google-events`: This week's Monday 12 with its Google events. */
const GOOGLE_EVENT_DAYS: [string, () => Scenario][] = [
  days("google-events", googleEventsRecords, {
    week: "this",
    day: 0,
    scrollTo: "09:00",
    holdToast: true,
  }),
];

/**
 * The desk popover (interactions/add-event.md), on its own part until the
 * Week mounts it: Wednesday 14, "+ Event" open at 14:00 to 14:30, Work,
 * Kestrel Health. `/dev/parts?state=event-popover` at 1728.
 */
export const EVENT_POPOVER_SCENARIOS: Record<string, () => Scenario> = {
  "event-popover": setUp("event-popover", addEventRecords, {
    seen: ["install-offer"],
    setUp: {
      week: "this",
      day: 2,
      event: {
        title: "📞 [Call with Kestrel legal]",
        tag: "work",
        startsAt: "14:00",
        endsAt: "14:30",
        clientId: ADD_EVENT_CLIENTS.kestrel,
      },
    },
  }),
};

/** Up at moved from 7:00 to 6:45: the edit Saving, Saved and Not saved catch. */
const STAGED_MONDAY = { upAt: "06:45", lightsOut: "22:30" };

export const DAYS_SCENARIOS: Record<string, () => Scenario> =
  Object.fromEntries([
    days("usual-week", setUpUsualRecords, { week: "usual" }),
    days("empty-first-day", emptyRecords, { week: "usual", day: 0 }),
    days("usual-saturday", setUpUsualRecords, { week: "usual", day: 5 }),
    days("usual-thursday-evening", setUpUsualRecords, {
      week: "usual",
      day: 3,
      scrollTo: "17:00",
    }),
    days("plus-menu-empty-day", usualEmptyThursdayRecords, {
      week: "usual",
      day: 3,
      menu: "plus",
    }),
    days("tap-a-time", setUpThisWeekRecords, {
      week: "this",
      day: 0,
      tapAt: "17:00",
      scrollTo: "12:00",
    }),
    days("out-of-bounds", setUpUsualRecords, {
      week: "usual",
      day: 3,
      staged: { upAt: "07:45", lightsOut: "22:30" },
      holdSaved: true,
    }),
    days("days-saving", setUpUsualRecords, {
      week: "usual",
      day: 0,
      staged: STAGED_MONDAY,
      save: "hang",
    }),
    days("days-saved", setUpUsualRecords, {
      week: "usual",
      day: 0,
      staged: STAGED_MONDAY,
      holdSaved: true,
    }),
    days(
      "days-not-saved",
      setUpUsualRecords,
      { week: "usual", day: 0, staged: STAGED_MONDAY },
      { failWrites: ["bounds"] },
    ),
    days(
      "days-loading",
      setUpUsualRecords,
      { week: "usual", day: 3 },
      { regions: { setUpColumn: "loading" } },
    ),
    days(
      "days-error",
      setUpUsualRecords,
      { week: "usual", day: 3 },
      { regions: { setUpColumn: "error" } },
    ),
    days(
      "install-offer",
      mondayOnlyRecords,
      // Monday just saved: its bounds written again, Saved held.
      {
        week: "usual",
        day: 0,
        staged: { upAt: "07:00", lightsOut: "22:30" },
        holdSaved: true,
      },
      {
        seen: [],
        install: { phone: true, standalone: false, platform: "iphone" },
      },
    ),
    // USE-42: This week, the menus, the reach, an own change, overlap, offline.
    days("the-week", setUpThisWeekRecords, { week: "this" }),
    days("the-day", setUpThisWeekRecords, { week: "this", day: 0 }),
    // USE-47: Thursday 15's Training dragged to 8:30, which dates asked.
    days("repeat-scope", setUpThisWeekRecords, {
      week: "this",
      day: 3,
      askScope: { block: B.training, startsAt: "08:30" },
    }),
    days("item-icons", () => withIcons(setUpThisWeekRecords()), {
      week: "this",
      day: 0,
    }),
    days("plus-menu", setUpThisWeekRecords, {
      week: "this",
      day: 0,
      menu: "plus",
    }),
    days("day-menu", mondayChangedRecords, {
      week: "this",
      day: 0,
      menu: "day",
    }),
    days("clear-confirm", setUpThisWeekRecords, {
      week: "this",
      day: 0,
      menu: "clear",
    }),
    days("usual-change-reaches", () => withIcons(setUpUsualRecords()), {
      week: "usual",
      day: 3,
      reach: B.wellness,
      holdToast: true,
    }),
    days("day-own-change", thursdayOwnRecords, { week: "this", day: 3 }),
    days("overlap", overlapRecords, {
      week: "this",
      day: 0,
      moved: B.breakfast,
    }),
    // USE-45: Copy from on the usual Thursday.
    days("copy-offer", copyFromRecords, {
      week: "usual",
      day: 3,
      justSet: true,
      // Thursday's bounds just written, Saved held.
      staged: { upAt: "07:00", lightsOut: "22:30" },
      holdSaved: true,
    }),
    days("empty-day", copyFromRecords, { week: "usual", day: 3 }),
    days("copy-picker", thursdayPartBuiltRecords, {
      week: "usual",
      day: 3,
      copy: "picker",
    }),
    days("replace-confirm", thursdayPartBuiltRecords, {
      week: "usual",
      day: 3,
      copy: "replace",
      copyFrom: 0,
    }),
    days("copied-undo", thursdayPartBuiltRecords, {
      week: "usual",
      day: 3,
      copy: "copied",
      copyFrom: 0,
      holdToast: true,
    }),
    days("saved-block-picker", thursdayPartBuiltRecords, {
      week: "usual",
      day: 3,
      copy: "saved",
    }),
    // [ASSUMPTION] `offline` is Now's; this frame takes the `days-` prefix.
    days(
      "days-offline",
      () => withIcons(setUpUsualRecords()),
      { week: "usual", day: 3 },
      { offline: true },
    ),
    // USE-53: Add event, the band inside Work, its own block.
    ...ADD_EVENT_DAYS,
    // USE-109: Google events on the day.
    ...GOOGLE_EVENT_DAYS,
  ]);

export const SET_UP_SCENARIOS: Record<string, () => Scenario> = {
  "set-up-usual": setUp("set-up-usual", setUpUsualRecords),
  "set-up-this-week": setUp("set-up-this-week", setUpThisWeekRecords),
  "set-up-first-day": setUp("set-up-first-day", emptyRecords),
  // D-USE-82: the day's own controls are read-only; block writes wait.
  "set-up-offline": setUp("set-up-offline", setUpThisWeekRecords, {
    offline: true,
  }),
  ...DAYS_SCENARIOS,
  ...EVENT_POPOVER_SCENARIOS,
};
