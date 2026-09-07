/**
 * WR-01…04's strings — Epic 3 §3, official spec §7.5.
 *
 * **NOTHING HERE EVALUATES OR COMPARES.** No reference to a previous week, no
 * arrow, no *better*, no *only*, no run-of-days count. The week is a record read
 * slowly, and the moment it acquires a direction it becomes a dashboard — which
 * is the one thing this screen is forbidden to be (§7.5, and the ticket's own
 * review note). The reader draws the conclusion; the screen supplies the counts.
 *
 * EVERY NUMBER CARRIES ITS SENTENCE. The percent never appears without the
 * formula that produced it, because a number a person cannot reconstruct is a
 * judgement, not a fact.
 */
export const WEEK_COPY = {
  /* -------------------------------------------------------------- WR-01 -- */
  /** "3 of 4 days reviewed" · with *so far* while the week is open. */
  daysReviewed: (reviewed: number, planned: number) =>
    `${reviewed} of ${planned} days reviewed`,
  soFar: "so far",
  /** The count of what the number deliberately leaves out. */
  notYetReviewed: (count: number) =>
    `${count} ${count === 1 ? "day" : "days"} not yet reviewed ${count === 1 ? "isn't" : "aren't"} in this.`,

  templates: "Templates",
  habits: "Habits",
  deepWork: "Deep work",
  tasks: "Tasks",
  shifts: "Shifts",
  timeByCategory: "Time by category · from timers",
  /** The exclusion, said once, under the legend. */
  timersOnly: "Items without timed sessions aren't included.",
  noCategory: "No category",

  /** "4 sessions · 380 min" */
  deepWorkRow: (sessions: number, minutes: number) =>
    `${sessions} ${sessions === 1 ? "session" : "sessions"} · ${minutes} min`,
  /** "3 of 4" */
  ofCounted: (credit: number, counted: number) => `${credit} of ${counted}`,

  /** "6 done · 2 carried into next week" */
  tasksRow: (done: number, carried: number) =>
    `${done} done · ${carried} carried into next week`,
  /** "2 shifts · +90 min · most often: slept in" */
  shiftsRow: (count: number, totalMin: number, reason: string | null) =>
    `${count} ${count === 1 ? "shift" : "shifts"} · +${totalMin} min${reason === null ? "" : ` · most often: ${reason}`}`,

  /** "45 min" · "12%" */
  minutes: (n: number) => `${n} min`,
  share: (n: number) => `${n}%`,

  weekClosed: (date: string) => `Week closed ${date}`,
  nothingPlanned: "Nothing was planned this week.",

  /* -------------------------------------------------------------- WR-02 -- */
  thisWeek: (credit: number, counted: number) =>
    `${credit} of ${counted} this week`,
  lastFourWeeks: (credit: number, counted: number) =>
    `Last 4 weeks: ${credit} of ${counted}`,
  notAssigned: "not assigned",
  pending: "pending",
  /** "done 7:24" · "done 14:52 · moved from 7:45" */
  done: (clock: string) => `done ${clock}`,
  doneMoved: (clock: string, planned: string) =>
    `done ${clock} · moved from ${planned}`,
  /** "missed — something came up: long call · not counted" */
  missed: (tierPhrase: string, reason: string | null, weight: string) =>
    `missed — ${tierPhrase}${reason === null ? "" : `: ${reason}`} · ${weight}`,
  missedPlain: "missed — didn't do it",
  tradedUp: (title: string) => `traded up: stayed on ${title} · not counted`,
  cutWhenShifted: (weight: string) => `cut when shifted · ${weight}`,
  quantity: (value: number, unit: string) => `${value} ${unit}`,

  /** Official spec §10.2 — ST-06's headings, reused so the words are learned once. */
  tierPhrase: {
    circumstance: "something came up",
    scoping: "planned it wrong",
    chose_not_to: "chose not to",
  },
  weight: {
    "not-counted": "not counted",
    half: "counts half",
    missed: "counts as missed",
  },

  /* -------------------------------------------------------------- WR-03 -- */
  carriedTitle: "Carried into next week",
  firstAssigned: (date: string) => `first assigned ${date}`,
  carriedTimes: (n: number) => `carried ${n} ${n === 1 ? "time" : "times"}`,
  openNextWeek: "Open next week",
  nothingCarried: "Nothing was carried.",

  /* -------------------------------------------------------------- WR-04 -- */
  shiftsTitle: "Shifts",
  /** [COPY — needs Vesper sign-off; WR-04 lists no empty sentence.] */
  noShifts: "No shifts this week.",

  close: "Close",
  /** Monday first — the product's week (§7.4). */
  dayLabels: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
} as const;
