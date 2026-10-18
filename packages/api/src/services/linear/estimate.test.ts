import { describe, expect, it } from "vitest";
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
