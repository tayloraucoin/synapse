/**
 * workflow_groups — a set of tasks, usually a client; a lane (Workflow UX spec
 * v0.1 §3.5, §11; Epic 7 TD-34).
 *
 * THE HUE IS A CATEGORY HUE. `hue` is `category_color_key`, the root enum the
 * categories use — one hue vocabulary, one home; a group never gets a list of
 * its own. It is drawn as the lane head's leading edge, always beside the name.
 *
 * `sort_order` is the usual order. *First today* is not stored here: it is a
 * pin for one day in `workflow_day_pins` (TD-37). `collapsed` is remembered per
 * group, across views. ARCHIVE, NEVER DELETE (W18) — the archive service moves
 * the group's tasks to *No group* first; `workflow_tasks.group_id` setting null
 * is the backstop, never the path.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { categoryColorKeyEnum } from "../enums";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { workflowTasks } from "./workflow-tasks";

export const workflowGroups = pgTable(
  "workflow_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** The lane is folded to its head — on every view. */
    collapsed: boolean("collapsed").notNull().default(false),
    hue: categoryColorKeyEnum("hue").notNull(),
    /** 1–40 (`WORKFLOW_NAME_MAX`). The person's words — never logged. */
    name: text("name").notNull(),
    /** The usual order — dense, rewritten by the service (TD-35). */
    sortOrder: smallint("sort_order").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("workflow_groups_user_id_sort_order_idx").on(table.userId, table.sortOrder),
    index("workflow_groups_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "workflow_groups",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const workflowGroupsRelations = relations(workflowGroups, ({ many, one }) => ({
  tasks: many(workflowTasks),
  user: one(users, {
    fields: [workflowGroups.userId],
    references: [users.id],
  }),
}));
