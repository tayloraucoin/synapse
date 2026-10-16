import type { WorkTier } from "./next";

/**
 * Where a drop on a Work block files (USE-75; place-from-the-pool step 2t,
 * open-8 round 2): the first of Primary, Secondary and Stretch below its
 * usual number (D-USE-65's caps, USE-61's `TIER_USUAL`; none is no cap) and
 * with the item fitting at the top of its range. Urgent is only ever chosen,
 * never filed into. `null` when no tier has room: the caller says so and
 * writes nothing.
 */

export interface TierRoom {
  tier: WorkTier;
  /** The day's work already in the tier. */
  count: number;
  /** The tier's usual number; null has no cap. */
  usual: number | null;
  /** The item fits the block in this tier at the top of its range (`fitInBlock`). */
  fits: boolean;
}

const FILED: readonly WorkTier[] = ["primary", "secondary", "stretch"];

export function firstTierWithRoom(input: {
  tiers: readonly TierRoom[];
}): WorkTier | null {
  for (const tier of FILED) {
    const room = input.tiers.find((t) => t.tier === tier);
    if (!room) continue;
    if (room.usual !== null && room.count >= room.usual) continue;
    if (room.fits) return tier;
  }
  return null;
}
