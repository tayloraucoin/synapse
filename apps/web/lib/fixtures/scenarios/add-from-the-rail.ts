import type { AddForm, AddStart } from "@/components/planner/add-sheet";
import { FIRST_CHANGE, RAIL_HINT } from "@/lib/data/review-first-times";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { NOW_IDS, onNowDay } from "./now-day";
import { REVIEW_IDS, reviewDayRecords } from "./review-day";

/**
 * Add from the rail (USE-54; add-from-the-rail/), over Review the day on
 * Taylor's Monday at 6:58. `rail-` names, as `add-sheet` is "+ Add"'s
 * (USE-51). Each opens on what its capture shows, through `railAddSeedOf`.
 */

/**
 * Work 9:30 to 12:00 full: the linked item 60 min, the Primary 60 and the
 * Secondary 30, so 15 more minutes at 10:15 ask where they come from.
 */
function fullWorkRecords(): FixtureRecords {
  const records = reviewDayRecords();
  const lengths: Record<string, number> = {
    [REVIEW_IDS.slots.linked]: 60,
    [REVIEW_IDS.slots.primary]: 60,
    [REVIEW_IDS.slots.secondary]: 30,
  };
  return {
    ...records,
    slots: records.slots.map((slot) =>
      slot.id in lengths ? { ...slot, lengthMin: lengths[slot.id]! } : slot,
    ),
  };
}

/** What a scenario opens on. */
export interface RailAddSeed {
  /** The + held mid-drag at this time (rail-drag.md). */
  drag?: string;
  /** The add sheet open from here, with these fields typed. */
  sheet?: AddStart & { fields?: Partial<AddForm> };
  /** An add with room run on load, its Toaster held until Undo. */
  added?: AddStart & { fields: Partial<AddForm> };
}

const NEW_WORK_ITEM = "[New work item]";

const SEEDS: Record<string, RailAddSeed> = {
  "rail-drag": { drag: "10:15" },
  "rail-add-sheet": {
    sheet: { at: "10:15", fields: { title: NEW_WORK_ITEM } },
  },
  "rail-add-preset-tier": {
    sheet: { blockId: NOW_IDS.blocks.work, tier: "primary" },
  },
  "rail-added-undo": {
    added: { at: "10:15", fields: { title: NEW_WORK_ITEM } },
  },
};

export const railAddSeedOf = (name: string): RailAddSeed | undefined =>
  SEEDS[name];

/** Both one-time lines seen, so neither covers a capture. */
const SEEN = [RAIL_HINT, FIRST_CHANGE];

function rail(name: string, records: FixtureRecords): () => Scenario {
  return () => ({
    name,
    now: onNowDay("06:58"),
    records,
    mode: "ready",
    startedOnDevice: false,
    seen: SEEN,
  });
}

export const RAIL_ADD_SCENARIOS: Record<string, () => Scenario> = {
  // Holding the + at 10:15: the tag, the rail line, the guide across Work.
  "rail-drag": rail("rail-drag", fullWorkRecords()),
  // Released at 10:15 in a full Work: the foot line says Add asks.
  "rail-add-sheet": rail("rail-add-sheet", fullWorkRecords()),
  // An empty Work block's Add to Primary: the tier preset, no Starts.
  "rail-add-preset-tier": rail(
    "rail-add-preset-tier",
    reviewDayRecords({ work: false }),
  ),
  // Added with room at 10:15: in Work as Secondary, Undo in the Toaster.
  "rail-added-undo": rail("rail-added-undo", reviewDayRecords()),
};
