import { SHIFT_MAX, SHIFT_MIN } from "@syn/constants";

/**
 * SF-01's strings — Epic 2 §6, official spec §5.6.
 *
 * NOTHING HERE SCOLDS. A person opening this sheet already knows they are
 * behind; the product's job is to help them re-plan, not to observe that the
 * morning went badly. *Running late?* is the only question mark, it is inside
 * an offer, and the answer is a button that does something useful.
 *
 * THE PRIMARY'S LABEL CARRIES THE CONSEQUENCE. *Shift and cut 2* rather than
 * *Confirm*: the count is in the button because cutting two items is the part
 * a person needs to have understood before they press it.
 */
export const SHIFT_COPY = {
  title: "Shift my day",

  /* ------------------------------------------------------ step 1 — amount -- */
  step: (n: number) => `${n} of 3`,
  amountQuestion: "By how much?",
  custom: "Custom",
  minutesUnit: "min",
  amountError: `Between ${SHIFT_MIN} and ${SHIFT_MAX} minutes.`,
  plusMinutes: (n: number) => `+${n}`,

  /* ------------------------------------------------------ step 2 — reason -- */
  reasonQuestion: "Why?",
  /** Muted, under the reason rows — the inheritance rule, said once (§6.5). */
  reasonInherits: "Items cut by this shift get this reason.",

  /* --------------------------------------------------------- step 3 — fit -- */
  fitHeading: "What changes",
  /** "4 flexible items move +60 min. Fixed items stay." */
  moveSummary: (count: number, delta: number) =>
    `${count} flexible ${count === 1 ? "item moves" : "items move"} +${delta} min. Fixed items stay.`,
  doneStay: (count: number) =>
    `${count} done ${count === 1 ? "item stays" : "items stay"} where ${count === 1 ? "it was" : "they were"}.`,
  everythingFits: "Everything still fits.",
  /** "2 items no longer fit before Dentist" / "… before the day closes" */
  noLongerFit: (count: number, anchor: string) =>
    `${count} ${count === 1 ? "item no longer fits" : "items no longer fit"} before ${anchor}`,
  theDayCloses: "the day closes",

  /* --------------------------------------------------------------- footer -- */
  shift: "Shift",
  shiftAndCut: (count: number) => `Shift and cut ${count}`,
  cancel: "Cancel",

  applyError: "Couldn't shift. Nothing changed — try again.",

  /* ----------------------------------------------------------- the toast -- */
  shifted: (delta: number) => `Shifted +${delta} min`,
  undo: "Undo",

  /* -------------------------------------------------------------- SC-02 -- */
  undoThisShift: "Undo this shift",
  /** [COPY — needs Vesper sign-off; not in the document.] */
  undoRefused: "This shift can't be undone now.",

  /* --------------------------------------------------- the late offer -- */
  lateOffer: "Running late?",
  shiftTheDay: "Shift the day",
  dismissForToday: "Dismiss for today",
} as const;
