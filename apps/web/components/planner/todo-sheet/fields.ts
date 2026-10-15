import type { TodoInput, TodoRecord } from "@syn/validators";

/**
 * What each of the To-do sheet's fields writes (USE-28), kept apart from the
 * sheet so a test reads the same decisions: one write per change, nothing
 * when nothing changed, and a new to-do written only once it has a title.
 */

export type TitleWrite =
  | { kind: "none" }
  | { kind: "create"; title: string }
  | { kind: "update"; patch: Pick<TodoInput, "title"> };

/** The title as typed, on blur or Enter. An emptied title goes back to the saved one. */
export function titleWrite(
  draft: string,
  saved: Pick<TodoRecord, "title"> | null,
): TitleWrite {
  const title = draft.trim();
  if (title === "") return { kind: "none" };
  if (saved === null) return { kind: "create", title };
  if (title === saved.title) return { kind: "none" };
  return { kind: "update", patch: { title } };
}

/** Notes as typed, on blur: empty is none. Null when nothing changed. */
export function notesWrite(
  draft: string,
  saved: Pick<TodoRecord, "notes">,
): Pick<TodoInput, "notes"> | null {
  const notes = draft.trim() === "" ? null : draft;
  return notes === saved.notes ? null : { notes };
}

/**
 * The switch: on lands the reminder on the next whole hour, today, or
 * tomorrow at midnight late at night [ASSUMPTION: the boards draw a time
 * typed after]; off clears the day and the time, so none is sent.
 */
export function reminderSwitchWrite(input: {
  on: boolean;
  /** The person's wall clock now, minutes since midnight. */
  nowMinutes: number;
  todayKey: string;
  tomorrowKey: string;
}): Pick<TodoInput, "remindOn" | "remindAt"> {
  const { on, nowMinutes, todayKey, tomorrowKey } = input;
  if (!on) return { remindOn: null, remindAt: null };
  const hour = Math.floor(nowMinutes / 60) + 1;
  return hour < 24
    ? { remindOn: todayKey, remindAt: `${String(hour).padStart(2, "0")}:00` }
    : { remindOn: tomorrowKey, remindAt: "00:00" };
}

/** The At row's time: the day comes with it, today when none was set. */
export function reminderTimeWrite(
  remindAt: string,
  saved: Pick<TodoRecord, "remindOn" | "remindAt">,
  todayKey: string,
): Pick<TodoInput, "remindOn" | "remindAt"> | null {
  if (remindAt === saved.remindAt) return null;
  return { remindAt, remindOn: saved.remindOn ?? todayKey };
}

/**
 * Give it a day… (USE-29): the to-do's day only, never the reminder's. Null
 * for a day before today, or the day it already has.
 */
export function giveADayWrite(
  dateKey: string,
  saved: Pick<TodoRecord, "onDate">,
  todayKey: string,
): Pick<TodoInput, "onDate"> | null {
  if (dateKey < todayKey || dateKey === saved.onDate) return null;
  return { onDate: dateKey };
}

/**
 * The At row's Pick a day… (USE-29): the reminder's day only, never the
 * to-do's. Null for a day before today, or the day it already has.
 */
export function remindOnWrite(
  dateKey: string,
  saved: Pick<TodoRecord, "remindOn">,
  todayKey: string,
): Pick<TodoInput, "remindOn"> | null {
  if (dateKey < todayKey || dateKey === saved.remindOn) return null;
  return { remindOn: dateKey };
}
