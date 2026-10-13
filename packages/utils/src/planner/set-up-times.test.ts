import { describe, expect, it } from "vitest";
import {
  boundsEdge,
  dayStrip,
  firstFreeTime,
  overlaps,
  tappedSlot,
} from "./set-up-times";

const bounds = { upAt: "07:00", lightsOut: "22:30" };

describe("C1: tappedSlot and firstFreeTime place a new block", () => {
  it("runs from the half hour tapped to the next block when that is sooner", () => {
    expect(
      tappedSlot({
        at: "17:10",
        blocks: [{ startsAt: "17:40", endsAt: "19:00" }],
        lightsOut: "22:30",
      }),
    ).toEqual({ startsAt: "17:00", endsAt: "17:40" });
  });

  it("runs one hour when the next block is further", () => {
    expect(
      tappedSlot({
        at: "14:45",
        blocks: [{ startsAt: "17:00", endsAt: "18:00" }],
        lightsOut: "22:30",
      }),
    ).toEqual({ startsAt: "14:30", endsAt: "15:30" });
  });

  it("starts after a block that covers the rounded time", () => {
    expect(
      tappedSlot({
        at: "12:20",
        blocks: [{ startsAt: "09:30", endsAt: "12:15" }],
        lightsOut: "22:30",
      }),
    ).toEqual({ startsAt: "12:15", endsAt: "13:15" });
  });

  it("never passes Lights out or 24:00", () => {
    expect(tappedSlot({ at: "22:05", blocks: [], lightsOut: "22:30" })).toEqual(
      {
        startsAt: "22:00",
        endsAt: "22:30",
      },
    );
    expect(tappedSlot({ at: "23:40", blocks: [], lightsOut: "22:30" })).toEqual(
      {
        startsAt: "23:30",
        endsAt: "24:00",
      },
    );
  });

  it("puts the + 5 minutes after Up at on an empty day", () => {
    expect(firstFreeTime({ upAt: "07:00", blocks: [] })).toBe("07:05");
  });

  it("puts the + at the last block's end otherwise", () => {
    expect(
      firstFreeTime({
        upAt: "07:00",
        blocks: [
          { startsAt: "09:30", endsAt: "12:00" },
          { startsAt: "07:05", endsAt: "08:00" },
        ],
      }),
    ).toBe("12:00");
  });
});

describe("C4: overlaps pairs shared time with its fix; boundsEdge marks out-of-bounds blocks", () => {
  it("names the shared span and starts the later block at the earlier one's end", () => {
    expect(
      overlaps([
        { id: "work", startsAt: "09:30", endsAt: "12:00" },
        { id: "training", startsAt: "08:00", endsAt: "09:45" },
        { id: "lunch", startsAt: "12:00", endsAt: "13:00" },
      ]),
    ).toEqual([
      {
        a: "training",
        b: "work",
        startsAt: "09:30",
        endsAt: "09:45",
        fixStartsAt: "09:45",
      },
    ]);
  });

  it("pairs every two of three blocks that share time", () => {
    const pairs = overlaps([
      { id: "a", startsAt: "10:00", endsAt: "12:00" },
      { id: "b", startsAt: "10:30", endsAt: "11:00" },
      { id: "c", startsAt: "11:30", endsAt: "13:00" },
    ]);
    expect(pairs.map((pair) => `${pair.a}-${pair.b}`)).toEqual(["a-b", "a-c"]);
  });

  it("gives none when blocks only touch", () => {
    expect(
      overlaps([
        { id: "a", startsAt: "07:05", endsAt: "08:00" },
        { id: "b", startsAt: "08:00", endsAt: "09:00" },
      ]),
    ).toEqual([]);
  });

  it("marks a block before Up at or after Lights out, and nothing else", () => {
    expect(boundsEdge({ startsAt: "06:30", endsAt: "07:30" }, bounds)).toBe(
      "before_up_at",
    );
    expect(boundsEdge({ startsAt: "22:00", endsAt: "23:00" }, bounds)).toBe(
      "after_lights_out",
    );
    expect(
      boundsEdge({ startsAt: "07:00", endsAt: "22:30" }, bounds),
    ).toBeNull();
    expect(
      boundsEdge({ startsAt: "12:00", endsAt: "13:00" }, bounds),
    ).toBeNull();
  });
});

describe("C5: dayStrip gives each part its share of the day", () => {
  const sum = (parts: { share: number }[]): number =>
    parts.reduce((total, part) => total + part.share, 0);

  it("puts Orient's sliver first, then blocks and open gaps in order, summing to one", () => {
    const strip = dayStrip({
      upAt: "07:00",
      lightsOut: "22:00",
      blocks: [
        { kind: "work", startsAt: "09:30", endsAt: "12:00" },
        { kind: "wellness", startsAt: "07:05", endsAt: "08:00" },
      ],
    });
    expect(strip.map((part) => part.part)).toEqual([
      "orient",
      "wellness",
      "open",
      "work",
      "open",
    ]);
    expect(strip[0]?.share).toBeCloseTo(5 / 900);
    expect(strip[3]?.share).toBeCloseTo(150 / 900);
    expect(sum(strip)).toBeCloseTo(1);
  });

  it("clips blocks to the bounds and draws shared time once", () => {
    const strip = dayStrip({
      upAt: "07:00",
      lightsOut: "22:00",
      blocks: [
        { kind: "life", startsAt: "06:00", endsAt: "07:30" },
        { kind: "work", startsAt: "09:00", endsAt: "12:00" },
        { kind: "todos", startsAt: "11:00", endsAt: "13:00" },
        { kind: "life", startsAt: "21:00", endsAt: "23:00" },
      ],
    });
    expect(strip.map((part) => part.part)).toEqual([
      "orient",
      "life",
      "open",
      "work",
      "todos",
      "open",
      "life",
    ]);
    expect(strip[4]?.share).toBeCloseTo(60 / 900);
    expect(sum(strip)).toBeCloseTo(1);
  });

  it("gives an empty day Orient and one open part", () => {
    const strip = dayStrip({ ...bounds, blocks: [] });
    expect(strip.map((part) => part.part)).toEqual(["orient", "open"]);
    expect(sum(strip)).toBeCloseTo(1);
  });

  it("gives none for a day with no bounds", () => {
    expect(dayStrip({ upAt: null, lightsOut: null, blocks: [] })).toEqual([]);
  });
});
