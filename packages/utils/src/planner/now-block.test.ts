import { describe, expect, it } from "vitest";
import {
  activeBlock,
  behindSince,
  currentItem,
  nextBlock,
  nextItem,
} from "./now-block";

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

describe("C7: activeBlock past a block's end (USE-17)", () => {
  const wellnessOpen = [
    { ...block("wellness", "07:05", "08:00"), open: true },
    block("training", "08:00", "08:57"),
  ];

  it("keeps an open block active past its end: the next does not slide", () => {
    expect(activeBlock(wellnessOpen, at("08:04"))?.id).toBe("wellness");
  });

  it("hands over at the end once nothing in it is open", () => {
    const closed = [
      { ...block("wellness", "07:05", "08:00"), open: false },
      block("training", "08:00", "08:57"),
    ];
    expect(activeBlock(closed, at("08:04"))?.id).toBe("training");
  });
});

describe("C7: activeBlock on a checklist day (D-USE-72)", () => {
  const sunday = [
    { ...block("checklist", "00:00", "23:59"), allDay: true, open: true },
    block("lunch", "13:00", "14:30"),
  ];

  it("is the checklist before a set-time block", () => {
    expect(activeBlock(sunday, at("11:20"))?.id).toBe("checklist");
  });

  it("is the set-time block from 13:00 to 14:30", () => {
    expect(activeBlock(sunday, at("13:00"))?.id).toBe("lunch");
    expect(activeBlock(sunday, at("14:29"))?.id).toBe("lunch");
  });

  it("is the checklist again once it ends", () => {
    expect(activeBlock(sunday, at("14:30"))?.id).toBe("checklist");
    expect(activeBlock(sunday, at("18:00"))?.id).toBe("checklist");
  });

  it("is never held by an open all-day checklist", () => {
    expect(activeBlock(sunday, at("13:10"))?.id).toBe("lunch");
  });

  it("names the set-time block as next, never the checklist", () => {
    expect(nextBlock(sunday, at("11:20"))?.id).toBe("lunch");
    expect(nextBlock(sunday, at("13:10"))).toBeNull();
  });
});

describe("C7: behindSince", () => {
  const wellness = block("wellness", "07:05", "08:00");

  it("is null before the end and at it", () => {
    expect(behindSince(wellness, at("07:14"))).toBeNull();
    expect(behindSince(wellness, at("08:00"))).toBeNull();
  });

  it("is the block's end once now passes it", () => {
    expect(behindSince(wellness, at("08:04"))).toEqual(at("08:00"));
  });

  it("is never set on an all-day checklist", () => {
    expect(
      behindSince({ ...wellness, allDay: true }, at("23:00")),
    ).toBeNull();
  });
});
