# Synapse — Database Schema Reference

**Product:** Synapse — a private habit and day planner (Phase 1)
**Stack:** Turborepo · Next.js · TypeScript · DrizzleORM · PostgreSQL · Supabase
**Package:** `@syn/db` (`packages/db`)
**Status:** Generated reference synced to `packages/db/src/schema/`. The Drizzle code in §4 is injected verbatim from the `.ts` files.

> **Conventions (enforced everywhere):** UUID PKs via `defaultRandom()`; `created_at` + `updated_at` TIMESTAMPTZ on every table; snake_case columns; snake_case plural tables; `pgEnum` for status/type/state; explicit FKs with `onDelete`; `auth.users` is the auth source (never store passwords). Every user-data table is **owner-private**: the person is the only reader and the only writer, and there is no admin-read policy anywhere in this schema.

---

## 1. ENTITY OVERVIEW

**16 tables** in `public`, plus a reference-only mirror of Supabase's `auth.users`. Grouped by domain.

**Group 1 — Auth & Users.** `users` is the shadow of `auth.users` — its primary key **is** the foreign key, and the row is created by the `handle_new_user()` trigger, never by the app. It carries every account scalar: timezone, day-close and review-reminder times, theme, display name, the usual wake time, the week-build reminder's day and time, the first-run resume point, the deferred-settings pending pair, and `wake_anchor_habit_id`. `user_avatars` is the optional photo, keyed by `user_id` — one per person, no surrogate id. Deleting the auth user cascades through this row to everything.

**Group 2 — Library.** What a person keeps, independent of any day. `habits` is the reusable definition (type, title, icon, the duration range, the 1–7 life priority, the quantity unit, the reflection axes); `categories` group them for reporting only, never for a mechanic; `reasons` is the per-person, editable set a miss is attributed from, seeded from `DEFAULT_REASONS`. Habits, templates and reasons archive; only a category is deleted, and it unassigns.

**Group 3 — Plan.** `templates` is a named day plan whose `template_slots` sit at **offsets** from an anchor, which is what lets one template be applied at 06:00 or 08:00 and what makes shift-forward cheap. `days` is one calendar date in the person's stored zone; it snapshots `timezone` and `day_close_time` so a later settings change cannot re-key or re-window a past day.

**Group 4 — Day.** The record, and the part of the schema that is deliberately append-and-annotate. `day_items` snapshots `title`, `icon`, `quantity_unit`, `reflection_axes` and `notes_preflight` at materialisation; `original_scheduled_start` is immutable once set, enforced by a trigger. `timer_sessions` record time (a manual entry is marked as one), `misses` record how one undone item was attributed, `shifts` record a whole-day move.

**Group 5 — Notifications.** `web_push_subscriptions` holds one row per browser that agreed to reminders (endpoint + p256dh + auth, plus platform and revocation); the scheduler reads it. `notification_prefs` holds one row per kind the person has an opinion about — a missing row means the §8.2 default.

**Group 6 — System.** `data_exports` tracks a request to export everything (preparing → ready → expired, with the object path and a 24-hour expiry). `feedback_messages` is the About message: insert-only for its author, no authenticated read, and it holds only the message plus the two optional context fields the switch controls.

**Deliberately not here** (official spec §3.11): no streak, no score cache — the number is computed on read — no social graph, and no coach output table. There is also no `week_plans` table: a week's status is derived from its days. And no `habits.is_wake_anchor`: "at most one per user" is a fact about the person, so `users.wake_anchor_habit_id` is its one home.

---

## 2. ENTITY RELATIONSHIP SUMMARY

**The one central entity.** `users`. Synapse is single-player: there is no couple, no team, no shared row. **Every table hangs directly off this one** and carries its own denormalised `user_id`, so every policy is the same three lines and every table is greppable for its owner — no policy ever subqueries another RLS-guarded table.

**One-to-many from `users`.** `categories`, `habits`, `reasons`, `templates`, `template_slots`, `days`, `day_items`, `timer_sessions`, `shifts`, `misses`, `notification_prefs`, `web_push_subscriptions`, `data_exports`, `feedback_messages`. **One-to-one:** `user_avatars`.

**The ownership chains** (each child also carries `user_id` directly): `categories` → `habits` → `template_slots` → `day_items`; `templates` → `template_slots` and `templates` → `days` → `day_items` → { `timer_sessions`, `misses` }; `days` → `shifts` → `misses`.

**Two references that are not ownership.** `users.wake_anchor_habit_id` → `habits` (the anchor's one home, `set null`), and `day_items.carried_from_item_id` / `misses.traded_up_item_id` → `day_items` (both `set null` — a record points at another record without owning it).

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
 * tuple in `enumValues<Union>()` makes two mistakes compile errors: a value
 * that is not in the union (a typo), and a union member that is missing from
 * the tuple (an omission — the return type collapses to a labelled tuple that
 * `pgEnum` refuses). The generated SQL is unchanged; the call is an identity at
 * runtime.
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
  CategoryKey,
  ItemType,
  MissTier,
  Scheduling,
  TimeMode,
} from "@syn/types";

import { enumValues } from "./enum-values";

/** Habit.type / DayItem.type — official spec §3.3. `habits`, `day_items`. */
export const itemTypeEnum = pgEnum(
  "item_type",
  enumValues<ItemType>()(["habit", "task_appointment", "deep_work"]),
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
 * Only `categories` stores it as a column, but it is the same closed set an
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
  CategoryKey,
  ItemType,
  MissTier,
  Scheduling,
  TimeMode,
} from "@syn/types";

import { enumValues } from "./enum-values";

/** Habit.type / DayItem.type — official spec §3.3. `habits`, `day_items`. */
export const itemTypeEnum = pgEnum(
  "item_type",
  enumValues<ItemType>()(["habit", "task_appointment", "deep_work"]),
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
 * Only `categories` stores it as a column, but it is the same closed set an
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
 * THE WAKE ANCHOR HAS ONE HOME (SET-1). `wake_anchor_habit_id` gained its
 * foreign key here, as INF-5 promised. Official §3.3 also lists
 * `habits.is_wake_anchor` "at most one per user"; that column does not exist,
 * because "at most one" is a fact about the person and this column enforces it
 * structurally. `HabitSummaryView.isWakeAnchor` is derived in the view mapper.
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
 * POLICIES. Select and update are the owner's alone. Insert and delete are
 * denied to the authenticated role outright: the trigger inserts, and deletion
 * goes through `auth.admin.deleteUser` and cascades. There is no admin read.
 */
import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  check,
  date,
  index,
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

import { authUsers } from "../auth";
import { categories } from "../library/categories";
import { habits } from "../library/habits";
import { reasons } from "../library/reasons";
import { notificationPrefs } from "../notification/notification-prefs";
import { webPushSubscriptions } from "../notification/web-push-subscriptions";
import { days } from "../plan/days";
import { templates } from "../plan/templates";
import { denyAuthenticated, isOwner } from "../rls/helpers";
import { userAvatars } from "./user-avatars";

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

    // A day opens at this wall-clock time and closes at the next one (§6.1).
    dayCloseTime: time("day_close_time").notNull().default("03:00"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    // What the app calls you. 1–40 (Epic 1 §9).
    displayName: text("display_name"),
    // Mirrored from auth.users by handle_user_email_sync().
    email: text("email"),
    // Which first-run step to resume at; null once first run is done.
    firstRunStep: smallint("first_run_step"),
    firstRunCompletedAt: timestamp("first_run_completed_at", {
      withTimezone: true,
    }),
    // The pending pair — see the header. `*_from` is the day key the new value
    // takes effect on; a reader applies it once the person's current day key is
    // at or past that date, then clears both.
    pendingDayCloseTime: time("pending_day_close_time"),
    pendingDayCloseTimeFrom: date("pending_day_close_time_from"),
    pendingTimezone: text("pending_timezone"),
    pendingTimezoneFrom: date("pending_timezone_from"),
    // "*Not now* is remembered" (official spec §8.3, Epic 1 §8.7) — the app
    // never re-prompts for notification permission on its own after this.
    reminderPromptAnsweredAt: timestamp("reminder_prompt_answered_at", {
      withTimezone: true,
    }),
    // The review reminder's time (§8.2 N4). Default 21:00.
    reviewReminderTime: time("review_reminder_time").notNull().default("21:00"),
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

    // At most one per person, enforced by there being one column (SET-1).
    // `set null` because archiving or deleting the habit must not orphan the
    // reference — the person simply has no anchor until they pick another.
    //
    // The `: AnyPgColumn` annotation is required, not decorative: this column
    // closes a foreign-key cycle (users → habits → categories → users), and
    // without an explicit return type TypeScript cannot infer any of the three
    // table types and reports all of them as `any` (TS7022). Annotating this
    // one back-edge breaks the cycle for all three.
    wakeAnchorHabitId: uuid("wake_anchor_habit_id").references(
      (): AnyPgColumn => habits.id,
      { onDelete: "set null" },
    ),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_wake_anchor_habit_id_idx").on(table.wakeAnchorHabitId),
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

**PURPOSE.** users.ts — the shadow of `auth.users`. Supabase owns `auth.users`. This row is created by the `handle_new_user()` trigger, never by the app, and its primary key IS the foreign key to the auth row: one identity, two schemas, no drift. Deleting the auth user cascades this row away, which is how account deletion (Epic 1 ST-10a) removes everything a person has. WHAT IS NOT HERE. Official spec §3.1 also lists `notification_prefs` and `avatar`; both are satellite tables (`notification_prefs`, `user_avatars`), because both are lists rather than scalars. THE WAKE ANCHOR HAS ONE HOME (SET-1). `wake_anchor_habit_id` gained its foreign key here, as INF-5 promised. Official §3.3 also lists `habits.is_wake_anchor` "at most one per user"; that column does not exist, because "at most one" is a fact about the person and this column enforces it structurally. `HabitSummaryView.isWakeAnchor` is derived in the view mapper. THE PENDING PAIR (SET-1). A time-zone switch and a day-close change take effect FROM TOMORROW (cross-cutting §7.3, §7.5), so writing them straight to `timezone` / `day_close_time` would reclassify "now" the moment they were saved — change the close from 03:00 to 05:00 at 04:00 and today's date flips backwards. The four `pending_*` columns hold the new value and the date it starts; `services/user/preferences.ts` applies and clears the pair on read, and the scheduler's per-user pass does the same so the switch happens even if the app is never opened. POLICIES. Select and update are the owner's alone. Insert and delete are denied to the authenticated role outright: the trigger inserts, and deletion goes through `auth.admin.deleteUser` and cascades. There is no admin read.

**INDEXES.**
- `users_email_idx`
- `users_wake_anchor_habit_id_idx`

**RLS.** Owner read and update. Insert and delete are denied to the authenticated role outright: `handle_new_user()` inserts, and deletion cascades from `auth.admin.deleteUser`.

#### `user_avatars`

**PURPOSE.** user_avatars — the optional account photo (official spec §3.1 `avatar`, §9.8). ONE PER PERSON, so `user_id` IS the primary key and there is no separate `id`. Replacing a photo replaces this row; removing it deletes the row and the `Avatar` primitive falls back to initials, which is the default state rather than an error state. The bytes live in the private `avatars` bucket; `storage_path` is the object key (`avatars/{user_id}/{uuid}.jpg`). SET-3 mints the signed upload and serves reads through its session-gated streaming route — the path alone is worthless without a cookie. No status dots, rings, or presence (official spec §9.8): Synapse is single-player and there is no one to be present to. POLICIES: owner-private CRUD.

**INDEXES.** *(see source)*

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

### GROUP 2 — LIBRARY

What a person keeps: the habits they might do, the categories those group into, and the reasons a miss can be attributed to. Nothing here is ever hard-deleted except a category, which unassigns.

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
 * NO `is_wake_anchor` COLUMN. Official §3.3 lists one, but "at most one per
 * user" is a fact about the person: `users.wake_anchor_habit_id` is the single
 * home and `HabitSummaryView.isWakeAnchor` is derived in the view mapper. See
 * the Epic 1 TECHNICAL-DECISIONS entry.
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

import type { IconValue } from "@syn/types";

import { itemTypeEnum } from "../enums";
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
    type: itemTypeEnum("type").notNull(),

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
    check(
      "habits_life_priority_check",
      sql`${table.lifePriority} BETWEEN 1 AND 7`,
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
```

#### `categories`

**PURPOSE.** categories — free-defined groupings a habit may belong to (official spec §3.2). Used for time-distribution reporting only, never for any mechanic: a category never changes what an item is worth, when it runs, or how a miss resolves. A habit has at most one. DELETING A CATEGORY UNASSIGNS (Epic 1 CT-01, cross-cutting §8.1) — it is one of the four things in the product that is deleted rather than archived, and `habits.category_id` is `ON DELETE set null` so the habits survive it. Past reports keep the name they were run under because they read the day's rows, not this table. POLICIES: owner-private CRUD.

**INDEXES.**
- `categories_user_id_name_idx`
- `categories_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `habits`

**PURPOSE.** habits — the library entry (official spec §3.3). The reusable definition. It never appears on a day directly; it is slotted into a template (`template_slots`) or placed as a one-off, and what lands on the day is a `day_items` row that SNAPSHOTS this row's title, icon, quantity unit, reflection axes and preflight note. Editing a habit therefore never rewrites the past (cross-cutting §8.1) — and SET-4's re-snapshot rule rewrites only untouched future items, never a started, done, reviewed, or past one. NEVER HARD-DELETED. `archived_at` is the only exit; `template_slots` cascade from here only because a hard delete cannot happen through the app, and archiving removes slots through LB-01's service instead. NO `is_wake_anchor` COLUMN. Official §3.3 lists one, but "at most one per user" is a fact about the person: `users.wake_anchor_habit_id` is the single home and `HabitSummaryView.isWakeAnchor` is derived in the view mapper. See the Epic 1 TECHNICAL-DECISIONS entry. POLICIES: owner-private CRUD.

**INDEXES.**
- `habits_user_id_archived_at_idx`
- `habits_category_id_idx`
- `habits_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `reasons`

**PURPOSE.** reasons — the per-person, editable reason set (official spec §3.10). When something is missed, the person picks a reason and the reason's tier decides how it counts (§7.3). The seven defaults are data in `@syn/constants` (`DEFAULT_REASONS`), which the dev seed and SET-9's lazy per-user seeding both read — never a trigger, so a person's set is theirs to rename, re-tier and archive from the moment it exists. `key` IS WHAT A MISS STORES. `misses.reason_key` and `shifts.reason_key` are text, not foreign keys, so archiving or renaming a reason later never rewrites a record that was made under the old one (cross-cutting §8.1). `structural` marks the two rows whose tier is locked and which can never be archived — *Didn't do it* and *Other* (Epic 1 ST-06). Everything else about a built-in is editable, including its label. POLICIES: owner-private CRUD.

**INDEXES.**
- `reasons_user_id_key_idx`
- `reasons_user_id_archived_at_idx`
- `reasons_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

### GROUP 3 — PLAN

The shapes a day can take. A template holds slots at offsets from its anchor; a day is one date in the person's stored zone, snapshotting the time rules it was created under. There is no `week_plans` table — week status is derived from the week's days.

```ts
// packages/db/src/schema/plan/templates.ts
/**
 * templates — a named day plan (official spec §3.4, the former Variant).
 *
 * Built in planning mode and applied to days during the week build. A template
 * holds slots at OFFSETS from its anchor, never at absolute times, which is
 * what lets the same template be applied at 06:00 or 08:00 without editing a
 * slot — and what makes shift-forward cheap.
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
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
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

    /** The time this template's 00:00 offset maps to when applied (§3.4). */
    anchorTime: time("anchor_time").notNull().default("07:00"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** 1–40 — Epic 1 §9. */
    name: text("name").notNull(),
    /**
     * A hint shown during the week build, nothing more (§3.4). Mon = 0 … Sun =
     * 6, matching `TemplateSummaryView.typicalDays`.
     */
    typicalDays: smallint("typical_days").array(),
    /** 1–7, or null for *none* — shown as "used 1 of 2" during the week build. */
    weeklyTarget: smallint("weekly_target"),

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
 * template_slots — one habit's place in a template (official spec §3.5).
 *
 * Offsets are MINUTES FROM THE TEMPLATE ANCHOR, not times. `offset_start_min`
 * may be negative down to -120 (Epic 1 TP-02, "up to two hours before"), which
 * is how a template whose anchor is the wake time can still hold something
 * that happens before it.
 *
 * `multitask_group` IS NOT ENFORCED HERE. Official §3.5 says two slots sharing
 * a start offset must share a group or the template will not save. A partial
 * unique index cannot express "unless grouped", so SET-5's service owns that
 * rule — the one place it is stated, in the words TP-02 shows.
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
  check,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { schedulingEnum, timeModeEnum } from "../enums";
import { habits } from "../library/habits";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
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

    /** A specific value chosen from within the habit's range, in minutes. */
    durationMin: smallint("duration_min").notNull(),
    /** A local id within the template (§3.5) — see the note above. */
    multitaskGroup: text("multitask_group"),
    /** Windows only. */
    offsetEndMin: integer("offset_end_min"),
    /** Null when `unscheduled`; ≥ -120 (TP-02). */
    offsetStartMin: integer("offset_start_min"),
    /** 1–7. Per-template override of the habit's `life_priority` (§3.5). */
    priorityOverride: smallint("priority_override"),
    scheduling: schedulingEnum("scheduling").notNull(),
    /** Order within a shared start; otherwise time order. */
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
    check(
      "template_slots_duration_min_check",
      sql`${table.durationMin} BETWEEN 1 AND 480`,
    ),
    check(
      "template_slots_offset_start_min_check",
      sql`${table.offsetStartMin} IS NULL OR ${table.offsetStartMin} >= -120`,
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
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { DayCloseReason, WokeAtSource } from "@syn/types";

import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { templates } from "./templates";

/** One table uses it, so it lives here (drizzle-orm-conventions §3). */
export const dayCloseReasonEnum = pgEnum(
  "day_close_reason",
  enumValues<DayCloseReason>()(["manual", "auto"]),
);

/** Epic 2 DH-02: the wake time came from the anchor habit, or from a picker. */
export const wokeAtSourceEnum = pgEnum(
  "woke_at_source",
  enumValues<WokeAtSource>()(["anchor", "manual"]),
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

    /** The applied start — the template's anchor, overridable per day (§3.6). */
    anchorTime: time("anchor_time").notNull(),
    /** 5–1440. Set only by a capacity trim (§3.6, §5.8). */
    capacityMin: smallint("capacity_min"),
    closeReason: dayCloseReasonEnum("close_reason"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    /** The day key, in `timezone`. Unique per person. */
    date: date("date").notNull(),
    /** Snapshot of the rule this day was created under (cross-cutting §7.1). */
    dayCloseTime: time("day_close_time").notNull(),
    /** Stamped when a closed day's record is edited (cross-cutting §8.1). */
    reviewEditedAt: timestamp("review_edited_at", { withTimezone: true }),
    /** Set by *Finish review* — the day has a number (Epic 3 DR-01). */
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    /** Snapshot of `users.timezone` at creation. */
    timezone: text("timezone").notNull(),
    /** Set by the wake-anchor habit or by hand (official spec §0.3 R5). */
    wokeAt: timestamp("woke_at", { withTimezone: true }),
    wokeAtSource: wokeAtSourceEnum("woke_at_source"),

    templateId: uuid("template_id").references(() => templates.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("days_user_id_date_idx").on(table.userId, table.date),
    index("days_user_id_closed_at_idx").on(table.userId, table.closedAt),
    index("days_template_id_idx").on(table.templateId),
    index("days_user_id_idx").on(table.userId),
    check(
      "days_capacity_min_check",
      sql`${table.capacityMin} IS NULL OR ${table.capacityMin} BETWEEN 5 AND 1440`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "days",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const daysRelations = relations(days, ({ one }) => ({
  template: one(templates, {
    fields: [days.templateId],
    references: [templates.id],
  }),
  user: one(users, {
    fields: [days.userId],
    references: [users.id],
  }),
}));
```

#### `templates`

**PURPOSE.** templates — a named day plan (official spec §3.4, the former Variant). Built in planning mode and applied to days during the week build. A template holds slots at OFFSETS from its anchor, never at absolute times, which is what lets the same template be applied at 06:00 or 08:00 without editing a slot — and what makes shift-forward cheap. `weekly_target` IS NULL FOR *none*, NEVER 0 (Epic 1 TP-02). The form's stepper shows 0 as *none*; the column stores the absence. ARCHIVE, NEVER DELETE. An archived template's name still appears in the header of every past day it built (cross-cutting §8.3). POLICIES: owner-private CRUD.

**INDEXES.**
- `templates_user_id_archived_at_idx`
- `templates_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `template_slots`

**PURPOSE.** template_slots — one habit's place in a template (official spec §3.5). Offsets are MINUTES FROM THE TEMPLATE ANCHOR, not times. `offset_start_min` may be negative down to -120 (Epic 1 TP-02, "up to two hours before"), which is how a template whose anchor is the wake time can still hold something that happens before it. `multitask_group` IS NOT ENFORCED HERE. Official §3.5 says two slots sharing a start offset must share a group or the template will not save. A partial unique index cannot express "unless grouped", so SET-5's service owns that rule — the one place it is stated, in the words TP-02 shows. `habit_id` CASCADES because a habit is never hard-deleted through the app; archiving a habit removes its slots through LB-01's service instead, which is a decision the person is shown before it happens. POLICIES: owner-private CRUD, on this table's own `user_id` — the service writes the template's owner, never the caller's claim.

**INDEXES.**
- `template_slots_template_id_sort_order_idx`
- `template_slots_habit_id_idx`
- `template_slots_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `days`

**PURPOSE.** days — one calendar date in the person's stored zone (official spec §3.6). A Day is keyed by `date` in the person's STORED zone and runs from `day_close_time` to the next `day_close_time` (cross-cutting §7.1). A day with no template is an empty day, which is how a vacation works — nothing is missed on an unplanned day. IT SNAPSHOTS ITS OWN TIME RULES. `timezone` and `day_close_time` are copied from `users` when the day is created and never follow a later settings change. Without them, moving zones or shifting the close time would silently re-key and re-window every past day, and "moved" would stop meaning anything (cross-cutting §7.3, §7.5, §8). The pending-pair on `users` is what defers a change to tomorrow; these two columns are what keep yesterday honest. NO `week_plans` TABLE. Official §3.6 lists one; its only content is a status derivable from the week's days, so `WeekPlanStatus` is computed by the week read model. See the Epic 1 TECHNICAL-DECISIONS entry. POLICIES: owner-private CRUD.

**INDEXES.**
- `days_user_id_date_idx`
- `days_user_id_closed_at_idx`
- `days_template_id_idx`
- `days_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

### GROUP 4 — DAY

The record. `day_items` is the row the execution tabs render, snapshotting its habit's title, icon, unit, axes and preflight note so a past day reads as it was lived. Timer sessions, misses and shifts are what happened to it.

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
 * POLICIES: owner-private CRUD, on this table's own `user_id` — the service
 * writes the day's owner, never the caller's claim.
 */
import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
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

/** §3.7. */
export const completionStateEnum = pgEnum(
  "completion_state",
  enumValues<CompletionState>()([
    "upcoming",
    "active",
    "done",
    "missed",
    "carried",
    "pending_review",
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
    /** JSON shape: IconValue — see @syn/types. Snapshot of the habit's icon. */
    icon: jsonb("icon").$type<IconValue>().notNull(),
    /** One id per multitask group per day; assigned at materialisation (§5.5). */
    multitaskId: uuid("multitask_id"),
    /** Snapshot of the habit's `default_notes_preflight`. */
    notesPreflight: text("notes_preflight"),
    /** ≤ 500 — Epic 2 IT-01. */
    notesReflection: text("notes_reflection"),
    origin: itemOriginEnum("origin").notNull(),
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
    /** Snapshot of the habit's title, or the typed title of a *Just a title*. */
    title: text("title").notNull(),
    /** Snapshot; `task_appointment` for a bare title. */
    type: itemTypeEnum("type").notNull(),

    /** Set when `origin = carried` — the item this one came forward from. */
    carriedFromItemId: uuid("carried_from_item_id").references(
      (): AnyPgColumn => dayItems.id,
      { onDelete: "set null" },
    ),
    dayId: uuid("day_id")
      .notNull()
      .references(() => days.id, { onDelete: "cascade" }),
    /** Null for a *Just a title* one-off, which has no library entry. */
    habitId: uuid("habit_id").references(() => habits.id, {
      onDelete: "set null",
    }),
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
    check("day_items_priority_check", sql`${table.priority} BETWEEN 1 AND 7`),
    check(
      "day_items_duration_min_check",
      sql`${table.durationMin} IS NULL OR ${table.durationMin} BETWEEN 1 AND 480`,
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
  habit: one(habits, {
    fields: [dayItems.habitId],
    references: [habits.id],
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
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { missTierEnum } from "../enums";
import { days } from "../plan/days";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

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
    /** 5–600 minutes (§5.6). */
    deltaMin: smallint("delta_min").notNull(),
    /** A `reasons.key` — text, so an archived reason keeps this record honest. */
    reasonKey: text("reason_key"),
    /** ≤ 80, behind *Other*. */
    reasonText: text("reason_text"),
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
    check("shifts_delta_min_check", sql`${table.deltaMin} BETWEEN 5 AND 600`),
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
```

#### `day_items`

**PURPOSE.** day_items — the instance (official spec §3.7). The row the two execution tabs render. Materialised from a template slot when the week is built, or created as a one-off. THIS ROW IS THE RECORD. `title`, `icon`, `quantity_unit`, `reflection_axes` and `notes_preflight` are snapshots taken at materialisation, so a past day renders as it was lived even after the habit is renamed, re-iconed or archived (cross-cutting §8.1, §8.3). `original_scheduled_start` NEVER CHANGES after materialisation — the ghost renders here (§3.7). That promise is enforced by a database trigger (`day_items_original_start_immutable`, in `supabase/setup/`), not by the service, for the same reason `handle_new_user` is a trigger: the database guarantees what the app must never do. `scheduled_start` is the one that moves, on a shift or a late start. OFF-SCHEDULE IS DERIVED, NEVER STORED (§3.7, §6.3): it is `done_at` outside `original_scheduled_start .. scheduled_end`, computed on read. A ONE-OFF IS THE ONLY DELETABLE ITEM (cross-cutting §8.4). Everything else on a day is annotated. POLICIES: owner-private CRUD, on this table's own `user_id` — the service writes the day's owner, never the caller's claim.

**INDEXES.**
- `day_items_day_id_scheduled_start_idx`
- `day_items_user_id_completion_state_idx`
- `day_items_habit_id_idx`
- `day_items_template_slot_id_idx`
- `day_items_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `timer_sessions`

**PURPOSE.** timer_sessions — one run of the timer on one item (official spec §3.7, §5.4). `ended_at` is null while the timer is running, which is how "is anything running" is answered without a second source of truth. A session the person typed rather than timed is marked `source: manual` (cross-cutting §8.1), so the record always says which it was. A TIMER SESSION IS DELETABLE (cross-cutting §8.4) — one of exactly four things in the product that are. Undoing *done* keeps its sessions. POLICIES: owner-private CRUD.

**INDEXES.**
- `timer_sessions_day_item_id_started_at_idx`
- `timer_sessions_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

#### `shifts`

**PURPOSE.** shifts — one "shift my day forward" event (official spec §3.9, §5.6). One row per shift, so the Day Review can say "shifted 60 min at 8:10 — slept in". A shift is undoable for ten minutes (cross-cutting §8.1); after that it is a fact, and the only way past it is another shift, which is also recorded. NO `cut_item_ids[]` COLUMN. Official §3.9 lists one; a cut item is instead a `day_items` row with `assignment_state = cut_by_shift` and a `misses` row whose `shift_id` points here. Normalised, so the Day Review's *Change* on a cut item edits one row and this shift's own record stays untouched (Epic 3 DR-05). See the Epic 1 DEVIATIONS line. `reason_key` is text rather than a foreign key for the same reason it is on `misses`: an archived or renamed reason must never rewrite a past record. POLICIES: owner-private CRUD.

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
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { NotificationKind } from "@syn/types";

import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

/** The nine rows of official spec §8.2, N1…N9 in order. */
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

    enabled: boolean("enabled").notNull(),
    kind: notificationKindEnum("kind").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("notification_prefs_user_id_kind_idx").on(
      table.userId,
      table.kind,
    ),
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
- `notification_prefs_user_id_kind_idx`
- `notification_prefs_user_id_idx`

**RLS.** Owner-private CRUD (`ownerPrivateCrudPolicies`) — the person is the only reader and the only writer. See the inline declarations in the source above.

### GROUP 6 — SYSTEM

Bookkeeping a person creates but does not browse: a request to export everything, and a message sent from About. `feedback_messages` is the one table in this schema that is not owner-private — insert-only for its author, readable by nobody through the app.

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
- **Service-role only:** reserved for system bookkeeping (`serviceRoleOnlyPolicies`). Nothing uses it yet.
- **Read-only catalogue:** reserved for tables the product ships rather than a person writes (`catalogReadPolicies`). Nothing uses it yet.

**Every table carries its own `user_id`, denormalised.** `template_slots`, `day_items`, `timer_sessions` and `misses` could each derive an owner through a parent, and none of them does: a policy that subqueries another RLS-guarded table re-evaluates that table's policy per row, and is the shape that silently breaks under Realtime later. A direct column keeps every policy three lines and every table greppable for its owner. The invariant the services owe in return: write the PARENT's `user_id`, never the caller's claim.

**Policies are only as good as the path.** Every user-scoped query must go through `createRlsClient(...).execute()`, which sets `app.user_id` / `app.user_role` and issues `SET LOCAL role authenticated` inside a transaction. The exported singleton `db` connects as the table owner and bypasses RLS entirely; it exists for the bridge itself and for system paths.

---

## 7. SUPABASE STORAGE BUCKETS

All three are **private**. Objects are served through signed URLs; a public bucket would be a URL anyone could guess their way into.

| Bucket | Purpose | Public | Path convention | Limits |
|---|---|---|---|---|
| `avatars` | Account photo (official spec §9.8) | No | `avatars/{user_id}/{uuid}.{ext}` | ≤5 MB; jpeg/png/webp |
| `icons` | Custom habit icons (§3.3, §9.9) | No | `icons/{user_id}/{uuid}.{ext}` | ≤5 MB; jpeg/png/webp |
| `exports` | Data-export bundles (§7.6) | No | `exports/{user_id}/{request_id}.zip` | ≤100 MB; json/zip |

The first path segment is the owner id, which is what the storage RLS policies match on.

---

## 8. SEED DATA SHAPE

`yarn db:seed-users` creates a smoke-test account through `auth.admin.createUser`, which fires `handle_new_user()` and produces the shadow row. Its address is a `.test` domain on purpose: it cannot resolve, so a stray verification email goes nowhere.

`yarn db:seed` refuses to run with `NODE_ENV=production`, finds that account by email, and gives it a working library:

| Function | Writes | Idempotent by |
|---|---|---|
| `seedStarterLibrary` | 2 categories (*Health* leaf, *Deep work* sky) and the 10 habits of Epic 1 FR-02, the first four in *Health*; sets `users.wake_anchor_habit_id` to the first | "already has habits → do nothing" |
| `seedDefaultReasons` | the 7 rows of official spec §3.10, `built_in`, with `structural` on `chose_not_to` and `other` | `ON CONFLICT (user_id, key) DO NOTHING` |
| `seedMorningTemplate` | one template *Morning* at 07:00 with the first five habits as `fixed_time` slots at offsets 0/2/10/30/60, durations at each range's midpoint, the wake-up slot `hard` | "already has a template → do nothing" |

Re-running the seed prints zeros across the board, which means idempotent rather than broken. **This is the only place the starter set is written as rows** — a real person gets the same `STARTER_HABITS` offered by SET-4's chooser and each one becomes a library entry only when they add it. The seed uses the singleton `db`, which bypasses RLS: correct for a system path with no session, and correct nowhere in the app.

---

## 9. SCHEMA DECISIONS LOG

- **`public.users` is a shadow, not a copy.** Its PK *is* the FK to `auth.users(id)`. One identity, two schemas, no join key to get wrong, and cascade deletion that actually removes everything.
- **The shadow row is written by a trigger, not by the app.** Signups go through Supabase Auth, often client-side, so there is no reliable server hook. The database guarantees the row exists before any FK needs it.
- **The whole of official spec §3 landed in one migration** (`0001`, SET-1), because §0.3 R4 says the schema is shaped for every phase from day one. Columns that Epic 2 and Epic 3 fill sit empty until then; that is cheaper than three one-way doors.
- **`wake_anchor_habit_id` is the wake anchor's one home,** with `REFERENCES habits(id) ON DELETE SET NULL`. Official §3.3's `habits.is_wake_anchor` is not a column: "at most one per user" is a fact about the person, and one column enforces it structurally where two would need syncing.
- **No `week_plans` table.** Official §3.6 lists one whose only content is a status derivable from the week's days. `WeekPlanStatus` is computed by the week read model.
- **No `shifts.cut_item_ids[]`.** A cut item is a `day_items` row with `assignment_state = cut_by_shift` plus a `misses` row pointing at the shift, so changing one attribution in the Day Review edits one row and the shift's own record stays untouched.
- **`days` snapshots `timezone` and `day_close_time`; `day_items` snapshots `title`, `icon`, `quantity_unit`, `reflection_axes` and `notes_preflight`.** A past day renders as it was lived even after the habit or the settings change.
- **Deferred settings use a pending pair on `users`.** A zone switch and a day-close change take effect from tomorrow, so writing them straight to the live column would reclassify "now" the moment they were saved.
- **`web_push_subscriptions.user_id` and `feedback_messages.user_id` are `ON DELETE set null`, not cascade.** A revoked endpoint stays reapable after the account is gone; a feedback message survives as anonymous. Every other table cascades, which is how account deletion removes everything by cascade alone.
- **`notification_prefs` and `avatar` (official spec §3.1) are satellite tables, not columns.** Both are lists rather than scalars.
- **The tier defaults to `local`.** Conscious Connections defaults to `production`; Synapse does not, because a shell with nothing set must not be able to reach the production database. See TECHNICAL-DECISIONS.

---

## 10. OPEN QUESTIONS & FLAGGED DECISIONS

- **16 tables is the whole Phase-1 model.** A later ticket that needs a column adds it as a normal migration with a logged deviation, not as a second domain migration by default.
- **`feedback_messages` readability is `[PROVISIONAL — Taylor]`.** The table is insert-only for its author and is read by the builder out of band. Confirm that is what you want; the row deliberately holds nothing from a person's list.
- **`day_items.calendar_event_id` is a Phase-2 seam.** The column exists so calendar import (official spec §4.7) is not a migration; nothing in Phase 1 writes it.
- **`template_slots.multitask_group` is enforced in the service, not the schema.** "Two slots sharing a start offset must share a group" cannot be a partial unique index, because the rule is *unless grouped*. SET-5 owns it, in the words TP-02 shows.
- **No Realtime publication.** Phase 2's offline/sync work decides whether any table is subscribed. If one is, its policies must use the dual-context helpers in `rls/helpers.ts` — a policy written against `app.user_id` alone denies every row to every subscriber, silently.
- **Storage object policies are not in this package.** The buckets are declared here; the object-level RLS lands with the first ticket that uploads a file (SET-3).
