/**
 * journal_entries — a few lines at night, in the person's own words (UX v1.1
 * §7.2, §11.10, TD-7).
 *
 * ONE ROW PER DAY (`day_id` is unique). `answers` is a jsonb keyed by prompt
 * key, NOT six columns: the prompts are the person's (`users.journal_prompts`
 * — renamed, reordered, removed, added), and a renamed prompt must keep its
 * answers while a removed one simply stops being read. The orient frame reads
 * three keys back the next morning (`make_happen_tomorrow`, `visualisation`,
 * `looking_forward`); the Week Review reads `gratitude_today` and
 * `looking_forward` verbatim, no synthesis.
 *
 * WRITES MERGE ONE KEY AT A TIME (`answers || excluded.answers`, DYN-4), so
 * autosave on one field from one device never overwrites another field
 * written from a second. An empty journal night is nothing, not a miss: no
 * row, no pending state, no push (R15).
 *
 * The prompts themselves are never here — a prompt's text belongs to the
 * person's profile; an answer belongs to the day it was written on, which is
 * the Synapse day (03:00 to 03:00), so a line written at 00:30 is Monday's.
 *
 * POLICIES: owner-private CRUD, on this table's own `user_id`.
 */
import { relations, sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { days } from "../plan/days";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** JSON shape: Record<promptKey, string> — each value ≤ 2000 (validator). */
    answers: jsonb("answers")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),

    dayId: uuid("day_id")
      .notNull()
      .references(() => days.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("journal_entries_day_id_idx").on(table.dayId),
    index("journal_entries_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("journal_entries_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "journal_entries",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  day: one(days, {
    fields: [journalEntries.dayId],
    references: [days.id],
  }),
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));
