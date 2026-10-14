import { z } from "zod";
import { TODO_TYPES } from "@syn/constants";
import { iconValueSchema } from "./icon";
import { dateKeySchema } from "./keys";
import {
  instantSchema,
  lengthMinutesSchema,
  plannerNameSchema,
  rruleSchema,
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
