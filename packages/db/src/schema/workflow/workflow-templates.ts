/**
 * workflow_templates — a saved arrangement of columns to start a view from
 * (Workflow UX spec v0.1 §3.6, §11; Epic 7 TD-34).
 *
 * A SNAPSHOT, NOT ROWS OF ROWS. Nothing refers to a template after a view is
 * made from it (W10), so its columns are one jsonb list of names and roles.
 * Editing a template never changes an existing view.
 *
 * ONLY WHAT THE PERSON SAVED. The two built-in templates (*Working*, *Queue*)
 * are constants in `@syn/constants` (`WORKFLOW_STARTERS`), never rows (TD-41).
 * ARCHIVE, NEVER DELETE (W18).
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import type { WorkflowTemplateColumn } from "@syn/types";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const workflowTemplates = pgTable(
  "workflow_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    // JSON shape: WorkflowTemplateColumn[] — see @syn/types (src/domain/workflow.ts)
    columns: jsonb("columns").$type<WorkflowTemplateColumn[]>().notNull(),
    /** 1–40 (`WORKFLOW_NAME_MAX`). */
    name: text("name").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("workflow_templates_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "workflow_templates",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const workflowTemplatesRelations = relations(workflowTemplates, ({ one }) => ({
  user: one(users, {
    fields: [workflowTemplates.userId],
    references: [users.id],
  }),
}));
