import { describe, expect, it } from "vitest";
import {
  dueBadge,
  fitsLine,
  timeLensDay,
  type ChipView,
  type FitsDay,
} from "./week-view";

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

/* ---- USE-73: the Time lens's day ---- */

type LensInput = Parameters<typeof timeLensDay>[0];

const blockOf = (
  id: string,
  kind: string,
  startsAt: string,
  endsAt: string,
  checklist = false,
) =>
  ({
    block: { id, kind, name: kind === "work" ? "Work" : id, checklist },
    startsAt,
    endsAt,
  }) as unknown as LensInput["blocks"][number];

const eventOf = (id: string, startsAt: string, endsAt: string) =>
  ({ id, title: `[${id}]`, startsAt, endsAt }) as LensInput["events"][number];

const chip = (id: string, tier: ChipView["tier"]) => ({ id, tier }) as ChipView;

describe("timeLensDay", () => {
  // Given out of order on purpose: the lens places by time, never by index.
  const blocks = [
    blockOf("late", "work", "15:10", "17:00"),
    blockOf("training", "training", "08:00", "08:57"),
    blockOf("reset", "wellness", "00:00", "24:00", true),
    blockOf("morning", "work", "09:30", "12:00"),
    blockOf("lunch", "break", "12:00", "13:00"),
  ];

  it("places each block at its own minutes from 8:00, all-day checklists left out", () => {
    const { timeBlocks } = timeLensDay({
      blocks,
      events: [],
      chipsOf: new Map(),
      fits: "Work ends 16:20",
    });
    expect(timeBlocks.map((b) => [b.id, b.topMin, b.lengthMin])).toEqual([
      ["training", 0, 57],
      ["morning", 90, 150],
      ["lunch", 240, 60],
      ["late", 430, 110],
    ]);
    expect(timeBlocks.find((b) => b.id === "morning")?.label).toBe(
      "Work, 9:30 to 12:00",
    );
  });

  it("puts an event inside the block its start falls in, never splitting it", () => {
    const { timeBlocks, looseEvents } = timeLensDay({
      blocks,
      events: [
        eventOf("Kestrel", "11:00", "11:30"),
        eventOf("Late", "17:30", "17:45"),
      ],
      chipsOf: new Map(),
      fits: "",
    });
    const morning = timeBlocks.find((b) => b.id === "morning")!;
    expect(morning.lengthMin).toBe(150);
    expect(morning.events).toEqual([
      { id: "Kestrel", label: "11:00 [Kestrel]", offsetMin: 90, lengthMin: 30 },
    ]);
    expect(timeBlocks.filter((b) => b.id === "morning")).toHaveLength(1);
    expect(looseEvents.map((e) => [e.id, e.topMin])).toEqual([["Late", 570]]);
  });

  it("orders chips tier by tier and sets the Fits line in the last Work block only", () => {
    const { timeBlocks } = timeLensDay({
      blocks,
      events: [],
      chipsOf: new Map([
        [
          "morning",
          [chip("s", "stretch"), chip("p", "primary"), chip("a", "secondary")],
        ],
      ]),
      fits: "Work ends 16:20",
    });
    expect(
      timeBlocks.find((b) => b.id === "morning")?.chips.map((c) => c.id),
    ).toEqual(["p", "a", "s"]);
    expect(timeBlocks.map((b) => b.fits)).toEqual([
      null,
      null,
      null,
      "Work ends 16:20",
    ]);
  });
});
