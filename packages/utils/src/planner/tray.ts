/**
 * The To-dos tray's rows (USE-19; D-USE-26, D-USE-69): which to-dos show on
 * a date and in what order, and what a reminder says.
 *
 * - An undated to-do shows while it is in the pool (`todoPool`); one that
 *   came back from an earlier day's block reads "From <weekday>".
 * - A dated to-do shows on its date, and after it while unchecked: carried,
 *   quietly, "From <weekday>" (N4); past a week, "From 3 Oct".
 * - A repeating to-do shows on the dates its rule hits.
 * - A checked to-do stays, checked, until the day ends (`dayStart`), then
 *   leaves. A to-do in a live slot is in its block, not the tray.
 * - Rows with a reminder today come first by time, then the rest oldest
 *   first. Never a count: the caller gets rows, not a number to show.
 */

import { daysBefore, weekdayForDayKey } from "../day";
import { occursOn, parseRule } from "./rrule";
import { todoPool, type TodoPoolSlot, type TodoPoolTodo } from "./todo-pool";

type Stamp = Date | string;

export interface TrayTodo extends TodoPoolTodo {
  title: string;
  rrule: string | null;
  /** `HH:MM`, wall clock. */
  remindAt: string | null;
  /** The reminder's day for a to-do with none (D-USE-37). */
  remindOn: string | null;
}

export interface TrayRow<T extends TrayTodo = TrayTodo> {
  todo: T;
  /** The `YYYY-MM-DD` it carried from; null when it belongs to the date. */
  carriedFrom: string | null;
  /** "From Sunday", "From 3 Oct"; null when not carried. */
  carriedLabel: string | null;
  /** `HH:MM` when it reminds on the date; null otherwise. */
  reminderAt: string | null;
}

const ms = (value: Stamp): number => {
  const n = new Date(value).getTime();
  return Number.isFinite(n) ? n : Infinity;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** "From Sunday" within the week; "From 3 Oct" past it ([ASSUMPTION], open.md). */
export function carriedLabel(fromKey: string, dateKey: string): string {
  if (daysBefore(fromKey, dateKey) < 7) {
    return `From ${weekdayForDayKey(fromKey)}`;
  }
  const [, month = "1", day = "1"] = fromKey.split("-");
  return `From ${Number(day)} ${MONTHS[Number(month) - 1] ?? ""}`;
}

function remindsOn(todo: TrayTodo, dateKey: string): string | null {
  if (todo.remindAt === null) return null;
  const on = todo.remindOn ?? todo.onDate;
  if (on !== null) return on === dateKey ? todo.remindAt : null;
  // A repeating to-do with no day reminds on each date it shows.
  return todo.rrule !== null ? todo.remindAt : null;
}

function hitsDate(rrule: string, dateKey: string): boolean {
  const parsed = parseRule(rrule);
  return parsed.ok && occursOn(parsed.rule, dateKey);
}

export function trayTodos<T extends TrayTodo>(input: {
  todos: readonly T[];
  slots: readonly TodoPoolSlot[];
  dateKey: string;
  now: Date;
  /** When the date's day opened: a to-do checked since then stays. */
  dayStart: Date;
}): TrayRow<T>[] {
  const { todos, slots, dateKey, now, dayStart } = input;
  const checkedToday = (todo: T) =>
    todo.doneAt !== null && ms(todo.doneAt) >= dayStart.getTime();

  const pool = new Map(
    todoPool({ todos, slots, now }).map((entry) => [
      entry.todoId,
      entry.returnedFrom,
    ]),
  );
  // In a live slot today: the block holds it, not the tray.
  const live = new Set(
    slots
      .filter(
        (slot) =>
          slot.todoId !== null &&
          slot.doneAt === null &&
          now.getTime() < slot.blockEnd.getTime(),
      )
      .map((slot) => slot.todoId),
  );

  const rows: TrayRow<T>[] = [];
  for (const todo of todos) {
    if (todo.archivedAt !== null) continue;
    if (todo.doneAt !== null && !checkedToday(todo)) continue;
    if (todo.doneAt === null && live.has(todo.id)) continue;

    let carriedFrom: string | null = null;
    if (todo.rrule !== null) {
      if (!hitsDate(todo.rrule, dateKey)) continue;
    } else if (todo.onDate !== null) {
      if (todo.onDate > dateKey) continue;
      if (todo.onDate < dateKey) carriedFrom = todo.onDate;
    } else if (todo.doneAt === null) {
      if (!pool.has(todo.id)) continue;
      const returned = pool.get(todo.id) ?? null;
      carriedFrom = returned !== null && returned < dateKey ? returned : null;
    }

    rows.push({
      todo,
      carriedFrom,
      carriedLabel:
        carriedFrom === null ? null : carriedLabel(carriedFrom, dateKey),
      reminderAt: remindsOn(todo, dateKey),
    });
  }

  return rows.sort((a, b) => {
    if (a.reminderAt !== null && b.reminderAt !== null) {
      if (a.reminderAt !== b.reminderAt)
        return a.reminderAt < b.reminderAt ? -1 : 1;
    } else if (a.reminderAt !== null) return -1;
    else if (b.reminderAt !== null) return 1;
    return (
      ms(a.todo.createdAt) - ms(b.todo.createdAt) ||
      (a.todo.id < b.todo.id ? -1 : a.todo.id > b.todo.id ? 1 : 0)
    );
  });
}

/** A reminder's body: the to-do in its own words, nothing added (N4). */
export function reminderBody(todo: { title: string }): string {
  return todo.title;
}
