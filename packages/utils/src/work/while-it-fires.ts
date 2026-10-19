import { parseRule } from "../planner";
import type { WorkNext } from "./next";

/**
 * The one daily reminder Today shows while something fires (USE-8;
 * D-USE-53): "While it fires: <reminder>", once, while a daily reminder is
 * undone. Nothing firing, or everything firing (the reminder line hides
 * under "Everything is firing."), shows none.
 *
 * A daily reminder has a `remindAt` and a FREQ=DAILY rule, and is dated on or
 * before the day, or undated. The first by time wins; ties by when it was
 * made, then id.
 */

export interface ReminderTodo {
  id: string;
  /** `HH:MM`, wall clock. */
  remindAt: string | null;
  rrule: string | null;
  onDate: string | null;
  doneAt: Date | string | null;
  archivedAt: Date | string | null;
  createdAt: Date | string;
}

function isDailyReminder(todo: ReminderTodo, dateKey: string): boolean {
  if (todo.remindAt === null || todo.rrule === null) return false;
  if (todo.doneAt !== null || todo.archivedAt !== null) return false;
  if (todo.onDate !== null && todo.onDate > dateKey) return false;
  const parsed = parseRule(todo.rrule);
  return parsed.ok && parsed.rule.freq === "DAILY";
}

const stamp = (value: Date | string): number => {
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : Infinity;
};

export function pickWhileItFires(input: {
  todos: readonly ReminderTodo[];
  dateKey: string;
  next: WorkNext;
  firingCount: number;
}): string | null {
  if (input.firingCount <= 0 || input.next.kind === "all_firing") return null;

  const first = input.todos
    .filter((todo) => isDailyReminder(todo, input.dateKey))
    .sort(
      (a, b) =>
        (a.remindAt as string).localeCompare(b.remindAt as string) ||
        stamp(a.createdAt) - stamp(b.createdAt) ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    )[0];
  return first?.id ?? null;
}
