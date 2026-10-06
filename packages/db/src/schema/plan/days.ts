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
 * UNDER UX v1.1 (0005) A DAY IS AN ORDERED SET OF BLOCKS (`day_blocks`, TD-2).
 * The v1.0 whole-day `template_id` is gone since `0006` (DYN-21) — a day's
 * templates are its blocks'. `anchor_time` stays as the wake anchor, which
 * is what it always was in practice. The v1.1 columns are the
 * day's shape, the moment it was set (`confirmed_at` — nothing derived from
 * the pick exists before it, R23), today's work anchor and its hardness, the
 * focus, and the two lines the orient frame captures.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
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
import { habits } from "../library/habits";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { dayBlocks } from "./day-blocks";
import { dayShapeEnum } from "./enums";
import { templates } from "./templates";

/** One table uses it, so it lives here (drizzle-orm-conventions §3). */
export const dayCloseReasonEnum = pgEnum(
  "day_close_reason",
  enumValues<DayCloseReason>()(["manual", "auto"]),
);

/**
 * Epic 2 DH-02: the wake time came from the anchor habit, or from a picker —
 * or, from UX v1.1 R11, from opening the orient frame (`orient`). `anchor`
 * stays: rows written under v1.0 keep their source. Moved in DYN-1; the
 * `ADD VALUE` ships in `0004`; written from DYN-13.
 */
export const wokeAtSourceEnum = pgEnum(
  "woke_at_source",
  enumValues<WokeAtSource>()(["anchor", "manual", "orient"]),
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

    /**
     * Today's anchor is hard — under *depends on the day* the pick's answer,
     * otherwise copied from the profile at *Set the day* (UX v1.1 §3.3, 0005).
     */
    anchorIsHard: boolean("anchor_is_hard"),
    /** The wake anchor — the day's start; overridable per day (§3.6). */
    anchorTime: time("anchor_time").notNull(),
    /** 5–1440. Set only by a capacity trim (§3.6, §5.8). */
    capacityMin: smallint("capacity_min"),
    closeReason: dayCloseReasonEnum("close_reason"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    /** *Set the day* (UX v1.1 §5.3, R23, 0005). Null = unconfirmed. */
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    /** The day key, in `timezone`. Unique per person. */
    date: date("date").notNull(),
    /** Snapshot of the rule this day was created under (cross-cutting §7.1). */
    dayCloseTime: time("day_close_time").notNull(),
    /** *Today's intention* — the person's own words; ≤ 140 (UX v1.1 §5.2, 0005). */
    intention: text("intention"),
    /** *Grateful for, this morning* — the person's own words; ≤ 280 (UX v1.1 §5.2, 0005). */
    morningGratitude: text("morning_gratitude"),
    /** Stamped when a closed day's record is edited (cross-cutting §8.1). */
    reviewEditedAt: timestamp("review_edited_at", { withTimezone: true }),
    /** Set by *Finish review* — the day has a number (Epic 3 DR-01). */
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    /** Structured from templates, or unstructured (UX v1.1 §3.9, 0005). */
    shape: dayShapeEnum("shape").notNull().default("structured"),
    /** Snapshot of `users.timezone` at creation. */
    timezone: text("timezone").notNull(),
    /** *Today, as I see it* — the third optional morning line, the person's own words; ≤ 280 (UX v1.2 §5.2, 0007). */
    visualisation: text("visualisation"),
    /** Set by the orient frame (v1.1 R11), the v1.0 anchor habit, or by hand. */
    wokeAt: timestamp("woke_at", { withTimezone: true }),
    wokeAtSource: wokeAtSourceEnum("woke_at_source"),
    /** Today's work anchor after any slide (UX v1.1 §6.6, 0005); null until set. */
    workStartTime: time("work_start_time"),
    /**
     * Today's other three anchors (UX v1.2 §3.13, TD-21, 0008) — written at
     * the week build from the day plan (or the work-day type), read by every
     * re-lay through `profileForDay`; null = the profile's. A day snapshots
     * its anchors the way it snapshots its zone: a plan edited tomorrow must
     * not move an evening already lived.
     */
    workEndTime: time("work_end_time"),
    lightsOutTime: time("lights_out_time"),
    devicesOffTime: time("devices_off_time"),
    /**
     * Weekday fixtures this day leaves out (UX v1.2 §4.13g, TD-21, 0008) —
     * snapshotted from the day plan at the week build so a re-lay never
     * brings an excluded fixture back. Empty for a day that excludes nothing.
     */
    excludedFixtureIds: uuid("excluded_fixture_ids").array().notNull().default([]),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /**
     * The work-day type applied to this day (UX v1.2 §3.9, TD-19, 0007) —
     * written by the week build from the plan's type, and by *Working today*
     * on a *Rarely* day. `set null` for the same reason as the focus. Null on
     * a day without a work block.
     */
    workTemplateId: uuid("work_template_id").references(
      (): AnyPgColumn => templates.id,
      { onDelete: "set null" },
    ),
    /**
     * Today's focus — a `deep_work` habit (UX v1.1 §3.8, 0005). `set null`
     * because a hard-deleted habit must not take the day with it; an archived
     * one leaves the reference and the item's title snapshot says what it was.
     *
     * `: AnyPgColumn` because this
     * edge closes a cycle (days → habits → categories → users → days) that
     * TypeScript cannot otherwise infer through.
     */
    workFocusHabitId: uuid("work_focus_habit_id").references(
      (): AnyPgColumn => habits.id,
      { onDelete: "set null" },
    ),
  },
  (table) => [
    uniqueIndex("days_user_id_date_idx").on(table.userId, table.date),
    index("days_user_id_closed_at_idx").on(table.userId, table.closedAt),
    index("days_user_id_confirmed_at_idx").on(table.userId, table.confirmedAt),
    index("days_user_id_idx").on(table.userId),
    index("days_work_focus_habit_id_idx").on(table.workFocusHabitId),
    index("days_work_template_id_idx").on(table.workTemplateId),
    check(
      "days_visualisation_check",
      sql`${table.visualisation} IS NULL OR length(${table.visualisation}) <= 280`,
    ),
    check(
      "days_capacity_min_check",
      sql`${table.capacityMin} IS NULL OR ${table.capacityMin} BETWEEN 5 AND 1440`,
    ),
    check(
      "days_intention_check",
      sql`${table.intention} IS NULL OR length(${table.intention}) <= 140`,
    ),
    check(
      "days_morning_gratitude_check",
      sql`${table.morningGratitude} IS NULL OR length(${table.morningGratitude}) <= 280`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "days",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const daysRelations = relations(days, ({ many, one }) => ({
  blocks: many(dayBlocks),
  user: one(users, {
    fields: [days.userId],
    references: [users.id],
  }),
  workFocus: one(habits, {
    fields: [days.workFocusHabitId],
    references: [habits.id],
  }),
  workTemplate: one(templates, {
    fields: [days.workTemplateId],
    references: [templates.id],
  }),
}));
