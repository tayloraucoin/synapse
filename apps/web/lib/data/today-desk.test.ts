import { describe, expect, it } from "vitest";
import { deskColumn } from "@/app/(shell)/today/_components/desk/desk-column";
import { openedDayTiers } from "@/app/(shell)/today/_components/desk/opened-day-view";
import {
  shortTitle,
  stripDays,
} from "@/app/(shell)/today/_components/desk/strip-days";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { TODAY_DESK_NOW } from "@/lib/fixtures/scenarios/today-desk";
import { createFixtureServer } from "@/lib/fixtures/server";
import { todayRoute } from "@/lib/routes";
import { deriveToday } from "./derive-today";
import { deriveSchedule, scheduleNow } from "./use-schedule";
import { deriveWeek } from "./use-week";
import { deriveWeekView } from "./week-view";

/**
 * USE-58: the week strip, the day column and the opened day, read from the
 * today-desk scenario as the screen reads them (C1, C2).
 */

const WEEK = "2026-W42";
const MONDAY = "2026-10-12";
const TUESDAY = "2026-10-13";

async function read(dateKey: string) {
  const now = new Date(TODAY_DESK_NOW);
  const server = createFixtureServer(resolveScenario("today-desk"), () => now);
  const week = deriveWeek(await server.readWeek(WEEK));
  const view = deriveWeekView({
    weekKey: WEEK,
    week,
    pool: null,
    todayKey: MONDAY,
  });
  const today = deriveToday(await server.readToday(dateKey));
  const schedule = deriveSchedule(today, now);
  return { now, week, view, today, schedule };
}

describe("the week strip (C1)", () => {
  it("draws seven days, today marked, lines by the date's own records", async () => {
    const { view } = await read(MONDAY);
    const days = stripDays(view);
    expect(days.map((day) => day.head)).toEqual([
      "Mon 12",
      "Tue 13",
      "Wed 14",
      "Thu 15",
      "Fri 16",
      "Sat 17",
      "Sun 18",
    ]);
    expect(days.filter((day) => day.isToday).map((day) => day.dateKey)).toEqual(
      [MONDAY],
    );
    const [mon, tue, wed, , fri, sat, sun] = days;
    // The first work item and the first event.
    expect(mon!.lines).toMatchObject([
      { kind: "work", tier: "primary", title: "[Portal sign-in]" },
      { kind: "event", time: "11:00", title: "[Kestrel weekly]" },
    ]);
    // "2/3" is a session's place, never a count of the day (D-USE-47).
    expect(tue!.lines).toMatchObject([
      { kind: "work", title: "[Alder intro]", session: "2/3" },
      { kind: "event", time: "15:30", title: "[Dentist]" },
    ]);
    expect(wed!.lines[0]).toMatchObject({ session: "3/3" });
    expect(fri!.empty).toBe("Nothing slotted yet");
    expect(sat!.empty).toBe("No work");
    expect(sun!.empty).toBe("Sunday reset");
  });

  it("names a card's work by its title before a colon", () => {
    expect(shortTitle("[Case studies: write the Alder intro]")).toBe(
      "[Case studies]",
    );
    expect(shortTitle("Invoice template")).toBe("Invoice template");
  });

  it("opens another date at ?date= and today at Today itself", () => {
    expect(todayRoute({ date: TUESDAY })).toBe("/today?date=2026-10-13");
    expect(todayRoute()).toBe("/today");
  });
});

describe("the day column", () => {
  it("on today: the hours 8 to 18, events in plum inside their block, the now line (C1)", async () => {
    const { view, week, schedule, now, today } = await read(MONDAY);
    const column = deskColumn({
      schedule,
      bounds: week.days[0]!.bounds,
      fits: view.days[0]!.fits,
      now: scheduleNow(now, today.records.timeZone),
    });
    expect(column.words.range).toBe("whole day, then 8:00 to 18:00");
    expect(column.words.ticks).toEqual({
      start: "7:00",
      middle: view.days[0]!.fits,
      end: "Lights out 22:30",
    });
    const morning = column.blocks.find(
      (b) => b.label === "Work · 9:30 to 12:00",
    );
    expect(morning?.hue).toBe("sky");
    expect(morning?.bands.map((band) => band.title)).toEqual([
      "[Kestrel weekly]",
    ]);
    expect(column.now).toEqual({ atMin: 620, label: "10:20" });
  });

  it("on another date: its events, and no now line (C2, C-USE-today-opened-day-3)", async () => {
    const { view, week, schedule } = await read(TUESDAY);
    const column = deskColumn({
      schedule,
      bounds: week.days[1]!.bounds,
      fits: view.days[1]!.fits,
      now: null,
    });
    const late = column.blocks.find((b) => b.label === "Work · 15:10 to 17:00");
    expect(late?.bands.map((band) => band.startsAt)).toEqual(["15:30"]);
    expect(column.now).toBeNull();
    expect(column.blocks.every((block) => !block.past)).toBe(true);
  });
});

describe("the opened day (C2, C-USE-today-opened-day-2)", () => {
  it("draws the tiers with nothing firing, the first undone item in the card's place", async () => {
    const { view, week } = await read(TUESDAY);
    const day = week.days[1]!;
    const tiers = openedDayTiers({
      day: view.days[1]!,
      workItems: day.records.workItems,
      slots: day.records.slots,
      clientFor: () => null,
      issueFor: () => null,
    });
    expect(tiers.map((tier) => tier.tier)).toEqual([
      "primary",
      "secondary",
      "stretch",
    ]);
    const rows = tiers.flatMap((tier) => tier.rows);
    expect(rows.map((row) => row.form)).toEqual(["next", "idle"]);
    expect(rows.every((row) => row.firing === null)).toBe(true);
    expect(rows[0]).toMatchObject({
      title: "[Alder intro]",
      identifier: "ALD-17",
      size: "3 Medium",
      session: "session 2 of 3",
    });
    expect(tiers[2]!.rows).toEqual([]);
  });
});
