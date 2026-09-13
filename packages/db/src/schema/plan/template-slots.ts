/**
 * template_slots — one habit's place in a block template (UX v1.1 §3.2, §3.4,
 * §3.5, §11.5, TD-4; formerly official spec §3.5).
 *
 * SLOTS STACK. Since 0004 a slot stores what it IS — a duration and the gap
 * before it — and its position in the stack (`sort_order`). Where it starts
 * is DERIVED, by `stackBlock` in `@syn/utils`, walking the template in its
 * flow direction from an anchor the profile supplies. Nothing inside a block
 * has an absolute time unless it is PINNED (`pinned_at`), and the stack flows
 * around a pin — the pin never moves (v1.1 R3).
 *
 * `offset_start_min` / `offset_end_min` ARE DEPRECATED since 0004 (TD-4).
 * The backfill in 0004 turned every offset into a gap; the columns are kept,
 * populated, and read by nothing after DYN-4, and dropped in `0006`. Their
 * two-hour-before-anchor allowance (TP-02) has no v1.1 equivalent: orient is
 * the first block, and a before-wake slot's position survives only in the
 * deprecated column (logged in Epic 4's DEVIATIONS).
 *
 * TWO GROUPS, TWO MEANINGS. `multitask_group` means BOTH happen — members
 * share a position and a start (v1 §5.5). `alternates_group` means EXACTLY
 * ONE happens, chosen at the pick (v1.1 §3.5, *one of*): members share a
 * position and differ in duration, and `alternates_default` marks the one
 * the fit arithmetic uses. A slot is never in both. Two slots at one position
 * must share one of the two groups or the save is refused — enforced in
 * `saveSlot` (DYN-4), the one place the position rule is stated. A partial
 * unique index holds "at most one default per group"; the service holds "at
 * least one".
 *
 * `role` is meaningful only under an `opener_pool_closer` template (v1.1
 * §3.4); the service normalises it to `stack` otherwise.
 *
 * `habit_id` CASCADES because a habit is never hard-deleted through the app;
 * archiving a habit removes its slots through LB-01's service instead, which
 * is a decision the person is shown before it happens.
 *
 * POLICIES: owner-private CRUD, on this table's own `user_id` — the service
 * writes the template's owner, never the caller's claim.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { schedulingEnum, timeModeEnum } from "../enums";
import { habits } from "../library/habits";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { slotRoleEnum } from "./enums";
import { templates } from "./templates";

export const templateSlots = pgTable(
  "template_slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** The member of a *one of* group the fit arithmetic uses (v1.1 §3.5). */
    alternatesDefault: boolean("alternates_default").notNull().default(false),
    /** A local id within the template — *one of*; exactly one member happens. */
    alternatesGroup: text("alternates_group"),
    /** A specific value chosen from within the habit's range, in minutes. */
    durationMin: smallint("duration_min").notNull(),
    /** Transition before this slot, 0–240 (v1.1 §3.2). Always 0 on a pin. */
    gapBeforeMin: smallint("gap_before_min").notNull().default(0),
    /** A local id within the template (§3.5) — multitask; both happen. */
    multitaskGroup: text("multitask_group"),
    /** DEPRECATED since 0004 — see the header. Windows only. Dropped in 0006. */
    offsetEndMin: integer("offset_end_min"),
    /** DEPRECATED since 0004 — see the header. Dropped in 0006. */
    offsetStartMin: integer("offset_start_min"),
    /** A clock time when the slot is a pin; the stack flows around it (R3). */
    pinnedAt: time("pinned_at"),
    /** 1–7. Per-template override of the habit's `life_priority` (§3.5). */
    priorityOverride: smallint("priority_override"),
    /** Opener · pool · closer under that structure; `stack` otherwise (v1.1 §3.4). */
    role: slotRoleEnum("role").notNull().default("stack"),
    scheduling: schedulingEnum("scheduling").notNull(),
    /**
     * The stack order within the template (v1.1 §11.5) — dense, owned by the
     * service. Inside a bracket or a one-of group members share a position;
     * this is the tie-break.
     */
    sortOrder: smallint("sort_order").notNull(),
    timeMode: timeModeEnum("time_mode").notNull(),

    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    templateId: uuid("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("template_slots_template_id_sort_order_idx").on(
      table.templateId,
      table.sortOrder,
    ),
    index("template_slots_habit_id_idx").on(table.habitId),
    index("template_slots_user_id_idx").on(table.userId),
    // At most one default per one-of group; the service enforces at least one.
    uniqueIndex("template_slots_alternates_default_idx")
      .on(table.templateId, table.alternatesGroup)
      .where(
        sql`${table.alternatesDefault} AND ${table.alternatesGroup} IS NOT NULL`,
      ),
    check(
      "template_slots_duration_min_check",
      sql`${table.durationMin} BETWEEN 1 AND 480`,
    ),
    check(
      "template_slots_gap_before_min_check",
      sql`${table.gapBeforeMin} BETWEEN 0 AND 240`,
    ),
    check(
      "template_slots_offset_start_min_check",
      sql`${table.offsetStartMin} IS NULL OR ${table.offsetStartMin} >= -120`,
    ),
    // A pin has no gap: it starts where it is pinned, not after what precedes it.
    check(
      "template_slots_pinned_gap_check",
      sql`${table.pinnedAt} IS NULL OR ${table.gapBeforeMin} = 0`,
    ),
    check(
      "template_slots_priority_override_check",
      sql`${table.priorityOverride} IS NULL OR ${table.priorityOverride} BETWEEN 1 AND 7`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "template_slots",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const templateSlotsRelations = relations(templateSlots, ({ one }) => ({
  habit: one(habits, {
    fields: [templateSlots.habitId],
    references: [habits.id],
  }),
  template: one(templates, {
    fields: [templateSlots.templateId],
    references: [templates.id],
  }),
  user: one(users, {
    fields: [templateSlots.userId],
    references: [users.id],
  }),
}));
