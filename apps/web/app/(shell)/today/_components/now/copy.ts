import { weekdayForDayKey } from "@syn/utils";

/**
 * Now's words (USE-16; day/now/words-and-access.md). No second person, no
 * count of what is left; times and lengths are the only numbers.
 */

/**
 * "HH:MM" to the boards' clock: "7:10", "13:00" (USE-17's afternoon frames
 * draw the day's hours, not twelve-hour).
 */
export function clockLabel(clock: string): string {
  const [hour = "0", minute = "00"] = clock.split(":");
  return `${Number(hour)}:${minute}`;
}

/**
 * "Monday, 12 October": the title before Ready, go (D-USE-5). Orient draws
 * its date the same way; that helper is Orient's thread's until it lands.
 */
export function dateTitle(dateKey: string): string {
  const [, month = 1, day = 1] = dateKey.split("-").map(Number);
  const monthName = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, month - 1, 1, 12)));
  return `${weekdayForDayKey(dateKey)}, ${day} ${monthName}`;
}

export const NOW_COPY = {
  title: "Now",
  todos: "To-dos",
  span: (startsAt: string, endsAt: string) =>
    `${clockLabel(startsAt)} to ${clockLabel(endsAt)}`,
  length: (min: number | null) => (min === null ? null : `${min} min`),
  meta: (min: number | null, at: string | null) =>
    [min === null ? null : `${min} min`, at === null ? null : clockLabel(at)]
      .filter((part) => part !== null)
      .join(" · "),
  start: "Start",
  done: "Done",
  doneName: (title: string) => `Done, ${title}`,
  liftedName: (title: string) => `${title}, now`,
  boxName: (title: string, min: number | null) =>
    min === null ? title : `${title}, ${min} min`,
  rowName: (title: string) => `${title}, make current`,
  gripName: (title: string) => `Reorder ${title}`,
  blockMenu: (block: string) => `${block} options`,
  blockMenuTitle: (block: string) => `${block}, today`,
  completeBlock: (block: string) => `Complete ${block}`,
  editBlock: "Edit block",
  seeTheWholeDay: "See the whole day",
  /** Behind: one quiet line, never a word for late (product rules). */
  plannedToEnd: (endsAt: string) => `Planned to end at ${clockLabel(endsAt)}`,
  announceBehind: (block: string, endsAt: string) =>
    `${block} was planned to end at ${clockLabel(endsAt)}.`,
  /** "10:00 to 13:00 · Checklist". */
  checklistSpan: (startsAt: string, endsAt: string) =>
    `${clockLabel(startsAt)} to ${clockLabel(endsAt)} · Checklist`,
  /** "All day · Checklist · next: Lunch with Sam, 13:00". */
  allDaySpan: (next: { name: string; startsAt: string } | null) =>
    next === null
      ? "All day · Checklist"
      : `All day · Checklist · next: ${next.name}, ${clockLabel(next.startsAt)}`,
  addToChecklist: "Add to the checklist",
  addPlaceholder: "Item",
  reviewTheDay: "Review the day",
  dayListName: "The day",
  took: (min: number) => `Took ${min} min ·`,
  change: "Change",
  announceDone: (title: string, next: string | null) =>
    next === null ? `${title} done.` : `${title} done. ${next} is next.`,
  sheet: {
    planned: (title: string, min: number | null) =>
      min === null ? title : `${title} · planned ${min} min`,
    title: "Time taken",
    field: "Minutes",
    save: "Save",
    close: "Close",
  },
} as const;

/**
 * How long "Took <n> min · Change" stays after a Done: about six seconds,
 * N4's chip time (took-change.md [ASSUMPTION]).
 */
export const TOOK_LINE_MS = 6000;
