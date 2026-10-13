/**
 * WK-01, WK-02, WK-03 and TP-04's strings — Epic 1 §5–§6, verbatim.
 */
export const WEEK_COPY = {
  /* ------------------------------------------------------------ WK-01 -- */
  previous: "Previous",
  next: "Next",
  thisWeek: "This week",
  unplannedLead:
    "Pick a template for each day you want planned. Days you leave empty are empty.",
  nothingPlanned: "Nothing planned",
  startsAt: (clock: string) => `starts ${clock}`,
  oneOffCount: (n: number) => `+${n} one-off`,
  today: "Today",
  copyLastWeek: "Copy last week",
  templatesLink: "Templates",
  /** WK-01's empty-templates state — Epic 1 §5 and FR-04, verbatim. */
  noTemplatesYet: "No templates yet.",
  buildOne: "Build one",
  /** The targets line: "Morning 2 of 3". */
  targetLine: (name: string, used: number, target: number) =>
    `${name} ${used} of ${target}`,
  mostBehind: "most behind",

  /* --------------------------------------- UX v1.1 §4.13 — the row line -- */
  structured: "Structured",
  unstructured: "Unstructured",
  /** A *sometimes* work day with no plan: the shape is a question (§3.9). */
  shapeUnknown: "?",
  decideInTheMorning: "decide in the morning",
  planFromDefaults: "Plan from your defaults",
  /** [COPY — needs Vesper sign-off] */
  planFromDefaultsDone: (n: number) => `Planned ${n} ${n === 1 ? "day" : "days"}.`,

  /* -------------------------------------------- the amended day sheet -- */
  /* UX v1.2 §4.15 (RUN-13): the *Plan* row. */
  plan: "Plan",
  /** [COPY — needs Vesper sign-off] */
  noPlans: "No days built yet.",
  planSetAlready: "This day is set — its plan stays.",
  saveError: "Couldn’t save. Try again.",
  shape: "Shape",
  set: "Set",
  menu: "Menu — decide in the morning",
  menuShort: "Menu",
  /** "1 of 2 this week" */
  ofThisWeek: (used: number, target: number) => `${used} of ${target} this week`,
  focus: "Focus",
  focusSearchLabel: "Search focuses",
  focusEmpty: "No focuses yet",
  training: "Training",
  noWorkoutToday: "None on this day",
  swapWith: "Swap with…",
  swapSearchLabel: "Search days",
  swapEmpty: "No other days",
  /** "Trade with Tuesday's pull?" — R25, one sentence. */
  tradeTitle: (day: string, workout: string) => `Trade with ${day}'s ${workout}?`,
  tradeTitleEmpty: (day: string) => `Move it to ${day}?`,
  trade: "Trade",
  setInTheMorning: "Set in the morning",
  newOfKind: "New",

  copyTitle: "Copy last week?",
  copyBody: "Templates and start times are copied. One-off items are not.",
  copyOverwriteLine: (n: number) => `${n} planned days will be replaced.`,
  copyConfirm: "Copy",
  cancel: "Cancel",

  /* ------------------------------------------------------------ WK-02 -- */
  template: "Template",
  none: "None",
  newTemplate: "New template",
  templateSearchLabel: "Search templates",
  templateEmpty: "No templates match",
  archivedSuffix: (name: string) => `${name} (archived)`,
  untitled: "Untitled",
  /** "5 items · 95 min" — the picker row's meta. */
  itemsAndMinutes: (items: number, minutes: number) =>
    `${items} ${items === 1 ? "item" : "items"} · ${minutes} min`,
  usedOfTarget: (used: number, target: number) => `${used} of ${target}`,
  minutes: (n: number) => `${n} min`,
  pastDay: "past",
  dayStartsAt: "Starts at",
  dayStartsHelper: "Defaults to the template's start.",
  oneOffs: "One-offs",
  addOneOff: "Add a one-off",
  thisDay: "This day",
  thisDayHelper: "This is what the List will show.",
  removeTemplate: "Remove template",
  removeTitle: (name: string, day: string) => `Remove ${name} from ${day}?`,
  removeBody: "Untouched items are removed. Started or done items stay.",
  remove: "Remove",
  keep: "Keep",
  done: "Done",
  /** Shown before applying *None* to a day that has touched items. */
  keepLine: (n: number) =>
    `${n} ${n === 1 ? "item" : "items"} already started or done stay on the day.`,

  /* ------------------------------------------------------------ WK-03 -- */
  addTitle: "Add a one-off",
  editTitle: "Edit one-off",
  what: "What",
  /** [COPY — needs Vesper sign-off: the segment labels are inferred. */
  fromHabits: "From my habits",
  justATitle: "Just a title",
  titleLabel: "Title",
  titleHelper: "It won't be added to your habits.",
  saveToHabits: "Save to habits instead",
  day: "Day",
  when: "When",
  whenAt: "At a time",
  whenWindow: "Within a window",
  whenAnytime: "Anytime",
  between: "Between",
  and: "and",
  takes: "Takes",
  timing: "Timing",
  fixed: "Fixed",
  flexible: "Flexible",
  priority: "Priority",
  save: "Save",
  sameStartQuestion: (title: string) =>
    `${title} starts at the same time. Do these happen at the same time?`,
  sameStartYes: "Yes, multitask",
  sameStartNo: "No, move this one",

  /* ------------------------------------------------------------ TP-04 -- */
  applyTitle: "Apply these changes to planned days?",
  applyBody: (name: string, count: number, dayList: string) =>
    `${name} is applied to ${count} ${count === 1 ? "day" : "days"}: ${dayList}. Items already done or reviewed on those days are kept as they are.`,
  applyAll: "All planned days",
  applyFromTomorrow: "Only days from tomorrow",
  applyNone: "Don't apply",
  appliedResult: (n: number) => `Applied to ${n} ${n === 1 ? "day" : "days"}.`,
  applyError:
    "Couldn't update the days. The template is saved; try again from the week.",
} as const;

/*
 * There is no `offline` string here. An earlier draft carried one copied from
 * the auth screens ("sign-in needs a connection"), which is a sentence about a
 * screen this is not. `StatusLine variant="offline"` owns that line for the
 * whole app, and one offline sentence is the point of it.
 */
