import type { ProfileSheetStart } from "@/lib/data/use-profile";
import type { ReminderDevice } from "@/lib/pwa/reminder-availability";
import type { InstallOverride } from "@/lib/pwa/use-install-state";
import type { FixtureRecords } from "../records";
import { ACCOUNT_SCENARIOS } from "./account";
import { ADD_SCENARIOS } from "./add";
import { RAIL_ADD_SCENARIOS } from "./add-from-the-rail";
import { BASE_NOW, baseRecords, emptyRecords } from "./base-day";
import { BLOCK_VIEW_SCENARIOS } from "./block-view";
import { BLOCK_EDIT_SCENARIOS } from "./block-view-editing";
import { CLOSE_THE_DAY_SCENARIOS } from "./close-the-day";
import { FROM_LINEAR_SCENARIOS } from "./from-linear";
import { INTEGRATION_SCENARIOS } from "./integrations";
import { ITEM_SHEET_SCENARIOS } from "./item-sheet";
import { MEAL_TOPIC_SCENARIOS } from "./meal-topics";
import { NEW_BLOCK_SCENARIOS, type NewBlockScenarioStart } from "./new-block";
import { NOW_IDS, nowDayRecords, onNowDay } from "./now-day";
import { NOW_END_SCENARIOS } from "./now-end";
import { NOW_FORM_SCENARIOS } from "./now-forms";
import { NOW_SYSTEM_SCENARIOS } from "./now-system";
import { ORIENT_SCENARIOS } from "./orient-morning";
import { PLACE_SHEET_SCENARIOS } from "./place-sheet";
import { POOL_SCENARIOS } from "./pool";
import { POOL_SHEET_SCENARIOS } from "./pool-sheet";
import { READY_SCENARIOS } from "./ready-welcome";
import { REVIEW_SCENARIOS } from "./review-day";
import { RUNNING_SCENARIOS } from "./running";
import { SCHEDULE_SCENARIOS } from "./schedule";
import { SET_UP_SCENARIOS, type SetUpScenarioStart } from "./set-up";
import { SETTINGS_SCENARIOS } from "./settings";
import { SPREAD_PHONE_SCENARIOS } from "./spread";
import { THIS_WEEK_DAY_SCENARIOS } from "./this-week-day";
import {
  GESTURE_SCENARIOS,
  STEP_AWAY_SCENARIOS,
  TODAY_DESK_SCENARIOS,
} from "./today-desk";
import { TODAY_EMPTY_SCENARIOS } from "./today-empty";
import { TODAY_LINEAR_SCENARIOS } from "./today-linear";
import { TODAY_MEETING_SCENARIOS } from "./today-meetings";
import { TODO_SHEET_SCENARIOS } from "./todo-sheet";
import { TODOS_SCENARIOS } from "./todos-tray";
import { WEEK_SCENARIOS } from "./week";

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
  /**
   * A region's own read waits or fails while the rest reads (USE-19: the
   * to-dos; USE-72: the Week, with the pool live; USE-57: Today's tiers wait
   * on it).
   */
  regions?: {
    todos?: "loading" | "error";
    week?: "loading" | "error";
    /** Set my days' column alone (USE-39): the header, chips and bounds paint. */
    setUpColumn?: "loading" | "error";
  };
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
  /**
   * Where the screen was opened from (USE-44): "review" stands for
   * `?from=review`, so a past day's journal reads as Review opens it;
   * USE-48: Block view's crumb, focus and tabs, "schedule" with the tabs.
   */
  openedFrom?: "review" | "schedule";
  /**
   * One-time lines counted as already seen on this scenario (USE-37's rail
   * hint and first-change line), so a capture of another state is not
   * covered by them. Unset, a one-time line shows until its own dismissal.
   */
  seen?: string[];
  /** Where the New block sheet opens, and what its frame shows typed (USE-46). */
  newBlock?: NewBlockScenarioStart;
  /** Where Set my days opens and what its frame holds (USE-39). */
  setUp?: SetUpScenarioStart;
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
  /**
   * An edit staged on load (USE-37): a swap that arrives from the Item sheet
   * is run through `useDayEdits` when the frame opens, with its Toaster when
   * `toast` (held until Undo, for the capture).
   */
  staged?: { swap: { id: string; withId: string }; toast: boolean };
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
  // ---- Now's To-dos block and system states (USE-21) ----
  ...NOW_SYSTEM_SCENARIOS,
  ...NOW_END_SCENARIOS,
  ...ORIENT_SCENARIOS,
  // ---- The avatar menu and the Install sheet (USE-83) ----
  ...ACCOUNT_SCENARIOS,
  // ---- Setting up the days (USE-36): the usual week, this week, the first day ----
  ...SET_UP_SCENARIOS,
  // ---- The New block sheet (USE-46) ----
  ...NEW_BLOCK_SCENARIOS,
  // ---- Running on Now (USE-23): Meditate's timer ----
  ...RUNNING_SCENARIOS,
  // ---- The To-dos tray (USE-19): open, carried, empty, from a reminder, its failures ----
  ...TODOS_SCENARIOS,
  // ---- The pool and the work writes (USE-55): clients on, on this week ----
  ...POOL_SCENARIOS,
  // ---- The phone's pool sheet (USE-79): its tabs, filters, search, empty ----
  ...POOL_SHEET_SCENARIOS,
  // ---- Spread on the phone (USE-78): the full sheet and Days and tier ----
  ...SPREAD_PHONE_SCENARIOS,
  // ---- Place on the phone (USE-80): the place sheet, placed with Undo, doesn't fit ----
  ...PLACE_SHEET_SCENARIOS,
  // ---- This week's day on the phone (USE-81): work tiers, Pool, the edges ----
  ...THIS_WEEK_DAY_SCENARIOS,
  // ---- Linear, Google and clients (USE-56): off, a failed write, closed in Linear, clients ----
  ...INTEGRATION_SCENARIOS,
  // ---- Settings › Connections, clients on, and its two sheets (USE-86) ----
  ...SETTINGS_SCENARIOS,
  // ---- + Add and New task (USE-51): Monday during Work, and the pool's New task ----
  ...ADD_SCENARIOS,
  // ---- Add from the rail (USE-54), over Review the day ----
  ...RAIL_ADD_SCENARIOS,
  ...FROM_LINEAR_SCENARIOS,
  // ---- Review the day (USE-31): the Monday at 6:58, before Ready, go ----
  ...REVIEW_SCENARIOS,
  // ---- The Ready, go welcome (USE-43): plain, first go ever, late wake, checklist day, offline ----
  ...READY_SCENARIOS,
  // ---- The Item sheet (USE-64): a plain item, ···, at a set time, Swap ----
  ...ITEM_SHEET_SCENARIOS,
  // ---- Schedule (USE-27): during go, the marks, the checklist day, a meeting ----
  ...SCHEDULE_SCENARIOS,
  // ---- Block view from the day (USE-48): checked, removed, Edit, current, past ----
  ...BLOCK_VIEW_SCENARIOS,
  // ---- Block view in editing, from Set my days (USE-49) ----
  ...BLOCK_EDIT_SCENARIOS,
  // ---- Close the day (USE-44): writing, empty, offline, read only ----
  ...CLOSE_THE_DAY_SCENARIOS,
  // ---- The To-do sheet (USE-28): its six drawn states, a failed change, offline ----
  ...TODO_SHEET_SCENARIOS,
  // ---- The Week (USE-72): the Priority lens, empty, a past day, loading, error, offline ----
  ...WEEK_SCENARIOS,
  ...TODAY_DESK_SCENARIOS,
  ...TODAY_LINEAR_SCENARIOS,
  ...TODAY_MEETING_SCENARIOS,
  ...STEP_AWAY_SCENARIOS,
  // ---- Today with nothing slotted (USE-82): nothing planned, no work slotted ----
  ...TODAY_EMPTY_SCENARIOS,
  ...GESTURE_SCENARIOS,
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
