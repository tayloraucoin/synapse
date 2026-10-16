import { describe, expect, it } from "vitest";
import {
  readTodayDrag,
  tierDropMoves,
  TODAY_DRAG,
  type TierSlot,
} from "./tier-drop";

// USE-71: a row dragged between Today's tiers.
const slots: TierSlot[] = [
  { id: "p1", tier: "primary", sortOrder: 0 },
  { id: "p2", tier: "primary", sortOrder: 4 },
  { id: "s1", tier: "secondary", sortOrder: 1 },
  { id: "s2", tier: "secondary", sortOrder: 2 },
];

describe("tierDropMoves", () => {
  it("lands a Secondary row before a Primary one, the tier renumbered", () => {
    expect(
      tierDropMoves(slots, { slotId: "s2", tier: "primary", beforeId: "p2" }),
    ).toEqual([
      { slotId: "s2", tier: "primary", sortOrder: 1 },
      { slotId: "p2", tier: "primary", sortOrder: 2 },
    ]);
  });

  it("lands at a tier's end with no row under the pointer", () => {
    expect(
      tierDropMoves(slots, { slotId: "s1", tier: "primary", beforeId: null }),
    ).toEqual([
      { slotId: "s1", tier: "primary", sortOrder: 2 },
      { slotId: "p2", tier: "primary", sortOrder: 1 },
    ]);
  });

  it("reorders inside one tier, writing only what changes", () => {
    expect(
      tierDropMoves(slots, { slotId: "s2", tier: "secondary", beforeId: "s1" }),
    ).toEqual([{ slotId: "s2", tier: "secondary", sortOrder: 0 }]);
  });

  it("an empty tier takes the row at 0", () => {
    expect(
      tierDropMoves(slots, { slotId: "p1", tier: "stretch", beforeId: null }),
    ).toEqual([{ slotId: "p1", tier: "stretch", sortOrder: 0 }]);
  });

  it("a drop where it started writes nothing", () => {
    expect(
      tierDropMoves(slots, { slotId: "s1", tier: "secondary", beforeId: "s2" }),
    ).toEqual([]);
    expect(
      tierDropMoves(slots, { slotId: "s1", tier: "secondary", beforeId: "s1" }),
    ).toEqual([]);
    expect(
      tierDropMoves(slots, { slotId: "s2", tier: "secondary", beforeId: null }),
    ).toEqual([]);
    expect(
      tierDropMoves(slots, { slotId: "gone", tier: "primary", beforeId: null }),
    ).toEqual([]);
  });
});

describe("readTodayDrag", () => {
  it("reads its own ids back and nothing else", () => {
    expect(readTodayDrag(TODAY_DRAG.row("a:1"))).toEqual({
      kind: "row",
      slotId: "a:1",
    });
    expect(readTodayDrag(TODAY_DRAG.before("b"))).toEqual({
      kind: "before",
      slotId: "b",
    });
    expect(readTodayDrag(TODAY_DRAG.end("stretch"))).toEqual({
      kind: "end",
      tier: "stretch",
    });
    expect(readTodayDrag("cell:2026-10-12:primary")).toBeNull();
    expect(readTodayDrag("pool")).toBeNull();
  });
});
