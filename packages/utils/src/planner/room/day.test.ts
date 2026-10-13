import { describe, expect, it } from "vitest";
import { cutAndSlide } from "./cut";
import { applyChanges, type DayChange, type RoomResult } from "./day";
import { findRoom, planRoom } from "./find";
import { DATE, fixtureDay, UP_AT, WOKE_AT } from "./fixture-day";
import { moveLater } from "./later";
import { slideDay } from "./slide";
import { layoutFromWake } from "./wake";

const day = fixtureDay();

function plan<S>(result: RoomResult<S>): {
  changes: DayChange[];
  undo: DayChange[];
} {
  if (result.kind !== "plan") throw new Error(`${result.reason} ${result.ids}`);
  return result.plan;
}

const defaultOf = (minutes: number, blockId: string) => {
  const result = findRoom(day, { blockId, minutes });
  if (result.kind !== "default") throw new Error(result.kind);
  return result.plan;
};

const plans: [string, { changes: DayChange[]; undo: DayChange[] }][] = [
  ["layoutFromWake", layoutFromWake(day, { upAt: UP_AT, wokeAt: WOKE_AT })],
  ["findRoom, gap and item", defaultOf(10, "training")],
  ["findRoom, free and item", defaultOf(20, "wellness")],
  [
    "planRoom, from another block",
    plan(
      planRoom(day, {
        blockId: "training",
        minutes: 8,
        takes: [
          { kind: "item", blockId: "work", slotId: "tidy", minutes: 5 },
          { kind: "item", blockId: "work-pm", slotId: "plan", minutes: 3 },
        ],
      }),
    ),
  ],
  ["slideDay", plan(slideDay(day, { from: UP_AT, minutes: 70 }))],
  [
    "cutAndSlide, items",
    plan(cutAndSlide(day, { cuts: ["meditate", "journal"], short: 70 })),
  ],
  [
    "cutAndSlide, a block",
    plan(cutAndSlide(day, { cuts: ["workout"], short: 70 })),
  ],
  [
    "moveLater",
    plan(moveLater(day, { blockId: "wellness", orientEnd: WOKE_AT + 5 })),
  ],
];

describe("C7: every plan applied then undone gives back the day it started from", () => {
  it.each(plans)("%s", (_, { changes, undo }) => {
    expect(changes.length).toBeGreaterThan(0);
    const after = applyChanges(day, changes);
    expect(after).not.toEqual(day);
    expect(applyChanges(after, undo)).toEqual(day);
  });

  it.each(plans)(
    "%s writes today only, never the usual week",
    (_, { changes, undo }) => {
      for (const change of [...changes, ...undo])
        expect(change.onDate).toBe(DATE);
    },
  );

  it("undoes a block with today's row back to that row, and one without back to no row", () => {
    const { undo } = plan(slideDay(day, { from: UP_AT, minutes: 70 }));
    expect(undo).toContainEqual({
      kind: "block_times",
      blockId: "work-pm",
      onDate: DATE,
      startsAt: "13:00",
      endsAt: "15:30",
    });
    expect(undo).toContainEqual({
      kind: "block_usual",
      blockId: "work",
      onDate: DATE,
    });
  });

  it("never writes to the day it was given", () => {
    // The fixture is deep-frozen: any write above would have thrown.
    expect(Object.isFrozen(day.blocks[0])).toBe(true);
  });
});
