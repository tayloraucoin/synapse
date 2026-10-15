import { weekdayForDayKey } from "@syn/utils";

/**
 * The Item sheet's words (USE-64; day/item-sheet/words-and-access.md). No
 * second person; times and lengths are the only numbers.
 */

/** "HH:MM" to the boards' clock: "7:05", "13:00". */
export function clock(value: string): string {
  const [hour = "0", minute = "00"] = value.split(":");
  return `${Number(hour)}:${minute}`;
}

/** "Workout", from "Workout: gym": the kind's word in Swap's lines. */
function kindWord(blockKind: string): { one: string; many: string } {
  switch (blockKind) {
    case "training":
      return { one: "Workout", many: "workouts" };
    case "wellness":
      return { one: "Wellness item", many: "wellness items" };
    case "life":
      return { one: "Life item", many: "life items" };
    default:
      return { one: "Item", many: "items" };
  }
}

export const ITEM_SHEET_COPY = {
  close: "Close",
  swap: "Swap",
  more: (name: string) => `More for ${name}`,
  scope: (block: string, start: string, end: string) =>
    `${block}, ${clock(start)} to ${clock(end)} · today only`,
  icon: (name: string) => `Icon, ${name}. Change`,
  length: "Length",
  shorter: "Shorter",
  longer: "Longer",
  atSetTime: "At a set time",
  follows: (previous: string | null, block: string, at: string | null) =>
    previous === null
      ? `Off: starts ${block}${at === null ? "" : `, at ${clock(at)}`}`
      : `Off: follows ${previous}${at === null ? "" : `, at ${clock(at)}`}`,
  staysAtTime: "Stays at its time; the items around it move",
  time: "Time",
  ends: (at: string) => `Ends ${clock(at)}`,
  notes: "Notes (optional)",
  notesPlaceholder: "A word for later",
  footer: (dateKey: string) =>
    `Changes save as they're made, for today. ${weekdayForDayKey(dateKey)}'s usual is unchanged.`,
  menu: {
    title: (name: string) => `${name}, today only`,
    moveTo: "Move to…",
    notToday: "Not today",
    makeUsual: (dateKey: string) =>
      `Make it ${weekdayForDayKey(dateKey)}'s usual`,
  },
  swapStep: {
    scope: (block: string, start: string, end: string) =>
      `Swap · ${block}, ${clock(start)} to ${clock(end)}`,
    search: (blockKind: string) => `Search ${kindWord(blockKind).many}`,
    line: (lengthMin: number, startsAt: string | null) =>
      startsAt === null
        ? `${lengthMin} min`
        : `${lengthMin} min · starts ${clock(startsAt)}`,
    current: "current",
    addOne: "Add one",
    noMatch: (query: string) => `Nothing called "${query}".`,
    empty: "Nothing else of this kind yet.",
    emptyLine: (blockKind: string) => {
      const many = kindWord(blockKind).many;
      return `${many[0]!.toUpperCase()}${many.slice(1)} added here stay in the library for any day.`;
    },
  },
  toast: {
    swapped: (from: string, to: string) => `${from} swapped for ${to}, today.`,
    offToday: (name: string) => `${name} is off today.`,
    madeUsual: (name: string, dateKey: string) =>
      `${name} is ${weekdayForDayKey(dateKey)}'s usual now.`,
  },
  /** Not found: the item is no longer on today. */
  gone: "This item is no longer on today.",
} as const;
