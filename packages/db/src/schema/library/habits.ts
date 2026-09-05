/**
 * habits — the library entry (official spec §3.3).
 *
 * The reusable definition. It never appears on a day directly; it is slotted
 * into a template (`template_slots`) or placed as a one-off, and what lands on
 * the day is a `day_items` row that SNAPSHOTS this row's title, icon, quantity
 * unit, reflection axes and preflight note. Editing a habit therefore never
 * rewrites the past (cross-cutting §8.1) — and SET-4's re-snapshot rule
 * rewrites only untouched future items, never a started, done, reviewed, or
 * past one.
 *
 * NEVER HARD-DELETED. `archived_at` is the only exit; `template_slots` cascade
 * from here only because a hard delete cannot happen through the app, and
 * archiving removes slots through LB-01's service instead.
 *
 * NO `is_wake_anchor` COLUMN. Official §3.3 lists one, but "at most one per
 * user" is a fact about the person: `users.wake_anchor_habit_id` is the single
 * home and `HabitSummaryView.isWakeAnchor` is derived in the view mapper. See
 * the Epic 1 TECHNICAL-DECISIONS entry.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { IconValue } from "@syn/types";

import { itemTypeEnum } from "../enums";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { categories } from "./categories";

/**
 * The neutral dot every new habit starts with — Epic 1 LB-02. `"dot"` is
 * deliberately not a key in `@syn/ui`'s curated glyph table: `ItemIcon` falls
 * through to the neutral dot for any curated value it cannot resolve, so this
 * is the fallback named rather than an eighty-first glyph to maintain.
 */
export const DEFAULT_HABIT_ICON: IconValue = {
  kind: "curated",
  value: "dot",
  colorKey: null,
};

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Set by LB-01 *Archive*; never hard-deleted (§3.3). */
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** ≤ 280. Snapshotted onto every item as `notes_preflight`. */
    defaultNotesPreflight: text("default_notes_preflight"),
    /**
     * The range of time it might take, in minutes (§3.3). Required for `habit`
     * and `deep_work`, optional for `task_appointment` — which is why the
     * columns are nullable here and the requirement is stated in
     * `@syn/validators`, where the person reads it as a sentence.
     */
    durationMaxMin: smallint("duration_max_min"),
    durationMinMin: smallint("duration_min_min"),
    /** JSON shape: IconValue — see @syn/types (src/domain/domain.ts). */
    icon: jsonb("icon").$type<IconValue>().notNull().default(DEFAULT_HABIT_ICON),
    /** 1–7, 7 highest (official spec §0.3 R7). The default wherever it is slotted. */
    lifePriority: smallint("life_priority").notNull(),
    /** ≤ 16, e.g. "pages". Its presence means the item captures a number. */
    quantityUnit: text("quantity_unit"),
    /**
     * JSON shape: string[] — 0–2 labels of ≤ 24 chars, rated 1–7 at reflection
     * time (§3.3).
     */
    reflectionAxes: jsonb("reflection_axes")
      .$type<string[]>()
      .notNull()
      .default([]),
    /** 1–60 — Epic 1 §9. */
    title: text("title").notNull(),
    type: itemTypeEnum("type").notNull(),

    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("habits_user_id_archived_at_idx").on(table.userId, table.archivedAt),
    index("habits_category_id_idx").on(table.categoryId),
    index("habits_user_id_idx").on(table.userId),
    check(
      "habits_life_priority_check",
      sql`${table.lifePriority} BETWEEN 1 AND 7`,
    ),
    check(
      "habits_duration_min_min_check",
      sql`${table.durationMinMin} IS NULL OR ${table.durationMinMin} BETWEEN 1 AND 480`,
    ),
    check(
      "habits_duration_max_min_check",
      sql`${table.durationMaxMin} IS NULL OR ${table.durationMaxMin} BETWEEN 1 AND 480`,
    ),
    check(
      "habits_duration_range_check",
      sql`${table.durationMinMin} IS NULL OR ${table.durationMaxMin} IS NULL OR ${table.durationMinMin} <= ${table.durationMaxMin}`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "habits",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const habitsRelations = relations(habits, ({ one }) => ({
  category: one(categories, {
    fields: [habits.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
}));
