/**
 * The orient frame's strings — UX v1.2 §5.2 (R41), v1.1 §5.2, verbatim.
 * Every one is adjustable by the document's own note; none is about the
 * person. No glyph in here (R29).
 *
 * THE ONE TRANSFORMATION. *What I want to make happen tomorrow* is read back
 * as *What I want to make happen today* — "the only transformation the app
 * performs on the person's words, and it changes one word". The other two
 * prompts are read back as written.
 */
export const ORIENT_COPY = {
  lastNight: "Last night",
  everyMorning: "Every morning",
  /** The chrome caption above a quote-day slide (§5.2). */
  aQuote: "A quote",
  /** The carousel's region name. */
  todaysReading: "Today’s reading",
  /** The re-tensed prompt for the first line. */
  makeHappenToday: "What I want to make happen today",
  nothingYet: "Nothing to read yet. A passage, or tonight’s journal, shows up here tomorrow.",
  gratitude: "Grateful for, this morning",
  intention: "Today’s intention",
  visualisation: "Today, as I see it",
  start: "Start the morning",
  /** R18 — one fact, no adjective, no question mark. */
  skippedYesterday: "Skipped yesterday too.",
} as const;
