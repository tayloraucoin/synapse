import { describe, expect, it } from "vitest";
import type { SlotClockState } from "../planner";
import { resolveWorkNext, type NextSlot } from "./next";

const slot = (
  id: string,
  tier: NextSlot["tier"],
  sortOrder: number,
  waiting = false,
): NextSlot => ({ id, tier, sortOrder, waiting });

const states = (entries: Record<string, SlotClockState>) =>
  new Map(Object.entries(entries));

// Shuffled on purpose: array order must never decide.
const DAY = [
  slot("s3", "secondary", 0),
  slot("st", "stretch", 0),
  slot("p2", "primary", 2),
  slot("p1", "primary", 1),
  slot("u1", "urgent", 5),
];

describe("C1: Next walks Urgent, Primary, Secondary, Stretch, then sort order; never firing, running, done or waiting", () => {
  it("is the first by tier, whatever the array order", () => {
    expect(resolveWorkNext({ slots: DAY, states: states({}) })).toEqual({
      kind: "slot",
      slotId: "u1",
    });
  });

  it("walks sort order inside a tier", () => {
    const slots = DAY.filter((s) => s.id !== "u1");
    expect(resolveWorkNext({ slots, states: states({}) })).toEqual({
      kind: "slot",
      slotId: "p1",
    });
  });

  it("skips firing, running, done and waiting", () => {
    const slots = [...DAY.slice(0, 4), slot("u1", "urgent", 5, true)];
    expect(
      resolveWorkNext({
        slots,
        states: states({ p1: "running", p2: "firing", s3: "done" }),
      }),
    ).toEqual({ kind: "slot", slotId: "st" });
  });

  it("never makes the running slot Next, though it is first in order", () => {
    expect(
      resolveWorkNext({ slots: DAY, states: states({ u1: "running" }) }),
    ).toEqual({ kind: "slot", slotId: "p1" });
  });

  it("takes a paused slot; a slot missing from states is idle", () => {
    expect(
      resolveWorkNext({ slots: DAY, states: states({ u1: "paused" }) }),
    ).toEqual({ kind: "slot", slotId: "u1" });
  });

  it("makes a brought-back slot first in order Next again", () => {
    const firing = resolveWorkNext({
      slots: DAY,
      states: states({ u1: "firing" }),
    });
    expect(firing).toEqual({ kind: "slot", slotId: "p1" });
    // brought_back closes the firing span; the clock reads it idle (or paused).
    expect(
      resolveWorkNext({ slots: DAY, states: states({ u1: "idle" }) }),
    ).toEqual({ kind: "slot", slotId: "u1" });
  });

  it("is not moved by time, size or due date, which it never reads", () => {
    const withExtras = DAY.map((s) => ({
      ...s,
      dueAt: "2020-01-01",
      size: "quick",
    }));
    expect(resolveWorkNext({ slots: withExtras, states: states({}) })).toEqual({
      kind: "slot",
      slotId: "u1",
    });
  });

  it("settles a tie in sort order by id", () => {
    const slots = [slot("b", "primary", 1), slot("a", "primary", 1)];
    expect(resolveWorkNext({ slots, states: states({}) })).toEqual({
      kind: "slot",
      slotId: "a",
    });
  });
});

describe("C2: all_firing with nothing in hand and nothing left; otherwise none", () => {
  it("is all_firing when the rest is done and at least one fires", () => {
    expect(
      resolveWorkNext({
        slots: DAY,
        states: states({
          u1: "firing",
          p1: "done",
          p2: "done",
          s3: "firing",
          st: "done",
        }),
      }),
    ).toEqual({ kind: "all_firing" });
  });

  it("counts waiting slots as nothing left to do", () => {
    const slots = [slot("a", "primary", 0), slot("w", "primary", 1, true)];
    expect(resolveWorkNext({ slots, states: states({ a: "firing" }) })).toEqual(
      { kind: "all_firing" },
    );
  });

  it("is none, not all_firing, while one is in hand", () => {
    const slots = [slot("a", "primary", 0), slot("b", "primary", 1)];
    expect(
      resolveWorkNext({ slots, states: states({ a: "running", b: "firing" }) }),
    ).toEqual({ kind: "none" });
  });

  it("is none with no candidates and nothing firing", () => {
    expect(resolveWorkNext({ slots: [], states: states({}) })).toEqual({
      kind: "none",
    });
    expect(
      resolveWorkNext({
        slots: [slot("a", "primary", 0), slot("w", "stretch", 0, true)],
        states: states({ a: "done" }),
      }),
    ).toEqual({ kind: "none" });
  });

  it("never throws on odd input", () => {
    const odd = [
      {
        id: "x",
        tier: "nope" as NextSlot["tier"],
        sortOrder: Number.NaN,
        waiting: false,
      },
      slot("y", "stretch", 0),
    ];
    expect(resolveWorkNext({ slots: odd, states: states({}) })).toEqual({
      kind: "slot",
      slotId: "y",
    });
  });
});
