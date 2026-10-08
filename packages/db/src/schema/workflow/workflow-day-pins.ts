/**
 * workflow_day_pins — the groups made *first today*, for one of the person's
 * days (Workflow UX spec v0.1 §3.5 W9, §11; Epic 7 TD-37).
 *
 * KEYED BY THE DAY, SO NOTHING RUNS. One row per `(user_id, day_key)`, the key
 * from `resolveDayKey` and the person's own day close. A new day has a new key,
 * so yesterday's pins are simply never read — no job, no cleanup, nothing to
 * dismiss. A stale row is a few bytes and stays in the export as a record of
 * what was pinned.
 *
 * PINS ONLY, NOT A WHOLE ORDER. The rest of the lanes keep their usual order
 * (`workflow_groups.sort_order`); a full order per day would have to be
 * reconciled every time a group is added. An id whose group was archived later
 * is left in place and ignored by `orderGroupsForDay`.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import { date, index, jsonb, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const workflowDayPins = pgTable(
  "workflow_day_pins",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** The person's day the pins belong to — the same key `days.date` holds. */
    dayKey: date("day_key").notNull(),
    // JSON shape: string[] — group ids, newest pin first
    groupIds: jsonb("group_ids").$type<string[]>().notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("workflow_day_pins_user_id_day_key_idx").on(table.userId, table.dayKey),
    index("workflow_day_pins_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "workflow_day_pins",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const workflowDayPinsRelations = relations(workflowDayPins, ({ one }) => ({
  user: one(users, {
    fields: [workflowDayPins.userId],
    references: [users.id],
  }),
}));
