/**
 * Block view's words (USE-48; block-view/words-and-access.md). Gloss: no
 * second person; times and lengths are the only numbers; nothing says
 * missed, late or skipped.
 */
export const BLOCK_VIEW_COPY = {
  length: (min: number) => `${min} min`,
  /** "Free until 8:00" [ASSUMPTION, open-1]. */
  freeUntil: (end: string) => `Free until ${end}`,
  /** Information in ink, never a warning (overflow.md). */
  runsPast: (min: number, end: string) => `Runs ${min} min past ${end}.`,
  /** The peek at the foot: "Training · 8:00 to 8:57". */
  peek: (name: string, span: string) => `${name} · ${span}`,
  checkbox: (title: string, start: string, length: string) =>
    `${title}, ${start}, ${length}`,
  reorder: (title: string) => `Reorder ${title}`,
  /** Editing (USE-49; by-kind.md, Words and Access). */
  editing: {
    /** A set-time row's trailing words, round 8: "At 7:10 · 10 min". */
    at: (time: string, length: string | null) =>
      length === null ? `At ${time}` : `At ${time} · ${length}`,
    /** The clock's name [PROPOSED]: not a grip, it does not move. */
    setAt: (time: string) => `Set at ${time}`,
    addHint:
      "Return adds it and opens the next row. The dashed square picks its icon.",
    pickIcon: "Pick an icon",
    meal: "Meal",
    mealOn: "Offers something to watch",
    off: "Off",
    on: "On",
    watching: "Watching while eating",
    editTopics: "Edit topics",
    offeredAt: (meal: string) => `Offered at ${meal}. Tap to leave one out.`,
    trainingFor: "Training for",
    bodyFitness: "Body fitness",
    fillsWith: "Work fills it with",
    setWork: "Set work",
    tasksForTheDay: "Tasks for the day",
    checklist: "Checklist, no times",
    setATime: "Set a time",
    swap: "Swap",
  },
  /** The suggestion list and the span total (USE-156; suggested.md, Words). */
  suggested: {
    usedBefore: "Used before",
    suggestedFor: (kind: string) => `Suggested for ${kind}`,
    addOne: "Add one",
    /** The + on a row [PROPOSED]: "Add Water, 1 min". */
    add: (name: string, length: string) => `Add ${name}, ${length}`,
    planned: (min: number, span: number) => `${min} of ${span} min`,
    free: (min: number) => `${min} min free`,
    nothingIn: (block: string) => `Nothing in ${block} yet`,
    runsPast: (min: number, end: string) => `Runs ${min} min past ${end}`,
    /** The meter's name [PROPOSED]: "Wellness planned". */
    meter: (block: string) => `${block} planned`,
    reorderHint: "Hold a grip to move one. Times follow the order.",
  },
} as const;
