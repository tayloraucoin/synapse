import { describe, expect, it } from "vitest";
import { activeBlock, currentItem, nextItem } from "./now-block";

const at = (clock: string) => new Date(`2026-10-12T${clock}:00Z`);

const block = (id: string, start: string, end: string) => ({
  id,
  start: at(start),
  end: at(end),
});

const day = [
  block("wellness", "07:05", "08:00"),
  block("training", "08:00", "08:57"),
  block("breakfast", "09:00", "09:30"),
];

describe("C7: activeBlock", () => {
  it("returns the block under way", () => {
    expect(activeBlock(day, at("07:14"))?.id).toBe("wellness");
  });

  it("takes a block from its start, and hands over at its end", () => {
    expect(activeBlock(day, at("07:05"))?.id).toBe("wellness");
    expect(activeBlock(day, at("08:00"))?.id).toBe("training");
  });

  it("returns the next one today between blocks and before the first", () => {
    expect(activeBlock(day, at("08:58"))?.id).toBe("breakfast");
    expect(activeBlock(day, at("06:00"))?.id).toBe("wellness");
  });

  it("returns none after the last block and on a day with none", () => {
    expect(activeBlock(day, at("10:00"))).toBeNull();
    expect(activeBlock([], at("07:14"))).toBeNull();
  });

  it("takes the earlier of two under way", () => {
    const overlapping = [
      block("a", "07:00", "08:00"),
      block("b", "07:30", "09:00"),
    ];
    expect(activeBlock(overlapping, at("07:45"))?.id).toBe("a");
  });
});

const items = [
  { id: "pee", done: true },
  { id: "water", done: true },
  { id: "start-bath", done: true },
  { id: "meditate", done: false },
  { id: "bath", done: false },
];

describe("C7: currentItem", () => {
  it("returns the first undone item in order", () => {
    expect(currentItem(items, null)?.id).toBe("meditate");
  });

  it("returns the item made current instead", () => {
    expect(currentItem(items, "bath")?.id).toBe("bath");
  });

  it("falls back to the order when the chosen item is done or gone", () => {
    expect(currentItem(items, "water")?.id).toBe("meditate");
    expect(currentItem(items, "nowhere")?.id).toBe("meditate");
  });

  it("returns none when every item is done", () => {
    expect(currentItem([{ id: "a", done: true }], null)).toBeNull();
    expect(currentItem([], null)).toBeNull();
  });
});

describe("nextItem", () => {
  it("is the next undone item after the current one", () => {
    expect(nextItem(items, items[3]!)?.id).toBe("bath");
  });

  it("wraps to an undone item before it when none follows", () => {
    expect(nextItem(items, items[4]!)?.id).toBe("meditate");
  });

  it("is none when nothing else is undone", () => {
    expect(
      nextItem([{ id: "a", done: false }], { id: "a", done: false }),
    ).toBeNull();
    expect(nextItem(items, null)).toBeNull();
  });
});
