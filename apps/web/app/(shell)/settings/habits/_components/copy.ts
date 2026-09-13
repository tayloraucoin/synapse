/**
 * LB-01's strings — Epic 1 §3 and §11, verbatim.
 */
export const LIBRARY_COPY = {
  title: "Habits",
  add: "Add",

  searchLabel: "Search habits",
  searchPlaceholder: "Search habits",
  noMatches: (query: string) => `No habits match "${query}"`,

  /** The three groups, in this fixed order (Epic 1 LB-01 read 3). */
  /** UX v1.1 §4.15: grouped by block first — the five habit-holding words. */
  groupMorning: "Morning",
  groupBeforeWork: "Before work",
  groupBreak: "Break",
  groupWindDown: "Wind-down",
  groupAnywhere: "Anywhere",
  /** [COPY] The rows in a block with no category, when the person uses them. */
  groupNoCategory: "No category",

  range: (min: number, max: number) => `${min}–${max} min`,
  importance: (value: number) => `importance ${value}`,
  wakeUpTag: "wake-up",

  rowMenuLabel: (title: string) => `More actions for ${title}`,
  duplicate: "Duplicate",
  archive: "Archive",
  restore: "Restore",
  keep: "Keep",

  archiveTitle: (title: string) => `Archive ${title}?`,
  /**
   * The first sentence is the document's. The template line is added only when
   * the habit is in one or more. The anchor line is marked: Epic 1 LB-01 says
   * "Archiving the wake anchor clears the anchor and says so in the body"
   * without giving the sentence.
   *
   * [COPY — needs Vesper sign-off: the wake-anchor clause.]
   */
  archiveBody: (templateCount: number, isWakeAnchor: boolean) => {
    const parts = [
      "It leaves your templates and the library. Past days keep their record.",
    ];
    if (templateCount > 0) {
      parts.push(
        `It's in ${templateCount} ${templateCount === 1 ? "template" : "templates"} and will be removed from them.`,
      );
    }
    if (isWakeAnchor) {
      parts.push("It's your wake-up habit; archiving clears that.");
    }
    return parts.join(" ");
  },

  emptyText: "No habits yet.",
  emptyAddHabit: "Add a habit",
  emptyStarterSet: "Start from a small set",

  /** Epic 1 §11 — the list family's error line, verbatim on every breakpoint. */
  loadError: "Couldn't load. Pull to try again.",
} as const;

/** LB-03's strings. */
export const HABIT_DETAIL_COPY = {
  inTemplates: "In templates",
  noTemplates: "Not in any templates yet.",
  recentDays: "Recent days",
  slot: (offsetStartMin: number | null, durationMin: number) =>
    offsetStartMin === null
      ? `${durationMin} min`
      : `+${offsetStartMin} min · ${durationMin} min`,
  priority: (value: number) => `priority ${value}`,
  overridden: "overridden",
} as const;
