/**
 * LS-00…03's strings — Epic 2 §2 and official spec §10.5, verbatim.
 *
 * There is no greeting, no encouragement, and no number about the day here.
 * That absence is the screen's design, not an omission: official spec §2.4
 * forbids a count, a percentage, or a progress mark on an execution tab, and a
 * copy file is where such a thing would first appear.
 */
export const DAY_LIST_COPY = {
  /* ------------------------------------------------------------ LS-01 -- */
  undo: "Undo",
  noTemplate: "No template",
  wokeAt: (clock: string) => `Woke ${clock}`,
  shifted: (minutes: number) => `Shifted +${minutes} min`,
  notUntil: (weekday: string) => `Not until ${weekday}`,

  dayComplete: "Day Complete",
  dayClosedAt: (clock: string) => `Day closed at ${clock}`,
  review: "Review",

  /* ------------------------------------------------------------ LS-02 -- */
  notAssigned: "Not assigned today",
  notAssignedExplanation: (capacityMin: number) =>
    `Trimmed to fit ${capacityMin} min. These don't count.`,
  bringBack: "Bring back",

  /* ------------------------------------------------------------ LS-03 -- */
  cutWhenShifted: "Cut when shifted",
  /** "Shifted +45 min at 10:20 — Something came up." */
  cutExplanation: (minutes: number, clock: string, reason: string) =>
    `Shifted +${minutes} min at ${clock} — ${reason}.`,
  doItAnyway: "Do it anyway",

  /* ------------------------------------------------------------ LS-00 -- */
  nothingPlanned: "Nothing planned today.",
  planThisDay: "Plan this day",
  addOneOff: "Add a one-off",
  applyTemplate: (name: string) => `Apply ${name}`,
  appliedTemplate: (name: string) => `Applied ${name}`,
  /**
   * A past day that was never planned. The document has no sentence for it —
   * LS-00's line is about today, and offering to plan yesterday would be
   * offering to rewrite a record.
   *
   * [COPY — needs Vesper sign-off]
   */
  nothingWasPlanned: "Nothing was planned.",

  /* -------------------------------------------------------- the states -- */
  loadError: "Couldn't load today. Pull to try again.",
  /**
   * A failed write. LS-01 gives the load error but nothing for a save that
   * came back wrong; the row has already reverted by the time this is read.
   *
   * [COPY — needs Vesper sign-off]
   */
  saveError: "Couldn't save. Try again.",
  /**
   * Announced while a pull-to-refresh is in flight. The document describes the
   * gesture but names no text for it.
   *
   * [COPY — needs Vesper sign-off]
   */
  refreshing: "Refreshing…",
} as const;
