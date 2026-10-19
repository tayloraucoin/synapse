/**
 * google_accounts — a Google account whose calendars Synapse reads (USE-100's
 * table, USE-103's OAuth): read-only calendar scope, never the sign-in's.
 *
 * TOKEN. `refresh_token_ct` is an AES-256-GCM envelope (`token-crypto`, C5),
 * selected only by `services/google/`, naming the column. The access token
 * is never stored.
 *
 * POLICIES: owner-private CRUD.
 */
import { sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { bytea } from "./bytea";

export const googleAccounts = pgTable(
  "google_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** The account's address, as Settings shows it under the account line. */
    email: text("email").notNull(),
    /** "Personal", Taylor's word for the account. */
    label: text("label").notNull(),
    lastSyncError: text("last_sync_error"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    /** Ciphertext; never in a view. */
    refreshTokenCt: bytea("refresh_token_ct").notNull(),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("google_accounts_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "google_accounts",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);
