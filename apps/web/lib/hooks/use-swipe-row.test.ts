import { describe, expect, it } from "vitest";
import {
  SWIPE_EDGE_PX,
  SWIPE_REVEAL_PX,
  swipeLock,
  swipeOutcome,
} from "./use-swipe-row";

// C1: fire past the reveal from beyond the edge zone; nothing inside the
// edge zone, short of the reveal, or on a firing row.
describe("swipeOutcome (C1)", () => {
  const away = SWIPE_EDGE_PX + 40;

  it("fires a rightward swipe past the reveal that starts beyond the edge", () => {
    expect(
      swipeOutcome({ startX: away, dx: SWIPE_REVEAL_PX, disabled: false }),
    ).toBe("fire");
    expect(
      swipeOutcome({ startX: away, dx: SWIPE_REVEAL_PX + 30, disabled: false }),
    ).toBe("fire");
  });

  it("leaves a swipe from the edge zone to the browser", () => {
    expect(
      swipeOutcome({ startX: 4, dx: SWIPE_REVEAL_PX + 60, disabled: false }),
    ).toBe("none");
    expect(
      swipeOutcome({
        startX: SWIPE_EDGE_PX - 1,
        dx: SWIPE_REVEAL_PX * 2,
        disabled: false,
      }),
    ).toBe("none");
  });

  it("does nothing short of the reveal", () => {
    expect(
      swipeOutcome({ startX: away, dx: SWIPE_REVEAL_PX - 1, disabled: false }),
    ).toBe("none");
    expect(swipeOutcome({ startX: away, dx: -80, disabled: false })).toBe(
      "none",
    );
  });

  it("does nothing on a firing row", () => {
    expect(
      swipeOutcome({ startX: away, dx: SWIPE_REVEAL_PX * 2, disabled: true }),
    ).toBe("none");
  });
});

describe("swipeLock", () => {
  it("waits on a small travel, locks rightward, lets a scroll go", () => {
    expect(swipeLock(4, 3)).toBeNull();
    expect(swipeLock(20, 6)).toBe("lock");
    expect(swipeLock(6, 20)).toBe("release");
    expect(swipeLock(-20, 2)).toBe("release");
  });
});
