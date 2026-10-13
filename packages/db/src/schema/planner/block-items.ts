/**
 * block_items — a block's set items (Wellness, Training, Life, Set work), in
 * order. A set item's slot is written on first touch, never ahead of time.
 *
 * A TRANSITION INSIDE A BLOCK is an item with `is_transition`, an `at_time`
 * and a `length_min`: the items after it move by its length. It has no kind
 * and no repeat; it takes its block's colour and days, and can switch Meal on
 * (D-USE-34). A transition outside every block is a `blocks` row of kind
 * `transition`.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { IconValue } from "@syn/types";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { blocks } from "./blocks";
import { slots } from "./slots";

export const blockItems = pgTable(
  "block_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** A fixed time inside the block; null flows in order. */
    atTime: time("at_time"),
    // JSON shape: IconValue — see @syn/types.
    icon: jsonb("icon").$type<IconValue>(),
    isTransition: boolean("is_transition").notNull().default(false),
    lengthMin: smallint("length_min"),
    meal: boolean("meal").notNull().default(false),
    sortOrder: smallint("sort_order").notNull(),
    title: text("title").notNull(),

    blockId: uuid("block_id")
      .notNull()
      .references(() => blocks.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    check(
      "block_items_transition_has_time_and_length_check",
      sql`NOT ${table.isTransition} OR (${table.atTime} IS NOT NULL AND ${table.lengthMin} IS NOT NULL)`,
    ),
    check("block_items_length_min_check", sql`${table.lengthMin} > 0`),
    index("block_items_block_id_sort_order_idx").on(table.blockId, table.sortOrder),
    index("block_items_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "block_items",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const blockItemsRelations = relations(blockItems, ({ many, one }) => ({
  block: one(blocks, {
    fields: [blockItems.blockId],
    references: [blocks.id],
  }),
  slots: many(slots),
  user: one(users, {
    fields: [blockItems.userId],
    references: [users.id],
  }),
}));
