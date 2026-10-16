import { LATER_START } from "@/lib/data/later-start-flag";
import { FIRST_CHANGE, RAIL_HINT } from "@/lib/data/review-first-times";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { onSunday } from "./now-forms";
import { checklistDayRecords, SCHEDULE_IDS } from "./schedule";

/**
 * Review the day on a loose Sunday (USE-40; review-the-day/states/sunday-
 * *.md), oriented at 8:35 and not yet readied, on Schedule's Sunday records.
 *
 * - `review-sunday-nothing-set` (and `review-empty`, D-USE-68): no block,
 *   no checklist, no event.
 * - `review-sunday-making-the-checklist`: the checklist with three rows,
 *   "Meal prep" typed in the open row.
 * - `review-sunday-checklist-and-plans`: the four rows in the All day
 *   strip, none checked; Lunch with Sam at 13:00 on the rail.
 * - `review-sunday-now-line`: the same at 11:20.
 *
 * Bracketed rows are the boards' placeholders, as Schedule's.
 */

/** The Sunday as Review the day finds it: oriented, not readied. */
function sundayRecords(
  shape: (records: FixtureRecords) => FixtureRecords,
): FixtureRecords {
  const records = checklistDayRecords();
  records.slots = [];
  records.dayRecords = records.dayRecords.map((record) => ({
    ...record,
    orientedAt: onSunday("08:35"),
    readyAt: null,
  }));
  return shape(records);
}

const nothingSet = () =>
  sundayRecords((records) => ({
    ...records,
    blocks: [],
    blockItems: [],
    dayEvents: [],
  }));

/** The three kept rows; "Meal prep" is still being typed. */
const making = () =>
  sundayRecords((records) => ({
    ...records,
    blockItems: records.blockItems.filter(
      (item) => item.id !== SCHEDULE_IDS.sundayItems[3],
    ),
    dayEvents: [],
  }));

const withPlans = () => sundayRecords((records) => records);

function sunday(
  name: string,
  records: () => FixtureRecords,
  extra: Partial<Scenario> = {},
): () => Scenario {
  return () => ({
    name,
    now: onSunday("08:40"),
    records: records(),
    mode: "ready",
    startedOnDevice: false,
    // A usual morning: the one-time lines and A later start already seen.
    seen: [RAIL_HINT, FIRST_CHANGE, LATER_START],
    ...extra,
  });
}

export const REVIEW_SUNDAY_SCENARIOS: Record<string, () => Scenario> = {
  "review-sunday-nothing-set": sunday("review-sunday-nothing-set", nothingSet),
  // D-USE-68: the Saturday frame is not built; empty is the Sunday's ask.
  "review-empty": sunday("review-empty", nothingSet),
  "review-sunday-making-the-checklist": sunday(
    "review-sunday-making-the-checklist",
    making,
    { view: { checklist: { draft: "Meal prep" } } },
  ),
  "review-sunday-checklist-and-plans": sunday(
    "review-sunday-checklist-and-plans",
    withPlans,
  ),
  "review-sunday-now-line": sunday("review-sunday-now-line", withPlans, {
    now: onSunday("11:20"),
  }),
};
