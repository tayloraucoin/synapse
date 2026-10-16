import { daysBefore, weekdayForDayKey } from "@syn/utils";

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

const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");

/**
 * "Tue" within the week, "3 Oct" past it, as the tray's "From <day>"
 * [ASSUMPTION: the made day as the card draws it, "a to-do since Tue"].
 */
export function madeOnLabel(madeOn: string, dateKey: string): string {
  if (daysBefore(madeOn, dateKey) < 7) {
    return weekdayForDayKey(madeOn).slice(0, 3);
  }
  const [, month = 1, day = 1] = madeOn.split("-").map(Number);
  return `${day} ${MONTHS[month - 1] ?? ""}`;
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
  /** The Journal row's name: it opens Close the day (USE-110). */
  journalRowName: (title: string) => `${title}, open Close the day`,
  rowName: (title: string) => `${title}, make current`,
  gripName: (title: string) => `Reorder ${title}`,
  listName: (block: string) => `${block}, in order`,
  rowMenu: {
    swap: "Swap",
    edit: "Edit",
    moveUp: "Move up",
    moveDown: "Move down",
    notToday: "Not today",
    more: (title: string) => `More for ${title}`,
    menu: (title: string) => `${title} options`,
  },
  /** Not today's Toaster (D-USE-70, as Move to's): no judgement. */
  offToday: (title: string) => `${title} is off today.`,
  announceMoved: (title: string, next: boolean) =>
    next ? `${title} is next.` : `${title} moved.`,
  blockMenu: (block: string) => `${block} options`,
  blockMenuTitle: (block: string) => `${block}, today`,
  completeBlock: (block: string) => `Complete ${block}`,
  editBlock: "Edit block",
  seeTheWholeDay: "See the whole day",
  /** Behind: one quiet line, never a word for late (product rules). */
  plannedToEnd: (endsAt: string) => `Planned to end at ${clockLabel(endsAt)}`,
  /** Work's firing items on the next block's Now (firing.md step 5, D-USE-57). */
  stillFiring: {
    heading: (from: string) => `Still firing, from ${from}`,
    /**
     * "Tap the mark when it's back; it waits in Primary for the 13:00 Work
     * block. Done works from here too." Several wait in their own tiers.
     */
    line: (tier: string | null, from: string, nextAt: string | null) => {
      const where =
        tier === null ? "they wait in their tiers" : `it waits in ${tier}`;
      const until =
        nextAt === null ? "" : ` for the ${clockLabel(nextAt)} ${from} block`;
      return `Tap the mark when it's back; ${where}${until}. Done works from here too.`;
    },
    done: "Done",
    doneName: (title: string) => `Done, ${title}`,
  },
  /** Readied before the block's time (not-yet-started.md) [placeholder]. */
  startsAt: (startsAt: string) =>
    `Starts at ${clockLabel(startsAt)}. Anything can be done early.`,
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
  /** A block's end and the day's (USE-20): names and times, never counts. */
  blockComplete: (block: string) => `${block} complete`,
  nextBlock: (block: string, startsAt: string) =>
    `Next: ${block}, ${clockLabel(startsAt)}`,
  startBlock: (block: string) => `Start ${block}`,
  addToBlock: (block: string) => `Add to ${block}`,
  freeUntil: (endsAt: string) => `Free until ${clockLabel(endsAt)}`,
  doneBefore: (endsAt: string, next: string, nextEndsAt: string) =>
    `Done before ${clockLabel(endsAt)}. Starting early is fine: ${next} keeps its end, ${clockLabel(nextEndsAt)}.`,
  todoUntil: (endsAt: string) => `Or a to-do until ${clockLabel(endsAt)}`,
  announceComplete: (block: string) => `${block} complete.`,
  /** The close card (USE-25): names and times, never a count or "missed". */
  close: {
    closeName: (block: string) => `Close, stay on ${block}`,
    next: "Next",
    then: (block: string) => `then ${block}`,
    notDone: (titles: readonly string[]) => `Not done: ${titles.join(", ")}`,
    later: "Later",
    laterName: (item: string) => `Move ${item} to later`,
    leave: "Leave",
    leaveName: (item: string) => `Leave ${item} not done`,
    movedTo: (block: string) => `Moved to the end of ${block}`,
    undo: "Undo",
    undoName: (item: string) => `Undo move of ${item}`,
    /** Do now (USE-26): the length, and the consequence before the tap. */
    withLength: (item: string, lengthMin: number | null) =>
      lengthMin === null ? item : `${item} · ${lengthMin} min`,
    fitsBy: (clock: string) => `Fits by ${clockLabel(clock)}`,
    wouldStart: (block: string, clock: string) =>
      `${block} would start ${clockLabel(clock)}`,
    /** The day's last block, not drawn (D-USE-74) [ASSUMPTION]. */
    wouldEnd: (block: string, clock: string) =>
      `${block} would end ${clockLabel(clock)}`,
    doNow: "Do now",
    doNowName: (item: string, consequence: string) =>
      `Do ${item} now, ${consequence}`,
    announceDoNow: (item: string, block: string) => `${block}. ${item} is now.`,
    nothingAfter: "Nothing after this today.",
    announce: (
      block: string,
      next: { name: string; startsAt: string } | null,
    ) =>
      next === null
        ? `${block} complete.`
        : `${block} complete. Next: ${next.name}, ${clockLabel(next.startsAt)}.`,
    announceMoved: (item: string, block: string) =>
      `${item} moved to the end of ${block}.`,
  },
  breakTitle: "Break",
  endBreak: "End break",
  blocksDone: "The day's blocks are done.",
  took: (min: number) => `Took ${min} min ·`,
  change: "Change",
  announceDone: (title: string, next: string | null) =>
    next === null ? `${title} done.` : `${title} done. ${next} is next.`,
  /** A To-dos block's header meta, the kind first (D-USE-74). */
  todosSpan: (startsAt: string, endsAt: string) =>
    `To-dos · ${clockLabel(startsAt)} to ${clockLabel(endsAt)}`,
  /** Closes a to-do's card meta: where it came from (D-USE-74). */
  todoSince: (madeOn: string, dateKey: string) =>
    `a to-do since ${madeOnLabel(madeOn, dateKey)}`,
  // ---- The system states (USE-21) ----
  offline: "Offline. Checks are saved on this phone.",
  notSaved: { notSaved: "Not saved.", tryAgain: "Try again" },
  announceNotSaved: (title: string) => `${title} not saved.`,
  loading: "Now, loading",
  /** Phone Today's load error, carried to Now (D-USE-57, D-USE-74). */
  blockFailed:
    "Today didn't load. Timers that were running keep their time; nothing is lost.",
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
