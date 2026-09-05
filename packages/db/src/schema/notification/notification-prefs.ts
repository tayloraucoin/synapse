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
