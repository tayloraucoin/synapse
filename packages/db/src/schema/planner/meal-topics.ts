/**
 * meal_topics — the Meal topics sheet's saved topics (D-USE-28): a name, an
 * icon (emoji or line icon, D-USE-30), one link and an order. A block or a
 * transition with Meal on offers them.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { MEAL_LINK_KINDS } from "@syn/constants";
import type { IconValue, MealLinkKind } from "@syn/types";

import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const mealLinkKindEnum = pgEnum(
  "meal_link_kind",
  enumValues<MealLinkKind>()(MEAL_LINK_KINDS),
);

export const mealTopics = pgTable(
  "meal_topics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // JSON shape: IconValue — see @syn/types.
    icon: jsonb("icon").$type<IconValue>(),
    linkKind: mealLinkKindEnum("link_kind").notNull(),
    /** A URL for a playlist or channel; the query for a search. */
    linkValue: text("link_value").notNull(),
    name: text("name").notNull(),
    sortOrder: smallint("sort_order").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("meal_topics_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "meal_topics",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const mealTopicsRelations = relations(mealTopics, ({ one }) => ({
  user: one(users, {
    fields: [mealTopics.userId],
    references: [users.id],
  }),
}));
