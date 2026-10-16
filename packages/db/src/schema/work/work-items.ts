/**
 * work_items — the work pool (D-USE-31). Tiers slot items into a day through
 * `slots`; an item can sit in several days as sessions (D-USE-42).
 *
 * DONE. The task is done when Taylor marks it done or Linear closes it
 * (`done_source`), and every open session closes with it (D-USE-97).
 *
 * LENGTH is a range (`length_min_min` to `length_max_min`); the fit is
 * measured at its top (D-USE-42). `size` null is unsized.
 *
 * LINEAR. `linear_connection_id` points at its workspace (`0016`, USE-100);
 * a disconnect leaves the item in the pool, unlinked. Nothing is written to
 * Linear from this table.
 *
 * A sub-issue is a row with `parent_work_item_id`. Deleting the parent leaves
 * the child in the pool, unparented.
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
  timestamp,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { DONE_SOURCES, WORK_SIZES } from "@syn/constants";
import type { DoneSource, IconValue, WorkSize } from "@syn/types";
import { enumValues } from "../enum-values";
import { linearConnections } from "../integrations/linear-connections";
import { slots } from "../planner/slots";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { clients } from "./clients";

export const workSizeEnum = pgEnum(
  "work_size",
  enumValues<WorkSize>()(WORK_SIZES),
);

export const doneSourceEnum = pgEnum(
  "done_source",
  enumValues<DoneSource>()(DONE_SOURCES),
);

export const workItems = pgTable(
  "work_items",
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
    doneSource: doneSourceEnum("done_source"),
    dueOn: date("due_on"),
    // JSON shape: IconValue — see @syn/types.
    icon: jsonb("icon").$type<IconValue>(),
    lengthMaxMin: smallint("length_max_min"),
    lengthMinMin: smallint("length_min_min"),
    linearConnectionId: uuid("linear_connection_id").references(
      (): AnyPgColumn => linearConnections.id,
      { onDelete: "set null" },
    ),
    /** ENG-123, as Linear shows it. */
    linearIdentifier: text("linear_identifier"),
    linearIssueId: text("linear_issue_id"),
    /** Where Uncheck moves the issue back to. */
    linearPrevStateId: text("linear_prev_state_id"),
    notes: text("notes"),
    size: workSizeEnum("size"),
    title: text("title").notNull(),

    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    parentWorkItemId: uuid("parent_work_item_id").references(
      (): AnyPgColumn => workItems.id,
      { onDelete: "set null" },
    ),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    check(
      "work_items_length_range_check",
      sql`${table.lengthMinMin} <= ${table.lengthMaxMin}`,
    ),
    check("work_items_length_min_min_check", sql`${table.lengthMinMin} > 0`),
    index("work_items_client_id_idx").on(table.clientId),
    index("work_items_linear_connection_id_idx").on(table.linearConnectionId),
    index("work_items_parent_work_item_id_idx").on(table.parentWorkItemId),
    index("work_items_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "work_items",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const workItemsRelations = relations(workItems, ({ many, one }) => ({
  children: many(workItems, { relationName: "work_item_parent" }),
  client: one(clients, {
    fields: [workItems.clientId],
    references: [clients.id],
  }),
  parent: one(workItems, {
    fields: [workItems.parentWorkItemId],
    references: [workItems.id],
    relationName: "work_item_parent",
  }),
  slots: many(slots),
  user: one(users, {
    fields: [workItems.userId],
    references: [users.id],
  }),
}));
