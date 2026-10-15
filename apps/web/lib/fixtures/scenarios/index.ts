import type { InstallOverride } from "@/lib/pwa/use-install-state";
import type { FixtureRecords } from "../records";
import { ACCOUNT_SCENARIOS } from "./account";
import { BASE_NOW, baseRecords, emptyRecords } from "./base-day";
import { NOW_IDS, nowDayRecords, onNowDay } from "./now-day";
import { ORIENT_SCENARIOS } from "./orient-morning";
import { POOL_SCENARIOS } from "./pool";
import { RUNNING_SCENARIOS } from "./running";
import { SET_UP_SCENARIOS } from "./set-up";

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
  /** The avatar menu opens on load, so its states are reachable by `?state=` (USE-83). */
  accountMenuOpen?: boolean;
}

export interface ScenarioView {
  currentItemId?: string;
  open?: string;
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
  // ---- Orient (USE-12): the Monday before it is opened ----
  ...ORIENT_SCENARIOS,
  // ---- The avatar menu and the Install sheet (USE-83) ----
  ...ACCOUNT_SCENARIOS,
  // ---- Setting up the days (USE-36): the usual week, this week, the first day ----
  ...SET_UP_SCENARIOS,
  // ---- Running on Now (USE-23): Meditate's timer ----
  ...RUNNING_SCENARIOS,
  // ---- The pool and the work writes (USE-55): clients on, on this week ----
  ...POOL_SCENARIOS,
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
