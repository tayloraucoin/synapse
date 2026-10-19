import { MEAL_TOPIC_IDS } from "./base-day";
import type { Scenario } from "./index";
import { nowDayRecords, onNowDay } from "./now-day";

/**
 * A meal on Now and the Meal topics sheet (USE-22; day/now/states
 * meal-pick-topic, meal-topic-picked; interactions/meal-topics): Breakfast on
 * Taylor's Monday, Wellness and Training behind it. Each `now` is its frame's
 * minute.
 */

/** Wellness done by Breakfast, as USE-17's `transition`. */
const WELLNESS_ALL = [
  "peeAndWeigh",
  "water",
  "startColdBath",
  "meditate",
  "coldBath",
] as const;

export const MEAL_TOPIC_SCENARIOS: Record<string, () => Scenario> = {
  "meal-pick-topic": () => ({
    name: "meal-pick-topic",
    now: onNowDay("09:02"),
    records: nowDayRecords(WELLNESS_ALL),
    mode: "ready",
  }),
  "meal-topic-picked": () => ({
    name: "meal-topic-picked",
    now: onNowDay("09:04"),
    records: nowDayRecords(WELLNESS_ALL),
    mode: "ready",
    view: { open: `topic:${MEAL_TOPIC_IDS.agentWorkflows}` },
  }),
  "meal-topics-sheet": () => ({
    name: "meal-topics-sheet",
    now: onNowDay("09:02"),
    records: nowDayRecords(WELLNESS_ALL),
    mode: "ready",
    view: { open: "sheet:meal-topics" },
  }),
};
