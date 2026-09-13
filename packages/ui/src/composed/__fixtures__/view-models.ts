/**
 * Story fixtures — view models shaped exactly as the app will pass them.
 *
 * Kept out of `index.ts` and never imported by a component: this file exists
 * so stories exercise the real contracts from `@syn/types` instead of
 * inventing a looser object each time, which is how a story ends up proving
 * something the app cannot do.
 *
 * Times are fixed instants, not `new Date()`, so a story renders the same
 * frame every time it is opened and a visual diff means a real change.
 */
import type {
  CategoryView,
  DayBlockView,
  DayItemView,
  HabitSummaryView,
  ItemState,
  ReasonView,
  SlotView,
} from "@syn/types";

/** The story zone. Vancouver, because the UX documents use it. */
export const STORY_TIME_ZONE = "America/Vancouver";

const at = (hour: number, minute = 0): Date =>
  new Date(Date.UTC(2026, 8, 4, hour + 7, minute));

export const CATEGORY_LEAF: CategoryView = { key: "leaf", name: "Health" };
export const CATEGORY_SKY: CategoryView = { key: "sky", name: "Deep work" };

export const ITEM: DayItemView = {
  id: "item-1",
  habitId: "habit-1",
  title: "Morning run",
  icon: { kind: "curated", value: "footprints", colorKey: "leaf" },
  type: "habit",
  category: CATEGORY_LEAF,
  timeMode: "fixed_time",
  scheduledStart: at(7),
  scheduledEnd: at(7, 40),
  originalScheduledStart: at(7),
  durationMin: 40,
  priority: 5,
  scheduling: "soft",
  origin: "template",
  carriedFromLabel: null,
  doneAt: null,
  quantityUnit: null,
  quantityValue: null,
  timerElapsedSec: null,
  state: "upcoming",
  multitask: "none",
  dayBlockId: null,
  blockKind: null,
  pinned: false,
  gapBeforeMin: 0,
  alternates: null,
};

/** One item in a named state, for the state-matrix stories. */
export function itemInState(
  state: ItemState,
  overrides: Partial<DayItemView> = {},
): DayItemView {
  return { ...ITEM, id: `item-${state}`, state, ...overrides };
}

export const ITEMS: readonly DayItemView[] = [
  itemInState("now", { title: "Morning run" }),
  itemInState("soon", { title: "Stretch", scheduledStart: at(8) }),
  itemInState("done", {
    title: "Read",
    doneAt: at(9, 12),
    category: CATEGORY_SKY,
  }),
  itemInState("passed", { title: "Inbox", scheduledStart: at(6) }),
  itemInState("deferred", { title: "Plan the week" }),
];

export const HABIT: HabitSummaryView = {
  id: "habit-1",
  title: "Morning run",
  icon: { kind: "curated", value: "footprints", colorKey: "leaf" },
  type: "habit",
  category: CATEGORY_LEAF,
  durationMin: 30,
  durationMax: 45,
  lifePriority: 5,
  isWakeAnchor: false,
  archived: false,
  blockKind: null,
  weeklyTarget: null,
  typicalDays: null,
};

export const REASONS: Readonly<
  Record<"circumstance" | "scoping" | "chose_not_to", readonly ReasonView[]>
> = {
  circumstance: [
    {
      key: "something_came_up",
      label: "Something came up",
      tier: "circumstance",
      builtIn: true,
    },
    {
      key: "unwell",
      label: "Not feeling well",
      tier: "circumstance",
      builtIn: true,
    },
  ],
  scoping: [
    { key: "ran_long", label: "Earlier thing ran long", tier: "scoping", builtIn: true },
    { key: "slept_in", label: "Slept in", tier: "scoping", builtIn: true },
    {
      key: "stayed_on_important",
      label: "Stayed on something more important",
      tier: "scoping",
      builtIn: true,
    },
  ],
  chose_not_to: [],
};

export const DAY_LABELS: readonly string[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/*
 * ---- UX v1.1 — the day by block (DYN-7) ----
 *
 * Taylor's Monday after *Set the day* (v1.1 §3.1, §6.1, §7.1): orient 3 ·
 * push before the routine · a six-item menu morning · prep with the one-of
 * breakfast and the walk, backward to 9:00 · work as the container with the
 * stand-up inside · wind-down backward from 22:45 with the journal, the
 * devices-off marker at 22:15, and two items after it that wait for the
 * morning. Every story of a block, a band, a container row or a confirm-later
 * face reads from here.
 */

const DOT = { kind: "curated", value: "dot", colorKey: null } as const;

function blockItem(
  id: string,
  title: string,
  blockKind: DayItemView["blockKind"],
  dayBlockId: string,
  start: Date,
  durationMin: number,
  overrides: Partial<DayItemView> = {},
): DayItemView {
  return {
    ...ITEM,
    id,
    habitId: `habit-${id}`,
    title,
    icon: DOT,
    category: null,
    scheduledStart: start,
    scheduledEnd: new Date(start.getTime() + durationMin * 60_000),
    originalScheduledStart: start,
    durationMin,
    dayBlockId,
    blockKind,
    ...overrides,
  };
}

/** The work focus — the container's own row: no length, the block's span. */
const FOCUS: DayItemView = blockItem("focus", "Viewpoint", "work", "block-work", at(9), 510, {
  type: "deep_work",
  durationMin: null,
});

const STAND_UP: DayItemView = blockItem("stand-up", "Stand-up", "work", "block-work", at(9, 30), 20, {
  type: "task_appointment",
  origin: "fixture",
  pinned: true,
  scheduling: "hard",
  priority: 7,
});

const PHONE_AWAY: DayItemView = blockItem("phone-away", "Phone away", "wind_down", "block-wind-down", at(22, 15), 1, {
  type: "task_appointment",
  pinned: true,
  scheduling: "hard",
  priority: 6,
});

function block(
  id: string,
  kind: DayBlockView["kind"],
  name: string | null,
  span: { start: Date; end: Date } | null,
  items: DayItemView[],
  overrides: Partial<DayBlockView> = {},
): DayBlockView {
  return {
    id,
    kind,
    name,
    templateId: name === null ? null : `template-${id}`,
    state: "set",
    startLabel: span === null ? null : clockLabel(span.start),
    endLabel: span === null ? null : clockLabel(span.end),
    startMin: span === null ? null : minutesSinceWake(span.start),
    endMin: span === null ? null : minutesSinceWake(span.end),
    startAt: span === null ? null : span.start,
    endAt: span === null ? null : span.end,
    placement: null,
    items,
    split: false,
    ...overrides,
  };
}

/** "7:03" — a fixed-format label, not `formatClock`, so the fixture has no zone dependency. */
function clockLabel(date: Date): string {
  const hour = (date.getUTCHours() - 7 + 24) % 24;
  const minute = date.getUTCMinutes();
  return `${hour}:${String(minute).padStart(2, "0")}`;
}

/** Minutes from 7:00 — the day's start in these fixtures. */
function minutesSinceWake(date: Date): number {
  return Math.round((date.getTime() - at(7).getTime()) / 60_000);
}

export const BLOCK_ORIENT: DayBlockView = block(
  "block-orient",
  "orient",
  "Orient",
  { start: at(7), end: at(7, 3) },
  [blockItem("orient", "Orient", "orient", "block-orient", at(7), 3, { scheduling: "hard", state: "done", doneAt: at(7, 3) })],
);

export const BLOCK_TRAINING: DayBlockView = block(
  "block-training",
  "training",
  null,
  { start: at(7, 3), end: at(8, 3) },
  [blockItem("push", "Push", "training", "block-training", at(7, 3), 60, { type: "workout", state: "done", doneAt: at(8, 1) })],
  { placement: "before_morning" },
);

export const BLOCK_MORNING: DayBlockView = block(
  "block-morning",
  "morning",
  "Menu",
  { start: at(8, 3), end: at(9, 4) },
  [
    blockItem("meditate", "Meditate", "morning", "block-morning", at(8, 3), 15, { state: "now" }),
    blockItem("cold-shower", "Cold shower", "morning", "block-morning", at(8, 18), 6, { state: "soon" }),
    blockItem("breath", "Breath work", "morning", "block-morning", at(8, 24), 8),
    blockItem("plan", "Plan the day", "morning", "block-morning", at(8, 32), 8),
    blockItem("read-morning", "Read", "morning", "block-morning", at(8, 40), 22, {
      scheduledStart: at(8, 45),
      scheduledEnd: at(9, 7),
      state: "moved",
    }),
    blockItem("water", "Water", "morning", "block-morning", at(9, 2), 2),
  ],
);

export const BLOCK_PREP: DayBlockView = block(
  "block-prep",
  "prep",
  "Before work",
  { start: at(8, 35), end: at(9) },
  [
    blockItem("breakfast", "Breakfast", "prep", "block-prep", at(8, 35), 10, {
      alternates: { id: "alt-breakfast", chosen: true, otherTitle: "Breakfast", otherDurationMin: 30 },
    }),
    blockItem("walk", "Walk", "prep", "block-prep", at(8, 45), 15),
  ],
);

export const BLOCK_WORK: DayBlockView = block(
  "block-work",
  "work",
  "Work",
  { start: at(9), end: at(17, 30) },
  [FOCUS, STAND_UP],
);

export const BLOCK_WIND_DOWN: DayBlockView = block(
  "block-wind-down",
  "wind_down",
  "Wind-down",
  { start: at(22, 5), end: at(22, 45) },
  [
    blockItem("journal", "Journal", "wind_down", "block-wind-down", at(22, 5), 10),
    PHONE_AWAY,
    blockItem("read-night", "Read", "wind_down", "block-wind-down", at(22, 15), 20, { state: "confirm-later" }),
    blockItem("stretch-night", "Stretch", "wind_down", "block-wind-down", at(22, 35), 10, { state: "confirm-later" }),
  ],
);

/** Taylor's Monday, set at 7:03. */
export const BLOCK_DAY: readonly DayBlockView[] = [
  BLOCK_ORIENT,
  BLOCK_TRAINING,
  BLOCK_MORNING,
  BLOCK_PREP,
  BLOCK_WORK,
  BLOCK_WIND_DOWN,
];

/** The same day with *inside work*: two work halves around the workout. */
export const SPLIT_WORK_DAY: readonly DayBlockView[] = [
  BLOCK_ORIENT,
  { ...BLOCK_MORNING, startLabel: "7:03", endLabel: "8:04", startMin: 3, endMin: 64 },
  BLOCK_PREP,
  block("block-work-a", "work", "Work", { start: at(9), end: at(12, 45) }, [
    { ...FOCUS, id: "focus-a", dayBlockId: "block-work-a", scheduledEnd: at(12, 45) },
    { ...STAND_UP, dayBlockId: "block-work-a" },
  ], { split: true }),
  block("block-training-inside", "training", null, { start: at(12, 45), end: at(13, 45) }, [
    blockItem("push-inside", "Push", "training", "block-training-inside", at(12, 45), 60, { type: "workout" }),
  ], { placement: "inside_work" }),
  block("block-work-b", "work", "Work", { start: at(13, 45), end: at(17, 30) }, [
    { ...FOCUS, id: "focus-b", dayBlockId: "block-work-b", scheduledStart: at(13, 45) },
  ], { split: true }),
  BLOCK_WIND_DOWN,
];

/** A Sunday: orient and wind-down only, a fixture in an activity block (§3.9). */
export const UNSTRUCTURED_DAY: readonly DayBlockView[] = [
  { ...BLOCK_ORIENT, name: null },
  block("block-activity", "activity", null, { start: at(19), end: at(20, 30) }, [
    blockItem("football", "Football", "activity", "block-activity", at(19), 90, {
      type: "task_appointment",
      origin: "fixture",
      pinned: true,
      scheduling: "hard",
    }),
  ]),
  { ...BLOCK_WIND_DOWN, name: null },
];

/** The wind-down items that wait for the morning (§7.3). */
export const LAST_NIGHT: readonly DayItemView[] = BLOCK_WIND_DOWN.items.filter(
  (item) => item.state === "confirm-later",
);

/** The devices-off marker, on its own. */
export const DEVICES_OFF_MARKER: DayItemView = PHONE_AWAY;

/*
 * ---- UX v1.1 — the block editor's slots (DYN-7) ----
 */

const SLOT: SlotView = {
  id: "slot-1",
  habitId: "habit-slot-1",
  title: "Breath work",
  icon: DOT,
  timeMode: "fixed_time",
  startClock: "7:03",
  endClock: "7:08",
  durationMin: 5,
  priority: 5,
  overridden: false,
  scheduling: "soft",
  multitask: "none",
  gapBeforeMin: 0,
  pinnedClock: null,
  role: "stack",
  alternates: null,
};

export function slotWith(overrides: Partial<SlotView>): SlotView {
  return { ...SLOT, ...overrides };
}

/** Taylor's *Before work*: the one-of breakfast, then the walk, backward to 9:00. */
export const SLOTS_PREP: readonly SlotView[] = [
  slotWith({
    id: "slot-breakfast",
    title: "Breakfast",
    startClock: "8:35",
    endClock: "8:45",
    durationMin: 10,
    priority: 7,
    alternates: { group: "breakfast", isDefault: true, otherTitle: "Breakfast", otherDurationMin: 30 },
  }),
  slotWith({ id: "slot-walk", title: "Walk", startClock: "8:45", endClock: "9:00", durationMin: 15 }),
];

/** An opener · pool · closer morning with a gap, a pin, and a pool item. */
export const SLOTS_ROUTINE: readonly SlotView[] = [
  slotWith({ id: "slot-opener", title: "Breath work", role: "opener", startClock: "7:03", endClock: "7:08" }),
  slotWith({ id: "slot-pool", title: "Meditate", role: "pool", startClock: null, endClock: null, durationMin: 15 }),
  slotWith({ id: "slot-pinned", title: "Cold shower", pinnedClock: "7:30", startClock: "7:30", endClock: "7:36", durationMin: 6 }),
  slotWith({ id: "slot-closer", title: "Stretch", role: "closer", gapBeforeMin: 5, startClock: "7:41", endClock: "7:51", durationMin: 10 }),
];
