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
  /** Cross-cutting §7.3, shown only while the day's zone differs (SYS-2). */
  zoneLabel: (city: string) => `times in ${city}`,
  shifted: (minutes: number) => `Shifted +${minutes} min`,
  notUntil: (weekday: string) => `Not until ${weekday}`,

  /* ------------------------------------ UX v1.1 §6.1 — by block (DYN-15) -- */
  /** "Viewpoint · Work 9:00" / "Work ~9:00" — the header's second line. */
  workAt: (clock: string, soft: boolean) => `Work ${soft ? "~" : ""}${clock}`,
  unstructured: "Unstructured",
  work: "Work",
  /** A pooled block before the pick — the week build's promise (§4.13). */
  setInTheMorning: "Set in the morning",
  /** UX v1.3 §5.3, §6 (DAY-12), verbatim: the pooled evening's one row. */
  chooseWhenThere: "Choose when you're there",
  /** [COPY] The pool sheet's primary — *Add 2*. */
  addChosen: (n: number) => (n === 0 ? "Add" : `Add ${n}`),
  cancel: "Cancel",
  /** *30 min* */
  minutes: (n: number) => `${n} min`,
  /** [COPY] */
  poolClosed: "This day is closed.",
  /** [COPY] */
  poolError: "Couldn't add. Try again.",
  /** [COPY — needs Vesper sign-off: items with no block, under the blocks.] */
  alsoToday: "Also today",

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

  /* ---- UX v1.2 §5.3 (RUN-13): last night as the list's first section ---- */
  lastNight: "Last night",
  /** [COPY — needs Vesper sign-off] */
  lastNightExplanation: "After the phone went away. Tick what happened.",
  confirmLastNight: "Confirm",
  lastNightError: "Couldn't save. Try again.",
} as const;
