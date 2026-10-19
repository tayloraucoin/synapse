import { describe, expect, it } from "vitest";
import { tappedSlot } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { createFixtureServer } from "@/lib/fixtures/server";
import {
  dayTitle,
  rowBounds,
  rowDayLabel,
  rowLine,
  rowName,
  setUpColumn,
  weekRangeWords,
} from "./set-up-view";
import { resolveDaysPlace } from "./use-days";
import { deriveWeek } from "./use-week";

/** Set my days (USE-39): the rows' words, the column, and where it opens. */

async function weekOf(state: string, week: string) {
  const scenario = resolveScenario(state);
  const server = createFixtureServer(scenario, () => new Date(scenario.now));
  return deriveWeek(await server.readWeek(week));
}

const COUNT = /\b\d+\s+(items?|blocks?|tasks?|things?)\b/i;

describe("the week's rows (C1; usual-week.md, the-week.md)", () => {
  it("names each usual day by kind and name, never a count", async () => {
    const { days } = await weekOf("usual-week", "usual");
    expect(days.map(rowDayLabel)).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
    expect(days.map(rowBounds)).toEqual([
      "7:00 to 22:30",
      "7:00 to 22:30",
      "7:00 to 22:30",
      "7:00 to 22:30",
      "7:00 to 22:30",
      "8:00 to 23:00",
      "All day",
    ]);
    const lines = days.map(rowLine);
    expect(lines[0]).toBe("Evening at 21:30, the wind-down");
    expect(lines[1]).toBe("Life: Climbing [placeholder], 19:00 to 21:00");
    expect(lines[2]).toBe(
      "Rest: abs and yoga. Evening at 21:30, the wind-down",
    );
    expect(lines[4]).toBe("To-dos: Errands, 17:30 to 19:00");
    expect(lines[5]).toContain("To-dos: Errands, 10:00 to 12:30");
    expect(lines[5]).toContain("Life: Out with friends [placeholder]");
    expect(lines[6]).toBe(
      "One checklist, no times. To-dos: Sunday reset, 13:00 to 16:00",
    );
    for (const line of lines) expect(line).not.toMatch(COUNT);
    for (const day of days)
      expect(day.strip[0]?.part).toBe(day.bounds ? "orient" : undefined);
    expect(rowName(days[0]!)).toBe(
      "Monday, 7:00 to 22:30, Evening at 21:30, the wind-down",
    );
  });

  it("dates This week and says what is still to do in words", async () => {
    const { days } = await weekOf("tap-a-time", "2026-W42");
    expect(days.map(rowDayLabel)).toEqual([
      "Mon 12",
      "Tue 13",
      "Wed 14",
      "Thu 15",
      "Fri 16",
      "Sat 17",
      "Sun 18",
    ]);
    const lines = days.map(rowLine);
    expect(lines[0]).toMatch(
      /^Primary: \[Write the sync spec\], \[Review the Paper handoff\]/,
    );
    expect(lines[1]).toBe("No work slotted yet");
    expect(lines[2]).toBe("Rest: abs and yoga. No work slotted yet");
    expect(lines[3]).toBe(
      "Dentist [placeholder] at 14:00. No work slotted yet",
    );
    expect(rowBounds(days[4]!)).toBe("Not set yet");
    expect(rowBounds(days[5]!)).toBe("Not set yet");
    expect(lines[6]).toBe("One checklist, no times");
    expect(weekRangeWords(days.map((d) => d.date!))).toBe("12 to 18 Oct");
  });
});

describe("a day's column (usual-saturday.md, out-of-bounds.md)", () => {
  it("holds a To-dos block's rule and a usual Work block's time", async () => {
    const { days } = await weekOf("usual-saturday", "usual");
    const saturday = setUpColumn(days[5]!);
    const errands = saturday.blocks.find((b) => b.name === "Errands")!;
    expect(errands.lines).toEqual([
      "Fills from To-dos each Saturday, any type, picked on the day.",
    ]);
    const monday = setUpColumn(days[0]!);
    expect(monday.blocks.find((b) => b.kind === "work")?.lines).toEqual([
      "The time is kept every week.",
      "Work goes in on This week.",
    ]);
    expect(monday.orient).toEqual({ atMin: 420, lengthMin: 5 });
    expect(monday.hours).toEqual({ startMin: 420, endMin: 1380 });
    expect(dayTitle(days[5]!)).toBe("Every Saturday");
  });

  it("leaves open time open, with Free until (usual-thursday-evening.md)", async () => {
    const { days } = await weekOf("usual-week", "usual");
    const thursday = setUpColumn(days[3]!);
    expect(thursday.openLines).toEqual([
      { atMin: 17 * 60, text: "Free until 19:00." },
    ]);
    expect(thursday.blocks.find((b) => b.kind === "evening")?.startsAt).toBe(
      "21:30",
    );
  });

  it("keeps a block before Up at in place and names Orient's time", async () => {
    const { days } = await weekOf("usual-week", "usual");
    const day = days[3]!;
    const moved = {
      ...day,
      bounds: { upAt: "07:45", lightsOut: "22:30" },
      blocks: day.blocks.map((b) => ({
        ...b,
        edge: b.startsAt < "07:45" ? ("before_up_at" as const) : null,
      })),
    };
    const column = setUpColumn(moved);
    const wellness = column.blocks.find((b) => b.name === "Wellness")!;
    expect(wellness.outOfBounds).toBe("before_up_at");
    expect([wellness.startsAt, wellness.endsAt]).toEqual(["07:05", "08:00"]);
    expect(column.orient).toEqual({
      atMin: 465,
      lengthMin: 5,
      label: "Orient · 7:45",
    });
    expect(column.blocks).toHaveLength(day.blocks.length);
  });

  it("dates a This week day's title and lists its tiers", async () => {
    const { days } = await weekOf("tap-a-time", "2026-W42");
    expect(dayTitle(days[0]!)).toBe("Monday, 12 October");
    const work = setUpColumn(days[0]!).blocks.find(
      (b) => b.kind === "work" && b.startsAt === "09:30",
    )!;
    expect(work.lines).toBeUndefined();
    expect(work.tiers.map((t) => t.tier)).toEqual([
      "primary",
      "secondary",
      "stretch",
    ]);
    expect(work.tiers[0]!.items[0]!.label).toBe(
      "[Write the sync spec] · ENG-123",
    );
  });
});

describe("a tapped time (C-USE-set-my-days-tap-a-time-2)", () => {
  it("starts on the half hour and stops at the next block", () => {
    expect(
      tappedSlot({
        at: "17:10",
        blocks: [{ startsAt: "17:40", endsAt: "19:00" }],
        lightsOut: "22:30",
      }),
    ).toEqual({ startsAt: "17:00", endsAt: "17:40" });
  });
});

describe("where Set my days opens", () => {
  const base = { opens: "2026-W42", thisWeek: "2026-W42" };

  it("opens on the week, This week from Sunday evening", () => {
    const place = resolveDaysPlace({ ...base, week: null, day: null });
    expect(place).toMatchObject({ week: "2026-W42", day: null });
    expect(place.dates[0]).toBe("2026-10-12");
  });

  it("reads a weekday, or a date key with its week", () => {
    expect(
      resolveDaysPlace({ ...base, week: "usual", day: "3" }),
    ).toMatchObject({ week: "usual", day: 3, date: null });
    expect(
      resolveDaysPlace({ ...base, week: null, day: "2026-10-22" }),
    ).toMatchObject({ week: "2026-W43", day: 3, date: "2026-10-22" });
    expect(resolveDaysPlace({ ...base, week: "this", day: null }).week).toBe(
      "2026-W42",
    );
  });
});

describe("pushed, not a tab (D-USE-49)", () => {
  it("drops the tabs on Set my days and leaves the rail with nothing current", async () => {
    const { isPushedPath, isFocusedPath, tabForPath } =
      await import("@/app/(shell)/_components/nav-items");
    expect(isPushedPath("/days")).toBe(true);
    expect(isPushedPath("/today")).toBe(false);
    expect(isFocusedPath("/days")).toBe(false);
    expect(tabForPath("/days")).toBeNull();
  });
});
