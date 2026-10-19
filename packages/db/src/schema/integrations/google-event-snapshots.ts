/**
 * google_event_snapshots — one account's events for one week, as the last
 * read fetched them (USE-103's rows). Nothing is ever written to Google.
 * Gone with its account.
 *
 * POLICIES: owner-private CRUD.
 */
import { sql } from "drizzle-orm";
import {
  date,
  index,
  jsonb,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { googleAccounts } from "./google-accounts";

export const googleEventSnapshots = pgTable(
  "google_event_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
    // JSON shape: the week's events, parsed by USE-103's schema before storing.
    payload: jsonb("payload").notNull(),
    /** The week's Monday. */
    weekStart: date("week_start").notNull(),

    accountId: uuid("account_id")
      .notNull()
      .references(() => googleAccounts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("google_event_snapshots_account_id_week_start_unique").on(
      table.accountId,
      table.weekStart,
    ),
    index("google_event_snapshots_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "google_event_snapshots",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);
