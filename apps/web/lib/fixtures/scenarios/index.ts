import type { ProfileSheetStart } from "@/lib/data/use-profile";
import type { ReminderDevice } from "@/lib/pwa/reminder-availability";
import type { InstallOverride } from "@/lib/pwa/use-install-state";
import type { FixtureRecords } from "../records";
import { ACCOUNT_SCENARIOS } from "./account";
import { ADD_SCENARIOS } from "./add";
import { BASE_NOW, baseRecords, emptyRecords } from "./base-day";
import { ITEM_SHEET_SCENARIOS } from "./item-sheet";
import { INTEGRATION_SCENARIOS } from "./integrations";
import { MEAL_TOPIC_SCENARIOS } from "./meal-topics";
import { NOW_IDS, nowDayRecords, onNowDay } from "./now-day";
import { NOW_END_SCENARIOS } from "./now-end";
import { NOW_FORM_SCENARIOS } from "./now-forms";
import { ORIENT_SCENARIOS } from "./orient-morning";
import { POOL_SCENARIOS } from "./pool";
import { REVIEW_SCENARIOS } from "./review-day";
import { RUNNING_SCENARIOS } from "./running";
import { SET_UP_SCENARIOS } from "./set-up";
import { TODO_SHEET_SCENARIOS } from "./todo-sheet";
import { TODOS_SCENARIOS } from "./todos-tray";

/**
 * Scenarios: one named set of records per `?state=` (canon C-P08). This file
 * holds the base set; each wave 2 ticket adds its surface's names here.
 */

export type ScenarioMode = "ready" | "loading" | "error";

export interface Scenario {
  name: string;
  /** The fixed instant the fixture clock starts from, so captures are stable. */
  now: string;
  records: FixtureRecords;
  /** `loading` never settles; `error` rejects until retried. */
  mode: ScenarioMode;
  /**
   * The UI a capture starts in (USE-16), read once through `source.ts`: the
   * item made current, and what is open, as `<what>:<item id>` ("took:…",
   * "time-taken:…"). Later tickets add their menus and sheets to `open`.
   */
  view?: ScenarioView;
  /**
   * Whether Start was tapped on this device today (USE-12): it has no column
   * and is remembered per device. Unset is started, so a surface's scenario
   * lands on Now; Orient's set it false.
   */
  startedOnDevice?: boolean;
  /** Orient's reading alone waits or fails; everything else reads. */
  reading?: "loading" | "error";
  /** No connection: reads come from cache, writes wait (USE-12). */
  offline?: boolean;
  /** Stands the install check on a device for a capture (USE-83); unset, the device's own. */
  install?: InstallOverride;
  /** Stands the reminder check on a device for a capture (USE-28); unset, the device's own. */
  device?: Partial<ReminderDevice>;
  /** A region's own read waits or fails while the day reads (USE-19: the to-dos). */
  regions?: { todos?: "loading" | "error" };
  /** Record ids whose next write rejects once, then goes through (USE-19). */
  failWrites?: string[];
  /** The avatar menu opens on load, so its states are reachable by `?state=` (USE-83). */
  accountMenuOpen?: boolean;
  /**
   * The screen was reached by its tab, not opened (USE-17; D-USE-5): the
   * entry tree does not send it on, so the List before Ready, go shows.
   */
  reachedByTab?: boolean;
  /**
   * The profile's writes (USE-84): `fail` refuses the name and the photo as a
   * server error would; `hang` leaves an upload under way, for its capture.
   */
  profileWrites?: "fail" | "hang";
  /** Where the Profile sheet starts, so its states are reachable by `?state=`. */
  profileSheet?: ProfileSheetStart;
  /** `fail`: each Linear write's first send fails, and Try again sends it (USE-56). */
  linearSends?: "fail";
  /** Linear issue ids the next sync finds closed (USE-56). */
  linearClosesOnSync?: string[];
}

export type { ProfileSheetStart };

export interface ScenarioView {
  currentItemId?: string;
  open?: string;
  /**
   * A row held mid-drag, drawn above `beforeId` (USE-18's `reordering`
   * capture only; never reachable outside `?state=`).
   */
  drag?: { itemId: string; beforeId: string };
  /**
   * The all-done parts a frame does not draw (USE-20): the three 7:34
   * frames are one moment, so each capture holds back the rest. `false`
   * hides; unset shows as live.
   */
  ending?: { addRow?: false; ahead?: false };
}

export const DEFAULT_SCENARIO = "default";

/** Wellness's first three items, checked by 7:14 on Now's Monday. */
const WELLNESS_DONE = ["peeAndWeigh", "water", "startColdBath"] as const;

const SCENARIOS: Record<string, () => Scenario> = {
  default: () => ({
    name: "default",
    now: BASE_NOW,
    records: baseRecords(),
    mode: "ready",
  }),
  empty: () => ({
    name: "empty",
    now: BASE_NOW,
    records: emptyRecords(),
    mode: "ready",
  }),
  loading: () => ({
    name: "loading",
    now: BASE_NOW,
    records: baseRecords(),
    mode: "loading",
  }),
  error: () => ({
    name: "error",
    now: BASE_NOW,
    records: baseRecords(),
    mode: "error",
  }),
  // ---- Now (USE-16): Taylor's Monday, mid-Wellness ----
  success: () => ({
    name: "success",
    now: onNowDay("07:14"),
    records: nowDayRecords(WELLNESS_DONE),
    mode: "ready",
  }),
  "done-next-lifts": () => ({
    name: "done-next-lifts",
    now: onNowDay("07:20"),
    records: nowDayRecords([...WELLNESS_DONE, "meditate"]),
    mode: "ready",
    view: { open: `took:${NOW_IDS.items.meditate}` },
  }),
  "row-tapped": () => ({
    name: "row-tapped",
    now: onNowDay("07:14"),
    records: nowDayRecords(WELLNESS_DONE),
    mode: "ready",
    view: { currentItemId: NOW_IDS.items.coldBath },
  }),
  "took-change": () => ({
    name: "took-change",
    now: onNowDay("07:14"),
    records: nowDayRecords(WELLNESS_DONE),
    mode: "ready",
    view: { open: `took:${NOW_IDS.items.startColdBath}` },
  }),
  "time-taken-sheet": () => ({
    name: "time-taken-sheet",
    now: onNowDay("07:14"),
    records: nowDayRecords(WELLNESS_DONE),
    mode: "ready",
    view: { open: `time-taken:${NOW_IDS.items.startColdBath}` },
  }),
  // ---- A meal's topics and the Meal topics sheet (USE-22) ----
  ...MEAL_TOPIC_SCENARIOS,
  // ---- Now's rows (USE-18): the long-press menu and a drag held mid-air ----
  "row-long-press": () => ({
    name: "row-long-press",
    now: onNowDay("07:14"),
    records: nowDayRecords(WELLNESS_DONE),
    mode: "ready",
    view: { open: `menu:${NOW_IDS.items.coldBath}` },
  }),
  reordering: () => ({
    name: "reordering",
    now: onNowDay("07:14"),
    records: nowDayRecords(WELLNESS_DONE),
    mode: "ready",
    view: {
      drag: {
        itemId: NOW_IDS.items.coldBath,
        beforeId: NOW_IDS.items.meditate,
      },
    },
  }),
  // ---- Orient (USE-12): the Monday before it is opened ----
  // ---- Now's other block forms (USE-17): ···, behind, a meal, before go, checklists ----
  ...NOW_FORM_SCENARIOS,
  // ---- Now at a block's end and the day's (USE-20): all done, ahead, empties ----
  ...NOW_END_SCENARIOS,
  ...ORIENT_SCENARIOS,
  // ---- The avatar menu and the Install sheet (USE-83) ----
  ...ACCOUNT_SCENARIOS,
  // ---- Setting up the days (USE-36): the usual week, this week, the first day ----
  ...SET_UP_SCENARIOS,
  // ---- Running on Now (USE-23): Meditate's timer ----
  ...RUNNING_SCENARIOS,
  // ---- The To-dos tray (USE-19): open, carried, empty, from a reminder, its failures ----
  ...TODOS_SCENARIOS,
  // ---- The pool and the work writes (USE-55): clients on, on this week ----
  ...POOL_SCENARIOS,
  // ---- Linear, Google and clients (USE-56): off, a failed write, closed in Linear, clients ----
  ...INTEGRATION_SCENARIOS,
  // ---- + Add and New task (USE-51): Monday during Work, and the pool's New task ----
  ...ADD_SCENARIOS,
  // ---- Review the day (USE-31): the Monday at 6:58, before Ready, go ----
  ...REVIEW_SCENARIOS,
  // ---- The Item sheet (USE-64): a plain item, ···, at a set time, Swap ----
  ...ITEM_SHEET_SCENARIOS,
  // ---- The To-do sheet (USE-28): its six drawn states, a failed change, offline ----
  ...TODO_SHEET_SCENARIOS,
};

export function scenarioNames(): string[] {
  return Object.keys(SCENARIOS);
}

/** A `?state=` value to its scenario, fresh each call; unknown or missing is the default. */
export function resolveScenario(name: string | null): Scenario {
  const make =
    (name !== null && Object.hasOwn(SCENARIOS, name)
      ? SCENARIOS[name]
      : undefined) ?? SCENARIOS[DEFAULT_SCENARIO]!;
  return make();
}
