/**
 * google_calendars — one calendar of a connected account, each on or off
 * (`enabled`, D-USE-40). A new account's calendars arrive off. Gone with
 * its account.
 *
 * POLICIES: owner-private CRUD.
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { googleAccounts } from "./google-accounts";

export const googleCalendars = pgTable(
  "google_calendars",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Google's access role on the calendar ("owner", "reader", …). */
    accessRole: text("access_role").notNull(),
    /** Google's calendar id. */
    calendarId: text("calendar_id").notNull(),
    color: text("color").notNull(),
    enabled: boolean("enabled").notNull().default(false),
    name: text("name").notNull(),
    primary: boolean("primary").notNull().default(false),

    accountId: uuid("account_id")
      .notNull()
      .references(() => googleAccounts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("google_calendars_account_id_calendar_id_unique").on(
      table.accountId,
      table.calendarId,
    ),
    index("google_calendars_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "google_calendars",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);
