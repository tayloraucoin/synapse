import { describe, expect, it } from "vitest";
import { laterTarget, type LaterBlock } from "./later";

const at = (time: string) => new Date(`2026-10-05T${time}:00-04:00`);

function block(
  id: string,
  kind: string,
  from: string,
  to: string,
  sortOrders: number[] = [],
): LaterBlock {
  return { id, kind, start: at(from), end: at(to), sortOrders };
}

/** Taylor's Monday: Wellness, Training, Breakfast, Work. */
const monday = [
  block("wellness", "wellness", "06:58", "08:00", [0, 1, 2, 3, 4]),
  block("training", "training", "08:00", "08:57", [0, 1]),
  block("breakfast", "break", "09:00", "09:30", [0]),
  block("work", "work", "09:30", "12:30"),
];

describe("laterTarget (C4)", () => {
  it("sends Wellness's Meditate on Monday to the end of Training", () => {
    expect(
      laterTarget({
        blocks: monday,
        fromBlockId: "wellness",
        now: at("07:40"),
      }),
    ).toEqual({ blockId: "training", sortOrder: 2 });
  });

  it("prefers a later block of the item's own kind", () => {
    const day = [
      ...monday,
      block("wind-down", "wellness", "21:00", "22:00", [0, 4]),
    ];
    expect(
      laterTarget({ blocks: day, fromBlockId: "wellness", now: at("07:40") }),
    ).toEqual({ blockId: "wind-down", sortOrder: 5 });
  });

  it("puts an item first in an empty block", () => {
    expect(
      laterTarget({
        blocks: monday,
        fromBlockId: "breakfast",
        now: at("09:20"),
      }),
    ).toEqual({ blockId: "work", sortOrder: 0 });
  });

  it("skips a block that is already over and the all-day checklist", () => {
    const day = [
      { ...block("list", "life", "00:00", "24:00"), allDay: true },
      ...monday,
    ];
    expect(
      laterTarget({ blocks: day, fromBlockId: "wellness", now: at("09:10") }),
    ).toEqual({ blockId: "breakfast", sortOrder: 1 });
  });

  it("returns null after the last block", () => {
    expect(
      laterTarget({ blocks: monday, fromBlockId: "work", now: at("12:00") }),
    ).toBeNull();
  });
});
