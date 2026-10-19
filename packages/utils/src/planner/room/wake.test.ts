import { describe, expect, it } from "vitest";
import { applyChanges } from "./day";
import { DATE, fixtureDay, timesOf, UP_AT, WOKE_AT } from "./fixture-day";
import { layoutFromWake, offerLaterStart } from "./wake";

describe("C1: layoutFromWake lays the day out from the wake; offerLaterStart from 15 minutes past Up at", () => {
  const day = fixtureDay();
  const plan = layoutFromWake(day, { upAt: UP_AT, wokeAt: WOKE_AT });
  const after = applyChanges(day, plan.changes);

  it("puts Orient at the wake for its length, and never writes it", () => {
    expect(plan.summary.orient).toEqual({ startsAt: "08:10", endsAt: "08:15" });
    expect(timesOf(after, "orient")).toEqual(["07:00", "07:05"]);
  });

  it("folds every block that ends by Orient's end", () => {
    expect(plan.summary.folded).toEqual(["wellness"]);
    expect(timesOf(after, "wellness")).toEqual(["07:05", "08:00"]);
  });

  it("starts the block under way at Orient's end, keeping its end", () => {
    expect(plan.summary.underWay).toBe("training");
    expect(timesOf(after, "training")).toEqual(["08:15", "08:57"]);
    expect(plan.summary.firstBlockId).toBe("training");
  });

  it("leaves the rest where they were", () => {
    expect(plan.changes).toEqual([
      {
        kind: "block_times",
        blockId: "training",
        onDate: DATE,
        startsAt: "08:15",
        endsAt: "08:57",
      },
    ]);
  });

  it("reports the minutes late", () => {
    expect(plan.summary.minutesLate).toBe(70);
    expect(
      layoutFromWake(day, { upAt: UP_AT, wokeAt: UP_AT - 10 }).summary
        .minutesLate,
    ).toBe(0);
  });

  it("folds a block ending exactly at Orient's end", () => {
    const plan = layoutFromWake(day, { upAt: UP_AT, wokeAt: 8 * 60 + 52 });
    expect(plan.summary.folded).toEqual(["wellness", "training"]);
    expect(plan.summary.underWay).toBeNull();
    expect(plan.summary.firstBlockId).toBe("breakfast");
    expect(plan.changes).toEqual([]);
  });

  it("offers A later start from 15 minutes past Up at, never before", () => {
    expect(offerLaterStart({ upAt: UP_AT, wokeAt: UP_AT + 14 })).toBe(false);
    expect(offerLaterStart({ upAt: UP_AT, wokeAt: UP_AT + 15 })).toBe(true);
    expect(offerLaterStart({ upAt: UP_AT, wokeAt: WOKE_AT })).toBe(true);
    expect(offerLaterStart({ upAt: UP_AT, wokeAt: UP_AT })).toBe(false);
  });
});
