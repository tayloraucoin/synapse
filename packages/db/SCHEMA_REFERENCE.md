# Synapse — Database Schema Reference

**Product:** Synapse — a private habit and day planner (Phase 1)
**Stack:** Turborepo · Next.js · TypeScript · DrizzleORM · PostgreSQL · Supabase
**Package:** `@syn/db` (`packages/db`)
**Status:** Generated reference synced to `packages/db/src/schema/`. The Drizzle code in §4 is injected verbatim from the `.ts` files.

> **Conventions (enforced everywhere):** UUID PKs via `defaultRandom()`; `created_at` + `updated_at` TIMESTAMPTZ on every table; snake_case columns; snake_case plural tables; `pgEnum` for status/type/state; explicit FKs with `onDelete`; `auth.users` is the auth source (never store passwords). Every user-data table is **owner-private**: the person is the only reader and the only writer, and there is no admin-read policy anywhere in this schema.

---

## 1. ENTITY OVERVIEW

**29 tables** in `public`, plus a reference-only mirror of Supabase's `auth.users`. Grouped by domain.

**Group 1 — Auth & Users.** `users` is the shadow of `auth.users` — its primary key **is** the foreign key, and the row is created by the `handle_new_user()` trigger, never by the app. It carries every account scalar: timezone, day-close and review-reminder times, theme, display name, the usual wake time, the week-build reminder's day and time, the first-run resume point, the deferred-settings pending pair, and — since UX v1.1 (0005) — the shape of the week (`schedule_shape`, `work_days`, `work_start_time`, `work_end_time`, `anchor_direction`), the wake range, lights-out and devices-off, the overflow mode, the orient frame's settings, the journal's switch and prompts, and the block order — and, since UX v1.2 (0007), how mornings go (`morning_mode`), the quote opt-in, the two further morning lines, and the journal reminder's switch and time. There is no wake anchor since `0006` (v1.1 R11, DYN-21): the orient frame is the wake moment. `user_avatars` is the optional photo, keyed by `user_id` — one per person, no surrogate id. Deleting the auth user cascades through this row to everything.

**Group 2 — Library.** What a person keeps, independent of any day. `habits` is the reusable definition (type, title, icon, the duration range, the 1–7 life priority, the quantity unit, the reflection axes, and — since 0004 — a default `block_kind` and, for workouts and focuses, a rotation: `weekly_target` and `typical_days`; and, since 0007, up to three `versions` and, for a workout, its `workout_type`, `location` and travel there and back — never added to the length); `categories` group them for reporting only, never for a mechanic; `reasons` is the per-person, editable set a miss is attributed from, seeded from `DEFAULT_REASONS`; `passages` (0007) are the morning's reading — a title, a Markdown body, up to four images, tags, in the order the cycle reads them. Habits, templates, reasons and passages archive; only a category is deleted, and it unassigns.

**Group 3 — Plan.** `templates` is a saved BLOCK (UX v1.1, 0004): a `kind`, a `flow` and a `structure`, whose `template_slots` STACK — each a duration and a `gap_before_min`, offsets derived by `stackBlock` from an anchor the profile supplies; a slot may be pinned to a clock time, and two slots at one position share a `multitask_group` (both happen) or an `alternates_group` (one of). The v1.0 offsets went in `0006`. A work template may be a work-day type since 0007 (its own `work_end_time`, `location_kind`, `anchor_direction`, `icon`). `fixtures` are weekday things (a stand-up on Tuesdays) that materialise as pins whatever template the day gets; since 0007 each carries a `kind` and an `icon` — a label, never a mechanic. `day_plans` (0007) is a named day composed by reference — weekdays, a work template, four nullable times, three template FKs, the workouts placed, the breaks, the fixtures excluded — that the week build reads first; it copies nothing and materialises through no other path. `days` is one calendar date in the person's stored zone; it snapshots `timezone` and `day_close_time` so a later settings change cannot re-key or re-window a past day, and since 0005 carries its `shape`, `confirmed_at` (*Set the day*), today's anchor and focus, and the morning's lines (three since 0007, with `visualisation`), plus the `work_template_id` applied to it. `day_blocks` is one block on one day — the Today tab's section, the Schedule's band — with its own immutable `original_scheduled_start`.

**Group 4 — Day.** The record, and the part of the schema that is deliberately append-and-annotate. `day_items` snapshots `title`, `icon`, `quantity_unit`, `reflection_axes` and `notes_preflight` at materialisation, belongs to a `day_block` (nullable until 0006), may be `pinned`, carries its gap and its *one of* group, and — since 0007 — the `version_key` it came from and, for a travel row (`origin = travel`), the `parent_item_id` of the workout it sits beside; `original_scheduled_start` is immutable once set, enforced by a trigger, and is written at *Set the day* for items of a pooled or unconfirmed day. `timer_sessions` record time (a manual entry is marked as one), `misses` record how one undone item was attributed, `shifts` record a whole-day move or, since 0005, a `refit` that held the anchor and shortened or cut. `journal_entries` is one row per day, its answers keyed by the person's own prompt keys, merged one key at a time.

**Group 5 — Notifications.** `web_push_subscriptions` holds one row per browser that agreed to reminders (endpoint + p256dh + auth, plus platform and revocation); the scheduler reads it. `notification_prefs` holds one row per kind the person has an opinion about — a missing row means the §8.2 default — and, since 0005, one row per block for `item_start` (`block_kind`, unique `NULLS NOT DISTINCT`). `notification_deliveries` is the exactly-once ledger: one row per `(user, kind, target, minute)`, written before a push is sent and unique `NULLS NOT DISTINCT`, so an overlapping or repeated cron scan loses to the constraint rather than to a job's own care. Service-role only — nobody reads their own delivery log.

**Group 6 — System.** `data_exports` tracks a request to export everything (preparing → ready → expired, with the object path and a 24-hour expiry). `feedback_messages` is the About message: insert-only for its author, no authenticated read, and it holds only the message plus the two optional context fields the switch controls. `quotes` (0007) is the bank a person may opt into for the morning frame — app content with no `user_id`, under `catalogReadPolicies`: every signed-in person reads the published rows, nobody writes through the authenticated role, and nothing about the person decides which quote a day shows.

**Group 7 — Workflow.** Since Epic 7 (0011), six owner-private tables for the board of lanes by columns. `workflow_views` (a board: name, tab order, `last_opened_at`) owns its `workflow_columns` (name, order, a nullable `role` of `active` or `done`, at most one of each per view by partial unique index). `workflow_groups` are the lanes (name, `hue` from `category_color_key`, usual order, `collapsed`). `workflow_tasks` carry a title, a note, a place in their cell, and three timestamps — `firing_started_at`, `last_returned_at`, `closed_at` — with no boolean beside them; `column_id` restricts, `group_id` sets null (the lane *No group*), `view_id` cascades. `workflow_templates` is what the person saved, as a jsonb snapshot of names and roles; the two built-in templates are constants. `workflow_day_pins` is one row per `(user_id, day_key)` naming the groups made *first today*. Everything archives; nothing about *next* or today's lane order is stored.

**Deliberately not here** (official spec §3.11): no streak, no score cache — the number is computed on read — no social graph, and no coach output table. There is also no `week_plans` table: a week's status is derived from its days. And no wake anchor at all since UX v1.1 R11 (`0006`).

---

## 2. ENTITY RELATIONSHIP SUMMARY

**The one central entity.** `users`. Synapse is single-player: there is no couple, no team, no shared row. **Every table hangs directly off this one** and carries its own denormalised `user_id`, so every policy is the same three lines and every table is greppable for its owner — no policy ever subqueries another RLS-guarded table.

**One-to-many from `users`.** `categories`, `habits`, `reasons`, `passages`, `templates`, `template_slots`, `fixtures`, `day_plans`, `days`, `day_blocks`, `day_items`, `timer_sessions`, `shifts`, `misses`, `journal_entries`, `notification_prefs`, `notification_deliveries`, `web_push_subscriptions`, `data_exports`, `feedback_messages`, and the six `workflow_*` tables (0011). **One-to-one:** `user_avatars`. **Owned by nobody:** `quotes` — the product's catalogue, no `user_id`.

**The ownership chains** (each child also carries `user_id` directly): `categories` → `habits` → `template_slots` → `day_items`; `templates` → `template_slots` and `templates` → `day_blocks`; `days` → `day_blocks` → `day_items` → { `timer_sessions`, `misses` }; `days` → `shifts` → `misses`; `days` → `journal_entries` (one each); `workflow_views` → `workflow_columns` → `workflow_tasks` (the column `restrict`, the view `cascade`), and `workflow_groups` → `workflow_tasks` (`set null` — the lane *No group*).

**References that are not ownership.** `days.work_focus_habit_id` → `habits` and `fixtures.habit_id` → `habits` (both `set null`), `days.work_template_id` → `templates` and `day_plans`' four template FKs (all `set null` — a plan references, never copies, and an archived list leaves the plan standing), `day_items.carried_from_item_id` / `misses.traded_up_item_id` → `day_items` (both `set null` — a record points at another record without owning it), and `day_items.parent_item_id` → `day_items` (`cascade` — a travel row without its workout is nothing).

**Identity.** `public.users.id` = `auth.users.id`. One identity, two schemas, no drift, no join key to get wrong.

**Deletion.** `auth.admin.deleteUser` → cascade through `public.users` → everything, by cascade alone. The exceptions are deliberate: `web_push_subscriptions.user_id` is `set null` so a revoked endpoint stays reapable after the account is gone, and `feedback_messages.user_id` is `set null` so a message survives as anonymous.

```
                       auth.users            (Supabase Auth owns this)
                            │  handle_new_user() trigger
                            ▼
                       public.users ─────────< user_avatars (1:1)
                            │
       ┌────────────────────┼────────────────────┬──────────────────┐
       │                    │                    │                  │
   categories           templates             reasons        notification_prefs
       │                 │      │                              web_push_subscriptions
       ▼                 ▼      ▼                                data_exports
    habits ──────< template_slots  days                        feedback_messages
       │                 │          │  │
       └────────┬────────┘          │  └──< shifts
                ▼                   │           │
            day_items <─────────────┘           │
              │   │                             │
              │   └──< misses >─────────────────┘
              └──< timer_sessions
```

---

## 3. ENUMS

- **Shared (root `enums.ts`):** `item_type`, `time_mode`, `scheduling`, `miss_tier`, `category_color_key`.
- **User:** `theme_preference`.
- **Plan:** `day_close_reason`, `woke_at_source`.
- **Day:** `assignment_state`, `completion_state`, `item_origin`, `timer_session_source`, `miss_resolved_by`.
- **Notifications:** `device_platform`, `notification_kind`.
- **System:** `export_status`.
- **Workflow:** `workflow_column_role`.

Colocation rule (drizzle-orm-conventions §3): an enum used by one table lives in that table's file; by two tables in one directory, in that directory's `enums.ts`; by two directories, in the root `enums.ts`. The five shared enums are below; the rest live beside their table, and their source appears with that table in §4.

**Spelling is enforced, not reviewed.** Every enum's values are checked against the matching schema union in `@syn/types` by `enumValues<Union>()`: a typo fails the type-check, and so does an omission. That is what stops a value read from a row and a value chosen by a component from drifting apart.

```ts
// packages/db/src/schema/enum-values.ts
/**
 * Enum parity — the one place the non-negotiable "a value the DB stores and a
 * value a component chooses must be the same string" is enforced by the type
 * system rather than by review.
 *
 * `pgEnum` takes a tuple of literals; `@syn/types` has the union. Wrapping the
 * tuple in `enumValues<Union>()` makes both mistakes fail the type-check. Both
 * were verified by inducing them:
 *
 * - A TYPO fails at the declaration, with the fix in the message:
 *   `Type '"task_apointment"' is not assignable to type 'ItemType'. Did you
 *   mean '"task_appointment"'?`
 * - An OMISSION fails at the first consumer rather than here: the return type
 *   becomes the sentinel tuple `["MISSING_ENUM_VALUE", <the missing member>]`,
 *   which `pgEnum` accepts, so the sentinel surfaces in the column's type and
 *   every insert of a real value stops compiling. Less direct, still a red
 *   build — and the sentinel's name is in the error, so the cause is legible.
 *
 * The generated SQL is unchanged; the call is an identity at runtime.
 *
 *   export const itemTypeEnum = pgEnum(
 *     "item_type",
 *     enumValues<ItemType>()(["habit", "task_appointment", "deep_work"]),
 *   );
 */

type Missing<TUnion extends string, TValues extends readonly string[]> = Exclude<
  TUnion,
  TValues[number]
>;

type Exhaustive<TUnion extends string, TValues extends readonly TUnion[]> = [
  Missing<TUnion, TValues>,
] extends [never]
  ? TValues
  : readonly ["MISSING_ENUM_VALUE", Missing<TUnion, TValues>];

export function enumValues<TUnion extends string>() {
  return <const TValues extends readonly [TUnion, ...TUnion[]]>(
    values: TValues,
  ): Exhaustive<TUnion, TValues> => values as Exhaustive<TUnion, TValues>;
}

// packages/db/src/schema/enums.ts
/**
 * Root enums — pgEnum types shared across 2+ schema directories.
 *
 * Colocation rule (drizzle-orm-conventions §3):
 * - One table only → define in that table's file.
 * - 2+ tables in one directory → that directory's `enums.ts`.
 * - 2+ directories → this file.
 *
 * SPELLING IS `@syn/types`'. Every value below is checked against the schema
 * union in `packages/types/src/domain/domain.ts` by `enumValues<Union>()`, so a
 * typo or an omission is a type error rather than a value the database stores
 * and no component can ever match (SET-1 non-negotiable).
 */
import { pgEnum } from "drizzle-orm/pg-core";

import type {
  BlockKind,
  CategoryKey,
  FixtureKind,
  ItemType,
  MissTier,
  Scheduling,
  TimeMode,
  WorkoutLocation,
} from "@syn/types";

import { enumValues } from "./enum-values";

/*
 * UX v1.2 (RUN-1): the two below arrive with migration `0007` (RUN-2).
 * `fixture_kind` is on `fixtures` and, for a one-off, `day_items` (v1.2 §3.6,
 * R42) — two directories, so it lives here. `workout_location` is on `habits`
 * alone but sits beside it for the same reading. Nothing writes either before
 * `0007`.
 */

/** Fixture.kind — v1.2 §3.6. A label and a default glyph; never a mechanic. */
export const fixtureKindEnum = pgEnum(
  "fixture_kind",
  enumValues<FixtureKind>()([
    "meeting",
    "appointment",
    "class",
    "event",
    "social",
    "chore",
    "other",
  ]),
);

/** Habit.location — v1.2 §3.7; workouts only. `habits`. */
export const workoutLocationEnum = pgEnum(
  "workout_location",
  enumValues<WorkoutLocation>()(["home", "gym", "outside"]),
);

/**
 * Habit.type / DayItem.type — official spec §3.3. `habits`, `day_items`.
 *
 * `workout` is UX v1.1 §11.3 (TD-3). The TypeScript side moved in DYN-1 to
 * keep the workspace building; the `ALTER TYPE … ADD VALUE` ships in
 * migration `0004` (DYN-2). Nothing writes the value before then.
 */
export const itemTypeEnum = pgEnum(
  "item_type",
  enumValues<ItemType>()(["habit", "task_appointment", "deep_work", "workout"]),
);

/**
 * Block.kind — UX v1.1 §3.1, the eight kinds. `templates` and `habits` (0004),
 * then `fixtures`, `day_blocks`, `notification_prefs` (0005) — three
 * directories, so it lives here. The order is the default a day reads in;
 * `DEFAULT_BLOCK_ORDER` in `@syn/constants` is the person-editable subset.
 *
 * `transition` is UX v1.3 R48, TD-25. The TypeScript side moved in DAY-3 to
 * keep the workspace building; the `ALTER TYPE … ADD VALUE` ships in
 * migration `0009` (DAY-4). Nothing writes the value before then.
 */
export const blockKindEnum = pgEnum(
  "block_kind",
  enumValues<BlockKind>()([
    "orient",
    "morning",
    "training",
    "prep",
    "work",
    "break",
    "transition",
    "activity",
    "wind_down",
  ]),
);

/** §3.5, §3.7. `template_slots`, `day_items`. */
export const timeModeEnum = pgEnum(
  "time_mode",
  enumValues<TimeMode>()(["fixed_time", "window", "unscheduled"]),
);

/** §3.5. Hard anchors never move under shift-forward (§5.6). */
export const schedulingEnum = pgEnum(
  "scheduling",
  enumValues<Scheduling>()(["hard", "soft"]),
);

/**
 * §3.8. The resolver (§7.3) reads exactly these three: `circumstance` is
 * excluded, `scoping` credits half, `chose_not_to` credits 0.
 * `reasons`, `misses`, `shifts`.
 */
export const missTierEnum = pgEnum(
  "miss_tier",
  enumValues<MissTier>()(["circumstance", "scoping", "chose_not_to"]),
);

/**
 * Category.color_key — the eight category hues of official spec §9.3. Never
 * the accent teal and never the violet, so the semantic layer stays
 * unambiguous.
 *
 * `categories` and `workflow_groups` (Epic 7, a lane's hue) store it as a
 * column, and it is the same closed set an
 * `IconValue` of kind "curated" carries as `colorKey` in the `icon` jsonb on
 * both `habits` and `day_items` — two more directories. It lives here so the
 * hue vocabulary has one home rather than one home and two comments.
 */
export const categoryColorKeyEnum = pgEnum(
  "category_color_key",
  enumValues<CategoryKey>()([
    "leaf",
    "sky",
    "clay",
    "rose",
    "amber",
    "slate",
    "plum",
    "moss",
  ]),
);
```

---

## 4. SCHEMA — TABLE BY TABLE

Each group shows the **complete Drizzle source** (tables, relations, indexes, and inline RLS policies — injected from the `.ts` files) followed by per-table PURPOSE / INDEXES / RLS prose.

### GROUP 1 — AUTH & USERS

The shadow `users` table mirrors `auth.users` (Supabase Auth is the source of truth for identity). Its row is created by the `handle_new_user()` trigger, never by the app. `user_avatars` is the optional account photo, keyed by `user_id` because there is exactly one per person.

```ts
// packages/db/src/schema/auth.ts
/**
 * auth.ts — Reference-only mirror of Supabase's managed `auth` schema.
 *
 * WHY THIS EXISTS
 * Supabase (GoTrue) owns the `auth` schema and the `auth.users` table. We must
 * NOT let drizzle-kit create, alter, or drop anything in that schema, or it will
 * collide with the Supabase-managed objects and corrupt auth.
 *
 * We declare a *minimal* mirror of `auth.users` purely so that `.references()`
 * in our public tables resolve to a real Drizzle object and emit correct foreign
 * keys. drizzle.config.ts pins `schemaFilter: ['public']`, so drizzle-kit reads
 * this declaration for FK targets but never tries to migrate the `auth` schema.
 *
 * RULE: never add columns here beyond what we FK against (id). Never write to it
 * from the app — user creation flows through Supabase Auth, and a Postgres trigger
 * (`handle_new_user`, see supabase/setup) mirrors the row into public.users.
 */
import { pgSchema, uuid } from "drizzle-orm/pg-core";

export const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

// packages/db/src/schema/enums.ts
/**
 * Root enums — pgEnum types shared across 2+ schema directories.
 *
 * Colocation rule (drizzle-orm-conventions §3):
 * - One table only → define in that table's file.
 * - 2+ tables in one directory → that directory's `enums.ts`.
 * - 2+ directories → this file.
 *
 * SPELLING IS `@syn/types`'. Every value below is checked against the schema
 * union in `packages/types/src/domain/domain.ts` by `enumValues<Union>()`, so a
 * typo or an omission is a type error rather than a value the database stores
 * and no component can ever match (SET-1 non-negotiable).
 */
import { pgEnum } from "drizzle-orm/pg-core";

import type {
  BlockKind,
  CategoryKey,
  FixtureKind,
  ItemType,
  MissTier,
  Scheduling,
  TimeMode,
  WorkoutLocation,
} from "@syn/types";

import { enumValues } from "./enum-values";

/*
 * UX v1.2 (RUN-1): the two below arrive with migration `0007` (RUN-2).
 * `fixture_kind` is on `fixtures` and, for a one-off, `day_items` (v1.2 §3.6,
 * R42) — two directories, so it lives here. `workout_location` is on `habits`
 * alone but sits beside it for the same reading. Nothing writes either before
 * `0007`.
 */

/** Fixture.kind — v1.2 §3.6. A label and a default glyph; never a mechanic. */
export const fixtureKindEnum = pgEnum(
  "fixture_kind",
  enumValues<FixtureKind>()([
    "meeting",
    "appointment",
    "class",
    "event",
    "social",
    "chore",
    "other",
  ]),
);

/** Habit.location — v1.2 §3.7; workouts only. `habits`. */
export const workoutLocationEnum = pgEnum(
  "workout_location",
  enumValues<WorkoutLocation>()(["home", "gym", "outside"]),
);

/**
 * Habit.type / DayItem.type — official spec §3.3. `habits`, `day_items`.
 *
 * `workout` is UX v1.1 §11.3 (TD-3). The TypeScript side moved in DYN-1 to
 * keep the workspace building; the `ALTER TYPE … ADD VALUE` ships in
 * migration `0004` (DYN-2). Nothing writes the value before then.
 */
export const itemTypeEnum = pgEnum(
  "item_type",
  enumValues<ItemType>()(["habit", "task_appointment", "deep_work", "workout"]),
);

/**
 * Block.kind — UX v1.1 §3.1, the eight kinds. `templates` and `habits` (0004),
 * then `fixtures`, `day_blocks`, `notification_prefs` (0005) — three
 * directories, so it lives here. The order is the default a day reads in;
 * `DEFAULT_BLOCK_ORDER` in `@syn/constants` is the person-editable subset.
 *
 * `transition` is UX v1.3 R48, TD-25. The TypeScript side moved in DAY-3 to
 * keep the workspace building; the `ALTER TYPE … ADD VALUE` ships in
 * migration `0009` (DAY-4). Nothing writes the value before then.
 */
export const blockKindEnum = pgEnum(
  "block_kind",
  enumValues<BlockKind>()([
    "orient",
    "morning",
    "training",
    "prep",
    "work",
    "break",
    "transition",
    "activity",
    "wind_down",
  ]),
);

/** §3.5, §3.7. `template_slots`, `day_items`. */
export const timeModeEnum = pgEnum(
  "time_mode",
  enumValues<TimeMode>()(["fixed_time", "window", "unscheduled"]),
);

/** §3.5. Hard anchors never move under shift-forward (§5.6). */
export const schedulingEnum = pgEnum(
  "scheduling",
  enumValues<Scheduling>()(["hard", "soft"]),
);

/**
 * §3.8. The resolver (§7.3) reads exactly these three: `circumstance` is
 * excluded, `scoping` credits half, `chose_not_to` credits 0.
 * `reasons`, `misses`, `shifts`.
 */
export const missTierEnum = pgEnum(
  "miss_tier",
  enumValues<MissTier>()(["circumstance", "scoping", "chose_not_to"]),
);

/**
 * Category.color_key — the eight category hues of official spec §9.3. Never
 * the accent teal and never the violet, so the semantic layer stays
 * unambiguous.
 *
 * `categories` and `workflow_groups` (Epic 7, a lane's hue) store it as a
 * column, and it is the same closed set an
 * `IconValue` of kind "curated" carries as `colorKey` in the `icon` jsonb on
 * both `habits` and `day_items` — two more directories. It lives here so the
 * hue vocabulary has one home rather than one home and two comments.
 */
export const categoryColorKeyEnum = pgEnum(
  "category_color_key",
  enumValues<CategoryKey>()([
    "leaf",
    "sky",
    "clay",
    "rose",
    "amber",
    "slate",
    "plum",
    "moss",
  ]),
);

// packages/db/src/schema/user/enums.ts
/**
 * User-directory enums — pgEnum types used only by `users` and its satellite
 * (drizzle-orm-conventions §3). The three below arrive with UX v1.1 migration
 * 0005 (DYN-3) and describe the shape of a person's week.
 *
 * SPELLING IS `@syn/types`'. Each is checked against its union by
 * `enumValues<Union>()`.
 */
import { pgEnum } from "drizzle-orm/pg-core";

import type {
  AnchorDirection,
  MorningMode,
  OverflowMode,
  ScheduleShape,
} from "@syn/types";

import { enumValues } from "../enum-values";

/**
 * How mornings go — UX v1.2 R37, TD-17. The TypeScript side moved in RUN-1;
 * the `CREATE TYPE` ships in migration `0007` (RUN-2). Nothing writes it
 * before then.
 */
export const morningModeEnum = pgEnum(
  "morning_mode",
  enumValues<MorningMode>()(["set_from_plan", "build_each_morning"]),
);

/** "When your morning runs long, what gives?" — UX v1.1 §3.3, §4.3. */
export const anchorDirectionEnum = pgEnum(
  "anchor_direction",
  enumValues<AnchorDirection>()(["work_waits", "routine_cut", "depends"]),
);

/** How the days that do not fit are handled — UX v1.1 §3.10. */
export const overflowModeEnum = pgEnum(
  "overflow_mode",
  enumValues<OverflowMode>()(["daily_menu", "variants", "auto_trim"]),
);

/** The archetype chosen on first run's first screen — UX v1.1 §4.1. */
export const scheduleShapeEnum = pgEnum(
  "schedule_shape",
  enumValues<ScheduleShape>()([
    "own_structure_dynamic",
    "consistent_shifts",
    "varying_shifts",
    "fluid",
  ]),
);

// packages/db/src/schema/user/users.ts
/**
 * users.ts — the shadow of `auth.users`.
 *
 * Supabase owns `auth.users`. This row is created by the `handle_new_user()`
 * trigger, never by the app, and its primary key IS the foreign key to the
 * auth row: one identity, two schemas, no drift. Deleting the auth user
 * cascades this row away, which is how account deletion (Epic 1 ST-10a)
 * removes everything a person has.
 *
 * WHAT IS NOT HERE. Official spec §3.1 also lists `notification_prefs` and
 * `avatar`; both are satellite tables (`notification_prefs`, `user_avatars`),
 * because both are lists rather than scalars.
 *
 * THERE IS NO WAKE ANCHOR (UX v1.1 R11). v1.0 kept `wake_anchor_habit_id`
 * here (SET-1); the orient frame is the wake moment since DYN-13 and the
 * column is gone since `0006` (DYN-21). `days.woke_at_source = anchor` stays
 * on rows written under v1.0.
 *
 * THE PENDING PAIR (SET-1). A time-zone switch and a day-close change take
 * effect FROM TOMORROW (cross-cutting §7.3, §7.5), so writing them straight to
 * `timezone` / `day_close_time` would reclassify "now" the moment they were
 * saved — change the close from 03:00 to 05:00 at 04:00 and today's date flips
 * backwards. The four `pending_*` columns hold the new value and the date it
 * starts; `services/user/preferences.ts` applies and clears the pair on read,
 * and the scheduler's per-user pass does the same so the switch happens even
 * if the app is never opened.
 *
 * THE v1.1 PROFILE (UX v1.1 §11.2, migration 0005). The shape of the week
 * (`schedule_shape`, `work_days`, `work_start_time`, `work_end_time`,
 * `anchor_direction`), the evening (`lights_out_time`, `devices_off_time`),
 * the overflow mode, the orient frame's settings, the journal's switch and
 * prompts, and the block order. These are the anchors the materialiser lays every block out from;
 * a template no longer carries its own (TD-1).
 *
 * THE v1.2 ADDITIONS (UX v1.2 §11.1, migration 0007). How mornings go
 * (`morning_mode`, R37), the quote opt-in (`quotes_opt_in`, R36), the two
 * further morning lines (`orient_ask_intention`, `orient_ask_visualisation`),
 * and the journal reminder (`journal_reminder_enabled`, `journal_reminder_time`,
 * R38). Three v1.1 columns stopped being written under v1.2 — the wake
 * range's early end (R39), the one morning passage (copied into `passages`
 * by 0007) and the last-night switch (R41) — and are dropped by
 * `0010_retirements` (UX v1.3 TD-30; DAY-13), never in the migration that
 * added their replacements.
 *
 * POLICIES. Select and update are the owner's alone. Insert and delete are
 * denied to the authenticated role outright: the trigger inserts, and deletion
 * goes through `auth.admin.deleteUser` and cascades. There is no admin read.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

import type { BlockKind, JournalPrompt, WorkDays } from "@syn/types";

import { authUsers } from "../auth";
import { categories } from "../library/categories";
import { habits } from "../library/habits";
import { reasons } from "../library/reasons";
import { notificationPrefs } from "../notification/notification-prefs";
import { webPushSubscriptions } from "../notification/web-push-subscriptions";
import { days } from "../plan/days";
import { templates } from "../plan/templates";
import { denyAuthenticated, isOwner } from "../rls/helpers";
import {
  anchorDirectionEnum,
  morningModeEnum,
  overflowModeEnum,
  scheduleShapeEnum,
} from "./enums";
import { userAvatars } from "./user-avatars";

/**
 * The column defaults for the two jsonb settings — copied once into 0005 as
 * history; `@syn/constants` (`DEFAULT_BLOCK_ORDER`, `DEFAULT_JOURNAL_PROMPTS`)
 * is the living copy and the seed reads from there.
 */
const DEFAULT_BLOCK_ORDER_LITERAL: BlockKind[] = [
  "orient",
  "morning",
  "prep",
  "work",
  "activity",
  "wind_down",
];

const DEFAULT_JOURNAL_PROMPTS_LITERAL: JournalPrompt[] = [
  { key: "day_went", label: "How the day went" },
  { key: "gratitude_today", label: "Grateful for today" },
  { key: "gratitude_life", label: "Grateful for, in life" },
  { key: "looking_forward", label: "Looking forward to" },
  { key: "make_happen_tomorrow", label: "What I want to make happen tomorrow" },
  { key: "visualisation", label: "Tomorrow, as I see it" },
];

/**
 * The Appearance setting (Epic 1 ST-09). One table uses it, so it lives here
 * rather than in the root enums file. The three values are next-themes' own,
 * so the stored preference and the control speak the same words.
 */
export const themePreferenceEnum = pgEnum("theme_preference", [
  "system",
  "light",
  "dark",
]);

export const users = pgTable(
  "users",
  {
    // The PK *is* the FK to auth.users(id). Cascade so deleting the auth user
    // removes the shadow row. Populated by handle_new_user(), not the app.
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // UX v1.1 §3.3 — "when your morning runs long, what gives?" (0005).
    anchorDirection: anchorDirectionEnum("anchor_direction"),
    // UX v1.1 §3.1 — the person's order for the six non-placeable kinds (0005).
    // JSON shape: BlockKind[] — see @syn/types.
    blockOrder: jsonb("block_order")
      .$type<BlockKind[]>()
      .notNull()
      .default(DEFAULT_BLOCK_ORDER_LITERAL),
    // A day opens at this wall-clock time and closes at the next one (§6.1).
    dayCloseTime: time("day_close_time").notNull().default("03:00"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    // UX v1.1 §7.1 — *Phone away*; a pin in the wind-down routine (0005).
    devicesOffTime: time("devices_off_time"),
    // What the app calls you. 1–40 (Epic 1 §9).
    displayName: text("display_name"),
    // Mirrored from auth.users by handle_user_email_sync().
    email: text("email"),
    // Which first-run step to resume at; null once first run is done.
    firstRunStep: smallint("first_run_step"),
    firstRunCompletedAt: timestamp("first_run_completed_at", {
      withTimezone: true,
    }),
    // UX v1.1 §7.2 — *A few lines at night* (0005).
    journalEnabled: boolean("journal_enabled").notNull().default(true),
    // UX v1.2 §9 N2, R38 — the journal reminder's switch; on by default (0007).
    journalReminderEnabled: boolean("journal_reminder_enabled").notNull().default(true),
    // UX v1.2 §4.11 — the reminder's time; null = derived, phone away − 60 (0007).
    journalReminderTime: time("journal_reminder_time"),
    // UX v1.1 §7.2, TD-7 — the person's prompts, ordered, keyed stably (0005).
    // JSON shape: JournalPrompt[] — see @syn/types.
    journalPrompts: jsonb("journal_prompts")
      .$type<JournalPrompt[]>()
      .notNull()
      .default(DEFAULT_JOURNAL_PROMPTS_LITERAL),
    // UX v1.1 §7.1 — the wind-down routine flows backward to this (0005).
    lightsOutTime: time("lights_out_time"),
    // UX v1.2 R37, TD-17 — set from the plan, or build each morning (0007).
    morningMode: morningModeEnum("morning_mode").notNull().default("set_from_plan"),
    // UX v1.1 §5.2 — the one optional morning line, and with it the R18 line (0005).
    orientAskGratitude: boolean("orient_ask_gratitude").notNull().default(true),
    // UX v1.2 §4.6, §5.2 — the second and third optional morning lines (0007).
    orientAskIntention: boolean("orient_ask_intention").notNull().default(true),
    orientAskVisualisation: boolean("orient_ask_visualisation").notNull().default(true),
    // UX v1.1 §3.10 — how the days that do not fit are handled (0005). A
    // Settings preference since UX v1.2 §3.10; no longer asked at first run.
    overflowMode: overflowModeEnum("overflow_mode")
      .notNull()
      .default("daily_menu"),
    // The pending pair — see the header. `*_from` is the day key the new value
    // takes effect on; a reader applies it once the person's current day key is
    // at or past that date, then clears both.
    pendingDayCloseTime: time("pending_day_close_time"),
    pendingDayCloseTimeFrom: date("pending_day_close_time_from"),
    pendingTimezone: text("pending_timezone"),
    pendingTimezoneFrom: date("pending_timezone_from"),
    // UX v1.2 §3.12, R36 — a quote from the bank joins the passage cycle. Off
    // by default: the app never supplies the words unless asked (0007).
    quotesOptIn: boolean("quotes_opt_in").notNull().default(false),
    // "*Not now* is remembered" (official spec §8.3, Epic 1 §8.7) — the app
    // never re-prompts for notification permission on its own after this.
    reminderPromptAnsweredAt: timestamp("reminder_prompt_answered_at", {
      withTimezone: true,
    }),
    // The review reminder's time (§8.2 N4). Default 21:00.
    reviewReminderTime: time("review_reminder_time").notNull().default("21:00"),
    // UX v1.3 R61 — *Same routine every day?*, asked once after the first
    // ranking: true = one morning template every plan references; false = each
    // day picks or builds its own; null = not yet asked (0009).
    sameMorningRoutine: boolean("same_morning_routine"),
    // UX v1.1 §4.1 — which archetype; only the first is live (0005).
    scheduleShape: scheduleShapeEnum("schedule_shape"),
    theme: themePreferenceEnum("theme").notNull().default("system"),
    // The zone the person's days are stored and rendered in (cross-cutting
    // §7.3) — not the viewer's device zone. Defaults from the device at first
    // run; 'UTC' is only the value before that happens.
    timezone: text("timezone").notNull().default("UTC"),
    // When the day usually starts (Epic 1 FR-01, ST-08). The default
    // `anchor_time` for a new template, and nothing else — it is not a day
    // boundary and it is not an alarm.
    usualWakeTime: time("usual_wake_time").notNull().default("07:00"),
    // N6's day and time. Mon = 0, so 6 is Sunday — official spec §8.2's default.
    weekBuildReminderTime: time("week_build_reminder_time")
      .notNull()
      .default("18:00"),
    weekBuildReminderWeekday: smallint("week_build_reminder_weekday")
      .notNull()
      .default(6),
    // UX v1.1 §4.2 — always · sometimes · never, per weekday, Mon = "0" (0005).
    // JSON shape: WorkDays — see @syn/types.
    workDays: jsonb("work_days").$type<WorkDays>(),
    // UX v1.1 §4.3 — *until about*; where the evening starts (0005, R24).
    workEndTime: time("work_end_time"),
    // UX v1.1 §4.3 — the anchor prep flows backward to (0005).
    workStartTime: time("work_start_time"),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    check(
      "users_week_build_reminder_weekday_check",
      sql`${table.weekBuildReminderWeekday} BETWEEN 0 AND 6`,
    ),
    pgPolicy("users_select", {
      for: "select",
      to: authenticatedRole,
      using: isOwner(sql`${table.id}`),
    }),
    pgPolicy("users_update", {
      for: "update",
      to: authenticatedRole,
      using: isOwner(sql`${table.id}`),
      withCheck: isOwner(sql`${table.id}`),
    }),
    pgPolicy("users_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: denyAuthenticated,
    }),
    pgPolicy("users_delete", {
      for: "delete",
      to: authenticatedRole,
      using: denyAuthenticated,
    }),
  ],
);

export const usersRelations = relations(users, ({ many, one }) => ({
  avatar: one(userAvatars),
  categories: many(categories),
  days: many(days),
  habits: many(habits),
  notificationPrefs: many(notificationPrefs),
  reasons: many(reasons),
  templates: many(templates),
  webPushSubscriptions: many(webPushSubscriptions),
}));

// packages/db/src/schema/user/user-avatars.ts
/**
 * user_avatars — the optional account photo (official spec §3.1 `avatar`,
 * §9.8).
 *
 * ONE PER PERSON, so `user_id` IS the primary key and there is no separate
 * `id`. Replacing a photo replaces this row; removing it deletes the row and
 * the `Avatar` primitive falls back to initials, which is the default state
 * rather than an error state.
 *
 * The bytes live in the private `avatars` bucket; `storage_path` is the object
 * key (`avatars/{user_id}/{uuid}.jpg`). SET-3 mints the signed upload and
 * serves reads through its session-gated streaming route — the path alone is
 * worthless without a cookie.
 *
 * No status dots, rings, or presence (official spec §9.8): Synapse is
 * single-player and there is no one to be present to.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "./users";

export const userAvatars = pgTable(
  "user_avatars",
  {
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    byteSize: integer("byte_size").notNull(),
    /** jpeg, png or webp — `USER_IMAGE_MIME_TYPES` in `@syn/constants`. */
    contentType: text("content_type").notNull(),
    /** `avatars/{user_id}/{uuid}.jpg` in the private bucket. */
    storagePath: text("storage_path").notNull(),

    /** The primary key: one avatar per person, no surrogate id. */
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    ...ownerPrivateCrudPolicies({
      prefix: "user_avatars",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const userAvatarsRelations = relations(userAvatars, ({ one }) => ({
  user: one(users, {
    fields: [userAvatars.userId],
    references: [users.id],
  }),
}));
```

#### `auth.users`

**PURPOSE.** auth.ts — Reference-only mirror of Supabase's managed `auth` schema. WHY THIS EXISTS Supabase (GoTrue) owns the `auth` schema and the `auth.users` table. We must NOT let drizzle-kit create, alter, or drop anything in that schema, or it will collide with the Supabase-managed objects and corrupt auth. We declare a *minimal* mirror of `auth.users` purely so that `.references()` in our public tables resolve to a real Drizzle object and emit correct foreign keys. drizzle.config.ts pins `schemaFilter: ['public']`, so drizzle-kit reads this declaration for FK targets but never tries to migrate the `auth` schema. RULE: never add columns here beyond what we FK against (id). Never write to it from the app — user creation flows through Supabase Auth, and a Postgres trigger (`handle_new_user`, see supabase/setup) mirrors the row into public.users.

**INDEXES.** *(see source)*

**RLS.** Supabase Auth owns this table; it is mirrored here for FK resolution only and is never migrated.

#### `users`

**PURPOSE.** users.ts — the shadow of `auth.users`. Supabase owns `auth.users`. This row is created by the `handle_new_user()` trigger, never by the app, and its primary key IS the foreign key to the auth row: one identity, two schemas, no drift. Deleting the auth user cascades this row away, which is how account deletion (Epic 1 ST-10a) removes everything a person has. WHAT IS NOT HERE. Official spec §3.1 also lists `notification_prefs` and `avatar`; both are satellite tables (`notification_prefs`, `user_avatars`), because both are lists rather than scalars. THERE IS NO WAKE ANCHOR (UX v1.1 R11). v1.0 kept `wake_anchor_habit_id` here (SET-1); the orient frame is the wake moment since DYN-13 and the column is gone since `0006` (DYN-21). `days.woke_at_source = anchor` stays on rows written under v1.0. THE PENDING PAIR (SET-1). A time-zone switch and a day-close change take effect FROM TOMORROW (cross-cutting §7.3, §7.5), so writing them straight to `timezone` / `day_close_time` would reclassify "now" the moment they were saved — change the close from 03:00 to 05:00 at 04:00 and today's date flips backwards. The four `pending_*` columns hold the new value and the date it starts; `services/user/preferences.ts` applies and clears the pair on read, and the scheduler's per-user pass does the same so the switch happens even if the app is never opened. THE v1.1 PROFILE (UX v1.1 §11.2, migration 0005). The shape of the week (`schedule_shape`, `work_days`, `work_start_time`, `work_end_time`, `anchor_direction`), the evening (`lights_out_time`, `devices_off_time`), the overflow mode, the orient frame's settings, the journal's switch and prompts, and the block order. These are the anchors the materialiser lays every block out from; a template no longer carries its own (TD-1). THE v1.2 ADDITIONS (UX v1.2 §11.1, migration 0007). How mornings go (`morning_mode`, R37), the quote opt-in (`quotes_opt_in`, R36), the two further morning lines (`orient_ask_intention`, `orient_ask_visualisation`), and the journal reminder (`journal_reminder_enabled`, `journal_reminder_time`, R38). Three v1.1 columns stopped being written under v1.2 — the wake range's early end (R39), the one morning passage (copied into `passages` by 0007) and the last-night switch (R41) — and are dropped by `0010_retirements` (UX v1.3 TD-30; DAY-13), never in the migration that added their replacements. POLICIES. Select and update are the owner's alone. Insert and delete are denied to the authenticated role outright: the trigger inserts, and deletion goes through `auth.admin.deleteUser` and cascades. There is no admin read.

**INDEXES.**
- `users_email_idx`

**RLS.** Owner read and update. Insert and delete are denied to the authenticated role outright: `handle_new_user()` inserts, and deletion cascades from `auth.admin.deleteUser`.

#### `user_avatars`

**PURPOSE.** user_avatars — the optional account photo (official spec §3.1 `avatar`, §9.8). ONE PER PERSON, so `user_id` IS the primary key and there is no separate `id`. Replacing a photo replaces this row; removing it deletes the row and the `Avatar` primitive falls back to initials, which is the default state rather than an error state. The bytes live in the private `avatars` bucket; `storage_path` is the object key (`avatars/{user_id}/{uuid}.jpg`). SET-3 mints the signed upload and serves reads through its session-gated streaming route — the path alone is worthless without a cookie. No status dots, rings, or presence (official spec §9.8): Synapse is single-player and there is no one to be present to. POLICIES: owner-private CRUD.

**INDEXES.** *(see source)*

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

### GROUP 2 — LIBRARY

What a person keeps: the habits they might do (since UX v1.2 with up to three versions and, for a workout, a type, a location and its travel), the categories those group into, the reasons a miss can be attributed to, and — since UX v1.2 (0007) — the `passages` they read each morning, and — since UX v1.3 (0009) — the `links` they open from it (a playlist, a track, a page; the kind derived from the host, nothing fetched). Nothing here is ever hard-deleted except a category, which unassigns.

```ts
// packages/db/src/schema/library/categories.ts
/**
 * categories — free-defined groupings a habit may belong to (official spec
 * §3.2).
 *
 * Used for time-distribution reporting only, never for any mechanic: a
 * category never changes what an item is worth, when it runs, or how a miss
 * resolves. A habit has at most one.
 *
 * DELETING A CATEGORY UNASSIGNS (Epic 1 CT-01, cross-cutting §8.1) — it is one
 * of the four things in the product that is deleted rather than archived, and
 * `habits.category_id` is `ON DELETE set null` so the habits survive it. Past
 * reports keep the name they were run under because they read the day's rows,
 * not this table.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { categoryColorKeyEnum } from "../enums";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { habits } from "./habits";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** One of the eight category hues — official spec §3.2, §9.3. */
    colorKey: categoryColorKeyEnum("color_key").notNull(),
    /** 1–24, unique per person — Epic 1 §9. */
    name: text("name").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("categories_user_id_name_idx").on(table.userId, table.name),
    index("categories_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "categories",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  habits: many(habits),
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
}));

// packages/db/src/schema/library/habits.ts
/**
 * habits — the library entry (official spec §3.3).
 *
 * The reusable definition. It never appears on a day directly; it is slotted
 * into a template (`template_slots`) or placed as a one-off, and what lands on
 * the day is a `day_items` row that SNAPSHOTS this row's title, icon, quantity
 * unit, reflection axes and preflight note. Editing a habit therefore never
 * rewrites the past (cross-cutting §8.1) — and SET-4's re-snapshot rule
 * rewrites only untouched future items, never a started, done, reviewed, or
 * past one.
 *
 * NEVER HARD-DELETED. `archived_at` is the only exit; `template_slots` cascade
 * from here only because a hard delete cannot happen through the app, and
 * archiving removes slots through LB-01's service instead.
 *
 * NO WAKE ANCHOR. Official §3.3 lists `is_wake_anchor`; v1.0 kept the fact
 * on `users.wake_anchor_habit_id` instead (Epic 1 TECHNICAL-DECISIONS), and
 * UX v1.1 R11 retired the anchor habit altogether — the orient frame is the
 * wake moment, and the column went in `0006` (DYN-21).
 *
 * WORKOUTS AND FOCUSES ARE HABITS (UX v1.1 §11.3, TD-3). A workout is
 * `type = workout`; a focus is `type = deep_work`; both carry a rotation —
 * `weekly_target` and `typical_days` — that no other type uses. `block_kind`
 * is the block a habit lives in by default (null = anywhere) and drives the
 * library's grouping and the block editor's *Add* filter. Since 0004.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { HabitVersion, IconValue } from "@syn/types";

import { blockKindEnum, itemTypeEnum, workoutLocationEnum } from "../enums";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { categories } from "./categories";

/**
 * The neutral dot every new habit starts with — Epic 1 LB-02. `"dot"` is
 * deliberately not a key in `@syn/ui`'s curated glyph table: `ItemIcon` falls
 * through to the neutral dot for any curated value it cannot resolve, so this
 * is the fallback named rather than an eighty-first glyph to maintain.
 */
export const DEFAULT_HABIT_ICON: IconValue = {
  kind: "curated",
  value: "dot",
  colorKey: null,
};

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Set by LB-01 *Archive*; never hard-deleted (§3.3). */
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** The block this habit lives in by default; null = anywhere (v1.1 §11.3). */
    blockKind: blockKindEnum("block_kind"),
    /** ≤ 280. Snapshotted onto every item as `notes_preflight`. */
    defaultNotesPreflight: text("default_notes_preflight"),
    /**
     * The range of time it might take, in minutes (§3.3). Required for `habit`
     * and `deep_work`, optional for `task_appointment` — which is why the
     * columns are nullable here and the requirement is stated in
     * `@syn/validators`, where the person reads it as a sentence.
     */
    durationMaxMin: smallint("duration_max_min"),
    durationMinMin: smallint("duration_min_min"),
    /** JSON shape: IconValue — see @syn/types (src/domain/domain.ts). */
    icon: jsonb("icon").$type<IconValue>().notNull().default(DEFAULT_HABIT_ICON),
    /** 1–7, 7 highest (official spec §0.3 R7). The default wherever it is slotted. */
    lifePriority: smallint("life_priority").notNull(),
    /** Workouts only — where it happens (UX v1.2 §3.7, 0007). */
    location: workoutLocationEnum("location"),
    /**
     * Workouts only — whether the day plans for the travel (UX v1.2 R35,
     * TD-12, 0007). When true and either travel is non-zero, the day carries
     * two travel rows beside the workout; the workout's own length never
     * includes them.
     */
    planTravel: boolean("plan_travel").notNull().default(true),
    /** ≤ 16, e.g. "pages". Its presence means the item captures a number. */
    quantityUnit: text("quantity_unit"),
    /**
     * JSON shape: string[] — 0–2 labels of ≤ 24 chars, rated 1–7 at reflection
     * time (§3.3).
     */
    reflectionAxes: jsonb("reflection_axes")
      .$type<string[]>()
      .notNull()
      .default([]),
    /** 1–60 — Epic 1 §9. */
    title: text("title").notNull(),
    /** Workouts only — minutes there and back around it (UX v1.2 §3.7, 0007). 0–180; never added to the length. */
    travelBackMin: smallint("travel_back_min").notNull().default(0),
    travelThereMin: smallint("travel_there_min").notNull().default(0),
    type: itemTypeEnum("type").notNull(),
    /**
     * Workouts and focuses only — the days the rotation usually falls on.
     * Mon = 0 … Sun = 6, the same shape and check as `templates.typical_days`.
     */
    typicalDays: smallint("typical_days").array(),
    /**
     * Up to three named lengths — UX v1.2 §3.5, R34, TD-11 (0007). The first
     * is the default the plan uses; the chosen one is snapshotted on the item
     * as `version_key`. A jsonb, not a table: a version is never queried apart
     * from its habit. JSON shape: HabitVersion[] — see @syn/types.
     */
    versions: jsonb("versions").$type<HabitVersion[]>(),
    /** Workouts and focuses only — the rotation's weekly count, 1–7. */
    weeklyTarget: smallint("weekly_target"),
    /**
     * Workouts only — the curated type's key (`WORKOUT_TYPES`, UX v1.2 §4.10,
     * 0007). Text, not an enum, so the list grows without a migration; a
     * label that fills the name and glyph when they are empty.
     */
    workoutType: text("workout_type"),

    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("habits_user_id_archived_at_idx").on(table.userId, table.archivedAt),
    index("habits_category_id_idx").on(table.categoryId),
    index("habits_user_id_idx").on(table.userId),
    index("habits_user_id_block_kind_idx").on(table.userId, table.blockKind),
    check(
      "habits_weekly_target_check",
      sql`${table.weeklyTarget} IS NULL OR ${table.weeklyTarget} BETWEEN 1 AND 7`,
    ),
    check(
      "habits_typical_days_check",
      sql`${table.typicalDays} IS NULL OR (${table.typicalDays} <@ ARRAY[0,1,2,3,4,5,6]::smallint[])`,
    ),
    check(
      "habits_life_priority_check",
      sql`${table.lifePriority} BETWEEN 1 AND 7`,
    ),
    check(
      "habits_travel_check",
      sql`${table.travelThereMin} BETWEEN 0 AND 180 AND ${table.travelBackMin} BETWEEN 0 AND 180`,
    ),
    check(
      "habits_workout_type_check",
      sql`${table.workoutType} IS NULL OR length(${table.workoutType}) BETWEEN 1 AND 32`,
    ),
    check(
      "habits_duration_min_min_check",
      sql`${table.durationMinMin} IS NULL OR ${table.durationMinMin} BETWEEN 1 AND 480`,
    ),
    check(
      "habits_duration_max_min_check",
      sql`${table.durationMaxMin} IS NULL OR ${table.durationMaxMin} BETWEEN 1 AND 480`,
    ),
    check(
      "habits_duration_range_check",
      sql`${table.durationMinMin} IS NULL OR ${table.durationMaxMin} IS NULL OR ${table.durationMinMin} <= ${table.durationMaxMin}`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "habits",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const habitsRelations = relations(habits, ({ one }) => ({
  category: one(categories, {
    fields: [habits.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
}));

// packages/db/src/schema/library/reasons.ts
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

// packages/db/src/schema/library/passages.ts
/**
 * passages — a saved piece of morning reading, the person's own or chosen
 * (UX v1.2 §3.12, §4.6, §11.4; R36, TD-15).
 *
 * A COLLECTION, NOT A COLUMN. v1.1 kept one passage on a column of `users`;
 * v1.2 gives passages a title, a rich body, up to four images and tags, and
 * an order that IS the morning cycle (one per day, by `sort_order`, advancing
 * at day-open, wrapping — nothing about which one was read is recorded,
 * §13 #21). Migration 0007 copied every non-blank one into a row here; the
 * old column is dropped by `0010_retirements` (DAY-13).
 *
 * THE BODY IS MARKDOWN (TD-15). Readable in an export, in a row, and by the
 * future Expo app without the editor; the five controls the editor allows
 * round-trip losslessly. Never HTML, never the editor's JSON. `images` holds
 * bucket-qualified paths (`passages/{user_id}/{file}`) in the `passages`
 * bucket, with the icons' owner-segment policies; the read route serves them
 * as it serves an icon — a foreign path is a 404, never a 403.
 *
 * TAGS ARE THE PERSON'S, FOR THE PERSON. v1.2 reads them for the list's
 * filter and nothing else; "chosen against the day" (ledger §25) is phase 2
 * and this is its seam.
 *
 * ARCHIVE, NEVER DELETE. An archived passage's images stay in the bucket
 * (the export may still reference them; orphan reaping is a later concern,
 * as for icons).
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
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const passages = pgTable(
  "passages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** Markdown, the storage form; 1–8000. */
    bodyMd: text("body_md").notNull(),
    /** JSON shape: string[] — up to four bucket-qualified paths. */
    images: jsonb("images").$type<string[]>().notNull().default([]),
    /** The cycle's order (v1.2 §3.12). */
    sortOrder: smallint("sort_order").notNull().default(0),
    /** Up to ten, each ≤ 24. */
    tags: text("tags").array().notNull().default([]),
    /** ≤ 80; null shows the body's first line as the card's title. */
    title: text("title"),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("passages_user_id_sort_order_idx").on(table.userId, table.sortOrder),
    index("passages_user_id_archived_at_idx").on(table.userId, table.archivedAt),
    index("passages_user_id_idx").on(table.userId),
    check(
      "passages_body_md_check",
      sql`length(${table.bodyMd}) BETWEEN 1 AND 8000`,
    ),
    check(
      "passages_title_check",
      sql`${table.title} IS NULL OR length(${table.title}) <= 80`,
    ),
    check(
      "passages_images_check",
      sql`jsonb_typeof(${table.images}) = 'array' AND jsonb_array_length(${table.images}) <= 4`,
    ),
    check(
      "passages_tags_check",
      sql`cardinality(${table.tags}) <= 10`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "passages",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const passagesRelations = relations(passages, ({ one }) => ({
  user: one(users, {
    fields: [passages.userId],
    references: [users.id],
  }),
}));

// packages/db/src/schema/library/links.ts
/**
 * links — a thing to open from the morning: a playlist, a track, a page
 * (UX v1.3 R53, §3.17, §11.4; TD-28).
 *
 * A TITLE AND A URL, THE PERSON'S. The orient frame shows each as a callout
 * under the reading; a tap opens it in a new tab (the Spotify app intercepts
 * its own links on a phone). Settings lists them. Nothing else reads them.
 *
 * THE KIND IS DERIVED, NEVER CHOSEN. `kind` is `spotify` for `open.spotify.com`,
 * `spotify.link` and the `spotify:` scheme, `other` for anything else — the
 * service computes it on every save (`deriveLinkKind`) and stores it, so the
 * frame never parses a URL. The default `other` keeps a row valid if a path
 * ever inserts without it.
 *
 * NOTHING IS FETCHED. The app never requests a link on the person's behalf —
 * no preview, no title lookup, no favicon. The URL is `https:` or `spotify:`
 * (the validator's rule); the column bounds its length.
 *
 * NO UNIQUE URL. The same playlist saved twice under two names is the
 * person's list, not a mistake.
 *
 * ARCHIVE, NEVER DELETE, as passages. `sort_order` is the frame's order.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { LinkKind } from "@syn/types";

import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

/** Link.kind — v1.3 §3.17. One table, so it lives in this file (drizzle-orm-conventions §3). */
export const linkKindEnum = pgEnum("link_kind", enumValues<LinkKind>()(["spotify", "other"]));

export const links = pgTable(
  "links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** Derived from the host by the service; stored so the frame does not parse. */
    kind: linkKindEnum("kind").notNull().default("other"),
    /** The frame's order. */
    sortOrder: smallint("sort_order").notNull().default(0),
    /** 1–80 — the callout's words. */
    title: text("title").notNull(),
    /** ≤ 2048; `https:` or `spotify:` (the validator's rule). */
    url: text("url").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("links_user_id_sort_order_idx").on(table.userId, table.sortOrder),
    index("links_user_id_archived_at_idx").on(table.userId, table.archivedAt),
    index("links_user_id_idx").on(table.userId),
    check("links_title_check", sql`length(${table.title}) BETWEEN 1 AND 80`),
    check("links_url_check", sql`length(${table.url}) BETWEEN 1 AND 2048`),
    ...ownerPrivateCrudPolicies({
      prefix: "links",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const linksRelations = relations(links, ({ one }) => ({
  user: one(users, {
    fields: [links.userId],
    references: [users.id],
  }),
}));
```

#### `categories`

**PURPOSE.** categories — free-defined groupings a habit may belong to (official spec §3.2). Used for time-distribution reporting only, never for any mechanic: a category never changes what an item is worth, when it runs, or how a miss resolves. A habit has at most one. DELETING A CATEGORY UNASSIGNS (Epic 1 CT-01, cross-cutting §8.1) — it is one of the four things in the product that is deleted rather than archived, and `habits.category_id` is `ON DELETE set null` so the habits survive it. Past reports keep the name they were run under because they read the day's rows, not this table. POLICIES: owner-private CRUD.

**INDEXES.**
- `categories_user_id_name_idx`
- `categories_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `habits`

**PURPOSE.** habits — the library entry (official spec §3.3). The reusable definition. It never appears on a day directly; it is slotted into a template (`template_slots`) or placed as a one-off, and what lands on the day is a `day_items` row that SNAPSHOTS this row's title, icon, quantity unit, reflection axes and preflight note. Editing a habit therefore never rewrites the past (cross-cutting §8.1) — and SET-4's re-snapshot rule rewrites only untouched future items, never a started, done, reviewed, or past one. NEVER HARD-DELETED. `archived_at` is the only exit; `template_slots` cascade from here only because a hard delete cannot happen through the app, and archiving removes slots through LB-01's service instead. NO WAKE ANCHOR. Official §3.3 lists `is_wake_anchor`; v1.0 kept the fact on `users.wake_anchor_habit_id` instead (Epic 1 TECHNICAL-DECISIONS), and UX v1.1 R11 retired the anchor habit altogether — the orient frame is the wake moment, and the column went in `0006` (DYN-21). WORKOUTS AND FOCUSES ARE HABITS (UX v1.1 §11.3, TD-3). A workout is `type = workout`; a focus is `type = deep_work`; both carry a rotation — `weekly_target` and `typical_days` — that no other type uses. `block_kind` is the block a habit lives in by default (null = anywhere) and drives the library's grouping and the block editor's *Add* filter. Since 0004. POLICIES: owner-private CRUD.

**INDEXES.**
- `habits_user_id_archived_at_idx`
- `habits_category_id_idx`
- `habits_user_id_idx`
- `habits_user_id_block_kind_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `reasons`

**PURPOSE.** reasons — the per-person, editable reason set (official spec §3.10). When something is missed, the person picks a reason and the reason's tier decides how it counts (§7.3). The seven defaults are data in `@syn/constants` (`DEFAULT_REASONS`), which the dev seed and SET-9's lazy per-user seeding both read — never a trigger, so a person's set is theirs to rename, re-tier and archive from the moment it exists. `key` IS WHAT A MISS STORES. `misses.reason_key` and `shifts.reason_key` are text, not foreign keys, so archiving or renaming a reason later never rewrites a record that was made under the old one (cross-cutting §8.1). `structural` marks the two rows whose tier is locked and which can never be archived — *Didn't do it* and *Other* (Epic 1 ST-06). Everything else about a built-in is editable, including its label. POLICIES: owner-private CRUD.

**INDEXES.**
- `reasons_user_id_key_idx`
- `reasons_user_id_archived_at_idx`
- `reasons_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `passages`

**PURPOSE.** passages — a saved piece of morning reading, the person's own or chosen (UX v1.2 §3.12, §4.6, §11.4; R36, TD-15). A COLLECTION, NOT A COLUMN. v1.1 kept one passage on a column of `users`; v1.2 gives passages a title, a rich body, up to four images and tags, and an order that IS the morning cycle (one per day, by `sort_order`, advancing at day-open, wrapping — nothing about which one was read is recorded, §13 #21). Migration 0007 copied every non-blank one into a row here; the old column is dropped by `0010_retirements` (DAY-13). THE BODY IS MARKDOWN (TD-15). Readable in an export, in a row, and by the future Expo app without the editor; the five controls the editor allows round-trip losslessly. Never HTML, never the editor's JSON. `images` holds bucket-qualified paths (`passages/{user_id}/{file}`) in the `passages` bucket, with the icons' owner-segment policies; the read route serves them as it serves an icon — a foreign path is a 404, never a 403. TAGS ARE THE PERSON'S, FOR THE PERSON. v1.2 reads them for the list's filter and nothing else; "chosen against the day" (ledger §25) is phase 2 and this is its seam. ARCHIVE, NEVER DELETE. An archived passage's images stay in the bucket (the export may still reference them; orphan reaping is a later concern, as for icons). POLICIES: owner-private CRUD.

**INDEXES.**
- `passages_user_id_sort_order_idx`
- `passages_user_id_archived_at_idx`
- `passages_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `links`

**PURPOSE.** links — a thing to open from the morning: a playlist, a track, a page (UX v1.3 R53, §3.17, §11.4; TD-28). A TITLE AND A URL, THE PERSON'S. The orient frame shows each as a callout under the reading; a tap opens it in a new tab (the Spotify app intercepts its own links on a phone). Settings lists them. Nothing else reads them. THE KIND IS DERIVED, NEVER CHOSEN. `kind` is `spotify` for `open.spotify.com`, `spotify.link` and the `spotify:` scheme, `other` for anything else — the service computes it on every save (`deriveLinkKind`) and stores it, so the frame never parses a URL. The default `other` keeps a row valid if a path ever inserts without it. NOTHING IS FETCHED. The app never requests a link on the person's behalf — no preview, no title lookup, no favicon. The URL is `https:` or `spotify:` (the validator's rule); the column bounds its length. NO UNIQUE URL. The same playlist saved twice under two names is the person's list, not a mistake. ARCHIVE, NEVER DELETE, as passages. `sort_order` is the frame's order. POLICIES: owner-private CRUD.

**INDEXES.**
- `links_user_id_sort_order_idx`
- `links_user_id_archived_at_idx`
- `links_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

### GROUP 3 — PLAN

The shapes a day can take. Since UX v1.1 (0004, 0005) a template is a block whose slots stack — a duration and a gap each, offsets derived — and a day is an ordered set of `day_blocks`; `fixtures` are the weekday things every block flows around. Since UX v1.2 (0007) a work template may be a work-day type with its own hours, and `day_plans` is a named day composed by reference — weekdays, a type, four times, three lists, the workouts placed — that the week build reads first; since UX v1.3 (0009) a plan also points at an after-work list and a free-time pool, and a fixture carries a place and its travel. A day is one date in the person's stored zone, snapshotting the time rules it was created under. There is no `week_plans` table — week status is derived from the week's days.

```ts
// packages/db/src/schema/plan/enums.ts
/**
 * Plan-directory enums — pgEnum types used by two or more tables in `plan/`
 * and by no other directory (drizzle-orm-conventions §3).
 *
 * SPELLING IS `@syn/types`'. Each is checked against its union by
 * `enumValues<Union>()`, so a member added there and forgotten here is a type
 * error, not a value nobody can store.
 *
 * `block_flow`, `block_structure` and `slot_role` arrive with UX v1.1
 * migration `0004` (DYN-2); `day_shape`, `day_block_state` and
 * `training_placement` with `0005` (DYN-3).
 */
import { pgEnum } from "drizzle-orm/pg-core";

import type {
  BlockFlow,
  BlockStructure,
  DayBlockState,
  DayPlanState,
  DayShape,
  SlotRole,
  TrainingPlacement,
  WorkDayKind,
} from "@syn/types";

import { enumValues } from "../enum-values";

/*
 * UX v1.2 (RUN-1): the two below arrive with migration `0007` (RUN-2).
 * `work_day_kind` is on `templates` (TD-14); `day_plan_state` on `day_plans`
 * (TD-10). Nothing writes either before `0007`.
 */

/** A work-day type's kind — v1.2 §3.8. A label and a default glyph. `templates`. */
export const workDayKindEnum = pgEnum(
  "work_day_kind",
  enumValues<WorkDayKind>()(["remote", "coworking", "office", "other"]),
);

/** DayPlan.state — v1.2 §3.13. A plan left before the review stays a draft. `day_plans`. */
export const dayPlanStateEnum = pgEnum(
  "day_plan_state",
  enumValues<DayPlanState>()(["draft", "complete"]),
);

/** Day.shape — UX v1.1 §3.9. Unstructured is a first-class shape. `days`. */
export const dayShapeEnum = pgEnum(
  "day_shape",
  enumValues<DayShape>()(["structured", "unstructured"]),
);

/** DayBlock.state — UX v1.1 §11.7. `pooled` holds no items until the pick. `day_blocks`. */
export const dayBlockStateEnum = pgEnum(
  "day_block_state",
  enumValues<DayBlockState>()(["planned", "pooled", "set", "not_today"]),
);

/** DayBlock.placement — UX v1.1 §3.7; training and break only. `day_blocks`. */
export const trainingPlacementEnum = pgEnum(
  "training_placement",
  enumValues<TrainingPlacement>()([
    "before_morning",
    "after_morning",
    "inside_work",
    "after_work",
    "in_break",
  ]),
);

/**
 * Template.flow — UX v1.1 §3.3. Forward from wake (morning, work, activity);
 * backward to an anchor (prep to work start, wind-down to lights-out).
 * `templates`; read by `day_blocks`' materialiser.
 */
export const blockFlowEnum = pgEnum(
  "block_flow",
  enumValues<BlockFlow>()(["forward", "backward"]),
);

/** Template.structure — UX v1.1 §3.4. `templates`. */
export const blockStructureEnum = pgEnum(
  "block_structure",
  enumValues<BlockStructure>()(["stack", "opener_pool_closer"]),
);

/**
 * TemplateSlot.role — UX v1.1 §3.4. Meaningful only when the template's
 * `structure` is `opener_pool_closer`; `stack` otherwise. `template_slots`.
 */
export const slotRoleEnum = pgEnum(
  "slot_role",
  enumValues<SlotRole>()(["stack", "opener", "pool", "closer"]),
);

// packages/db/src/schema/plan/templates.ts
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

// packages/db/src/schema/plan/template-slots.ts
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
 * The v1.0 offsets (`offset_start_min` / `offset_end_min`) are gone since
 * `0006` (DYN-21): `0004` turned every offset into a gap, nothing read them
 * after DYN-4, and a stack has no absolute offsets to keep.
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

// packages/db/src/schema/plan/fixtures.ts
/**
 * fixtures — something that happens every week on set days at a set time
 * (UX v1.1 §3.6, §11.6, R27, TD-8). A stand-up on Tuesdays, football on
 * Thursdays.
 *
 * A FIXTURE BELONGS TO A WEEKDAY, NOT A TEMPLATE. It materialises on every
 * planned instance of its weekdays whatever template the day gets, as a
 * `day_items` row with `origin = fixture` and `pinned = true` in the block its
 * `block_kind` names; the quick-pick cannot remove it and the stack flows
 * around it. That is the whole reason it is not a template slot: a Tuesday
 * stand-up tied to whichever template Tuesday happens to get is the bug R27
 * exists to prevent.
 *
 * `weekdays` is a set, so a Mon/Wed/Fri class is one fixture. Mon = 0, as
 * everywhere. `habit_id` is optional — a fixture may point at a library habit
 * for its icon and category, and usually does not.
 *
 * THIS IS WHERE CALENDAR IMPORT LANDS (phase 2, P2-7): an imported event is a
 * fixture-shaped row with a `calendar_event_id`, added then.
 *
 * A PLACE AND TRAVEL (UX v1.3 R51, §3.14, TD-27; 0009). *Away* gives a
 * fixture a `location` line and the three travel columns a workout has; the
 * day then carries *→ Clinic · 20* and *← Home · 20* beside the pinned item
 * (`day_items.origin = travel`, `parent_item_id` — TD-12 reused whole).
 *
 * ARCHIVE, NEVER DELETE. A past day's pinned item snapshots the title.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
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

import { blockKindEnum, fixtureKindEnum, schedulingEnum } from "../enums";
import { habits } from "../library/habits";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

/**
 * The *other* kind's glyph — `FIXTURE_KINDS` in `@syn/constants` is the
 * living copy; this literal is the column default, copied once into 0007 as
 * history (the same arrangement as `DEFAULT_HABIT_ICON`).
 */
export const DEFAULT_FIXTURE_ICON: IconValue = { kind: "emoji", value: "📍" };

export const fixtures = pgTable(
  "fixtures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** The clock time it starts, in the person's zone. */
    atTime: time("at_time").notNull(),
    /** Which block it pins into — work or activity by v1.1 §4.4's sheet. */
    blockKind: blockKindEnum("block_kind").notNull().default("activity"),
    /** 1–480. */
    durationMin: smallint("duration_min").notNull(),
    /**
     * The fixture's glyph (UX v1.2 §3.6, R42, 0007) — the kind's default
     * unless the person chose one. Not null so `ItemIcon` never branches;
     * the default is the *other* kind's, the same object `FIXTURE_KINDS`
     * holds. JSON shape: IconValue.
     */
    icon: jsonb("icon").$type<IconValue>().notNull().default(DEFAULT_FIXTURE_ICON),
    /** A label and a default glyph and block — never a mechanic (UX v1.2 §3.6, 0007). */
    kind: fixtureKindEnum("kind").notNull().default("other"),
    /**
     * Where it is, for *Away* (UX v1.3 R51, §3.14; 0009) — free text ≤ 80,
     * null for *Here* or an unnamed place. A fact the sheet shows; nothing
     * reads it (Google Places is phase 2, P2-19).
     */
    location: text("location"),
    /**
     * Whether the day plans the travel (UX v1.3 R51, TD-27; 0009) — the same
     * three columns a workout has (TD-12). When true and either trip is
     * non-zero, the day carries two travel rows beside the fixture, never
     * added to its length.
     */
    planTravel: boolean("plan_travel").notNull().default(true),
    /** Hard by default: a fixture is an appointment (v1.1 R22). */
    scheduling: schedulingEnum("scheduling").notNull().default("hard"),
    /** 1–60. */
    title: text("title").notNull(),
    /** Minutes there and back around it (UX v1.3 §3.14, 0009). 0–180; never added to the length. */
    travelBackMin: smallint("travel_back_min").notNull().default(0),
    travelThereMin: smallint("travel_there_min").notNull().default(0),
    /** Mon = 0 … Sun = 6; at least one. */
    weekdays: smallint("weekdays").array().notNull(),

    habitId: uuid("habit_id").references(() => habits.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("fixtures_user_id_archived_at_idx").on(
      table.userId,
      table.archivedAt,
    ),
    index("fixtures_user_id_idx").on(table.userId),
    index("fixtures_habit_id_idx").on(table.habitId),
    check(
      "fixtures_duration_min_check",
      sql`${table.durationMin} BETWEEN 1 AND 480`,
    ),
    check(
      "fixtures_title_check",
      sql`length(${table.title}) BETWEEN 1 AND 60`,
    ),
    check(
      "fixtures_location_check",
      sql`${table.location} IS NULL OR length(${table.location}) <= 80`,
    ),
    check(
      "fixtures_travel_check",
      sql`${table.travelThereMin} BETWEEN 0 AND 180 AND ${table.travelBackMin} BETWEEN 0 AND 180`,
    ),
    check(
      "fixtures_weekdays_check",
      sql`cardinality(${table.weekdays}) >= 1 AND (${table.weekdays} <@ ARRAY[0,1,2,3,4,5,6]::smallint[])`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "fixtures",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const fixturesRelations = relations(fixtures, ({ one }) => ({
  habit: one(habits, {
    fields: [fixtures.habitId],
    references: [habits.id],
  }),
  user: one(users, {
    fields: [fixtures.userId],
    references: [users.id],
  }),
}));

// packages/db/src/schema/plan/day-plans.ts
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

// packages/db/src/schema/plan/days.ts
/**
 * days — one calendar date in the person's stored zone (official spec §3.6).
 *
 * A Day is keyed by `date` in the person's STORED zone and runs from
 * `day_close_time` to the next `day_close_time` (cross-cutting §7.1). A day
 * with no template is an empty day, which is how a vacation works — nothing is
 * missed on an unplanned day.
 *
 * IT SNAPSHOTS ITS OWN TIME RULES. `timezone` and `day_close_time` are copied
 * from `users` when the day is created and never follow a later settings
 * change. Without them, moving zones or shifting the close time would silently
 * re-key and re-window every past day, and "moved" would stop meaning anything
 * (cross-cutting §7.3, §7.5, §8). The pending-pair on `users` is what defers a
 * change to tomorrow; these two columns are what keep yesterday honest.
 *
 * NO `week_plans` TABLE. Official §3.6 lists one; its only content is a status
 * derivable from the week's days, so `WeekPlanStatus` is computed by the week
 * read model. See the Epic 1 TECHNICAL-DECISIONS entry.
 *
 * UNDER UX v1.1 (0005) A DAY IS AN ORDERED SET OF BLOCKS (`day_blocks`, TD-2).
 * The v1.0 whole-day `template_id` is gone since `0006` (DYN-21) — a day's
 * templates are its blocks'. `anchor_time` stays as the wake anchor, which
 * is what it always was in practice. The v1.1 columns are the
 * day's shape, the moment it was set (`confirmed_at` — nothing derived from
 * the pick exists before it, R23), today's work anchor and its hardness, the
 * focus, and the two lines the orient frame captures.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  date,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { DayCloseReason, WokeAtSource } from "@syn/types";

import { enumValues } from "../enum-values";
import { habits } from "../library/habits";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { dayBlocks } from "./day-blocks";
import { dayShapeEnum } from "./enums";
import { templates } from "./templates";

/** One table uses it, so it lives here (drizzle-orm-conventions §3). */
export const dayCloseReasonEnum = pgEnum(
  "day_close_reason",
  enumValues<DayCloseReason>()(["manual", "auto"]),
);

/**
 * Epic 2 DH-02: the wake time came from the anchor habit, or from a picker —
 * or, from UX v1.1 R11, from opening the orient frame (`orient`). `anchor`
 * stays: rows written under v1.0 keep their source. Moved in DYN-1; the
 * `ADD VALUE` ships in `0004`; written from DYN-13.
 */
export const wokeAtSourceEnum = pgEnum(
  "woke_at_source",
  enumValues<WokeAtSource>()(["anchor", "manual", "orient"]),
);

export const days = pgTable(
  "days",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /**
     * Today's anchor is hard — under *depends on the day* the pick's answer,
     * otherwise copied from the profile at *Set the day* (UX v1.1 §3.3, 0005).
     */
    anchorIsHard: boolean("anchor_is_hard"),
    /** The wake anchor — the day's start; overridable per day (§3.6). */
    anchorTime: time("anchor_time").notNull(),
    /** 5–1440. Set only by a capacity trim (§3.6, §5.8). */
    capacityMin: smallint("capacity_min"),
    closeReason: dayCloseReasonEnum("close_reason"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    /** *Set the day* (UX v1.1 §5.3, R23, 0005). Null = unconfirmed. */
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    /** The day key, in `timezone`. Unique per person. */
    date: date("date").notNull(),
    /** Snapshot of the rule this day was created under (cross-cutting §7.1). */
    dayCloseTime: time("day_close_time").notNull(),
    /** *Today's intention* — the person's own words; ≤ 140 (UX v1.1 §5.2, 0005). */
    intention: text("intention"),
    /** *Grateful for, this morning* — the person's own words; ≤ 280 (UX v1.1 §5.2, 0005). */
    morningGratitude: text("morning_gratitude"),
    /** Stamped when a closed day's record is edited (cross-cutting §8.1). */
    reviewEditedAt: timestamp("review_edited_at", { withTimezone: true }),
    /** Set by *Finish review* — the day has a number (Epic 3 DR-01). */
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    /** Structured from templates, or unstructured (UX v1.1 §3.9, 0005). */
    shape: dayShapeEnum("shape").notNull().default("structured"),
    /** Snapshot of `users.timezone` at creation. */
    timezone: text("timezone").notNull(),
    /** *Today, as I see it* — the third optional morning line, the person's own words; ≤ 280 (UX v1.2 §5.2, 0007). */
    visualisation: text("visualisation"),
    /** Set by the orient frame (v1.1 R11), the v1.0 anchor habit, or by hand. */
    wokeAt: timestamp("woke_at", { withTimezone: true }),
    wokeAtSource: wokeAtSourceEnum("woke_at_source"),
    /** Today's work anchor after any slide (UX v1.1 §6.6, 0005); null until set. */
    workStartTime: time("work_start_time"),
    /**
     * Today's other three anchors (UX v1.2 §3.13, TD-21, 0008) — written at
     * the week build from the day plan (or the work-day type), read by every
     * re-lay through `profileForDay`; null = the profile's. A day snapshots
     * its anchors the way it snapshots its zone: a plan edited tomorrow must
     * not move an evening already lived.
     */
    workEndTime: time("work_end_time"),
    lightsOutTime: time("lights_out_time"),
    devicesOffTime: time("devices_off_time"),
    /**
     * Weekday fixtures this day leaves out (UX v1.2 §4.13g, TD-21, 0008) —
     * snapshotted from the day plan at the week build so a re-lay never
     * brings an excluded fixture back. Empty for a day that excludes nothing.
     */
    excludedFixtureIds: uuid("excluded_fixture_ids").array().notNull().default([]),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /**
     * The work-day type applied to this day (UX v1.2 §3.9, TD-19, 0007) —
     * written by the week build from the plan's type, and by *Working today*
     * on a *Rarely* day. `set null` for the same reason as the focus. Null on
     * a day without a work block.
     */
    workTemplateId: uuid("work_template_id").references(
      (): AnyPgColumn => templates.id,
      { onDelete: "set null" },
    ),
    /**
     * Today's focus — a `deep_work` habit (UX v1.1 §3.8, 0005). `set null`
     * because a hard-deleted habit must not take the day with it; an archived
     * one leaves the reference and the item's title snapshot says what it was.
     *
     * `: AnyPgColumn` because this
     * edge closes a cycle (days → habits → categories → users → days) that
     * TypeScript cannot otherwise infer through.
     */
    workFocusHabitId: uuid("work_focus_habit_id").references(
      (): AnyPgColumn => habits.id,
      { onDelete: "set null" },
    ),
  },
  (table) => [
    uniqueIndex("days_user_id_date_idx").on(table.userId, table.date),
    index("days_user_id_closed_at_idx").on(table.userId, table.closedAt),
    index("days_user_id_confirmed_at_idx").on(table.userId, table.confirmedAt),
    index("days_user_id_idx").on(table.userId),
    index("days_work_focus_habit_id_idx").on(table.workFocusHabitId),
    index("days_work_template_id_idx").on(table.workTemplateId),
    check(
      "days_visualisation_check",
      sql`${table.visualisation} IS NULL OR length(${table.visualisation}) <= 280`,
    ),
    check(
      "days_capacity_min_check",
      sql`${table.capacityMin} IS NULL OR ${table.capacityMin} BETWEEN 5 AND 1440`,
    ),
    check(
      "days_intention_check",
      sql`${table.intention} IS NULL OR length(${table.intention}) <= 140`,
    ),
    check(
      "days_morning_gratitude_check",
      sql`${table.morningGratitude} IS NULL OR length(${table.morningGratitude}) <= 280`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "days",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const daysRelations = relations(days, ({ many, one }) => ({
  blocks: many(dayBlocks),
  user: one(users, {
    fields: [days.userId],
    references: [users.id],
  }),
  workFocus: one(habits, {
    fields: [days.workFocusHabitId],
    references: [habits.id],
  }),
  workTemplate: one(templates, {
    fields: [days.workTemplateId],
    references: [templates.id],
  }),
}));

// packages/db/src/schema/plan/day-blocks.ts
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
```

#### `templates`

**PURPOSE.** templates — a saved BLOCK (UX v1.1 §3.1, §11.4, TD-1; formerly official spec §3.4's whole-day plan). UNDER v1.1 A TEMPLATE IS A BLOCK, NOT A DAY. It carries a `kind` (morning, prep, wind-down, …), a `flow` (forward from wake, or backward to an anchor), and a `structure` (a plain stack, or opener · pool · closer). A day's template list is `day_blocks` (0005); a routine variant with a weekly count is exactly what this row already was, which is why the table was widened rather than replaced (TD-1). Slots STACK: each holds a duration and a gap (`template_slots`), and the offsets are derived by `stackBlock` in the block's flow direction from an anchor the PROFILE supplies at materialisation — wake for a morning block, work start for prep, lights-out for wind-down. `anchor_time` is therefore NULLABLE since 0004 and means "an explicit override", which only a work template with its own hours needs (v1.1 R5). Rows written under v1.0 keep the value they had; DYN-5's materialiser ignores it for every kind but `work`, and `0006` nulls it for the rest. `kind` WAS BACKFILLED TO `morning` for every row that existed before 0004. Every v1.0 template was a whole day anchored at wake; as a morning block it lays out identically, and the block editor lets a person re-kind it. `weekly_target` IS NULL FOR *none*, NEVER 0 (Epic 1 TP-02). The form's stepper shows 0 as *none*; the column stores the absence. ARCHIVE, NEVER DELETE. An archived template's name still appears in the header of every past day it built (cross-cutting §8.3). POLICIES: owner-private CRUD.

**INDEXES.**
- `templates_user_id_archived_at_idx`
- `templates_user_id_idx`
- `templates_user_id_kind_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `template_slots`

**PURPOSE.** template_slots — one habit's place in a block template (UX v1.1 §3.2, §3.4, §3.5, §11.5, TD-4; formerly official spec §3.5). SLOTS STACK. Since 0004 a slot stores what it IS — a duration and the gap before it — and its position in the stack (`sort_order`). Where it starts is DERIVED, by `stackBlock` in `@syn/utils`, walking the template in its flow direction from an anchor the profile supplies. Nothing inside a block has an absolute time unless it is PINNED (`pinned_at`), and the stack flows around a pin — the pin never moves (v1.1 R3). The v1.0 offsets (`offset_start_min` / `offset_end_min`) are gone since `0006` (DYN-21): `0004` turned every offset into a gap, nothing read them after DYN-4, and a stack has no absolute offsets to keep. TWO GROUPS, TWO MEANINGS. `multitask_group` means BOTH happen — members share a position and a start (v1 §5.5). `alternates_group` means EXACTLY ONE happens, chosen at the pick (v1.1 §3.5, *one of*): members share a position and differ in duration, and `alternates_default` marks the one the fit arithmetic uses. A slot is never in both. Two slots at one position must share one of the two groups or the save is refused — enforced in `saveSlot` (DYN-4), the one place the position rule is stated. A partial unique index holds "at most one default per group"; the service holds "at least one". `role` is meaningful only under an `opener_pool_closer` template (v1.1 §3.4); the service normalises it to `stack` otherwise. `habit_id` CASCADES because a habit is never hard-deleted through the app; archiving a habit removes its slots through LB-01's service instead, which is a decision the person is shown before it happens. POLICIES: owner-private CRUD, on this table's own `user_id` — the service writes the template's owner, never the caller's claim.

**INDEXES.**
- `template_slots_alternates_default_idx`
- `template_slots_template_id_sort_order_idx`
- `template_slots_habit_id_idx`
- `template_slots_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `fixtures`

**PURPOSE.** fixtures — something that happens every week on set days at a set time (UX v1.1 §3.6, §11.6, R27, TD-8). A stand-up on Tuesdays, football on Thursdays. A FIXTURE BELONGS TO A WEEKDAY, NOT A TEMPLATE. It materialises on every planned instance of its weekdays whatever template the day gets, as a `day_items` row with `origin = fixture` and `pinned = true` in the block its `block_kind` names; the quick-pick cannot remove it and the stack flows around it. That is the whole reason it is not a template slot: a Tuesday stand-up tied to whichever template Tuesday happens to get is the bug R27 exists to prevent. `weekdays` is a set, so a Mon/Wed/Fri class is one fixture. Mon = 0, as everywhere. `habit_id` is optional — a fixture may point at a library habit for its icon and category, and usually does not. THIS IS WHERE CALENDAR IMPORT LANDS (phase 2, P2-7): an imported event is a fixture-shaped row with a `calendar_event_id`, added then. A PLACE AND TRAVEL (UX v1.3 R51, §3.14, TD-27; 0009). *Away* gives a fixture a `location` line and the three travel columns a workout has; the day then carries *→ Clinic · 20* and *← Home · 20* beside the pinned item (`day_items.origin = travel`, `parent_item_id` — TD-12 reused whole). ARCHIVE, NEVER DELETE. A past day's pinned item snapshots the title. POLICIES: owner-private CRUD.

**INDEXES.**
- `fixtures_user_id_archived_at_idx`
- `fixtures_user_id_idx`
- `fixtures_habit_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `day_plans`

**PURPOSE.** day_plans — a named day, composed from the parts first run collected (UX v1.2 §3.13, §4.13, §11.5; R31, TD-10). A ROW OF REFERENCES, NEVER A COPY. A plan points at a work template (the work-day type, or null for *No work on this day*), at up to three block templates (the getting-ready list, the morning routine, the wind-down — `Getting ready A`, `Morning routine A`, `Wind-down A`), carries the four times a day is anchored from (null = inherit from the profile or the type), the workouts placed (`training`), the breaks (`breaks`), and which weekday fixtures this plan leaves out (`excluded_fixture_ids` — fixtures are matched by weekday; the plan stores only exclusions). A second plan may point at the first's lists; editing *Getting ready A* edits every plan that uses it, and the template list says *used by Day A, Day B*. Deleting a plan deletes references only. NOT v1's WHOLE-DAY TEMPLATE. Nothing inside a plan has an absolute time except its anchors and the pins; every block still stacks in its flow direction from `stackBlock` (TD-4). A day is an ordered set of blocks (TD-2), and a plan is what the week build reads first to make them (`prefillWeek`, RUN-5) — it is never materialised by any other path. ONE PLAN PER WEEKDAY, per person. An array column cannot carry that as a constraint; the service validates it on every write and moves a claimed weekday with a report (*Thursday moves from Day A.*). A double claim that slips through is read as the lower `sort_order`'s and logged. UX v1.3 (0009, TD-25, TD-26) adds two more references: the after-work list (a `transition` template, *After work A*) and the free-time pool (an `activity` template of structure `pool`, *Evenings A*). The work template is the plan's own under v1.3 (TD-23) — an ownership rule of the service, not a column. `state` is `draft` until the builder's review (13i) — a plan left early shows *unfinished*; `complete` requires a weekday, a wake and a lights-out (own or inherited), and a work template or an explicit *no work*. POLICIES: owner-private CRUD.

**INDEXES.**
- `day_plans_user_id_sort_order_idx`
- `day_plans_user_id_idx`
- `day_plans_prep_template_id_idx`
- `day_plans_morning_template_id_idx`
- `day_plans_wind_down_template_id_idx`
- `day_plans_work_template_id_idx`
- `day_plans_after_work_template_id_idx`
- `day_plans_activity_template_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `days`

**PURPOSE.** days — one calendar date in the person's stored zone (official spec §3.6). A Day is keyed by `date` in the person's STORED zone and runs from `day_close_time` to the next `day_close_time` (cross-cutting §7.1). A day with no template is an empty day, which is how a vacation works — nothing is missed on an unplanned day. IT SNAPSHOTS ITS OWN TIME RULES. `timezone` and `day_close_time` are copied from `users` when the day is created and never follow a later settings change. Without them, moving zones or shifting the close time would silently re-key and re-window every past day, and "moved" would stop meaning anything (cross-cutting §7.3, §7.5, §8). The pending-pair on `users` is what defers a change to tomorrow; these two columns are what keep yesterday honest. NO `week_plans` TABLE. Official §3.6 lists one; its only content is a status derivable from the week's days, so `WeekPlanStatus` is computed by the week read model. See the Epic 1 TECHNICAL-DECISIONS entry. UNDER UX v1.1 (0005) A DAY IS AN ORDERED SET OF BLOCKS (`day_blocks`, TD-2). The v1.0 whole-day `template_id` is gone since `0006` (DYN-21) — a day's templates are its blocks'. `anchor_time` stays as the wake anchor, which is what it always was in practice. The v1.1 columns are the day's shape, the moment it was set (`confirmed_at` — nothing derived from the pick exists before it, R23), today's work anchor and its hardness, the focus, and the two lines the orient frame captures. POLICIES: owner-private CRUD.

**INDEXES.**
- `days_user_id_date_idx`
- `days_user_id_closed_at_idx`
- `days_user_id_confirmed_at_idx`
- `days_user_id_idx`
- `days_work_focus_habit_id_idx`
- `days_work_template_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `day_blocks`

**PURPOSE.** day_blocks — one block on one day (UX v1.1 §11.7, TD-2). THE load-bearing table of v1.1: the Today tab's sections, the Schedule's bands, the block-boundary pushes, and the Adjust sheet all read it. A DAY IS AN ORDERED SET OF BLOCKS. Each points at the template it came from (`template_id`, with the name snapshotted like every other record), carries its own span, and holds its items (`day_items.day_block_id`). A block can be EMPTY on purpose: a pooled morning before the pick, an unstructured day's wind-down with nothing added yet. That, and a block-level ghost, are why a block is a row rather than a grouping derived from its items. `state` (§11.7): `planned` at week build; `pooled` when the pick decides its contents and it holds NO ITEMS until then; `set` once the day is confirmed; `not_today` for a placeable block the person declined at the pick — never a miss. `placement` is training and break only (§3.7): which open span the block was put in, kept so the next pick can default to it. `inside_work` splits the work block into two rows around this one — both work rows share `template_id` and the snapshot, and the unique index below is what allows two of one kind on a day. `original_scheduled_start` IS IMMUTABLE ONCE SET, by the same trigger function `day_items` uses (`day_blocks_original_start_immutable`, 0005 and `supabase/setup/02_apply_triggers_rls.sql`). It is written at *Set the day* (R23, TD-5) — null before — and a band drag afterwards leaves a ghost. DELETION CASCADES TO ITEMS, deliberately: an item without a block is not renderable. Only the materialiser deletes a block, and only an untouched one (DYN-5's predicate), so a touched item is never under a deleted block. POLICIES: owner-private CRUD, on this table's own `user_id`.

**INDEXES.**
- `day_blocks_day_id_kind_sort_order_idx`
- `day_blocks_day_id_sort_order_idx`
- `day_blocks_template_id_idx`
- `day_blocks_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

### GROUP 4 — DAY

The record. `day_items` is the row the execution tabs render, snapshotting its habit's title, icon, unit, axes and preflight note so a past day reads as it was lived. Timer sessions, misses and shifts (and, since UX v1.1, re-fits) are what happened to it; `journal_entries` is what the person wrote about it, in their own words.

```ts
// packages/db/src/schema/day/day-items.ts
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

// packages/db/src/schema/day/timer-sessions.ts
/**
 * timer_sessions — one run of the timer on one item (official spec §3.7,
 * §5.4).
 *
 * `ended_at` is null while the timer is running, which is how "is anything
 * running" is answered without a second source of truth. A session the person
 * typed rather than timed is marked `source: manual` (cross-cutting §8.1), so
 * the record always says which it was.
 *
 * A TIMER SESSION IS DELETABLE (cross-cutting §8.4) — one of exactly four
 * things in the product that are. Undoing *done* keeps its sessions.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { TimerSessionSource } from "@syn/types";

import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { dayItems } from "./day-items";

/** One table uses it, so it lives here (drizzle-orm-conventions §3). */
export const timerSessionSourceEnum = pgEnum(
  "timer_session_source",
  enumValues<TimerSessionSource>()(["timer", "manual"]),
);

export const timerSessions = pgTable(
  "timer_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Null while running. */
    endedAt: timestamp("ended_at", { withTimezone: true }),
    source: timerSessionSourceEnum("source").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),

    dayItemId: uuid("day_item_id")
      .notNull()
      .references(() => dayItems.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("timer_sessions_day_item_id_started_at_idx").on(
      table.dayItemId,
      table.startedAt,
    ),
    index("timer_sessions_user_id_idx").on(table.userId),
    check(
      "timer_sessions_ended_at_check",
      sql`${table.endedAt} IS NULL OR ${table.endedAt} > ${table.startedAt}`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "timer_sessions",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const timerSessionsRelations = relations(timerSessions, ({ one }) => ({
  dayItem: one(dayItems, {
    fields: [timerSessions.dayItemId],
    references: [dayItems.id],
  }),
  user: one(users, {
    fields: [timerSessions.userId],
    references: [users.id],
  }),
}));

// packages/db/src/schema/day/shifts.ts
/**
 * shifts — one "shift my day forward" event (official spec §3.9, §5.6).
 *
 * One row per shift, so the Day Review can say "shifted 60 min at 8:10 — slept
 * in". A shift is undoable for ten minutes (cross-cutting §8.1); after that it
 * is a fact, and the only way past it is another shift, which is also
 * recorded.
 *
 * NO `cut_item_ids[]` COLUMN. Official §3.9 lists one; a cut item is instead a
 * `day_items` row with `assignment_state = cut_by_shift` and a `misses` row
 * whose `shift_id` points here. Normalised, so the Day Review's *Change* on a
 * cut item edits one row and this shift's own record stays untouched (Epic 3
 * DR-05). See the Epic 1 DEVIATIONS line.
 *
 * `reason_key` is text rather than a foreign key for the same reason it is on
 * `misses`: an archived or renamed reason must never rewrite a past record.
 *
 * UNDER UX v1.1 THIS IS ALSO THE ADJUST RECORD (§6.6, §11.9, TD-6). `kind`
 * says which: a `shift` slides the anchor (`delta_min` > 0, as before); a
 * `refit` holds it and shortens or cuts (`delta_min` = 0, hence the widened
 * check). `shortened_item_ids` names the items whose length a refit reduced,
 * so the Day Review can say *shortened* rather than *moved*. Cuts stay as
 * they were: `day_items.assignment_state = cut_by_shift` and a `misses` row
 * pointing here.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { ShiftKind } from "@syn/types";

import { enumValues } from "../enum-values";
import { missTierEnum } from "../enums";
import { days } from "../plan/days";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

/** One table uses it, so it lives here (drizzle-orm-conventions §3). UX v1.1 §11.9. */
export const shiftKindEnum = pgEnum(
  "shift_kind",
  enumValues<ShiftKind>()(["shift", "refit"]),
);

export const shifts = pgTable(
  "shifts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** When the shift was made. */
    at: timestamp("at", { withTimezone: true }).notNull(),
    /** 0–600 minutes: a `shift` is 5–600 (§5.6); a `refit` is 0 (UX v1.1 §11.9). */
    deltaMin: smallint("delta_min").notNull(),
    /** A slide of the anchor, or a re-fit that holds it (UX v1.1 §11.9, 0005). */
    kind: shiftKindEnum("kind").notNull().default("shift"),
    /** A `reasons.key` — text, so an archived reason keeps this record honest. */
    reasonKey: text("reason_key"),
    /** ≤ 80, behind *Other*. */
    reasonText: text("reason_text"),
    /** Items a refit shortened, so the review says *shortened* (UX v1.1 §11.9, 0005). */
    shortenedItemIds: uuid("shortened_item_ids")
      .array()
      .notNull()
      .default(sql`'{}'::uuid[]`),
    tier: missTierEnum("tier").notNull(),

    dayId: uuid("day_id")
      .notNull()
      .references(() => days.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("shifts_day_id_at_idx").on(table.dayId, table.at),
    index("shifts_user_id_idx").on(table.userId),
    check("shifts_delta_min_check", sql`${table.deltaMin} BETWEEN 0 AND 600`),
    ...ownerPrivateCrudPolicies({
      prefix: "shifts",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const shiftsRelations = relations(shifts, ({ one }) => ({
  day: one(days, {
    fields: [shifts.dayId],
    references: [days.id],
  }),
  user: one(users, {
    fields: [shifts.userId],
    references: [users.id],
  }),
}));

// packages/db/src/schema/day/misses.ts
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

// packages/db/src/schema/day/journal-entries.ts
/**
 * journal_entries — a few lines at night, in the person's own words (UX v1.1
 * §7.2, §11.10, TD-7).
 *
 * ONE ROW PER DAY (`day_id` is unique). `answers` is a jsonb keyed by prompt
 * key, NOT six columns: the prompts are the person's (`users.journal_prompts`
 * — renamed, reordered, removed, added), and a renamed prompt must keep its
 * answers while a removed one simply stops being read. The orient frame reads
 * three keys back the next morning (`make_happen_tomorrow`, `visualisation`,
 * `looking_forward`); the Week Review reads `gratitude_today` and
 * `looking_forward` verbatim, no synthesis.
 *
 * WRITES MERGE ONE KEY AT A TIME (`answers || excluded.answers`, DYN-4), so
 * autosave on one field from one device never overwrites another field
 * written from a second. An empty journal night is nothing, not a miss: no
 * row, no pending state, no push (R15).
 *
 * The prompts themselves are never here — a prompt's text belongs to the
 * person's profile; an answer belongs to the day it was written on, which is
 * the Synapse day (03:00 to 03:00), so a line written at 00:30 is Monday's.
 *
 * POLICIES: owner-private CRUD, on this table's own `user_id`.
 */
import { relations, sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { days } from "../plan/days";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** JSON shape: Record<promptKey, string> — each value ≤ 2000 (validator). */
    answers: jsonb("answers")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),

    dayId: uuid("day_id")
      .notNull()
      .references(() => days.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("journal_entries_day_id_idx").on(table.dayId),
    index("journal_entries_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("journal_entries_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "journal_entries",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  day: one(days, {
    fields: [journalEntries.dayId],
    references: [days.id],
  }),
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));
```

#### `day_items`

**PURPOSE.** day_items — the instance (official spec §3.7). The row the two execution tabs render. Materialised from a template slot when the week is built, or created as a one-off. THIS ROW IS THE RECORD. `title`, `icon`, `quantity_unit`, `reflection_axes` and `notes_preflight` are snapshots taken at materialisation, so a past day renders as it was lived even after the habit is renamed, re-iconed or archived (cross-cutting §8.1, §8.3). `original_scheduled_start` NEVER CHANGES after materialisation — the ghost renders here (§3.7). That promise is enforced by a database trigger (`day_items_original_start_immutable`, in `supabase/setup/`), not by the service, for the same reason `handle_new_user` is a trigger: the database guarantees what the app must never do. `scheduled_start` is the one that moves, on a shift or a late start. OFF-SCHEDULE IS DERIVED, NEVER STORED (§3.7, §6.3): it is `done_at` outside `original_scheduled_start .. scheduled_end`, computed on read. A ONE-OFF IS THE ONLY DELETABLE ITEM (cross-cutting §8.4). Everything else on a day is annotated. UNDER UX v1.1 (0005) AN ITEM BELONGS TO A BLOCK (`day_block_id`, TD-2), may be a PIN (`pinned` — the anchor glyph; the stack flows around it, R3), carries the gap before it (snapshotted from the slot; edited by a seam drag on the day), and may be one member of a *one of* group (`alternates_id` per day like `multitask_id`; `alternates_chosen` marks the live member — the other is `not_assigned`). `day_block_id` is NULLABLE and stays so (DYN-21): a one-off and an unstructured day's add have no block (`DayView.unblocked`); `0006`'s backfill put every v1.0 item under a `morning` block before the v1.0 columns went. WHEN `original_scheduled_start` IS WRITTEN changes under v1.1 (R23, TD-5): at week build for fixtures and pins on a structured day, and at *Set the day* for everything else — null until then. The trigger permits exactly that one `NULL → value` transition and refuses every other write; its body already did, and 0005 arms the same function on `day_blocks`. POLICIES: owner-private CRUD, on this table's own `user_id` — the service writes the day's owner, never the caller's claim.

**INDEXES.**
- `day_items_day_id_scheduled_start_idx`
- `day_items_user_id_completion_state_idx`
- `day_items_habit_id_idx`
- `day_items_template_slot_id_idx`
- `day_items_user_id_idx`
- `day_items_day_block_id_sort_order_idx`
- `day_items_alternates_id_idx`
- `day_items_parent_item_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `timer_sessions`

**PURPOSE.** timer_sessions — one run of the timer on one item (official spec §3.7, §5.4). `ended_at` is null while the timer is running, which is how "is anything running" is answered without a second source of truth. A session the person typed rather than timed is marked `source: manual` (cross-cutting §8.1), so the record always says which it was. A TIMER SESSION IS DELETABLE (cross-cutting §8.4) — one of exactly four things in the product that are. Undoing *done* keeps its sessions. POLICIES: owner-private CRUD.

**INDEXES.**
- `timer_sessions_day_item_id_started_at_idx`
- `timer_sessions_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `shifts`

**PURPOSE.** shifts — one "shift my day forward" event (official spec §3.9, §5.6). One row per shift, so the Day Review can say "shifted 60 min at 8:10 — slept in". A shift is undoable for ten minutes (cross-cutting §8.1); after that it is a fact, and the only way past it is another shift, which is also recorded. NO `cut_item_ids[]` COLUMN. Official §3.9 lists one; a cut item is instead a `day_items` row with `assignment_state = cut_by_shift` and a `misses` row whose `shift_id` points here. Normalised, so the Day Review's *Change* on a cut item edits one row and this shift's own record stays untouched (Epic 3 DR-05). See the Epic 1 DEVIATIONS line. `reason_key` is text rather than a foreign key for the same reason it is on `misses`: an archived or renamed reason must never rewrite a past record. UNDER UX v1.1 THIS IS ALSO THE ADJUST RECORD (§6.6, §11.9, TD-6). `kind` says which: a `shift` slides the anchor (`delta_min` > 0, as before); a `refit` holds it and shortens or cuts (`delta_min` = 0, hence the widened check). `shortened_item_ids` names the items whose length a refit reduced, so the Day Review can say *shortened* rather than *moved*. Cuts stay as they were: `day_items.assignment_state = cut_by_shift` and a `misses` row pointing here. POLICIES: owner-private CRUD.

**INDEXES.**
- `shifts_day_id_at_idx`
- `shifts_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `misses`

**PURPOSE.** misses — how one undone item was attributed (official spec §3.8). A miss exists only after a Day Review or a shift-forward resolves an item as missed. The tier is what the resolver reads (§7.3): `circumstance` is excluded from the number entirely, `scoping` credits half, `chose_not_to` credits nothing. ONE MISS PER ITEM. `day_item_id` is unique, so changing an attribution in the Day Review updates this row rather than writing a second one (Epic 3 DEVIATIONS). `shift_id` is kept when it does, which is exactly what lets DR-05 show *Changed from the shift's reason* — the condition is `shift_id IS NOT NULL AND resolved_by = 'day_review'`. `reason_key` is text, not a foreign key: a reason archived or renamed later must not rewrite what was recorded under the old one (cross-cutting §8.1). POLICIES: owner-private CRUD.

**INDEXES.**
- `misses_day_item_id_idx`
- `misses_shift_id_idx`
- `misses_traded_up_item_id_idx`
- `misses_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `journal_entries`

**PURPOSE.** journal_entries — a few lines at night, in the person's own words (UX v1.1 §7.2, §11.10, TD-7). ONE ROW PER DAY (`day_id` is unique). `answers` is a jsonb keyed by prompt key, NOT six columns: the prompts are the person's (`users.journal_prompts` — renamed, reordered, removed, added), and a renamed prompt must keep its answers while a removed one simply stops being read. The orient frame reads three keys back the next morning (`make_happen_tomorrow`, `visualisation`, `looking_forward`); the Week Review reads `gratitude_today` and `looking_forward` verbatim, no synthesis. WRITES MERGE ONE KEY AT A TIME (`answers || excluded.answers`, DYN-4), so autosave on one field from one device never overwrites another field written from a second. An empty journal night is nothing, not a miss: no row, no pending state, no push (R15). The prompts themselves are never here — a prompt's text belongs to the person's profile; an answer belongs to the day it was written on, which is the Synapse day (03:00 to 03:00), so a line written at 00:30 is Monday's. POLICIES: owner-private CRUD, on this table's own `user_id`.

**INDEXES.**
- `journal_entries_day_id_idx`
- `journal_entries_user_id_created_at_idx`
- `journal_entries_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

### GROUP 5 — NOTIFICATIONS

Web Push subscription endpoints — one row per browser that agreed to reminders — and one preference row per reminder kind the person has an opinion about. A missing preference row means the catalogue default (`NOTIFICATION_CATALOGUE` in `@syn/constants`).

```ts
// packages/db/src/schema/notification/web-push-subscriptions.ts
/**
 * web_push_subscriptions — one row per browser that agreed to reminders.
 *
 * Endpoint, p256dh, and auth are what `PushSubscription.toJSON()` gives; the
 * scheduler (INF-9) reads them to send. It lives in the foundation rather than
 * in INF-9 because it is the only table INF-9 needs, and a ticket that ships a
 * route handler should not also be generating a migration.
 *
 * POLICIES: owner-private CRUD. A subscription is a fact about a person's
 * device, so it is theirs alone to read and revoke.
 *
 * `userId` is `ON DELETE set null` rather than cascade so a revoked
 * subscription can be reaped by endpoint after the account is gone, instead of
 * the row disappearing and the push service being told nothing.
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

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

/** One table uses it, so it lives here (drizzle-orm-conventions §4). */
export const devicePlatformEnum = pgEnum("device_platform", [
  "ios",
  "android",
  "web",
]);

export const webPushSubscriptions = pgTable(
  "web_push_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    auth: text("auth").notNull(),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    platform: devicePlatformEnum("platform").notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    userAgent: text("user_agent"),

    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    uniqueIndex("web_push_subscriptions_endpoint_idx").on(table.endpoint),
    index("web_push_subscriptions_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "web_push_subscriptions",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const webPushSubscriptionsRelations = relations(
  webPushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [webPushSubscriptions.userId],
      references: [users.id],
    }),
  }),
);

// packages/db/src/schema/notification/notification-prefs.ts
/**
 * notification_prefs — one row per reminder kind the person has an opinion
 * about (official spec §3.1 `notification_prefs`, §8.2, §8.4).
 *
 * A MISSING ROW MEANS THE CATALOGUE DEFAULT. `NOTIFICATION_CATALOGUE` in
 * `@syn/constants` carries `defaultEnabled` for all nine kinds, so a person who
 * has never opened Settings still gets exactly what §8.2 says they get, and
 * turning a switch back to its default is allowed to delete the row rather
 * than store a fact the catalogue already knows.
 *
 * A row here is a preference, not a promise to send: Epic 1 ST-07 renders the
 * Phase-2 kinds as real switches whose sender arrives later (§12).
 *
 * WHAT IS NOT HERE: the times. `users.review_reminder_time` (N4) and
 * `users.week_build_reminder_weekday` / `week_build_reminder_time` (N6) are
 * scalars about the person, not about a kind, so they live on `users`.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import type { NotificationKind } from "@syn/types";

import { enumValues } from "../enum-values";
import { blockKindEnum } from "../enums";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

/**
 * The nine rows of official spec §8.2, N1…N9 in order, then UX v1.1 §9.1's
 * three (`block_start`, `fixture_start`, `devices_off`). Moved in DYN-1; the
 * `ADD VALUE`s ship in `0004`; the scheduler writes them from DYN-20.
 */
export const notificationKindEnum = pgEnum(
  "notification_kind",
  enumValues<NotificationKind>()([
    "item_start",
    "window_open",
    "window_closing",
    "review_reminder",
    "pending_review",
    "week_build",
    "week_ready",
    "timer_running",
    "calendar_item",
    "block_start",
    "fixture_start",
    "devices_off",
    // UX v1.2 §9 N2 (R38) — the journal reminder. Moved in RUN-1; the
    // `ADD VALUE` ships in `0007`; sent from RUN-6.
    "journal_reminder",
  ]),
);

export const notificationPrefs = pgTable(
  "notification_prefs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /**
     * UX v1.1 §9.3 (0005): `item_start` is a preference PER BLOCK — *Every
     * item in… prep*. Null for every other kind, and for the row that means
     * "item_start, every block" if one is ever written. The unique index below
     * treats nulls as equal, so one row per (kind, block) and one row per kind
     * without a block.
     */
    blockKind: blockKindEnum("block_kind"),
    enabled: boolean("enabled").notNull(),
    kind: notificationKindEnum("kind").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    // A constraint, not an index: `nullsNotDistinct` exists only on the
    // constraint builder (the same reason as `notification_deliveries_key`).
    unique("notification_prefs_user_id_kind_block_kind_key")
      .on(table.userId, table.kind, table.blockKind)
      .nullsNotDistinct(),
    index("notification_prefs_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "notification_prefs",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const notificationPrefsRelations = relations(
  notificationPrefs,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationPrefs.userId],
      references: [users.id],
    }),
  }),
);
```

#### `web_push_subscriptions`

**PURPOSE.** web_push_subscriptions — one row per browser that agreed to reminders. Endpoint, p256dh, and auth are what `PushSubscription.toJSON()` gives; the scheduler (INF-9) reads them to send. It lives in the foundation rather than in INF-9 because it is the only table INF-9 needs, and a ticket that ships a route handler should not also be generating a migration. POLICIES: owner-private CRUD. A subscription is a fact about a person's device, so it is theirs alone to read and revoke. `userId` is `ON DELETE set null` rather than cascade so a revoked subscription can be reaped by endpoint after the account is gone, instead of the row disappearing and the push service being told nothing.

**INDEXES.**
- `web_push_subscriptions_endpoint_idx`
- `web_push_subscriptions_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `notification_prefs`

**PURPOSE.** notification_prefs — one row per reminder kind the person has an opinion about (official spec §3.1 `notification_prefs`, §8.2, §8.4). A MISSING ROW MEANS THE CATALOGUE DEFAULT. `NOTIFICATION_CATALOGUE` in `@syn/constants` carries `defaultEnabled` for all nine kinds, so a person who has never opened Settings still gets exactly what §8.2 says they get, and turning a switch back to its default is allowed to delete the row rather than store a fact the catalogue already knows. A row here is a preference, not a promise to send: Epic 1 ST-07 renders the Phase-2 kinds as real switches whose sender arrives later (§12). WHAT IS NOT HERE: the times. `users.review_reminder_time` (N4) and `users.week_build_reminder_weekday` / `week_build_reminder_time` (N6) are scalars about the person, not about a kind, so they live on `users`. POLICIES: owner-private CRUD.

**INDEXES.**
- `notification_prefs_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

### GROUP 6 — SYSTEM

Bookkeeping a person creates but does not browse, and the one table the product owns: a request to export everything, a message sent from About, and — since UX v1.2 (0007) — the `quotes` bank. `feedback_messages` is insert-only for its author, readable by nobody through the app; `quotes` is a shipped catalogue (`catalogReadPolicies`) — readable by every signed-in person, written by none.

```ts
// packages/db/src/schema/system/data-exports.ts
/**
 * data_exports — one request for "export everything" (official spec §7.6,
 * Epic 1 ST-10).
 *
 * Created here, empty, so SET-10 is a code ticket rather than a second
 * migration. The bundle is built inside the mutation and uploaded to the
 * private `exports` bucket; `expires_at` is 24 hours after it is ready, and a
 * scheduled job flips the row to `expired` and removes the object.
 *
 * `error` IS NEVER SHOWN. ST-10 has its own sentence for a failed export; the
 * column exists so a failure can be diagnosed, not so a stack trace can reach
 * a person who asked for their data.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { ExportStatus } from "@syn/types";

import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

/** One table uses it, so it lives here (drizzle-orm-conventions §3). */
export const exportStatusEnum = pgEnum(
  "export_status",
  enumValues<ExportStatus>()(["preparing", "ready", "expired", "failed"]),
);

export const dataExports = pgTable(
  "data_exports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Shown as the size beside *ready* (ST-10). */
    byteSize: integer("byte_size"),
    /** Never shown — see the note above. */
    error: text("error"),
    /** 24 hours after the export became ready. */
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    status: exportStatusEnum("status").notNull().default("preparing"),
    /** `exports/{user_id}/{id}.zip` in the private bucket. */
    storagePath: text("storage_path"),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("data_exports_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("data_exports_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "data_exports",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const dataExportsRelations = relations(dataExports, ({ one }) => ({
  user: one(users, {
    fields: [dataExports.userId],
    references: [users.id],
  }),
}));

// packages/db/src/schema/system/feedback-messages.ts
/**
 * feedback_messages — what a person sends from About (cross-cutting SY-01).
 *
 * THE ONE TABLE IN THIS SCHEMA THAT IS NOT OWNER-PRIVATE, and the only one
 * with policies written inline rather than by a factory — because no factory
 * fits and none is added for it. The shape is insert-only for the author:
 *
 *   insert  → authenticated, `WITH CHECK` the row's `user_id` is the caller's
 *   select  → denied to authenticated
 *   update  → denied to authenticated
 *   delete  → denied to authenticated
 *
 * A person can send a message and cannot read anyone's, including their own.
 * The builder reads it through the service role, out of band. That still keeps
 * the trust line honest — *Nothing from your list is included* — because the
 * row holds only what the person typed plus the two optional context fields
 * the switch controls. No item title, no note, no reason ever reaches here.
 *
 * `user_id` is nullable and `ON DELETE set null`: a deleted account's message
 * survives as anonymous rather than vanishing, which is what makes ST-10a's
 * "everything is removed" true of the person and still leaves the report
 * useful.
 *
 * `[PROVISIONAL — Taylor: confirm that feedback may be read by the builder.]`
 */
import { relations, sql } from "drizzle-orm";
import { index, pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

import { denyAuthenticated, isOwner } from "../rls/helpers";
import { users } from "../user/users";

export const feedbackMessages = pgTable(
  "feedback_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Included only when the *Include app version* switch is on (SY-01). */
    appVersion: text("app_version"),
    /** 1–1000 — `FEEDBACK_MAX`. */
    message: text("message").notNull(),
    /** The route the person was on, as above — a path, never a query string. */
    screenPath: text("screen_path"),

    /** The author. Nullable so a deleted account's message stays as anonymous. */
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("feedback_messages_user_id_idx").on(table.userId),
    pgPolicy("feedback_messages_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isOwner(sql`${table.userId}`),
    }),
    pgPolicy("feedback_messages_select", {
      for: "select",
      to: authenticatedRole,
      using: denyAuthenticated,
    }),
    pgPolicy("feedback_messages_update", {
      for: "update",
      to: authenticatedRole,
      using: denyAuthenticated,
    }),
    pgPolicy("feedback_messages_delete", {
      for: "delete",
      to: authenticatedRole,
      using: denyAuthenticated,
    }),
  ],
);

export const feedbackMessagesRelations = relations(
  feedbackMessages,
  ({ one }) => ({
    user: one(users, {
      fields: [feedbackMessages.userId],
      references: [users.id],
    }),
  }),
);

// packages/db/src/schema/system/quotes.ts
/**
 * quotes — the bank a person may opt into for the morning frame (UX v1.2
 * §3.12, §11.6; R36, TD-13).
 *
 * APP CONTENT, NOT A PERSON'S. The first table under `catalogReadPolicies`:
 * every signed-in person may read it, nobody may write it through the
 * authenticated role, and there is no `user_id` — a quote belongs to the
 * product, the way the curated icon set does. It changes by migration or seed
 * (the factory's own rule) or, if RUN-14 ships, through an admin surface that
 * writes with the service role. It never changes through an RLS policy for
 * "admins": a role column on `users` is one careless policy away from an
 * admin-read on user data, which this schema promises never exists.
 *
 * NOTHING ABOUT THE PERSON DECIDES THE QUOTE. `quote.today` picks by date
 * order over the published rows, so two people on the same day see the same
 * quote and nobody sees one "for them". The read filters `published_at IS NOT
 * NULL`; a draft is invisible to every person.
 *
 * THE APP NEVER SPEAKS IT. The frame renders a quote in quotation marks with
 * its attribution as a caption, under the neutral chrome caption *A quote*.
 * The tone rule for whoever curates the bank (v1.2 §13 #24): nothing that
 * instructs, exhorts, or commands in the second person.
 *
 * POLICIES: `catalogReadPolicies` — select for authenticated; insert, update,
 * delete denied.
 */
import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { catalogReadPolicies } from "../rls/standard-policies";

export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** 1–120. Always shown; a quote without one is not published. */
    attribution: text("attribution").notNull(),
    /** Null = a draft, invisible to every person. The cycle orders by this, then id. */
    publishedAt: timestamp("published_at", { withTimezone: true }),
    /** ≤ 200, optional — a book, a talk, a letter. */
    source: text("source"),
    /** Curator's tags; nothing reads them in v1.2 beyond the admin list. */
    tags: text("tags").array().notNull().default([]),
    /** 1–400. */
    text: text("text").notNull(),
  },
  (table) => [
    index("quotes_published_at_idx").on(table.publishedAt),
    check("quotes_text_check", sql`length(${table.text}) BETWEEN 1 AND 400`),
    check(
      "quotes_attribution_check",
      sql`length(${table.attribution}) BETWEEN 1 AND 120`,
    ),
    check(
      "quotes_source_check",
      sql`${table.source} IS NULL OR length(${table.source}) <= 200`,
    ),
    ...catalogReadPolicies("quotes"),
  ],
);
```

#### `data_exports`

**PURPOSE.** data_exports — one request for "export everything" (official spec §7.6, Epic 1 ST-10). Created here, empty, so SET-10 is a code ticket rather than a second migration. The bundle is built inside the mutation and uploaded to the private `exports` bucket; `expires_at` is 24 hours after it is ready, and a scheduled job flips the row to `expired` and removes the object. `error` IS NEVER SHOWN. ST-10 has its own sentence for a failed export; the column exists so a failure can be diagnosed, not so a stack trace can reach a person who asked for their data. POLICIES: owner-private CRUD.

**INDEXES.**
- `data_exports_user_id_created_at_idx`
- `data_exports_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `feedback_messages`

**PURPOSE.** feedback_messages — what a person sends from About (cross-cutting SY-01). THE ONE TABLE IN THIS SCHEMA THAT IS NOT OWNER-PRIVATE, and the only one with policies written inline rather than by a factory — because no factory fits and none is added for it. The shape is insert-only for the author: insert  → authenticated, `WITH CHECK` the row's `user_id` is the caller's select  → denied to authenticated update  → denied to authenticated delete  → denied to authenticated A person can send a message and cannot read anyone's, including their own. The builder reads it through the service role, out of band. That still keeps the trust line honest — *Nothing from your list is included* — because the row holds only what the person typed plus the two optional context fields the switch controls. No item title, no note, no reason ever reaches here. `user_id` is nullable and `ON DELETE set null`: a deleted account's message survives as anonymous rather than vanishing, which is what makes ST-10a's "everything is removed" true of the person and still leaves the report useful. `[PROVISIONAL — Taylor: confirm that feedback may be read by the builder.]`

**INDEXES.**
- `feedback_messages_user_id_idx`

**RLS.** **The one table that is not owner-private.** Insert-only for the author (`WITH CHECK` the row's `user_id` is the caller's); select, update and delete are denied to the authenticated role. Nobody reads it through the app.

#### `quotes`

**PURPOSE.** quotes — the bank a person may opt into for the morning frame (UX v1.2 §3.12, §11.6; R36, TD-13). APP CONTENT, NOT A PERSON'S. The first table under `catalogReadPolicies`: every signed-in person may read it, nobody may write it through the authenticated role, and there is no `user_id` — a quote belongs to the product, the way the curated icon set does. It changes by migration or seed (the factory's own rule) or, if RUN-14 ships, through an admin surface that writes with the service role. It never changes through an RLS policy for "admins": a role column on `users` is one careless policy away from an admin-read on user data, which this schema promises never exists. NOTHING ABOUT THE PERSON DECIDES THE QUOTE. `quote.today` picks by date order over the published rows, so two people on the same day see the same quote and nobody sees one "for them". The read filters `published_at IS NOT NULL`; a draft is invisible to every person. THE APP NEVER SPEAKS IT. The frame renders a quote in quotation marks with its attribution as a caption, under the neutral chrome caption *A quote*. The tone rule for whoever curates the bank (v1.2 §13 #24): nothing that instructs, exhorts, or commands in the second person. POLICIES: `catalogReadPolicies` — select for authenticated; insert, update, delete denied.

**INDEXES.**
- `quotes_published_at_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

### GROUP 7 — WORKFLOW

Since Epic 7 (0011): the board for work that waits on a prompt, separate from the habit day. A `workflow_views` row is a board; its `workflow_columns` are its states, at most one `active` (tasks fire here) and one `done` per view, held by two partial unique indexes; `workflow_groups` are its lanes (usually clients), coloured with a category hue; `workflow_tasks` sit in one column and one lane, firing when `firing_started_at` is set. `workflow_templates` are column arrangements the person saved — a jsonb snapshot; the two built-in ones are constants, never rows. `workflow_day_pins` holds the groups made *first today*, keyed by the person's day, so nothing runs to clear them. *Next* is never stored. `workflow_tasks.column_id` restricts, so a column holding tasks cannot be deleted until they are moved.

```ts
// packages/db/src/schema/workflow/workflow-views.ts
/**
 * workflow_views — one board: a named set of columns with the tasks in them
 * (Workflow UX spec v0.1 §3.6, §11; Epic 7 TD-33, TD-34).
 *
 * A VIEW OWNS ITS COLUMNS (W10). Nothing points back at the template it was
 * made from — a template is only where a view's columns started. The two
 * starter views are made on the first board read (`ensureWorkflowDefaults`,
 * TD-41), never by a migration.
 *
 * `last_opened_at` is how `/workflow` knows which view to return to (TD-44).
 * `sort_order` is the view tabs' order. ARCHIVE, NEVER DELETE (W18): an
 * archived view keeps its columns and tasks and brings them back with it.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import { index, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { workflowColumns } from "./workflow-columns";
import { workflowTasks } from "./workflow-tasks";

export const workflowViews = pgTable(
  "workflow_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** The view `/workflow` returns to is the one opened last. */
    lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }),
    /** 1–40 (`WORKFLOW_NAME_MAX`, the validator's bound). */
    name: text("name").notNull(),
    /** The view tabs' order — dense, rewritten by the service (TD-35). */
    sortOrder: smallint("sort_order").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("workflow_views_user_id_sort_order_idx").on(table.userId, table.sortOrder),
    index("workflow_views_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "workflow_views",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const workflowViewsRelations = relations(workflowViews, ({ many, one }) => ({
  columns: many(workflowColumns),
  tasks: many(workflowTasks),
  user: one(users, {
    fields: [workflowViews.userId],
    references: [users.id],
  }),
}));

// packages/db/src/schema/workflow/workflow-columns.ts
/**
 * workflow_columns — a state a task is in, in one view (Workflow UX spec v0.1
 * §3.6, §11; Epic 7 TD-34).
 *
 * COLUMNS ARE ROWS, not jsonb on the view, because tasks reference them: a
 * removed column cannot orphan a task silently. `workflow_tasks.column_id`
 * RESTRICTS, so a column that holds tasks cannot be deleted until its tasks
 * are moved — exactly WF-04's *Move its tasks first*.
 *
 * AT MOST ONE OF EACH ROLE PER VIEW (W11) is held by the database, not
 * promised by the service: two partial unique indexes on `view_id`, one where
 * the role is `active` (tasks fire here), one where it is `done` (closed tasks
 * land here). `role` is nullable; no third value means "none".
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { WorkflowColumnRole } from "@syn/types";

import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { workflowTasks } from "./workflow-tasks";
import { workflowViews } from "./workflow-views";

/** WorkflowColumn.role — W11. One table, so it lives in this file (drizzle-orm-conventions §3). */
export const workflowColumnRoleEnum = pgEnum(
  "workflow_column_role",
  enumValues<WorkflowColumnRole>()(["active", "done"]),
);

export const workflowColumns = pgTable(
  "workflow_columns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** 1–40 (`WORKFLOW_NAME_MAX`). */
    name: text("name").notNull(),
    /** Null for a column with no role. */
    role: workflowColumnRoleEnum("role"),
    /** The column's place in its view — dense, rewritten by the service (TD-35). */
    sortOrder: smallint("sort_order").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    viewId: uuid("view_id")
      .notNull()
      .references(() => workflowViews.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("workflow_columns_view_id_active_idx")
      .on(table.viewId)
      .where(sql`${table.role} = 'active'`),
    uniqueIndex("workflow_columns_view_id_done_idx")
      .on(table.viewId)
      .where(sql`${table.role} = 'done'`),
    index("workflow_columns_view_id_sort_order_idx").on(table.viewId, table.sortOrder),
    index("workflow_columns_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "workflow_columns",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const workflowColumnsRelations = relations(workflowColumns, ({ many, one }) => ({
  tasks: many(workflowTasks),
  user: one(users, {
    fields: [workflowColumns.userId],
    references: [users.id],
  }),
  view: one(workflowViews, {
    fields: [workflowColumns.viewId],
    references: [workflowViews.id],
  }),
}));

// packages/db/src/schema/workflow/workflow-groups.ts
/**
 * workflow_groups — a set of tasks, usually a client; a lane (Workflow UX spec
 * v0.1 §3.5, §11; Epic 7 TD-34).
 *
 * THE HUE IS A CATEGORY HUE. `hue` is `category_color_key`, the root enum the
 * categories use — one hue vocabulary, one home; a group never gets a list of
 * its own. It is drawn as the lane head's leading edge, always beside the name.
 *
 * `sort_order` is the usual order. *First today* is not stored here: it is a
 * pin for one day in `workflow_day_pins` (TD-37). `collapsed` is remembered per
 * group, across views. ARCHIVE, NEVER DELETE (W18) — the archive service moves
 * the group's tasks to *No group* first; `workflow_tasks.group_id` setting null
 * is the backstop, never the path.
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
  uuid,
} from "drizzle-orm/pg-core";

import { categoryColorKeyEnum } from "../enums";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { workflowTasks } from "./workflow-tasks";

export const workflowGroups = pgTable(
  "workflow_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** The lane is folded to its head — on every view. */
    collapsed: boolean("collapsed").notNull().default(false),
    hue: categoryColorKeyEnum("hue").notNull(),
    /** 1–40 (`WORKFLOW_NAME_MAX`). The person's words — never logged. */
    name: text("name").notNull(),
    /** The usual order — dense, rewritten by the service (TD-35). */
    sortOrder: smallint("sort_order").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("workflow_groups_user_id_sort_order_idx").on(table.userId, table.sortOrder),
    index("workflow_groups_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "workflow_groups",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const workflowGroupsRelations = relations(workflowGroups, ({ many, one }) => ({
  tasks: many(workflowTasks),
  user: one(users, {
    fields: [workflowGroups.userId],
    references: [users.id],
  }),
}));

// packages/db/src/schema/workflow/workflow-tasks.ts
/**
 * workflow_tasks — one thread of work; a row on the board (Workflow UX spec
 * v0.1 §3.2–§3.8, §11; Epic 7 TD-33–TD-36). On screen the noun is *Task*; in
 * code it is always a *workflow task*, because a habit has a task type too.
 *
 * FIRING IS A TIMESTAMP, NOT A FLAG (TD-36). `firing_started_at` set means a
 * prompt is running; `last_returned_at` is when it last came back. There is no
 * boolean beside them to disagree with them. *Next* is not stored anywhere —
 * it is computed from order on every render (TD-38).
 *
 * THE ON-DELETE RULES ARE THE DESIGN.
 * - `column_id` RESTRICTS: a column holding tasks cannot be deleted until they
 *   are moved (WF-04). A cascade here would delete a person's work.
 * - `group_id` SETS NULL: the lane *No group*. Groups are archived, not deleted,
 *   and the archive service moves tasks explicitly; this is the backstop.
 * - `view_id` CASCADES, with the view. It is denormalised from the column for
 *   the board read; the move service is its only writer and writes it with
 *   `column_id`, together (TD-35).
 *
 * `sort_order` is the task's place in its cell — one group in one column —
 * dense and server-rewritten. No unique constraint: a dense rewrite inside a
 * transaction passes through duplicates.
 *
 * The title and the note are the person's client work: never logged, never in
 * an error message, always in the export (TD-45).
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import { index, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { workflowColumns } from "./workflow-columns";
import { workflowGroups } from "./workflow-groups";
import { workflowViews } from "./workflow-views";

export const workflowTasks = pgTable(
  "workflow_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** Set on entering the done column; cleared on leaving it (TD-35). */
    closedAt: timestamp("closed_at", { withTimezone: true }),
    /** A prompt is running. Cleared when the task leaves the active column. */
    firingStartedAt: timestamp("firing_started_at", { withTimezone: true }),
    /** When the prompt last came back — *back · 2 min*. */
    lastReturnedAt: timestamp("last_returned_at", { withTimezone: true }),
    /** ≤ 2000 (`WORKFLOW_NOTE_MAX`) — what was asked, what to check (W19). */
    note: text("note"),
    /** The place in its cell — dense, rewritten by the service (TD-35). */
    sortOrder: smallint("sort_order").notNull(),
    /** 1–120 (`WORKFLOW_TITLE_MAX`). */
    title: text("title").notNull(),

    columnId: uuid("column_id")
      .notNull()
      .references(() => workflowColumns.id, { onDelete: "restrict" }),
    /** Null is the lane *No group*. */
    groupId: uuid("group_id").references(() => workflowGroups.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    viewId: uuid("view_id")
      .notNull()
      .references(() => workflowViews.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("workflow_tasks_view_id_column_id_group_id_sort_order_idx").on(
      table.viewId,
      table.columnId,
      table.groupId,
      table.sortOrder,
    ),
    index("workflow_tasks_user_id_archived_at_idx").on(table.userId, table.archivedAt),
    index("workflow_tasks_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "workflow_tasks",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const workflowTasksRelations = relations(workflowTasks, ({ one }) => ({
  column: one(workflowColumns, {
    fields: [workflowTasks.columnId],
    references: [workflowColumns.id],
  }),
  group: one(workflowGroups, {
    fields: [workflowTasks.groupId],
    references: [workflowGroups.id],
  }),
  user: one(users, {
    fields: [workflowTasks.userId],
    references: [users.id],
  }),
  view: one(workflowViews, {
    fields: [workflowTasks.viewId],
    references: [workflowViews.id],
  }),
}));

// packages/db/src/schema/workflow/workflow-templates.ts
/**
 * workflow_templates — a saved arrangement of columns to start a view from
 * (Workflow UX spec v0.1 §3.6, §11; Epic 7 TD-34).
 *
 * A SNAPSHOT, NOT ROWS OF ROWS. Nothing refers to a template after a view is
 * made from it (W10), so its columns are one jsonb list of names and roles.
 * Editing a template never changes an existing view.
 *
 * ONLY WHAT THE PERSON SAVED. The two built-in templates (*Working*, *Queue*)
 * are constants in `@syn/constants` (`WORKFLOW_STARTERS`), never rows (TD-41).
 * ARCHIVE, NEVER DELETE (W18).
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import type { WorkflowTemplateColumn } from "@syn/types";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const workflowTemplates = pgTable(
  "workflow_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    // JSON shape: WorkflowTemplateColumn[] — see @syn/types (src/domain/workflow.ts)
    columns: jsonb("columns").$type<WorkflowTemplateColumn[]>().notNull(),
    /** 1–40 (`WORKFLOW_NAME_MAX`). */
    name: text("name").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("workflow_templates_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "workflow_templates",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const workflowTemplatesRelations = relations(workflowTemplates, ({ one }) => ({
  user: one(users, {
    fields: [workflowTemplates.userId],
    references: [users.id],
  }),
}));

// packages/db/src/schema/workflow/workflow-day-pins.ts
/**
 * workflow_day_pins — the groups made *first today*, for one of the person's
 * days (Workflow UX spec v0.1 §3.5 W9, §11; Epic 7 TD-37).
 *
 * KEYED BY THE DAY, SO NOTHING RUNS. One row per `(user_id, day_key)`, the key
 * from `resolveDayKey` and the person's own day close. A new day has a new key,
 * so yesterday's pins are simply never read — no job, no cleanup, nothing to
 * dismiss. A stale row is a few bytes and stays in the export as a record of
 * what was pinned.
 *
 * PINS ONLY, NOT A WHOLE ORDER. The rest of the lanes keep their usual order
 * (`workflow_groups.sort_order`); a full order per day would have to be
 * reconciled every time a group is added. An id whose group was archived later
 * is left in place and ignored by `orderGroupsForDay`.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import { date, index, jsonb, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const workflowDayPins = pgTable(
  "workflow_day_pins",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** The person's day the pins belong to — the same key `days.date` holds. */
    dayKey: date("day_key").notNull(),
    // JSON shape: string[] — group ids, newest pin first
    groupIds: jsonb("group_ids").$type<string[]>().notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("workflow_day_pins_user_id_day_key_idx").on(table.userId, table.dayKey),
    index("workflow_day_pins_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "workflow_day_pins",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const workflowDayPinsRelations = relations(workflowDayPins, ({ one }) => ({
  user: one(users, {
    fields: [workflowDayPins.userId],
    references: [users.id],
  }),
}));
```

#### `workflow_views`

**PURPOSE.** workflow_views — one board: a named set of columns with the tasks in them (Workflow UX spec v0.1 §3.6, §11; Epic 7 TD-33, TD-34). A VIEW OWNS ITS COLUMNS (W10). Nothing points back at the template it was made from — a template is only where a view's columns started. The two starter views are made on the first board read (`ensureWorkflowDefaults`, TD-41), never by a migration. `last_opened_at` is how `/workflow` knows which view to return to (TD-44). `sort_order` is the view tabs' order. ARCHIVE, NEVER DELETE (W18): an archived view keeps its columns and tasks and brings them back with it. POLICIES: owner-private CRUD.

**INDEXES.**
- `workflow_views_user_id_sort_order_idx`
- `workflow_views_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `workflow_columns`

**PURPOSE.** workflow_columns — a state a task is in, in one view (Workflow UX spec v0.1 §3.6, §11; Epic 7 TD-34). COLUMNS ARE ROWS, not jsonb on the view, because tasks reference them: a removed column cannot orphan a task silently. `workflow_tasks.column_id` RESTRICTS, so a column that holds tasks cannot be deleted until its tasks are moved — exactly WF-04's *Move its tasks first*. AT MOST ONE OF EACH ROLE PER VIEW (W11) is held by the database, not promised by the service: two partial unique indexes on `view_id`, one where the role is `active` (tasks fire here), one where it is `done` (closed tasks land here). `role` is nullable; no third value means "none". POLICIES: owner-private CRUD.

**INDEXES.**
- `workflow_columns_view_id_active_idx`
- `workflow_columns_view_id_done_idx`
- `workflow_columns_view_id_sort_order_idx`
- `workflow_columns_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `workflow_groups`

**PURPOSE.** workflow_groups — a set of tasks, usually a client; a lane (Workflow UX spec v0.1 §3.5, §11; Epic 7 TD-34). THE HUE IS A CATEGORY HUE. `hue` is `category_color_key`, the root enum the categories use — one hue vocabulary, one home; a group never gets a list of its own. It is drawn as the lane head's leading edge, always beside the name. `sort_order` is the usual order. *First today* is not stored here: it is a pin for one day in `workflow_day_pins` (TD-37). `collapsed` is remembered per group, across views. ARCHIVE, NEVER DELETE (W18) — the archive service moves the group's tasks to *No group* first; `workflow_tasks.group_id` setting null is the backstop, never the path. POLICIES: owner-private CRUD.

**INDEXES.**
- `workflow_groups_user_id_sort_order_idx`
- `workflow_groups_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `workflow_tasks`

**PURPOSE.** workflow_tasks — one thread of work; a row on the board (Workflow UX spec v0.1 §3.2–§3.8, §11; Epic 7 TD-33–TD-36). On screen the noun is *Task*; in code it is always a *workflow task*, because a habit has a task type too. FIRING IS A TIMESTAMP, NOT A FLAG (TD-36). `firing_started_at` set means a prompt is running; `last_returned_at` is when it last came back. There is no boolean beside them to disagree with them. *Next* is not stored anywhere — it is computed from order on every render (TD-38). THE ON-DELETE RULES ARE THE DESIGN. - `column_id` RESTRICTS: a column holding tasks cannot be deleted until they are moved (WF-04). A cascade here would delete a person's work. - `group_id` SETS NULL: the lane *No group*. Groups are archived, not deleted, and the archive service moves tasks explicitly; this is the backstop. - `view_id` CASCADES, with the view. It is denormalised from the column for the board read; the move service is its only writer and writes it with `column_id`, together (TD-35). `sort_order` is the task's place in its cell — one group in one column — dense and server-rewritten. No unique constraint: a dense rewrite inside a transaction passes through duplicates. The title and the note are the person's client work: never logged, never in an error message, always in the export (TD-45). POLICIES: owner-private CRUD.

**INDEXES.**
- `workflow_tasks_view_id_column_id_group_id_sort_order_idx`
- `workflow_tasks_user_id_archived_at_idx`
- `workflow_tasks_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `workflow_templates`

**PURPOSE.** workflow_templates — a saved arrangement of columns to start a view from (Workflow UX spec v0.1 §3.6, §11; Epic 7 TD-34). A SNAPSHOT, NOT ROWS OF ROWS. Nothing refers to a template after a view is made from it (W10), so its columns are one jsonb list of names and roles. Editing a template never changes an existing view. ONLY WHAT THE PERSON SAVED. The two built-in templates (*Working*, *Queue*) are constants in `@syn/constants` (`WORKFLOW_STARTERS`), never rows (TD-41). ARCHIVE, NEVER DELETE (W18). POLICIES: owner-private CRUD.

**INDEXES.**
- `workflow_templates_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `workflow_day_pins`

**PURPOSE.** workflow_day_pins — the groups made *first today*, for one of the person's days (Workflow UX spec v0.1 §3.5 W9, §11; Epic 7 TD-37). KEYED BY THE DAY, SO NOTHING RUNS. One row per `(user_id, day_key)`, the key from `resolveDayKey` and the person's own day close. A new day has a new key, so yesterday's pins are simply never read — no job, no cleanup, nothing to dismiss. A stale row is a few bytes and stays in the export as a record of what was pinned. PINS ONLY, NOT A WHOLE ORDER. The rest of the lanes keep their usual order (`workflow_groups.sort_order`); a full order per day would have to be reconciled every time a group is added. An id whose group was archived later is left in place and ignored by `orderGroupsForDay`. POLICIES: owner-private CRUD.

**INDEXES.**
- `workflow_day_pins_user_id_day_key_idx`
- `workflow_day_pins_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.


---

## 5. UPDATED_AT TRIGGER

A reusable function sets `updated_at` at the database level, so it never depends on app code remembering to:

```sql
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

`supabase/setup/02_apply_triggers_rls.sql` attaches it to every `public` base table that has an `updated_at` column, in a data-driven loop. A table added by a future migration is picked up the next time `db:setup` runs — there is no per-table edit to forget.

### The other trigger: `day_items_original_start_immutable`

Official spec §3.7 says `original_scheduled_start` "never changes after materialisation" — it is where the ghost renders, and it is the half of the plan-versus-actual distinction that a late start or a shift must not erase. Setting it from `NULL` is materialisation writing it once; changing it afterwards raises:

```
ERROR:  original_scheduled_start is immutable
```

It is a trigger rather than a service rule for the same reason `handle_new_user()` is: four write paths update this table (the materialiser, the shift, a late start, TP-04 re-materialisation), and a rule enforced in four services holds until someone adds a fifth.

---

## 6. RLS NOTES

RLS is **enabled on every `public` table** by the same loop, deny-by-default. Policies are declared inline in the Drizzle schema files (`pgPolicy`, `ownerPrivateCrudPolicies`) and applied by migration.

**The access model has exactly one shape: owner-private.** The row's owner is the only reader and the only writer. There is no admin-read policy on any user-data table and no factory that would create one — `ownerRowPolicies`, `coupleScopedPolicies`, `catalogAdminWritePolicies`, and `holderScopedPolicies` were deliberately not carried over from Conscious Connections. This is the code form of the product's promise: *only you can see your data — not the people who built this.*

- **Owner-private CRUD:** every table but the two below — `user_avatars`, `categories`, `habits`, `reasons`, `templates`, `template_slots`, `days`, `day_items`, `timer_sessions`, `shifts`, `misses`, `web_push_subscriptions`, `notification_prefs`, `data_exports`.
- **Owner read/update, trigger insert, cascade delete:** `users` — the row is created by `handle_new_user()` and removed by cascade from `auth.admin.deleteUser`, so authenticated insert and delete are denied outright.
- **Insert-only for the author:** `feedback_messages` — the one table that is not owner-private. A person can send a message and cannot read anyone's, including their own; the builder reads it out of band through the service role. The trust line stays true because the row holds only the message and the two context fields the switch controls.
- **Service-role only:** system bookkeeping (`serviceRoleOnlyPolicies`) — `notification_deliveries`. Every row is about a message the scheduler sent rather than about the person's day, and nobody reads their own delivery log.
- **Read-only catalogue:** reserved for tables the product ships rather than a person writes (`catalogReadPolicies`). Nothing uses it yet.

**Every table carries its own `user_id`, denormalised.** `template_slots`, `day_items`, `timer_sessions` and `misses` could each derive an owner through a parent, and none of them does: a policy that subqueries another RLS-guarded table re-evaluates that table's policy per row, and is the shape that silently breaks under Realtime later. A direct column keeps every policy three lines and every table greppable for its owner. The invariant the services owe in return: write the PARENT's `user_id`, never the caller's claim.

**Policies are only as good as the path.** Every user-scoped query must go through `createRlsClient(...).execute()`, which sets `app.user_id` / `app.user_role` and issues `SET LOCAL role authenticated` inside a transaction. The exported singleton `db` connects as the table owner and bypasses RLS entirely; it exists for the bridge itself and for system paths.

---

## 7. SUPABASE STORAGE BUCKETS

All three are **private**; a public bucket would be a URL anyone who has seen it could fetch forever. Declared, with their object policies, in `supabase/setup/03_storage_buckets.sql`.

| Bucket | Purpose | Public | Path convention | Limits |
|---|---|---|---|---|
| `avatars` | Account photo (official spec §9.8) | No | `avatars/{user_id}/{uuid}.{ext}` | ≤5 MB; jpeg/png/webp |
| `icons` | Custom habit icons (§3.3, §9.9) | No | `icons/{user_id}/{uuid}.{ext}` | ≤5 MB; jpeg/png/webp |
| `exports` | Data-export bundles (§7.6) | No | `exports/{user_id}/{request_id}.zip` | ≤100 MB; json/zip |

**A stored path is bucket-qualified** — `icons/{user_id}/{uuid}.jpg` is what `habits.icon` and `user_avatars.storage_path` hold, so one string fully identifies an object. Supabase's own key is the same path without the bucket segment; `@syn/constants` owns that grammar (`buildAssetPath`, `parseAssetPath`, `toStorageKey`) and is the only place the two forms are converted.

**The owner segment is what authorization matches on.** The server builds every path from the session's user id — a client never names one.

**How objects move (SET-3).** Writes go to a signed upload URL minted by `asset.createUploadUrl` at a server-chosen path. Reads of icons and avatars go through the session-gated route `/api/assets/{bucket}/{user_id}/{file}`, which checks the session, compares the owner segment, and streams with the service role — a foreign path answers **404, never 403**, so a probe learns nothing. Exports are the exception: a 24-hour signed URL, because the download opens in the system browser with no session cookie.

**Object policies deny everything to `authenticated`, and they are `RESTRICTIVE`.** Neither rail uses the storage client with a person's JWT, so there is nothing legitimate to permit. Restrictive rather than permissive matters: permissive policies are OR'd, so a permissive "deny" would be silently overridden by the first grant someone adds later; restrictive policies are AND'd and hold regardless. The service role bypasses RLS, which is why both rails still work.

---

## 8. SEED DATA SHAPE

`yarn db:seed-users` creates a smoke-test account through `auth.admin.createUser`, which fires `handle_new_user()` and produces the shadow row. Its address is a `.test` domain on purpose: it cannot resolve, so a stray verification email goes nowhere.

`yarn db:seed` refuses to run with `NODE_ENV=production`, finds that account by email, and gives it a working library:

| Function | Writes | Idempotent by |
|---|---|---|
| `seedStarterLibrary` | 2 categories (*Health* leaf, *Deep work* sky) and the starter habits of Epic 1 FR-02 as amended, the physical ones in *Health*; sets `users.wake_anchor_habit_id` to the first | "already has habits → do nothing" |
| `seedDefaultReasons` | the 7 rows of official spec §3.10, `built_in`, with `structural` on `chose_not_to` and `other` | `ON CONFLICT (user_id, key) DO NOTHING` |
| `seedMorningTemplate` | one template *Morning* at 07:00 with the first five habits as `fixed_time` slots at offsets 0/2/10/30/60, durations at each range's midpoint, the wake-up slot `hard` | "already has a template → do nothing" |

Re-running the seed prints zeros across the board, which means idempotent rather than broken. **This is the only place the starter set is written as rows** — a real person gets the same `STARTER_HABITS` offered by SET-4's chooser and each one becomes a library entry only when they add it. The seed uses the singleton `db`, which bypasses RLS: correct for a system path with no session, and correct nowhere in the app.

---

## 9. SCHEMA DECISIONS LOG

- **`public.users` is a shadow, not a copy.** Its PK *is* the FK to `auth.users(id)`. One identity, two schemas, no join key to get wrong, and cascade deletion that actually removes everything.
- **The shadow row is written by a trigger, not by the app.** Signups go through Supabase Auth, often client-side, so there is no reliable server hook. The database guarantees the row exists before any FK needs it.
- **The whole of official spec §3 landed in one migration** (`0001`, SET-1), because §0.3 R4 says the schema is shaped for every phase from day one. Columns that Epic 2 and Epic 3 fill sit empty until then; that is cheaper than three one-way doors.
- **There is no wake anchor.** v1.0 kept `users.wake_anchor_habit_id` as the one home for "at most one per user"; UX v1.1 R11 retired the anchor habit (the orient frame is the wake moment) and `0006` dropped the column.
- **No `week_plans` table.** Official §3.6 lists one whose only content is a status derivable from the week's days. `WeekPlanStatus` is computed by the week read model.
- **No `shifts.cut_item_ids[]`.** A cut item is a `day_items` row with `assignment_state = cut_by_shift` plus a `misses` row pointing at the shift, so changing one attribution in the Day Review edits one row and the shift's own record stays untouched.
- **`days` snapshots `timezone` and `day_close_time`; `day_items` snapshots `title`, `icon`, `quantity_unit`, `reflection_axes` and `notes_preflight`.** A past day renders as it was lived even after the habit or the settings change.
- **Deferred settings use a pending pair on `users`.** A zone switch and a day-close change take effect from tomorrow, so writing them straight to the live column would reclassify "now" the moment they were saved.
- **`web_push_subscriptions.user_id` and `feedback_messages.user_id` are `ON DELETE set null`, not cascade.** A revoked endpoint stays reapable after the account is gone; a feedback message survives as anonymous. Every other table cascades, which is how account deletion removes everything by cascade alone.
- **`notification_prefs` and `avatar` (official spec §3.1) are satellite tables, not columns.** Both are lists rather than scalars.
- **The tier defaults to `local`.** Conscious Connections defaults to `production`; Synapse does not, because a shell with nothing set must not be able to reach the production database. See TECHNICAL-DECISIONS.

---

## 10. OPEN QUESTIONS & FLAGGED DECISIONS

- **29 tables is the whole Phase-1 model.** A later ticket that needs a column adds it as a normal migration with a logged deviation, not as a second domain migration by default.
- **`feedback_messages` readability is `[PROVISIONAL — Taylor]`.** The table is insert-only for its author and is read by the builder out of band. Confirm that is what you want; the row deliberately holds nothing from a person's list.
- **`day_items.calendar_event_id` is a Phase-2 seam.** The column exists so calendar import (official spec §4.7) is not a migration; nothing in Phase 1 writes it.
- **`template_slots.multitask_group` is enforced in the service, not the schema.** "Two slots sharing a start offset must share a group" cannot be a partial unique index, because the rule is *unless grouped*. SET-5 owns it, in the words TP-02 shows.
- **No Realtime publication.** Phase 2's offline/sync work decides whether any table is subscribed. If one is, its policies must use the dual-context helpers in `rls/helpers.ts` — a policy written against `app.user_id` alone denies every row to every subscriber, silently.
- **Storage object policies are not in this package.** The buckets are declared here; the object-level RLS lands with the first ticket that uploads a file (SET-3).
