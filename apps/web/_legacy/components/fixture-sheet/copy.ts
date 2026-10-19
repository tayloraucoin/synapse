/**
 * The fixture sheet's strings — UX v1.1 §4.4, §3.6, verbatim where the
 * document writes them; the rest `[COPY — needs Vesper sign-off]`.
 */
export const FIXTURE_SHEET_COPY = {
  /** The sheet-scoped noun (UX v1.2 §4, the frame rules). */
  addTitle: "A fixture",
  editTitle: "Edit",
  /** UX v1.2 §4.4, R42 — the kind chips and the glyph's control. */
  kind: "Kind",
  chooseAnIcon: "Choose an icon",
  title: "What is it",
  titlePlaceholder: "",
  days: "Which days",
  at: "At",
  forLabel: "For",
  /** UX v1.3 §4.4 B6, R51 — *Where*: here or away, then the place and the travel. */
  where: "Where",
  here: "Here",
  away: "Away",
  place: "Place",
  placePlaceholder: "The clinic, the studio, the office…",
  gettingThere: "Getting there",
  gettingBack: "Getting back",
  planForTheTravel: "Plan for the travel",
  /** [COPY] v1.3 §4.4 B6, §13 #40 — for Taylor's read. */
  planForTheTravelLine: "Kept beside it, never added to it. Either trip can be dropped on the day.",
  /**
   * [COPY — needs Vesper sign-off] The block segment's name. v1.3 gives *Where*
   * to *Here · Away* and leaves *In work · In the evening* unlabelled; a
   * segmented control still needs a name.
   */
  partOfTheDay: "Part of the day",
  inWork: "In work",
  inTheEvening: "In the evening",
  save: "Save",
  cancel: "Cancel",
  /** [COPY — needs Vesper sign-off] */
  saveError: "Couldn't save. Nothing changed — try again.",
  /** "Stand-up · Tue · 9:30 · 20 min" — the row's meta line (§4.4). */
  rowMeta: (days: string, at: string, minutes: number) => `${days} · ${at} · ${minutes} min`,
  edit: "Edit",
  remove: "Remove",
  /** The weekday abbreviations, Monday first — the row's day list. */
  dayShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const,
} as const;
