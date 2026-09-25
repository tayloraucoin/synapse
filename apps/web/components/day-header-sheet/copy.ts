/** The day header sheet's rows — UX v1.1 §6.2, verbatim. */
export const DAY_HEADER_SHEET_COPY = {
  adjustTheDay: "Adjust the day",
  setWakeTime: "Set wake time",
  addFromLibrary: "Add from the library",
  addOneOff: "Add a one-off",
  editToday: "Edit today",
  close: "Close",
  /* ---- UX v1.3 §3.9, §6, R49 (DAY-12): a *Usually* or a *Rarely* day ---- */
  workingToday: "Working today",
  /** v1.3 §3.9, verbatim — on a *Usually* day, and on a *Rarely* day after *Working today*. */
  notWorkingToday: "Not working today",
  /** *as Day A* — a plan's work, applied to today (v1.3 §3.8). */
  workingTodayAs: (name: string) => `as ${name}`,
  /** [COPY] The plan sheet's group heading. */
  whichPlan: "Your days",
  /** [COPY] */
  noPlans: "No days with work yet",
  /* --------------------------------------------- the library pick sheet -- */
  /** [COPY — needs Vesper sign-off] */
  pickTitle: "Add from the library",
  pickSearch: "Search habits",
  pickEmpty: "No habits yet",
  anywhere: "Anywhere",
  /** Which block it lands in. */
  into: "Into",
  noBlock: "The day",
  offline: "Offline — you can look, but adding needs a connection.",
} as const;
