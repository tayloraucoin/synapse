/**
 * IT-01, DH-01 and DH-02's strings — Epic 2 §3 and §4, verbatim.
 */
export const ITEM_COPY = {
  /* ------------------------------------------------------------ IT-01 -- */
  typeHabit: "habit",
  typeTask: "task",
  typeDeepWork: "deep work",

  at: (clock: string) => `at ${clock}`,
  between: (start: string, end: string) => `between ${start} and ${end}`,
  anytime: "anytime",
  minutes: (n: number) => `${n} min`,
  fixed: "Fixed",

  doneAt: (clock: string) => `done ${clock}`,
  doneMovedFrom: (clock: string, from: string) =>
    `done ${clock} — moved from ${from}`,
  carriedFrom: (weekday: string) => `carried from ${weekday}`,
  notToday: "not today",
  timerRunning: (elapsed: string) => `timer running · ${elapsed}`,
  timeLogged: (minutes: number, sessions: number) =>
    `time logged: ${minutes} min in ${sessions} ${sessions === 1 ? "session" : "sessions"}`,

  notTodayAction: "Not today",
  /* -------------------------------------- UX v1.1 §6.3 (DYN-15) -- */
  doNow: "Do now",
  /** "Stretch no longer fits before work" — the one line on overflow. */
  overflowLine: (title: string) => `${title} no longer fits`,
  doNowAnyway: "Do now anyway",
  adjustInstead: "Adjust instead",
  editTodays: "Edit today's",
  oneOf: "One of",
  /** UX v1.2 §3.5 (RUN-13): the version control's name. */
  version: "Version",
  backInTheList: "Back in the list",
  done: "Done",
  undoDone: "Undo done",

  /** The swap toast when starting a timer displaces another. */
  stoppedOther: (title: string) => `Stopped ${title}`,

  /**
   * A write that failed. Epic 2 §4 gives this sentence for the sheet, where
   * the point is that nothing typed is thrown away.
   */
  saveError: "Couldn't save. Your changes are kept — try again.",

  /* ------------------------------------------- IT-02, and USE-4's additions */
  addTimeByHand: "Add time by hand",
  addTime: "Add time",
  editTime: "Edit time",
  from: "From",
  to: "To",
  /** The computed line while the range is not yet valid. `minutes` is above. */
  noDuration: "—",
  removeThisSession: "Remove this session",
  /**
   * The undo toast after a session is deleted. The document says "deletes with
   * a 5-second undo toast" without naming the label.
   *
   * [COPY — needs Vesper sign-off]
   */
  removedSession: "Removed session",

  /** Cross-cutting §9.3 G1 — a one-off's two actions, and the line instead. */
  editOneOff: "Edit",
  removeOneOff: "Remove",
  fromTemplate: (name: string) => `From ${name}`,
  /**
   * A template-derived item materialised before `0002` has no snapshot to
   * name. It still came from a template, and saying so is better than saying
   * nothing where an explanation belongs.
   *
   * [COPY — needs Vesper sign-off]
   */
  fromATemplate: "From a template",
  archived: "archived",
  removeTitle: (title: string) => `Remove ${title} from today?`,
  /** §8.2 — on a reviewed day, the dialog names what the item was. */
  removeReviewedTitle: (title: string, date: string, outcome: string) =>
    `Remove ${title} from ${date}? It was ${outcome}.`,
  keep: "Keep",
  removed: (title: string) => `Removed ${title}`,

  /* ------------------------------------------------------------ DH-01 -- */
  setWakeTime: "Set wake time",
  lessTimeToday: "I have less time today",
  shiftMyDay: "Shift my day",
  addOneOff: "Add a one-off",
  close: "Close",
  wakeTimeNotSet: "Wake time not set",
  woke: (clock: string) => `Woke ${clock}`,
  startsAt: (clock: string) => `starts ${clock}`,
  closedAt: (clock: string) => `Closed at ${clock}`,

  /* ------------------------------------------------------------ DH-02 -- */
  wakeTime: "Wake time",
  wokeAt: "Woke at",
  wakeUnset: "Marking your wake-up habit done sets this on its own. Or set it here.",
  wakeByAnchor: (clock: string, habit: string) =>
    `Set at ${clock} by ${habit}.`,
  wakeByHand: "Set by hand.",
  clear: "Clear",
  cancel: "Cancel",
  save: "Save",
} as const;
