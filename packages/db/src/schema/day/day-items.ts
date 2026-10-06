/**
 * day_items — the instance (official spec §3.7). The row the two execution
 * tabs render.
 *
 * Materialised from a template slot when the week is built, or created as a
 * one-off. THIS ROW IS THE RECORD. `title`, `icon`, `quantity_unit`,
 * `reflection_axes` and `notes_preflight` are snapshots taken at
 * materialisation, so a past day renders as it was lived even after the habit
 * is renamed, re-iconed or archived (cross-cutting §8.1, §8.3).
 *
 * `original_scheduled_start` NEVER CHANGES after materialisation — the ghost
 * renders here (§3.7). That promise is enforced by a database trigger
 * (`day_items_original_start_immutable`, in `supabase/setup/`), not by the
 * service, for the same reason `handle_new_user` is a trigger: the database
 * guarantees what the app must never do. `scheduled_start` is the one that
 * moves, on a shift or a late start.
 *
 * OFF-SCHEDULE IS DERIVED, NEVER STORED (§3.7, §6.3): it is `done_at` outside
 * `original_scheduled_start .. scheduled_end`, computed on read.
 *
 * A ONE-OFF IS THE ONLY DELETABLE ITEM (cross-cutting §8.4). Everything else
 * on a day is annotated.
 *
 * UNDER UX v1.1 (0005) AN ITEM BELONGS TO A BLOCK (`day_block_id`, TD-2),
 * may be a PIN (`pinned` — the anchor glyph; the stack flows around it, R3),
 * carries the gap before it (snapshotted from the slot; edited by a seam drag
 * on the day), and may be one member of a *one of* group (`alternates_id`
 * per day like `multitask_id`; `alternates_chosen` marks the live member —
 * the other is `not_assigned`). `day_block_id` is NULLABLE and stays so
 * (DYN-21): a one-off and an unstructured day's add have no block
 * (`DayView.unblocked`); `0006`'s backfill put every v1.0 item under a
 * `morning` block before the v1.0 columns went.
 *
 * WHEN `original_scheduled_start` IS WRITTEN changes under v1.1 (R23, TD-5):
 * at week build for fixtures and pins on a structured day, and at *Set the
 * day* for everything else — null until then. The trigger permits exactly
 * that one `NULL → value` transition and refuses every other write; its body
 * already did, and 0005 arms the same function on `day_blocks`.
 *
 * POLICIES: owner-private CRUD, on this table's own `user_id` — the service
 * writes the day's owner, never the caller's claim.
 */
import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type {
  AssignmentState,
  CompletionState,
  IconValue,
  ItemOrigin,
} from "@syn/types";

import { enumValues } from "../enum-values";
import { itemTypeEnum, schedulingEnum, timeModeEnum } from "../enums";
import { habits } from "../library/habits";
import { dayBlocks } from "../plan/day-blocks";
import { days } from "../plan/days";
import { templateSlots } from "../plan/template-slots";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

/**
 * §3.7. `not_assigned` is a capacity trim (§5.8); `cut_by_shift` is a shift
 * casualty (§5.6). Neither is a failure, and neither is scored on its own.
 */
export const assignmentStateEnum = pgEnum(
  "assignment_state",
  enumValues<AssignmentState>()(["assigned", "not_assigned", "cut_by_shift"]),
);

/**
 * §3.7. `not_confirmed` is UX v1.1 R16 — a wind-down item left unticked the
 * next morning; excluded from the number, never hidden. The TypeScript side
 * moved in DYN-1; the `ADD VALUE` ships in migration `0004` (DYN-2). Nothing
 * writes it before DYN-5.
 */
export const completionStateEnum = pgEnum(
  "completion_state",
  enumValues<CompletionState>()([
    "upcoming",
    "active",
    "done",
    "missed",
    "carried",
    "pending_review",
    "not_confirmed",
  ]),
);

/**
 * §3.7. The spec writes the last two with a payload
 * (`carried_from(day_item_id)`, `calendar_import(event_id)`); the payload is a
 * sibling column, so the enum carries the kind alone.
 */
export const itemOriginEnum = pgEnum(
  "item_origin",
  enumValues<ItemOrigin>()([
    "template",
    "one_off",
    "carried",
    "calendar_import",
    // UX v1.1 §3.6 (TD-8) — a weekday fixture, materialised as a pin. Moved
    // in DYN-1; the `ADD VALUE` ships in `0004`; written from DYN-5.
    "fixture",
    // UX v1.2 §3.7 (TD-12) — the travel there or back around a workout, an
    // item of its own. Moved in RUN-1; the `ADD VALUE` ships in `0007`;
    // written from RUN-6.
    "travel",
  ]),
);

export const dayItems = pgTable(
  "day_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** The live member of a *one of* group; the other is `not_assigned` (UX v1.1 §3.5, 0005). */
    alternatesChosen: boolean("alternates_chosen"),
    /** One id per *one of* group per day, like `multitask_id` (UX v1.1 §3.5, 0005). */
    alternatesId: uuid("alternates_id"),
    assignmentState: assignmentStateEnum("assignment_state")
      .notNull()
      .default("assigned"),
    /** Phase-2 seam (official spec §4.7, §5.7). Nothing writes it in Phase 1. */
    calendarEventId: text("calendar_event_id"),
    completionState: completionStateEnum("completion_state")
      .notNull()
      .default("upcoming"),
    /** Epic 2 IT-01 *Not today* — per day, cleared by done or undo. */
    deferredAt: timestamp("deferred_at", { withTimezone: true }),
    doneAt: timestamp("done_at", { withTimezone: true }),
    durationMin: smallint("duration_min"),
    /** Transition before this item, 0–240; snapshotted from the slot (UX v1.1 §3.2, 0005). */
    gapBeforeMin: smallint("gap_before_min").notNull().default(0),
    /** JSON shape: IconValue — see @syn/types. Snapshot of the habit's icon. */
    icon: jsonb("icon").$type<IconValue>().notNull(),
    /** One id per multitask group per day; assigned at materialisation (§5.5). */
    multitaskId: uuid("multitask_id"),
    /** Snapshot of the habit's `default_notes_preflight`. */
    notesPreflight: text("notes_preflight"),
    /** ≤ 500 — Epic 2 IT-01. */
    notesReflection: text("notes_reflection"),
    origin: itemOriginEnum("origin").notNull(),
    /** A pin — at a clock time; the stack flows around it, it never moves by drag (UX v1.1 R3, R22, 0005). */
    pinned: boolean("pinned").notNull().default(false),
    /** Never updated after insert — enforced by trigger. See the note above. */
    originalScheduledStart: timestamp("original_scheduled_start", {
      withTimezone: true,
    }),
    /** Resolved 1–7: slot override → the habit's life priority (§6.6). */
    priority: smallint("priority").notNull(),
    /** Snapshot of the habit's `quantity_unit`. */
    quantityUnit: text("quantity_unit"),
    quantityValue: numeric("quantity_value", {
      precision: 10,
      scale: 2,
      mode: "number",
    }),
    /** JSON shape: string[] — snapshot of the habit's `reflection_axes`. */
    reflectionAxes: jsonb("reflection_axes")
      .$type<string[]>()
      .notNull()
      .default([]),
    /** JSON shape: Record<axis, 1–7> — keyed by a label in `reflection_axes`. */
    reflectionRatings: jsonb("reflection_ratings")
      .$type<Record<string, number>>()
      .notNull()
      .default({}),
    scheduledEnd: timestamp("scheduled_end", { withTimezone: true }),
    /** Recomputed on a shift and on a late start. */
    scheduledStart: timestamp("scheduled_start", { withTimezone: true }),
    scheduling: schedulingEnum("scheduling").notNull(),
    /** Tie-break inside a minute. */
    sortOrder: smallint("sort_order").notNull().default(0),
    timeMode: timeModeEnum("time_mode").notNull(),
    /**
     * Which template put this item on the day — kept as a NAME, not a link.
     *
     * A template can be removed from a day while items a person already
     * started stay behind (Epic 1 WK-02). Those rows lose their
     * `template_slot_id`, so without this there is no way to say "from
     * Morning" about an item that came from one — and a link would break
     * again the moment the template is archived or renamed. The snapshot is
     * the same discipline as `title` and `icon`: the record says what was
     * true when it was made.
     */
    templateNameSnapshot: text("template_name_snapshot"),
    /** Snapshot of the habit's title, or the typed title of a *Just a title*. */
    title: text("title").notNull(),
    /** Snapshot; `task_appointment` for a bare title. */
    type: itemTypeEnum("type").notNull(),
    /**
     * The chosen version's key, snapshotted (UX v1.2 §3.5, TD-11, 0007). Set
     * by the pick's choice or the habit's default version; null when the
     * length was hand-set or the habit has no versions. `duration_min` is
     * always the live length — this only says which version it came from.
     */
    versionKey: text("version_key"),

    /** Set when `origin = carried` — the item this one came forward from. */
    carriedFromItemId: uuid("carried_from_item_id").references(
      (): AnyPgColumn => dayItems.id,
      { onDelete: "set null" },
    ),
    /**
     * The block this item sits in (UX v1.1 §11.8, TD-2). Nullable in 0005
     * only; NOT NULL from 0006 after DYN-5's backfill. Cascades: an item
     * without a block is not renderable, and only untouched blocks are ever
     * deleted (see `day_blocks`).
     */
    dayBlockId: uuid("day_block_id").references(() => dayBlocks.id, {
      onDelete: "cascade",
    }),
    dayId: uuid("day_id")
      .notNull()
      .references(() => days.id, { onDelete: "cascade" }),
    /** Null for a *Just a title* one-off, which has no library entry. */
    habitId: uuid("habit_id").references(() => habits.id, {
      onDelete: "set null",
    }),
    /**
     * For a travel row (`origin = travel`, UX v1.2 §3.7, TD-12, 0007): the
     * workout it belongs beside. Cascades — a travel row without its workout
     * is nothing — and a one-off delete of the workout takes both ends. Two
     * more items in the block's stack; `stackBlock` is unchanged.
     */
    parentItemId: uuid("parent_item_id").references(
      (): AnyPgColumn => dayItems.id,
      { onDelete: "cascade" },
    ),
    /** What TP-04's re-materialisation matches on. */
    templateSlotId: uuid("template_slot_id").references(() => templateSlots.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("day_items_day_id_scheduled_start_idx").on(
      table.dayId,
      table.scheduledStart,
    ),
    index("day_items_user_id_completion_state_idx").on(
      table.userId,
      table.completionState,
    ),
    index("day_items_habit_id_idx").on(table.habitId),
    index("day_items_template_slot_id_idx").on(table.templateSlotId),
    index("day_items_user_id_idx").on(table.userId),
    index("day_items_day_block_id_sort_order_idx").on(
      table.dayBlockId,
      table.sortOrder,
    ),
    index("day_items_alternates_id_idx").on(table.alternatesId),
    index("day_items_parent_item_id_idx").on(table.parentItemId),
    check("day_items_priority_check", sql`${table.priority} BETWEEN 1 AND 7`),
    check(
      "day_items_duration_min_check",
      sql`${table.durationMin} IS NULL OR ${table.durationMin} BETWEEN 1 AND 480`,
    ),
    check(
      "day_items_gap_before_min_check",
      sql`${table.gapBeforeMin} BETWEEN 0 AND 240`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "day_items",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const dayItemsRelations = relations(dayItems, ({ one }) => ({
  carriedFrom: one(dayItems, {
    fields: [dayItems.carriedFromItemId],
    references: [dayItems.id],
    relationName: "day_items_carried_from",
  }),
  day: one(days, {
    fields: [dayItems.dayId],
    references: [days.id],
  }),
  dayBlock: one(dayBlocks, {
    fields: [dayItems.dayBlockId],
    references: [dayBlocks.id],
  }),
  habit: one(habits, {
    fields: [dayItems.habitId],
    references: [habits.id],
  }),
  parentItem: one(dayItems, {
    fields: [dayItems.parentItemId],
    references: [dayItems.id],
    relationName: "day_items_travel_parent",
  }),
  templateSlot: one(templateSlots, {
    fields: [dayItems.templateSlotId],
    references: [templateSlots.id],
  }),
  user: one(users, {
    fields: [dayItems.userId],
    references: [users.id],
  }),
}));
