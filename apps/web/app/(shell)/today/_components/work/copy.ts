/**
 * Today's work words (USE-57; work/today/words-and-access.md). No second
 * person, no question, no count: times, lengths and a session's place only
 * (D-USE-47).
 */
export const WORK_COPY = {
  /** The desk's Next strip. */
  nextLabel: "Next",
  go: "Go",
  goName: (title: string) => `Go to Next, ${title}`,
  /** The lifted card. */
  start: "Start",
  done: "Done",
  doneName: (title: string) => `Done, ${title}`,
  next: "next",
  /** The running card (USE-59). */
  resume: "Resume",
  pause: "Pause",
  promptSent: "Prompt sent",
  inHand: (title: string) => `${title}, in hand`,
  doneToast: (title: string) => `${title} done.`,
  /** Said politely (words-and-access.md). */
  saidFiring: (title: string) => `${title} firing.`,
  saidBack: (title: string) => `${title} back.`,
  saidNext: (title: string) => `Next: ${title}.`,
  /** Everything firing (everything-firing.md, D-USE-43). */
  allFiring: "Everything is firing.",
  allFiringLead: "To-dos, while it all fires",
  todos: "To-dos",
  loading: "Today's work is loading.",
  /** error.md. */
  error: "Today didn't load.",
  errorDetail: "Timers that were running keep their time; nothing is lost.",
  tryAgain: "Try again",
  workName: "Work",
} as const;
