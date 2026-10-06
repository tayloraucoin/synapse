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
