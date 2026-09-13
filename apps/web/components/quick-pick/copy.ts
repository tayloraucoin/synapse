/**
 * The quick-pick's strings — UX v1.1 §5.3, verbatim where the document
 * writes them; the rest `[COPY — needs Vesper sign-off]`.
 *
 * NO PERCENTAGE. NEVER *LATE*. The budget line is two numbers and a middle
 * dot; the over-budget dialog is one sentence and two answers.
 */
import type { TrainingPlacement } from "@syn/types";

export const QUICK_PICK_COPY = {
  notSetYet: "Not set yet",
  change: "Change",
  /* ------------------------------------------------------- sections -- */
  lastNight: "Last night",
  workingToday: "Working today?",
  yes: "Yes",
  no: "No",
  routine: "Routine",
  /** "6 things · 68 min" */
  routineSummary: (count: number, minutes: number) =>
    `${count} ${count === 1 ? "thing" : "things"} · ${minutes} min`,
  routineLocked: "As planned",
  shortenToFit: "Shorten to fit",
  variantLeft: (remaining: number, target: number) => `${remaining} of ${target} left`,
  beforeWork: "Before work",
  /** "Meal-prepped 10" — a one-of member as a segment. */
  member: (title: string, minutes: number) => `${title} ${minutes}`,
  training: "Training",
  /** "Monday's is push" */
  todaysIs: (weekday: string, workout: string) => `${weekday}'s is ${workout}`,
  noWorkoutToday: "Nothing today",
  still: "Still",
  swap: "Swap",
  /** "Trades with Tuesday's legs" — R25. */
  tradesWith: (weekday: string, workout: string) => `Trades with ${weekday}'s ${workout}`,
  when: "When",
  placements: {
    before_morning: "Before the routine",
    after_morning: "After the routine",
    inside_work: "Inside work",
    after_work: "After work",
    in_break: "In a break",
  } satisfies Record<TrainingPlacement, string>,
  notToday: "Not today",
  /** "Push · after the routine" */
  trainingSummary: (workout: string, placement: string | null) =>
    placement === null ? workout : `${workout} · ${placement.toLowerCase()}`,
  work: "Work",
  focus: "Focus",
  decideInTheMorning: "Decide in the morning",
  focusLeft: (remaining: number, target: number) => `${remaining} of ${target} left`,
  workWaits: "Work waits",
  routineGetsCut: "Routine gets cut",
  alreadyInPlace: "Already in place",
  /* ------------------------------------------------------- primaries -- */
  setTheDay: "Set the day",
  setTheDayAt: (clock: string) => `Set the day · work ${clock}`,
  unstructuredToday: "Unstructured today",
  chooseATime: (workout: string) => `Choose a time for ${workout}`,
  /* ------------------------------------------------ over budget (R7) -- */
  overTitle: (minutes: number) => `${minutes} min over.`,
  overBody: (end: string, soft: boolean) =>
    `Everything you ticked is on the list. The routine runs to ${soft ? "~" : ""}${end} on this plan.`,
  setAnyway: "Set anyway",
  adjust: "Adjust",
  /** [COPY] */
  fitError: "Couldn't work out the fit. Try again.",
  offline: "Offline — you can look, but setting the day needs a connection.",
} as const;
