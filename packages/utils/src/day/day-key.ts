/**
 * The day key — which Synapse day an instant belongs to.
 *
 * NOT THE CALENDAR DATE. `toDateKey` in `../time.ts` answers "what date is it
 * in this zone"; this answers "which of the person's days is this", and the
 * two differ for `day_close_time` hours every night. With a 03:00 close,
 * 01:30 on the 5th is still the 4th — which is the whole point of the setting
 * (cross-cutting §7.1: a Day "runs from `day_close_time` to `day_close_time`").
 *
 * WALL CLOCK, NOT ARITHMETIC ON THE INSTANT. Subtracting three hours of
 * milliseconds and re-reading the date is wrong on the two nights a year the
 * offset changes; comparing the local wall-clock time against the close time
 * is correct on every night, because both sides are wall clock.
 *
 * SYS-1 CREATED THIS FILE AND USE-1 OWNS IT. The day model needs boundaries,
 * state derivation, day parts and DST handling; the shell needed one of those
 * early, to know which day it is rendering. Extend this, do not fork it.
 */

const MINUTES_PER_HOUR = 60;

/** `HH:mm` → minutes since local midnight. */
function clockToMinutes(clock: string): number {
  const [hour = "0", minute = "0"] = clock.split(":");
  return Number(hour) * MINUTES_PER_HOUR + Number(minute);
}

type WallClock = {
  year: number;
  month: number;
  day: number;
  minutes: number;
};

function readWallClock(date: Date, timeZone: string): WallClock {
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(date);

  const read = (type: string): number =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    // `en-GB` renders midnight as 24 in some engines; normalise it.
    minutes: (read("hour") % 24) * MINUTES_PER_HOUR + read("minute"),
  };
}

function formatKey(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * Which day key an instant belongs to, in the person's stored zone.
 *
 * `dayCloseTime` is `HH:mm` — a moment earlier than it belongs to yesterday.
 * The previous date is computed with UTC calendar arithmetic, which is exact:
 * it is a question about a calendar, not about a clock.
 */
export function resolveDayKey(
  now: Date,
  timeZone: string,
  dayCloseTime: string,
): string {
  const wall = readWallClock(now, timeZone);

  if (wall.minutes >= clockToMinutes(dayCloseTime)) {
    return formatKey(wall.year, wall.month, wall.day);
  }

  const previous = new Date(Date.UTC(wall.year, wall.month - 1, wall.day));
  previous.setUTCDate(previous.getUTCDate() - 1);
  return formatKey(
    previous.getUTCFullYear(),
    previous.getUTCMonth() + 1,
    previous.getUTCDate(),
  );
}

/**
 * The weekday a day key falls on — "Thursday".
 *
 * The key is read as a calendar date, not an instant, so it is interpreted at
 * UTC noon: far enough from either midnight that no zone can shift it onto a
 * neighbouring day.
 */
export function weekdayForDayKey(
  dayKey: string,
  locale = "en-US",
): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  if (!year || !month || !day) return "";

  const at = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    timeZone: "UTC",
  }).format(at);
}

/** How many days `dayKey` is before `todayKey`; negative when it is after. */
export function daysBefore(dayKey: string, todayKey: string): number {
  const parse = (key: string): number => {
    const [year, month, day] = key.split("-").map(Number);
    if (!year || !month || !day) return Number.NaN;
    return Date.UTC(year, month - 1, day);
  };

  const a = parse(dayKey);
  const b = parse(todayKey);
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.NaN;

  return Math.round((b - a) / 86_400_000);
}
