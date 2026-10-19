/**
 * The welcome's words (USE-43; interactions/ready-go/states/), all
 * [placeholder] until Gloss (D-USE-71). No second person, no count, never
 * "late" or "missed": the payoff is in the words and the type (A-13).
 */
export const WELCOME_COPY = {
  /** The tab's title. */
  pageTitle: "The day is set",
  title: "The day is set.",
  back: "Review the day",
  backLabel: "Back to Review the day",
  orient: "Today, as I see it",
  day: "The day",
  first: "First",
  now: "Now",
  then: (name: string) => `then ${name}`,
  span: (start: string, end: string) => `${start} to ${end}`,
  underWay: (end: string) => `under way, until ${end}`,
  allDay: "any order, all day",
  start: (name: string) => `Start ${name}`,
  openList: "Open the list",
  early: (at: string) => `Planned for ${at}. Starting early is fine.`,
  pickUp: (from: string) => `Planned from ${from}. Pick up where it is.`,
  oneList: "One list today, done in any order.",
  /** The first go ever (D-USE-71, D-USE-88): shown once, never again. */
  teaching: "From here, at the bottom",
  tabs: [
    { tab: "today", name: "Now", line: "the block under way, to-dos on top" },
    { tab: "schedule", name: "Schedule", line: "the whole day, to change it" },
    { tab: "review", name: "Review", line: "the days behind" },
  ],
  offline: "Offline. The day is saved on this phone.",
  loading: "Loading the day",
} as const;
