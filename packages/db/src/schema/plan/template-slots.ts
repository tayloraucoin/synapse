/**
 * template_slots — one habit's place in a template (official spec §3.5).
 *
 * Offsets are MINUTES FROM THE TEMPLATE ANCHOR, not times. `offset_start_min`
 * may be negative down to -120 (Epic 1 TP-02, "up to two hours before"), which
 * is how a template whose anchor is the wake time can still hold something
 * that happens before it.
 *
 * `multitask_group` IS NOT ENFORCED HERE. Official §3.5 says two slots sharing
 * a start offset must share a group or the template will not save. A partial
 * unique index cannot express "unless grouped", so SET-5's service owns that
 * rule — the one place it is stated, in the words TP-02 shows.
 *
 * `habit_id` CASCADES because a habit is never hard-deleted through the app;
 * archiving a habit removes its slots through LB-01's service instead, which
 * is a decision the person is shown before it happens.
 *
 * POLICIES: owner-private CRUD, on this table's own `user_id` — the service
 * writes the template's owner, never the caller's claim.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { schedulingEnum, timeModeEnum } from "../enums";
import { habits } from "../library/habits";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { templates } from "./templates";

export const templateSlots = pgTable(
  "template_slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** A specific value chosen from within the habit's range, in minutes. */
    durationMin: smallint("duration_min").notNull(),
    /** A local id within the template (§3.5) — see the note above. */
    multitaskGroup: text("multitask_group"),
    /** Windows only. */
    offsetEndMin: integer("offset_end_min"),
    /** Null when `unscheduled`; ≥ -120 (TP-02). */
    offsetStartMin: integer("offset_start_min"),
    /** 1–7. Per-template override of the habit's `life_priority` (§3.5). */
    priorityOverride: smallint("priority_override"),
    scheduling: schedulingEnum("scheduling").notNull(),
    /** Order within a shared start; otherwise time order. */
    sortOrder: smallint("sort_order").notNull(),
    timeMode: timeModeEnum("time_mode").notNull(),

    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    templateId: uuid("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("template_slots_template_id_sort_order_idx").on(
      table.templateId,
      table.sortOrder,
    ),
    index("template_slots_habit_id_idx").on(table.habitId),
    index("template_slots_user_id_idx").on(table.userId),
    check(
      "template_slots_duration_min_check",
      sql`${table.durationMin} BETWEEN 1 AND 480`,
    ),
    check(
      "template_slots_offset_start_min_check",
      sql`${table.offsetStartMin} IS NULL OR ${table.offsetStartMin} >= -120`,
    ),
    check(
      "template_slots_priority_override_check",
      sql`${table.priorityOverride} IS NULL OR ${table.priorityOverride} BETWEEN 1 AND 7`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "template_slots",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const templateSlotsRelations = relations(templateSlots, ({ one }) => ({
  habit: one(habits, {
    fields: [templateSlots.habitId],
    references: [habits.id],
  }),
  template: one(templates, {
    fields: [templateSlots.templateId],
    references: [templates.id],
  }),
  user: one(users, {
    fields: [templateSlots.userId],
    references: [users.id],
  }),
}));
