/**
 * todos — the to-dos pool (the model dev note). A to-do with no `on_date` is
 * in the pool; with one, it is planned for that day. A daily reminder is a
 * to-do with a daily rule and a `remind_at`.
 *
 * `type` is a fact about the to-do, never a block filter: any to-do can go in
 * any To-dos block (D-USE-35). Notes on every to-do (D-USE-35).
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { TODO_TYPES } from "@syn/constants";
import type { IconValue, TodoType } from "@syn/types";
import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { slots } from "./slots";

/** Home, Errand, Call, Digital, Other — a context, as Getting Things Done has them. */
export const todoTypeEnum = pgEnum(
  "todo_type",
  enumValues<TodoType>()(TODO_TYPES),
);

export const todos = pgTable(
  "todos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    doneAt: timestamp("done_at", { withTimezone: true }),
    // JSON shape: IconValue — see @syn/types.
    icon: jsonb("icon").$type<IconValue>(),
    lengthMin: smallint("length_min"),
    notes: text("notes"),
    /** Null is the pool. */
    onDate: date("on_date"),
    /** A wall-clock time in `users.timezone` (`todo_reminder`). */
    remindAt: time("remind_at"),
    /** RFC 5545, one rule; null does not repeat. */
    rrule: text("rrule"),
    title: text("title").notNull(),
    type: todoTypeEnum("type").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    check("todos_length_min_check", sql`${table.lengthMin} > 0`),
    index("todos_user_id_on_date_idx").on(table.userId, table.onDate),
    index("todos_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "todos",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const todosRelations = relations(todos, ({ many, one }) => ({
  slots: many(slots),
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
  }),
}));
