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
