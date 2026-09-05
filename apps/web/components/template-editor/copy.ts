/**
 * TP-01, TP-02 and TP-03's strings — Epic 1 §5, verbatim.
 *
 * FIXED AND FLEXIBLE ARE THE ONLY WORDS A PERSON SEES. The schema stores
 * `hard` and `soft` (official spec §10.2); a screen that showed either is a
 * defect. The mapping happens once, here and in the sheet's options, and
 * nowhere else.
 */

export const TEMPLATE_COPY = {
  listTitle: "Templates",
  new: "New",
  newTemplate: "New template",
  emptyText:
    "No templates yet. A template is a kind of day — a morning, a workout day, a rest day.",
  /** TP-01's row meta. */
  itemsAndMinutes: (items: number, total: number) =>
    `${items} ${items === 1 ? "item" : "items"} · ${total} min`,
  target: (n: number) => `target ${n}/week`,
  usedThisWeek: (k: number) => `Used ${k} days this week`,
  /** [COPY — needs Vesper sign-off: the fallback for a nameless template. */
  untitled: "Untitled",

  duplicate: "Duplicate",
  archive: "Archive",
  restore: "Restore",
  keep: "Keep",
  archiveTitle: (name: string) => `Archive ${name}?`,
  archiveBody:
    "Days it's already applied to keep their items. It won't be offered for new days.",

  /* ------------------------------------------------------------ TP-02 -- */

  nameLabel: "Template name",
  nameRequired: "Name this template.",
  startsAt: "Starts at",
  targetLabel: "Target",
  targetNone: "none",
  targetHelper:
    "How many days a week you mean to use this. Shown when you build a week.",
  usually: "Usually",
  usuallyAny: "any day",
  usuallyHelper: "Just a hint for when you build a week.",

  addItem: "Add an item",
  manageHabits: "Manage habits",
  emptySlots:
    "Nothing in this template yet. Add habits in the order you'd do them.",
  /** The totals line, and a second only when something is flexible. */
  totals: (first: string, last: string, items: number, total: number) =>
    `${first} – ${last} · ${items} ${items === 1 ? "item" : "items"} · ${total} min planned`,
  totalsNoTimes: (items: number, total: number) =>
    `${items} ${items === 1 ? "item" : "items"} · ${total} min planned`,
  flexibleTotal: (minutes: number) => `${minutes} min flexible`,
  appliedDays: (n: number) => `Applied to ${n} days this week`,

  /** The time-mode word on a row. */
  modeAt: "at",
  modeWithin: "within",
  modeAnytime: "anytime",
  fixed: "Fixed",
  flexible: "Flexible",
  overridden: "overridden",
  multitask: "multitask",

  moveUp: "Move up",
  moveDown: "Move down",
  remove: "Remove",
  removed: (title: string) => `Removed ${title}`,
  undo: "Undo",

  /** The after-the-fact collision row, between two slots. */
  collisionText: "These start at the same time.",
  collisionPrimary: "Multitask them",
  collisionSecondary: "Move one",

  saveFailed: "Changes aren't saving. Check your connection.",
  offline: "You're offline — sign-in needs a connection.",

  /* ------------------------------------------------------------ TP-03 -- */

  slotCreateTitle: "Add an item",
  slotEditTitle: "Edit item",
  habit: "Habit",
  habitSearchLabel: "Search habits",
  habitEmpty: (query: string) => `No habits match "${query}"`,
  newHabit: "New habit",
  /** Under Habit, once chosen. */
  habitMeta: (min: number | null, max: number | null, importance: number) =>
    min === null || max === null
      ? `importance ${importance}`
      : `usually ${min}–${max} min · importance ${importance}`,
  habitChanged: "Duration and priority reset for the new habit.",

  when: "When",
  whenAt: "At a time",
  whenWindow: "Within a window",
  whenAnytime: "Anytime",
  between: "Between",
  and: "and",

  takes: "Takes",
  takesHelper: (min: number, max: number) => `Within ${min}–${max} min.`,
  editRange: "Edit range",

  priority: "Priority in this template",
  priorityHelper: (n: number) =>
    `Defaults to ${n}. Change it only if it matters differently on this kind of day.`,

  timing: "Timing",
  timingFixedHelper:
    "Stays put when you shift the day. Use for appointments and anchors.",
  timingFlexibleHelper: "Moves with the rest of the day when you shift it.",

  cancel: "Cancel",
  save: "Save",

  /** The same-start question, in the sheet's footer. Never a third option. */
  sameStartQuestion: (clock: string, title: string) =>
    `Another item starts at ${clock}: ${title}. Do these happen at the same time?`,
  sameStartYes: "Yes, multitask",
  sameStartNo: "No, move this one",
} as const;
