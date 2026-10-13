import type { FixtureRecords } from "../records";
import { BASE_NOW, baseRecords, emptyRecords } from "./base-day";

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
}

export const DEFAULT_SCENARIO = "default";

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
