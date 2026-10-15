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
  todos: "To-dos",
  loading: "Today's work is loading.",
  /** error.md. */
  error: "Today didn't load.",
  errorDetail: "Timers that were running keep their time; nothing is lost.",
  tryAgain: "Try again",
  workName: "Work",
} as const;
