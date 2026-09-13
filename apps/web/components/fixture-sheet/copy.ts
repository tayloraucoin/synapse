/**
 * The fixture sheet's strings — UX v1.1 §4.4, §3.6, verbatim where the
 * document writes them; the rest `[COPY — needs Vesper sign-off]`.
 */
export const FIXTURE_SHEET_COPY = {
  addTitle: "Add one",
  editTitle: "Edit",
  title: "What is it",
  titlePlaceholder: "",
  days: "Which days",
  at: "At",
  forLabel: "For",
  where: "Where",
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
