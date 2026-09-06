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
