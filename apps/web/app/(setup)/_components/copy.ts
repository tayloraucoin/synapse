/**
 * First run 1–6's strings — UX v1.1 §4, §4.1–§4.6, verbatim where the
 * document writes them. Anything the document does not write is marked
 * `[COPY — needs Vesper sign-off]`.
 *
 * The archetype card names are placeholders "to be written around real
 * people" (§13 #12, P2-16); the three grey ones say only *not yet*.
 */
export const SETUP_COPY = {
  /* ------------------------------------------------------------ frame -- */
  /** "3 of 12" — the caption, and the document title (§4). */
  progress: (step: number, total: number) => `${step} of ${total}`,
  back: "Back",
  finishLater: "Finish later",
  skip: "Skip for now",
  continue: "Continue",
  save: "Save",
  /** [COPY — needs Vesper sign-off] */
  saveError: "Couldn't save. Try again.",
  offline: "Offline — you can look, but changes need a connection.",

  /* ------------------------------------------------------- screen 1 -- */
  step1Heading: "Which is closest?",
  /** [COPY — placeholders, §13 #12] */
  shapes: {
    consistent_shifts: "My shifts are the same every week",
    varying_shifts: "My shifts change week to week",
    own_structure_dynamic: "I set my own structure, and it changes",
    own_structure_dynamicBody: "Work starts around a time, not at one. Mornings bend.",
    fluid: "My days are fluid",
  },
  notYet: "not yet",

  /* ------------------------------------------------------- screen 2 -- */
  step2Heading: "Which days do you work?",
  step2Body: "Tap a day to change it.",
  always: "Always",
  sometimes: "Sometimes",
  never: "Never",
  sometimesMeans: "Sometimes means the morning asks.",
  weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const,

  /* ------------------------------------------------------- screen 3 -- */
  step3Heading: "When do you like to be working by?",
  workingBy: "Working by",
  untilAbout: "Until about",
  whatGives: "When your morning runs long, what gives?",
  gives: {
    work_waits: "Work waits",
    work_waitsBody: "I start when the routine is done.",
    routine_cut: "The routine gets cut",
    routine_cutBody: "Work starts when it starts.",
    depends: "Depends on the day",
    dependsBody: "Ask me in the morning.",
  },
  change: "Change",

  /* ------------------------------------------------------- screen 4 -- */
  step4Heading: "Anything that happens every week at a set time?",
  step4Body: "A stand-up, a class, dinner on Thursdays.",
  nothingYet: "Nothing yet.",
  addOne: "Add one",
  addAnother: "Add another",

  /* ------------------------------------------------------- screen 5 -- */
  step5Heading: "When would you like to be up?",
  upAt: "Up at",
  addAnEarliest: "Add an earliest",
  earliest: "Earliest",
  /** "7:00 to 9:00 · 2 h before work" — the first computed consequence (§4.5). */
  beforeWork: (wake: string, work: string, span: string) => `${wake} to ${work} · ${span} before work`,

  /* ------------------------------------------------------- screen 6 -- */
  step6Heading: "What do you want to read before the day starts?",
  step6Body: "Your own words, a passage, or both. It stays private.",
  passage: "A passage",
  passagePlaceholder: "A few lines you want to see every morning.",
  showLastNight: "Show what I wrote the night before",
  showLastNightBody: "From the evening journal, if you write one.",
  askGratitude: "Ask one line of gratitude in the morning",

  /* -------------------------------------- the transitional ready (7) -- */
  /** [COPY — needs Vesper sign-off; deleted by DYN-11] */
  readyHeading: "That's the start.",
  readyBody:
    "The rest of the setup — your routine, training, the evening — is next. For now, the day is ready with what you've said.",
  openToday: "Open today",
} as const;

/** The sequence's length under UX v1.1 §4. Screens 7–12 arrive with DYN-11. */
export const SETUP_TOTAL_STEPS = 12;

/** The last step that renders today; above it the page 404s until DYN-11. */
export const SETUP_LAST_BUILT_STEP = 7;
