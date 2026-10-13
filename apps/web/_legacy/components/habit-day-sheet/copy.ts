/** The habit-day sheet's strings — UX v1.1 §6.4, verbatim. */
export const HABIT_DAY_COPY = {
  todayOnly: "Today only",
  takes: "Takes",
  /** "usually 10–30" — information, never a limit (R21). */
  usually: (min: number, max: number) => `usually ${min}–${max}`,
  at: "At",
  inTheStack: "In the stack",
  atATime: "At a time",
  time: "Time",
  priorityToday: "Priority today",
  leaveOutToday: "Leave out today",
  cancel: "Cancel",
  save: "Save",
  changesTheDay: "Changes the day, not the habit.",
  alsoChangeHabit: "Also change the habit",
  offline: "Offline — you can look, but changes need a connection.",
} as const;
