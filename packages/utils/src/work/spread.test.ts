import { describe, expect, it } from "vitest";
import {
  blockFreeMin,
  spreadPreview,
  type SpreadBlock,
  type SpreadDay,
} from "./spread";

/**
 * C1 (USE-77): SYN-218 spread over the board's week at 10:20 on Monday 12
 * Oct. Every weekday has Work 9:30 to 12:00, 13:00 to 15:00 and 15:10 to
 * 17:00; Wednesday's morning holds [Alder intro] 3/3 for an hour, Thursday's
 * [Desk Today layout] 2/3 for an hour and a half; the afternoons hold work
 * the spread must never touch.
 */

const block = (
  id: string,
  start: string,
  end: string,
  over: Partial<SpreadBlock> = {},
): SpreadBlock => ({
  id,
  start,
  end,
  begun: false,
  slots: [],
  busy: [],
  ...over,
});

const ALDER = { title: "[Alder intro]", sessionLabel: "3/3", topMin: 60 };
const DESK = { title: "[Desk Today layout]", sessionLabel: "2/3", topMin: 90 };
const AFTERNOON_WORK = { title: "[SMS copy]", sessionLabel: null, topMin: 60 };

function weekday(
  dateKey: string,
  morning: Partial<SpreadBlock> = {},
  over: Partial<SpreadDay> = {},
): SpreadDay {
  return {
    dateKey,
    past: false,
    holds: false,
    blocks: [
      block("late", "15:10", "17:00"),
      block("morning", "09:30", "12:00", morning),
      block("afternoon", "13:00", "15:00", { slots: [AFTERNOON_WORK] }),
    ],
    ...over,
  };
}

const WEEK: SpreadDay[] = [
  weekday("2026-10-12", {
    begun: true,
    busy: [{ start: "11:00", end: "11:30" }],
  }),
  weekday("2026-10-13"),
  weekday("2026-10-14", { slots: [ALDER] }),
  weekday("2026-10-15", { slots: [DESK] }),
  weekday("2026-10-16"),
  { dateKey: "2026-10-17", past: false, holds: false, blocks: [] },
  { dateKey: "2026-10-18", past: false, holds: false, blocks: [] },
];

const TUE_TO_FRI = ["2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"];

describe("C1: the preview counts what is already there", () => {
  const preview = spreadPreview({
    workLeftMin: 20 * 60,
    days: WEEK,
    picked: TUE_TO_FRI,
    pick: "morning",
    eachMin: "whole",
  });

  it("gives each morning the time left after its other work", () => {
    expect(preview.rows).toEqual([
      {
        dateKey: "2026-10-13",
        blockId: "morning",
        sharesWith: [],
        getsMin: 150,
      },
      {
        dateKey: "2026-10-14",
        blockId: "morning",
        sharesWith: ["[Alder intro] 3/3"],
        getsMin: 90,
      },
      {
        dateKey: "2026-10-15",
        blockId: "morning",
        sharesWith: ["[Desk Today layout] 2/3"],
        getsMin: 60,
      },
      {
        dateKey: "2026-10-16",
        blockId: "morning",
        sharesWith: [],
        getsMin: 150,
      },
    ]);
  });

  it("sums 7 h 30 this week and leaves 12 h 30 in the pool", () => {
    expect(preview.totalMin).toBe(450);
    expect(preview.leftMin).toBe(750);
  });

  it("does not offer Monday once its Morning Work has begun, nor a day with no Work", () => {
    expect(preview.notOffered).toEqual([
      { dateKey: "2026-10-12", reason: "begun" },
      { dateKey: "2026-10-17", reason: "no-block" },
      { dateKey: "2026-10-18", reason: "no-block" },
    ]);
  });

  it("places nothing in a block not chosen: Morning Work leaves afternoons free", () => {
    expect(preview.rows.every((row) => row.blockId === "morning")).toBe(true);
  });
});

describe("C-USE-spread-across-the-week-3: any change re-counts", () => {
  const base = {
    workLeftMin: 20 * 60,
    days: WEEK,
    picked: TUE_TO_FRI,
    pick: "morning" as const,
    eachMin: "whole" as const,
  };

  it("caps each session at a set length, never past the block's time left", () => {
    const preview = spreadPreview({ ...base, eachMin: 75 });
    expect(preview.rows.map((row) => row.getsMin)).toEqual([75, 75, 60, 75]);
    expect(preview.totalMin).toBe(285);
  });

  it("stops when Work left is used up, the last session taking what remains", () => {
    const preview = spreadPreview({ ...base, workLeftMin: 4 * 60 });
    expect(preview.rows.map((row) => row.getsMin)).toEqual([150, 90]);
    expect(preview.leftMin).toBe(0);
  });

  it("drops an unpicked day's row", () => {
    const preview = spreadPreview({
      ...base,
      picked: ["2026-10-13", "2026-10-16"],
    });
    expect(preview.rows.map((row) => row.dateKey)).toEqual([
      "2026-10-13",
      "2026-10-16",
    ]);
    expect(preview.leftMin).toBe(900);
  });

  it("offers Monday's afternoon, and takes the later block with the most time left", () => {
    const preview = spreadPreview({
      ...base,
      picked: ["2026-10-12"],
      pick: "afternoon",
    });
    // 13:00 to 15:00 holds an hour (60 left); 15:10 to 17:00 is empty (110).
    expect(preview.rows).toEqual([
      { dateKey: "2026-10-12", blockId: "late", sharesWith: [], getsMin: 110 },
    ]);
    expect(preview.notOffered.map((d) => d.dateKey)).not.toContain(
      "2026-10-12",
    );
  });

  it("takes the block named per day under Pick blocks", () => {
    const preview = spreadPreview({
      ...base,
      picked: ["2026-10-13", "2026-10-14"],
      pick: { blocks: { "2026-10-13": "afternoon" } },
    });
    expect(preview.rows.map((r) => [r.blockId, r.getsMin])).toEqual([
      ["afternoon", 60],
      ["morning", 90],
    ]);
  });

  it("offers no day the item already sits on, nor one gone by", () => {
    const preview = spreadPreview({
      ...base,
      days: [
        weekday("2026-10-13", {}, { holds: true }),
        weekday("2026-10-11", {}, { past: true }),
      ],
      picked: ["2026-10-11", "2026-10-13"],
    });
    expect(preview.rows).toEqual([]);
    expect(preview.notOffered).toEqual([
      { dateKey: "2026-10-11", reason: "gone" },
      { dateKey: "2026-10-13", reason: "holds" },
    ]);
  });
});

describe("blockFreeMin", () => {
  it("takes the meetings inside the block out once, overlaps merged", () => {
    expect(
      blockFreeMin(
        block("b", "09:30", "12:00", {
          busy: [
            { start: "11:00", end: "11:30" },
            { start: "11:15", end: "11:45" },
            { start: "08:00", end: "09:45" },
          ],
        }),
      ),
    ).toBe(150 - 45 - 15);
  });

  it("has no room beside an item with no top", () => {
    expect(
      blockFreeMin(
        block("b", "09:30", "12:00", {
          slots: [{ title: "[Huge]", sessionLabel: null, topMin: null }],
        }),
      ),
    ).toBe(0);
  });
});
