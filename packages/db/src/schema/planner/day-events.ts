/**
 * day_events — a Synapse event: a fixed time on a date. Never a slot; it pins
 * inside whichever block its time falls in, or stands as its own small block
 * outside every block (the model dev note). Google's events are not here.
 *
 * ONE DATE OR ONE RULE (USE-14, `0013`): an event is on one date or repeats
 * by `rrule`, exactly one (`day_events_rrule_or_on_date_check`), as a block
 * is. Add event's Work or Personal, Client and notes and colour arrive with
 * it (D-USE-42, D-USE-102); 0012's rows read as personal.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { EVENT_TAGS } from "@syn/constants";
import type { EventTag, IconValue } from "@syn/types";
import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { clients } from "../work/clients";

/** Add event's Work or Personal (D-USE-42). */
export const eventTagEnum = pgEnum(
  "event_tag",
  enumValues<EventTag>()(EVENT_TAGS),
);

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

    /** A palette key or `#rrggbb`, as `blocks.color`; null is plum (D-USE-31). */
    color: text("color"),
    endsAt: time("ends_at").notNull(),
    // JSON shape: IconValue — see @syn/types.
    icon: jsonb("icon").$type<IconValue>(),
    notes: text("notes"),
    /** A one-off's date; null when `rrule` is set. */
    onDate: date("on_date"),
    /** RFC 5545, one rule (D-USE-80); null is a one-off. */
    rrule: text("rrule"),
    startsAt: time("starts_at").notNull(),
    tag: eventTagEnum("tag").notNull().default("personal"),
    title: text("title").notNull(),

    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    check(
      "day_events_rrule_or_on_date_check",
      sql`num_nonnulls(${table.rrule}, ${table.onDate}) = 1`,
    ),
    check(
      "day_events_ends_after_starts_check",
      sql`${table.endsAt} > ${table.startsAt}`,
    ),
    index("day_events_user_id_on_date_idx").on(table.userId, table.onDate),
    index("day_events_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "day_events",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const dayEventsRelations = relations(dayEvents, ({ one }) => ({
  client: one(clients, {
    fields: [dayEvents.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [dayEvents.userId],
    references: [users.id],
  }),
}));
