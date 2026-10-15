import { describe, expect, it } from "vitest";
import { bulletCellsPerLine, bulletGrid, bulletLines } from "./bullet-grid";

const WELLNESS = [
  "Pee and weigh",
  "Water",
  "Start the cold bath",
  "Meditate",
  "Cold bath",
];

// Two 20 px lines 4 px apart need 44 px.
const LINE = { lineHeightPx: 20, rowGapPx: 4 };

describe("C5: bulletGrid lays items into fixed cells within a block's height", () => {
  it('shows three and "+2 more" in two lines of two cells', () => {
    const grid = bulletGrid(WELLNESS, {
      heightPx: 44,
      cellsPerLine: 2,
      ...LINE,
    });
    expect(grid.lines).toBe(2);
    expect(grid.shown).toEqual([
      "Pee and weigh",
      "Water",
      "Start the cold bath",
    ]);
    expect(grid.more).toBe(2);
  });

  it("counts only what does not fit: one line of four cells shows three and +2", () => {
    const grid = bulletGrid(WELLNESS, {
      heightPx: 30,
      cellsPerLine: 4,
      ...LINE,
    });
    expect(grid.lines).toBe(1);
    expect(grid.shown).toHaveLength(3);
    expect(grid.more).toBe(2);
  });

  it('has no "+n more" when all fit, the last cell included', () => {
    const three = WELLNESS.slice(0, 3);
    expect(
      bulletGrid(three, { heightPx: 44, cellsPerLine: 2, ...LINE }),
    ).toEqual({
      shown: three,
      more: 0,
      lines: 2,
    });
    const four = WELLNESS.slice(0, 4);
    expect(
      bulletGrid(four, { heightPx: 44, cellsPerLine: 2, ...LINE }).more,
    ).toBe(0);
  });

  it("never grows the block: a height with no line shows nothing and counts all", () => {
    const grid = bulletGrid(WELLNESS, {
      heightPx: 12,
      cellsPerLine: 2,
      ...LINE,
    });
    expect(grid).toEqual({ shown: [], more: 5, lines: 0 });
  });

  it("a single cell that cannot hold them all is the count alone", () => {
    const grid = bulletGrid(WELLNESS, {
      heightPx: 20,
      cellsPerLine: 1,
      ...LINE,
    });
    expect(grid.shown).toEqual([]);
    expect(grid.more).toBe(5);
  });

  it("an empty block has nothing to count", () => {
    expect(
      bulletGrid([], { heightPx: 44, cellsPerLine: 2, ...LINE }).more,
    ).toBe(0);
  });
});

describe("the grid's geometry", () => {
  it("fits lines with their gaps", () => {
    expect(bulletLines(43, 20, 4)).toBe(1);
    expect(bulletLines(44, 20, 4)).toBe(2);
    expect(bulletLines(19, 20, 4)).toBe(0);
  });

  it("fits 145 px cells 8 px apart: two at the phone, four at the desk", () => {
    expect(bulletCellsPerLine(301, 145, 8)).toBe(2);
    expect(bulletCellsPerLine(611, 145, 8)).toBe(4);
    expect(bulletCellsPerLine(100, 145, 8)).toBe(1);
  });
});
