import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { googleEventsPage as googleEventsListResponse } from "./client";
import { googleEventsOn, landOn, snapshotEventOf } from "./events";

/**
 * USE-103 C2 and C3. The response beside this file is shaped from Google's
 * events.list reference (`maxAttendees=1`, `singleEvents=true`) [NOT
 * VERIFIED against a live account: C6 records one].
 *
 * How each answer draws is USE-109's `bandShapeOf`: yes is a band, maybe and
 * none a dashed band with Add to day, no hidden. Cancelled never reaches it.
 */

const TZ = "America/Los_Angeles";
const CAL = "taylor@example.com";
const ROW = "00000000-0000-4000-8000-0000000000c1";

const recorded: unknown = JSON.parse(
  readFileSync(
    join(import.meta.dirname, "__fixtures__/events-list.json"),
    "utf8",
  ),
);

const parsed = googleEventsListResponse.parse(recorded);
const kept = parsed.items.flatMap((item) => {
  const event = snapshotEventOf(CAL, item);
  return event ? [event] : [];
});
const byId = new Map(kept.map((event) => [event.eventId, event]));

describe("the event schema and the answer (C-USE-103-2)", () => {
  it("parses the recorded events.list response", () => {
    expect(parsed.items).toHaveLength(8);
  });

  it("maps the self attendee's answer", () => {
    expect(byId.get("standup_20261019T173000Z")?.answer).toBe("yes");
    expect(byId.get("coffee-ana")?.answer).toBe("maybe");
    expect(byId.get("design-review")?.answer).toBe("none");
    expect(byId.get("vendor-call")?.answer).toBe("no");
  });

  it("reads an event with no attendees as yes", () => {
    expect(byId.get("dentist")?.answer).toBe("yes");
  });

  it("drops cancelled events and working-location ones", () => {
    expect(byId.has("moved-1on1")).toBe(false);
    expect(byId.has("office-wfh")).toBe(false);
    expect(kept).toHaveLength(6);
  });

  it("fails a timed event that is missing its end", () => {
    const broken = {
      items: [
        {
          id: "x",
          status: "confirmed",
          start: { dateTime: "2026-10-19T10:00:00Z" },
        },
      ],
    };
    expect(googleEventsListResponse.safeParse(broken).success).toBe(false);
  });

  it("fails an item with no id", () => {
    expect(
      googleEventsListResponse.safeParse({ items: [{ status: "confirmed" }] })
        .success,
    ).toBe(false);
  });
});

describe("dates in the account's zone, end exclusive (C-USE-103-3)", () => {
  it("lands a timed event on its local date and times", () => {
    const standup = byId.get("standup_20261019T173000Z")!;
    expect(landOn(standup, "2026-10-19", TZ)).toEqual({
      startsAt: "10:30",
      endsAt: "11:00",
    });
    expect(landOn(standup, "2026-10-20", TZ)).toBeNull();
  });

  it("lands an all-day event on each date before its end, not the end", () => {
    const offsite = byId.get("offsite")!;
    expect(landOn(offsite, "2026-10-21", TZ)).toBeNull();
    expect(landOn(offsite, "2026-10-22", TZ)).toEqual({
      startsAt: "00:00",
      endsAt: "23:59",
    });
    expect(landOn(offsite, "2026-10-23", TZ)).not.toBeNull();
    expect(landOn(offsite, "2026-10-24", TZ)).toBeNull();
  });

  it("puts an evening event on the local date, not UTC's", () => {
    // 16:00 to 17:00 in Los Angeles is 23:00 to 00:00 UTC.
    const dentist = byId.get("dentist")!;
    expect(dentist.start).toBe("2026-10-20T23:00:00.000Z");
    expect(landOn(dentist, "2026-10-20", TZ)).toEqual({
      startsAt: "16:00",
      endsAt: "17:00",
    });
    expect(landOn(dentist, "2026-10-21", TZ)).toBeNull();
  });

  it("ends an event at midnight on the date before", () => {
    const late = {
      ...byId.get("dentist")!,
      start: "2026-10-21T05:00:00.000Z", // 22:00 local
      end: "2026-10-21T07:00:00.000Z", // 00:00 local, the 21st
    };
    expect(landOn(late, "2026-10-20", TZ)).toEqual({
      startsAt: "22:00",
      endsAt: "23:59",
    });
    expect(landOn(late, "2026-10-21", TZ)).toBeNull();
  });

  it("clips an overnight event to each date", () => {
    const overnight = {
      ...byId.get("dentist")!,
      start: "2026-10-21T05:00:00.000Z", // 22:00 on the 20th
      end: "2026-10-21T09:00:00.000Z", // 02:00 on the 21st
    };
    expect(landOn(overnight, "2026-10-21", TZ)).toEqual({
      startsAt: "00:00",
      endsAt: "02:00",
    });
  });

  it("reads the day's events from the date's own week only", () => {
    const snapshots = [
      { accountId: "a", weekStart: "2026-10-19", events: kept },
      { accountId: "a", weekStart: "2026-10-12", events: kept },
    ];
    const calendars = [{ id: ROW, accountId: "a", calendarId: CAL }];
    const monday = googleEventsOn(snapshots, calendars, "2026-10-19", TZ);
    expect(monday.map((event) => event.title)).toEqual([
      "Standup",
      "Coffee with Ana",
      "Vendor call",
      "Design review",
    ]);
    expect(monday.every((event) => event.calendarId === ROW)).toBe(true);
  });
});
