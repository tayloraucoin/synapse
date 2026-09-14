/**
 * SC-01 and SC-02's strings — Epic 2 §5.
 *
 * THE ONLY NUMBERS HERE ARE TIMES AND DURATIONS. The Schedule is an execution
 * tab (official spec §2.4), so there is no count of the day, no percentage and
 * no progress — the axis labels are clocks and the shift band's `+45 min` is a
 * duration.
 */
export const SCHEDULE_COPY = {
  /* ------------------------------------------------------------ SC-02 -- */
  shiftedTitle: (deltaMin: number) => `Shifted +${deltaMin} min`,
  at: (clock: string) => `At ${clock}`,
  reason: (label: string) => `Reason: ${label}`,
  countsAs: (phrase: string) => `Counts as: ${phrase}`,
  cut: (titles: string) => `Cut: ${titles}`,
  nothingWasCut: "Nothing was cut.",
  close: "Close",
  /** The record's one action, while it would be a true reversal (cross-cutting §8.1). */
  undoThisShift: "Undo this shift",
  undoRefused: "This shift can't be undone now.",

  /** The ST-06 tier headings' phrases — official spec §10.2, verbatim. */
  tierPhrase: {
    circumstance: "done for the record",
    scoping: "half",
    chose_not_to: "missed",
  },

  /* ------------------------------------------------------------ SC-01 -- */
  closed: "closed",

  /* ------------------------------------------ UX v1.1 §6.5, §10.1 (DYN-16) -- */
  /** §6.5's refused line — the service says it too. */
  fixedThingsDontMove: "Fixed things don't move by drag.",
  /** The pin's dialog (R22): *Move Dentist to 3:15?* */
  movePinTitle: (title: string, time: string) => `Move ${title} to ${time}?`,
  move: "Move",
  cancel: "Cancel",
  /** §10.1's unconfirmed day: a centred line with a link. */
  setTheDayFirst: "Set the day first",
  /** [COPY] The move-mode caption (§10.4's long-press fallback). */
  moveModeCaption: "Tap a block to lift it; tap again to drop it.",
  /** [COPY] A write that failed for a reason other than a pin. */
  couldntMove: "Couldn't move that. Nothing changed — try again.",
} as const;

/*
 * THERE IS NO *{n} WITHOUT A TIME* LINE.
 *
 * The ticket raises one and then rules that it must not be built until Vesper
 * signs it: the documents place unscheduled items nowhere on the Schedule and
 * say nothing about them. Their home is the List's *Anytime* section, and
 * inventing a line here would put a second, unreviewed answer on the screen.
 *
 * [COPY — needs Vesper sign-off: whether the Schedule acknowledges unscheduled
 * items at all, and in what words.]
 */
