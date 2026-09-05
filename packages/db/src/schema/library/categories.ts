/**
 * categories — free-defined groupings a habit may belong to (official spec
 * §3.2).
 *
 * Used for time-distribution reporting only, never for any mechanic: a
 * category never changes what an item is worth, when it runs, or how a miss
 * resolves. A habit has at most one.
 *
 * DELETING A CATEGORY UNASSIGNS (Epic 1 CT-01, cross-cutting §8.1) — it is one
 * of the four things in the product that is deleted rather than archived, and
 * `habits.category_id` is `ON DELETE set null` so the habits survive it. Past
 * reports keep the name they were run under because they read the day's rows,
 * not this table.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { categoryColorKeyEnum } from "../enums";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { habits } from "./habits";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** One of the eight category hues — official spec §3.2, §9.3. */
    colorKey: categoryColorKeyEnum("color_key").notNull(),
    /** 1–24, unique per person — Epic 1 §9. */
    name: text("name").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("categories_user_id_name_idx").on(table.userId, table.name),
    index("categories_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "categories",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  habits: many(habits),
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
}));
