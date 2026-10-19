/**
 * Review the day's words (USE-31; review-the-day/words-and-access.md). No
 * second person, no counts of items, no "missed", "late" or "behind".
 */
export const REVIEW_DAY_COPY = {
  title: "Review the day",
  /** The breadcrumb's word, and its accessible name. */
  back: "Orient",
  backLabel: "Back to Orient",
  readyGo: "Ready, go",
  /** Ready, go's disabled form while the day is read. */
  loading: "Loading the day",
  /** The day's own failure, in the column (USE-34; error.md). */
  dayFailed: "The day didn't load.",
  /** [placeholder] in error.md. */
  dayFailedDetail: "Nothing is lost. The plan is still there once it loads.",
  /** One StatusLine under the header (offline.md). */
  offline: "Offline. Changes are saved on this phone and sync later.",
} as const;
