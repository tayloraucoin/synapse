import { describe, expect, it } from "vitest";
import { applyChanges, type RoomPlan } from "./day";
import { DATE, fixtureDay, timesOf, UP_AT } from "./fixture-day";
import { slideDay, type SlideSummary } from "./slide";

const day = fixtureDay();

function planOf(minutes: number, from = UP_AT): RoomPlan<SlideSummary> {
  const result = slideDay(day, { from, minutes });
  if (result.kind !== "plan") throw new Error(result.reason);
  return result.plan;
}

describe("C4: slideDay moves every block from a time by n minutes, set times staying", () => {
  const plan = planOf(70);
  const after = applyChanges(day, plan.changes);

  it("moves every block by exactly n, each keeping its length, passed blocks included", () => {
    expect(timesOf(after, "wellness")).toEqual(["08:15", "09:10"]);
    expect(timesOf(after, "training")).toEqual(["09:10", "10:07"]);
    expect(timesOf(after, "breakfast")).toEqual(["10:10", "10:40"]);
    expect(timesOf(after, "work")).toEqual(["10:40", "13:10"]);
    expect(timesOf(after, "work-pm")).toEqual(["14:10", "16:40"]);
    expect(timesOf(after, "evening")).toEqual(["19:10", "23:40"]);
  });

  it("never moves Orient", () => {
    expect(timesOf(after, "orient")).toEqual(["07:00", "07:05"]);
    expect(
      plan.changes.some((c) => "blockId" in c && c.blockId === "orient"),
    ).toBe(false);
  });

  it("lists each block's old start beside its new one", () => {
    expect(plan.summary.moves.slice(0, 4)).toEqual([
      { blockId: "wellness", from: "07:05", to: "08:15" },
      { blockId: "training", from: "08:00", to: "09:10" },
      { blockId: "breakfast", from: "09:00", to: "10:10" },
      { blockId: "work", from: "09:30", to: "10:40" },
    ]);
  });

  it("leaves a set-time item at its time, its block split around it, with no write to it", () => {
    expect(plan.summary.splits).toContainEqual({
      blockId: "work",
      id: "call-sam",
      at: "11:00",
    });
    expect(plan.changes.every((c) => c.kind.startsWith("block_"))).toBe(true);
    expect(after.blocks.flatMap((o) => o.slots)).toEqual(
      day.blocks.flatMap((o) => o.slots),
    );
  });

  it("leaves a day event at its time, the block that takes it in split around it", () => {
    expect(plan.summary.splits).toContainEqual({
      blockId: "lunch",
      id: "dentist",
      at: "14:00",
    });
  });

  it("reports the day's new end", () => {
    expect(plan.summary.dayEnd).toEqual({ from: "22:30", to: "23:40" });
  });

  it("moves only blocks from the time", () => {
    const later = applyChanges(day, planOf(30, 12 * 60).changes);
    expect(timesOf(later, "work")).toEqual(["09:30", "12:00"]);
    expect(timesOf(later, "lunch")).toEqual(["12:30", "13:30"]);
  });

  it("writes today only, as block_changes rows", () => {
    for (const change of plan.changes) expect(change.onDate).toBe(DATE);
  });

  it("refuses a slide that takes a block past midnight", () => {
    expect(slideDay(day, { from: UP_AT, minutes: 91 })).toEqual({
      kind: "refused",
      reason: "past_midnight",
      ids: ["evening"],
    });
    expect(slideDay(day, { from: UP_AT, minutes: 90 }).kind).toBe("plan");
  });
});
