/**
 * The landing page's example day — SYS-6, `docs/ux/landing-page-ux.md` §4–§5.
 *
 * No React, no DOM, no imports from the app. Everything the two client leaves
 * need to decide what a row is: the fixture itself, the day-part arithmetic,
 * the state derivation, the now line's position, and the review figure's sums.
 *
 * WHY NOT `@syn/ui`'s `__fixtures__/view-models.ts`. That file is deliberately
 * not exported from the package (enumerated exports; its own header forbids a
 * component importing it) and its instants are pinned to Vancouver so a visual
 * diff means a real change. A page whose whole point is the visitor's own clock
 * cannot use a fixed zone. The SHAPES are the same — `DayItemView` from
 * `@syn/types` — which is what the handoff meant by "the fixture view models".
 * Logged in the track's `DEVIATIONS.md`.
 *
 * THE TWO CLOCKS. Every instant here is built twice, from the same wall-clock
 * numbers: once in UTC (the server, and the client's first render, which must
 * produce identical markup) and once in the device's local zone (after mount).
 * Formatted with its matching zone, "7:00 AM" is "7:00 AM" either way, so only
 * the `<time dateTime>` attribute differs — which `TimeText` already suppresses.
 * That is what lets the hero hydrate without a wrong frame.
 */
import type {
  CategoryView,
  DayItemView,
  ItemState,
  ItemType,
  MissTier,
  ReasonView,
} from "@syn/types";
import { detectTimezone } from "@syn/constants";
import type { DayPart, FormulaTerm } from "@syn/ui";
import { minutesFromDayStart } from "@syn/utils";

/** The zone the server and the first client render agree on. */
export const STATIC_TIME_ZONE = "UTC";

/**
 * The example day's wake anchor, 5:00, as `HH:mm` and as minutes.
 *
 * A FIXTURE THAT IS NEVER SHOWN. Official spec §6.4 starts Morning at `woke_at`,
 * Afternoon at +8h, Evening at +16h, so the parts need an anchor to exist at
 * all — but a landing page that displayed someone else's wake time would be
 * claiming a fact about a person who does not exist. The headers render without
 * their spans (§4.1), so the anchor decides the grouping and says nothing.
 */
export const ANCHOR_CLOCK = "05:00";
const ANCHOR_MINUTES = 5 * 60;
const PART_LENGTH_MINUTES = 8 * 60;

/** Official spec §6.2 — *soon* is the 15 minutes before a fixed start. */
const SOON_WINDOW_MS = 15 * 60 * 1000;

/**
 * The date the UTC instants sit on. Fixed, so the server and the client's
 * first render build the same milliseconds. Nothing on the page shows a date.
 */
const STATIC_DATE = { year: 2026, month: 8, day: 8 } as const;

export const CATEGORY_HEALTH: CategoryView = { key: "leaf", name: "Health" };
export const CATEGORY_DEEP_WORK: CategoryView = { key: "sky", name: "Deep work" };
export const CATEGORY_ADMIN: CategoryView = { key: "slate", name: "Admin" };
export const CATEGORY_HOME: CategoryView = { key: "clay", name: "Home" };
export const CATEGORY_QUIET: CategoryView = { key: "plum", name: "Quiet" };

interface ExampleSpec {
  id: string;
  title: string;
  type: ItemType;
  category: CategoryView;
  /** A name from `@syn/ui`'s curated glyph set. */
  glyph: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  priority: number;
  oneOff?: boolean;
}

/**
 * Seven items, `docs/ux/landing-page-ux.md` §4.1.
 *
 * Nobody in particular: no name appears anywhere on the page, and the titles
 * are the plainest words for the things they are. One task among six habits
 * and one deep-work block, because a day that is all habits is a brochure.
 */
const EXAMPLE_SPECS: readonly ExampleSpec[] = [
  {
    id: "run",
    title: "Run",
    type: "habit",
    category: CATEGORY_HEALTH,
    glyph: "footprints",
    startHour: 7,
    startMinute: 0,
    endHour: 7,
    endMinute: 40,
    priority: 5,
  },
  {
    id: "stretch",
    title: "Stretch",
    type: "habit",
    category: CATEGORY_HEALTH,
    glyph: "sunrise",
    startHour: 8,
    startMinute: 15,
    endHour: 8,
    endMinute: 30,
    priority: 3,
  },
  {
    id: "writing",
    title: "Writing",
    type: "deep_work",
    category: CATEGORY_DEEP_WORK,
    glyph: "pencil",
    startHour: 9,
    startMinute: 30,
    endHour: 11,
    endMinute: 30,
    priority: 7,
  },
  {
    id: "dentist",
    title: "Book the dentist",
    type: "task_appointment",
    category: CATEGORY_ADMIN,
    glyph: "phone",
    startHour: 12,
    startMinute: 30,
    endHour: 12,
    endMinute: 45,
    priority: 4,
    oneOff: true,
  },
  {
    id: "walk",
    title: "Walk",
    type: "habit",
    category: CATEGORY_HEALTH,
    glyph: "tree-pine",
    startHour: 15,
    startMinute: 0,
    endHour: 15,
    endMinute: 30,
    priority: 4,
  },
  {
    id: "cook",
    title: "Cook",
    type: "habit",
    category: CATEGORY_HOME,
    glyph: "chef-hat",
    startHour: 18,
    startMinute: 0,
    endHour: 18,
    endMinute: 45,
    priority: 6,
  },
  {
    id: "read",
    title: "Read",
    type: "habit",
    category: CATEGORY_QUIET,
    glyph: "book-open",
    startHour: 21,
    startMinute: 0,
    endHour: 21,
    endMinute: 20,
    priority: 5,
  },
];

/** The item pillar 3 decides. */
export const DECIDED_ITEM_ID = "stretch";

/**
 * The two the example person did not do, so the hero and pillar 3 describe one
 * day rather than two.
 *
 * Pillar 3's night is five done, one *didn't do*, and the one being decided
 * (§5). If the hero ticked everything whose window had closed, a visitor
 * arriving at 10pm would count six done in the hero and read "5 done" in the
 * review — the kind of small lie a careful reader catches and a wary one
 * remembers. `read` is the *didn't do*; `stretch` is the decided one.
 */
const NEVER_DONE_IDS: readonly string[] = [DECIDED_ITEM_ID, "read"];

function instant(
  local: boolean,
  hour: number,
  minute: number,
  today: Date,
): Date {
  if (!local) {
    return new Date(
      Date.UTC(STATIC_DATE.year, STATIC_DATE.month, STATIC_DATE.day, hour, minute),
    );
  }
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    hour,
    minute,
    0,
    0,
  );
}

function toItem(spec: ExampleSpec, local: boolean, today: Date): DayItemView {
  const scheduledStart = instant(local, spec.startHour, spec.startMinute, today);
  const scheduledEnd = instant(local, spec.endHour, spec.endMinute, today);

  return {
    id: spec.id,
    // The landing page's day is an illustration; nothing in it links to a
    // library entry, and a one-off with no habit is exactly what null means.
    habitId: null,
    title: spec.title,
    icon: { kind: "curated", value: spec.glyph, colorKey: spec.category.key },
    type: spec.type,
    category: spec.category,
    timeMode: "fixed_time",
    scheduledStart,
    scheduledEnd,
    originalScheduledStart: scheduledStart,
    durationMin:
      (scheduledEnd.getTime() - scheduledStart.getTime()) / 60000,
    priority: spec.priority,
    scheduling: "soft",
    origin: spec.oneOff === true ? "one_off" : "template",
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
}

/**
 * The seven items. `local` false builds UTC instants (server and first client
 * render); `local` true builds today's instants in the device's zone.
 */
export function buildExampleItems(
  local: boolean,
  today: Date = new Date(),
): readonly DayItemView[] {
  return EXAMPLE_SPECS.map((spec) => toItem(spec, local, today));
}

/** One item by id, in the static clock. Throws only if the fixture is edited wrong. */
function staticItem(id: string): DayItemView {
  const spec = EXAMPLE_SPECS.find((candidate) => candidate.id === id);
  if (spec === undefined) {
    throw new Error(`Landing fixture has no item "${id}"`);
  }
  return toItem(spec, false, new Date());
}

/** The two rows pillar 2 shows: one done in its window, one done late. */
export function buildMovedRows(): readonly DayItemView[] {
  const run = staticItem("run");
  const stretch = staticItem(DECIDED_ITEM_ID);

  return [
    { ...run, state: "done", doneAt: run.scheduledEnd },
    {
      ...stretch,
      state: "done-off-schedule",
      // Done at 4:32 PM, hours after the 8:15 window it was planned for.
      doneAt: new Date(
        Date.UTC(STATIC_DATE.year, STATIC_DATE.month, STATIC_DATE.day, 16, 32),
      ),
    },
  ];
}

/** The item pillar 3 decides. UTC instants — the figure has no clock. */
export function buildDecidedItem(): DayItemView {
  return staticItem(DECIDED_ITEM_ID);
}

/**
 * Pillar 1's three rows: a planned day before it starts, so every one of them
 * is `upcoming` — no checkbox, no state word, nothing that has happened yet.
 */
export function buildPlannedRows(): readonly DayItemView[] {
  return ["run", "writing", "walk"].map((id) => staticItem(id));
}

/* ------------------------------------------------------------ day parts -- */

/** Official spec §6.4, from the fixture anchor. */
export function dayPartOf(minutesFromMidnight: number): DayPart {
  const fromAnchor = minutesFromMidnight - ANCHOR_MINUTES;
  if (fromAnchor < PART_LENGTH_MINUTES) return "morning";
  if (fromAnchor < PART_LENGTH_MINUTES * 2) return "afternoon";
  return "evening";
}

export interface ExampleGroup {
  part: DayPart;
  items: readonly DayItemView[];
}

/**
 * The three sections, in time order, empty parts omitted.
 *
 * Grouped from the spec's wall-clock times rather than from the built instants,
 * so the grouping is identical in both clock modes and cannot drift with the
 * device's zone. Keyed by id, not by position, so a caller may pass a subset.
 */
export function groupByDayPart(
  items: readonly DayItemView[],
): readonly ExampleGroup[] {
  const order: readonly DayPart[] = ["morning", "afternoon", "evening"];

  const partOf = (id: string): DayPart | null => {
    const spec = EXAMPLE_SPECS.find((candidate) => candidate.id === id);
    if (spec === undefined) return null;
    return dayPartOf(spec.startHour * 60 + spec.startMinute);
  };

  return order
    .map((part) => ({
      part,
      items: items.filter((item) => partOf(item.id) === part),
    }))
    .filter((group) => group.items.length > 0);
}

/* ---------------------------------------------------------------- clock -- */

/**
 * The one place the page reads the clock.
 *
 * `new Date(Date.now())` rather than `new Date()` on purpose: it is the form a
 * stubbed `Date.now` reaches, which is how SYS-6's three-clock acceptance check
 * is run without editing the source.
 */
export function readNow(): Date {
  return new Date(Date.now());
}

/**
 * The device's zone, or UTC where the browser will not say.
 *
 * SYS-2 made `detectTimezone` the codebase's ONE function that asks `Intl` what
 * zone the device is in, and it already falls back to `"UTC"` — which is
 * `STATIC_TIME_ZONE` — so this is now a name rather than a second
 * implementation. The signed-in app reaches the same value through
 * `useDeviceZone()`; this page is not in the shell and has no hook to use.
 */
export function deviceTimeZone(): string {
  return detectTimezone();
}

/** Minutes from the day's start, for the now line's `atMin`. */
export function nowLineMinutes(now: Date, timeZone: string): number {
  return minutesFromDayStart(now, ANCHOR_CLOCK, timeZone);
}

/* ------------------------------------------------------------ the state -- */

/**
 * A row's state, `docs/ux/landing-page-ux.md` §4.3.
 *
 * `now === null` is the server and the first client render: everything is
 * upcoming, nothing is checked, and there is no line. A day with nothing ticked
 * is a true day, just an early one — which is why the first paint is never
 * wrong, only early.
 *
 * NOTHING TICKS ITSELF DONE IN FRONT OF A PERSON (§4.3 rule 3, Decision 6). An
 * item whose window closes while the visitor watches becomes `passed`, silent
 * and faded. Only the set fixed at hydration, and the visitor's own taps, are
 * ever done.
 */
export function deriveState(
  item: DayItemView,
  now: Date | null,
  doneAt: Date | undefined,
): ItemState {
  if (now === null) return "upcoming";

  if (doneAt !== undefined) {
    const start = item.scheduledStart?.getTime() ?? 0;
    const end = item.scheduledEnd?.getTime() ?? 0;
    const at = doneAt.getTime();
    return at >= start && at <= end ? "done" : "done-off-schedule";
  }

  const start = item.scheduledStart?.getTime() ?? 0;
  const end = item.scheduledEnd?.getTime() ?? start;
  const at = now.getTime();

  if (at >= end) return "passed";
  if (at >= start) return "now";
  if (at >= start - SOON_WINDOW_MS) return "soon";
  return "upcoming";
}

/**
 * What was already done when the visitor arrived: everything whose window had
 * closed, except the two the example day leaves undone. Keyed id → `doneAt`,
 * which is the scheduled end, so those rows read `done` rather than `moved`.
 */
export function initialDone(
  items: readonly DayItemView[],
  now: Date,
): ReadonlyMap<string, Date> {
  const done = new Map<string, Date>();

  for (const item of items) {
    if (NEVER_DONE_IDS.includes(item.id)) continue;
    const end = item.scheduledEnd;
    if (end !== null && end.getTime() <= now.getTime()) {
      done.set(item.id, end);
    }
  }

  return done;
}

/**
 * The flat index the now line sits after — the last item whose window has
 * closed, or -1 when the day has not started, which puts the line above the
 * first row. Everything above the line is behind the visitor.
 */
export function nowLineAfterIndex(
  items: readonly DayItemView[],
  now: Date,
): number {
  let index = -1;

  items.forEach((item, position) => {
    const end = item.scheduledEnd;
    if (end !== null && end.getTime() <= now.getTime()) {
      index = position;
    }
  });

  return index;
}

/* --------------------------------------------------------- the review --- */

/**
 * The reasons pillar 3 offers.
 *
 * *Stayed on something more important* is deliberately absent: it is the one
 * reason that sends the real Day Review to DR-04 to pick the item traded up
 * to, and a landing page has no such screen. Leaving it out is how the figure
 * guarantees `onTradedUp` can never fire.
 */
export const EXAMPLE_REASONS: Readonly<
  Record<MissTier, readonly ReasonView[]>
> = {
  circumstance: [
    {
      key: "something_came_up",
      label: "Something came up",
      tier: "circumstance",
      builtIn: true,
    },
    { key: "unwell", label: "Not feeling well", tier: "circumstance", builtIn: true },
  ],
  scoping: [
    { key: "ran_long", label: "Earlier thing ran long", tier: "scoping", builtIn: true },
    { key: "slept_in", label: "Slept in", tier: "scoping", builtIn: true },
  ],
  chose_not_to: [],
};

/** The tier labels, for the decided line when a tier carries no reason. */
const TIER_LABEL: Record<MissTier, string> = {
  circumstance: "Something came up",
  scoping: "Planned it wrong",
  chose_not_to: "Didn't do it",
};

/**
 * The sentence `DecisionPanel` prints beside the weight.
 *
 * The panel renders `reasonText ?? reasonKey`, and its `onDecide` hands back a
 * key with a null text — so a caller that passes the payload straight through
 * shows a person the string `something_came_up`. Tier 3 is worse: it decides
 * with no reason at all and renders a bare "Missed —". Both are resolved here,
 * in the caller, without touching the component.
 * `[REVISIT — REV-2: the real Day Review hits the same two, and should fix them
 * in `DecisionPanel` rather than in every caller.]`
 */
export function reasonTextFor(
  tier: MissTier,
  reasonKey: string | null,
): string {
  if (reasonKey === null) return TIER_LABEL[tier];

  const match = EXAMPLE_REASONS[tier].find((reason) => reason.key === reasonKey);
  return match?.label ?? TIER_LABEL[tier];
}

export interface ReviewSums {
  terms: readonly FormulaTerm[];
  credit: number;
  counted: number;
  percent: number;
}

/**
 * The example night's arithmetic — `docs/ux/landing-page-ux.md` §5.
 *
 * Five done, one *didn't do* (Read), and the item being decided. The weights
 * are official spec §7.3's: circumstance is excluded from the denominator,
 * scoping counts half, chose-not-to counts zero. Terms with a count of zero are
 * dropped by `FormulaSentence`, so all three cases share one shape.
 */
export function reviewSums(tier: MissTier): ReviewSums {
  const done = 5;
  const didntDo = tier === "chose_not_to" ? 2 : 1;
  const plannedWrong = tier === "scoping" ? 1 : 0;
  const notCounted = tier === "circumstance" ? 1 : 0;

  const credit = done + plannedWrong * 0.5;
  const counted = done + plannedWrong + didntDo;

  return {
    terms: [
      { count: done, label: "done" },
      { count: plannedWrong, label: "planned it wrong", weight: "½" },
      { count: didntDo, label: "didn't do", weight: "0" },
      { count: notCounted, label: "something came up", weight: "not counted" },
    ],
    credit,
    counted,
    percent: Math.round((credit / counted) * 100),
  };
}
