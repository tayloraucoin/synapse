import { describe, expect, it } from "vitest";
import { applyChanges } from "./day";
import { findRoom, planRoom, type RoomCandidate } from "./find";
import { DATE, fixtureDay, timesOf } from "./fixture-day";

const day = fixtureDay();

const lengthOf = (d: typeof day, slotId: string) =>
  d.blocks.flatMap((o) => o.slots).find((s) => s.id === slotId)?.lengthMin;

describe("C2: findRoom fits, takes gaps then one item keeping half, or asks", () => {
  it("fits when the block's free minutes cover the addition", () => {
    expect(findRoom(day, { blockId: "wellness", minutes: 17 })).toEqual({
      kind: "fits",
      freeMin: 17,
    });
    // A day event inside the block holds its minutes too.
    expect(findRoom(day, { blockId: "work-pm", minutes: 60 })).toEqual({
      kind: "fits",
      freeMin: 60,
    });
  });

  it("takes the gap after the block, then the most flexible item (Foam roll, 10 min, into Training)", () => {
    const result = findRoom(day, { blockId: "training", minutes: 10 });
    if (result.kind !== "default") throw new Error(result.kind);
    expect(result.takes).toEqual([
      { kind: "gap", blockId: "training", where: "after", minutes: 3 },
      { kind: "item", blockId: "training", slotId: "workout", minutes: 7 },
    ]);
    expect(result.plan.summary).toMatchObject({ needed: 10, found: 10 });

    const after = applyChanges(day, result.plan.changes);
    // "35 min, now 28 min"; the block runs into the gap before Breakfast.
    expect(lengthOf(after, "workout")).toBe(28);
    expect(timesOf(after, "training")).toEqual(["08:00", "09:00"]);
    expect(timesOf(after, "breakfast")).toEqual(["09:00", "09:30"]);
  });

  it("takes free minutes first, then the longest item outside a Work block", () => {
    const result = findRoom(day, { blockId: "wellness", minutes: 20 });
    if (result.kind !== "default") throw new Error(result.kind);
    expect(result.takes).toEqual([
      { kind: "gap", blockId: "wellness", where: "inside", minutes: 17 },
      { kind: "item", blockId: "wellness", slotId: "journal", minutes: 3 },
    ]);
    expect(result.plan.changes).toEqual([
      { kind: "slot_length", slotId: "journal", onDate: DATE, lengthMin: 12 },
    ]);
  });

  it("gives Stretch first in a Work block", () => {
    const result = findRoom(day, { blockId: "work", minutes: 10 });
    if (result.kind !== "default") throw new Error(result.kind);
    expect(result.takes).toEqual([
      { kind: "item", blockId: "work", slotId: "tidy", minutes: 10 },
    ]);
  });

  it("keeps at least half an item, and asks when one item is not enough", () => {
    const result = findRoom(day, { blockId: "work", minutes: 11 });
    expect(result.kind).toBe("ask");
    if (result.kind !== "ask") return;
    expect(result.needed).toBe(11);
    const tidy = result.candidates.find((c) => c.id === "tidy");
    expect(tidy).toMatchObject({ eligible: true, gives: 10, lengthMin: 20 });
  });

  it("asks with every candidate and its reason, here and in the other blocks", () => {
    const result = findRoom(day, { blockId: "work", minutes: 25 });
    if (result.kind !== "ask") throw new Error(result.kind);
    const here = result.candidates.filter((c) => c.source === "this_block");
    expect(here.map((c) => c.id)).toEqual([
      "build",
      "review",
      "tidy",
      "call-sam",
    ]);
    const others = result.candidates.filter((c) => c.source === "other_blocks");
    expect(new Set(others.map((c) => c.blockId))).toEqual(
      new Set([
        "orient",
        "wellness",
        "training",
        "breakfast",
        "lunch",
        "work-pm",
        "evening",
      ]),
    );
    expect(others).toContainEqual(
      expect.objectContaining({
        blockId: "wellness",
        kind: "gap",
        where: "inside",
        gives: 17,
      }),
    );
  });

  it("refuses a block not on the day, and Orient", () => {
    expect(findRoom(day, { blockId: "nope", minutes: 5 })).toMatchObject({
      reason: "unknown",
    });
    expect(findRoom(day, { blockId: "orient", minutes: 5 })).toMatchObject({
      reason: "not_eligible",
    });
  });
});

describe("C3: travel, set times, day events and Orient are shown, never eligible; Urgent never offered", () => {
  const result = findRoom(day, { blockId: "work", minutes: 25 });
  if (result.kind !== "ask") throw new Error(result.kind);
  const find = (id: string | null, kind?: string): RoomCandidate | undefined =>
    result.candidates.find(
      (c) => c.id === id && (kind === undefined || c.kind === kind),
    );

  it.each([
    ["drive-there", "travel"],
    ["drive-home", "travel"],
    ["call-sam", "set_time"],
    ["dentist", "day_event"],
  ])("shows %s as not eligible: %s", (id, reason) => {
    expect(find(id)).toMatchObject({ eligible: false, gives: 0, reason });
  });

  it("shows Orient as not eligible", () => {
    expect(find(null, "orient")).toMatchObject({
      blockId: "orient",
      eligible: false,
      reason: "orient",
    });
  });

  it("never offers Urgent work", () => {
    expect(find("ship")).toBeUndefined();
  });

  it("never takes them, even when picked", () => {
    for (const take of [
      {
        kind: "item" as const,
        blockId: "training",
        slotId: "drive-there",
        minutes: 1,
      },
      {
        kind: "item" as const,
        blockId: "work",
        slotId: "call-sam",
        minutes: 1,
      },
      { kind: "item" as const, blockId: "work", slotId: "ship", minutes: 1 },
    ]) {
      expect(
        planRoom(day, { blockId: "work", minutes: 1, takes: [take] }),
      ).toMatchObject({
        kind: "refused",
      });
    }
  });

  it("never takes from the default either", () => {
    // Training holds only drives and the workout; a long add asks rather than touch a drive.
    const ask = findRoom(day, { blockId: "training", minutes: 30 });
    expect(ask.kind).toBe("ask");
  });
});

describe("planRoom: minutes from another block ripple, and add up", () => {
  it("grows the block by what Work gives, moving the blocks between", () => {
    const result = planRoom(day, {
      blockId: "training",
      minutes: 5,
      takes: [{ kind: "item", blockId: "work", slotId: "tidy", minutes: 5 }],
    });
    if (result.kind !== "plan") throw new Error(result.reason);
    const after = applyChanges(day, result.plan.changes);
    expect(timesOf(after, "training")).toEqual(["08:00", "09:02"]);
    expect(timesOf(after, "breakfast")).toEqual(["09:05", "09:35"]);
    expect(timesOf(after, "work")).toEqual(["09:35", "12:00"]);
    expect(timesOf(after, "lunch")).toEqual(["12:00", "13:00"]);
    expect(lengthOf(after, "tidy")).toBe(15);
    expect(result.plan.summary.found).toBe(5);
  });

  it("refuses more than an item may give", () => {
    expect(
      planRoom(day, {
        blockId: "training",
        minutes: 11,
        takes: [{ kind: "item", blockId: "work", slotId: "tidy", minutes: 11 }],
      }),
    ).toMatchObject({ kind: "refused", reason: "too_much" });
  });
});
