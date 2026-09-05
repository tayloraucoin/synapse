/**
 * days — one calendar date in the person's stored zone (official spec §3.6).
 *
 * A Day is keyed by `date` in the person's STORED zone and runs from
 * `day_close_time` to the next `day_close_time` (cross-cutting §7.1). A day
 * with no template is an empty day, which is how a vacation works — nothing is
 * missed on an unplanned day.
 *
 * IT SNAPSHOTS ITS OWN TIME RULES. `timezone` and `day_close_time` are copied
 * from `users` when the day is created and never follow a later settings
 * change. Without them, moving zones or shifting the close time would silently
 * re-key and re-window every past day, and "moved" would stop meaning anything
 * (cross-cutting §7.3, §7.5, §8). The pending-pair on `users` is what defers a
 * change to tomorrow; these two columns are what keep yesterday honest.
 *
 * NO `week_plans` TABLE. Official §3.6 lists one; its only content is a status
 * derivable from the week's days, so `WeekPlanStatus` is computed by the week
 * read model. See the Epic 1 TECHNICAL-DECISIONS entry.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { DayCloseReason, WokeAtSource } from "@syn/types";

import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { templates } from "./templates";

/** One table uses it, so it lives here (drizzle-orm-conventions §3). */
export const dayCloseReasonEnum = pgEnum(
  "day_close_reason",
  enumValues<DayCloseReason>()(["manual", "auto"]),
);

/** Epic 2 DH-02: the wake time came from the anchor habit, or from a picker. */
export const wokeAtSourceEnum = pgEnum(
  "woke_at_source",
  enumValues<WokeAtSource>()(["anchor", "manual"]),
);

export const days = pgTable(
  "days",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** The applied start — the template's anchor, overridable per day (§3.6). */
    anchorTime: time("anchor_time").notNull(),
    /** 5–1440. Set only by a capacity trim (§3.6, §5.8). */
    capacityMin: smallint("capacity_min"),
    closeReason: dayCloseReasonEnum("close_reason"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    /** The day key, in `timezone`. Unique per person. */
    date: date("date").notNull(),
    /** Snapshot of the rule this day was created under (cross-cutting §7.1). */
    dayCloseTime: time("day_close_time").notNull(),
    /** Stamped when a closed day's record is edited (cross-cutting §8.1). */
    reviewEditedAt: timestamp("review_edited_at", { withTimezone: true }),
    /** Set by *Finish review* — the day has a number (Epic 3 DR-01). */
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    /** Snapshot of `users.timezone` at creation. */
    timezone: text("timezone").notNull(),
    /** Set by the wake-anchor habit or by hand (official spec §0.3 R5). */
    wokeAt: timestamp("woke_at", { withTimezone: true }),
    wokeAtSource: wokeAtSourceEnum("woke_at_source"),

    templateId: uuid("template_id").references(() => templates.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("days_user_id_date_idx").on(table.userId, table.date),
    index("days_user_id_closed_at_idx").on(table.userId, table.closedAt),
    index("days_template_id_idx").on(table.templateId),
    index("days_user_id_idx").on(table.userId),
    check(
      "days_capacity_min_check",
      sql`${table.capacityMin} IS NULL OR ${table.capacityMin} BETWEEN 5 AND 1440`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "days",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const daysRelations = relations(days, ({ one }) => ({
  template: one(templates, {
    fields: [days.templateId],
    references: [templates.id],
  }),
  user: one(users, {
    fields: [days.userId],
    references: [users.id],
  }),
}));
