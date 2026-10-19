import { addDays } from "../day/wall-clock";
import { weekdayIndex } from "../day/week";
import { occurrences, parseRule, presetRule } from "./rrule";

/**
 * A to-do's Repeats (USE-28; todo-sheet/states/repeats-open.md): a shorter
 * list than a block's, worded from the to-do's day, or today when it has
 * none. "Every month" is on the date ("on the 12th"), not the nth weekday
 * a block's Monthly takes. Custom… joins with the custom recurrence ticket.
 *
 * The stored text is a block's (`rrule.ts`): DTSTART, then one RRULE line.
 */

export interface TodoRepeatOption {
  label: string;
  /** The stored text, or null for "Does not repeat". */
  rrule: string | null;
}

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** 1 → "1st", 12 → "12th", 22 → "22nd". */
export function ordinal(day: number): string {
  const tens = day % 100;
  if (tens >= 11 && tens <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/** The four rules, in the drawn order, for a to-do read on `dateKey`. */
export function todoRepeatOptions(dateKey: string): TodoRepeatOption[] {
  const monthDay = Number(dateKey.slice(8, 10));
  return [
    { label: "Does not repeat", rrule: null },
    { label: "Every day", rrule: presetRule("daily", dateKey) },
    {
      label: `Every week, on ${WEEKDAYS[weekdayIndex(dateKey)]}`,
      rrule: presetRule("weekly", dateKey),
    },
    {
      label: `Every month, on the ${ordinal(monthDay)}`,
      rrule: `DTSTART;VALUE=DATE:${dateKey.replaceAll("-", "")}\nRRULE:FREQ=MONTHLY;BYMONTHDAY=${monthDay}`,
    },
  ];
}

/** The RRULE line alone, so two rules from different starts compare by what they repeat. */
export function ruleBody(rrule: string): string {
  return (
    rrule
      .split(/\r?\n/)
      .find((line) => line.startsWith("RRULE:"))
      ?.trim() ?? rrule.trim()
  );
}

/** The DTSTART date of a stored rule, or null. */
export function ruleStart(rrule: string): string | null {
  const match = /DTSTART;VALUE=DATE:(\d{4})(\d{2})(\d{2})/.exec(rrule);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

/**
 * The first date after `afterDateKey` the rule hits, or null when it has
 * ended or cannot be read. A year ahead covers every rule the list makes.
 */
export function nextDue(rrule: string, afterDateKey: string): string | null {
  const parsed = parseRule(rrule);
  if (!parsed.ok) return null;
  const from = addDays(afterDateKey, 1);
  const [first] = occurrences(parsed.rule, from, addDays(from, 400));
  return first ?? null;
}

/**
 * A repeating to-do checked off: the date its next one is due. Counted from
 * its own day when that is later than the day it was checked, so one done
 * early does not come back twice in the same week.
 */
export function nextTodoDue(input: {
  rrule: string;
  onDate: string | null;
  checkedOn: string;
}): string | null {
  const { rrule, onDate, checkedOn } = input;
  const after = onDate !== null && onDate > checkedOn ? onDate : checkedOn;
  return nextDue(rrule, after);
}
