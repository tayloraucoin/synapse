import { and, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { buildServiceRoleAuthContext } from "@syn/auth";
import { createRlsClient, db, slots, todos, users } from "@syn/db";
import { createLogger } from "@syn/observability";
import {
  occursOn,
  parseRule,
  reminderBody,
  wallClockToInstant,
} from "@syn/utils";
import { todoReminderPayload } from "../notifications/build-payload";
import {
  inWindow,
  pushWindow,
  rlsPushDeps,
  windowDates,
  type PushDeps,
  type PushWindow,
} from "./push-window";
import type { ScheduledJob } from "./run-scheduled-jobs";

/**
 * `todo_reminder` (USE-105; D-USE-37): a to-do's reminder, pushed at its
 * time on the day it names, to the phone and the desk.
 *
 * WHICH DAY. `remind_on` (0014), else the to-do's own day; a repeating one
 * with neither reminds on each date its rule hits, as the tray reads it
 * (`trayTodos`). The time is a wall clock in the account's zone.
 *
 * NEVER FOR ONE ALREADY DONE: a checked to-do, or one checked in a To-dos
 * block's slot that date, sends nothing. A repeating one checked has already
 * handed its rule to the next one, which reminds on its own day.
 *
 * ONCE: the deliveries row is inserted first and the push goes only when the
 * insert returned it (`claimDelivery`), so an overlapping window sends nothing
 * twice.
 *
 * THE ONE RLS BYPASS IS NAMED, as `expire-exports` names it: the scan for
 * accounts with an open reminder uses the singleton `db` and reads user ids
 * alone; every row after it is read under `buildServiceRoleAuthContext`.
 *
 * NOTHING PERSONAL IS LOGGED: a count, and a message on failure.
 */

const log = createLogger("jobs/todo-reminders");

export type ReminderTodo = {
  id: string;
  title: string;
  onDate: string | null;
  rrule: string | null;
  /** `HH:MM`, wall clock. */
  remindAt: string | null;
  remindOn: string | null;
  doneAt: Date | null;
  archivedAt: Date | null;
};

export type DoneSlot = { todoId: string; onDate: string };

export type DueReminder = { todo: ReminderTodo; dueAt: Date };

/** The day a to-do reminds on, for a date: true when `dateKey` is it. */
function remindsOn(todo: ReminderTodo, dateKey: string): boolean {
  const on = todo.remindOn ?? todo.onDate;
  if (on !== null) return on === dateKey;
  if (todo.rrule === null) return false;
  const parsed = parseRule(todo.rrule);
  return parsed.ok && occursOn(parsed.rule, dateKey);
}

/** The reminders due in the window: open to-dos, on their day, at their time. */
export function dueTodoReminders(input: {
  todos: readonly ReminderTodo[];
  doneSlots: readonly DoneSlot[];
  timeZone: string;
  window: PushWindow;
}): DueReminder[] {
  const { todos: rows, doneSlots, timeZone, window } = input;
  const doneOn = new Set(doneSlots.map((s) => `${s.todoId}|${s.onDate}`));
  const due: DueReminder[] = [];
  for (const dateKey of windowDates(window, timeZone)) {
    for (const todo of rows) {
      if (todo.remindAt === null) continue;
      if (todo.doneAt !== null || todo.archivedAt !== null) continue;
      if (doneOn.has(`${todo.id}|${dateKey}`)) continue;
      if (!remindsOn(todo, dateKey)) continue;
      const dueAt = wallClockToInstant(dateKey, todo.remindAt, timeZone);
      if (inWindow(dueAt, window)) due.push({ todo, dueAt });
    }
  }
  return due;
}

/** Claim then send, one push per reminder; returns how many were sent. */
export async function sendTodoReminders(
  due: readonly DueReminder[],
  timeZone: string,
  deps: PushDeps,
): Promise<number> {
  let sent = 0;
  for (const { todo, dueAt } of due) {
    const claim = await deps.claim({
      kind: "todo_reminder",
      targetId: todo.id,
      targetKey: null,
      scheduledFor: dueAt,
    });
    if (claim === "duplicate" || claim === "skipped") continue;
    await deps.send(
      [claim.id],
      todoReminderPayload({
        title: reminderBody(todo),
        dueAt,
        timeZone,
        // `todayRoute({ todo })` in `apps/web/lib/routes.ts`: the tray, on it.
        url: `/today?todo=${encodeURIComponent(todo.id)}`,
      }),
    );
    sent += 1;
  }
  return sent;
}

/** `HH:MM` from Postgres's `HH:MM:SS`. */
const clockOf = (value: string | null) =>
  value === null ? null : value.slice(0, 5);

/** One account's reminders, read and sent under its own RLS client. */
export async function remindTodosFor(
  userId: string,
  now: Date,
): Promise<number> {
  const rls = createRlsClient(buildServiceRoleAuthContext(userId));
  const window = pushWindow(now);
  const read = await rls.execute(async (tx) => {
    const [account] = await tx
      .select({ timeZone: users.timezone })
      .from(users)
      .where(eq(users.id, userId));
    if (!account) return null;
    const dates = windowDates(window, account.timeZone);
    const open = await tx
      .select({
        id: todos.id,
        title: todos.title,
        onDate: todos.onDate,
        rrule: todos.rrule,
        remindAt: todos.remindAt,
        remindOn: todos.remindOn,
        doneAt: todos.doneAt,
        archivedAt: todos.archivedAt,
      })
      .from(todos)
      .where(
        and(
          isNotNull(todos.remindAt),
          isNull(todos.doneAt),
          isNull(todos.archivedAt),
        ),
      );
    const done = await tx
      .select({ todoId: slots.todoId, onDate: slots.onDate })
      .from(slots)
      .where(
        and(
          isNotNull(slots.todoId),
          isNotNull(slots.doneAt),
          inArray(slots.onDate, dates),
        ),
      );
    return { timeZone: account.timeZone, open, done };
  });
  if (read === null) return 0;

  const due = dueTodoReminders({
    todos: read.open.map((row) => ({
      ...row,
      remindAt: clockOf(row.remindAt),
    })),
    doneSlots: read.done.flatMap((row) =>
      row.todoId === null ? [] : [{ todoId: row.todoId, onDate: row.onDate }],
    ),
    timeZone: read.timeZone,
    window,
  });
  return sendTodoReminders(due, read.timeZone, rlsPushDeps(rls, userId, now));
}

export async function remindTodos(now: Date = new Date()): Promise<number> {
  // System path: "which accounts anywhere have an open reminder" is no session's question.
  const accounts = await db
    .selectDistinct({ userId: todos.userId })
    .from(todos)
    .where(
      and(
        isNotNull(todos.remindAt),
        isNull(todos.doneAt),
        isNull(todos.archivedAt),
      ),
    );

  let sent = 0;
  for (const { userId } of accounts) {
    try {
      sent += await remindTodosFor(userId, now);
    } catch (error) {
      // One account's failure must not stop the rest.
      log.log("could not send one account's reminders", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return sent;
}

export const todoRemindersJob: ScheduledJob = {
  name: "todo_reminder",
  run: () => remindTodos(),
};
