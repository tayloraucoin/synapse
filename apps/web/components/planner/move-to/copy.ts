import type { WorkTier } from "@syn/types";
import { weekdayIndex } from "@syn/utils";
import { clock } from "../item-sheet/copy";

/**
 * Move to's words (USE-69; interactions/move-to and its states). No second
 * person; times, dates and lengths are the only numbers; the consequence is
 * words and lengths, never red.
 */

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const SHORT_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
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
];

const TIER: Record<WorkTier, string> = {
  urgent: "Urgent",
  primary: "Primary",
  secondary: "Secondary",
  stretch: "Stretch",
};

const weekday = (dateKey: string) => WEEKDAYS[weekdayIndex(dateKey)]!;
const dayOf = (dateKey: string) => Number(dateKey.slice(8, 10));

/** "Tuesday 13 October". */
export function dayWords(dateKey: string): string {
  const month = MONTHS[Number(dateKey.slice(5, 7)) - 1];
  return `${weekday(dateKey)} ${dayOf(dateKey)} ${month}`;
}

/** "10 min", "1 h", "1 h 20 min". */
function minutes(n: number): string {
  if (n < 60) return `${n} min`;
  const h = Math.floor(n / 60);
  const m = n % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** "1 to 2 h", "30 min to 1 h". */
function range(min: number | null, max: number | null): string | null {
  if (max === null) return min === null ? null : minutes(min);
  if (min === null || min === max) return minutes(max);
  if (min % 60 === 0 && max % 60 === 0) return `${min / 60} to ${max / 60} h`;
  return `${minutes(min)} to ${minutes(max)}`;
}

export const MOVE_TO_COPY = {
  title: "Move to",
  close: "Close",
  back: (to: string) => `Back to ${to}`,
  later: "Later today",
  another: "Another day",
  pickADay: "Pick a day",
  /** "Meditate · 10 min · in Wellness, 7:05 to 8:00". */
  scopeSet: (
    title: string,
    lengthMin: number,
    block: string,
    start: string,
    end: string,
  ) =>
    `${title} · ${minutes(lengthMin)} · in ${block}, ${clock(start)} to ${clock(end)}`,
  /** "ENG-123 · 1 to 2 h · in Work, 9:30 to 12:00, Primary". */
  scopeWork: (input: {
    identifier: string | null;
    title: string;
    minMin: number | null;
    maxMin: number | null;
    block: string;
    start: string;
    end: string;
    tier: WorkTier;
  }) =>
    [
      input.identifier ?? input.title,
      range(input.minMin, input.maxMin),
      `in ${input.block}, ${clock(input.start)} to ${clock(input.end)}, ${TIER[input.tier]}`,
    ]
      .filter((part) => part !== null)
      .join(" · "),
  /** From the work menu: "[Answer the review comments] · 20 min". */
  scopeMenu: (title: string, lengthMin: number | null) =>
    lengthMin === null ? title : `${title} · ${minutes(lengthMin)}`,
  /** "Lunch, 12:00 to 13:00". */
  blockRow: (block: string, start: string, end: string) =>
    `${block}, ${clock(start)} to ${clock(end)}`,
  /** "Tomorrow, Wellness 7:05". */
  tomorrowRow: (block: string, start: string) =>
    `Tomorrow, ${block} ${clock(start)}`,
  /** "Thursday 15 October, Wellness 7:05". */
  pickedRow: (dateKey: string, block: string, start: string) =>
    `${dayWords(dateKey)}, ${block} ${clock(start)}`,
  /** "Saturday 24 October, no Wellness". */
  noKindRow: (dateKey: string, kind: string) =>
    `${dayWords(dateKey)}, no ${kind}`,
  noKindLine: (dateKey: string, set: boolean) =>
    set
      ? "It waits in the day's to-dos, to place on review."
      : `That day follows the usual ${weekday(dateKey)}. It waits in the day's to-dos, to place on review.`,
  noWorkLine: "No Work block that day.",
  holdsLine: "Already in Work that day.",
  /** "Goes after the meal · fits, 20 min free". */
  goesAfter: (
    after: { title: string; meal: boolean } | null,
    freeMin: number,
  ) =>
    after === null
      ? `Fits, ${freeMin} min free`
      : `Goes after ${after.meal ? "the meal" : after.title} · fits, ${freeMin} min free`,
  /** "Runs to 22:05, 5 min past its end". */
  runsPast: (runsTo: string, overMin: number) =>
    `Runs to ${clock(runsTo)}, ${overMin} min past its end`,
  /** "At the end of Wellness · fits, 15 min free". */
  atEnd: (block: string, fit: string) => `At the end of ${block} · ${fit}`,
  atEndAlone: (block: string) => `At the end of ${block}`,
  /** "Tuesday 13 October · at the end of Wellness". */
  dayAtEnd: (dateKey: string, block: string) =>
    `${dayWords(dateKey)} · at the end of ${block}`,
  /** "Stays in Secondary · fits, 40 min free". */
  staysIn: (tier: WorkTier, fit: string) => `Stays in ${TIER[tier]} · ${fit}`,
  stays: (tier: WorkTier) => `Stays in ${TIER[tier]}`,
  fitsFree: (freeMin: number) => `fits, ${freeMin} min free`,
  runsPastLower: (runsTo: string, overMin: number) =>
    `runs to ${clock(runsTo)}, ${overMin} min past its end`,
  /** "Tuesday 13 October · Secondary". */
  dayTier: (dateKey: string, tier: WorkTier) =>
    `${dayWords(dateKey)} · ${TIER[tier]}`,
  pool: "Back to the pool",
  poolLine: "Off every day until it's slotted again",
  footerSet: (todayKey: string) =>
    `One tap moves it and closes the sheet, with Undo in the toast. For today only; ${weekday(todayKey)}'s usual is unchanged.`,
  footerWork:
    "One tap moves it and closes the sheet; Undo is offered after. The issue in Linear doesn't change; only where it sits in the day.",
  pick: {
    title: "Pick a day",
    back: "Move to",
    legend: "Already set for that day",
    /** "Move to Thursday" within the next seven days, else "Move to Fri 23" (D-USE-65). */
    action: (dateKey: string, todayKey: string) => {
      const ahead =
        (Date.parse(`${dateKey}T00:00:00Z`) -
          Date.parse(`${todayKey}T00:00:00Z`)) /
        86_400_000;
      return ahead < 7
        ? `Move to ${weekday(dateKey)}`
        : `Move to ${SHORT_WEEKDAYS[weekdayIndex(dateKey)]} ${dayOf(dateKey)}`;
    },
    none: "Move to a day",
    under: (todayKey: string) =>
      `Undo is offered after. ${weekday(todayKey)}'s usual is unchanged.`,
  },
  toast: {
    /** "Moved to Work, 13:00". */
    later: (block: string, start: string) =>
      `Moved to ${block}, ${clock(start)}`,
    /** "Moved to tomorrow, Work 9:30". */
    tomorrow: (block: string, start: string) =>
      `Moved to tomorrow, ${block} ${clock(start)}`,
    /** "Moved to Thursday", "Moved to Fri 23". */
    picked: (action: string) => action.replace(/^Move/, "Moved"),
    /** "Moved to Saturday's to-dos". */
    todos: (dateKey: string) => `Moved to ${weekday(dateKey)}'s to-dos`,
    pool: "Back in the pool",
  },
} as const;
