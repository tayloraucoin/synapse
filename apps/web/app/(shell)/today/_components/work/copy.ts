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
  /** A session's Done (USE-60; done-for-today.md, D-USE-57). */
  doneForTodayToast: (next: { n: number; day: string } | null) =>
    next
      ? `Done for today. Session ${next.n} is ${next.day}.`
      : "Done for today.",
  /** Step away (USE-60; step-away.md, stepped-away.md). */
  stepAway: "Step away",
  stepAwayName: "Step away, pause work time",
  heldLine: "Work time held · firing keeps counting",
  resumeAll: "Resume all",
  saidResumed: "Work time resumed.",
  /** The ask (USE-60; start-while-one-runs.md, D-USE-43). */
  askTitle: (title: string) => `Start ${title}`,
  askLead: (running: string) =>
    `One item is in hand at a time. ${running} is running; it moves to:`,
  askGroup: (running: string) => `Where ${running} goes`,
  askFiring: "Firing",
  askFiringLine: "Its prompt is out; firing time starts now",
  askPaused: "Paused",
  askPausedLine: "Work time held; Resume from its row",
  cancel: "Cancel",
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
  /** offline.md (USE-63, D-USE-56). */
  offline:
    "Offline. Everything works here; Linear catches up when back online.",
  workName: "Work",
} as const;
