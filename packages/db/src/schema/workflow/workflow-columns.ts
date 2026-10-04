/**
 * workflow_columns — a state a task is in, in one view (Workflow UX spec v0.1
 * §3.6, §11; Epic 7 TD-34).
 *
 * COLUMNS ARE ROWS, not jsonb on the view, because tasks reference them: a
 * removed column cannot orphan a task silently. `workflow_tasks.column_id`
 * RESTRICTS, so a column that holds tasks cannot be deleted until its tasks
 * are moved — exactly WF-04's *Move its tasks first*.
 *
 * AT MOST ONE OF EACH ROLE PER VIEW (W11) is held by the database, not
 * promised by the service: two partial unique indexes on `view_id`, one where
 * the role is `active` (tasks fire here), one where it is `done` (closed tasks
 * land here). `role` is nullable; no third value means "none".
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { WorkflowColumnRole } from "@syn/types";

import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { workflowTasks } from "./workflow-tasks";
import { workflowViews } from "./workflow-views";

/** WorkflowColumn.role — W11. One table, so it lives in this file (drizzle-orm-conventions §3). */
export const workflowColumnRoleEnum = pgEnum(
  "workflow_column_role",
  enumValues<WorkflowColumnRole>()(["active", "done"]),
);

export const workflowColumns = pgTable(
  "workflow_columns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** 1–40 (`WORKFLOW_NAME_MAX`). */
    name: text("name").notNull(),
    /** Null for a column with no role. */
    role: workflowColumnRoleEnum("role"),
    /** The column's place in its view — dense, rewritten by the service (TD-35). */
    sortOrder: smallint("sort_order").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    viewId: uuid("view_id")
      .notNull()
      .references(() => workflowViews.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("workflow_columns_view_id_active_idx")
      .on(table.viewId)
      .where(sql`${table.role} = 'active'`),
    uniqueIndex("workflow_columns_view_id_done_idx")
      .on(table.viewId)
      .where(sql`${table.role} = 'done'`),
    index("workflow_columns_view_id_sort_order_idx").on(table.viewId, table.sortOrder),
    index("workflow_columns_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "workflow_columns",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const workflowColumnsRelations = relations(workflowColumns, ({ many, one }) => ({
  tasks: many(workflowTasks),
  user: one(users, {
    fields: [workflowColumns.userId],
    references: [users.id],
  }),
  view: one(workflowViews, {
    fields: [workflowColumns.viewId],
    references: [workflowViews.id],
  }),
}));
