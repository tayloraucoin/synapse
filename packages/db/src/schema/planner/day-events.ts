/**
 * day_events — a Synapse event: a fixed time on a date. Never a slot; it pins
 * inside whichever block its time falls in, or stands as its own small block
 * outside every block (the model dev note). Google's events are not here.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  jsonb,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { IconValue } from "@syn/types";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const dayEvents = pgTable(
  "day_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    endsAt: time("ends_at").notNull(),
    // JSON shape: IconValue — see @syn/types.
    icon: jsonb("icon").$type<IconValue>(),
    onDate: date("on_date").notNull(),
    startsAt: time("starts_at").notNull(),
    title: text("title").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    check("day_events_ends_after_starts_check", sql`${table.endsAt} > ${table.startsAt}`),
    index("day_events_user_id_on_date_idx").on(table.userId, table.onDate),
    index("day_events_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "day_events",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const dayEventsRelations = relations(dayEvents, ({ one }) => ({
  user: one(users, {
    fields: [dayEvents.userId],
    references: [users.id],
  }),
}));
