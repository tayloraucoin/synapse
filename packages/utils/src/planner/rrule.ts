import { daysBefore } from "../day/day-key";
import { addDays } from "../day/wall-clock";
import { weekdayIndex } from "../day/week";

/**
 * A block's one repeat rule (D-USE-80), expanded to the dates it hits.
 *
 * THE STORED TEXT is two RFC 5545 lines, decided with USE-6:
 *
 *   DTSTART;VALUE=DATE:20261018
 *   RRULE:FREQ=WEEKLY;BYDAY=SU
 *
 * The start anchors INTERVAL and COUNT, so "every 2 weeks" knows which weeks.
 * There is never an EXDATE: a skipped date is a `block_changes` row.
 *
 * ONLY WHAT GOOGLE'S MENU CAN MAKE is run: its presets and Custom… (every N
 * days, weeks, months or years; weekdays; a day of the month or an nth
 * weekday; ending on a date or after N times). Anything else is refused with
 * a reason, never half-expanded — a rule that lands on the wrong days is
 * worse than one that is turned away.
 *
 * Everything here is calendar arithmetic on `YYYY-MM-DD` keys. A rule names
 * dates, not instants; `day-read.ts` turns a date and a time into an instant.
 */

export type RepeatPreset =
  "none" | "daily" | "weekly" | "monthly" | "annually" | "weekdays";

export type RepeatFreq = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

/** A parsed rule, every implied part filled in from the start. */
export interface RepeatRule {
  /** DTSTART, `YYYY-MM-DD`. */
  start: string;
  freq: RepeatFreq;
  interval: number;
  /** WEEKLY: the weekdays it hits, Monday = 0 … Sunday = 6. */
  weekdays: number[];
  /** MONTHLY on the nth weekday: 1 to 5, or -1 for the last. */
  nthWeekday: { nth: number; weekday: number } | null;
  /** MONTHLY on a day, and YEARLY: the day of the month, 1 to 31. */
  monthDay: number | null;
  /** YEARLY: the month, 1 to 12. */
  month: number | null;
  /** The last date it may hit, inclusive. */
  until: string | null;
  /** How many dates it hits, counted from the start. */
  count: number | null;
  /** The week's first day, for interval weeks: Monday (0) or Sunday (6). */
  weekStart: 0 | 6;
}

export type ParsedRule =
  { ok: true; rule: RepeatRule } | { ok: false; reason: string };

const DAY_CODES = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const;

const SUPPORTED = new Set([
  "FREQ",
  "INTERVAL",
  "BYDAY",
  "BYMONTHDAY",
  "BYMONTH",
  "UNTIL",
  "COUNT",
  "WKST",
]);

/** Real RFC 5545 parts that Google's menu never makes. */
const UNSUPPORTED = new Set([
  "BYSECOND",
  "BYMINUTE",
  "BYHOUR",
  "BYYEARDAY",
  "BYWEEKNO",
  "BYSETPOS",
]);

/*
 * ---- Making a rule ----
 */

function compactDate(dateKey: string): string {
  return dateKey.replaceAll("-", "");
}

/** Which of its weekday a date is in its month: 1 to 4, or -1 for a fifth. */
function nthOf(dateKey: string): number {
  const nth = Math.ceil(Number(dateKey.slice(8, 10)) / 7);
  return nth === 5 ? -1 : nth;
}

/**
 * The stored text for a Repeats preset, worded from its start date
 * (`repeats-menu.md`). `null` for "none": the block takes `on_date` instead.
 *
 * Daily and Annually carry no BY part, as Google stores them; the parser
 * takes the day and month from the start.
 */
export function presetRule(
  preset: RepeatPreset,
  startKey: string,
): string | null {
  const day = DAY_CODES[weekdayIndex(startKey)];
  const body = (() => {
    switch (preset) {
      case "none":
        return null;
      case "daily":
        return "FREQ=DAILY";
      case "weekly":
        return `FREQ=WEEKLY;BYDAY=${day}`;
      case "monthly":
        return `FREQ=MONTHLY;BYDAY=${nthOf(startKey)}${day}`;
      case "annually":
        return "FREQ=YEARLY";
      case "weekdays":
        return "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR";
    }
  })();
  if (body === null) return null;
  return `DTSTART;VALUE=DATE:${compactDate(startKey)}\nRRULE:${body}`;
}

/*
 * ---- Reading a rule ----
 */

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** `20261018` → `2026-10-18`, or null when the date does not exist. */
function readCompactDate(text: string): string | null {
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec(text);
  if (!match) return null;
  const [, y, m, d] = match as unknown as [string, string, string, string];
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    return null;
  }
  return `${y}-${m}-${d}`;
}

function positiveInt(text: string): number | null {
  return /^[1-9]\d*$/.test(text) ? Number(text) : null;
}

const refuse = (reason: string): ParsedRule => ({ ok: false, reason });

/**
 * The stored text → a rule the expander can run, or the reason it cannot.
 * Shape-checking lives in `@syn/validators`; this checks meaning too.
 */
export function parseRule(text: string): ParsedRule {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const startLine = lines.find((line) => line.startsWith("DTSTART"));
  const ruleLine = lines.find((line) => line.startsWith("RRULE:"));
  if (!startLine) return refuse("The rule has no DTSTART line.");
  if (!ruleLine) return refuse("The rule has no RRULE line.");
  if (lines.length !== 2) {
    return refuse(
      "The rule is a DTSTART line and an RRULE line, nothing else.",
    );
  }

  const startMatch = /^DTSTART;VALUE=DATE:(\d{8})$/.exec(startLine);
  if (!startMatch) return refuse("DTSTART is not a date like 20261018.");
  const start = readCompactDate(startMatch[1] as string);
  if (!start) return refuse("DTSTART is not a real date.");

  const parts = new Map<string, string>();
  for (const part of ruleLine.slice("RRULE:".length).split(";")) {
    const match = /^([A-Z]+)=([A-Z0-9,+-]+)$/.exec(part);
    if (!match) return refuse(`"${part}" is not a NAME=VALUE part.`);
    const [, name, value] = match as unknown as [string, string, string];
    if (UNSUPPORTED.has(name)) return refuse(`${name} is not supported.`);
    if (!SUPPORTED.has(name)) return refuse(`${name} is not a rule part.`);
    if (parts.has(name)) return refuse(`${name} appears twice.`);
    parts.set(name, value);
  }

  const freq = parts.get("FREQ");
  if (!freq) return refuse("The rule has no FREQ.");
  if (!["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(freq)) {
    return refuse(`FREQ=${freq} is not supported.`);
  }

  let interval = 1;
  const intervalText = parts.get("INTERVAL");
  if (intervalText !== undefined) {
    const read = positiveInt(intervalText);
    if (read === null) return refuse("INTERVAL is not a whole number above 0.");
    interval = read;
  }

  let count: number | null = null;
  const countText = parts.get("COUNT");
  if (countText !== undefined) {
    count = positiveInt(countText);
    if (count === null) return refuse("COUNT is not a whole number above 0.");
  }

  let until: string | null = null;
  const untilText = parts.get("UNTIL");
  if (untilText !== undefined) {
    // A date, or a UTC date-time read as its date.
    const match = /^(\d{8})(T\d{6}Z)?$/.exec(untilText);
    until = match ? readCompactDate(match[1] as string) : null;
    if (until === null) return refuse("UNTIL is not a date like 20261231.");
  }
  if (count !== null && until !== null) {
    return refuse("A rule ends on UNTIL or after COUNT, not both.");
  }

  let weekStart: 0 | 6 = 0;
  const wkst = parts.get("WKST");
  if (wkst !== undefined) {
    if (wkst !== "MO" && wkst !== "SU") return refuse("WKST is MO or SU.");
    weekStart = wkst === "MO" ? 0 : 6;
  }

  const byDay = parts.get("BYDAY");
  const byMonthDayText = parts.get("BYMONTHDAY");
  const byMonthText = parts.get("BYMONTH");

  let monthDay: number | null = null;
  if (byMonthDayText !== undefined) {
    monthDay = positiveInt(byMonthDayText);
    if (monthDay === null || monthDay > 31) {
      return refuse("BYMONTHDAY is one day, 1 to 31.");
    }
  }
  let month: number | null = null;
  if (byMonthText !== undefined) {
    month = positiveInt(byMonthText);
    if (month === null || month > 12) {
      return refuse("BYMONTH is one month, 1 to 12.");
    }
  }

  const startDay = Number(start.slice(8, 10));
  const startMonth = Number(start.slice(5, 7));
  const base = {
    start,
    interval,
    until,
    count,
    weekStart,
    weekdays: [] as number[],
    nthWeekday: null,
    monthDay: null,
    month: null,
  };

  switch (freq) {
    case "DAILY": {
      if (byDay || monthDay !== null || month !== null) {
        return refuse("A daily rule takes no BY part.");
      }
      return { ok: true, rule: { ...base, freq } };
    }

    case "WEEKLY": {
      if (monthDay !== null || month !== null) {
        return refuse("A weekly rule takes only BYDAY.");
      }
      if (byDay === undefined) {
        return {
          ok: true,
          rule: { ...base, freq, weekdays: [weekdayIndex(start)] },
        };
      }
      const weekdays: number[] = [];
      for (const code of byDay.split(",")) {
        const index = DAY_CODES.indexOf(code as (typeof DAY_CODES)[number]);
        if (index < 0) {
          return refuse(`BYDAY=${code} is not a weekday for a weekly rule.`);
        }
        if (!weekdays.includes(index)) weekdays.push(index);
      }
      weekdays.sort((a, b) => a - b);
      return { ok: true, rule: { ...base, freq, weekdays } };
    }

    case "MONTHLY": {
      if (month !== null) return refuse("A monthly rule takes no BYMONTH.");
      if (byDay !== undefined && monthDay !== null) {
        return refuse("A monthly rule is on a day or a weekday, not both.");
      }
      if (byDay !== undefined) {
        const match = /^(-1|\+?[1-5])(MO|TU|WE|TH|FR|SA|SU)$/.exec(byDay);
        if (!match) {
          return refuse(
            "A monthly BYDAY is one weekday with its nth: 1 to 5, or -1.",
          );
        }
        const nth = Number(match[1]);
        const weekday = DAY_CODES.indexOf(
          match[2] as (typeof DAY_CODES)[number],
        );
        return {
          ok: true,
          rule: { ...base, freq, nthWeekday: { nth, weekday } },
        };
      }
      return {
        ok: true,
        rule: { ...base, freq, monthDay: monthDay ?? startDay },
      };
    }

    default: {
      // YEARLY
      if (byDay !== undefined) return refuse("A yearly rule takes no BYDAY.");
      const yearMonth = month ?? startMonth;
      const yearDay = monthDay ?? startDay;
      // 2000 is a leap year, so 29 February passes and 30 February does not.
      if (yearDay > daysInMonth(2000, yearMonth)) {
        return refuse("That day never happens in that month.");
      }
      return {
        ok: true,
        rule: { ...base, freq: "YEARLY", month: yearMonth, monthDay: yearDay },
      };
    }
  }
}

/*
 * ---- Expanding ----
 */

function parts(dateKey: string): { year: number; month: number; day: number } {
  return {
    year: Number(dateKey.slice(0, 4)),
    month: Number(dateKey.slice(5, 7)),
    day: Number(dateKey.slice(8, 10)),
  };
}

/** The first day of the week a date is in, by the rule's WKST. */
function weekStartOf(dateKey: string, weekStart: 0 | 6): string {
  const back = (weekdayIndex(dateKey) - weekStart + 7) % 7;
  return addDays(dateKey, -back);
}

/**
 * Whether a date fits the rule's pattern, ignoring COUNT and UNTIL. A date
 * before the start never fits.
 */
function fitsPattern(rule: RepeatRule, dateKey: string): boolean {
  if (dateKey < rule.start) return false;
  const at = parts(dateKey);
  const from = parts(rule.start);

  switch (rule.freq) {
    case "DAILY":
      return daysBefore(rule.start, dateKey) % rule.interval === 0;

    case "WEEKLY": {
      if (!rule.weekdays.includes(weekdayIndex(dateKey))) return false;
      const weeks =
        daysBefore(
          weekStartOf(rule.start, rule.weekStart),
          weekStartOf(dateKey, rule.weekStart),
        ) / 7;
      return weeks % rule.interval === 0;
    }

    case "MONTHLY": {
      const months = (at.year - from.year) * 12 + (at.month - from.month);
      if (months % rule.interval !== 0) return false;
      if (rule.nthWeekday) {
        const { nth, weekday } = rule.nthWeekday;
        if (weekdayIndex(dateKey) !== weekday) return false;
        return nth === -1
          ? at.day + 7 > daysInMonth(at.year, at.month)
          : Math.ceil(at.day / 7) === nth;
      }
      return at.day === rule.monthDay;
    }

    case "YEARLY":
      return (
        (at.year - from.year) % rule.interval === 0 &&
        at.month === rule.month &&
        at.day === rule.monthDay
      );
  }
}

/**
 * Every date the rule hits from `fromKey` to `toKey`, both inclusive.
 *
 * A day at a time from the start: COUNT counts real hits only (a start that
 * misses its own pattern is not one; RFC 5545 leaves that case undefined),
 * and at a person's scale a few thousand days is nothing.
 */
export function occurrences(
  rule: RepeatRule,
  fromKey: string,
  toKey: string,
): string[] {
  const last = rule.until !== null && rule.until < toKey ? rule.until : toKey;
  // Without COUNT nothing before `fromKey` matters, so start there.
  let key = rule.count === null && fromKey > rule.start ? fromKey : rule.start;

  const hits: string[] = [];
  let counted = 0;
  while (key <= last) {
    if (fitsPattern(rule, key)) {
      counted += 1;
      if (rule.count !== null && counted > rule.count) break;
      if (key >= fromKey) hits.push(key);
    }
    key = addDays(key, 1);
  }
  return hits;
}

/** Whether the rule hits one date. */
export function occursOn(rule: RepeatRule, dateKey: string): boolean {
  if (rule.until !== null && dateKey > rule.until) return false;
  if (!fitsPattern(rule, dateKey)) return false;
  if (rule.count === null) return true;
  return occurrences(rule, dateKey, dateKey).length === 1;
}
