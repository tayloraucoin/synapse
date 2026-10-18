/**
 * Google's events as Synapse keeps and shows them (USE-103), pure.
 *
 * The answer is the attendee row with `self`: accepted is yes (a band),
 * tentative is maybe and needsAction not answered (both a dashed band with
 * Add to day), declined is no (hidden). An event with no self row (no
 * attendees, or Taylor's own) is yes [judgment, from the research]. A
 * cancelled event is dropped: it was deleted.
 *
 * [ASSUMPTION] Working-location and birthday events are left out: they are
 * not meetings, and would draw as bands over the whole day.
 */
import {
  addDays,
  clockFromMinutes,
  instantToWallClockMinutes,
  mondayOf,
  toDateKey,
} from "@syn/utils";
import type {
  GoogleAnswer,
  GoogleDayEvent,
  GoogleEventItem,
  GoogleSnapshotEvent,
} from "@syn/validators";

const LEFT_OUT_TYPES = new Set(["workingLocation", "birthday"]);

const ANSWER: Record<
  NonNullable<GoogleEventItem["attendees"]>[number]["responseStatus"],
  GoogleAnswer
> = {
  accepted: "yes",
  tentative: "maybe",
  needsAction: "none",
  declined: "no",
};

export function answerOf(event: GoogleEventItem): GoogleAnswer {
  const self = event.attendees?.find((attendee) => attendee.self);
  return self ? ANSWER[self.responseStatus] : "yes";
}

/** One fetched event as the snapshot keeps it, or null when it is not shown at all. */
export function snapshotEventOf(
  calendarId: string,
  event: GoogleEventItem,
): GoogleSnapshotEvent | null {
  if (event.status === "cancelled") return null;
  if (event.eventType && LEFT_OUT_TYPES.has(event.eventType)) return null;
  const { start, end } = event;
  if (!start || !end) return null;
  const allDay = start.date !== undefined;
  return {
    calendarId,
    eventId: event.id,
    title: event.summary ?? "(No title)",
    answer: answerOf(event),
    allDay,
    start: allDay ? start.date! : new Date(start.dateTime!).toISOString(),
    end: allDay
      ? (end.date ?? addDays(start.date!, 1))
      : new Date(end.dateTime ?? start.dateTime!).toISOString(),
  };
}

/** The last minute of a day, for an event that runs past it. */
const DAY_END = "23:59";

/**
 * Where a stored event lands on one date in the account's zone, or null.
 * All day: `start <= date < end` (end exclusive), 00:00 to 23:59. Timed: on
 * every date it overlaps, clipped to the date; an end at midnight is the
 * date before's.
 */
export function landOn(
  event: GoogleSnapshotEvent,
  date: string,
  timeZone: string,
): { startsAt: string; endsAt: string } | null {
  if (event.allDay) {
    return event.start <= date && date < event.end
      ? { startsAt: "00:00", endsAt: DAY_END }
      : null;
  }
  const start = new Date(event.start);
  const end = new Date(event.end);
  const startDate = toDateKey(start, timeZone);
  // The last instant inside the event decides its last date (end exclusive).
  const lastDate =
    end.getTime() > start.getTime()
      ? toDateKey(new Date(end.getTime() - 1), timeZone)
      : startDate;
  if (date < startDate || date > lastDate) return null;
  return {
    startsAt:
      date === startDate
        ? clockFromMinutes(instantToWallClockMinutes(start, timeZone))
        : "00:00",
    endsAt:
      date === lastDate && toDateKey(end, timeZone) === date
        ? clockFromMinutes(instantToWallClockMinutes(end, timeZone))
        : DAY_END,
  };
}

/** A calendar as the day read joins it: Synapse's row for Google's id under one account. */
export interface EnabledCalendar {
  id: string;
  accountId: string;
  calendarId: string;
}

/**
 * A date's events from its week's snapshots, on the calendars that are on,
 * by start. Only the date's own week is read, so an event across Sunday
 * midnight (in both weeks' snapshots) shows once. An event on two of
 * Taylor's calendars shows once per calendar.
 */
export function googleEventsOn(
  snapshots: readonly {
    accountId: string;
    weekStart: string;
    events: GoogleSnapshotEvent[];
  }[],
  calendars: readonly EnabledCalendar[],
  date: string,
  timeZone: string,
): GoogleDayEvent[] {
  const rowOf = new Map(
    calendars.map((c) => [`${c.accountId}\u0000${c.calendarId}`, c.id]),
  );
  const week = mondayOf(date);
  const out: GoogleDayEvent[] = [];
  for (const snapshot of snapshots) {
    if (snapshot.weekStart !== week) continue;
    for (const event of snapshot.events) {
      const calendarRow = rowOf.get(
        `${snapshot.accountId}\u0000${event.calendarId}`,
      );
      if (!calendarRow) continue;
      const landed = landOn(event, date, timeZone);
      if (!landed) continue;
      out.push({
        id: `${calendarRow}:${event.eventId}`,
        calendarId: calendarRow,
        title: event.title,
        date,
        ...landed,
        answer: event.answer,
        allDay: event.allDay,
      });
    }
  }
  return out.sort(
    (a, b) =>
      a.startsAt.localeCompare(b.startsAt) || a.title.localeCompare(b.title),
  );
}
