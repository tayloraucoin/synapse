import { describe, expect, it } from "vitest";
import { wallClockToInstant } from "../day/wall-clock";
import {
  readDay,
  type DayBlock,
  type DayBlockChange,
  type DaySlot,
} from "./day-read";
import { presetRule } from "./rrule";

const TZ = "America/Vancouver";
const SUNDAY = "2026-10-18";

function block(
  id: string,
  startsAt: string,
  endsAt: string,
  repeat: { rrule: string | null } | { onDate: string },
  archivedAt: string | null = null,
): DayBlock & { name: string } {
  return {
    id,
    name: id,
    startsAt,
    endsAt,
    rrule: "rrule" in repeat ? repeat.rrule : null,
    onDate: "onDate" in repeat ? repeat.onDate : null,
    archivedAt,
  };
}

const slot = (
  id: string,
  blockId: string,
  sortOrder = 0,
  onDate = SUNDAY,
): DaySlot => ({ id, blockId, onDate, sortOrder });

const weeklySunday = { rrule: presetRule("weekly", "2026-10-04") };
const weeklyMonday = { rrule: presetRule("weekly", "2026-10-05") };
const daily = { rrule: presetRule("daily", "2026-10-01") };

const blocks = [
  block("reset", "13:00", "16:00", weeklySunday),
  block("coffee", "07:00", "08:00", { onDate: SUNDAY }),
  block("tomorrow", "07:00", "08:00", { onDate: "2026-10-19" }),
  block("work", "09:00", "17:00", weeklyMonday),
  block("old", "10:00", "11:00", weeklySunday, "2026-10-10T12:00:00Z"),
  block("walk", "09:00", "10:00", daily),
  block("supper", "18:00", "19:00", daily),
];

const changes: DayBlockChange[] = [
  {
    blockId: "walk",
    onDate: SUNDAY,
    skipped: true,
    startsAt: null,
    endsAt: null,
  },
  {
    blockId: "supper",
    onDate: "2026-10-19",
    skipped: false,
    startsAt: "20:00",
    endsAt: "21:00",
  },
];

describe("C5: readDay returns the date's blocks, changed on their own date, with their slots", () => {
  const day = readDay({
    dateKey: SUNDAY,
    timeZone: TZ,
    blocks,
    changes,
    slots: [
      slot("c", "reset", 2),
      slot("a", "reset", 0),
      slot("b", "reset", 1),
    ],
  });

  it("holds the rule's hits and the date's one-date blocks, ordered by start", () => {
    expect(day.blocks.map((occurrence) => occurrence.block.id)).toEqual([
      "coffee",
      "reset",
      "supper",
    ]);
  });

  it("keeps the caller's own record type", () => {
    expect(day.blocks[0]?.block.name).toBe("coffee");
  });

  it("drops a skipped block and an archived one", () => {
    const ids = day.blocks.map((occurrence) => occurrence.block.id);
    expect(ids).not.toContain("walk");
    expect(ids).not.toContain("old");
  });

  it("changes times on the change's own date only", () => {
    const supper = day.blocks.find(
      (occurrence) => occurrence.block.id === "supper",
    );
    expect(supper).toMatchObject({
      startsAt: "18:00",
      endsAt: "19:00",
      changed: false,
    });

    const monday = readDay({
      dateKey: "2026-10-19",
      timeZone: TZ,
      blocks,
      changes,
      slots: [],
    });
    const moved = monday.blocks.find(
      (occurrence) => occurrence.block.id === "supper",
    );
    expect(moved).toMatchObject({
      startsAt: "20:00",
      endsAt: "21:00",
      changed: true,
    });
    expect(moved?.start).toEqual(wallClockToInstant("2026-10-19", "20:00", TZ));
    // The skip on Sunday does not reach Monday.
    expect(monday.blocks.map((occurrence) => occurrence.block.id)).toContain(
      "walk",
    );
  });

  it("carries each block's slots in sort order", () => {
    const reset = day.blocks.find(
      (occurrence) => occurrence.block.id === "reset",
    );
    expect(reset?.slots.map((s) => s.id)).toEqual(["a", "b", "c"]);
    expect(day.unplaced).toEqual([]);
  });
});

describe("C6: instants on both DST change dates", () => {
  // Vancouver stays at UTC-7 from 2026 (tzdata 2026b), so the change dates
  // are read in Los Angeles, which keeps them.
  const DST_TZ = "America/Los_Angeles";
  const allDay = block("all-day", "00:00", "24:00", daily);
  const night = block("night", "01:30", "03:00", daily);

  it.each([
    ["fall back, 1 November 2026", "2026-11-01", "2026-11-02", 25],
    ["spring forward, 14 March 2027", "2027-03-14", "2027-03-15", 23],
  ])("%s", (_, dateKey, nextKey, hours) => {
    const day = readDay({
      dateKey,
      timeZone: DST_TZ,
      blocks: [allDay, night],
      changes: [],
      slots: [],
    });
    for (const occurrence of day.blocks) {
      expect(occurrence.start).toEqual(
        wallClockToInstant(dateKey, occurrence.startsAt, DST_TZ),
      );
    }

    const [whole, early] = day.blocks;
    // 24:00 is the next date's 00:00.
    expect(whole?.end).toEqual(wallClockToInstant(nextKey, "00:00", DST_TZ));
    expect(
      ((whole?.end.getTime() ?? 0) - (whole?.start.getTime() ?? 0)) / 3_600_000,
    ).toBe(hours);
    expect(early?.end).toEqual(wallClockToInstant(dateKey, "03:00", DST_TZ));
  });
});

describe("C7: a slot whose block is not on its date comes back unplaced", () => {
  it("returns slots of a skipped, a moved-off, an archived and an unreadable block", () => {
    const broken = block("broken", "08:00", "09:00", { rrule: "every Sunday" });
    const kept = slot("kept", "reset");
    const skipped = slot("skipped", "walk");
    const movedOff = slot("moved-off", "work");
    const archived = slot("archived", "old");
    const unreadable = slot("unreadable", "broken");

    const day = readDay({
      dateKey: SUNDAY,
      timeZone: TZ,
      blocks: [...blocks, broken],
      changes,
      slots: [kept, skipped, movedOff, archived, unreadable],
    });

    expect(day.unplaced.map((s) => s.id)).toEqual([
      "skipped",
      "moved-off",
      "archived",
      "unreadable",
    ]);
    expect(day.blocks.flatMap((occurrence) => occurrence.slots)).toEqual([
      kept,
    ]);
  });
});
