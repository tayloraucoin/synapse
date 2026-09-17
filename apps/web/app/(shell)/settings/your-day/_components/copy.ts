/**
 * Settings → Your day's strings — UX v1.1 §4.14: "The first-run screens,
 * without the frame, as a list". The twelve row titles are the document's;
 * the row values and anything else are `[COPY — needs Vesper sign-off]`.
 *
 * The template list's strings (TP-01, `components/template-editor/` — deleted
 * with DYN-8) live here now: the list is drawn above the block editor for a
 * kind that has more than one template.
 */
export const YOUR_DAY_COPY = {
  title: "Your day",

  /* --------------------------------------------------- the twelve rows -- */
  rows: {
    shape: "Shape of the week",
    workDays: "Work days",
    workStart: "Work start",
    /** UX v1.2 §4.16 (RUN-8): screen 3's cards, without the radio. */
    workDayTypes: "Work-day types",
    commitments: "Standing commitments",
    wake: "Wake",
    beforeTheDay: "Before the day",
    beforeWork: "Before work",
    morningRoutine: "Morning routine",
    training: "Training",
    closingTheDay: "Closing the day",
    workFocuses: "Work focuses",
    blockOrder: "Block order",
  },

  /* ---------------------------------------------------- the row values -- */
  /** [COPY] "Mon–Fri · Sat sometimes" */
  shapes: {
    consistent_shifts: "Same shifts every week",
    varying_shifts: "Shifts change week to week",
    own_structure_dynamic: "Own structure, and it changes",
    fluid: "Fluid days",
  },
  gives: {
    work_waits: "work waits",
    routine_cut: "routine gets cut",
    depends: "depends on the day",
  },
  fixtures: (n: number) => (n === 0 ? "None" : `${n} ${n === 1 ? "fixture" : "fixtures"}`),
  /** [COPY] The *Before the day* row's value under v1.2 (RUN-9). */
  passages: (n: number) => `${n} ${n === 1 ? "passage" : "passages"}`,
  aQuote: "a quote",
  lines: (n: number) => `${n} ${n === 1 ? "line" : "lines"}`,
  /** [COPY] The *Closing the day* row's value: "22:45 · journal". */
  journalOn: "journal",
  both: "both",
  nothing: "Nothing",
  templates: (n: number) => (n === 0 ? "Not yet" : `${n} ${n === 1 ? "template" : "templates"}`),
  /** [COPY] The *Work-day types* row's value. */
  types: (n: number) => (n === 0 ? "Not yet" : `${n} ${n === 1 ? "type" : "types"}`),

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
