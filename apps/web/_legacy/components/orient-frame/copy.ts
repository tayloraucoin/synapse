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
  /* ---- UX v1.2 §5.2, R37 (RUN-13): the primary under *Set from the plan* ---- */
  /** *Start the morning · work 9:00* — the anchor rides on the label when it holds. */
  startWithAnchor: (clock: string) => `Start the morning · work ${clock}`,
  /** A *Sometimes* day: the one question mark the frame carries (§5.2, verbatim). */
  startWorkingToday: "Start the morning · working today?",
  /** The two-row dialog. */
  workingTodayTitle: "Working today?",
  working: "Working",
  notToday: "Not today",
  /** [COPY] The words saved, the set refused. */
  setFailed: "Couldn’t set the day. The words are saved.",
  /** The standard line; the set needs a connection. */
  offline: "Offline — you can look, but changes need a connection.",
} as const;
