import { describe, expect, it } from "vitest";
import { WORK_SIZES } from "@syn/constants";
import { sizeOfEstimate } from "@syn/utils";
import { estimateForTeam } from "./estimate";

/** USE-102: Synapse's points (Quick to Huge) on each of Linear's scales. */
describe("estimateForTeam", () => {
  it.each([
    ["fibonacci", [1, 2, 3, 5, 8]],
    ["exponential", [1, 2, 4, 8, 16]],
    ["linear", [1, 2, 3, 4, 5]],
    ["tShirt", [1, 2, 3, 5, 8]],
    ["notUsed", [1, 2, 3, 5, 8]],
    [null, [1, 2, 3, 5, 8]],
  ])("%s", (scale, expected) => {
    expect([1, 2, 3, 5, 8].map((p) => estimateForTeam(p, scale))).toEqual(
      expected,
    );
  });

  it("no estimate, or none, clears it", () => {
    expect(estimateForTeam(null, "exponential")).toBeNull();
    expect(estimateForTeam(0, "exponential")).toBeNull();
  });
});

/** USE-112 C1: a size written on a team's scale reads back as the same size. */
describe("sizeOfEstimate on the team's scale", () => {
  it.each(["fibonacci", "exponential", "linear", "tShirt", "notUsed", null])(
    "%s round-trips Quick to Huge",
    (scale) => {
      expect(
        [1, 2, 3, 5, 8].map((p) =>
          sizeOfEstimate(estimateForTeam(p, scale), scale),
        ),
      ).toEqual([...WORK_SIZES]);
    },
  );

  it("exponential's Large (8) is Large, not Huge", () => {
    expect(sizeOfEstimate(8, "exponential")).toBe("large");
    expect(sizeOfEstimate(8, null)).toBe("huge");
  });

  it("off the scale takes the nearest, the smaller on a tie", () => {
    expect(sizeOfEstimate(3, "exponential")).toBe("small");
    expect(sizeOfEstimate(12, "exponential")).toBe("large");
    expect(sizeOfEstimate(32, "exponential")).toBe("huge");
    expect(sizeOfEstimate(8, "linear")).toBe("huge");
  });

  it("no estimate (or 0) stays unsized", () => {
    expect(sizeOfEstimate(null, "exponential")).toBeNull();
    expect(sizeOfEstimate(0, "linear")).toBeNull();
  });
});
