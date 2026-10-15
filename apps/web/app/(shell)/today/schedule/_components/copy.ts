/**
 * Schedule's words (USE-27; day/schedule/words-and-access.md). It states
 * facts and asks nothing: no second person, no counts of what is done or
 * left, no "missed". The date, block names and spans are the day column's.
 */
export const SCHEDULE_COPY = {
  title: "Schedule",
  /** The column's region while it waits, by its name only. */
  loading: "The day, loading",
  /** The day's region failed (error.md). */
  dayFailed: "The day didn't load.",
  dayFailedDetail: "Nothing is lost. The plan is still there once it loads.",
  /** The one status line with no connection (offline.md). */
  offline: "Offline. Changes are saved on this phone and sync later.",
  /** The empty day's three choices (D-USE-68, as Review the day's Sunday). */
  empty: {
    title: (weekday: string) => `Nothing set for ${weekday}.`,
    line: "A loose day can be one list, done in any order.",
    checklist: "Make a checklist",
    checklistLine: "Things to get through today. No times.",
    blocks: "Plan with blocks",
    blocksLine: "Times on the rail, like a weekday.",
    copy: "Copy another day",
  },
} as const;
