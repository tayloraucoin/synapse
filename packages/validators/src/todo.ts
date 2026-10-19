import { z } from "zod";
import { TODO_TYPES } from "@syn/constants";
import { iconValueSchema } from "./icon";
import { dateKeySchema } from "./keys";
import {
  blockChangeRecord,
  blockRecord,
  instantSchema,
  lengthMinutesSchema,
  plannerNameSchema,
  rruleSchema,
  slotEventRecord,
  slotRecord,
  startTimeSchema,
} from "./planner";

/**
 * To-dos (USE-3): the pool a To-dos block pulls from (D-USE-74). Type is a
 * context on the to-do, never a block filter, and every to-do has Notes
 * (D-USE-35). A slot joins one to a block for a date (`placeSlotInput`).
 */

export const todoTypeSchema = z.enum(TODO_TYPES);

export const todoRecord = z.object({
  id: z.string().uuid(),
  createdAt: instantSchema,
  updatedAt: instantSchema,
  title: z.string(),
  type: todoTypeSchema,
  icon: iconValueSchema.nullable(),
  lengthMin: lengthMinutesSchema.nullable(),
  notes: z.string().nullable(),
  onDate: dateKeySchema.nullable(),
  rrule: rruleSchema.nullable(),
  /** A wall-clock time in `users.timezone` (`todo_reminder`). */
  remindAt: startTimeSchema.nullable(),
  /** `0014`: the reminder's day for a to-do with none (D-USE-37). */
  remindOn: dateKeySchema.nullable(),
  doneAt: instantSchema.nullable(),
  archivedAt: instantSchema.nullable(),
});

export type TodoRecord = z.infer<typeof todoRecord>;

/**
 * The To-do sheet's write. A day, a repeat, both or neither: `0012` has no
 * CHECK between them, so none is invented here.
 */
export const todoInput = z.object({
  title: plannerNameSchema,
  type: todoTypeSchema,
  icon: iconValueSchema.nullish(),
  lengthMin: lengthMinutesSchema.nullish(),
  notes: z.string().trim().max(4000).nullish(),
  onDate: dateKeySchema.nullish(),
  rrule: rruleSchema.nullish(),
  remindAt: startTimeSchema.nullish(),
  /** The At row's day: Today, Tomorrow or Pick a day… (D-USE-69). */
  remindOn: dateKeySchema.nullish(),
});

export type TodoInput = z.infer<typeof todoInput>;

/* ------------------------------------------------- the to-dos' read, live -- */

/**
 * `todo.list` (USE-95), the fixture server's `readTodos`: every to-do, the
 * to-do slots on any date and the blocks they sit in, with the block changes
 * of those slots' dates, so a slot's end is read as the day reads it.
 */
export const todosReadInput = z.object({ dateKey: dateKeySchema });

export const todosReadOutput = z.object({
  date: dateKeySchema,
  timeZone: z.string(),
  /** `[start, end)` of the date's day: a to-do checked since `start` stays. */
  dayWindow: z.object({ start: z.date(), end: z.date() }),
  todos: z.array(todoRecord),
  slots: z.array(slotRecord),
  blocks: z.array(blockRecord),
  blockChanges: z.array(blockChangeRecord),
});

export type TodosReadOutput = z.infer<typeof todosReadOutput>;

/** The To-do sheet's change: only the keys sent change (USE-28). */
export const todoUpdateInput = z.object({
  id: z.string().uuid(),
  patch: todoInput.partial(),
});

export type TodoUpdateInput = z.infer<typeof todoUpdateInput>;

/** A to-do's box: `doneAt` set, or cleared by uncheck. */
export const todoDoneInput = z.object({
  id: z.string().uuid(),
  doneAt: instantSchema.nullable(),
});

export type TodoDoneInput = z.infer<typeof todoDoneInput>;

export const todoIdInput = z.object({ id: z.string().uuid() });

/**
 * A deleted to-do with everything that went with it (USE-29): the slots that
 * took it and their events, as `slots.todo_id`'s cascade takes them. Restore
 * puts back exactly this, ids and times included.
 */
export const removedTodoInput = z.object({
  todo: todoRecord,
  slots: z.array(slotRecord),
  slotEvents: z.array(slotEventRecord),
});

export type RemovedTodoInput = z.infer<typeof removedTodoInput>;

/** `todo.remove`: what went, and the same as an Undo token (USE-92). */
export const removedTodoOutput = removedTodoInput.extend({ undo: z.string() });
