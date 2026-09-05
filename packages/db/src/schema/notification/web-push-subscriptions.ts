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
