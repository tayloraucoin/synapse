/**
 * Time display helpers — pure, with one contract per function.
 *
 * ZONE RULE: Synapse shows a day in the zone that day was stored in, not the
 * viewer's (cross-cutting §7.3 — a person who flies still sees Tuesday as
 * Tuesday was lived). So every function here takes an explicit IANA
 * `timeZone`; none of them read the host's. That also makes them safe on the
 * server: a server render and a client render agree because neither is
 * guessing.
 *
 * LOCALE: calendar and clock output default to `en-US` for the same reason —
 * Node's default locale often differs from the browser's ("p.m." vs "PM"), and
 * a mismatch is a hydration error. Callers may pass a locale; nothing reads an
 * ambient one.
 *
 * `Intl.DateTimeFormat` with a `timeZone` is available in Node 22 and every
 * target browser, so no date library is needed to format. Arithmetic across a
 * DST boundary (cross-cutting §7.2) is a separate problem and is not solved
 * here.
 */

/** Fixed locale — server and client must agree. */
const DEFAULT_LOCALE = "en-US";

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const MINUTES_PER_HOUR = 60;

/** Wall clock in the day's zone, minute precision — "7:32 AM". */
export function formatClock(
  date: Date,
  timeZone: string,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

/**
 * A window, as the row's time text reads it — "1:00–4:00" (official spec §5.2,
 * Epic 2 LS-01).
 *
 * The meridiem is dropped when both ends share it. That is the UX documents'
 * call, not a shortcut: a window is read inside a column of times on a day the
 * person is living, where AM/PM carries no information the surrounding rows do
 * not already give. When the ends straddle noon they differ, and both are kept
 * ("11:00 AM–1:00 PM"), because there the distinction is the point.
 */
export function formatWindow(
  start: Date,
  end: Date,
  timeZone: string,
  locale: string = DEFAULT_LOCALE,
): string {
  const startText = formatClock(start, timeZone, locale);
  const endText = formatClock(end, timeZone, locale);

  const splitMeridiem = (text: string): [string, string] => {
    const index = text.lastIndexOf(" ");
    return index === -1
      ? [text, ""]
      : [text.slice(0, index), text.slice(index + 1)];
  };

  const [startTime, startMeridiem] = splitMeridiem(startText);
  const [endTime, endMeridiem] = splitMeridiem(endText);

  if (startMeridiem !== "" && startMeridiem === endMeridiem) {
    return `${startTime}–${endTime}`;
  }
  return `${startText}–${endText}`;
}

/**
 * A running or recorded elapsed time — "0:59" under a minute, "12:41" under an
 * hour, "1:01:01" past one (v2 handoff §12 call 8). Minutes are unpadded below
 * the hour and padded above it, so the string never grows a leading zero it
 * does not need.
 *
 * Seconds are legitimate here where they are banned on timestamps: this is a
 * timer the person is watching move, not a record of an instant.
 */
export function formatElapsed(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / SECONDS_PER_HOUR);
  const minutes = Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const secs = total % SECONDS_PER_MINUTE;
  const ss = String(secs).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

export type CalendarDayStyle = "short" | "long";

/**
 * Calendar date in the day's zone. "short" → "4 Sept"-style "Sep 4";
 * "long" → "Friday, September 4".
 */
export function formatCalendarDay(
  date: Date,
  timeZone: string,
  style: CalendarDayStyle = "short",
  locale: string = DEFAULT_LOCALE,
): string {
  if (style === "short") {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      timeZone,
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone,
  }).format(date);
}

/**
 * The day a moment belongs to, as the `YYYY-MM-DD` key the routes and the
 * schema use (`/day/{YYYY-MM-DD}`). Computed in the given zone, so an instant
 * at 23:50 and one at 00:10 are two different keys to the person who lived
 * them.
 *
 * This is the calendar day, not Synapse's day: a day opens at `day_close_time`
 * (§6.1), and mapping an instant onto that window is a caller's job.
 */
export function toDateKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
}

/**
 * Minutes from the day's start to a moment — what the Schedule axis and the day
 * parts (§6.4) are laid out on. `dayStart` is `HH:mm` in the same zone
 * (`woke_at`, or the day's `anchor_time` until it is set). A moment before the
 * day start returns a negative number; the caller decides whether that belongs
 * to yesterday.
 */
export function minutesFromDayStart(
  date: Date,
  dayStart: string,
  timeZone: string,
): number {
  const [startHour = "0", startMinute = "0"] = dayStart.split(":");
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0",
  );

  return (
    hour * MINUTES_PER_HOUR +
    minute -
    (Number(startHour) * MINUTES_PER_HOUR + Number(startMinute))
  );
}
