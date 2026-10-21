/**
 * Making the checklist's words (USE-40; sunday-making-the-checklist.md). No
 * second person, no count of rows.
 */
export const REVIEW_CHECKLIST_COPY = {
  /** The editor's region: "Sunday, checklist". */
  region: (name: string) => `${name}, checklist`,
  allDay: "Checklist · all day",
  setTime: "Set a time",
  starts: "Starts",
  ends: "Ends",
  set: "Set",
  /** The typed row's name. */
  field: "Next item",
  helper: "Return adds the next one. Drag to reorder later.",
  done: "done",
  /** A row whose write failed: it is taken back out (optimistic rollback). */
  notSaved: { notSaved: "Not saved.", tryAgain: "Try again" },
  /** Set a time's first span [ASSUMPTION: the Now checklist board's]. */
  defaultSpan: { startsAt: "10:00", endsAt: "13:00" },
} as const;
