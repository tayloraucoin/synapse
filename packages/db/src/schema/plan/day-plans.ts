/**
 * day_plans — a named day, composed from the parts first run collected
 * (UX v1.2 §3.13, §4.13, §11.5; R31, TD-10).
 *
 * A ROW OF REFERENCES, NEVER A COPY. A plan points at a work template (the
 * work-day type, or null for *No work on this day*), at up to three block
 * templates (the getting-ready list, the morning routine, the wind-down —
 * `Getting ready A`, `Morning routine A`, `Wind-down A`), carries the four
 * times a day is anchored from (null = inherit from the profile or the
 * type), the workouts placed (`training`), the breaks (`breaks`), and which
 * weekday fixtures this plan leaves out (`excluded_fixture_ids` — fixtures
 * are matched by weekday; the plan stores only exclusions). A second plan may
 * point at the first's lists; editing *Getting ready A* edits every plan
 * that uses it, and the template list says *used by Day A, Day B*. Deleting
 * a plan deletes references only.
 *
 * NOT v1's WHOLE-DAY TEMPLATE. Nothing inside a plan has an absolute time
 * except its anchors and the pins; every block still stacks in its flow
 * direction from `stackBlock` (TD-4). A day is an ordered set of blocks
 * (TD-2), and a plan is what the week build reads first to make them
 * (`prefillWeek`, RUN-5) — it is never materialised by any other path.
 *
 * ONE PLAN PER WEEKDAY, per person. An array column cannot carry that as a
 * constraint; the service validates it on every write and moves a claimed
 * weekday with a report (*Thursday moves from Day A.*). A double claim that
 * slips through is read as the lower `sort_order`'s and logged.
 *
 * UX v1.3 (0009, TD-25, TD-26) adds two more references: the after-work list
 * (a `transition` template, *After work A*) and the free-time pool (an
 * `activity` template of structure `pool`, *Evenings A*). The work template
 * is the plan's own under v1.3 (TD-23) — an ownership rule of the service,
 * not a column.
 *
 * `state` is `draft` until the builder's review (13i) — a plan left early
 * shows *unfinished*; `complete` requires a weekday, a wake and a lights-out
 * (own or inherited), and a work template or an explicit *no work*.
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

import type { DayPlanBreak, DayPlanTraining, IconValue } from "@syn/types";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { dayPlanStateEnum } from "./enums";
import { templates } from "./templates";

export const dayPlans = pgTable(
  "day_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** JSON shape: DayPlanBreak[] — `{ habitId, at: "midday" | "HH:mm" }`. Up to seven. */
    breaks: jsonb("breaks").$type<DayPlanBreak[]>().notNull().default([]),
    /** The plan's own *phone away*; null = the profile's (v1.2 §4.13h). */
    devicesOffTime: time("devices_off_time"),
    /** Weekday fixtures this plan leaves out; the rest apply by weekday. */
    excludedFixtureIds: uuid("excluded_fixture_ids").array().notNull().default([]),
    /** Optional glyph (v1.2 §4.13a). JSON shape: IconValue. */
    icon: jsonb("icon").$type<IconValue>(),
    /** The plan's own *lights out*; null = the profile's. */
    lightsOutTime: time("lights_out_time"),
    /** 1–40 — *Day A*, renameable. */
    name: text("name").notNull(),
    /** The list's order on *Your days*. */
    sortOrder: smallint("sort_order").notNull().default(0),
    state: dayPlanStateEnum("state").notNull().default("draft"),
    /** JSON shape: DayPlanTraining[] — `{ habitId, placement }`; the enum is `day_blocks.placement`'s. */
    training: jsonb("training").$type<DayPlanTraining[]>().notNull().default([]),
    /** The plan's own *up at*; null = the profile's. */
    wakeTime: time("wake_time"),
    /** Mon = 0 … Sun = 6; each at most once; at most one plan per weekday (service-enforced). */
    weekdays: smallint("weekdays").array().notNull().default([]),
    /** The plan's own *until about*; null = the type's, then the profile's. */
    workEndTime: time("work_end_time"),
    /** The plan's own *working by*; null = the type's, then the profile's. */
    workStartTime: time("work_start_time"),

    /**
     * Free time — an `activity` template of structure `pool` (*Evenings A*),
     * the activities this day chooses from; the day's block materialises
     * pooled (UX v1.3 R50, §3.16, TD-26; 0009). Null = none.
     */
    activityTemplateId: uuid("activity_template_id").references(() => templates.id, {
      onDelete: "set null",
    }),
    /**
     * *After work* — a `transition` template, the hand-off between work and
     * the evening, one per plan (UX v1.3 R48, §3.13, TD-25; 0009). Null = none.
     */
    afterWorkTemplateId: uuid("after_work_template_id").references(() => templates.id, {
      onDelete: "set null",
    }),
    /** The morning routine — a `morning` template; `set null` so an archived list leaves the plan standing. */
    morningTemplateId: uuid("morning_template_id").references(() => templates.id, {
      onDelete: "set null",
    }),
    /** *Getting ready* — a `prep` template. */
    prepTemplateId: uuid("prep_template_id").references(() => templates.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** The wind-down — a `wind_down` template. */
    windDownTemplateId: uuid("wind_down_template_id").references(() => templates.id, {
      onDelete: "set null",
    }),
    /** The work-day type — a `work` template; null = *No work on this day*. */
    workTemplateId: uuid("work_template_id").references(() => templates.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("day_plans_user_id_sort_order_idx").on(table.userId, table.sortOrder),
    index("day_plans_user_id_idx").on(table.userId),
    index("day_plans_prep_template_id_idx").on(table.prepTemplateId),
    index("day_plans_morning_template_id_idx").on(table.morningTemplateId),
    index("day_plans_wind_down_template_id_idx").on(table.windDownTemplateId),
    index("day_plans_work_template_id_idx").on(table.workTemplateId),
    index("day_plans_after_work_template_id_idx").on(table.afterWorkTemplateId),
    index("day_plans_activity_template_id_idx").on(table.activityTemplateId),
    check("day_plans_name_check", sql`length(${table.name}) BETWEEN 1 AND 40`),
    check(
      "day_plans_weekdays_check",
      sql`${table.weekdays} <@ ARRAY[0,1,2,3,4,5,6]::smallint[]`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "day_plans",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const dayPlansRelations = relations(dayPlans, ({ one }) => ({
  activityTemplate: one(templates, {
    fields: [dayPlans.activityTemplateId],
    references: [templates.id],
    relationName: "day_plans_activity",
  }),
  afterWorkTemplate: one(templates, {
    fields: [dayPlans.afterWorkTemplateId],
    references: [templates.id],
    relationName: "day_plans_after_work",
  }),
  morningTemplate: one(templates, {
    fields: [dayPlans.morningTemplateId],
    references: [templates.id],
    relationName: "day_plans_morning",
  }),
  prepTemplate: one(templates, {
    fields: [dayPlans.prepTemplateId],
    references: [templates.id],
    relationName: "day_plans_prep",
  }),
  user: one(users, {
    fields: [dayPlans.userId],
    references: [users.id],
  }),
  windDownTemplate: one(templates, {
    fields: [dayPlans.windDownTemplateId],
    references: [templates.id],
    relationName: "day_plans_wind_down",
  }),
  workTemplate: one(templates, {
    fields: [dayPlans.workTemplateId],
    references: [templates.id],
    relationName: "day_plans_work",
  }),
}));
