/**
 * blocks — a container of time (USE; the model dev note, D-USE-80). The usual
 * week is these rows with a repeat rule; This week's one-offs carry a date
 * instead (call C2). Nothing is copied per weekday: a day is read by expanding
 * each rule for the date, then applying `block_changes`.
 *
 * ONE RULE OR ONE DATE. `rrule` is RFC 5545 text, one rule (D-USE-80); a
 * skipped date is a `block_changes` row, never an EXDATE. Exactly one of the
 * two is set (`blocks_rrule_or_on_date_check`).
 *
 * WALL-CLOCK TIMES. `starts_at` and `ends_at` are times in `users.timezone`,
 * resolved per date (rabbit hole 6). `24:00` is a valid end, so a block can
 * run to midnight; a block never crosses it.
 *
 * `kind` is a `block_kind`. New input is one of the New block sheet's seven,
 * or `transition` for a transition outside every block (D-USE-34); the
 * validators narrow it, since `0012` may not use the values it adds.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { BLOCK_FILLS } from "@syn/constants";
import type { BlockFill, IconValue } from "@syn/types";

import { enumValues } from "../enum-values";
import { blockKindEnum } from "../enums";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { blockChanges } from "./block-changes";
import { blockItems } from "./block-items";
import { slots } from "./slots";

/** Set items, Work's tiers for the day, or the To-dos pull rule. */
export const blockFillEnum = pgEnum(
  "block_fill",
  enumValues<BlockFill>()(BLOCK_FILLS),
);

export const blocks = pgTable(
  "blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** A checklist block's items carry no times. */
    checklist: boolean("checklist").notNull().default(false),
    /**
     * A palette key or `#rrggbb`; null is the kind's colour (the sheet's
     * Colour row). [ASSUMPTION: the data contract names no column; the sheet
     * draws one and `saved_colours` keeps custom ones for reuse.]
     */
    color: text("color"),
    endsAt: time("ends_at").notNull(),
    /** Null for a kind with no fill (Break, a transition). */
    fill: blockFillEnum("fill"),
    // JSON shape: IconValue — see @syn/types. Null shows the kind's icon.
    icon: jsonb("icon").$type<IconValue>(),
    kind: blockKindEnum("kind").notNull(),
    /** Meal is switched on: the block offers the saved meal topics. */
    meal: boolean("meal").notNull().default(false),
    name: text("name").notNull(),
    /** A push at the block's start (`block_start`). */
    notify: boolean("notify").notNull().default(false),
    /** A This-week-only block's date; null when `rrule` is set. */
    onDate: date("on_date"),
    /** RFC 5545, one rule (D-USE-80); null when `on_date` is set. */
    rrule: text("rrule"),
    startsAt: time("starts_at").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    check(
      "blocks_rrule_or_on_date_check",
      sql`num_nonnulls(${table.rrule}, ${table.onDate}) = 1`,
    ),
    check("blocks_ends_after_starts_check", sql`${table.endsAt} > ${table.startsAt}`),
    index("blocks_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "blocks",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const blocksRelations = relations(blocks, ({ many, one }) => ({
  changes: many(blockChanges),
  items: many(blockItems),
  slots: many(slots),
  user: one(users, {
    fields: [blocks.userId],
    references: [users.id],
  }),
}));
