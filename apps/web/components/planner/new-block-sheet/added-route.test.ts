import { describe, expect, it } from "vitest";
import { addedRoute } from "./added-route";

// USE-147: Add block lands in the new block's Block view.

describe("addedRoute", () => {
  it("opens the usual weekday's Block view for a block added to the usual week", () => {
    expect(
      addedRoute("b1", { mode: "block" }, { weekday: 2, date: null }),
    ).toBe("/days/block/b1?weekday=wed");
  });

  it("opens the date's Block view for a block added from This week", () => {
    expect(
      addedRoute("b1", { mode: "block" }, { weekday: 3, date: "2026-10-22" }),
    ).toBe("/days/block/b1?date=2026-10-22");
  });

  it("returns null for a transition, or no id", () => {
    expect(
      addedRoute("t1", { mode: "transition" }, { weekday: 0, date: null }),
    ).toBeNull();
    expect(addedRoute("", { mode: "block" }, { weekday: 0, date: null })).toBeNull();
  });
});
