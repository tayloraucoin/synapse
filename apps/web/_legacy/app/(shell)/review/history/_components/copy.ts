/**
 * HS-01's strings — Epic 3 §4.
 *
 * FOUR STATUS WORDS, AND NONE OF THEM IS A FAILURE. *nothing assigned* is a day
 * nobody planned, and it is deliberately distinguished from *not reviewed* so
 * the history never implies someone skipped a review they were never owed.
 * *pending* is a closed day with decisions still to make — an invitation, not a
 * reproach. Epic 3 §6's never-list applies here as much as to the review.
 *
 * A NUMBER APPEARS ONLY WHERE ONE WAS EARNED. A week shows a percent only once
 * it has a reviewed day in it; before that it says how many of its days have
 * been reviewed, which is a count of things rather than a score.
 */
export const HISTORY_COPY = {
  title: "History",

  /** Day statuses — REV-1's four, in the person's words. */
  pending: "pending",
  notReviewed: "not reviewed",
  nothingAssigned: "nothing assigned",
  percent: (value: number) => `${value}%`,

  /** "3 of 5 reviewed" — an open week, counting days rather than scoring them. */
  weekOpen: (reviewed: number, planned: number) =>
    `${reviewed} of ${planned} reviewed`,

  showEarlier: "Show earlier weeks",

  exportEverything: "Export everything",
  exportLine: "Your whole record, as files.",

  empty: "No history yet — it starts with your first reviewed day.",
  loadError: "Couldn't load. Try again.",
} as const;
