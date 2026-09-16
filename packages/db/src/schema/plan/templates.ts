/**
 * templates — a saved BLOCK (UX v1.1 §3.1, §11.4, TD-1; formerly official
 * spec §3.4's whole-day plan).
 *
 * UNDER v1.1 A TEMPLATE IS A BLOCK, NOT A DAY. It carries a `kind` (morning,
 * prep, wind-down, …), a `flow` (forward from wake, or backward to an anchor),
 * and a `structure` (a plain stack, or opener · pool · closer). A day's
 * template list is `day_blocks` (0005); a routine variant with a weekly count
 * is exactly what this row already was, which is why the table was widened
 * rather than replaced (TD-1).
 *
 * Slots STACK: each holds a duration and a gap (`template_slots`), and the
 * offsets are derived by `stackBlock` in the block's flow direction from an
 * anchor the PROFILE supplies at materialisation — wake for a morning block,
 * work start for prep, lights-out for wind-down. `anchor_time` is therefore
 * NULLABLE since 0004 and means "an explicit override", which only a work
 * template with its own hours needs (v1.1 R5). Rows written under v1.0 keep
 * the value they had; DYN-5's materialiser ignores it for every kind but
 * `work`, and `0006` nulls it for the rest.
 *
 * `kind` WAS BACKFILLED TO `morning` for every row that existed before 0004.
 * Every v1.0 template was a whole day anchored at wake; as a morning block it
 * lays out identically, and the block editor lets a person re-kind it.
 *
 * `weekly_target` IS NULL FOR *none*, NEVER 0 (Epic 1 TP-02). The form's
 * stepper shows 0 as *none*; the column stores the absence.
 *
 * ARCHIVE, NEVER DELETE. An archived template's name still appears in the
 * header of every past day it built (cross-cutting §8.3).
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
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

import { blockKindEnum } from "../enums";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { anchorDirectionEnum } from "../user/enums";
import { users } from "../user/users";
import { blockFlowEnum, blockStructureEnum, workDayKindEnum } from "./enums";
import { templateSlots } from "./template-slots";

export const templates = pgTable(
  "templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /**
     * An explicit anchor override — meaningful for a work template with its
     * own hours (v1.1 R5). Every other kind anchors from the profile at
     * materialisation (v1.1 §3.1). Nullable since 0004; see the header.
     */
    anchorTime: time("anchor_time"),
    /**
     * Work templates only — the type's own answer to *what gives* (UX v1.2
     * §3.8, TD-14, 0007); null = the profile's. The service refuses the four
     * work columns on any other kind.
     */
    anchorDirection: anchorDirectionEnum("anchor_direction"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** Forward from the anchor, or backward to it (v1.1 §3.3). */
    flow: blockFlowEnum("flow").notNull().default("forward"),
    /** Work templates only — the type's glyph (UX v1.2 §4.3, 0007). JSON shape: IconValue. */
    icon: jsonb("icon").$type<IconValue>(),
    /** Which block this template is (v1.1 §3.1). Backfilled to `morning` in 0004. */
    kind: blockKindEnum("kind").notNull(),
    /** Work templates only — remote · coworking · office · other; a label (UX v1.2 §3.8, 0007). */
    locationKind: workDayKindEnum("location_kind"),
    /** 1–40 — Epic 1 §9. */
    name: text("name").notNull(),
    /** A plain stack, or opener · pool · closer (v1.1 §3.4). */
    structure: blockStructureEnum("structure").notNull().default("stack"),
    /**
     * A hint shown during the week build, nothing more (§3.4). Mon = 0 … Sun =
     * 6, matching `TemplateSummaryView.typicalDays`.
     */
    typicalDays: smallint("typical_days").array(),
    /** 1–7, or null for *none* — shown as "used 1 of 2" during the week build. */
    weeklyTarget: smallint("weekly_target"),
    /**
     * Work templates only — the type's *until about* (UX v1.2 §3.8, 0007);
     * null = the profile's `work_end_time`. `anchor_time` above is the type's
     * *working by*. DYN-11 declined this column ("until is the same for every
     * work day"); v1.2 R32 gives each type its own hours.
     */
    workEndTime: time("work_end_time"),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("templates_user_id_archived_at_idx").on(
      table.userId,
      table.archivedAt,
    ),
    index("templates_user_id_idx").on(table.userId),
    index("templates_user_id_kind_idx").on(table.userId, table.kind),
    check(
      "templates_weekly_target_check",
      sql`${table.weeklyTarget} IS NULL OR ${table.weeklyTarget} BETWEEN 1 AND 7`,
    ),
    // Mon = 0 … Sun = 6. A weekday outside that range is not a hint, it is a
    // bug that would render as a missing chip.
    check(
      "templates_typical_days_check",
      sql`${table.typicalDays} IS NULL OR (${table.typicalDays} <@ ARRAY[0,1,2,3,4,5,6]::smallint[])`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "templates",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const templatesRelations = relations(templates, ({ many, one }) => ({
  slots: many(templateSlots),
  user: one(users, {
    fields: [templates.userId],
    references: [users.id],
  }),
}));
