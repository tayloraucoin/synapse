/**
 * The desk's Today frame's words (USE-58; today/words-and-access.md,
 * states/opened-day.md). No second person, no question, no count: times,
 * lengths and a session's place only (D-USE-47).
 */

const WEEKDAY_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MONTH_LONG = [
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

/** "9:30" from minutes from midnight. */
export function clockOf(minutes: number): string {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

/** "9:30" from "09:30". */
export function clockWords(clock: string): string {
  return clock.replace(/^0(\d)/, "$1");
}

export const DESK_COPY = {
  /** The strip. */
  today: "today",
  stripLabel: (range: string) => `Week of ${range}`,
  noWork: "No work",
  /** "Tuesday 13 October". */
  dayName: (weekdayIndex: number, dateKey: string) =>
    `${WEEKDAY_LONG[weekdayIndex]} ${Number(dateKey.slice(8, 10))} ${MONTH_LONG[Number(dateKey.slice(5, 7)) - 1]}`,

  /** The day column. */
  theDay: "The day",
  range: (startMin: number, endMin: number) =>
    `whole day, then ${clockOf(startMin)} to ${clockOf(endMin)}`,
  lightsOut: (clock: string) => `Lights out ${clockWords(clock)}`,
  /** "Work · 9:30 to 12:00". */
  workBlock: (name: string, startsAt: string, endsAt: string) =>
    `${name} · ${clockWords(startsAt)} to ${clockWords(endsAt)}`,
  event: (startsAt: string, title: string) =>
    `${clockWords(startsAt)} ${title}`,

  /** The opened day (opened-day.md). */
  title: (weekdayIndex: number, dateKey: string) =>
    `${WEEKDAY_LONG[weekdayIndex]}, ${Number(dateKey.slice(8, 10))} ${MONTH_LONG[Number(dateKey.slice(5, 7)) - 1]}`,
  back: "‹ Week",
  backLabel: "Back to the Week",
  planning: (weekdayIndex: number) =>
    `Planning ${WEEKDAY_LONG[weekdayIndex]}. Firing, Start and Done wait for the day itself.`,
  addTo: (tier: string) => `+ Add to ${tier}`,
  todos: "To-dos",
  noLinear: "No Linear",
  session: (n: number, of: number) => `session ${n} of ${of}`,
  /** The strip's "2/3". */
  place: (n: number, of: number) => `${n}/${of}`,
  priority: {
    urgent: "Urgent",
    high: "High",
    normal: "Normal",
    low: "Low",
  },
  dayError: "The day didn't load.",
} as const;
