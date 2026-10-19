import { dayWindow, nextTodoDue, resolveDayKey } from "@syn/utils";
import {
  todoInput,
  todoRecord,
  type BlockChangeRecord,
  type BlockRecord,
  type RemovedTodoInput,
  type SlotEventRecord,
  type SlotRecord,
  type TodoDoneInput,
  type TodoInput,
  type TodoRecord,
  type TodosReadOutput,
  type TodoUpdateInput,
} from "@syn/validators";
import { refuse } from "../../errors";
import type { RowStore } from "../undo/row-store";
import type { Row } from "../undo/tables";
import type { UndoChange } from "../undo/undo";

/**
 * The to-dos (USE-95): the To-dos tray, the To-do sheet and Now's To-dos
 * block, live. The fixture server's `readTodos`, `writeTodo`, `updateTodo`,
 * `writeTodoDone`, `removeTodo` and `restoreTodo`, with the same refusals.
 *
 * The server only stores: the pull rule (D-USE-74, oldest first into a
 * To-dos block at go) and "an undone slot back in the pool at its block's
 * end" stay the hooks' pure functions. Each write runs over a `TodoStore`
 * inside the one RLS transaction the router opens, so a refusal anywhere
 * rolls the whole of it back.
 */

export interface TodoStore {
  /** `users.timezone` and `users.day_close_time` (`HH:MM`). */
  account(): Promise<{ timeZone: string; dayCloseTime: string }>;
  todos(): Promise<TodoRecord[]>;
  /** The slots that hold a to-do, on any date. */
  todoSlots(): Promise<SlotRecord[]>;
  slotEvents(slotIds: readonly string[]): Promise<SlotEventRecord[]>;
  blocks(): Promise<BlockRecord[]>;
  blockChanges(dates: readonly string[]): Promise<BlockChangeRecord[]>;
  /**
   * Row writes by record. Removing a to-do takes its slots and their events
   * by foreign-key cascade (USE-2), as the database does.
   */
  rows: RowStore;
}

const NO_TODO = "No to-do with that id.";

const unknownTodo = () => refuse("unknown", NO_TODO);

async function todoOf(store: TodoStore, id: string): Promise<TodoRecord> {
  const row = (await store.todos()).find((todo) => todo.id === id);
  if (!row) throw unknownTodo();
  return row;
}

async function todayKey(store: TodoStore, now: Date): Promise<string> {
  const { timeZone, dayCloseTime } = await store.account();
  return resolveDayKey(now, timeZone, dayCloseTime);
}

/* ----------------------------------------------------------------- read -- */

/** `todo.list`: the shape `readTodos` returns. */
export async function listTodos(
  store: TodoStore,
  dateKey: string,
): Promise<TodosReadOutput> {
  const { timeZone, dayCloseTime } = await store.account();
  const slots = await store.todoSlots();
  const dates = [...new Set(slots.map((slot) => slot.onDate))];
  return {
    date: dateKey,
    timeZone,
    dayWindow: dayWindow(dateKey, timeZone, dayCloseTime),
    todos: await store.todos(),
    slots,
    blocks: await store.blocks(),
    // Only the slots' dates: a slot's end is all the tray reads them for.
    blockChanges: dates.length === 0 ? [] : await store.blockChanges(dates),
  };
}

/* --------------------------------------------------------------- writes -- */

/** `todo.create`, the fixture's `writeTodo`: the input is `todoInput` already. */
export async function createTodo(
  store: TodoStore,
  input: TodoInput,
  now: Date,
  id: string = crypto.randomUUID(),
): Promise<TodoRecord> {
  const stamp = now.toISOString();
  const record = todoRecord.parse({
    id,
    createdAt: stamp,
    updatedAt: stamp,
    title: input.title,
    type: input.type,
    icon: input.icon ?? null,
    lengthMin: input.lengthMin ?? null,
    notes: input.notes ?? null,
    onDate: input.onDate ?? null,
    rrule: input.rrule ?? null,
    remindAt: input.remindAt ?? null,
    remindOn: input.remindOn ?? null,
    doneAt: null,
    archivedAt: null,
  });
  if (!(await store.rows.insert("todos", record))) throw unknownTodo();
  return record;
}

/**
 * `todo.update`, the To-do sheet's change (USE-28): only the keys sent
 * change, checked against `todoInput` as the to-do will be after it. A day
 * given, or a reminder's day moved, is never before today (USE-29); a day
 * already stored and sent again is left alone.
 */
export async function updateTodo(
  store: TodoStore,
  { id, patch }: TodoUpdateInput,
  now: Date,
): Promise<TodoRecord> {
  const row = await todoOf(store, id);
  const parsed = todoInput.safeParse({ ...row, ...patch });
  if (!parsed.success) {
    throw refuse(
      "invalid",
      parsed.error.issues[0]?.message ?? "Invalid to-do.",
    );
  }
  const today = await todayKey(store, now);
  for (const key of ["onDate", "remindOn"] as const) {
    const day = patch[key];
    if (typeof day === "string" && day !== row[key] && day < today) {
      throw refuse("past-day", "A day before today.");
    }
  }
  const next: TodoRecord = { ...row, updatedAt: now.toISOString() };
  for (const key of Object.keys(patch) as (keyof TodoInput)[]) {
    Object.assign(next, { [key]: parsed.data[key] ?? null });
  }
  const record = todoRecord.parse(next);
  if (!(await store.rows.update("todos", record))) throw unknownTodo();
  return record;
}

/**
 * `todo.setDone`, a to-do's box: `doneAt` set, or cleared by uncheck. A
 * repeating one checked comes back on its next due date as a new to-do; the
 * done one stays done (repeats-open.md). The rule moves to the new one, so
 * the series has one open to-do and one live rule.
 */
export async function setTodoDone(
  store: TodoStore,
  { id, doneAt }: TodoDoneInput,
  now: Date,
): Promise<TodoRecord> {
  const row = await todoOf(store, id);
  const wasDone = row.doneAt !== null;
  const done: TodoRecord = { ...row, doneAt, updatedAt: now.toISOString() };
  if (doneAt !== null && !wasDone && row.rrule !== null) {
    const { timeZone, dayCloseTime } = await store.account();
    const due = nextTodoDue({
      rrule: row.rrule,
      onDate: row.onDate,
      checkedOn: resolveDayKey(new Date(doneAt), timeZone, dayCloseTime),
    });
    if (due !== null) {
      const following = todoRecord.parse({
        ...done,
        id: crypto.randomUUID(),
        createdAt: done.updatedAt,
        onDate: due,
        remindOn: row.remindAt === null ? null : due,
        doneAt: null,
      });
      if (!(await store.rows.insert("todos", following))) throw unknownTodo();
      done.rrule = null;
    }
  }
  const record = todoRecord.parse(done);
  if (!(await store.rows.update("todos", record))) throw unknownTodo();
  return record;
}

/**
 * `todo.remove`, Delete to-do (USE-29): the to-do, the slots that took it on
 * any date and their events, all at once. The to-do's row goes and the
 * foreign keys take the rest (a cascade is not a policy, so slot_events stays
 * append-only for callers). Returns what went, for `todo.restore`, and the
 * same as Undo's changes, events first, so Undo puts back the to-do first.
 */
export async function removeTodo(
  store: TodoStore,
  id: string,
): Promise<{ removed: RemovedTodoInput; changes: UndoChange[] }> {
  const todo = await todoOf(store, id);
  const slots = (await store.todoSlots()).filter((slot) => slot.todoId === id);
  const slotEvents =
    slots.length === 0
      ? []
      : await store.slotEvents(slots.map((slot) => slot.id));
  if (!(await store.rows.remove("todos", id))) throw unknownTodo();
  const changes: UndoChange[] = [
    ...slotEvents.map((before) => ({
      table: "slotEvents" as const,
      op: "delete" as const,
      before: before as Row,
    })),
    ...slots.map((before) => ({
      table: "slots" as const,
      op: "delete" as const,
      before: before as Row,
    })),
    { table: "todos", op: "delete", before: todo as Row },
  ];
  return { removed: { todo, slots, slotEvents }, changes };
}

/**
 * `todo.restore`, Undo of a delete: the to-do, then its slots, then their
 * events, back with their ids and times. Undo twice puts it back once: a row
 * of the caller's already standing is left as it is.
 *
 * REFUSED "unknown", writing nothing: a slot that names another to-do or a
 * block not the caller's, an event of a slot not in the list, and an id
 * another account holds (its insert reaches no row of the caller's). A
 * foreign key does not see RLS, so these are checked here.
 */
export async function restoreTodo(
  store: TodoStore,
  { todo, slots, slotEvents }: RemovedTodoInput,
): Promise<TodoRecord> {
  const blockIds = new Set((await store.blocks()).map((block) => block.id));
  const slotIds = new Set(slots.map((slot) => slot.id));
  if (
    slots.some((slot) => slot.todoId !== todo.id || !blockIds.has(slot.blockId))
  ) {
    throw refuse("unknown", "No block with that id.");
  }
  if (slotEvents.some((event) => !slotIds.has(event.slotId))) {
    throw refuse("unknown", "No slot with that id.");
  }

  const standing = (await store.todos()).some((row) => row.id === todo.id);
  if (!standing && !(await store.rows.insert("todos", todo as Row))) {
    throw unknownTodo();
  }
  const slotsStanding = new Set(
    (await store.todoSlots())
      .filter((slot) => slot.todoId === todo.id)
      .map((slot) => slot.id),
  );
  for (const slot of slots) {
    if (slotsStanding.has(slot.id)) continue;
    if (!(await store.rows.insert("slots", slot as Row))) {
      throw refuse("unknown", "No slot with that id.");
    }
  }
  const eventsStanding = new Set(
    slotEvents.length === 0
      ? []
      : (await store.slotEvents([...slotIds])).map((event) => event.id),
  );
  for (const event of slotEvents) {
    if (eventsStanding.has(event.id)) continue;
    if (!(await store.rows.insert("slotEvents", event as Row))) {
      throw refuse("unknown", "No slot with that id.");
    }
  }
  return todo;
}
