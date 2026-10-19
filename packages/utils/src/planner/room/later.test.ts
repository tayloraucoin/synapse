import { describe, expect, it } from "vitest";
import { applyChanges } from "./day";
import { fixtureDay, timesOf, UP_AT, WOKE_AT } from "./fixture-day";
import { moveLater } from "./later";
import { layoutFromWake } from "./wake";

const ORIENT_END = WOKE_AT + 5;

describe("C6: moveLater puts a passed block right after Orient and slides the blocks after it by its length", () => {
  const day = fixtureDay();
  const result = moveLater(day, { blockId: "wellness", orientEnd: ORIENT_END });
  if (result.kind !== "plan") throw new Error(result.reason);
  const after = applyChanges(day, result.plan.changes);

  it("puts the passed block right after Orient, keeping its length", () => {
    expect(timesOf(after, "wellness")).toEqual(["08:15", "09:10"]);
    expect(result.plan.summary.startsAt).toBe("08:15");
    expect(result.plan.summary.minutes).toBe(55);
  });

  it("slides the blocks after it by its length", () => {
    expect(timesOf(after, "training")).toEqual(["09:10", "09:52"]);
    expect(timesOf(after, "breakfast")).toEqual(["09:55", "10:25"]);
    expect(timesOf(after, "evening")).toEqual(["18:55", "23:25"]);
    expect(timesOf(after, "orient")).toEqual(["07:00", "07:05"]);
  });

  it("lands the same on the day laid out from the wake", () => {
    const wake = layoutFromWake(day, { upAt: UP_AT, wokeAt: WOKE_AT });
    const laidOut = applyChanges(day, wake.changes);
    const again = moveLater(laidOut, {
      blockId: "wellness",
      orientEnd: ORIENT_END,
    });
    if (again.kind !== "plan") throw new Error(again.reason);
    const moved = applyChanges(laidOut, again.plan.changes);
    for (const occurrence of after.blocks) {
      expect(timesOf(moved, occurrence.block.id)).toEqual(
        timesOf(after, occurrence.block.id),
      );
    }
  });

  it("refuses Orient and a block not on the day", () => {
    expect(
      moveLater(day, { blockId: "orient", orientEnd: ORIENT_END }),
    ).toMatchObject({
      reason: "not_eligible",
    });
    expect(
      moveLater(day, { blockId: "nope", orientEnd: ORIENT_END }),
    ).toMatchObject({
      reason: "unknown",
    });
  });
});
