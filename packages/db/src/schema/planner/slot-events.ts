/**
 * slot_events — the clock, as events, never a ticking number (the data
 * contract's "The clock"). One pure function, `deriveClock`, reads them on
 * every device and on the server, sorted by `at`, then `received_at`.
 *
 * APPEND-ONLY. The owner reads and inserts; no update and no delete through
 * the app (`ownerAppendOnlyPolicies`), so a span once recorded cannot be
 * edited into another. There is no `updated_at`. A replay is a no-op:
 * `client_event_id` is unique per user, so the offline queue may send an
 * event twice.
 *
 * `at` is the device's time; `received_at` is the server's. A Step away writes
 * one `paused` per running item, all sharing one `step_away_id`, which Resume
 * all reads (D-USE-46).
 *
 * The rows go with their slot, and with their owner, by foreign-key cascade;
 * a cascade is not a policy, so the append-only rule still holds for callers.
 *
 * POLICIES: owner select and insert; update and delete denied.
 */
import { relations, sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { SLOT_EVENT_KINDS } from "@syn/constants";
import type { SlotEventKind } from "@syn/types";
import { enumValues } from "../enum-values";
import { ownerAppendOnlyPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { slots } from "./slots";

export const slotEventKindEnum = pgEnum(
  "slot_event_kind",
  enumValues<SlotEventKind>()(SLOT_EVENT_KINDS),
);

export const slotEvents = pgTable(
  "slot_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** The device's time. */
    at: timestamp("at", { withTimezone: true }).notNull(),
    /** The device's id for this event; a replay with the same id is dropped. */
    clientEventId: uuid("client_event_id").notNull(),
    kind: slotEventKindEnum("kind").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    /** Shared by every `paused` one Step away wrote. */
    stepAwayId: uuid("step_away_id"),

    slotId: uuid("slot_id")
      .notNull()
      .references(() => slots.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("slot_events_user_id_client_event_id_key").on(
      table.userId,
      table.clientEventId,
    ),
    index("slot_events_slot_id_at_idx").on(table.slotId, table.at),
    index("slot_events_user_id_idx").on(table.userId),
    ...ownerAppendOnlyPolicies({
      prefix: "slot_events",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const slotEventsRelations = relations(slotEvents, ({ one }) => ({
  slot: one(slots, {
    fields: [slotEvents.slotId],
    references: [slots.id],
  }),
  user: one(users, {
    fields: [slotEvents.userId],
    references: [users.id],
  }),
}));
