/**
 * notification_deliveries — the exactly-once ledger (official spec §8.1).
 *
 * "DELIVERED ONCE" IS A PROMISE, AND THIS IS HOW IT IS KEPT. The scheduler
 * runs every fifteen minutes over a fifteen-minute window; a cron tick that
 * fires late, twice, or overlaps another must not put the same sentence on a
 * lock screen twice. Each job INSERTS here before it sends and sends only when
 * the insert returned a row — so the unique index, not the job's own care, is
 * what makes the guarantee.
 *
 * THE KEY IS `(user_id, kind, target_id, target_key, scheduled_for)`. The
 * target is an item for N1, a day for N4 and N5, and null for N6, whose week
 * key goes in `target_key` — a week is not a row. `scheduled_for` is truncated
 * to the minute by the caller, so two scans of overlapping windows produce the
 * same key rather than two.
 *
 * A ROW IS WRITTEN EVEN WITH NO SUBSCRIPTION. Otherwise a person who installs
 * the app on Friday would receive Monday's reminders on Friday evening, all at
 * once, as the first scan found every past-due row unsent.
 *
 * `skipped` RECORDS WHAT WAS NOT SENT AND WHY IT WAS NOT. A reminder more than
 * fifteen minutes late is noise (§8.1: at the time assigned), so it is
 * recorded and dropped; the row is what answers "why was I not told".
 *
 * A PREF THAT IS OFF WRITES NOTHING AT ALL. That is not a delivery that did
 * not happen — it is a notification the person declined to have, and a ledger
 * of things somebody has switched off would be a log of their preferences.
 *
 * POLICIES: service-role only. No person reads this; it is the scheduler's
 * bookkeeping, and every row is about a message rather than about a day.
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { notificationKindEnum } from "./notification-prefs";
import { serviceRoleOnlyPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const notificationDeliveries = pgTable(
  "notification_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    kind: notificationKindEnum("kind").notNull(),
    /** Truncated to the minute, so overlapping scans collide rather than send. */
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
    /** Null until the push is handed to the service; null forever if skipped. */
    sentAt: timestamp("sent_at", { withTimezone: true }),
    /** N4's *Later*, once — a second snooze on the same target is refused. */
    snoozed: boolean("snoozed").notNull().default(false),
    /** Recorded rather than sent: too late to be the time it was assigned. */
    skipped: boolean("skipped").notNull().default(false),

    /** An item (N1) or a day (N4, N5). Null for N6, which is about a week. */
    targetId: uuid("target_id"),
    /** N6's week key. A week has no row to point at. */
    targetKey: text("target_key"),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    /*
     * THE UNIQUE CONSTRAINT IS THE GUARANTEE, and `NULLS NOT DISTINCT` is what
     * makes it mean what it reads as.
     *
     * Postgres treats NULLs as distinct by default, which would defeat this
     * entirely: every N6 row has a null `target_id`, so two Sunday reminders
     * would both insert and both send. It is a CONSTRAINT rather than a unique
     * index because `nullsNotDistinct` is only available on the constraint
     * form in this Drizzle version — and `ON CONFLICT` needs a constraint
     * anyway, which is exactly how the jobs use it.
     */
    unique("notification_deliveries_key")
      .on(
        table.userId,
        table.kind,
        table.targetId,
        table.targetKey,
        table.scheduledFor,
      )
      .nullsNotDistinct(),
    index("notification_deliveries_user_id_scheduled_for_idx").on(
      table.userId,
      table.scheduledFor,
    ),
    ...serviceRoleOnlyPolicies("notification_deliveries"),
  ],
);

export const notificationDeliveriesRelations = relations(
  notificationDeliveries,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationDeliveries.userId],
      references: [users.id],
    }),
  }),
);
