import { addDays, weekKeyOf, weekdayIndex } from "@syn/utils";

/**
 * Which week FR-04 plans, and FR-05 counts — Epic 1 §13.2 (Vesper's call).
 *
 * ON A SATURDAY OR SUNDAY IT IS NEXT WEEK. Offering to plan "this week" on a
 * Sunday evening is offering to plan a week that is over: the person would
 * apply a template to days that have already happened, then open a list with
 * nothing in it. The weekend is when people plan the week ahead, so that is
 * the week the step shows.
 *
 * The day key is the person's own — `resolveDayKey` has already applied their
 * close time — so someone awake at 01:00 on Saturday under a 03:00 close is
 * still on Friday here, and still gets this week. That is correct: their
 * weekend has not started.
 */
export function targetWeekFor(todayKey: string): string {
  // `weekdayIndex` is Monday = 0, so Saturday is 5 and Sunday is 6.
  const weekday = weekdayIndex(todayKey);
  const isWeekend = weekday === 5 || weekday === 6;
  return weekKeyOf(isWeekend ? addDays(todayKey, 7) : todayKey);
}
