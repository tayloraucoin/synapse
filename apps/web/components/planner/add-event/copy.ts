import { clock } from "../new-block-sheet/copy";

/**
 * Add event's words (USE-53; interactions/add-event.md, set-my-days'
 * add-event.md, event-inside-work.md, event-own-block.md). No second
 * person; times as the boards write them ("9:30", "11:00").
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

const SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export { clock };

/** "11:00 to 11:30" */
export function span(startsAt: string, endsAt: string): string {
  return `${clock(startsAt)} to ${clock(endsAt)}`;
}

export const ADD_EVENT_COPY = {
  /** The phone sheet (D-USE-102). */
  addEvent: "Add event",
  /** "Mon 12 · this date only" */
  scope: (weekday: number, dateKey: string) =>
    `${SHORT[weekday]} ${Number(dateKey.slice(8, 10))} · this date only`,
  /** The desk popover: "New event · Wednesday 14". */
  newEvent: (weekday: number, dateKey: string) =>
    `New event · ${WEEKDAYS[weekday]} ${Number(dateKey.slice(8, 10))}`,
  /** "+ Event" on a day head, and its name. */
  plusEvent: "+ Event",
  plusEventName: (weekday: number, dateKey: string) =>
    `Add an event on ${WEEKDAYS[weekday]} ${Number(dateKey.slice(8, 10))}`,
  close: "Close",
  name: "Name",
  icon: (word: string | null) => (word ? `Icon, ${word}` : "Icon, none"),
  tag: "Tag",
  work: "Work",
  personal: "Personal",
  starts: "Starts",
  ends: "Ends",
  length: "Length",
  earlier: (field: string) => `Earlier, ${field}`,
  later: (field: string) => `Later, ${field}`,
  shorter: "Shorter",
  longer: "Longer",
  minutes: (n: number) => `${n} min`,
  colour: "Colour",
  plum: "Plum, for events",
  colourName: "Colour, plum, for events",
  notes: "Notes (optional)",
  client: "Client",
  noClient: "No client",
  repeats: "Repeats",
  doesNotRepeat: "Does not repeat",
  nameNeeded: "Name needed",
  /** Editing a Synapse event (D-USE-42) [ASSUMPTION: the form filled]. */
  save: "Save",
  deleteEvent: "Delete event",
  notAdded: "Not added.",
  tryAgain: "Try again",

  /* ---- the landing line, above Add ---- */
  /** Phone: "Sits inside Work at 11:00 as a band." */
  insideAt: (block: string, at: string) =>
    `Sits inside ${block} at ${clock(at)} as a band.`,
  /** Desk: "Sits inside Work, 13:00 to 15:00." */
  insideSpan: (block: string, startsAt: string, endsAt: string) =>
    `Sits inside ${block}, ${span(startsAt, endsAt)}.`,
  /** "The work around it moves: [Review the Paper handoff] starts at 11:30." */
  moves: (moves: readonly { title: string; to: string }[]) =>
    `The work around it moves: ${moves
      .map((move, index) =>
        index === 0
          ? `${move.title} starts at ${clock(move.to)}`
          : `${move.title} at ${clock(move.to)}`,
      )
      .join(", ")}.`,
  /** Desk: "Nothing moves: that block has room until 15:00." */
  roomUntil: (endsAt: string) =>
    `Nothing moves: that block has room until ${clock(endsAt)}.`,
  /** Phone, nothing to move [ASSUMPTION: not drawn]. */
  nothingMoves: "Nothing moves.",
  /** No room at all: Make room's engine decides (USE-35) [ASSUMPTION]. */
  noRoom: (block: string) =>
    `${block} has no room left for its work: Make room decides what gives.`,
  /** In no block [ASSUMPTION: as add-event.md's words]. */
  ownBlock: (startsAt: string, endsAt: string) =>
    `Stands as its own block, ${span(startsAt, endsAt)}.`,

  /* ---- after Add ---- */
  addedInside: (block: string, at: string) =>
    `Added inside ${block}, ${clock(at)}`,
  addedOwn: (title: string) => `${title} added as its own block`,
  /** [ASSUMPTION] Save and Delete name what they did, Delete with Undo. */
  saved: (title: string) => `${title} saved`,
  deleted: (title: string) => `${title} deleted`,
  /** The own block's line: "15:30 to 16:15 · Personal · this Monday only". */
  ownMeta: (
    startsAt: string,
    endsAt: string,
    tag: "work" | "personal",
    weekday: number | null,
  ) =>
    [
      span(startsAt, endsAt),
      tag === "work" ? "Work" : "Personal",
      ...(weekday === null ? [] : [`this ${WEEKDAYS[weekday]} only`]),
    ].join(" · "),
  /** A band's or own block's button: "Design review, 11:00 to 11:30, event". */
  eventName: (title: string, startsAt: string, endsAt: string) =>
    `${title}, ${span(startsAt, endsAt)}, event`,
} as const;
