import { addDays } from "../day/wall-clock";
import { weekdayIndex } from "../day/week";
import { occurrences, occursOn, parseRule, type RepeatRule } from "./rrule";

/**
 * Repeats › Custom… (USE-47; new-block-sheet/states/custom-recurrence.md):
 * the step's choices to one stored rule, a rule back to the step's choices,
 * a rule in words, and a rule split at a date for This and following.
 *
 * ONE RULE PER BLOCK (D-USE-80): Wednesday and Sunday are one WEEKLY rule
 * with BYDAY=WE,SU, never a rule per weekday. Every rule written here is
 * one `parseRule` reads back to the same dates.
 *
 * The words name the rule, never a count of the dates it makes; "13 times"
 * is the rule's own end, as the step's After reads it.
 */

export type RuleUnit = "day" | "week" | "month" | "year";

export type RuleEnds =
  | { kind: "never" }
  | { kind: "on"; date: string }
  | { kind: "after"; count: number };

/** The custom step's choices. Weekdays are Monday 0 … Sunday 6, as `RepeatRule`. */
export interface RuleForm {
  every: number;
  unit: RuleUnit;
  /** With week: the days it repeats on; empty takes the start's own day. */
  weekdays: number[];
  /** With month: on the start's day ("on day 18") or its nth weekday ("on the third Sunday"). */
  monthBy: "day" | "nth" | null;
  ends: RuleEnds;
}

const DAY_CODES = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const;

const WEEKDAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const NTH_WORDS = ["first", "second", "third", "fourth", "fifth"] as const;

function compactDate(dateKey: string): string {
  return dateKey.replaceAll("-", "");
}

/** Which of its weekday a date is in its month: 1 to 4, or -1 for a fifth. */
export function nthWeekdayOf(dateKey: string): number {
  const nth = Math.ceil(Number(dateKey.slice(8, 10)) / 7);
  return nth === 5 ? -1 : nth;
}

/** "third", or "last" for -1. */
export function nthWord(nth: number): string {
  return nth === -1 ? "last" : (NTH_WORDS[nth - 1] ?? `${nth}th`);
}

/** "Wednesday and Sunday"; "Monday, Wednesday and Friday". */
export function weekdayList(weekdays: readonly number[]): string {
  const names = [...weekdays]
    .sort((a, b) => a - b)
    .map((day) => WEEKDAY_NAMES[day] as string);
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/** "18 January 2027". */
export function longDate(dateKey: string): string {
  const month = MONTH_NAMES[Number(dateKey.slice(5, 7)) - 1];
  return `${Number(dateKey.slice(8, 10))} ${month} ${dateKey.slice(0, 4)}`;
}

/*
 * ---- Writing a rule ----
 */

/**
 * A parsed rule as its two stored lines. BY parts the parser would take
 * from the start are written only where a preset writes them, so a custom
 * rule that is a preset reads as that preset's text: WEEKLY always names
 * its days, MONTHLY its day or nth weekday, YEARLY only when it is not the
 * start's own date.
 */
export function formatRule(rule: RepeatRule): string {
  const parts = [`FREQ=${rule.freq}`];
  if (rule.interval > 1) parts.push(`INTERVAL=${rule.interval}`);
  switch (rule.freq) {
    case "WEEKLY":
      parts.push(`BYDAY=${rule.weekdays.map((d) => DAY_CODES[d]).join(",")}`);
      if (rule.weekStart === 6) parts.push("WKST=SU");
      break;
    case "MONTHLY":
      parts.push(
        rule.nthWeekday
          ? `BYDAY=${rule.nthWeekday.nth}${DAY_CODES[rule.nthWeekday.weekday]}`
          : `BYMONTHDAY=${rule.monthDay}`,
      );
      break;
    case "YEARLY": {
      const sameDate =
        rule.month === Number(rule.start.slice(5, 7)) &&
        rule.monthDay === Number(rule.start.slice(8, 10));
      if (!sameDate) {
        parts.push(`BYMONTH=${rule.month}`, `BYMONTHDAY=${rule.monthDay}`);
      }
      break;
    }
    case "DAILY":
      break;
  }
  if (rule.until !== null) parts.push(`UNTIL=${compactDate(rule.until)}`);
  if (rule.count !== null) parts.push(`COUNT=${rule.count}`);
  return `DTSTART;VALUE=DATE:${compactDate(rule.start)}\nRRULE:${parts.join(";")}`;
}

const FREQ_OF = {
  day: "DAILY",
  week: "WEEKLY",
  month: "MONTHLY",
  year: "YEARLY",
} as const;

/** The step's choices as a rule anchored on `startKey`. */
export function ruleFromForm(form: RuleForm, startKey: string): RepeatRule {
  const startDay = Number(startKey.slice(8, 10));
  const weekdays =
    form.unit !== "week"
      ? []
      : form.weekdays.length === 0
        ? [weekdayIndex(startKey)]
        : [...new Set(form.weekdays)].sort((a, b) => a - b);
  const byNth = form.unit === "month" && form.monthBy === "nth";
  return {
    start: startKey,
    freq: FREQ_OF[form.unit],
    interval: Math.max(1, Math.floor(form.every)),
    weekdays,
    nthWeekday: byNth
      ? { nth: nthWeekdayOf(startKey), weekday: weekdayIndex(startKey) }
      : null,
    monthDay:
      form.unit === "year" || (form.unit === "month" && !byNth)
        ? startDay
        : null,
    month: form.unit === "year" ? Number(startKey.slice(5, 7)) : null,
    until: form.ends.kind === "on" ? form.ends.date : null,
    count:
      form.ends.kind === "after"
        ? Math.max(1, Math.floor(form.ends.count))
        : null,
    weekStart: 0,
  };
}

/** The step's choices → the one stored rule (D-USE-80). */
export function buildRule(form: RuleForm, startKey: string): string {
  return formatRule(ruleFromForm(form, startKey));
}

const UNIT_OF = {
  DAILY: "day",
  WEEKLY: "week",
  MONTHLY: "month",
  YEARLY: "year",
} as const;

/** A rule back to the step's choices, so Custom… opens on what is set. */
export function ruleForm(rule: RepeatRule): RuleForm {
  return {
    every: rule.interval,
    unit: UNIT_OF[rule.freq],
    weekdays: rule.freq === "WEEKLY" ? [...rule.weekdays] : [],
    monthBy: rule.freq === "MONTHLY" ? (rule.nthWeekday ? "nth" : "day") : null,
    ends:
      rule.until !== null
        ? { kind: "on", date: rule.until }
        : rule.count !== null
          ? { kind: "after", count: rule.count }
          : { kind: "never" },
  };
}

/** The step as it opens with no rule yet: every week on the start's day. */
export function defaultRuleForm(startKey: string): RuleForm {
  return {
    every: 1,
    unit: "week",
    weekdays: [weekdayIndex(startKey)],
    monthBy: null,
    ends: { kind: "never" },
  };
}

/*
 * ---- Reading a rule in words ----
 */

const WORKWEEK = [0, 1, 2, 3, 4];

function sameDays(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((day, i) => day === b[i]);
}

/** How often, without the end: "Weekly on Wednesday and Sunday", "Monthly on the third Sunday". */
export function describeRepeat(rule: RepeatRule): string {
  const n = rule.interval;
  switch (rule.freq) {
    case "DAILY":
      return n === 1 ? "Daily" : `Every ${n} days`;
    case "WEEKLY": {
      if (n === 1 && sameDays(rule.weekdays, WORKWEEK)) {
        return "Every weekday, Monday to Friday";
      }
      if (n === 1 && rule.weekdays.length === 7) return "Daily";
      const lead = n === 1 ? "Weekly" : `Every ${n} weeks`;
      return `${lead} on ${weekdayList(rule.weekdays)}`;
    }
    case "MONTHLY": {
      const lead = n === 1 ? "Monthly" : `Every ${n} months`;
      if (rule.nthWeekday) {
        const { nth, weekday } = rule.nthWeekday;
        return `${lead} on the ${nthWord(nth)} ${WEEKDAY_NAMES[weekday]}`;
      }
      return `${lead} on day ${rule.monthDay}`;
    }
    case "YEARLY": {
      const lead = n === 1 ? "Annually" : `Every ${n} years`;
      return `${lead} on ${rule.monthDay} ${MONTH_NAMES[(rule.month ?? 1) - 1]}`;
    }
  }
}

/** ", until 18 January 2027", ", 13 times", or nothing. */
export function describeEnds(rule: RepeatRule): string {
  if (rule.until !== null) return `, until ${longDate(rule.until)}`;
  if (rule.count === 1) return ", once";
  if (rule.count !== null) return `, ${rule.count} times`;
  return "";
}

/** The rule in words, as the Repeats trigger reads it. */
export function describeRule(rule: RepeatRule): string {
  return `${describeRepeat(rule)}${describeEnds(rule)}`;
}

/*
 * ---- This and following ----
 */

export type SplitRule =
  | { ok: true; before: string | null; after: string }
  | { ok: false; reason: string };

/**
 * A rule cut at `fromKey`, a date it hits: `before` keeps every date before
 * it (UNTIL the day before, or COUNT recounted to the dates it already
 * made), `after` starts on it with the same pattern and what is left of the
 * end. Together they hit exactly the dates the rule did: none dropped, none
 * doubled. `before` is null when `fromKey` is the rule's first date, so
 * This and following is the whole block.
 */
export function splitRule(text: string, fromKey: string): SplitRule {
  const parsed = parseRule(text);
  if (!parsed.ok) return parsed;
  const { rule } = parsed;
  if (!occursOn(rule, fromKey)) {
    return { ok: false, reason: "The rule does not run on that date." };
  }
  const made = occurrences(rule, rule.start, addDays(fromKey, -1)).length;
  const before =
    made === 0
      ? null
      : formatRule(
          rule.count !== null
            ? { ...rule, count: made }
            : { ...rule, until: addDays(fromKey, -1) },
        );
  const after = formatRule({
    ...rule,
    start: fromKey,
    count: rule.count === null ? null : rule.count - made,
  });
  return { ok: true, before, after };
}
