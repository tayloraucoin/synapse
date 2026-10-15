import { describe, expect, it } from "vitest";
import { dueBadge, fitsLine, type FitsDay } from "./week-view";

/** C1 (USE-72): due badges per column; Fits as a time, never a count. */

describe("dueBadge", () => {
  const thursday = "2026-10-15";

  it("works the badge out for its own column", () => {
    expect(dueBadge(thursday, "2026-10-12")).toBeNull();
    expect(dueBadge(thursday, "2026-10-13")).toEqual({
      word: "Due Thu",
      tone: "warning",
    });
    expect(dueBadge(thursday, "2026-10-14")).toEqual({
      word: "Due tomorrow",
      tone: "warning",
    });
    expect(dueBadge(thursday, thursday)).toEqual({
      word: "Due today",
      tone: "danger",
    });
  });

  it("shows nothing for an item with no due date", () => {
    expect(dueBadge(null, "2026-10-13")).toBeNull();
  });
});

describe("fitsLine", () => {
  const blocks = (
    late: FitsDay["workBlocks"][number]["slots"],
  ): FitsDay["workBlocks"] => [
    {
      startsAt: "09:30",
      endsAt: "12:00",
      slots: [
        { tier: "primary", topMin: 60 },
        { tier: "primary", topMin: 60 },
      ],
    },
    {
      startsAt: "13:00",
      endsAt: "15:00",
      slots: [{ tier: "secondary", topMin: 60 }],
    },
    { startsAt: "15:10", endsAt: "17:00", slots: late },
  ];

  it("reads Monday's work ending at 16:20", () => {
    expect(
      fitsLine({
        workBlocks: blocks([
          { tier: "secondary", topMin: 40 },
          { tier: "stretch", topMin: 30 },
        ]),
        events: [{ startsAt: "11:00", endsAt: "11:30" }],
      }),
    ).toBe("Work ends 16:20");
  });

  it("reads a Work day with nothing slotted as not yet", () => {
    expect(
      fitsLine({
        workBlocks: blocks([]).map((b) => ({ ...b, slots: [] })),
        events: [],
      }),
    ).toBe("Nothing slotted yet");
  });

  it("names a day with no Work blocks", () => {
    expect(fitsLine({ workBlocks: [], events: [] })).toBe("No work blocks");
  });
});
