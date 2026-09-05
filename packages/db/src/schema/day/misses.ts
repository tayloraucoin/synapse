/**
 * misses — how one undone item was attributed (official spec §3.8).
 *
 * A miss exists only after a Day Review or a shift-forward resolves an item as
 * missed. The tier is what the resolver reads (§7.3): `circumstance` is
 * excluded from the number entirely, `scoping` credits half, `chose_not_to`
 * credits nothing.
 *
 * ONE MISS PER ITEM. `day_item_id` is unique, so changing an attribution in the
 * Day Review updates this row rather than writing a second one (Epic 3
 * DEVIATIONS). `shift_id` is kept when it does, which is exactly what lets
 * DR-05 show *Changed from the shift's reason* — the condition is
 * `shift_id IS NOT NULL AND resolved_by = 'day_review'`.
 *
 * `reason_key` is text, not a foreign key: a reason archived or renamed later
 * must not rewrite what was recorded under the old one (cross-cutting §8.1).
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { MissResolvedBy } from "@syn/types";

import { enumValues } from "../enum-values";
import { missTierEnum } from "../enums";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { dayItems } from "./day-items";
import { shifts } from "./shifts";

/** One table uses it, so it lives here (drizzle-orm-conventions §3). */
export const missResolvedByEnum = pgEnum(
  "miss_resolved_by",
  enumValues<MissResolvedBy>()(["day_review", "shift"]),
);

export const misses = pgTable(
  "misses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** ≤ 280 — Epic 3 DR-03. */
    note: text("note"),
    /** A `reasons.key`. See the note above on why this is not a foreign key. */
    reasonKey: text("reason_key"),
    /** ≤ 80, behind *Other*. */
    reasonText: text("reason_text"),
    resolvedBy: missResolvedByEnum("resolved_by").notNull(),
    tier: missTierEnum("tier").notNull(),

    dayItemId: uuid("day_item_id")
      .notNull()
      .references(() => dayItems.id, { onDelete: "cascade" }),
    /** Set when the attribution was inherited from a shift (§6.5). */
    shiftId: uuid("shift_id").references(() => shifts.id, {
      onDelete: "set null",
    }),
    /** Official spec §0.3 R2 — what the person stayed on instead (§7.3). */
    tradedUpItemId: uuid("traded_up_item_id").references(() => dayItems.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("misses_day_item_id_idx").on(table.dayItemId),
    index("misses_shift_id_idx").on(table.shiftId),
    index("misses_traded_up_item_id_idx").on(table.tradedUpItemId),
    index("misses_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "misses",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const missesRelations = relations(misses, ({ one }) => ({
  dayItem: one(dayItems, {
    fields: [misses.dayItemId],
    references: [dayItems.id],
    relationName: "misses_day_item",
  }),
  shift: one(shifts, {
    fields: [misses.shiftId],
    references: [shifts.id],
  }),
  tradedUpItem: one(dayItems, {
    fields: [misses.tradedUpItemId],
    references: [dayItems.id],
    relationName: "misses_traded_up_item",
  }),
  user: one(users, {
    fields: [misses.userId],
    references: [users.id],
  }),
}));
