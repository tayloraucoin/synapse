/** The day header sheet's rows — UX v1.1 §6.2, verbatim. */
export const DAY_HEADER_SHEET_COPY = {
  adjustTheDay: "Adjust the day",
  setWakeTime: "Set wake time",
  addFromLibrary: "Add from the library",
  addOneOff: "Add a one-off",
  editToday: "Edit today",
  close: "Close",
  /* ---- UX v1.2 §3.9, R40 (RUN-13): a *Rarely* day ---- */
  workingToday: "Working today",
  notWorkingAfterAll: "Not working after all",
  /** [COPY] The type sheet's group heading. */
  whichType: "Which kind of day",
  noTypes: "No work-day types yet",
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
