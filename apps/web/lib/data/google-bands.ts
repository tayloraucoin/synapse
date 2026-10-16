import type { DayEventInput, DayEventRecord } from "@syn/validators";

/**
 * Google events on a dated day (USE-109; google-events.md, D-USE-87). Each
 * event's answer decides how the day shows it: answered yes is a read-only
 * plum band, busy time the work re-flows past; maybe or not answered is a
 * dashed band with Add to day, taking no time; declined is hidden. The
 * usual week shows none. Nothing here writes to Google.
 *
 * [ASSUMPTION] The event's shape is this file's until USE-103 reads real
 * calendars and puts its view in `@syn/validators`.
 */

/** The person's answer: Google's accepted, tentative, needsAction, declined. */
export type GoogleAnswer = "yes" | "maybe" | "none" | "no";

export interface GoogleDayEvent {
  id: string;
  calendarId: string;
  title: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM" */
  startsAt: string;
  endsAt: string;
  answer: GoogleAnswer;
}

export type GoogleBandShape = "band" | "dashed" | "hidden";

/** How one event shows on a day: `date` null is the usual week. */
export function bandShapeOf(
  event: Pick<GoogleDayEvent, "answer" | "date">,
  date: string | null,
): GoogleBandShape {
  if (date === null || event.date !== date) return "hidden";
  switch (event.answer) {
    case "yes":
      return "band";
    case "maybe":
    case "none":
      return "dashed";
    case "no":
      return "hidden";
  }
}

/**
 * The day event Add to day wrote for a maybe: the same name and start on
 * that date. [ASSUMPTION] Matched by name and time, as nothing links them.
 */
function addedAs(
  event: GoogleDayEvent,
  dayEvents: readonly Pick<
    DayEventRecord,
    "id" | "title" | "startsAt" | "onDate"
  >[],
): string | null {
  return (
    dayEvents.find(
      (row) =>
        row.onDate === event.date &&
        row.title === event.title &&
        row.startsAt === event.startsAt,
    )?.id ?? null
  );
}

export interface GoogleBands {
  /** Answered yes, or a maybe added to the day: read-only plum bands. */
  bands: GoogleDayEvent[];
  /** Maybe or not answered, not yet added: dashed, with Add to day. */
  dashed: GoogleDayEvent[];
  /** Day events that are an added maybe: drawn as its band, not as their own. */
  covered: string[];
}

/** The date's Google events, each in its shape, by start. */
export function googleBandsOf(
  day: {
    date: string | null;
    events: readonly Pick<
      DayEventRecord,
      "id" | "title" | "startsAt" | "onDate"
    >[];
  },
  events: readonly GoogleDayEvent[],
): GoogleBands {
  const out: GoogleBands = { bands: [], dashed: [], covered: [] };
  const byStart = [...events].sort(
    (a, b) => a.startsAt.localeCompare(b.startsAt) || a.id.localeCompare(b.id),
  );
  for (const event of byStart) {
    const shape = bandShapeOf(event, day.date);
    if (shape === "band") out.bands.push(event);
    if (shape !== "dashed") continue;
    const added = addedAs(event, day.events);
    if (added === null) {
      out.dashed.push(event);
    } else {
      // D-USE-87: once added, it reads as a yes, still read-only.
      out.bands.push(event);
      out.covered.push(added);
    }
  }
  return out;
}

/** Add to day's write: a day event for that date only, as the event's times. */
export function addToDayInput(
  event: GoogleDayEvent,
): Pick<DayEventInput, "onDate" | "title" | "startsAt" | "endsAt" | "tag"> {
  return {
    onDate: event.date,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    // [ASSUMPTION] The schema's default; the band shows "Google", not a tag.
    tag: "personal",
  };
}
