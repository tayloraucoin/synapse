/**
 * FR-01…05's strings — Epic 1 §2, verbatim.
 *
 * The three FR-05 bodies are the whole reason this file is not five inline
 * literals: which one a person reads is a decision about what they actually
 * did, and that decision belongs next to the sentences it chooses between.
 */
export const SETUP_COPY = {
  /* ------------------------------------------------------------ frame -- */
  progress: (step: number) => `Step ${step} of 5`,
  back: "Back",
  finishLater: "Finish later",
  skip: "Skip for now",
  continue: "Continue",
  /**
   * A sequence's step-level failure. Epic 1 §11 gives the sheet form-level
   * line but nothing for a sequence, so this is flagged rather than invented
   * silently.
   *
   * [COPY — needs Vesper sign-off]
   */
  saveError: "Couldn't save. Try again.",
  offline: "Offline — you can look, but changes need a connection.",

  /* ------------------------------------------------------------ FR-01 -- */
  step1Heading: "When does your day usually start?",
  step1Body: "Templates are built around this time. You can change it any day.",
  usualWakeTime: "Usual wake time",
  timezone: "Time zone",

  /* ------------------------------------------------------------ FR-02 -- */
  step2Heading: "What do you want to keep doing?",
  step2Body:
    "Add the habits you already have or want. Each one asks for two things: how long it takes, and how much it matters.",
  addHabit: "Add a habit",
  startFromSet: "Start from a small set",
  continueWithoutHabits: "Continue without habits",
  /** "10–20 min · importance 6" — the row's meta. */
  habitMeta: (min: number | null, max: number | null, importance: number) =>
    min === null || max === null
      ? `importance ${importance}`
      : `${min}–${max} min · importance ${importance}`,
  archive: "Archive",
  archiveTitle: (title: string) => `Archive ${title}?`,
  keep: "Keep",

  /* ------------------------------------------------------------ FR-03 -- */
  step3Heading: "Build a typical morning",
  step3Body:
    "Put your habits in order and give each a start time. This becomes a template you can apply to any day.",
  /** The name FR-03 prefills; TP-01 will list it under exactly this. */
  firstTemplateName: "Morning",

  /* ------------------------------------------------------------ FR-04 -- */
  step4Heading: "Which days this week?",
  step4Body:
    "Tap a day to apply a template. Days you leave empty stay empty — nothing is missed on an unplanned day.",
  noTemplatesYet: "No templates yet.",
  buildOne: "Build one",
  /**
   * Returns from the in-place editor to the week. Epic 1 gives no string for
   * this because the document puts the editor in a sheet, which closes rather
   * than returns.
   *
   * [COPY — needs Vesper sign-off]
   */
  backToWeek: "Back to the week",

  /* ------------------------------------------------------------ FR-05 -- */
  step5Heading: "Your list is ready",
  readyWithPlan: (days: number) =>
    `${days} ${days === 1 ? "day" : "days"} this week ${days === 1 ? "is" : "are"} planned. Everything you set up lives in Settings if you want to change it.`,
  readyWithHabits:
    "Your habits are saved. Plan a week from Settings, or add one-off items from the List.",
  readyWithNothing:
    "You can add habits, templates, and a week from Settings whenever you like.",
  openToday: "Open today",
} as const;
