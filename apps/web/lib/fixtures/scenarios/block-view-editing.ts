import type { IconValue } from "@syn/types";
import { blockItemRecord, blockRecord } from "@syn/validators";
import { daysBlockRoute } from "@/lib/routes";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { baseMealTopics, emptyRecords, MEAL_TOPIC_IDS } from "./base-day";
import type { Scenario } from "./index";
import { SET_UP_NOW } from "./set-up";

/**
 * Block view in editing (USE-49; day/block-view/by-kind.md and its states):
 * the usual week as the round 3 frames draw it, at Sunday 11 October, 21:10
 * (the set-up clock). Monday: Wellness with its icons and Meditate set at
 * 7:10, Training with its drives, Breakfast with Meal on, Work, an empty
 * Break with Meal off, Dinner. Tuesday: Writing, a Set work block, and
 * Lunch. Thursday: a new, empty Wellness, Dinner with friends (Life) and
 * Evening. Sunday: one checklist with no times. Bracketed names are the
 * boards' placeholders.
 *
 * Take each at its `BLOCK_EDIT_PATHS` path with `?state=block-view-<state>`.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };
const DAY_CODES = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

/** Ids count from 950, clear of the other scenarios'. */
const id = (table: number, n: number) => fixtureId(table, 950 + n);

export const BLOCK_EDIT_IDS = {
  wellness: id(1, 1),
  training: id(1, 2),
  breakfast: id(1, 3),
  work: id(1, 4),
  trueBreak: id(1, 5),
  dinner: id(1, 6),
  writing: id(1, 7),
  lunch: id(1, 8),
  wellnessThursday: id(1, 9),
  dinnerWithFriends: id(1, 10),
  evening: id(1, 11),
  sunday: id(1, 12),
  eveningTuesday: id(1, 13),
  items: {
    meditate: id(2, 4),
    coldBath: id(2, 5),
    /** USE-156: Meditate, second on Thursday while it is lifted. */
    liftedMeditate: id(2, 42),
    /** USE-157: Meditate, third on Thursday after three taps. */
    addedMeditate: id(2, 43),
  },
} as const;

const B = BLOCK_EDIT_IDS;

/** Weekly on the given weekdays (Monday 0), from 1 October. */
function weekly(...weekdays: number[]): string {
  const days = weekdays.map((day) => DAY_CODES[day]).join(",");
  return `DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=${days}`;
}

function block(seed: {
  id: string;
  kind: string;
  name: string;
  startsAt: string;
  endsAt: string;
  weekday: number;
  fill?: string;
  checklist?: boolean;
  meal?: boolean;
}) {
  const { weekday, ...rest } = seed;
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
    rrule: weekly(weekday),
    ...rest,
  });
}

const emoji = (value: string): IconValue => ({ kind: "emoji", value });

type ItemSeed = {
  title: string;
  icon: string;
  lengthMin?: number;
  atTime?: string;
  isTransition?: boolean;
};

/** A block's items, in order; `from` numbers their ids. */
function items(blockId: string, from: number, seeds: ItemSeed[]) {
  return seeds.map((seed, index) =>
    blockItemRecord.parse({
      ...stamps,
      id: id(2, from + index),
      blockId,
      title: seed.title,
      icon: emoji(seed.icon),
      isTransition: seed.isTransition ?? false,
      atTime: seed.atTime ?? null,
      lengthMin: seed.lengthMin ?? null,
      meal: false,
      onDate: null,
      sortOrder: index,
    }),
  );
}

const WELLNESS: ItemSeed[] = [
  { title: "Pee and weigh", icon: "⚖️", lengthMin: 2 },
  { title: "Water", icon: "💧", lengthMin: 1 },
  { title: "Start the cold bath", icon: "🚿", lengthMin: 2 },
  // Round 8: set at 7:10, so it keeps its time and place.
  { title: "Meditate", icon: "🧘", lengthMin: 10, atTime: "07:10" },
  { title: "Cold bath", icon: "🧊", lengthMin: 10 },
];

/** overflow.md: two placeholders push Wellness 12 min past 8:00. */
const OVERFLOW: ItemSeed[] = [
  ...WELLNESS,
  { title: "Stretch [placeholder]", icon: "🤸", lengthMin: 30 },
  { title: "Journal [placeholder]", icon: "📓", lengthMin: 12 },
];

/**
 * USE-156 (block-view/suggested.md): Thursday's new Wellness after three
 * taps on its suggestions, Pee and weigh, Water, Meditate, each at the end.
 */
const THREE_ADDED: ItemSeed[] = [
  { title: "Pee and weigh", icon: "⚖️", lengthMin: 2 },
  { title: "Water", icon: "💧", lengthMin: 1 },
  { title: "Meditate", icon: "🧘", lengthMin: 10 },
];

/** suggested-reorder.md: Meditate lifted to 7:07, over Water. */
const REORDERING: ItemSeed[] = [THREE_ADDED[0]!, THREE_ADDED[2]!, THREE_ADDED[1]!];

/** suggested-past-span.md: Yoga and Cold bath make 68 of 60 min. */
const PAST_SPAN: ItemSeed[] = [
  ...THREE_ADDED,
  { title: "Yoga", icon: "🪷", lengthMin: 45 },
  { title: "Cold bath", icon: "🧊", lengthMin: 10 },
];

export function blockEditRecords(
  wellness: ItemSeed[] = WELLNESS,
  extra: {
    /** Thursday's Wellness items; it is new and empty without them. */
    thursday?: ItemSeed[];
    /** A new Tuesday Evening, 21:00 to 22:30 (suggested-first-of-kind.md). */
    tuesdayEvening?: boolean;
  } = {},
): FixtureRecords {
  const blocks = [
    block({
      id: B.wellness,
      kind: "wellness",
      name: "Wellness",
      startsAt: "07:05",
      endsAt: "08:00",
      weekday: 0,
      fill: "set_items",
      checklist: true,
    }),
    block({
      id: B.training,
      kind: "training",
      name: "Training",
      startsAt: "08:00",
      endsAt: "08:57",
      weekday: 0,
      fill: "set_items",
    }),
    block({
      id: B.breakfast,
      kind: "break",
      name: "Breakfast",
      startsAt: "09:00",
      endsAt: "09:30",
      weekday: 0,
      meal: true,
    }),
    block({
      id: B.work,
      kind: "work",
      name: "Work",
      startsAt: "09:30",
      endsAt: "12:00",
      weekday: 0,
      fill: "tasks_for_the_day",
    }),
    block({
      id: B.trueBreak,
      kind: "break",
      name: "Break",
      startsAt: "15:00",
      endsAt: "15:20",
      weekday: 0,
    }),
    block({
      id: B.dinner,
      kind: "break",
      name: "Dinner",
      startsAt: "18:00",
      endsAt: "18:45",
      weekday: 0,
      meal: true,
    }),
    block({
      id: B.writing,
      kind: "work",
      name: "Writing",
      startsAt: "09:30",
      endsAt: "12:00",
      weekday: 1,
      fill: "set_items",
    }),
    block({
      id: B.lunch,
      kind: "break",
      name: "Lunch",
      startsAt: "12:00",
      endsAt: "13:00",
      weekday: 1,
      meal: true,
    }),
    block({
      id: B.wellnessThursday,
      kind: "wellness",
      name: "Wellness",
      startsAt: "07:05",
      endsAt: "08:05",
      weekday: 3,
      fill: "set_items",
      checklist: true,
    }),
    block({
      id: B.dinnerWithFriends,
      kind: "life",
      name: "Dinner with friends",
      startsAt: "19:00",
      endsAt: "21:00",
      weekday: 3,
      fill: "set_items",
    }),
    block({
      id: B.evening,
      kind: "evening",
      name: "Evening",
      startsAt: "21:30",
      endsAt: "22:30",
      weekday: 3,
      fill: "set_items",
    }),
    ...(extra.tuesdayEvening
      ? [
          block({
            id: B.eveningTuesday,
            kind: "evening",
            name: "Evening",
            startsAt: "21:00",
            endsAt: "22:30",
            weekday: 1,
            fill: "set_items",
          }),
        ]
      : []),
    // A checklist with no times: the whole date (D-USE-28).
    block({
      id: B.sunday,
      kind: "wellness",
      name: "Sunday",
      startsAt: "00:00",
      endsAt: "24:00",
      weekday: 6,
      fill: "set_items",
      checklist: true,
    }),
  ];
  const blockItems = [
    ...items(B.wellness, 1, wellness),
    ...items(B.training, 11, [
      {
        title: "Drive to the YMCA",
        icon: "🚗",
        isTransition: true,
        atTime: "08:00",
        lengthMin: 15,
      },
      { title: "Workout: gym", icon: "🏋️", lengthMin: 30 },
      {
        title: "Drive home",
        icon: "🚗",
        isTransition: true,
        atTime: "08:45",
        lengthMin: 12,
      },
    ]),
    ...items(B.breakfast, 16, [
      { title: "Make breakfast", icon: "🍳", lengthMin: 10 },
      { title: "Eat", icon: "🥣", lengthMin: 15 },
      { title: "Dishes", icon: "🧽", lengthMin: 5 },
    ]),
    ...items(B.writing, 21, [
      { title: "Morning pages", icon: "📓", lengthMin: 30 },
      { title: "Draft the next piece", icon: "✍️", lengthMin: 90 },
      { title: "Edit yesterday's draft", icon: "🔍", lengthMin: 30 },
    ]),
    ...items(B.dinnerWithFriends, 26, [
      {
        title: "Drive to Marco's",
        icon: "🚗",
        isTransition: true,
        atTime: "19:00",
        lengthMin: 20,
      },
      { title: "Dinner", icon: "🍝", lengthMin: 80 },
      {
        title: "Drive home",
        icon: "🚗",
        isTransition: true,
        atTime: "20:40",
        lengthMin: 20,
      },
    ]),
    ...items(B.wellnessThursday, 41, extra.thursday ?? []),
    ...items(B.sunday, 31, [
      { title: "Groceries", icon: "🛒" },
      { title: "Laundry", icon: "🧺" },
      { title: "Water the plants", icon: "🪴" },
      { title: "Meal prep", icon: "🥡" },
      { title: "Tidy the flat", icon: "🧹" },
      { title: "Plan the week", icon: "🗓️" },
    ]),
  ];
  return {
    ...emptyRecords(),
    blocks,
    blockItems,
    mealTopics: baseMealTopics(),
  };
}

const usual = (blockId: string, weekday: number) =>
  daysBlockRoute(blockId, { weekday });

/** Where each state is taken. Thursday 15 is This week's. */
export const BLOCK_EDIT_PATHS = {
  "wellness-editing": usual(B.wellness, 0),
  "editing-monday": usual(B.wellness, 0),
  overflow: usual(B.wellness, 0),
  "editing-offline": usual(B.wellness, 0),
  empty: usual(B.wellnessThursday, 3),
  "empty-new-block": usual(B.wellnessThursday, 3),
  "training-editing": usual(B.training, 0),
  "meal-editing": usual(B.breakfast, 0),
  "true-break": usual(B.trueBreak, 0),
  "checklist-editing": usual(B.sunday, 6),
  "life-set": usual(B.dinnerWithFriends, 3),
  "life-not-this-week": daysBlockRoute(B.dinnerWithFriends, {
    date: "2026-10-15",
  }),
  "set-work": usual(B.writing, 1),
} as const;

/** USE-156: the suggested states, under their own names (suggested.md). */
export const SUGGESTED_PATHS = {
  "suggested-new": usual(B.wellnessThursday, 3),
  "suggested-added": usual(B.wellnessThursday, 3),
  "suggested-reorder": usual(B.wellnessThursday, 3),
  "suggested-past-span": usual(B.wellnessThursday, 3),
  "suggested-first-of-kind": usual(B.eveningTuesday, 1),
  /** USE-157: suggested-added with Meditate's length open at 15 min. */
  "suggested-length": usual(B.wellnessThursday, 3),
} as const;

function suggested(
  name: keyof typeof SUGGESTED_PATHS,
  records: () => FixtureRecords,
  extra: Partial<Scenario> = {},
): [string, () => Scenario] {
  return [
    name,
    () => ({ name, now: SET_UP_NOW, records: records(), mode: "ready", ...extra }),
  ];
}

function editing(
  state: keyof typeof BLOCK_EDIT_PATHS,
  extra: Partial<Scenario> = {},
  records: () => FixtureRecords = () => blockEditRecords(),
): [string, () => Scenario] {
  const name = `block-view-${state}`;
  return [
    name,
    () => ({
      name,
      now: SET_UP_NOW,
      records: records(),
      mode: "ready",
      ...extra,
    }),
  ];
}

export const BLOCK_EDIT_SCENARIOS: Record<string, () => Scenario> =
  Object.fromEntries([
    editing("wellness-editing"),
    editing("editing-monday"),
    editing("overflow", {}, () => blockEditRecords(OVERFLOW)),
    editing("editing-offline", { offline: true }),
    editing("empty"),
    editing("empty-new-block"),
    editing("training-editing"),
    editing("meal-editing", {
      view: { open: `left-out:${MEAL_TOPIC_IDS.strengthTraining}` },
    }),
    editing("true-break"),
    editing("checklist-editing"),
    editing("life-set"),
    editing("life-not-this-week", { view: { open: "header-menu" } }),
    editing("set-work"),
    suggested("suggested-new", () => blockEditRecords()),
    suggested("suggested-added", () =>
      blockEditRecords(WELLNESS, { thursday: THREE_ADDED }),
    ),
    suggested(
      "suggested-reorder",
      () => blockEditRecords(WELLNESS, { thursday: REORDERING }),
      // Meditate (the second row) held mid-drag, as edit-dragging.md.
      { view: { open: `lifted:${B.items.liftedMeditate}` } },
    ),
    suggested("suggested-past-span", () =>
      blockEditRecords(WELLNESS, { thursday: PAST_SPAN }),
    ),
    suggested("suggested-first-of-kind", () =>
      blockEditRecords(WELLNESS, { tuesdayEvening: true }),
    ),
    suggested(
      "suggested-length",
      () => blockEditRecords(WELLNESS, { thursday: THREE_ADDED }),
      { view: { open: `length:${B.items.addedMeditate}=15` } },
    ),
  ]);
