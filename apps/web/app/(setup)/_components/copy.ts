/**
 * First run's strings — UX v1.2 §4 for screens 1–5 (RUN-8), UX v1.1 §4.6–
 * §4.11 for the screens RUN-9…RUN-11 rebuild, verbatim where the document
 * writes them. Anything the document does not write is marked
 * `[COPY — needs Vesper sign-off]`.
 *
 * NO GLYPH IN HERE (v1.2 R29, TD-20 — the lint rule). The archetype cards'
 * glyphs are `SCHEDULE_SHAPE_ICONS`, the kinds' are `WORK_DAY_KINDS` and
 * `FIXTURE_KINDS`; a screen reads them as data beside these words.
 *
 * The archetype card names are placeholders "to be written around real
 * people" (v1.1 §13 #12, P2-16); the three grey ones say only *not yet*.
 */
export const SETUP_COPY = {
  /* ------------------------------------------------------------ frame -- */
  /** "3 of 5" — the caption, and the document title (v1.3 §4). */
  progress: (step: number, total: number) => `${step} of ${total}`,
  back: "Back",
  finishLater: "Finish later",
  skip: "Skip for now",
  continue: "Continue",
  save: "Save",
  change: "Change",
  /** [COPY — needs Vesper sign-off] */
  saveError: "Couldn't save. Try again.",
  offline: "Offline — you can look, but changes need a connection.",

  /* ------------------------------------------------------- screen 1 -- */
  step1Heading: "Which is closest?",
  /** [COPY — placeholders, v1.1 §13 #12] */
  shapes: {
    consistent_shifts: "My shifts are the same every week",
    varying_shifts: "My shifts change week to week",
    own_structure_dynamic: "I set my own structure, and it changes",
    own_structure_dynamicBody: "Work starts around a time, not at one. Mornings bend.",
    fluid: "My days are fluid",
  },
  notYet: "not yet",

  /* --------------------------------------- screen 3 (v1.3 §4.3; DAY-8) -- */
  workDaysHeading: "Which days do you work?",
  workDaysBody: "Most weeks, that is.",
  /** Five values, *Usually* second (v1.3 R49, §4.3). */
  workDayModes: {
    always: "Always",
    usually: "Usually",
    sometimes: "Sometimes",
    rarely: "Rarely",
    never: "Never",
  },
  whatEachChoiceDoes: "What does each choice do?",
  /**
   * The five lines' definitions, verbatim (v1.3 §4.3), after the term —
   * `InfoDisclosure` sets the term (`workDayModes`) in weight 500 and the
   * dash between (v1.3 R60; DAY-2).
   */
  workDayModeDefinitions: {
    always: "a work day. The morning is built around it.",
    usually: "a work day, most weeks. “Not working today” is one tap away in the day’s menu.",
    sometimes: "the morning asks, “Working today?” and builds from the answer.",
    rarely: "planned as a day off. “Working today” is one tap away in the day’s menu if it turns out otherwise.",
    never: "a day off. Nothing about work is asked.",
  },
  weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const,

  /* ------------------------------------------------------- screen 3 -- */
  step3Heading: "Do your work days all look the same?",
  step3Body: "Same hours, same place.",
  sameShapeYes: "Yes, near enough",
  sameShapeNo: "No, it depends on the day",
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
  /** The collapsed card's third word — *work waits* (v1.2 §4.3). */
  givesShort: {
    work_waits: "work waits",
    routine_cut: "routine gets cut",
    depends: "depends on the day",
  },
  addAWorkDayType: "Add a work-day type",
  /** The sheet-scoped noun (v1.2 §4, the frame rules). */
  aWorkDayType: "A work-day type",
  kind: "Kind",
  typeName: "Name",
  /** [COPY — needs Vesper sign-off] */
  typeNamePlaceholder: "Remote, Office, Studio…",
  chooseAnIcon: "Choose an icon",
  /** The collapsed card's caption under the name — "9:00–17:30 · work waits" (v1.3 R57). */
  typeCaption: (start: string, end: string, gives: string | null) =>
    gives === null ? `${start}–${end}` : `${start}–${end} · ${gives}`,
  continueTypes: (n: number) => (n === 0 ? "Continue" : `Continue · ${n} ${n === 1 ? "type" : "types"}`),
  /** [COPY — needs Vesper sign-off: the card's own line when a save fails.] */
  typeSaveError: "Couldn’t save this one. Try Done again.",

  /* ------------------------------------------------------- screen 4 -- */
  step4Heading: "Anything that happens every week at a set time?",
  step4Body: "A stand-up, a class, dinner on Thursdays.",
  nothingYet: "Nothing yet.",
  addOne: "Add one",
  addAnother: "Add another",

  /* ------------------------------------------------------- screen 5 -- */
  step5Heading: "When would you like to be up?",
  step5Body: "Most days. Every day can differ.",
  upAt: "Up at",
  /** "7:00 to 9:00 · 2 h before work" — the first computed consequence (§4.5). */
  beforeWork: (wake: string, work: string, span: string) => `${wake} to ${work} · ${span} before work`,
  /** "… · 2 h before work on a remote day" — with several work-day types, the first type's. */
  beforeWorkOn: (wake: string, work: string, span: string, kind: string) =>
    `${wake} to ${work} · ${span} before work on a ${kind} day`,

  /* ------------------------------------------------------- screen 6 -- */
  step6Heading: "What do you want to hear first thing?",
  step6Body:
    "Your own words, a passage you love, a quote you chose. The morning opens on it, before anything else gets in.",
  passages: "Passages",
  aQuoteEachDay: "A quote each day",
  quoteSwitch: "A quote from the bank, some mornings",
  /** [COPY §13 #29] */
  quoteLine: "One a day, from a set we keep. Attributed, never ours.",
  inTheMorning: "In the morning",
  askGratitude: "Ask one line of gratitude",
  gratitudeCaption: "Grateful for, this morning",
  askIntention: "Ask one line of intention",
  intentionCaption: "Today’s intention",
  askVisualisation: "Ask one line of visualisation",
  visualisationCaption: "Today, as I see it",
  continuePassages: (n: number) =>
    n === 0 ? "Continue" : `Continue · ${n} ${n === 1 ? "passage" : "passages"}`,

  /* ------------------------------------------------------- screen 7 -- */
  step7Heading: "What has to happen before you can start?",
  step7Body: "Breakfast, coffee, the walk, the drive.",
  /** The two parts (v1.2 §4.7). The starters themselves are `STARTER_LIBRARY.prep`. */
  whatsIncluded: "What’s included",
  howLongEachTakes: "How long each takes",
  addSomethingElse: "Add something else",
  makeOneOf: "Make it one of two",
  justThisOne: "Just this one",
  remove: "Remove",
  oneOf: "one of",
  or: "or…",
  /** The stepper's accessible name — *Length, Breakfast*; nothing visible says it. */
  lengthOf: (title: string) => `Length, ${title}`,
  /** "Adds up to 45 min · up at 7:00 · work by 9:00 · 72 min for the routine" */
  prepFooter: (total: number, wake: string, work: string, left: number) =>
    `Adds up to ${total} min · up at ${wake} · work by ${work} · ${left} min for the routine`,
  prepFooterNoWork: (total: number) => `Adds up to ${total} min`,
  /** [COPY] */
  nothingYetPrep: "Nothing yet — tap what applies.",
  continueSteps: (n: number) => (n === 0 ? "Continue" : `Continue · ${n} ${n === 1 ? "step" : "steps"}`),
  /** [COPY] *Couldn't save Breakfast. Try again.* */
  stepSaveError: (title: string) => `Couldn’t save ${title}. Try again.`,

  /* ------------------------------------------------------- screen 8 -- */
  step8Heading: "What do you do, or want to do, to start the day well?",
  step8Body: "Everything. It doesn't have to fit.",
  /** The chooser's own words are `LANDSCAPE_COPY`; these are the screen's. */
  rangeLabel: (min: number, max: number) => `${min}–${max} min`,
  searchHabits: "Search",
  continueHabits: (n: number) => (n === 0 ? "Continue" : `Continue · ${n} ${n === 1 ? "habit" : "habits"}`),
  alreadyInLibrary: "in your library",

  /* ------------------------------------------------------- screen 9 -- */
  step9Heading: "How much does each one matter, and how long does it take?",
  step9Body: "Rough is fine. The morning is built from these.",
  howMuchItMatters: "How much it matters",
  usuallyTakes: "Usually takes",
  addAShorterVersion: "Add a shorter version",
  addALongerVersion: "Add a longer version",
  /** The version row's label field, and its two placeholders (v1.2 §4.9). */
  versionLabel: "Version",
  versionQuick: "Quick",
  versionFull: "Full",
  /** [COPY] The default version's name, seeded from *usually* (TD-11). */
  versionUsual: "Usual",
  /** The pencil's accessible name. */
  editRange: "Edit the range",
  rangeEditorLabel: "Range",
  /**
   * The collapsed card's caption — "usually 12 min · quick 5" (v1.3 §4.4 B10,
   * R57, R59). *matters n* leaves the text: the `PriorityMark` carries it.
   */
  rankedCaption: (usually: number, versions: readonly string[]) =>
    [`usually ${usually} min`, ...versions].join(" · "),
  /** [COPY] */
  nothingToRank: "Nothing to rank yet.",

  /* ------------------------------------------------------ screen 10 -- */
  step10Heading: "Do you train?",
  trainYes: "Yes",
  trainNo: "Not right now",
  addAWorkout: "Add a workout",
  workoutName: "Workout",
  /** [COPY] The unnamed card's accessible name and the name field's placeholder. */
  newWorkout: "New workout",
  workoutType: "Type",
  timesAWeek: "a week",
  usualDays: "Usual days",
  flexible: "Flexible",
  where: "Where",
  whereHome: "Home",
  whereGym: "Gym or studio",
  whereOutside: "Outside",
  /** The summary's word for the where — *gym +15/+15*. */
  whereShort: { home: "home", gym: "gym", outside: "outside" } as Record<"home" | "gym" | "outside", string>,
  gettingThere: "Getting there",
  gettingBack: "Getting back",
  planForTheTravel: "Plan for the travel",
  planForTheTravelLine: "Kept beside the workout, never added to it. Either trip can be dropped on the day.",
  /**
   * The collapsed card's caption under the name — "2 a week · Mon Thu · 60 min
   * · gym +15/+15" (v1.3 R57); the travel never in the length.
   */
  workoutCaption: (
    weekly: number,
    days: string,
    minutes: number,
    where: string | null,
    travel: { there: number; back: number } | null,
  ) =>
    [
      `${weekly} a week`,
      days,
      `${minutes} min`,
      where === null ? null : travel === null ? where : `${where} +${travel.there}/+${travel.back}`,
    ]
      .filter((part): part is string => part !== null)
      .join(" · "),
  whereItFits: "Where it fits on the day is set when you build one.",
  continueWorkouts: (n: number) =>
    n === 0 ? "Continue" : `Continue · ${n} ${n === 1 ? "workout" : "workouts"}`,
  add: "Add",

  /* ------------------------------------------------------ screen 11 -- */
  step11Heading: "How does the day end?",
  step11Body: "The evening stacks back from lights out.",
  lightsOut: "Lights out",
  phoneAway: "Phone away",
  /** One sentence, cites nothing (v1.1 §13 #13; v1.2 §4.11). */
  phoneAwayLine: "An hour before lights out is a common choice.",
  fewLines: "A few lines at night",
  fewLinesBody: "Around 10 minutes, before the phone goes away.",
  promptsLabel: "Prompts",
  addAPrompt: "Add a prompt",
  promptLabel: "Prompt",
  edit: "Edit",
  moveUp: "Move up",
  moveDown: "Move down",
  done: "Done",
  aReminder: "A reminder",
  /** [COPY] The reminder switch's label. */
  remindMe: "Remind me",
  /** In the person's words (v1.2 §4.11, R38) — the push's own two words. */
  reminderCaption: (clock: string) => `In your words: “A few lines · ${clock}”.`,
  /* The wind-down starters (§4.11, §7.1) — rows, nothing pre-selected. */
  windDownBand: "Wind-down",
  inYourLibrary: "in your library",

  /* ------------------------------------------------------ screen 12 -- */
  step12Heading: "What is your work about?",
  step12Body: "One is fine. Each gets a rough share of the week.",
  addAFocus: "Add a focus",
  focusName: "Focus",
  focusPlaceholder: "The main thing",
  focusLine: "A name for the work itself — a project, a client, a kind of work.",
  /** [COPY] The unnamed card's accessible name. */
  newFocus: "New focus",
  /** The collapsed card's caption under the name — "2 a week · flexible" (v1.3 R57). */
  focusCaption: (weekly: number, days: string) => `${weekly} a week · ${days}`,
  cancel: "Cancel",
  continueFocuses: (n: number) =>
    n === 0 ? "Continue" : `Continue · ${n} ${n === 1 ? "focus" : "focuses"}`,

  /* ------------------------------ screen 5 (v1.3 §4.5; was 14 — DAY-8) -- */
  /** v1.2 §4.14, verbatim. */
  weekHeading: "Your usual week.",
  yourDays: "Your days",
  unstructured: "Unstructured",
  off: "Off",
  /** *Monday, Day A, change* — the row's accessible name. */
  weekRowLabel: (weekday: string, value: string) => `${weekday}, ${value}, change`,
  /** [COPY] The sheet's title. */
  whichPlan: (weekday: string) => weekday,
  /** *Edit Day A* */
  editPlan: (name: string) => `Edit ${name}`,
  searchPlans: "Search",
  noPlansMatch: "No days match.",
  /** The mode question — v1.2 §4.14, verbatim. */
  morningMode: "Each morning",
  setFromPlan: "Set from the plan",
  setFromPlanBody: "Each morning opens on the plan for that day. Change anything from the day’s menu.",
  buildEachMorning: "Build each morning",
  buildEachMorningBody: "After the orient screen, choose what fits today. The plan is the starting point.",
  openToday: "Open today",
  planWeekFirst: "Plan this week first",
} as const;

/**
 * The sequence's length under UX v1.3 §4 (R45, TD-31; DAY-8): the shape of
 * the week, the blocks primer, work days, your days, your week. The one
 * definition — the entry tree's clamp imports it.
 */
export const SETUP_TOTAL_STEPS = 5;
