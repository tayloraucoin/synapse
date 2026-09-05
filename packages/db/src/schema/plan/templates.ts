/**
 * templates — a named day plan (official spec §3.4, the former Variant).
 *
 * Built in planning mode and applied to days during the week build. A template
 * holds slots at OFFSETS from its anchor, never at absolute times, which is
 * what lets the same template be applied at 06:00 or 08:00 without editing a
 * slot — and what makes shift-forward cheap.
 *
 * `weekly_target` IS NULL FOR *none*, NEVER 0 (Epic 1 TP-02). The form's
 * stepper shows 0 as *none*; the column stores the absence.
 *
 * ARCHIVE, NEVER DELETE. An archived template's name still appears in the
 * header of every past day it built (cross-cutting §8.3).
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { templateSlots } from "./template-slots";

export const templates = pgTable(
  "templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** The time this template's 00:00 offset maps to when applied (§3.4). */
    anchorTime: time("anchor_time").notNull().default("07:00"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** 1–40 — Epic 1 §9. */
    name: text("name").notNull(),
    /**
     * A hint shown during the week build, nothing more (§3.4). Mon = 0 … Sun =
     * 6, matching `TemplateSummaryView.typicalDays`.
     */
    typicalDays: smallint("typical_days").array(),
    /** 1–7, or null for *none* — shown as "used 1 of 2" during the week build. */
    weeklyTarget: smallint("weekly_target"),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("templates_user_id_archived_at_idx").on(
      table.userId,
      table.archivedAt,
    ),
    index("templates_user_id_idx").on(table.userId),
    check(
      "templates_weekly_target_check",
      sql`${table.weeklyTarget} IS NULL OR ${table.weeklyTarget} BETWEEN 1 AND 7`,
    ),
    // Mon = 0 … Sun = 6. A weekday outside that range is not a hint, it is a
    // bug that would render as a missing chip.
    check(
      "templates_typical_days_check",
      sql`${table.typicalDays} IS NULL OR (${table.typicalDays} <@ ARRAY[0,1,2,3,4,5,6]::smallint[])`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "templates",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const templatesRelations = relations(templates, ({ many, one }) => ({
  slots: many(templateSlots),
  user: one(users, {
    fields: [templates.userId],
    references: [users.id],
  }),
}));
