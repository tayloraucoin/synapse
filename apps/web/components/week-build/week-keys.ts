import { addDays, weekDates, weekKeyOf } from "@syn/utils";

/**
 * The week `delta` weeks away — WK-01's *Previous* and *Next*.
 *
 * It moves by seven days from the week's own Monday and asks `weekKeyOf` what
 * that lands in, rather than doing arithmetic on the `YYYY-Www` string. Week
 * numbers are not a number line: 2026 has 53 weeks, and `2026-W53 + 1` is
 * `2027-W01`, which incrementing the digits would never produce.
 */
export function shiftWeek(weekKey: string, delta: number): string {
  const monday = weekDates(weekKey)[0];
  if (monday === undefined) return weekKey;
  return weekKeyOf(addDays(monday, delta * 7));
}
