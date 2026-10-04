/**
 * workflow_tasks — one thread of work; a row on the board (Workflow UX spec
 * v0.1 §3.2–§3.8, §11; Epic 7 TD-33–TD-36). On screen the noun is *Task*; in
 * code it is always a *workflow task*, because a habit has a task type too.
 *
 * FIRING IS A TIMESTAMP, NOT A FLAG (TD-36). `firing_started_at` set means a
 * prompt is running; `last_returned_at` is when it last came back. There is no
 * boolean beside them to disagree with them. *Next* is not stored anywhere —
 * it is computed from order on every render (TD-38).
 *
 * THE ON-DELETE RULES ARE THE DESIGN.
 * - `column_id` RESTRICTS: a column holding tasks cannot be deleted until they
 *   are moved (WF-04). A cascade here would delete a person's work.
 * - `group_id` SETS NULL: the lane *No group*. Groups are archived, not deleted,
 *   and the archive service moves tasks explicitly; this is the backstop.
 * - `view_id` CASCADES, with the view. It is denormalised from the column for
 *   the board read; the move service is its only writer and writes it with
 *   `column_id`, together (TD-35).
 *
 * `sort_order` is the task's place in its cell — one group in one column —
 * dense and server-rewritten. No unique constraint: a dense rewrite inside a
 * transaction passes through duplicates.
 *
 * The title and the note are the person's client work: never logged, never in
 * an error message, always in the export (TD-45).
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import { index, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { workflowColumns } from "./workflow-columns";
import { workflowGroups } from "./workflow-groups";
import { workflowViews } from "./workflow-views";

export const workflowTasks = pgTable(
  "workflow_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** Set on entering the done column; cleared on leaving it (TD-35). */
    closedAt: timestamp("closed_at", { withTimezone: true }),
    /** A prompt is running. Cleared when the task leaves the active column. */
    firingStartedAt: timestamp("firing_started_at", { withTimezone: true }),
    /** When the prompt last came back — *back · 2 min*. */
    lastReturnedAt: timestamp("last_returned_at", { withTimezone: true }),
    /** ≤ 2000 (`WORKFLOW_NOTE_MAX`) — what was asked, what to check (W19). */
    note: text("note"),
    /** The place in its cell — dense, rewritten by the service (TD-35). */
    sortOrder: smallint("sort_order").notNull(),
    /** 1–120 (`WORKFLOW_TITLE_MAX`). */
    title: text("title").notNull(),

    columnId: uuid("column_id")
      .notNull()
      .references(() => workflowColumns.id, { onDelete: "restrict" }),
    /** Null is the lane *No group*. */
    groupId: uuid("group_id").references(() => workflowGroups.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    viewId: uuid("view_id")
      .notNull()
      .references(() => workflowViews.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("workflow_tasks_view_id_column_id_group_id_sort_order_idx").on(
      table.viewId,
      table.columnId,
      table.groupId,
      table.sortOrder,
    ),
    index("workflow_tasks_user_id_archived_at_idx").on(table.userId, table.archivedAt),
    index("workflow_tasks_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "workflow_tasks",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const workflowTasksRelations = relations(workflowTasks, ({ one }) => ({
  column: one(workflowColumns, {
    fields: [workflowTasks.columnId],
    references: [workflowColumns.id],
  }),
  group: one(workflowGroups, {
    fields: [workflowTasks.groupId],
    references: [workflowGroups.id],
  }),
  user: one(users, {
    fields: [workflowTasks.userId],
    references: [users.id],
  }),
  view: one(workflowViews, {
    fields: [workflowTasks.viewId],
    references: [workflowViews.id],
  }),
}));
