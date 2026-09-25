/**
 * The landscape chooser's strings — UX v1.2 §4.8 (RUN-10), v1.1 §4.8,
 * verbatim where the document writes them; the rest `[COPY — needs Vesper
 * sign-off]`. No glyph in here (R29): the rows' glyphs are the seeds'.
 *
 * No minutes total, no fit, no "of 72" — by rule. The screen is the data
 * bank; the ranking is screen 9's job.
 */
export const LANDSCAPE_COPY = {
  tabRecommended: "Recommended",
  tabAll: "All",
  groupBody: "Body",
  groupMind: "Mind",
  /**
   * The *All* tab's groups — the morning's four (v1.3 R66, §4.4 B9) and free
   * time's five (R50, B15a) — and the person's own, `[COPY]` for *Your own*.
   */
  groups: {
    body: "Body",
    mind: "Mind",
    practice: "Practice",
    home: "Home",
    move: "Move",
    make: "Make",
    connect: "Connect",
    rest: "Rest",
    tend: "Tend",
  },
  groupOwn: "Your own",
  /** Free time's *Recommended* headings (v1.3 §4.4 B15a). */
  groupMove: "Move",
  groupRest: "Rest",
  /** [COPY] The search's result, read politely — *4 habits match* / *4 activities match*. */
  matches: (n: number, activity = false) =>
    activity
      ? `${n} ${n === 1 ? "activity matches" : "activities match"}`
      : `${n} ${n === 1 ? "habit matches" : "habits match"}`,
  /** [COPY] */
  noActivitiesMatch: (query: string) => `No activities match "${query}"`,
  range: (min: number, max: number) => `${min}–${max} min`,
  addYourOwn: "Add your own",
  searchLabel: "Search",
  searchPlaceholder: "Search the list",
  noMatches: (query: string) => `No habits match "${query}"`,
  inLibrary: "in your library",
  /** [COPY] The one line after a rejected tick: *Couldn't save Breakfast. Try again.* */
  saveError: (title: string) => (title === "" ? "Couldn’t save. Try again." : `Couldn’t save ${title}. Try again.`),
  /** The library's sheet (LB-01's empty state). */
  sheetTitle: "Start with what you do",
  done: "Done",
} as const;
