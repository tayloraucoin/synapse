/**
 * The To-dos tray's words (USE-19; day/todos/words-and-access.md). Never a
 * count; no second person; a failure is a sentence in ink.
 */

/** "HH:MM" to the boards' clock, "10:00", "15:30": the day's hours, as Now's. */
export function trayClock(clock: string): string {
  const [hour = "0", minute = "00"] = clock.split(":");
  return `${Number(hour)}:${minute}`;
}

export const TODOS_TRAY_COPY = {
  label: "To-dos",
  add: "Add a to-do",
  addPlaceholder: "To-do",
  /** The bell's name, read with the time: "Reminder at 10:00". */
  reminder: (at: string) => `Reminder at ${trayClock(at)}`,
  boxName: (title: string) => title,
  rowName: (title: string) => `${title}, open`,
  notSaved: "Not saved.",
  listFailed: "To-dos didn't load.",
  tryAgain: "Try again",
  /** The longest title `plannerNameSchema` takes. */
  titleMax: 120,
} as const;

/** The reminder as the lock screen shows it (notification.md). */
export const REMINDER_PREVIEW_COPY = {
  app: "Synapse",
  when: "now",
  region: "A to-do reminder on the lock screen",
} as const;
