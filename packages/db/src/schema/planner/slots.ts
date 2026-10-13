/**
 * slots — the join: one set item, to-do or work item, in one block, on one
 * date, in order (the model dev note; D-USE-31). Made by the pull rule or by
 * hand. An undone slot whose block has ended reads as returned (D-USE-74);
 * nothing runs to remove it.
 *
 * - Exactly one target (`slots_one_target_check`).
 * - `tier` only on a work item's slot (`slots_tier_only_for_work_check`).
 * - Each target at most once per date: one item, one block a day.
 * - A session is one work slot on one day. Its Done is this row's `done_at`,
 *   never the task's (D-USE-57, D-USE-65).
 *
 * The id may come from the client, so a slot made offline keeps its id when
 * it replays (call C4); the default covers every other insert.
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
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { WORK_TIERS } from "@syn/constants";
import type { WorkTier } from "@syn/types";
import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { workItems } from "../work/work-items";
import { blockItems } from "./block-items";
import { blocks } from "./blocks";
import { slotEvents } from "./slot-events";
import { todos } from "./todos";

/** Work's order for a day, highest first (D-USE-31). */
export const workTierEnum = pgEnum(
  "work_tier",
  enumValues<WorkTier>()(WORK_TIERS),
);

export const slots = pgTable(
  "slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    doneAt: timestamp("done_at", { withTimezone: true }),
    lengthMin: smallint("length_min"),
    onDate: date("on_date").notNull(),
    sortOrder: smallint("sort_order").notNull(),
    tier: workTierEnum("tier"),
    /** A plain Done's Change (D-USE-13); null reads the clock. */
    tookMin: smallint("took_min"),

    blockId: uuid("block_id")
      .notNull()
      .references(() => blocks.id, { onDelete: "cascade" }),
    blockItemId: uuid("block_item_id").references(() => blockItems.id, {
      onDelete: "cascade",
    }),
    todoId: uuid("todo_id").references(() => todos.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workItemId: uuid("work_item_id").references(() => workItems.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [
    check(
      "slots_one_target_check",
      sql`num_nonnulls(${table.blockItemId}, ${table.todoId}, ${table.workItemId}) = 1`,
    ),
    check(
      "slots_tier_only_for_work_check",
      sql`${table.tier} IS NULL OR ${table.workItemId} IS NOT NULL`,
    ),
    check("slots_length_min_check", sql`${table.lengthMin} > 0`),
    check("slots_took_min_check", sql`${table.tookMin} >= 0`),
    unique("slots_work_item_id_on_date_key").on(table.workItemId, table.onDate),
    unique("slots_block_item_id_on_date_key").on(
      table.blockItemId,
      table.onDate,
    ),
    unique("slots_todo_id_on_date_key").on(table.todoId, table.onDate),
    index("slots_block_id_on_date_idx").on(table.blockId, table.onDate),
    index("slots_user_id_on_date_idx").on(table.userId, table.onDate),
    index("slots_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "slots",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const slotsRelations = relations(slots, ({ many, one }) => ({
  block: one(blocks, {
    fields: [slots.blockId],
    references: [blocks.id],
  }),
  blockItem: one(blockItems, {
    fields: [slots.blockItemId],
    references: [blockItems.id],
  }),
  events: many(slotEvents),
  todo: one(todos, {
    fields: [slots.todoId],
    references: [todos.id],
  }),
  user: one(users, {
    fields: [slots.userId],
    references: [users.id],
  }),
  workItem: one(workItems, {
    fields: [slots.workItemId],
    references: [workItems.id],
  }),
}));
