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

const TIER = {
  urgent: "Urgent",
  primary: "Primary",
  secondary: "Secondary",
  stretch: "Stretch",
} as const;

const COUNT_WORDS = ["", "one", "two", "three", "four", "five", "six", "seven"];

/** "three": the ask's count of sessions in words, then digits. */
function countWord(count: number): string {
  return COUNT_WORDS[count] ?? String(count);
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
  /**
   * A work item's sheet (USE-65; size-and-length.md, work-more-open.md, the
   * size dev note). No second person; lengths are the only numbers.
   */
  work: {
    tier: TIER,
    session: (n: number, of: number) => `session ${n} of ${of}`,
    pool: "In the pool",
    size: "Size",
    sizeAside: "Linear's estimate, both ways",
    sizes: {
      quick: "Quick",
      small: "Small",
      medium: "Medium",
      large: "Large",
      huge: "Huge",
    },
    length: "Length",
    exact: "Exact",
    range: "Range",
    from: "From",
    to: "to",
    toName: "To",
    shorter: "Shorter",
    longer: "Longer",
    /** "Set from Medium; change it freely. The day plans with 2 h, the top of the range." */
    helper: (size: string | null, top: string | null, isRange: boolean) =>
      [
        size === null ? null : `Set from ${size}; change it freely.`,
        top === null
          ? null
          : `The day plans with ${top}${isRange ? ", the top of the range" : ""}.`,
      ]
        .filter((line) => line !== null)
        .join(" "),
    huge: "Bigger than a block. Split it?",
    orMore: "or more",
    when: "When",
    whenName: (value: string) => `When, ${value}. Move to`,
    today: "Today",
    start: "Start",
    done: "Done",
    doneForToday: "Done for today",
    more: (name: string) => `More for ${name}`,
    menu: {
      markDone: "Mark the task done",
      /** "Closes Wed's and Thu's sessions and the Linear issue". */
      markDoneLine: (days: readonly string[], linked: boolean) => {
        const issue = linked ? "the Linear issue" : null;
        if (days.length === 0) return issue === null ? null : `Closes ${issue}`;
        const list =
          days.length === 1
            ? `${days[0]}'s session`
            : `${days
                .slice(0, -1)
                .map((day) => `${day}'s`)
                .join(", ")} and ${days.at(-1)}'s sessions`;
        return `Closes ${list}${issue === null ? "" : ` and ${issue}`}`;
      },
      backToPool: "Back to the pool",
      spread: "Spread across the week",
      openInLinear: "Open in Linear",
      remove: "Remove from Synapse",
      removeLine: "The Linear issue stays as it is",
    },
    toast: {
      done: (name: string) => `${name} done.`,
      doneForToday: (next: { n: number; day: string } | null) =>
        next === null
          ? "Done for today."
          : `Done for today. Session ${next.n} is ${next.day}.`,
      taskDone: (name: string) => `${name} is done, every session closed.`,
      backToPool: (name: string) => `${name} is back in the pool.`,
      removed: (name: string) => `${name} is removed from Synapse.`,
    },
    /**
     * The ask (USE-60; start-while-one-runs.md) as Today words it, for Start
     * on the sheet [ASSUMPTION: Today's words are route-local, so the sheet
     * keeps its own until they have a shared home].
     */
    ask: {
      title: (title: string) => `Start ${title}`,
      lead: (running: string) =>
        `One item is in hand at a time. ${running} is running; it moves to:`,
      group: (running: string) => `Where ${running} goes`,
      firing: "Firing",
      firingLine: "Its prompt is out; firing time starts now",
      paused: "Paused",
      pausedLine: "Work time held; Resume from its row",
      cancel: "Cancel",
      start: "Start",
    },
  },
  /**
   * A linked item's Linear side (USE-66; linear-*.md, the status sheet,
   * words-and-access.md). A failed write is ink, never red, never a miss.
   */
  linear: {
    status: (word: string) => `Status, ${word}. Change`,
    open: (identifier: string) => `Open ${identifier} in Linear`,
    /** "Linear ↗": the word, then OpenInLinearIcon (no glyph in copy). */
    linear: "Linear",
    /** Before the issue's own title, for a screen reader (USE-68). */
    titleInLinear: "In Linear: ",
    done: "done",
    syncing: "Updating Linear",
    offline: "Updates Linear when back online",
    failed: (kept: string) => `Not updated in Linear. ${kept} is kept here.`,
    tryAgain: "Try again",
    /** "Done in Linear. Checked off here too, at 10:42." */
    closed: (at: string) => `Done in Linear. Checked off here too, at ${at}.`,
    /** What a failed description or estimate keeps [ASSUMPTION]. */
    keptDescription: "The description",
    keptSize: "The size",
    priority: "Priority",
    priorityHeading: "Priority · changes it in Linear",
    priorityName: (word: string) => `Priority, ${word}. Change`,
    priorities: {
      0: "No priority",
      1: "Urgent",
      2: "High",
      3: "Normal",
      4: "Low",
    } as Record<number, string>,
    mediumInLinear: "Medium in Linear",
    assignee: "Assignee",
    /** An issue assigned elsewhere [ASSUMPTION: the snapshot holds Taylor's only]. */
    unassigned: "Not assigned",
    description: "Description",
    synced: "Synced with Linear",
    showAll: "Show all",
    showLess: "Show less",
    statusList: {
      title: "Status",
      back: "Close",
      lead: (workspace: string) => `Moves it in Linear (${workspace})`,
      scope: (title: string, identifier: string) => `${title} · ${identifier}`,
      groups: {
        backlog: "Backlog",
        unstarted: "Unstarted",
        started: "Started",
        closed: "Completed and canceled",
      },
      /** The status sheet's consequences, by statusEffect; Backlog none, as drawn. */
      effects: {
        waiting: "moves to Waiting",
        start: "starts the timer",
        to_pool: "off today, back to the pool",
        check: "checks it off",
        off_today: "takes it off today",
        none: null,
      } as Record<string, string | null>,
      current: "current",
    },
    menu: {
      unlink: "Unlink from Linear",
      unlinkLine:
        "The item stays here as a plain item. The issue in Linear is untouched. Undo is offered after.",
    },
    toast: {
      unlinked: (name: string) => `${name} is unlinked from Linear.`,
    },
  },
  /**
   * A session's sheet, its sub-issues and a firing item's panel (USE-67;
   * tier-and-sessions.md, sub-issue-alone.md, while-firing.md,
   * interactions/sessions.md). No second person; times and lengths only.
   */
  sessions: {
    /** Tier's aside on a session: "Mon 12 only · asks before changing all". */
    tierAside: (day: string) => `${day} only · asks before changing all`,
    label: "Sessions",
    /** "2 to 4 h each". */
    each: (range: string) => `${range} each`,
    thisOne: "this one",
    addDay: "Add a day",
    /** ×'s name: "Drop Wed 14's session". */
    drop: (day: string) => `Drop ${day}'s session`,
    noTier: "no tier",
    ask: {
      /** "Move to Primary". */
      title: (tier: string) => `Move to ${tier}`,
      /** "[Synapse: desk Today layout] has three sessions: Mon 12, Wed 14, Thu 15." */
      lead: (title: string, count: number, days: string) =>
        `${title} has ${countWord(count)} sessions: ${days}.`,
      thisSession: "This session",
      /** "Mon 12 only". */
      thisOnly: (day: string) => `${day} only`,
      allSessions: "All sessions",
      /** "Wed's ends 12:10 at the top of its ranges". */
      ends: (day: string, at: string) =>
        `${day}'s ends ${at} at the top of its ranges`,
      /** [ASSUMPTION] Not drawn: a session outside the week read. */
      movesToo: (day: string) => `${day}'s moves too`,
      /** [ASSUMPTION] Not drawn: no other session changes. */
      already: (tier: string) => `The others are already ${tier}`,
      move: "Move",
    },
    toast: {
      dropped: (day: string) => `${day}'s session is off.`,
      added: (day: string) => `Session added on ${day}.`,
      placed: (title: string, day: string) => `${title} placed on ${day}.`,
    },
  },
  subIssues: {
    label: "Sub-issues",
    more: (title: string) => `More for ${title}`,
    place: "Place on a day by itself",
    /** [ASSUMPTION] A placed one's ··· moves it. */
    placeAgain: "Place on another day",
  },
  /** The one-day step: a sub-issue placed alone, or a session added. */
  dayStep: {
    /** "Sub-issue of SYN-212 · [Synapse: desk Today layout]". */
    scope: (identifier: string, issue: string) =>
      `Sub-issue of ${identifier} · ${issue}`,
    title: (title: string) => `Place ${title}`,
    lead: "It stays checkable inside its issue too. Checking it either place checks it in Linear.",
    day: "Day",
    tier: "Tier",
    /** "Place on Thu 15". */
    place: (day: string) => `Place on ${day}`,
    /** [ASSUMPTION] Not drawn: Add a day's step, as Place's. */
    addTitle: "Add a day",
    addLead: (title: string) => `Another session of ${title}, on one more day.`,
    add: (day: string) => `Add ${day}`,
    /** "Thu's Secondary runs to 11:20 at the top of its ranges." */
    runsTo: (day: string, tier: string, at: string) =>
      `${day}'s ${tier} runs to ${at} at the top of its ranges`,
    pastEnd: (end: string) => `: past Work's end at ${end}`,
    noTop: (tier: string) => `Where ${tier} ends isn't known: no top yet.`,
    pickADay: "Pick a day with a Work block.",
    /** A chip's name: "Thursday 15", "Saturday 17, no Work block". */
    noWork: "no Work block",
    past: "already past",
    taken: "already a session",
  },
  firing: {
    /** "Firing · 22 min". */
    word: (time: string) => `Firing · ${time}`,
    /** "Prompt sent at 11:58 · worked 40 min before it". */
    line: (at: string, worked: string | null) =>
      worked === null
        ? `Prompt sent at ${at}`
        : `Prompt sent at ${at} · worked ${worked} before it`,
    bringBack: "Bring back",
  },
  /**
   * Link a Linear issue (USE-68; linear-search.md, linear-off.md, D-USE-36,
   * D-USE-56). The footer line is the board's [PROPOSED] words.
   */
  link: {
    row: "Link a Linear issue",
    connect: "Connect Linear",
    connectWhere: "In Settings, Connections",
    /** "‹ [Draft the onboarding email]": back to the item. */
    back: (name: string) => `Back to ${name}`,
    title: "Link a Linear issue",
    search: "Search Linear issues",
    all: "All",
    tabs: "Workspace",
    /** "Assigned to Taylor". */
    assigned: (name: string | null) =>
      name === null ? "Assigned to me" : `Assigned to ${name}`,
    other: "Other open issues",
    /** "ENG-123 · already on today, in Primary". */
    onToday: (identifier: string, tier: keyof typeof TIER | null) =>
      `${identifier} · already on today${tier === null ? "" : `, in ${TIER[tier]}`}`,
    /** "Link ENG-151, [Add retry queue metrics]". */
    linkName: (identifier: string, title: string) =>
      `Link ${identifier}, ${title}`,
    footer:
      "Tap one to link it. The item takes the issue's title, size, project emoji and description; any notes it had are added to the end of the description, with Undo.",
    offline: "Offline. These are the issues from the last sync.",
    none: "No open issues here.",
    noMatch: "Nothing called that.",
    toast: {
      /** "Linked to ENG-151." and, with notes, where they went. */
      linked: (identifier: string, joined: boolean) =>
        `Linked to ${identifier}.${
          joined ? " The notes are at the end of the description." : ""
        }`,
    },
  },
  /** Not found: the item is no longer on today. */
  gone: "This item is no longer on today.",
} as const;
