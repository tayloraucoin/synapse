/**
 * The landscape chooser's strings — UX v1.1 §4.8, verbatim where the
 * document writes them; the rest `[COPY — needs Vesper sign-off]`.
 *
 * No minutes total, no fit, no "of 72" — by rule. The screen is the data
 * bank; the fit is screen 12's job.
 */
export const LANDSCAPE_COPY = {
  tabRecommended: "Recommended",
  tabAll: "All",
  tabSelected: (n: number) => `Selected (${n})`,
  groupBody: "Body",
  groupMind: "Mind",
  range: (min: number, max: number) => `${min}–${max} min`,
  addYourOwn: "Add your own",
  searchLabel: "Search",
  searchPlaceholder: "Search the list",
  noMatches: (query: string) => `No habits match "${query}"`,
  nothingSelected: "Nothing yet — tick what you do, or want to.",
  priority: "Priority",
  length: "Length",
  inLibrary: "in your library",
  /** The library's sheet (LB-01's empty state). */
  sheetTitle: "Start with what you do",
  add: (n: number) => (n === 0 ? "Add" : `Add ${n}`),
  cancel: "Cancel",
} as const;
