import { slotRecord } from "@syn/validators";
import { todayBlockRoute } from "@/lib/routes";
import type { FixtureRecords } from "../records";
import { BASE_DATE } from "./base-day";
import type { Scenario } from "./index";
import { NOW_IDS, nowDayRecords, onNowDay, type NowItemName } from "./now-day";

/**
 * Block view from the day (USE-48; day/block-view/), on Now's Monday:
 * Wellness 7:05 to 8:00 with its five items, Training peeking at 8:00.
 * Opened from Review the day at 7:01 unless a state says otherwise; from
 * Schedule (`current`, `past`) the tabs show. Take each at
 * `/today/block/<Wellness>?state=block-view-<state>` (`BLOCK_VIEW_PATH`).
 *
 * - `success`: nothing checked. `checked-swipe`: two checked, Start the cold
 *   bath swiped open. `removed-undo`: Start the cold bath off today, the
 *   toast held with Undo. `header-menu`, `delete-confirm`: ··· open, and
 *   Delete block's confirm. `edit-dragging`: Edit on, Cold bath held above
 *   Meditate. `current`: 7:14 from Schedule, three checked. `past`: 9:40,
 *   four checked. `loading` (and `partial`, N/A, rendering as loading),
 *   `error`: the rows' own read under a painted header. `offline`: one
 *   checked offline.
 */

export const BLOCK_VIEW_PATH = todayBlockRoute(NOW_IDS.blocks.wellness);

const STAMP = "2026-10-01T12:00:00.000Z";

/** The Monday with `removed` off today: its slot skipped on the date. */
function removedRecords(removed: NowItemName): FixtureRecords {
  const records = nowDayRecords([]);
  records.slots.push(
    slotRecord.parse({
      createdAt: STAMP,
      updatedAt: STAMP,
      id: NOW_IDS.slots[removed],
      blockId: NOW_IDS.blocks.wellness,
      onDate: BASE_DATE,
      skipped: true,
      sortOrder: 2,
      blockItemId: NOW_IDS.items[removed],
      todoId: null,
      workItemId: null,
      tier: null,
      lengthMin: null,
      tookMin: null,
      doneAt: null,
    }),
  );
  return records;
}

function blockView(
  state: string,
  records: () => FixtureRecords,
  extra: Partial<Scenario> = {},
): [string, () => Scenario] {
  const name = `block-view-${state}`;
  return [
    name,
    () => ({
      name,
      now: onNowDay("07:01"),
      records: records(),
      mode: "ready",
      openedFrom: "review",
      ...extra,
    }),
  ];
}

const none = () => nowDayRecords([]);
const I = NOW_IDS.items;

export const BLOCK_VIEW_SCENARIOS: Record<string, () => Scenario> =
  Object.fromEntries([
    blockView("success", none),
    blockView("checked-swipe", () => nowDayRecords(["peeAndWeigh", "water"]), {
      view: { open: `swipe:${I.startColdBath}` },
    }),
    blockView("removed-undo", () => removedRecords("startColdBath"), {
      view: { open: `removed:${I.startColdBath}` },
    }),
    blockView("header-menu", none, { view: { open: "header-menu" } }),
    blockView("delete-confirm", none, { view: { open: "delete-confirm" } }),
    blockView("edit-dragging", none, {
      view: { drag: { itemId: I.coldBath, beforeId: I.meditate } },
    }),
    blockView(
      "current",
      () => nowDayRecords(["peeAndWeigh", "water", "startColdBath"]),
      { now: onNowDay("07:14"), openedFrom: "schedule" },
    ),
    blockView(
      "past",
      () =>
        nowDayRecords(["peeAndWeigh", "water", "startColdBath", "meditate"]),
      { now: onNowDay("09:40"), openedFrom: "schedule" },
    ),
    blockView("loading", none, { regions: { week: "loading" } }),
    // N/A: one block is one read; the key renders as loading (partial.md).
    blockView("partial", none, { regions: { week: "loading" } }),
    blockView("error", none, { regions: { week: "error" } }),
    blockView("offline", () => nowDayRecords(["peeAndWeigh"]), {
      offline: true,
    }),
  ]);
