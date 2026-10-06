/**
 * Two small helpers about day keys as calendar dates.
 *
 * `resolveDayKey` USED TO LIVE HERE. SYS-1 needed it before USE-1 existed and
 * left a note saying USE-1 owned it; USE-1 has now taken it, into
 * `boundaries.ts`, alongside `dayWindow` and `dayModeFor` which share its
 * rules. There is one implementation, and this file is not it.
 */

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
