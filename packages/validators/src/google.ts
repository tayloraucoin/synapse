import { z } from "zod";
import { dateKeySchema } from "./keys";

/**
 * Google Calendar as Synapse reads it (USE-32): read-only, several accounts,
 * each calendar on or off. The refresh token's ciphertext has no field on
 * any view here; a test walks every export's keys.
 */

export const googleAccountView = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  label: z.string(),
});

export type GoogleAccountView = z.infer<typeof googleAccountView>;

export const googleCalendarView = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  name: z.string(),
  color: z.string(),
  primary: z.boolean(),
  enabled: z.boolean(),
});

export type GoogleCalendarView = z.infer<typeof googleCalendarView>;

/** Settings' switch beside a calendar. */
export const googleCalendarToggleInput = z.object({
  calendarId: z.string().uuid(),
  enabled: z.boolean(),
});

export type GoogleCalendarToggleInput = z.infer<
  typeof googleCalendarToggleInput
>;

/**
 * Google's own payloads, trimmed to what the sync keeps (USE-103), and the
 * events as the day reads them. The page wrappers (`items` and Google's
 * page cursor) are `@syn/api`'s, so no export here has a token-named key. Every Google response is parsed here before
 * anything is stored; a required field missing fails the sync, which then
 * sets the account's `last_sync_error` and keeps its last snapshot.
 */

/** One `calendarList.list` entry. */
export const googleCalendarListEntry = z.object({
  id: z.string().min(1),
  summary: z.string(),
  summaryOverride: z.string().optional(),
  backgroundColor: z.string().optional(),
  primary: z.boolean().optional(),
  accessRole: z.string().min(1),
  hidden: z.boolean().optional(),
  deleted: z.boolean().optional(),
  selected: z.boolean().optional(),
});

export type GoogleCalendarListEntry = z.infer<typeof googleCalendarListEntry>;

/** An event's start or end: `date` for all day, `dateTime` (RFC 3339) for timed. */
const googleEventTime = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    dateTime: z.string().datetime({ offset: true }).optional(),
    timeZone: z.string().optional(),
  })
  .refine(
    (time) => (time.date === undefined) !== (time.dateTime === undefined),
    {
      message: "An event time has exactly one of date and dateTime.",
    },
  );

/** Google's answer to an invitation, on the attendee row with `self`. */
export const googleResponseStatus = z.enum([
  "accepted",
  "tentative",
  "needsAction",
  "declined",
]);

/** One `events.list` item, as asked for with `maxAttendees=1`. */
export const googleEventItem = z
  .object({
    id: z.string().min(1),
    status: z.enum(["confirmed", "tentative", "cancelled"]),
    summary: z.string().optional(),
    eventType: z.string().optional(),
    start: googleEventTime.optional(),
    end: googleEventTime.optional(),
    attendees: z
      .array(
        z.object({
          self: z.boolean().optional(),
          responseStatus: googleResponseStatus,
        }),
      )
      .optional(),
    organizer: z.object({ self: z.boolean().optional() }).optional(),
  })
  // A cancelled event may come with its id alone; any other needs its times.
  .refine(
    (event) =>
      event.status === "cancelled" ||
      (event.start !== undefined && event.end !== undefined),
    { message: "An event needs start and end." },
  );

export type GoogleEventItem = z.infer<typeof googleEventItem>;

/** The person's answer, as the day reads it (USE-109): yes, maybe, not answered, no. */
export const googleAnswer = z.enum(["yes", "maybe", "none", "no"]);

export type GoogleAnswer = z.infer<typeof googleAnswer>;

/**
 * One stored event in `google_event_snapshots.payload`: Google's times kept
 * as Google gave them (a date for all day, an instant for timed), so the day
 * lands in the account's zone when read, not when synced.
 */
export const googleSnapshotEvent = z.object({
  /** Google's calendar id. */
  calendarId: z.string().min(1),
  eventId: z.string().min(1),
  title: z.string(),
  answer: googleAnswer,
  allDay: z.boolean(),
  /** All day: `YYYY-MM-DD`; timed: an ISO instant. */
  start: z.string(),
  /** Exclusive, in the same form as `start`. */
  end: z.string(),
});

export type GoogleSnapshotEvent = z.infer<typeof googleSnapshotEvent>;

export const googleSnapshotPayload = z.object({
  events: z.array(googleSnapshotEvent),
});

export type GoogleSnapshotPayload = z.infer<typeof googleSnapshotPayload>;

/** A Google event on one date, as the day column draws it (USE-109's shape). */
export const googleDayEvent = z.object({
  id: z.string().min(1),
  /** Synapse's `google_calendars.id`. */
  calendarId: z.string().min(1),
  title: z.string(),
  date: dateKeySchema,
  /** `HH:MM`; an all-day event reads 00:00 to 23:59. */
  startsAt: z.string().regex(/^\d{2}:\d{2}$/),
  endsAt: z.string().regex(/^\d{2}:\d{2}$/),
  answer: googleAnswer,
  allDay: z.boolean(),
});

export type GoogleDayEvent = z.infer<typeof googleDayEvent>;

export const googleEventsInput = z.object({ date: dateKeySchema });

export const googleDisconnectInput = z.object({
  accountId: z.string().uuid(),
});

export type GoogleDisconnectInput = z.infer<typeof googleDisconnectInput>;
