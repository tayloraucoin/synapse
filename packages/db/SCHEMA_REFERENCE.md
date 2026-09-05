# Synapse — Database Schema Reference

**Product:** Synapse — a private habit and day planner (Phase 1)
**Stack:** Turborepo · Next.js · TypeScript · DrizzleORM · PostgreSQL · Supabase
**Package:** `@syn/db` (`packages/db`)
**Status:** Generated reference synced to `packages/db/src/schema/`. The Drizzle code in §4 is injected verbatim from the `.ts` files.

> **Conventions (enforced everywhere):** UUID PKs via `defaultRandom()`; `created_at` + `updated_at` TIMESTAMPTZ on every table; snake_case columns; snake_case plural tables; `pgEnum` for status/type/state; explicit FKs with `onDelete`; `auth.users` is the auth source (never store passwords). Every user-data table is **owner-private**: the person is the only reader and the only writer, and there is no admin-read policy anywhere in this schema.

---

## 1. ENTITY OVERVIEW

**2 tables** in `public`, plus a reference-only mirror of Supabase's `auth.users`. Grouped by domain.

**Group 1 — Auth & Users.** `users` is the shadow of `auth.users` — its primary key **is** the foreign key, and the row is created by the `handle_new_user()` trigger, never by the app. It carries the Phase-1 account scalars: timezone, day-close and review-reminder times, theme, display name, the first-run resume point, and `wake_anchor_habit_id` (no FK yet — `habits` does not exist). Deleting the auth user cascades this row away, which is how account deletion removes everything.

**Group 2 — Notifications.** `web_push_subscriptions` holds one row per browser that agreed to reminders (endpoint + p256dh + auth, plus platform and revocation). The scheduler reads it; the owner is the only person who can read or revoke it.

**Not here yet.** Every domain table — habits, categories, templates, template slots, week plans, days, day items, misses, shifts, reasons, timer sessions — belongs to the feature epics' tech spec and is built on the patterns in `src/schema/rls/`.

---

## 2. ENTITY RELATIONSHIP SUMMARY

**The one central entity.** `users`. Synapse is single-player: there is no couple, no team, no shared row. Every table the feature epics add will hang off this one, and every one of them will be owner-private.

**One-to-many.** `users` → `web_push_subscriptions`.

**Identity.** `public.users.id` = `auth.users.id`. One identity, two schemas, no drift, no join key to get wrong.

**Deletion.** `auth.admin.deleteUser` → cascade through `public.users` → everything. `web_push_subscriptions.user_id` is `ON DELETE set null` rather than cascade, so a revoked endpoint can still be reaped by endpoint after the account is gone.

```
                       auth.users            (Supabase Auth owns this)
                            │  handle_new_user() trigger
                            ▼
                       public.users
                            │
                            └──< web_push_subscriptions
```

---

## 3. ENUMS

- **User:** `theme_preference`.
- **Notifications:** `device_platform`.

Colocation rule (drizzle-orm-conventions §4): an enum used by one table lives in that table's file; by two tables in one directory, in that directory's `enums.ts`; by two directories, in the root `enums.ts`. Both enums below are one-table, so both live beside their table.

The domain enums the feature epics add (item type, time mode, scheduling, assignment state, completion state, miss tier, item origin) must keep the spelling of the schema unions in `@syn/types` — that is what stops a value read from a row and a value chosen by a component from drifting apart.

```ts
// packages/db/src/schema/enums.ts
/**
 * Root enums — pgEnum types shared across 2+ schema directories.
 *
 * Colocation rule (drizzle-orm-conventions §4):
 * - One table only → define in that table's file.
 * - 2+ tables in one directory → that directory's `enums.ts`.
 * - 2+ directories → this file.
 *
 * Empty on purpose. Nothing in the foundation is shared across directories
 * yet; the feature epics' first migration adds the domain enums (item type,
 * time mode, scheduling, assignment state, completion state, miss tier, item
 * origin) with the same spelling as `@syn/types`' schema unions.
 */

export {};

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
 * `avatar`; both are satellite tables the feature epics define, because both
 * are lists rather than scalars. `wake_anchor_habit_id` is here as a bare uuid
 * with NO foreign key — `habits` does not exist yet, and the feature tech
 * spec's first migration adds `REFERENCES habits(id) ON DELETE SET NULL`.
 *
 * POLICIES. Select and update are the owner's alone. Insert and delete are
 * denied to the authenticated role outright: the trigger inserts, and deletion
 * goes through `auth.admin.deleteUser` and cascades. There is no admin read.
 */
import { relations, sql } from "drizzle-orm";
import {
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
import { webPushSubscriptions } from "../notification/web-push-subscriptions";
import { denyAuthenticated, isOwner } from "../rls/helpers";

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
    // The review reminder's time (§8.2 N4). Default 21:00.
    reviewReminderTime: time("review_reminder_time").notNull().default("21:00"),
    theme: themePreferenceEnum("theme").notNull().default("system"),
    // The zone the person's days are stored and rendered in (cross-cutting
    // §7.3) — not the viewer's device zone. Defaults from the device at first
    // run; 'UTC' is only the value before that happens.
    timezone: text("timezone").notNull().default("UTC"),
    // No FK yet: `habits` does not exist. The feature tech spec's first
    // migration adds REFERENCES habits(id) ON DELETE SET NULL.
    wakeAnchorHabitId: uuid("wake_anchor_habit_id"),
  },
  (table) => [
    index("users_email_idx").on(table.email),
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

export const usersRelations = relations(users, ({ many }) => ({
  webPushSubscriptions: many(webPushSubscriptions),
}));

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
```

---

## 4. SCHEMA — TABLE BY TABLE

Each group shows the **complete Drizzle source** (tables, relations, indexes, and inline RLS policies — injected from the `.ts` files) followed by per-table PURPOSE / INDEXES / RLS prose.

### GROUP 1 — AUTH & USERS

The shadow `users` table mirrors `auth.users` (Supabase Auth is the source of truth for identity). Its row is created by the `handle_new_user()` trigger, never by the app.

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
 * Colocation rule (drizzle-orm-conventions §4):
 * - One table only → define in that table's file.
 * - 2+ tables in one directory → that directory's `enums.ts`.
 * - 2+ directories → this file.
 *
 * Empty on purpose. Nothing in the foundation is shared across directories
 * yet; the feature epics' first migration adds the domain enums (item type,
 * time mode, scheduling, assignment state, completion state, miss tier, item
 * origin) with the same spelling as `@syn/types`' schema unions.
 */

export {};

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
 * `avatar`; both are satellite tables the feature epics define, because both
 * are lists rather than scalars. `wake_anchor_habit_id` is here as a bare uuid
 * with NO foreign key — `habits` does not exist yet, and the feature tech
 * spec's first migration adds `REFERENCES habits(id) ON DELETE SET NULL`.
 *
 * POLICIES. Select and update are the owner's alone. Insert and delete are
 * denied to the authenticated role outright: the trigger inserts, and deletion
 * goes through `auth.admin.deleteUser` and cascades. There is no admin read.
 */
import { relations, sql } from "drizzle-orm";
import {
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
import { webPushSubscriptions } from "../notification/web-push-subscriptions";
import { denyAuthenticated, isOwner } from "../rls/helpers";

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
    // The review reminder's time (§8.2 N4). Default 21:00.
    reviewReminderTime: time("review_reminder_time").notNull().default("21:00"),
    theme: themePreferenceEnum("theme").notNull().default("system"),
    // The zone the person's days are stored and rendered in (cross-cutting
    // §7.3) — not the viewer's device zone. Defaults from the device at first
    // run; 'UTC' is only the value before that happens.
    timezone: text("timezone").notNull().default("UTC"),
    // No FK yet: `habits` does not exist. The feature tech spec's first
    // migration adds REFERENCES habits(id) ON DELETE SET NULL.
    wakeAnchorHabitId: uuid("wake_anchor_habit_id"),
  },
  (table) => [
    index("users_email_idx").on(table.email),
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

export const usersRelations = relations(users, ({ many }) => ({
  webPushSubscriptions: many(webPushSubscriptions),
}));
```

#### `auth.users`

**PURPOSE.** auth.ts — Reference-only mirror of Supabase's managed `auth` schema. WHY THIS EXISTS Supabase (GoTrue) owns the `auth` schema and the `auth.users` table. We must NOT let drizzle-kit create, alter, or drop anything in that schema, or it will collide with the Supabase-managed objects and corrupt auth. We declare a *minimal* mirror of `auth.users` purely so that `.references()` in our public tables resolve to a real Drizzle object and emit correct foreign keys. drizzle.config.ts pins `schemaFilter: ['public']`, so drizzle-kit reads this declaration for FK targets but never tries to migrate the `auth` schema. RULE: never add columns here beyond what we FK against (id). Never write to it from the app — user creation flows through Supabase Auth, and a Postgres trigger (`handle_new_user`, see supabase/setup) mirrors the row into public.users.

**INDEXES.** *(see source)*

**RLS.** See the inline `pgPolicy` / `ownerPrivateCrudPolicies` declarations in the source above.

#### `users`

**PURPOSE.** users.ts — the shadow of `auth.users`. Supabase owns `auth.users`. This row is created by the `handle_new_user()` trigger, never by the app, and its primary key IS the foreign key to the auth row: one identity, two schemas, no drift. Deleting the auth user cascades this row away, which is how account deletion (Epic 1 ST-10a) removes everything a person has. WHAT IS NOT HERE. Official spec §3.1 also lists `notification_prefs` and `avatar`; both are satellite tables the feature epics define, because both are lists rather than scalars. `wake_anchor_habit_id` is here as a bare uuid with NO foreign key — `habits` does not exist yet, and the feature tech spec's first migration adds `REFERENCES habits(id) ON DELETE SET NULL`. POLICIES. Select and update are the owner's alone. Insert and delete are denied to the authenticated role outright: the trigger inserts, and deletion goes through `auth.admin.deleteUser` and cascades. There is no admin read.

**INDEXES.**
- `users_email_idx`

**RLS.** See the inline `pgPolicy` / `ownerPrivateCrudPolicies` declarations in the source above.

### GROUP 2 — NOTIFICATIONS

Web Push subscription endpoints — one row per browser that agreed to reminders. Read by the scheduler; owner-private.

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
```

#### `web_push_subscriptions`

**PURPOSE.** web_push_subscriptions — one row per browser that agreed to reminders. Endpoint, p256dh, and auth are what `PushSubscription.toJSON()` gives; the scheduler (INF-9) reads them to send. It lives in the foundation rather than in INF-9 because it is the only table INF-9 needs, and a ticket that ships a route handler should not also be generating a migration. POLICIES: owner-private CRUD. A subscription is a fact about a person's device, so it is theirs alone to read and revoke. `userId` is `ON DELETE set null` rather than cascade so a revoked subscription can be reaped by endpoint after the account is gone, instead of the row disappearing and the push service being told nothing.

**INDEXES.**
- `web_push_subscriptions_endpoint_idx`
- `web_push_subscriptions_user_id_idx`

**RLS.** See the inline `pgPolicy` / `ownerPrivateCrudPolicies` declarations in the source above.


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

---

## 6. RLS NOTES

RLS is **enabled on every `public` table** by the same loop, deny-by-default. Policies are declared inline in the Drizzle schema files (`pgPolicy`, `ownerPrivateCrudPolicies`) and applied by migration.

**The access model has exactly one shape: owner-private.** The row's owner is the only reader and the only writer. There is no admin-read policy on any user-data table and no factory that would create one — `ownerRowPolicies`, `coupleScopedPolicies`, `catalogAdminWritePolicies`, and `holderScopedPolicies` were deliberately not carried over from Conscious Connections. This is the code form of the product's promise: *only you can see your data — not the people who built this.*

- **Owner-private CRUD:** `web_push_subscriptions`, and every domain table the feature epics add.
- **Owner read/update, trigger insert, cascade delete:** `users` — the row is created by `handle_new_user()` and removed by cascade from `auth.admin.deleteUser`, so authenticated insert and delete are denied outright.
- **Service-role only:** reserved for system bookkeeping (`serviceRoleOnlyPolicies`). Nothing uses it yet.
- **Read-only catalogue:** reserved for tables the product ships rather than a person writes (`catalogReadPolicies`). Nothing uses it yet.

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

`yarn db:seed` refuses to run with `NODE_ENV=production` and currently seeds nothing — there are no domain tables. The Epic 1 track adds the starter habits and the default reason set (official spec §3.10) as seed functions.

`yarn db:seed-users` creates a smoke-test account through `auth.admin.createUser`, which fires `handle_new_user()` and produces the shadow row. Its address is a `.test` domain on purpose: it cannot resolve, so a stray verification email goes nowhere.

---

## 9. SCHEMA DECISIONS LOG

- **`public.users` is a shadow, not a copy.** Its PK *is* the FK to `auth.users(id)`. One identity, two schemas, no join key to get wrong, and cascade deletion that actually removes everything.
- **The shadow row is written by a trigger, not by the app.** Signups go through Supabase Auth, often client-side, so there is no reliable server hook. The database guarantees the row exists before any FK needs it.
- **`wake_anchor_habit_id` has no foreign key yet.** `habits` does not exist; the feature tech spec's first migration adds `REFERENCES habits(id) ON DELETE SET NULL`.
- **`web_push_subscriptions.user_id` is `ON DELETE set null`, not cascade.** A revoked endpoint stays reapable by endpoint after the account is gone, instead of vanishing with the push service never told.
- **`notification_prefs` and `avatar` (official spec §3.1) are not columns here.** Both are lists rather than scalars, so both are satellite tables the feature epics define.
- **The tier defaults to `local`.** Conscious Connections defaults to `production`; Synapse does not, because a shell with nothing set must not be able to reach the production database. See TECHNICAL-DECISIONS.

---

## 10. OPEN QUESTIONS & FLAGGED DECISIONS

- **2 tables is the whole foundation.** Every domain table is out of scope here by design; they arrive with the feature epics' tech spec, built on the patterns in `src/schema/rls/`.
- **No Realtime publication.** Phase 2's offline/sync work decides whether any table is subscribed. If one is, its policies must use the dual-context helpers in `rls/helpers.ts` — a policy written against `app.user_id` alone denies every row to every subscriber, silently.
- **Storage object policies are not in this package.** The buckets are declared here; the object-level RLS lands with the first ticket that uploads a file.
