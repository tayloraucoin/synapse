/**
 * Wall clock ↔ instant, with no date library.
 *
 * `Intl` IS THE TOOL, and the reason is not preference: the browser and Node
 * both ship the IANA database, and it is the same database, kept current by
 * the platform. A bundled library is a second copy of the world's time-zone
 * rules that goes stale between releases — and the rules change several times
 * a year, in countries that do not consult us.
 *
 * THE TWO NIGHTS A YEAR THIS FILE EXISTS FOR (cross-cutting §7.2):
 *
 * - SPRING FORWARD leaves a gap. 02:30 does not exist in Vancouver on the
 *   morning the clocks jump 02:00 → 03:00. Anything scheduled inside the gap
 *   moves to "the first minute after it", which is the document's rule and
 *   which this implements by stepping forward until the wall clock round-trips.
 * - FALL BACK leaves an overlap. 01:30 happens twice. The FIRST occurrence
 *   wins — the earlier instant — because a day that is 25 hours long should
 *   not also move its morning an hour later.
 */

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/**
 * How far ahead of UTC a zone is at a given instant, in minutes.
 *
 * Read the instant's wall clock in the zone, rebuild it as if it were UTC, and
 * take the difference. That difference IS the offset, by definition.
 */
export function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);

  const read = (type: string): number =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  const asUtc = Date.UTC(
    read("year"),
    read("month") - 1,
    read("day"),
    read("hour"),
    read("minute"),
    read("second"),
  );

  // Seconds are dropped from the instant so the subtraction is exact.
  const truncated = Math.floor(instant.getTime() / 1000) * 1000;
  return Math.round((asUtc - truncated) / 60000);
}

/** The wall clock in a zone, as minutes since that day's midnight. */
export function instantToWallClockMinutes(
  instant: Date,
  timeZone: string,
): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);

  const read = (type: string): number =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return read("hour") * MINUTES_PER_HOUR + read("minute");
}

/** The calendar date in a zone, as `YYYY-MM-DD`. */
function dateKeyIn(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  const read = (type: string): string =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${read("year")}-${read("month")}-${read("day")}`;
}

function parseDateKey(dateKey: string): {
  year: number;
  month: number;
  day: number;
} {
  const [year = "0", month = "1", day = "1"] = dateKey.split("-");
  return { year: Number(year), month: Number(month), day: Number(day) };
}

/** `YYYY-MM-DD` plus n days, by UTC calendar arithmetic (exact). */
export function addDays(dateKey: string, days: number): string {
  const { year, month, day } = parseDateKey(dateKey);
  const at = new Date(Date.UTC(year, month - 1, day));
  at.setUTCDate(at.getUTCDate() + days);
  return `${at.getUTCFullYear()}-${String(at.getUTCMonth() + 1).padStart(2, "0")}-${String(at.getUTCDate()).padStart(2, "0")}`;
}

/**
 * A wall-clock time on a date in a zone → the instant it names.
 *
 * `clock` is `HH:mm` and MAY EXCEED 24:00 — "25:30" means 01:30 the next day,
 * which is how a template offset that crosses midnight arrives here. Those
 * minutes roll into the date before any zone work happens.
 *
 * The algorithm: guess the instant as if the zone were UTC, read the zone's
 * real offset there, correct, and read once more (two iterations converge
 * everywhere a single offset applies). Then verify by round-tripping the wall
 * clock:
 *
 * - it matches → done;
 * - it does not, and we are in a gap → step forward a minute at a time until
 *   the clock exists, which lands on the first minute after the gap;
 * - two instants would match → the earlier is returned, because the search
 *   starts from the earlier guess and never moves backwards.
 */
export function wallClockToInstant(
  dateKey: string,
  clock: string,
  timeZone: string,
): Date {
  const [hourRaw = "0", minuteRaw = "0"] = clock.split(":");
  const totalMinutes = Number(hourRaw) * MINUTES_PER_HOUR + Number(minuteRaw);

  // Minutes past 24:00 (or below zero) roll the date before conversion.
  const dayShift = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const minutesInDay =
    ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const targetDate = dayShift === 0 ? dateKey : addDays(dateKey, dayShift);

  const { year, month, day } = parseDateKey(targetDate);
  const naiveUtc = Date.UTC(
    year,
    month - 1,
    day,
    Math.floor(minutesInDay / MINUTES_PER_HOUR),
    minutesInDay % MINUTES_PER_HOUR,
  );

  let guess = new Date(naiveUtc - zoneOffsetMinutes(new Date(naiveUtc), timeZone) * 60000);
  guess = new Date(naiveUtc - zoneOffsetMinutes(guess, timeZone) * 60000);

  const matches = (instant: Date): boolean =>
    dateKeyIn(instant, timeZone) === targetDate &&
    instantToWallClockMinutes(instant, timeZone) === minutesInDay;

  if (matches(guess)) return guess;

  /*
   * A gap. Step forward from the guess until a real wall clock appears; the
   * first one found is "the first minute after the missing hour". Two hours of
   * minutes is more than any real transition (the largest is 60 minutes) and
   * bounds the loop.
   */
  for (let step = 1; step <= 180; step += 1) {
    const candidate = new Date(guess.getTime() + step * 60000);
    const clockThere = instantToWallClockMinutes(candidate, timeZone);
    if (
      dateKeyIn(candidate, timeZone) === targetDate &&
      clockThere >= minutesInDay
    ) {
      return candidate;
    }
  }

  // Nothing matched — return the best guess rather than throwing; a time that
  // is an hour out is a bug, and a crash on a day boundary is an outage.
  return guess;
}

/** `HH:mm` → minutes; `"25:30"` is allowed and returns 1530. */
export function clockMinutes(clock: string): number {
  const [hour = "0", minute = "0"] = clock.split(":");
  return Number(hour) * MINUTES_PER_HOUR + Number(minute);
}

export { dateKeyIn };
