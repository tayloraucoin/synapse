/**
 * day_records — one row per date that has been opened: when it was oriented,
 * when Ready, go was pressed, and when it closed. Orient's own writes are
 * settled by the Orient ticket. The day itself is read, never stored.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import { date, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const dayRecords = pgTable(
  "day_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    closedAt: timestamp("closed_at", { withTimezone: true }),
    onDate: date("on_date").notNull(),
    orientedAt: timestamp("oriented_at", { withTimezone: true }),
    /** Ready, go. */
    readyAt: timestamp("ready_at", { withTimezone: true }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    // Leads with user_id, so it also serves as the user_id index.
    unique("day_records_user_id_on_date_key").on(table.userId, table.onDate),
    ...ownerPrivateCrudPolicies({
      prefix: "day_records",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const dayRecordsRelations = relations(dayRecords, ({ one }) => ({
  user: one(users, {
    fields: [dayRecords.userId],
    references: [users.id],
  }),
}));
