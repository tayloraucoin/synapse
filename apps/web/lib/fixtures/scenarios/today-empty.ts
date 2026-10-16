import { slotRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { POOL_IDS } from "./pool";
import { poolPanelRecords } from "./pool-panel";
import { TODAY_DESK_NOW, todayWorkRecords } from "./today-desk";
import { WEEK_IDS } from "./week";

/**
 * Today with nothing slotted (USE-82): work's Monday 12 October with every
 * session taken off the week, the pool panel's records (USE-74) beside it.
 * Sunday planning didn't happen.
 *
 * `today-nothing-planned` (8:40, Training, at the desk) leaves Friday 9's
 * [Audit log export] open in Primary and [SMS copy] in Secondary; Friday's
 * [Portal sign-in] was done, and Thursday's [Invoice template] is a day
 * earlier, so neither is offered. `today-nothing-planned-now` (10:20, inside
 * Work, on the phone) leaves the phone board's three: [Portal sign-in]
 * Primary, [SMS copy] Secondary, [Invoice template] Stretch.
 * `today-no-work-slotted` (10:20): Friday's one session was done, so nothing
 * was left open to offer. Bracketed names are the boards' placeholders.
 */

const STAMP = "2026-10-09T12:00:00.000Z";

/** USE-82's slots count from 821, clear of the week's and the loop's. */
export const TODAY_EMPTY_IDS = {
  friday: {
    audit: fixtureId(3, 821),
    sms: fixtureId(3, 822),
    portal: fixtureId(3, 823),
    invoice: fixtureId(3, 824),
  },
  thursdayInvoice: fixtureId(3, 825),
} as const;

const FRIDAY = "2026-10-09";
const THURSDAY = "2026-10-08";

type Tier = "primary" | "secondary" | "stretch";

function session(
  id: string,
  workItemId: string,
  onDate: string,
  tier: Tier,
  sortOrder: number,
  doneAt: string | null = null,
) {
  return slotRecord.parse({
    id,
    createdAt: STAMP,
    updatedAt: STAMP,
    blockId: WEEK_IDS.blocks.workMorning,
    onDate,
    skipped: false,
    sortOrder,
    blockItemId: null,
    todoId: null,
    workItemId,
    tier,
    lengthMin: null,
    tookMin: doneAt ? 50 : null,
    doneAt,
  });
}

/** The Monday with no work on any day, then `left` as the earlier days' sessions. */
function emptyWeekRecords(left: ReturnType<typeof session>[]): FixtureRecords {
  const records = todayWorkRecords();
  const unplaced = {
    ...records,
    slots: records.slots.filter((slot) => slot.workItemId === null),
  };
  const panel = poolPanelRecords(unplaced);
  return { ...panel, slots: [...panel.slots, ...left] };
}

const W = WEEK_IDS.workItems;
const F = TODAY_EMPTY_IDS.friday;
const DONE_FRIDAY = "2026-10-09T15:40:00.000Z";

function scenario(
  name: string,
  now: string,
  left: () => ReturnType<typeof session>[],
): () => Scenario {
  return () => ({
    name,
    now,
    records: emptyWeekRecords(left()),
    mode: "ready",
  });
}

export const TODAY_EMPTY_SCENARIOS: Record<string, () => Scenario> = {
  "today-nothing-planned": scenario(
    "today-nothing-planned",
    "2026-10-12T08:40:00-04:00",
    () => [
      session(F.portal, W.kes42, FRIDAY, "primary", 0, DONE_FRIDAY),
      session(F.audit, POOL_IDS.workItems.kes58, FRIDAY, "primary", 1),
      session(F.sms, W.kes51, FRIDAY, "secondary", 2),
      session(
        TODAY_EMPTY_IDS.thursdayInvoice,
        W.invoice,
        THURSDAY,
        "stretch",
        0,
      ),
    ],
  ),
  "today-nothing-planned-now": scenario(
    "today-nothing-planned-now",
    TODAY_DESK_NOW,
    () => [
      session(F.portal, W.kes42, FRIDAY, "primary", 0),
      session(F.sms, W.kes51, FRIDAY, "secondary", 1),
      session(F.invoice, W.invoice, FRIDAY, "stretch", 2),
    ],
  ),
  "today-no-work-slotted": scenario(
    "today-no-work-slotted",
    TODAY_DESK_NOW,
    () => [session(F.portal, W.kes42, FRIDAY, "primary", 0, DONE_FRIDAY)],
  ),
};
