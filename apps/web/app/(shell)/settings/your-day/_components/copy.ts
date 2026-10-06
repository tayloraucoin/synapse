/**
 * Settings → Your day's strings — UX v1.3 §4.6 (DAY-8; v1.1 §4.14 before
 * it): "The first-run screens, without the frame, as a list". The row titles
 * are the document's; the row values and anything else are
 * `[COPY — needs Vesper sign-off]`.
 *
 * The template list's strings (TP-01, `components/template-editor/` — deleted
 * with DYN-8) live here now: the list is drawn above the block editor for a
 * kind that has more than one template.
 */
export const YOUR_DAY_COPY = {
  title: "Your day",

  /* ------------------------------------------ the rows (v1.3 §4.6 order) -- */
  rows: {
    shape: "Shape of the week",
    workDays: "Work days",
    /** UX v1.2 §4.16 (RUN-12): the day plans and the builder, embedded. */
    yourDays: "Your days",
    /** v1.3 §4.6: passages, links, the quote, the three lines (*Before the day* under v1.2). */
    firstThing: "First thing",
    /** v1.3 §4.6: the landscape. */
    morningHabits: "Morning habits",
    ranked: "Ranked",
    /** v1.3 §4.6 (DAY-12): the landscape and the ranking. */
    freeTime: "Free-time activities",
    /** v1.3 §4.6 (DAY-12): the mode. */
    eachMorning: "Each morning",
    training: "Training",
    commitments: "Standing commitments",
    closingTheDay: "Closing the day",
    focuses: "Focuses",
    /** The block-kind rows — the block editor for prep, morning, transition, activity, wind-down. */
    gettingReady: "Getting ready",
    morningRoutine: "Morning routine",
    afterWork: "After work",
    evenings: "Evenings",
    windDown: "Wind-down",
    blockOrder: "Block order",
  },
  /** [COPY] The *Your days* row's value. */
  days: (n: number) => (n === 0 ? "Not yet" : `${n} ${n === 1 ? "day" : "days"}`),

  /* ---------------------------------------------------- the row values -- */
  /** [COPY] "Mon–Fri · Sat sometimes" */
  shapes: {
    consistent_shifts: "Same shifts every week",
    varying_shifts: "Shifts change week to week",
    own_structure_dynamic: "Own structure, and it changes",
    fluid: "Fluid days",
  },
  fixtures: (n: number) => (n === 0 ? "None" : `${n} ${n === 1 ? "fixture" : "fixtures"}`),
  /** [COPY] The *First thing* row's value (*Before the day* under v1.2, RUN-9). */
  passages: (n: number) => `${n} ${n === 1 ? "passage" : "passages"}`,
  aQuote: "a quote",
  lines: (n: number) => `${n} ${n === 1 ? "line" : "lines"}`,
  /** [COPY] The *Closing the day* row's value: "22:45 · journal". */
  journalOn: "journal",
  /** The *Each morning* row's value — the two answers' own words (v1.2 §4.14). */
  modes: { set_from_plan: "Set from the plan", build_each_morning: "Build each morning" },
  /** [COPY] The *Free-time activities* row's value. */
  activities: (n: number) => (n === 0 ? "Not yet" : `${n} ${n === 1 ? "activity" : "activities"}`),
  both: "both",
  nothing: "Nothing",
  templates: (n: number) => (n === 0 ? "Not yet" : `${n} ${n === 1 ? "template" : "templates"}`),
  /* ---------------------------------------------------- the block order -- */
  orderTitle: "Block order",
  orderBody: "The order the blocks fall in on a day. Training and breaks are placed each morning.",
  moveUp: "Move up",
  moveDown: "Move down",
  orderSaved: "Saved.",
  orderError: "Couldn't save. Try again.",

  /* --------------------------------------------- the template list (TP-01) -- */
  new: "New",
  untitled: "Untitled",
  itemsAndMinutes: (items: number, total: number) =>
    `${items} ${items === 1 ? "item" : "items"} · ${total} min`,
  usedThisWeek: (k: number) => `Used ${k} days this week`,
  /** UX v1.2 §4.16 (RUN-12): *used by Day A, Day B*. */
  usedBy: (names: readonly string[]) => `used by ${names.join(", ")}`,
  duplicate: "Duplicate",
  archive: "Archive",
  restore: "Restore",
  keep: "Keep",
  archiveTitle: (name: string) => `Archive ${name}?`,
  archiveBody:
    "Days it's already applied to keep their items. It won't be offered for new days.",
  /** [COPY] The kind page with no template yet. */
  kindEmpty: (kind: string) => `No ${kind.toLowerCase()} block yet.`,
  offline: "Offline — you can look, but changes need a connection.",
} as const;
