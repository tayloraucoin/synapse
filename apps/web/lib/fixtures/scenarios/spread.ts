import { fixtureId } from "../ids";
import type { Scenario } from "./index";
import { POOL_SHEET_IDS, poolSheetRecords } from "./pool-sheet";

/**
 * Spread on the phone (USE-78): the pool sheet's this week (USE-79's
 * records), Monday 12 at 21:10 as the boards' status bar, so Monday's
 * Morning Work has begun ("today, already past 9:30"). [Brand site: case
 * study template] (ALD-22, 8 Huge) is given 10 h, the board's Hours left
 * [ASSUMPTION: the size alone names no hours]. Friday is set as Thursday is,
 * so the board's Tue to Fri are all offered (the pool sheet's week leaves
 * Fri 16 not set).
 */

export const SPREAD_PHONE_NOW = "2026-10-12T21:10:00-04:00";
export const SPREAD_PHONE_ITEM = POOL_SHEET_IDS.workItems.ald22;

export type SpreadPhoneScenarioName = "spread-402" | "spread-days-and-tier";

function spreadPhone(name: SpreadPhoneScenarioName) {
  return (): Scenario => {
    const records = poolSheetRecords();
    const thursday = records.dayBounds.find((row) => row.weekday === 3);
    return {
      name,
      now: SPREAD_PHONE_NOW,
      records: {
        ...records,
        // Thursday's weekly blocks run on Friday too.
        blocks: records.blocks.map((block) =>
          block.rrule
            ? {
                ...block,
                rrule: block.rrule.replace(/(BYDAY=.*TH)$/m, "$1,FR"),
              }
            : block,
        ),
        dayBounds: thursday
          ? [
              ...records.dayBounds,
              { ...thursday, id: fixtureId(0, 879), weekday: 4 },
            ]
          : records.dayBounds,
        workItems: records.workItems.map((item) =>
          item.id === SPREAD_PHONE_ITEM ? { ...item, lengthMaxMin: 600 } : item,
        ),
      },
      mode: "ready",
    };
  };
}

export const SPREAD_PHONE_SCENARIOS: Record<string, () => Scenario> = {
  "spread-402": spreadPhone("spread-402"),
  "spread-days-and-tier": spreadPhone("spread-days-and-tier"),
};
