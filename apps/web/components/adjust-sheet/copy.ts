/**
 * Adjust's strings — UX v1.1 §6.6, verbatim where the document writes them;
 * the rest `[COPY — needs Vesper sign-off]`.
 *
 * WHAT IS NEVER HERE (§6.6, §12.3): the tier's words, and the three words
 * the document names for the sheet's tone. The reason chip carries its tier
 * to the record; the sheet never says it.
 */
export const ADJUST_COPY = {
  title: "Adjust",
  /** "the morning" · "the evening" — from `adjust.scope`. */
  scopeWord: (label: "morning" | "evening" | "day") =>
    label === "morning" ? "the morning" : label === "evening" ? "the evening" : "the day",

  /* ------------------------------------------------- 1 · what happened -- */
  whatHappened: "What happened",

  /* ---------------------------------------------------- 2 · what gives -- */
  whatGives: "What gives",
  startWorkLater: "Start work later",
  startWorkLaterBody: (clock: string) => `Work moves to ${clock}; everything slides.`,
  keepWork: (clock: string) => `Keep work at ${clock}`,
  /** [COPY] */
  keepWorkBody: "The morning gives.",

  /* ------------------------------------------------------------ 3 · how -- */
  how: "How",
  shorten: "Shorten everything",
  shortenBody: "Each thing to the short end of its range; then the lowest priorities go.",
  cut: "Cut some",
  cutBody: "The lowest priorities go; everything else keeps its length.",
  choose: "Choose what stays",
  chooseBody: "Tap the list.",

  /* --------------------------------------------------- 4 · the proposal -- */
  proposal: "The proposal",
  fits: (clock: string) => `Fits. Work at ${clock}.`,
  moves: (clock: string) => `Work moves to ${clock}.`,
  /** The doesn't-fit-even-cut state: Set is still allowed. */
  nothingLeft: (clock: string) => `Nothing soft is left to cut. Work runs to ${clock} on this plan.`,
  /** "Stand-up 9:30 stays; the walk doesn't fit before it." */
  keptHard: (kept: string, item: string) => `${kept} stays; ${item} doesn't fit before it.`,
  /** "Breath work · 10 min · 8:12" */
  row: (title: string, minutes: number, clock: string) => `${title} · ${minutes} min · ${clock}`,
  shortened: "shortened",
  notAssignedToday: "Not assigned today",
  keepInstead: "Keep instead",
  set: "Set",
  setNotAssigned: (n: number) => `Set · ${n} not assigned`,
  setWorkAt: (clock: string) => `Set · work ${clock}`,
  cancel: "Cancel",

  /* --------------------------------------------------------- the states -- */
  error: "Couldn't adjust. Nothing changed — try again.",
  offline: "Offline — you can look, but adjusting needs a connection.",
  /** [COPY] The undo toast; what comes back is DYN-6's (b): cuts and the slide. */
  applied: (cut: number, slideMin: number) =>
    cut > 0 && slideMin > 0
      ? `Adjusted — ${cut} not assigned, work moved.`
      : cut > 0
        ? `Adjusted — ${cut} not assigned.`
        : slideMin > 0
          ? "Adjusted — work moved."
          : "Adjusted.",
  undo: "Undo",
  undone: "Put back.",
} as const;
