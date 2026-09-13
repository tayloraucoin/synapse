/**
 * The block editor's strings — UX v1.1 §3.11, §3.5, §12.2, verbatim where the
 * document writes them; the rest `[COPY — needs Vesper sign-off]`.
 *
 * FIXED AND CAN MOVE ARE THE ONLY WORDS A PERSON SEES for `hard` and `soft`
 * (official spec §10.2; v1.1 §12.2 *Pin · Fixed*). The mapping happens once,
 * here, and nowhere else.
 */
import type { BlockKind } from "@syn/types";

export const BLOCK_EDITOR_COPY = {
  /* ------------------------------------------------------- the header -- */
  nameLabel: "Block name",
  nameRequired: "Name this block.",
  /** §3.11: the anchor line in muted text. */
  anchorLine: (kind: BlockKind, clock: string | null): string => {
    switch (kind) {
      case "orient":
      case "morning":
        return clock === null ? "forward from wake" : `forward from wake · ${clock}`;
      case "prep":
        return clock === null ? "backward to work" : `backward to work · ${clock}`;
      case "work":
        return clock === null ? "forward from work start" : `forward from work · ${clock}`;
      case "activity":
        return clock === null ? "forward from work end" : `forward from work end · ${clock}`;
      case "wind_down":
        return clock === null ? "backward to lights-out" : `backward to lights-out · ${clock}`;
      case "training":
      case "break":
        return "placed each morning";
    }
  },
  appliedDays: (n: number) => `Applied to ${n} ${n === 1 ? "day" : "days"} this week`,

  /* -------------------------------------------------------- the strip -- */
  empty: "Nothing here yet. Add from the library.",
  decideInTheMorning: "decide in the morning",
  oneOf: "one of",
  add: "Add",

  /* ------------------------------------------------------- the footer -- */
  /** "7:03 – 8:15 · 72 min · 0 min slack" (§3.11). */
  footer: (start: string, end: string, totalMin: number, slackMin: number) =>
    `${start} – ${end} · ${totalMin} min · ${slackMin} min slack`,
  /** "runs 8 min past work · 9:08" — muted, no colour (§3.11 overrun). */
  overrun: (minutes: number, bound: string, end: string) =>
    `runs ${minutes} min past ${bound} · ${end}`,
  footerNoClocks: (totalMin: number) => `${totalMin} min`,
  boundWord: (kind: BlockKind): string =>
    kind === "prep" ? "wake" : kind === "wind_down" ? "work end" : kind === "work" ? "work end" : kind === "activity" ? "lights-out" : "work",
  showArithmetic: "Show the arithmetic",
  /** [COPY — needs Vesper sign-off: the footer's sentence.] */
  arithmetic: (anchorWord: string, anchor: string, totalMin: number, boundWord: string, bound: string) =>
    `${anchorWord} ${anchor} · this block adds up to ${totalMin} min · ${boundWord} ${bound}.`,

  /* ------------------------------------------------------ the add sheet -- */
  addTitle: "Add from the library",
  searchLabel: "Search habits",
  habitEmpty: (query: string) => (query ? `No habits match "${query}"` : "No habits yet"),
  thisBlock: "This block",
  anywhere: "Anywhere",
  newHabit: "New habit",

  /* ------------------------------------------------------ the slot sheet -- */
  slotEditTitle: "Edit",
  habit: "Habit",
  changeHabit: "Change",
  takes: "Takes",
  /** "Usually 10–20 min" — the range as information, never a limit (R21). */
  takesRange: (min: number | null, max: number | null) =>
    min === null || max === null ? null : `Usually ${min}–${max} min`,
  gapBefore: "Gap before",
  gapPinned: "Pinned things have no gap before them.",
  at: "At",
  inTheStack: "In the stack",
  atATime: "At a time",
  pinTime: "Pinned at",
  role: "Role",
  roleOpener: "Opener",
  rolePool: "Pool",
  roleCloser: "Closer",
  priority: "Priority for this block",
  priorityHelper: (base: number) => `The habit's own is ${base}.`,
  timing: "Timing",
  fixed: "Fixed",
  canMove: "Can move",
  timingFixedHelper: "Never shortened or cut.",
  timingCanMoveHelper: "Adjust may shorten or cut it.",
  oneOfSection: "One of",
  makeOneOf: "Make it one of two",
  orTitle: "Or…",
  otherTakes: "Takes",
  defaultMember: "Default",
  removeOneOf: "Just this one",
  moveUp: "Move up",
  moveDown: "Move down",
  duplicate: "Duplicate",
  remove: "Remove",
  removed: (title: string) => `${title} removed.`,
  cancel: "Cancel",
  save: "Save",
  saveFailed: "Changes aren't saving. Check your connection.",
  offline: "Offline — you can look, but changes need a connection.",

  /* ------------------------------------- the same-position question -- */
  samePositionQuestion: (title: string) =>
    `${title} is already here. Do these happen at the same time?`,
  yesMultitask: "Yes, multitask",
  noOneOf: "No, one or the other",
  moveIt: "Move it",
} as const;
