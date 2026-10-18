import {
  addDays,
  dateKeyIn,
  instantToWallClockMinutes,
  wallClockToInstant,
} from "../day/wall-clock";
import { weekDates, weekdayIndex, weekKeyOf } from "../day/week";
import { parseRule } from "./rrule";

/**
 * The usual week and this week (USE-33): which blocks make a usual weekday,
 * which week Set my days opens on, and how far a usual-week change reaches.
 *
 * Weekdays are `RepeatRule.weekdays`' numbering, Monday = 0 … Sunday = 6, the
 * same as 0013's `day_bounds.weekday`. The caller passes `now`.
 */

const SUNDAY = 6;
/** "Sunday evening" is read as 18:00 [ASSUMPTION, from N2]. */
const SUNDAY_EVENING_MIN = 18 * 60;

/**
 * The blocks of a usual weekday: those whose rule repeats weekly or daily and
 * hits it. D-USE-87: a monthly or yearly block appears on its dates only, in
 * This week, never in the usual week; a one-date block is never usual.
 */
export function usualDay<B extends { rrule: string | null }>(
  blocks: readonly B[],
  weekday: number,
): B[] {
  return blocks.filter((block) => {
    if (block.rrule === null) return false;
    const parsed = parseRule(block.rrule);
    if (!parsed.ok) return false;
    if (parsed.rule.freq === "DAILY") return true;
    return (
      parsed.rule.freq === "WEEKLY" && parsed.rule.weekdays.includes(weekday)
    );
  });
}

/** Set my days opens on the usual week, and on this week from Sunday 18:00. */
export function defaultWeek(now: Date, timeZone: string): "usual" | "this" {
  const isSunday = weekdayIndex(dateKeyIn(now, timeZone)) === SUNDAY;
  return isSunday &&
    instantToWallClockMinutes(now, timeZone) >= SUNDAY_EVENING_MIN
    ? "this"
    : "usual";
}

/**
 * This week's key: the week of today, and from Sunday 18:00 the coming one,
 * as Set my days opens on it (`defaultWeek`). [ASSUMPTION] The same turn
 * names the week a usual change reaches. Moved from the web app's
 * `lib/data/week-records.ts` (USE-92), so the planner router reaches the
 * same dates.
 */
export function thisWeekKey(now: Date, timeZone: string): string {
  const today = dateKeyIn(now, timeZone);
  const turned =
    weekdayIndex(today) === SUNDAY && defaultWeek(now, timeZone) === "this";
  return weekKeyOf(turned ? addDays(today, 1) : today);
}

/** This week's seven date keys, Monday first. */
export function thisWeekDates(now: Date, timeZone: string): string[] {
  return weekDates(thisWeekKey(now, timeZone));
}

/**
 * Which date of this week a usual-week change to one block reaches: the
 * weekday's date when it has not begun (now is before that date's Up at) and
 * the block has no change on it. Never a date already begun (N2, note 18).
 */
export function usualChangeReach({
  weekday,
  weekDates,
  now,
  timeZone,
  upAtOn,
  changedOn,
}: {
  weekday: number;
  /** This week's seven date keys, Monday first. */
  weekDates: readonly string[];
  now: Date;
  timeZone: string;
  upAtOn: (dateKey: string) => string;
  /** The dates on which this block already has a change. */
  changedOn: ReadonlySet<string>;
}): { follows: string | null } {
  const dateKey = weekDates[weekday];
  if (dateKey === undefined || changedOn.has(dateKey)) return { follows: null };
  const begins = wallClockToInstant(dateKey, upAtOn(dateKey), timeZone);
  return { follows: now.getTime() < begins.getTime() ? dateKey : null };
}

/**
 * Whether a date has its own changes (D-USE-33, "This day only"): a block
 * changed on it, a set item's slot skipped on it, or an item for it alone.
 */
export function isOwnChange({
  dateKey,
  changes,
  slots,
  items,
}: {
  dateKey: string;
  changes: readonly { onDate: string }[];
  slots: readonly { onDate: string; skipped: boolean }[];
  items: readonly { onDate: string | null }[];
}): boolean {
  return (
    changes.some((change) => change.onDate === dateKey) ||
    slots.some((slot) => slot.onDate === dateKey && slot.skipped) ||
    items.some((item) => item.onDate === dateKey)
  );
}
