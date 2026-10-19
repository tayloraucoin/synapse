import { describe, expect, it } from "vitest";
import {
  firstDayWithRoom,
  fitInBlock,
  topMinutes,
  type BlockFitDay,
} from "./fit";

const at = (hhmm: string, day = "2026-10-13") => new Date(`${day}T${hhmm}:00Z`);
const BLOCK = { start: at("09:30"), end: at("12:00") }; // 150 min

describe("C3: fitInBlock counts the tiers at and above, at the top of every range, less meetings counted once", () => {
  it("fits after the tiers above, and says how much is free", () => {
    const fit = fitInBlock({
      block: BLOCK,
      slots: [
        { tier: "urgent", topMin: 30 },
        { tier: "primary", topMin: 60 },
      ],
      busy: [],
      tier: "primary",
      topMin: 30,
    });
    expect(fit).toEqual({ fits: true, runsTo: at("11:30"), freeMin: 30 });
  });

  it("ignores the tiers below: they slide, Stretch first", () => {
    const fit = fitInBlock({
      block: BLOCK,
      slots: [
        { tier: "secondary", topMin: 120 },
        { tier: "stretch", topMin: 120 },
      ],
      busy: [],
      tier: "primary",
      topMin: 60,
    });
    expect(fit).toEqual({ fits: true, runsTo: at("10:30"), freeMin: 90 });
  });

  it("counts a done slot's top: the plan, not the clock", () => {
    const fit = fitInBlock({
      block: BLOCK,
      slots: [{ tier: "primary", topMin: 120 }],
      busy: [],
      tier: "primary",
      topMin: 60,
    });
    expect(fit).toEqual({ fits: false, runsTo: at("12:30"), overMin: 30 });
  });

  it("takes a meeting inside the block out, and runs around it", () => {
    const fit = fitInBlock({
      block: BLOCK,
      slots: [{ tier: "primary", topMin: 30 }],
      busy: [{ start: at("10:00"), end: at("10:30") }],
      tier: "primary",
      topMin: 30,
    });
    // 30 to 10:00, the meeting, then 30 more: 11:00; 150 − 30 − 60 free.
    expect(fit).toEqual({ fits: true, runsTo: at("11:00"), freeMin: 60 });
  });

  it("counts overlapping meetings once, and clips meetings to the block", () => {
    const fit = fitInBlock({
      block: BLOCK,
      slots: [],
      busy: [
        { start: at("10:00"), end: at("10:45") },
        { start: at("10:30"), end: at("11:00") },
        { start: at("08:00"), end: at("09:45") },
        { start: at("11:50"), end: at("13:00") },
        { start: at("14:00"), end: at("15:00") },
      ],
      tier: "stretch",
      topMin: 30,
    });
    // Busy: 9:30–9:45, 10:00–11:00, 11:50–12:00 = 85; free 65 − 30 = 35.
    expect(fit).toEqual({ fits: true, runsTo: at("11:15"), freeMin: 35 });
  });

  it("says by how much it doesn't fit, in whole minutes", () => {
    const fit = fitInBlock({
      block: BLOCK,
      slots: [{ tier: "primary", topMin: 110 }],
      busy: [],
      tier: "primary",
      topMin: 240,
    });
    expect(fit).toEqual({ fits: false, runsTo: at("15:20"), overMin: 200 });
  });

  it("fits exactly with 0 free", () => {
    expect(
      fitInBlock({
        block: BLOCK,
        slots: [],
        busy: [],
        tier: "urgent",
        topMin: 150,
      }),
    ).toEqual({ fits: true, runsTo: at("12:00"), freeMin: 0 });
  });

  it("is total: a broken block holds nothing, and never throws", () => {
    const fit = fitInBlock({
      block: { start: new Date("nope"), end: at("12:00") },
      slots: [],
      busy: [{ start: new Date("nope"), end: new Date("nope") }],
      tier: "primary",
      topMin: 30,
    });
    expect(fit.fits).toBe(false);
    expect(fit.fits === false && fit.overMin).toBe(30);
  });
});

describe("C4: topMinutes, Huge with no top, and the first later day with room", () => {
  it("takes the session's length, then the item's top, then the size's default top", () => {
    expect(topMinutes({ lengthMin: 45, lengthMaxMin: 90, size: "large" })).toBe(
      45,
    );
    expect(
      topMinutes({ lengthMin: null, lengthMaxMin: 90, size: "large" }),
    ).toBe(90);
    expect(
      topMinutes({ lengthMin: null, lengthMaxMin: null, size: "large" }),
    ).toBe(240);
    expect(
      topMinutes({ lengthMin: null, lengthMaxMin: null, size: "quick" }),
    ).toBe(30);
    expect(
      topMinutes({ lengthMin: null, lengthMaxMin: null, size: "small" }),
    ).toBe(60);
    expect(
      topMinutes({ lengthMin: null, lengthMaxMin: null, size: "medium" }),
    ).toBe(120);
  });

  it("gives Huge with no range no top, and an unsized item 0", () => {
    expect(
      topMinutes({ lengthMin: null, lengthMaxMin: null, size: "huge" }),
    ).toBeNull();
    expect(
      topMinutes({ lengthMin: null, lengthMaxMin: 300, size: "huge" }),
    ).toBe(300);
    expect(
      topMinutes({ lengthMin: null, lengthMaxMin: null, size: null }),
    ).toBe(0);
  });

  it("never fits Huge with no top, nor beside one", () => {
    expect(
      fitInBlock({
        block: BLOCK,
        slots: [],
        busy: [],
        tier: "primary",
        topMin: null,
      }),
    ).toEqual({ fits: false, runsTo: null, overMin: null });
    expect(
      fitInBlock({
        block: BLOCK,
        slots: [{ tier: "urgent", topMin: null }],
        busy: [],
        tier: "primary",
        topMin: 15,
      }),
    ).toEqual({ fits: false, runsTo: null, overMin: null });
  });

  const day = (dateKey: string, held: number, block = true): BlockFitDay => ({
    dateKey,
    block: block
      ? { start: at("09:30", dateKey), end: at("12:00", dateKey) }
      : null,
    slots: [{ tier: "primary", topMin: held }],
    busy: [],
  });

  it("returns the first day by date whose tier holds it", () => {
    const days = [
      day("2026-10-16", 0),
      day("2026-10-14", 120),
      day("2026-10-15", 0, false),
      day("2026-10-15", 30),
    ];
    expect(firstDayWithRoom(days, "primary", 90)).toBe("2026-10-15");
  });

  it("returns none when no day has room, or the item has no top", () => {
    expect(
      firstDayWithRoom([day("2026-10-14", 120)], "primary", 90),
    ).toBeNull();
    expect(
      firstDayWithRoom([day("2026-10-14", 0)], "primary", null),
    ).toBeNull();
    expect(firstDayWithRoom([], "primary", 10)).toBeNull();
  });
});
