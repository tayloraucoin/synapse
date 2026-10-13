import { describe, expect, it } from "vitest";
import {
  defaultWeek,
  isOwnChange,
  usualChangeReach,
  usualDay,
} from "./usual-week";

const ZONE = "America/Vancouver";
const rule = (start: string, body: string): string =>
  `DTSTART;VALUE=DATE:${start.replaceAll("-", "")}\nRRULE:${body}`;

describe("C6: usualDay keeps weekly blocks on the weekday; defaultWeek turns on Sunday 18:00", () => {
  const blocks = [
    {
      id: "wellness",
      rrule: rule("2026-10-05", "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"),
    },
    { id: "climbing", rrule: rule("2026-10-06", "FREQ=WEEKLY;BYDAY=TU,TH") },
    { id: "orient-walk", rrule: rule("2026-10-05", "FREQ=DAILY") },
    { id: "rent", rrule: rule("2026-10-01", "FREQ=MONTHLY;BYMONTHDAY=1") },
    { id: "birthday", rrule: rule("2026-10-15", "FREQ=YEARLY") },
    { id: "dentist", rrule: null },
  ];

  it("keeps the blocks whose weekly rule hits the weekday", () => {
    expect(usualDay(blocks, 1).map((block) => block.id)).toEqual([
      "wellness",
      "climbing",
      "orient-walk",
    ]);
    expect(usualDay(blocks, 5).map((block) => block.id)).toEqual([
      "orient-walk",
    ]);
  });

  it("leaves monthly, yearly and one-date blocks out", () => {
    const ids = [0, 1, 2, 3, 4, 5, 6].flatMap((weekday) =>
      usualDay(blocks, weekday).map((block) => block.id),
    );
    expect(ids).not.toContain("rent");
    expect(ids).not.toContain("birthday");
    expect(ids).not.toContain("dentist");
  });

  it("opens on the usual week until Sunday 18:00", () => {
    // Sunday 18 October 2026, 17:59 in Vancouver (PDT, UTC-7).
    expect(defaultWeek(new Date("2026-10-19T00:59:00Z"), ZONE)).toBe("usual");
    // Wednesday 14 October, evening.
    expect(defaultWeek(new Date("2026-10-15T03:00:00Z"), ZONE)).toBe("usual");
  });

  it("opens on this week from Sunday 18:00", () => {
    expect(defaultWeek(new Date("2026-10-19T01:00:00Z"), ZONE)).toBe("this");
    expect(defaultWeek(new Date("2026-10-19T04:14:00Z"), ZONE)).toBe("this");
  });
});

describe("C7: usualChangeReach never touches a begun or changed date; isOwnChange finds a date's own changes", () => {
  // The week of 12 to 18 October 2026, Monday first.
  const weekDates = [
    "2026-10-12",
    "2026-10-13",
    "2026-10-14",
    "2026-10-15",
    "2026-10-16",
    "2026-10-17",
    "2026-10-18",
  ];
  const upAtOn = (): string => "07:00";
  const reach = (now: string, changedOn: ReadonlySet<string> = new Set()) =>
    usualChangeReach({
      weekday: 3,
      weekDates,
      now: new Date(now),
      timeZone: ZONE,
      upAtOn,
      changedOn,
    });

  it("names this week's Thursday before it has begun", () => {
    // Wednesday 14 October, 21:10.
    expect(reach("2026-10-15T04:10:00Z")).toEqual({ follows: "2026-10-15" });
    // Thursday 15 October, 06:59: Up at not yet reached.
    expect(reach("2026-10-15T13:59:00Z")).toEqual({ follows: "2026-10-15" });
  });

  it("gives none once that date has begun", () => {
    // Thursday 15 October, 07:00 and 21:10.
    expect(reach("2026-10-15T14:00:00Z")).toEqual({ follows: null });
    expect(reach("2026-10-16T04:10:00Z")).toEqual({ follows: null });
  });

  it("reads begun against that date's own Up at", () => {
    const late = usualChangeReach({
      weekday: 3,
      weekDates,
      // Thursday 15 October, 08:30.
      now: new Date("2026-10-15T15:30:00Z"),
      timeZone: ZONE,
      upAtOn: (dateKey) => (dateKey === "2026-10-15" ? "09:00" : "07:00"),
      changedOn: new Set(),
    });
    expect(late).toEqual({ follows: "2026-10-15" });
  });

  it("gives none when the block is changed on that date", () => {
    expect(reach("2026-10-15T04:10:00Z", new Set(["2026-10-15"]))).toEqual({
      follows: null,
    });
  });

  it("finds a block change, a skipped slot or a dated item on the date", () => {
    const none = { changes: [], slots: [], items: [] };
    const dateKey = "2026-10-15";
    expect(isOwnChange({ dateKey, ...none })).toBe(false);
    expect(
      isOwnChange({ dateKey, ...none, changes: [{ onDate: dateKey }] }),
    ).toBe(true);
    expect(
      isOwnChange({
        dateKey,
        ...none,
        slots: [{ onDate: dateKey, skipped: true }],
      }),
    ).toBe(true);
    expect(
      isOwnChange({ dateKey, ...none, items: [{ onDate: dateKey }] }),
    ).toBe(true);
  });

  it("ignores other dates, slots not skipped and items for every date", () => {
    expect(
      isOwnChange({
        dateKey: "2026-10-15",
        changes: [{ onDate: "2026-10-14" }],
        slots: [
          { onDate: "2026-10-15", skipped: false },
          { onDate: "2026-10-14", skipped: true },
        ],
        items: [{ onDate: null }, { onDate: "2026-10-16" }],
      }),
    ).toBe(false);
  });
});
