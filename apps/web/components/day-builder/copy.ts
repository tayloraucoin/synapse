/**
 * The day builder's strings — UX v1.2 §4.13, verbatim where the document
 * writes them; the rest `[COPY — needs Vesper sign-off]`. No glyph in here
 * (R29) — the glyphs are the plan's, the type's and the habits' own.
 *
 * THE ROOM IS STATED AS ROOM (§3.10, §12.3): no shortfall word, no
 * judgement — the second number, and *runs to 9:12*, are the whole feedback.
 */
export const DAY_BUILDER_COPY = {
  /* ------------------------------------------------------- your days -- */
  yourDays: "Your days",
  buildAnotherDay: "Build another day",
  continueDays: (n: number) => (n === 0 ? "Continue" : `Continue · ${n} ${n === 1 ? "day" : "days"}`),
  unfinished: "unfinished",
  continueBuilding: "Continue building",
  /** [COPY] Settings, before any plan exists. */
  noDaysYet: "No days yet.",
  edit: "Edit",
  duplicate: "Duplicate",
  delete: "Delete",
  cancel: "Cancel",
  /** [COPY] */
  deleteTitle: (name: string) => `Delete ${name}?`,
  deleteBody: "Its lists stay.",
  /** The card's expanded lists. */
  gettingReady: "Getting ready",
  morningRoutine: "Morning routine",
  windDown: "Wind-down",
  /** [COPY] *shared with Day B* */
  sharedWith: (names: string) => `shared with ${names}`,
  noList: "none",
  showLists: "Show the lists",
  hideLists: "Hide the lists",
  /** [COPY] The picker's group heading on a list screen. */
  yourLists: "Your lists",
  /** The summary line's parts (§4.13i). */
  upAt: (clock: string) => `up ${clock}`,
  work: (start: string, end: string) => `work ${start}–${end}`,
  noWork: "no work",
  lightsOutAt: (clock: string) => `lights out ${clock}`,
  placement: {
    before_morning: "before the routine",
    after_morning: "after the routine",
    inside_work: "midday",
    after_work: "after work",
    in_break: "in a break",
  } as Record<string, string>,

  /* --------------------------------------------------------- the frame -- */
  /** "Day A · 3 of 9" */
  caption: (name: string, step: number, total: number) => `${name} · ${step} of ${total}`,
  next: "Next",
  nextWithMinutes: (minutes: number) => `Next · ${minutes} min`,
  back: "Back",
  done: "Done",
  saveDay: (name: string) => `Save ${name}`,
  /** [COPY — needs Vesper sign-off] */
  saveError: "Couldn’t save. Try again.",
  offline: "Offline — you can look, but changes need a connection.",
  /** [COPY] The line when the plan cannot complete yet. */
  completeRefused: {
    needs_days: "Pick at least one day first.",
    needs_wake: "Set a wake time first.",
    needs_lights_out: "Set lights out first.",
    needs_work: "Pick a work-day type, or say there is no work on this day.",
  } as Record<string, string>,

  /* ------------------------------------------------------------- 13a -- */
  a: {
    heading: "Build a day.",
    body: "Most people have one or two. Give it a name and say which days it’s for.",
    name: "Name",
    whichDays: "Which days",
    chooseAnIcon: "Choose an icon",
    /** *Thursday moves from Day A.* */
    moved: (weekday: string, from: string) => `${weekday} moves from ${from}.`,
    undo: "Undo",
    /** [COPY] The chip's line beneath, and its accessible name — *Thursday, Day A's*. */
    heldBy: (plan: string) => `${plan}’s`,
  },

  /* ------------------------------------------------------------- 13b -- */
  b: {
    heading: (name: string) => `${name} — the shape of it.`,
    work: "Work",
    noWorkOnThisDay: "No work on this day",
    upAt: "Up at",
    workingBy: "Working by",
    untilAbout: "Until about",
    lightsOut: "Lights out",
    /** *2 h before work · 5 h 15 after.* */
    spans: (before: string, after: string) => `${before} before work · ${after} after.`,
    /** [COPY] On a no-work day. */
    spanNoWork: (awake: string) => `${awake} awake.`,
  },

  /* ------------------------------------------------------------- 13c -- */
  c: {
    heading: "Train on this day?",
    body: "Pick what, then where it goes.",
    when: "When",
    beforeWork: "Before work",
    midday: "Midday",
    afterWork: "After work",
    beforeTheRoutine: "Before the routine",
    afterIt: "After it",
    /** *+15 there · +15 back, beside it.* */
    travel: (there: number, back: number) => `+${there} there · +${back} back, beside it.`,
    foot: "Nothing is fixed. The morning can still swap or skip it.",
    notOnThisDay: "Not on this day",
    minutes: (n: number) => `${n} min`,
  },

  /* ------------------------------------------------------------- 13d -- */
  d: {
    heading: "Getting ready.",
    body: "What has to happen before work on this day, in order.",
    listName: "List name",
    newList: "New list",
    /** "Getting ready A" — the letter from the plan's name. */
    defaultName: (letter: string) => `Getting ready ${letter}`,
    pickerSearch: "Search",
    pickerEmpty: "No lists match.",
    oneOfTwo: "One of two",
    leaveOut: "Leave out on this day",
    notOnThisDay: "Not on this day",
    include: "Include",
    addAStep: "Add a step",
    /** *Length, Breakfast* — the stepper's accessible name. */
    lengthOf: (title: string) => `Length, ${title}`,
    /** *Getting ready A · 45 min · 8:15 to 9:00* */
    sticky: (name: string, minutes: number, from: string | null, to: string | null) =>
      from === null || to === null ? `${name} · ${minutes} min` : `${name} · ${minutes} min · ${from} to ${to}`,
    /** [COPY] The list the plan pointed at is gone. */
    listRemoved: "This list was removed — start a new one?",
    /** [COPY] */
    nothingYet: "Nothing yet.",
  },

  /* ------------------------------------------------------------- 13e -- */
  e: {
    heading: "The morning routine.",
    /** *72 min for the routine on this day — up at 7:00, orient 3, getting ready 45, work by 9:00.* */
    room: (room: number, wake: string, orient: number, ready: number, work: string) =>
      `${room} min for the routine on this day — up at ${wake}, orient ${orient}, getting ready ${ready}, work by ${work}.`,
    noAnchor: "No anchor on this day. The routine runs as long as it runs.",
    /** [COPY] The room is gone before the routine starts. */
    noRoom: (ends: string) =>
      `Getting ready runs to ${ends} on this day — the routine has no room before it.`,
    routineName: "Routine name",
    newRoutine: "New routine",
    defaultName: (letter: string) => `Morning routine ${letter}`,
    forTheRoutine: "for the routine",
    /** *runs to 9:12* */
    runsTo: (clock: string) => `runs to ${clock}`,
    shortenToFit: "Shorten to fit",
    versions: "Versions",
    usually: (minutes: number) => `usually ${minutes}`,
  },

  /* ------------------------------------------------------------- 13f -- */
  f: {
    heading: "Anything during the day?",
    body: "A break, a walk, ten minutes away from the desk.",
    nothingYet: "Nothing yet.",
    addABreak: "Add a break",
    somethingElse: "Something else",
    when: "When",
    midday: "Midday",
    atATime: "At a time",
    at: "At",
    skip: "Skip for now",
  },

  /* ------------------------------------------------------------- 13g -- */
  g: {
    heading: "The evening.",
    body: "What’s already in place on these days.",
    otherDays: "Other days",
    addOne: "Add one",
    /** *Not on Day A* */
    notOn: (plan: string) => `Not on ${plan}`,
    /** [COPY] *Add Thursday to Football?* */
    addDaysTitle: (days: string, fixture: string) => `Add ${days} to ${fixture}?`,
    addDaysBody: "The fixture keeps its other days.",
    add: "Add",
    /** *Thu · 19:00 · 90 min* */
    detail: (days: string, at: string, minutes: number) => `${days} · ${at} · ${minutes} min`,
    nothingYet: "Nothing yet.",
  },

  /* ------------------------------------------------------------- 13h -- */
  h: {
    heading: "Winding down.",
    /** *Lights out 22:45 · phone away 21:45.* */
    body: (lightsOut: string, phoneAway: string) => `Lights out ${lightsOut} · phone away ${phoneAway}.`,
    listName: "List name",
    newList: "New",
    defaultName: (letter: string) => `Wind-down ${letter}`,
    aFewLines: "A few lines",
    phoneAway: "Phone away",
    lightsOut: "Lights out",
    /** *Wind-down A · starts 21:10* */
    sticky: (name: string, starts: string | null) => (starts === null ? name : `${name} · starts ${starts}`),
    confirmInTheMorning: "confirm in the morning",
    /** [COPY] The menu's two moves across the pin. */
    afterPhoneAway: "After phone away",
    beforePhoneAway: "Before phone away",
    addAHabit: "Add a wind-down habit",
    leaveOut: "Leave out on this day",
    notOnThisDay: "Not on this day",
    include: "Include",
    nothingYet: "Nothing yet.",
  },

  /* ------------------------------------------------------------- 13i -- */
  i: {
    heading: (name: string) => `${name}, as it stands.`,
    /** *12 min* — the slack band's gutter label. */
    slack: (minutes: number) => `${minutes} min`,
    /** The band's accessible name: *Morning, 7:45–8:40, edit*. */
    band: (name: string, span: string) => `${name}, ${span}, edit`,
    travelThere: "→",
    travelBack: "←",
  },

  /** The block words, for bands and captions. */
  blocks: {
    orient: "Orient",
    prep: "Getting ready",
    morning: "Morning",
    training: "Training",
    work: "Work",
    break: "Break",
    activity: "Evening",
    wind_down: "Wind-down",
  } as Record<string, string>,
} as const;
