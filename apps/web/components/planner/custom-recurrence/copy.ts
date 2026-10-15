import {
  describeEnds,
  longDate,
  nthWeekdayOf,
  nthWord,
  ruleFromForm,
  weekdayIndex,
  weekdayList,
  type RuleForm,
  type RuleUnit,
} from "@syn/utils";

/**
 * Repeats › Custom…'s words (USE-47; new-block-sheet/states/custom-recurrence.md).
 * The summary reads the rule, never a count of its dates; times are the
 * only other numbers.
 */

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** "HH:MM" to the boards' clock: "13:00", "7:05". */
function clock(value: string): string {
  const [hour = "0", minute = "00"] = value.split(":");
  return `${Number(hour)}:${minute}`;
}

const UNITS: Record<RuleUnit, [string, string]> = {
  day: ["day", "days"],
  week: ["week", "weeks"],
  month: ["month", "months"],
  year: ["year", "years"],
};

export const CUSTOM_RECURRENCE_COPY = {
  title: "Custom recurrence",
  back: (to: string) => `Back to ${to}`,
  /** "Sunday reset · New block". */
  caption: (name: string, sheet: string) =>
    name.trim() === "" ? sheet : `${name.trim()} · ${sheet}`,
  repeatEvery: "Repeat every",
  every: "Repeat every, how many",
  unitHint: "day, week, month or year",
  unit: (unit: RuleUnit, every: number) => UNITS[unit][every === 1 ? 0 : 1],
  repeatOn: "Repeat on",
  weekdayLetters: ["M", "T", "W", "T", "F", "S", "S"] as const,
  weekdays: WEEKDAYS,
  /** The hint under the weekdays, worded from the start date. */
  monthHint: (startKey: string) =>
    `With month: ${onDay(startKey)}, or ${onNth(startKey)}`,
  onDay: (startKey: string) => sentence(onDay(startKey)),
  onNth: (startKey: string) => sentence(onNth(startKey)),
  ends: "Ends",
  never: "Never",
  on: "On",
  after: "After",
  onDate: "Ends on",
  times: (count: number) => (count === 1 ? "1 time" : `${count} times`),
  timesName: "Ends after, how many times",
  done: "Done",
} as const;

function onDay(startKey: string): string {
  return `on day ${Number(startKey.slice(8, 10))}`;
}

function onNth(startKey: string): string {
  return `on the ${nthWord(nthWeekdayOf(startKey))} ${WEEKDAYS[weekdayIndex(startKey)]}`;
}

function sentence(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "18 Jan 2027", as the On field reads. */
export function shortLongDate(dateKey: string): string {
  const [day, month, year] = longDate(dateKey).split(" ") as [
    string,
    string,
    string,
  ];
  return `${day} ${month.slice(0, 3)} ${year}`;
}

/**
 * The line above Done: how often, at what times, and how it shows in the
 * usual week (D-USE-87). A to-do has no times and no usual week.
 *
 * "Every Wednesday and Sunday, 13:00 to 16:00. It shows on both days in the
 * usual week." A rule the usual week cannot hold (every 2 weeks, every 3
 * days, monthly, yearly) shows in This week on its dates only
 * [ASSUMPTION: for every N days and weeks, as D-USE-87 rules for months].
 */
export function customSummary(
  form: RuleForm,
  startKey: string,
  options: { times?: { startsAt: string; endsAt: string }; usualWeek: boolean },
): string {
  const rule = ruleFromForm(form, startKey);
  const n = rule.interval;
  const times = options.times
    ? `, ${clock(options.times.startsAt)} to ${clock(options.times.endsAt)}`
    : "";
  const ends = describeEnds(rule);

  let how: string;
  let usual: string | null = null;
  switch (rule.freq) {
    case "DAILY":
      how = n === 1 ? "Every day" : `Every ${n} days`;
      usual =
        n === 1
          ? "It shows on every day of the usual week."
          : "It shows in This week on its dates only.";
      break;
    case "WEEKLY": {
      const days = weekdayList(rule.weekdays);
      how = n === 1 ? `Every ${days}` : `Every ${n} weeks on ${days}`;
      usual =
        n !== 1
          ? "It shows in This week on its weeks only."
          : rule.weekdays.length === 1
            ? `It shows on ${days}s in the usual week.`
            : rule.weekdays.length === 2
              ? "It shows on both days in the usual week."
              : "It shows on each of those days in the usual week.";
      break;
    }
    case "MONTHLY": {
      const lead = n === 1 ? "Every month" : `Every ${n} months`;
      how = `${lead} ${form.monthBy === "nth" ? onNth(startKey) : onDay(startKey)}`;
      usual = "It shows in This week on its dates only.";
      break;
    }
    case "YEARLY": {
      const lead = n === 1 ? "Every year" : `Every ${n} years`;
      const [day, month] = longDate(startKey).split(" ");
      how = `${lead} on ${day} ${month}`;
      usual = "It shows in This week on its dates only.";
      break;
    }
  }
  const first = `${how}${times}${ends}.`;
  return options.usualWeek && usual !== null ? `${first} ${usual}` : first;
}
