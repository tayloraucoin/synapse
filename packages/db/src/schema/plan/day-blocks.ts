/**
 * day_blocks — one block on one day (UX v1.1 §11.7, TD-2). THE load-bearing
 * table of v1.1: the Today tab's sections, the Schedule's bands, the
 * block-boundary pushes, and the Adjust sheet all read it.
 *
 * A DAY IS AN ORDERED SET OF BLOCKS. Each points at the template it came from
 * (`template_id`, with the name snapshotted like every other record), carries
 * its own span, and holds its items (`day_items.day_block_id`). A block can be
 * EMPTY on purpose: a pooled morning before the pick, an unstructured day's
 * wind-down with nothing added yet. That, and a block-level ghost, are why a
 * block is a row rather than a grouping derived from its items.
 *
 * `state` (§11.7): `planned` at week build; `pooled` when the pick decides its
 * contents and it holds NO ITEMS until then; `set` once the day is confirmed;
 * `not_today` for a placeable block the person declined at the pick — never
 * a miss.
 *
 * `placement` is training and break only (§3.7): which open span the block
 * was put in, kept so the next pick can default to it. `inside_work` splits
 * the work block into two rows around this one — both work rows share
 * `template_id` and the snapshot, and the unique index below is what allows
 * two of one kind on a day.
 *
 * `original_scheduled_start` IS IMMUTABLE ONCE SET, by the same trigger
 * function `day_items` uses (`day_blocks_original_start_immutable`, 0005 and
 * `supabase/setup/02_apply_triggers_rls.sql`). It is written at *Set the day*
 * (R23, TD-5) — null before — and a band drag afterwards leaves a ghost.
 *
 * DELETION CASCADES TO ITEMS, deliberately: an item without a block is not
 * renderable. Only the materialiser deletes a block, and only an untouched one
 * (DYN-5's predicate), so a touched item is never under a deleted block.
 *
 * POLICIES: owner-private CRUD, on this table's own `user_id`.
 */
import { relations, sql } from "drizzle-orm";
import {
  index,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { dayItems } from "../day/day-items";
import { blockKindEnum } from "../enums";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { days } from "./days";
import { dayBlockStateEnum, trainingPlacementEnum } from "./enums";
import { templates } from "./templates";

export const dayBlocks = pgTable(
  "day_blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    kind: blockKindEnum("kind").notNull(),
    /** Written once, at *Set the day*; the trigger refuses every later write. */
    originalScheduledStart: timestamp("original_scheduled_start", {
      withTimezone: true,
    }),
    /** Training and break only — which open span the pick put it in (§3.7). */
    placement: trainingPlacementEnum("placement"),
    scheduledEnd: timestamp("scheduled_end", { withTimezone: true }),
    /** Moved by a band drag or by Adjust; never the original. */
    scheduledStart: timestamp("scheduled_start", { withTimezone: true }),
    /** The day's block order. Two work rows around training are n and n+2. */
    sortOrder: smallint("sort_order").notNull().default(0),
    state: dayBlockStateEnum("state").notNull().default("planned"),
    /** The template's name as it was — the record says what was true. */
    templateNameSnapshot: text("template_name_snapshot"),

    dayId: uuid("day_id")
      .notNull()
      .references(() => days.id, { onDelete: "cascade" }),
    templateId: uuid("template_id").references(() => templates.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("day_blocks_day_id_kind_sort_order_idx").on(
      table.dayId,
      table.kind,
      table.sortOrder,
    ),
    index("day_blocks_day_id_sort_order_idx").on(table.dayId, table.sortOrder),
    index("day_blocks_template_id_idx").on(table.templateId),
    index("day_blocks_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "day_blocks",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const dayBlocksRelations = relations(dayBlocks, ({ many, one }) => ({
  day: one(days, {
    fields: [dayBlocks.dayId],
    references: [days.id],
  }),
  items: many(dayItems),
  template: one(templates, {
    fields: [dayBlocks.templateId],
    references: [templates.id],
  }),
  user: one(users, {
    fields: [dayBlocks.userId],
    references: [users.id],
  }),
}));
