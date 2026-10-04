/**
 * workflow_views — one board: a named set of columns with the tasks in them
 * (Workflow UX spec v0.1 §3.6, §11; Epic 7 TD-33, TD-34).
 *
 * A VIEW OWNS ITS COLUMNS (W10). Nothing points back at the template it was
 * made from — a template is only where a view's columns started. The two
 * starter views are made on the first board read (`ensureWorkflowDefaults`,
 * TD-41), never by a migration.
 *
 * `last_opened_at` is how `/workflow` knows which view to return to (TD-44).
 * `sort_order` is the view tabs' order. ARCHIVE, NEVER DELETE (W18): an
 * archived view keeps its columns and tasks and brings them back with it.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import { index, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { workflowColumns } from "./workflow-columns";
import { workflowTasks } from "./workflow-tasks";

export const workflowViews = pgTable(
  "workflow_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** The view `/workflow` returns to is the one opened last. */
    lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }),
    /** 1–40 (`WORKFLOW_NAME_MAX`, the validator's bound). */
    name: text("name").notNull(),
    /** The view tabs' order — dense, rewritten by the service (TD-35). */
    sortOrder: smallint("sort_order").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("workflow_views_user_id_sort_order_idx").on(table.userId, table.sortOrder),
    index("workflow_views_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "workflow_views",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const workflowViewsRelations = relations(workflowViews, ({ many, one }) => ({
  columns: many(workflowColumns),
  tasks: many(workflowTasks),
  user: one(users, {
    fields: [workflowViews.userId],
    references: [users.id],
  }),
}));
