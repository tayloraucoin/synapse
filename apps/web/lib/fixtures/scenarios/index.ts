import type { FixtureRecords } from "../records";
import { BASE_NOW, baseRecords, emptyRecords } from "./base-day";
import { NOW_IDS, nowDayRecords, onNowDay } from "./now-day";

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
