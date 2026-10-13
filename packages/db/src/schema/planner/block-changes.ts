/**
 * block_changes — a dated exception to a repeating block, as Google keeps
 * them (call C2): the block moves for that date, or is skipped. This is how
 * This week differs from the usual week. Reset to usual deletes the row; Copy
 * from writes rows. One row per block per date.
 *
 * A row is `skipped`, or carries both new times
 * (`block_changes_skipped_or_times_check`).
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  pgTable,
  time,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { blocks } from "./blocks";

export const blockChanges = pgTable(
  "block_changes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    endsAt: time("ends_at"),
    onDate: date("on_date").notNull(),
    skipped: boolean("skipped").notNull().default(false),
    startsAt: time("starts_at"),

    blockId: uuid("block_id")
      .notNull()
      .references(() => blocks.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("block_changes_block_id_on_date_key").on(
      table.blockId,
      table.onDate,
    ),
    check(
      "block_changes_skipped_or_times_check",
      sql`${table.skipped} OR (${table.startsAt} IS NOT NULL AND ${table.endsAt} IS NOT NULL)`,
    ),
    check(
      "block_changes_ends_after_starts_check",
      sql`${table.endsAt} > ${table.startsAt}`,
    ),
    index("block_changes_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "block_changes",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const blockChangesRelations = relations(blockChanges, ({ one }) => ({
  block: one(blocks, {
    fields: [blockChanges.blockId],
    references: [blocks.id],
  }),
  user: one(users, {
    fields: [blockChanges.userId],
    references: [users.id],
  }),
}));
