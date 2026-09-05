/**
 * reasons — the per-person, editable reason set (official spec §3.10).
 *
 * When something is missed, the person picks a reason and the reason's tier
 * decides how it counts (§7.3). The seven defaults are data in
 * `@syn/constants` (`DEFAULT_REASONS`), which the dev seed and SET-9's lazy
 * per-user seeding both read — never a trigger, so a person's set is theirs to
 * rename, re-tier and archive from the moment it exists.
 *
 * `key` IS WHAT A MISS STORES. `misses.reason_key` and `shifts.reason_key` are
 * text, not foreign keys, so archiving or renaming a reason later never
 * rewrites a record that was made under the old one (cross-cutting §8.1).
 *
 * `structural` marks the two rows whose tier is locked and which can never be
 * archived — *Didn't do it* and *Other* (Epic 1 ST-06). Everything else about
 * a built-in is editable, including its label.
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
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { missTierEnum } from "../enums";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const reasons = pgTable(
  "reasons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** ST-06 *Archive*. Never set on a `structural` row. */
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** The *default* mark in ST-06 — this row came from `DEFAULT_REASONS`. */
    builtIn: boolean("built_in").notNull().default(false),
    /**
     * Stable identifier, unique per person. Built-ins use official §3.10's
     * keys; a reason the person adds gets a slug of its label with a suffix on
     * collision. This is the value a miss records.
     */
    key: text("key").notNull(),
    /** 1–40, unique per person — Epic 1 §9. */
    label: text("label").notNull(),
    sortOrder: smallint("sort_order").notNull(),
    /** Tier locked, never archivable — `chose_not_to` and `other` (ST-06). */
    structural: boolean("structural").notNull().default(false),
    tier: missTierEnum("tier").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("reasons_user_id_key_idx").on(table.userId, table.key),
    index("reasons_user_id_archived_at_idx").on(table.userId, table.archivedAt),
    index("reasons_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "reasons",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const reasonsRelations = relations(reasons, ({ one }) => ({
  user: one(users, {
    fields: [reasons.userId],
    references: [users.id],
  }),
}));
