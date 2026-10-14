/**
 * Orient's words (USE-12; D-USE-9, the index's Words, by Gloss). None names
 * a time, a count or the person; none is red. They replace the built "Every
 * morning", "Grateful for, this morning", "Today's intention", "Last night"
 * as a row and "Start the morning" (D-USE-9), and the built "Working
 * today?", the work label and "Skipped yesterday too." go with them
 * (D-USE-63).
 */
export const ORIENT_COPY = {
  title: "Good morning",
  /** The carousel's region name. */
  reading: "Morning reading",
  readAll: "Read all",
  /** "Read all, <passage title>": the button's name. */
  readAllNamed: (title: string) => `Read all, ${title}`,
  beforeTheDay: "Before the day",
  grateful: "Grateful for",
  intention: "Intention",
  todayAsISeeIt: "Today, as I see it",
  lastNight: "Read last night's reflections",
  review: "Review the day",
  nothingYet: "Nothing to read yet. A passage shows up here once one is added.",
  readingFailed: "This morning's reading didn't load.",
} as const;
