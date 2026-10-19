import { describe, expect, it } from "vitest";
import { doNowLines, slideAfter } from "./do-now";

const at = (time: string) => new Date(`2026-10-05T${time}:00-04:00`);
const DATE = "2026-10-05";

function occurrence(
  id: string,
  kind: string,
  startsAt: string,
  endsAt: string,
  today?: { startsAt: string; endsAt: string },
) {
  return {
    block: {
      id,
      kind,
      startsAt,
      endsAt,
      rrule: null,
      onDate: DATE,
      archivedAt: null,
    },
    startsAt: today?.startsAt ?? startsAt,
    endsAt: today?.endsAt ?? endsAt,
    changed: today !== undefined,
  };
}

/** Taylor's Monday: Orient, Wellness, Training, Breakfast, Work, Wind-down. */
const monday = [
  occurrence("orient", "orient", "06:50", "07:05"),
  occurrence("wellness", "wellness", "07:05", "08:00"),
  occurrence("training", "training", "08:00", "08:57"),
  occurrence("breakfast", "break", "09:00", "09:30"),
  occurrence("work", "work", "09:30", "12:30"),
  occurrence("wind-down", "wind_down", "21:00", "22:00"),
];

const left = [
  { id: "meditate", lengthMin: 10 },
  { id: "cold-bath", lengthMin: 10 },
];
const training = { name: "Training", start: at("08:00") };

describe("doNowLines (C2)", () => {
  it("at 7:45 Meditate fits by 7:55, and Cold bath after it starts Training at 8:05", () => {
    expect(
      doNowLines({
        block: { end: at("08:00") },
        left,
        next: training,
        now: at("07:45"),
      }),
    ).toEqual([
      { id: "meditate", fitsBy: at("07:55") },
      { id: "cold-bath", overrunMin: 5, nextStartsAt: at("08:05") },
    ]);
  });

  it("recomputes when an item above leaves the list", () => {
    expect(
      doNowLines({
        block: { end: at("08:00") },
        left: [left[1]!],
        next: training,
        now: at("07:45"),
      }),
    ).toEqual([{ id: "cold-bath", fitsBy: at("07:55") }]);
  });

  it("counts from the minute, so seconds never tip a line; an item ending on the end fits", () => {
    expect(
      doNowLines({
        block: { end: at("08:00") },
        left: [
          { id: "a", lengthMin: 15 },
          { id: "b", lengthMin: 1 },
        ],
        next: { name: "Training", start: at("08:10") },
        now: new Date(at("07:45").getTime() + 30_000),
      }),
    ).toEqual([
      { id: "a", fitsBy: at("08:00") },
      { id: "b", overrunMin: 1, nextStartsAt: at("08:11") },
    ]);
  });

  it("past the day's last block, the block would end later", () => {
    expect(
      doNowLines({
        block: { end: at("22:00") },
        left: [{ id: "read", lengthMin: 30 }],
        next: null,
        now: at("21:40"),
      }),
    ).toEqual([{ id: "read", overrunMin: 10, endsAt: at("22:10") }]);
  });
});

describe("slideAfter (C2)", () => {
  it("a 5-minute overrun moves Wellness's end and every later block by 5, each keeping its length", () => {
    expect(
      slideAfter({
        blocks: monday,
        fromBlockId: "wellness",
        overrunMin: 5,
        dateKey: DATE,
      }),
    ).toEqual([
      { blockId: "wellness", onDate: DATE, startsAt: "07:05", endsAt: "08:05" },
      { blockId: "training", onDate: DATE, startsAt: "08:05", endsAt: "09:02" },
      {
        blockId: "breakfast",
        onDate: DATE,
        startsAt: "09:05",
        endsAt: "09:35",
      },
      { blockId: "work", onDate: DATE, startsAt: "09:35", endsAt: "12:35" },
      {
        blockId: "wind-down",
        onDate: DATE,
        startsAt: "21:05",
        endsAt: "22:05",
      },
    ]);
  });

  it("touches only blocks from the one closed on: Orient and earlier blocks stay", () => {
    const changes = slideAfter({
      blocks: monday,
      fromBlockId: "training",
      overrunMin: 5,
      dateKey: DATE,
    })!;
    expect(changes.map((change) => change.blockId)).toEqual([
      "training",
      "breakfast",
      "work",
      "wind-down",
    ]);
  });

  it("merges with a change already on the date: read from the date's times, one row each", () => {
    const moved = monday.map((entry) =>
      entry.block.id === "training"
        ? occurrence("training", "training", "08:00", "08:57", {
            startsAt: "08:10",
            endsAt: "09:00",
          })
        : entry,
    );
    const changes = slideAfter({
      blocks: moved,
      fromBlockId: "wellness",
      overrunMin: 5,
      dateKey: DATE,
    })!;
    expect(changes.filter((change) => change.blockId === "training")).toEqual([
      { blockId: "training", onDate: DATE, startsAt: "08:15", endsAt: "09:05" },
    ]);
  });

  it("writes nothing with no overrun, and refuses a block past 24:00", () => {
    const slide = (overrunMin: number) =>
      slideAfter({
        blocks: monday,
        fromBlockId: "wellness",
        overrunMin,
        dateKey: DATE,
      });
    expect(slide(0)).toEqual([]);
    expect(slide(150)).toBeNull();
  });
});
