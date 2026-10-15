import type { BlockHue } from "../block-hue";

/**
 * The New block sheet's words (USE-46; new-block-sheet/words-and-access.md
 * and each state file). No second person; times and lengths are the only
 * numbers.
 */

/** "HH:MM" to the boards' clock: "7:05", "17:00". */
export function clock(value: string): string {
  const [hour = "0", minute = "00"] = value.split(":");
  return `${Number(hour)}:${minute}`;
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
] as const;

export const NEW_BLOCK_COPY = {
  weekdays: WEEKDAYS,
  months: MONTHS,
  /** "Mon 12", from `2026-10-12`. */
  shortDate: (dateKey: string) => {
    const [y, m, d] = dateKey.split("-").map(Number) as [number, number, number];
    const weekday = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
    return `${WEEKDAYS[weekday]!.slice(0, 3)} ${d}`;
  },
  newBlock: "New block",
  newTransition: "New transition",
  close: "Close, nothing added",
  kind: "Kind",
  name: "Name",
  icon: (name: string | null) => (name ? `Icon, ${name}` : "Icon, none set"),
  iconBack: (name: string) => name || "New block",
  starts: "Starts",
  ends: "Ends",
  /** "Ends 17:20, 20 minutes", as Ends announces it. */
  endsName: (end: string, minutes: number) => {
    if (minutes <= 0) return `Ends ${end}`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    const parts = [
      hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : "",
      rest > 0 ? `${rest} ${rest === 1 ? "minute" : "minutes"}` : "",
    ].filter(Boolean);
    return `Ends ${end}, ${parts.join(" ")}`;
  },
  repeats: {
    label: "Repeats",
    name: (value: string) => `Repeats, ${value}`,
    none: "Does not repeat",
    daily: "Daily",
    weekdays: "Every weekday, Monday to Friday",
    custom: "Custom…",
  },
  colour: "Colour",
  colourName: (text: string) => `Colour, ${text}`,
  /** Life's and Evening's names are not drawn [ASSUMPTION: Gloss names them]. */
  hueNames: {
    leaf: "Leaf",
    sky: "Sky",
    clay: "Clay",
    rose: "Rose",
    amber: "Amber",
    slate: "Slate",
    plum: "Plum",
    moss: "Moss",
    yellow: "Yellow",
  } satisfies Record<BlockHue, string>,
  transitionColour: "Amber, a transition's colour",
  checklist: {
    label: "Checklist, no times",
    off: "Off: each item gets a length and a place on the rail.",
    on: "On: no times or lengths; check in any order. Starts and Ends step aside.",
  },
  meal: {
    label: "Meal",
    blockOn: "On: a fork in the column, and something to watch while eating.",
    blockOff: "Off: a break, empty if left so.",
    transitionOff: "Off: a slim band between things, in italic.",
    transitionOn: "On: a fork in the band, and something to watch while eating.",
    watching: "Watching while eating",
    editTopics: "Edit topics",
    offered: (name: string, on: boolean) =>
      `${name}, ${on ? "offered at this meal" : "not offered"}`,
  },
  fill: {
    label: "How work fills it",
    tasks: "Tasks for the day",
    tasksLine:
      "Work is slotted each week, by tier. The block is time to get through it.",
    set: "Set work",
    setLine: "The same work every time, like writing on Tuesday mornings.",
  },
  todosFill:
    "Filled from To-dos on the day: those with no day yet, oldest first. Pick or drop any; a type filter helps when picking.",
  orient: "Orient",
  opens: {
    empty: "opens empty to add its items.",
    tiers: "opens on its tiers to add work.",
    // [ASSUMPTION] Set work opens to set its fixed items (block-view/set-work.md).
    setWork: "opens empty to set its work.",
  },
  restFollow: ", and what follows after it.",
  setATimeLater: "Set a time later to put it on the rail.",
  invalid:
    "A block needs a name. The kind's name fills in when a kind is picked; this one was cleared.",
  invalidTransition: "A transition needs a name.",
  notAdded: "Not added.",
  tryAgain: "Try again",
  addBlock: "Add block",
  addTransition: "Add transition",
  nameNeeded: "Name needed",
} as const;
