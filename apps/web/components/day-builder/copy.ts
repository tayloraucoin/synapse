/**
 * The day builder's strings — UX v1.3 §4.4 for B1–B7 (DAY-9), v1.2 §4.13
 * for the screens still behind them, verbatim where the documents write
 * them; the rest `[COPY — needs Vesper sign-off]`. No glyph in here (R29) —
 * the glyphs are the plan's, the work kind's and the habits' own.
 *
 * THE ROOM IS STATED AS ROOM (§3.10, §12.3): no shortfall word, no
 * judgement — the second number, and *runs to 9:12*, are the whole feedback.
 * THE WORK IS THE PLAN'S (R46): nothing here names it by anything but *Work*.
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
  /** UX v1.3 §4.4 Your days (DAY-11): the two new lists in the disclosure. */
  afterWork: "After work",
  freeTime: "Free time",
  /** [COPY] *Day B, from Day A* — the polite status when another day opens from the last. */
  fromLast: (name: string, from: string) => `${name}, from ${from}`,
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
  /** "Day A · 3 of 17" — the visible count (v1.3 §4.4). */
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
    /** [COPY] */
    needs_work: "Say whether there is work on this day.",
  } as Record<string, string>,

  /* ------------------------------------------- B1 — name and days (§4.4) -- */
  b01: {
    heading: "Build a day.",
    body: "Most people have two or three. Give it a name and say which days it’s for.",
    /** The first plan only — `[COPY — Taylor's G4.1, made a line]`. */
    helper: "If your days differ, start with the first work day of the week — the rest can start from this one.",
    name: "Name",
    whichDays: "Which days",
    chooseAnIcon: "Choose an icon",
    /** *Thursday moves from Day A.* */
    moved: (weekday: string, from: string) => `${weekday} moves from ${from}.`,
    undo: "Undo",
    /** [COPY] The chip's line beneath, and its accessible name — *Thursday, Day A's*. */
    heldBy: (plan: string) => `${plan}’s`,
  },

  /* --------------------------------------- B2 — up and lights out (R64) -- */
  b02: {
    heading: (name: string) => `${name} — when it starts and ends.`,
    upAt: "Up at",
    lightsOut: "Lights out",
    phoneAway: "Phone away",
    phoneAwayLine: "An hour before lights out is a common choice.",
    /** *15 h 45 awake.* */
    awake: (span: string) => `${span} awake.`,
  },

  /* ----------------------------------------- B3 — work on this day (R46) -- */
  b03: {
    heading: "Work on this day?",
    work: "Work",
    noWorkOnThisDay: "No work on this day",
    /** `[COPY — R55]` */
    foot: "Work is a block of time here. What happens inside it lives in your work tools.",
    /** *2 h before work · 5 h 15 after.* */
    spans: (before: string, after: string) => `${before} before work · ${after} after.`,
  },

  /* ------------------------------------------------ B4 — training (R52) -- */
  b04: {
    heading: "Train on this day?",
    yes: "Yes",
    notRightNow: "Not right now",
    addAWorkout: "Add a workout",
    onThisDay: "On this day",
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
    /** [COPY] Two workouts in one placement, ordered — *Before the routine, in order*. */
    inOrder: (placement: string) => `${placement}, in order`,
  },

  /* ------------------------------------------------ B5 — getting ready -- */
  b05: {
    heading: "Getting ready.",
    body: "What has to happen before work on this day, in order.",
    listName: "List name",
    newList: "New list",
    /** "Getting ready A" — the letter from the plan's name. */
    defaultName: (letter: string) => `Getting ready ${letter}`,
    /** [COPY] The list on a *No work* day (v1.3 §4.4 B5). */
    defaultNameNoWork: (letter: string) => `Getting going ${letter}`,
    pickerSearch: "Search",
    pickerEmpty: "No lists match.",
    inOrder: "In order",
    /** *10–20 min* — a starter's range. */
    range: (min: number, max: number) => `${min}–${max} min`,
    oneOfTwo: "One of two",
    leaveOut: "Leave out on this day",
    notOnThisDay: "Not on this day",
    include: "Include",
    addAStep: "Add a step",
    /** [COPY] Behind *Add a step*: a step that is not a starter. */
    somethingElse: "Something else",
    /** *Length, Breakfast* — the stepper's accessible name. */
    lengthOf: (title: string) => `Length, ${title}`,
    /** *Getting ready A · 45 min · 8:15 to 9:00* */
    sticky: (name: string, minutes: number, from: string | null, to: string | null) =>
      from === null || to === null ? `${name} · ${minutes} min` : `${name} · ${minutes} min · ${from} to ${to}`,
    /** [COPY] The list the plan pointed at is gone. */
    listRemoved: "This list was removed — start a new one?",
    /** [COPY] */
    nothingYet: "Nothing yet.",
    /** [COPY] One step's write failed — *Couldn't add Breakfast. Try again.* */
    stepError: (title: string) => `Couldn’t add ${title}. Try again.`,
  },

  /* --------------------------------------- B6 — fixed on this day (R51) -- */
  b06: {
    heading: "Anything fixed on this day?",
    body: "A stand-up, an appointment, a class. Things with a set time.",
    otherDays: "Other days",
    addOne: "Add one",
    /** [COPY] *Add Thursday to Football?* */
    addDaysTitle: (days: string, fixture: string) => `Add ${days} to ${fixture}?`,
    addDaysBody: "The fixture keeps its other days.",
    add: "Add",
    /** *Thu · 19:00 · 90 min* */
    detail: (days: string, at: string, minutes: number) => `${days} · ${at} · ${minutes} min`,
    /** *+20 there · +20 back* — the second caption line when the travel is planned. */
    travel: (there: number, back: number) => `+${there} there · +${back} back`,
    nothingYet: "Nothing yet.",
    skip: "Skip for now",
  },

  /* ----------------------------------------------- B7 — so far (R67) -- */
  b07: {
    heading: (name: string) => `${name}, so far.`,
    body: "Up to the end of work. Tap a block to change it.",
    /** [COPY] The routine's open band before B11 has built it. */
    morningNotBuilt: "Morning routine · not built yet",
  },

  /* ------------------------------- the list screens behind B11–B13 (v1.2) -- */
  d: {
    listName: "List name",
    pickerSearch: "Search",
    pickerEmpty: "No lists match.",
    oneOfTwo: "One of two",
    /** *Length, Breakfast* — the stepper's accessible name. */
    lengthOf: (title: string) => `Length, ${title}`,
    /** [COPY] The list the plan pointed at is gone. */
    listRemoved: "This list was removed — start a new one?",
    /** [COPY] */
    nothingYet: "Nothing yet.",
  },

  /* ----------------------------------- B8 — first thing (profile; R53) -- */
  b08: {
    heading: "What do you want to hear first thing?",
    body: "Your own words, a passage you love, a quote you chose. The morning opens on it, before anything else gets in.",
    /** *Next · 2 passages · 1 link* — counts where a count helps. */
    next: (passages: number, links: number) => {
      const parts = [
        passages === 0 ? null : `${passages} ${passages === 1 ? "passage" : "passages"}`,
        links === 0 ? null : `${links} ${links === 1 ? "link" : "links"}`,
      ].filter((part): part is string => part !== null);
      return parts.length === 0 ? "Next" : `Next · ${parts.join(" · ")}`;
    },
    skip: "Skip for now",
  },

  /* ---------------------------------- B9 — the landscape (profile; R66) -- */
  b09: {
    heading: "What do you do, or want to do, to start the day well?",
    body: "Everything. It doesn't have to fit.",
    /** *Next · 9 habits* */
    next: (n: number) => (n === 0 ? "Next" : `Next · ${n} ${n === 1 ? "habit" : "habits"}`),
  },

  /* --------------------------------------- B10 — ranked (profile; R58) -- */
  b10: {
    heading: "How much does each one matter, and how long does it take?",
    body: "Rough is fine. The morning is built from these.",
  },

  /* ------------------------------ B11 — the morning routine (v1.3 §4.4) -- */
  b11: {
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
    /** [COPY] B11 with nothing ranked yet (DAY-10's edge state). */
    nothingToRank: "Nothing to rank yet.",
    /** The question, first plan only (v1.3 R61, §4.4 B11) — verbatim. */
    sameEveryDay: "Same routine every day",
    sameEveryDayBody: "This list, wherever it fits. Days with less room take less of it.",
    variesByDay: "It varies by day",
    variesByDayBody: "Each day picks or builds its own.",
    /** The question's accessible name — `[COPY]`. */
    sameQuestion: "Same routine every day?",
  },

  /* ------------------------------------- B13 — during work (v1.3 §4.4) -- */
  b13: {
    heading: "Anything during work?",
    body: "A break, a meal, ten minutes away from the desk.",
    nothingYet: "Nothing yet.",
    addABreak: "Add a break",
    somethingElse: "Something else",
    when: "When",
    midday: "Midday",
    atATime: "At a time",
    at: "At",
    skip: "Skip for now",
  },

  /* -------------------------------------- B12 — winding down (v1.3 §4.4) -- */
  b12: {
    heading: "How does the day end?",
    /** *Lights out 22:45 · phone away 21:45.* — B2's times; *Change* returns there. */
    body: (lightsOut: string, phoneAway: string) => `Lights out ${lightsOut} · phone away ${phoneAway}.`,
    change: "Change",
    /** The *Change* link's accessible name (DAY-10 Accessibility). */
    changeTheTimes: "Change the times",
    /** A later plan on the shared routine — *Morning routine A · 45 chosen · 62 for the routine on this day*. */
    sharedRoutine: (name: string, chosen: number, room: number | null) =>
      room === null ? `${name} · ${chosen} chosen` : `${name} · ${chosen} chosen · ${room} for the routine on this day`,
    changeForThisDay: "Change for this day",
    /** `[COPY]` The first plan's journal group heading (v1.3 §4.4 B12). */
    aFewLinesGroup: "A few lines",
    /** *10–20 min* — a starter's range. */
    range: (min: number, max: number) => `${min}–${max} min`,
    inOrder: "In order",
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

  /* ---------------------------------------- B14 — after work (R48, TD-25) -- */
  b14: {
    heading: "After work.",
    body: "The hand-off between work and the evening — the drive, the cooking, dinner.",
    listName: "List name",
    newList: "New list",
    /** "After work A" — the letter from the plan's name. */
    defaultName: (letter: string) => `After work ${letter}`,
    inOrder: "In order",
    range: (min: number, max: number) => `${min}–${max} min`,
    somethingElse: "Something else",
    leaveOut: "Leave out on this day",
    notOnThisDay: "Not on this day",
    include: "Include",
    /** *After work A · 40 min · 17:30 to 18:10.* */
    sticky: (name: string, minutes: number, from: string | null, to: string | null) =>
      from === null || to === null ? `${name} · ${minutes} min` : `${name} · ${minutes} min · ${from} to ${to}.`,
    nothingAfterWork: "Nothing after work",
  },

  /* ------------------------- B15a/b — free time (profile; R50, TD-26) -- */
  b15a: {
    heading: "What do you like to do with free time?",
    body: "A menu for the evening, so the default isn't the default.",
    /** *Next · 7 activities* */
    next: (n: number) => (n === 0 ? "Next" : `Next · ${n} ${n === 1 ? "activity" : "activities"}`),
    skip: "Skip for now",
  },
  b15b: {
    heading: "How much does each one matter?",
    body: "For the nights you have to choose.",
    /** [COPY] Nothing was ticked on B15a. */
    nothingToRank: "Nothing to rank yet.",
  },

  /* ----------------------------------- B16 — free time on this day (R50) -- */
  b16: {
    heading: "Free time on this day.",
    /** *2 h 15 between after work and wind-down.* — the room, stated as room. */
    roomAfterTransition: (span: string) => `${span} between after work and wind-down.`,
    /** *The evening, after 17:30.* — no after-work list. */
    roomAfterWork: (clock: string) => `The evening, after ${clock}.`,
    /** *No work* (v1.3 §4.4 edge states). */
    roomAfterRoutine: "The day, after the routine.",
    poolName: "Pool name",
    newPool: "New pool",
    /** "Evenings A" */
    defaultName: (letter: string) => `Evenings ${letter}`,
    /** *usually 30* */
    usually: (minutes: number) => `usually ${minutes}`,
    /** The muted line under the list — verbatim (v1.3 §4.4 B16). */
    foot: "The evening chooses from these. Nothing here is scheduled.",
    /** *Next · 5 to choose from* */
    next: (n: number) => (n === 0 ? "Next" : `Next · ${n} to choose from`),
    /** [COPY] No ranked activities yet. */
    nothingToChoose: "Nothing to choose from yet.",
    /** [COPY] The way back to B15a on the first plan. */
    backToFreeTime: "Add some free-time activities",
    /** The picker's meta — *7 to choose from*. */
    toChooseFrom: (n: number) => `${n} to choose from`,
  },

  /* ------------------------------------- B17 — as it stands (v1.3 §4.4) -- */
  b17: {
    /** The what-gives row (v1.3 §4.4 B17). */
    whenMorningRunsLong: "When the morning runs long",
    change: "Change",
    /** Its accessible name — *When the morning runs long, Work waits, change*. */
    whatGivesLabel: (value: string) => `When the morning runs long, ${value}, change`,
    /** [COPY] The row before an answer. */
    notChosen: "Not chosen",
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
    /** *Free time · 5 to choose from* — the pool band's label (v1.3 §4.4 B17). */
    pool: (n: number) => (n === 0 ? "Free time" : `Free time · ${n} to choose from`),
    /** *Sleep · 22:45 to 7:00* */
    sleep: (from: string, to: string) => `Sleep · ${from} to ${to}`,
  },

  /** The block words, for bands and captions — v1.3 §1, §3.1 (*After work*, *Free time*; DAY-3). */
  blocks: {
    orient: "Orient",
    prep: "Getting ready",
    morning: "Morning",
    training: "Training",
    work: "Work",
    break: "Break",
    transition: "After work",
    activity: "Free time",
    wind_down: "Wind-down",
  } as Record<string, string>,
} as const;
