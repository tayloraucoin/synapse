import { describe, expect, it } from "vitest";
import { firstTierWithRoom, type TierRoom } from "./first-tier-with-room";

const room = (
  tier: TierRoom["tier"],
  count: number,
  usual: number | null,
  fits = true,
): TierRoom => ({ tier, count, usual, fits });

describe("C1: a Time lens drop files under the day's first tier with room", () => {
  it("takes Primary while it is below its usual number and the item fits", () => {
    expect(
      firstTierWithRoom({
        tiers: [room("primary", 1, 2), room("secondary", 0, 4)],
      }),
    ).toBe("primary");
  });

  it("passes a tier at its usual number to the next", () => {
    expect(
      firstTierWithRoom({
        tiers: [room("primary", 2, 2), room("secondary", 1, 4)],
      }),
    ).toBe("secondary");
  });

  it("passes a tier where the item does not fit at the top of its range", () => {
    expect(
      firstTierWithRoom({
        tiers: [
          room("primary", 0, 2, false),
          room("secondary", 4, 4),
          room("stretch", 3, null),
        ],
      }),
    ).toBe("stretch");
  });

  it("never files into Urgent, however much room it has", () => {
    expect(
      firstTierWithRoom({
        tiers: [room("urgent", 0, null), room("primary", 2, 2)],
      }),
    ).toBeNull();
  });

  it("reads the tiers in their own order, not the array's", () => {
    expect(
      firstTierWithRoom({
        tiers: [room("stretch", 0, null), room("primary", 0, 2)],
      }),
    ).toBe("primary");
  });

  it("returns none when no tier has room", () => {
    expect(
      firstTierWithRoom({
        tiers: [
          room("primary", 2, 2),
          room("secondary", 4, 4),
          room("stretch", 1, null, false),
        ],
      }),
    ).toBeNull();
  });
});
