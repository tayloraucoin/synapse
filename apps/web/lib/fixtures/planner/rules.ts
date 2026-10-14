import { parseRule } from "@syn/utils";

/**
 * The usual week's rule text, as the fixture server writes it (USE-36): a
 * usual weekday is a weekly rule on that day. Wave 3's router writes the
 * same two lines (USE-6's stored form).
 */

const DAY_CODES = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const;

function compactDate(dateKey: string): string {
  return dateKey.replaceAll("-", "");
}

/** Every `<weekday>` from `start` on. */
export function weeklyRule(start: string, weekday: number): string {
  return `DTSTART;VALUE=DATE:${compactDate(start)}\nRRULE:FREQ=WEEKLY;BYDAY=${DAY_CODES[weekday]}`;
}

/**
 * The rule without one weekday: a weekly rule loses it from BYDAY, a daily
 * one becomes weekly on the other six. Null when nothing is left, and the
 * rule unchanged when it never hit the weekday or is not a plain repeat.
 * [ASSUMPTION] Past dates read the new rule too; a split at today is the
 * router's (wave 3).
 */
export function withoutWeekday(rrule: string, weekday: number): string | null {
  const parsed = parseRule(rrule);
  if (!parsed.ok) return rrule;
  const { rule } = parsed;
  let days: number[];
  if (rule.freq === "DAILY" && rule.interval === 1) {
    days = [0, 1, 2, 3, 4, 5, 6];
  } else if (rule.freq === "WEEKLY") {
    days = rule.weekdays;
  } else {
    return rrule;
  }
  if (!days.includes(weekday)) return rrule;
  const left = days.filter((day) => day !== weekday);
  if (left.length === 0) return null;

  const [dtstart, line = ""] = rrule.split("\n");
  const parts = line
    .replace(/^RRULE:/, "")
    .split(";")
    .filter((part) => !/^(FREQ|BYDAY|INTERVAL)=/.test(part));
  const byDay = left.map((day) => DAY_CODES[day]).join(",");
  const interval = rule.freq === "WEEKLY" && rule.interval > 1;
  return `${dtstart}\nRRULE:${[
    "FREQ=WEEKLY",
    ...(interval ? [`INTERVAL=${rule.interval}`] : []),
    ...parts,
    `BYDAY=${byDay}`,
  ].join(";")}`;
}
