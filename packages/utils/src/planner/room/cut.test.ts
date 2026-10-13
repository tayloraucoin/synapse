import { describe, expect, it } from "vitest";
import { cutAndSlide, type CutSummary } from "./cut";
import { applyChanges, type RoomPlan } from "./day";
import { DATE, fixtureDay, timesOf } from "./fixture-day";

const day = fixtureDay();

function planOf(cuts: string[], short = 70): RoomPlan<CutSummary> {
  const result = cutAndSlide(day, { cuts, short });
  if (result.kind !== "plan") throw new Error(`${result.reason} ${result.ids}`);
  return result.plan;
}

const offIn = (plan: RoomPlan<CutSummary>) =>
  plan.changes.flatMap((c) => (c.kind === "slot_off" ? [c.slotId] : []));

describe("C5: cutAndSlide cuts for today, takes the drives along, and slides by what is still short", () => {
  it("removes the ticked items for today and slides the rest by what is still short", () => {
    const plan = planOf(["meditate", "journal"]);
    const after = applyChanges(day, plan.changes);

    expect(offIn(plan)).toEqual(["meditate", "journal"]);
    expect(plan.summary.cut).toBe(25);
    expect(plan.summary.stillShort).toBe(45);
    // "25 of 70 min cut. The rest slides: Breakfast 9:45, Work 10:15."
    expect(timesOf(after, "wellness")).toEqual(["08:15", "08:45"]);
    expect(timesOf(after, "training")).toEqual(["08:45", "09:42"]);
    expect(timesOf(after, "breakfast")).toEqual(["09:45", "10:15"]);
    expect(timesOf(after, "work")).toEqual(["10:15", "12:45"]);
    expect(timesOf(after, "evening")).toEqual(["18:45", "23:15"]);
    expect(plan.summary.moves).toContainEqual({
      blockId: "breakfast",
      from: "09:00",
      to: "09:45",
    });
  });

  it("takes a block's drives when its last other item is cut, and the block with them", () => {
    const plan = planOf(["workout"]);
    const after = applyChanges(day, plan.changes);

    expect(offIn(plan)).toEqual(["drive-there", "workout", "drive-home"]);
    expect(plan.summary.cutBlockIds).toEqual(["training"]);
    expect(timesOf(after, "training")).toBe("off");
    expect(plan.summary.cut).toBe(57);
    expect(plan.summary.stillShort).toBe(13);
    expect(timesOf(after, "breakfast")).toEqual(["09:13", "09:43"]);
  });

  it("keeps the drives while another item stays", () => {
    const plan = planOf(["meditate"]);
    expect(offIn(plan)).toEqual(["meditate"]);
  });

  it("slides nothing once the cuts cover the shortfall", () => {
    const plan = planOf([
      "pee",
      "water",
      "meditate",
      "cold-bath",
      "journal",
      "workout",
    ]);
    const after = applyChanges(day, plan.changes);
    expect(timesOf(after, "wellness")).toBe("off");
    expect(timesOf(after, "training")).toBe("off");
    expect(plan.summary.stillShort).toBe(0);
    expect(timesOf(after, "breakfast")).toEqual(["09:00", "09:30"]);
  });

  it("refuses to cut travel, a set time or Urgent work on its own", () => {
    expect(
      cutAndSlide(day, { cuts: ["drive-there"], short: 70 }),
    ).toMatchObject({
      kind: "refused",
      reason: "not_eligible",
    });
    expect(cutAndSlide(day, { cuts: ["call-sam"], short: 70 })).toMatchObject({
      reason: "not_eligible",
    });
    expect(cutAndSlide(day, { cuts: ["ship"], short: 70 })).toMatchObject({
      reason: "not_eligible",
    });
    expect(cutAndSlide(day, { cuts: ["nothing"], short: 70 })).toMatchObject({
      reason: "unknown",
    });
  });

  it("writes today only", () => {
    for (const change of planOf(["workout"]).changes)
      expect(change.onDate).toBe(DATE);
  });
});
