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

  /** The ST-06 tier headings' phrases — official spec §10.2, verbatim. */
  tierPhrase: {
    circumstance: "done for the record",
    scoping: "half",
    chose_not_to: "missed",
  },

  /* ------------------------------------------------------------ SC-01 -- */
  closed: "closed",
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
