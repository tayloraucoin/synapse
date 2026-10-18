import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  dayReadOutput,
  weekReadOutput,
  type GoogleSnapshotEvent,
} from "@syn/validators";
import { assembleDay } from "./day-assembly";
import { rows } from "./planner-rows.fixture";
import { assembleWeek } from "./week-assembly";

/**
 * USE-103 C5: planner.today and planner.week carry the enabled calendars'
 * events for their dates. `selectGoogleRows` reads only calendars with
 * `enabled = true`, so a calendar turned off is absent from
 * `googleCalendars` on the next read, and its events drop out with it.
 */

const ACCOUNT = "00000000-0000-4000-8000-0000000000a1";
const WORK = "00000000-0000-4000-8000-0000000000c1";
const HOLIDAYS = "00000000-0000-4000-8000-0000000000c2";
const WEEK = "2026-W43";
const MON = "2026-10-19";
const TUE = "2026-10-20";

const event = (over: Partial<GoogleSnapshotEvent>): GoogleSnapshotEvent => ({
  calendarId: "work@example.com",
  eventId: "e",
  title: "Standup",
  answer: "yes",
  allDay: false,
  // 10:30 to 11:00 in Vancouver (the fixture's zone).
  start: "2026-10-19T17:30:00.000Z",
  end: "2026-10-19T18:00:00.000Z",
  ...over,
});

const snapshot = {
  accountId: ACCOUNT,
  weekStart: MON,
  events: [
    event({ eventId: "standup" }),
    event({
      eventId: "review",
      title: "Review",
      start: "2026-10-20T21:00:00.000Z",
      end: "2026-10-20T22:00:00.000Z",
      answer: "maybe",
    }),
    event({
      eventId: "holiday",
      calendarId: "holidays@group",
      title: "Holiday",
      allDay: true,
      start: TUE,
      end: "2026-10-21",
    }),
  ],
};

const both = [
  { id: WORK, accountId: ACCOUNT, calendarId: "work@example.com" },
  { id: HOLIDAYS, accountId: ACCOUNT, calendarId: "holidays@group" },
];

const withGoogle = (calendars = both) =>
  rows({ googleSnapshots: [snapshot], googleCalendars: calendars });

describe("the day and week reads carry Google events (C-USE-103-5)", () => {
  it("planner.today has the date's events on the calendars that are on", () => {
    const day = dayReadOutput.parse(assembleDay(withGoogle(), MON));
    expect(day.googleEvents).toEqual([
      {
        id: `${WORK}:standup`,
        calendarId: WORK,
        title: "Standup",
        date: MON,
        startsAt: "10:30",
        endsAt: "11:00",
        answer: "yes",
        allDay: false,
      },
    ]);
  });

  it("planner.week has each date's own events, and the usual week none", () => {
    const week = weekReadOutput.parse(assembleWeek(withGoogle(), WEEK));
    const tuesday = week.days.find((day) => day.date === TUE)!;
    expect(tuesday.googleEvents.map((e) => e.title)).toEqual([
      "Holiday",
      "Review",
    ]);
    const usual = assembleWeek(withGoogle(), "usual");
    expect(usual.days.every((day) => day.googleEvents.length === 0)).toBe(true);
  });

  it("a calendar turned off drops out of the next read", () => {
    const off = withGoogle(both.filter((c) => c.id !== HOLIDAYS));
    const tuesday = assembleWeek(off, WEEK).days.find(
      (day) => day.date === TUE,
    )!;
    expect(tuesday.googleEvents.map((e) => e.title)).toEqual(["Review"]);
  });

  it("selects only the calendars that are on", () => {
    const text = readFileSync(
      join(import.meta.dirname, "../google/read-events.ts"),
      "utf8",
    );
    expect(text).toMatch(/\.where\(eq\(googleCalendars\.enabled, true\)\)/);
  });
});
