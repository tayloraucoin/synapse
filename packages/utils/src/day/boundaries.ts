import type { DayMode } from "@syn/types";

import { addDays, dateKeyIn, wallClockToInstant } from "./wall-clock";

/**
 * Which Synapse day it is, and when that day opens and closes.
 *
 * A DAY IS NOT A CALENDAR DATE. It opens at `day_close_time` and runs to the
 * next one (official spec §6.1), so anything done between midnight and 03:00
 * belongs to the day that started the previous morning — which is the whole
 * point of the setting, and the reason a naive `toDateKey` is wrong here.
 */

/**
 * The day key an instant belongs to.
 *
 * Shifting the instant back by the close time and taking the calendar date is
 * exact in every zone: the shift is a duration, and the date read happens in
 * the zone, so a DST transition inside the shifted window cannot move the
 * answer to the wrong date.
 */
export function resolveDayKey(
  now: Date,
  timeZone: string,
  dayCloseTime: string,
): string {
  const [hour = "0", minute = "0"] = dayCloseTime.split(":");
  const closeMs = (Number(hour) * 60 + Number(minute)) * 60000;
  return dateKeyIn(new Date(now.getTime() - closeMs), timeZone);
}

/**
 * `[opens, closes)` for a day key — the instants, in the day's own zone.
 *
 * On a fall-back night this span is 25 hours and on a spring-forward night 23,
 * which is correct: the day is as long as the person lived it.
 */
export function dayWindow(
  dateKey: string,
  timeZone: string,
  dayCloseTime: string,
): { start: Date; end: Date } {
  return {
    start: wallClockToInstant(dateKey, dayCloseTime, timeZone),
    end: wallClockToInstant(addDays(dateKey, 1), dayCloseTime, timeZone),
  };
}

/**
 * How a day is rendered — live, a record, or a plan (cross-cutting §8.2).
 *
 * The comparison is on the key, not the instant: a day is "today" because it
 * is the person's current day, not because a clock is inside a range.
 */
export function dayModeFor(dateKey: string, todayKey: string): DayMode {
  if (dateKey === todayKey) return "live";
  return dateKey < todayKey ? "record" : "plan";
}

export function isSameOrBefore(dateKey: string, otherKey: string): boolean {
  return dateKey <= otherKey;
}

export { addDays };
