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

  /* ------------------------------------------------------- screen 7 -- */
  step7Heading: "What has to happen before you can start?",
  step7Body: "Breakfast, coffee, the walk, the drive. Each with a rough length.",
  /** The six offers and their default lengths (§4.7). */
  prepOffers: [
    { title: "Breakfast", minutes: 20 },
    { title: "Coffee", minutes: 5 },
    { title: "Shower", minutes: 10 },
    { title: "Walk", minutes: 15 },
    { title: "Transit", minutes: 30 },
    { title: "Walk the dog", minutes: 20 },
  ] as const,
  addSomethingElse: "Add something else",
  makeOneOf: "Make it one of two",
  justThisOne: "Just this one",
  remove: "Remove",
  oneOf: "one of",
  or: "or…",
  takes: "Takes",
  /** "Adds up to 45 min · work by 9:00 · up at 7:00 · 72 min left for the routine" */
  prepFooter: (total: number, work: string, wake: string, left: number) =>
    `Adds up to ${total} min · work by ${work} · up at ${wake} · ${left} min left for the routine`,
  prepFooterNoWork: (total: number) => `Adds up to ${total} min`,
  nothingYetPrep: "Nothing yet — tick what applies.",

  /* ------------------------------------------------------- screen 8 -- */
  step8Heading: "What do you do, or want to do, to start the day well?",
  step8Body: "Everything. It doesn't have to fit.",
  tabRecommended: "Recommended",
  tabAll: "All",
  tabSelected: (n: number) => `Selected (${n})`,
  groupBody: "Body",
  groupMind: "Mind",
  rangeLabel: (min: number, max: number) => `${min}–${max} min`,
  addYourOwn: "Add your own",
  searchHabits: "Search",
  noMatches: (query: string) => `No habits match "${query}"`,
  nothingSelected: "Nothing yet — tick what you do, or want to.",
  priority: "Priority",
  length: "Length",
  continueHabits: (n: number) => (n === 0 ? "Continue" : `Continue · ${n} ${n === 1 ? "habit" : "habits"}`),
  alreadyInLibrary: "in your library",

  /* ------------------------------------------------------- screen 9 -- */
  step9Heading: "Do you train?",
  trainYes: "Yes",
  trainNo: "Not right now",
  addAWorkout: "Add a workout",
  workoutName: "Workout",
  timesAWeek: "a week",
  usualDays: "Usual days",
  typicalLength: "Typical length",
  whereItFits: "Where it fits is decided each morning.",
  continueWorkouts: (n: number) =>
    n === 0 ? "Continue" : `Continue · ${n} ${n === 1 ? "workout" : "workouts"}`,
  add: "Add",

  /* ------------------------------------------------------ screen 10 -- */
  step10Heading: "How does the day end?",
  lightsOut: "Lights out",
  phoneAway: "Phone away",
  /** [COPY — one sentence, cites nothing (§13 #13)] */
  phoneAwayLine: "Half an hour before lights out is a common choice.",
  fewLines: "A few lines at night",
  fewLinesBody: "Around 10 minutes, before the phone goes away.",
  addAPrompt: "Add a prompt",
  promptLabel: "Prompt",
  edit: "Edit",
  moveUp: "Move up",
  moveDown: "Move down",
  done: "Done",

  /* ------------------------------------------------------ screen 11 -- */
  step11Heading: "What kinds of work day do you have?",
  step11Body: "One is fine.",
  addAFocus: "Add a focus",
  focusName: "Focus",
  decideInTheMorning: "decide in the morning",
  differentHours: "I have days with different hours",
  secondWorkTitle: "A second kind of work day",
  secondWorkName: "Name",
  secondWorkStart: "Working by",
  /** [COPY] */
  secondWorkUntil: "Until about is the same for every work day.",
  secondWorkDone: (name: string) => `${name} added.`,
  secondWorkNameRequired: "Give it a name.",
  cancel: "Cancel",
  continueFocuses: (n: number) =>
    n === 0 ? "Continue" : `Continue · ${n} ${n === 1 ? "focus" : "focuses"}`,

  /* ------------------------------------------------------ screen 12 -- */
  step12Heading: "Here's the room you have.",
  /** "Your routine adds up to 140 min. 72 fit before prep on a usual day." */
  fitSentence: (routine: number, available: number) =>
    `Your routine adds up to ${routine} min. ${available} fit before prep on a usual day.`,
  fitsLine: "It all fits on a usual day.",
  /** [COPY] */
  noWorkStart: "Set a work start to see the room.",
  bandOrient: (min: number) => `orient ${min}`,
  bandRoutine: (min: number) => `routine ${min} available`,
  bandPrep: (min: number) => `prep ${min}`,
  bandWork: (clock: string) => `work ${clock}`,
  overflowQuestion: "How should the days that don't fit go?",
  modes: {
    daily_menu: "A daily menu",
    daily_menuBody: "See the list each morning, tap what fits.",
    variants: "Different routines on different days",
    variantsBody: "Morning A, Morning B, with counts.",
    auto_trim: "Cut the lowest automatically",
    auto_trimBody: "The list, ranked; the budget cuts from the bottom.",
  },
  openToday: "Open today",
  planWeekFirst: "Plan this week first",
} as const;

/** The sequence's length under UX v1.1 §4. */
export const SETUP_TOTAL_STEPS = 12;
