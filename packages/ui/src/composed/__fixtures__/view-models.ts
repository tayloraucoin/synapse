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
  DayItemView,
  HabitSummaryView,
  ItemState,
  ReasonView,
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
