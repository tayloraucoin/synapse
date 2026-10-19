/**
 * linear_connections — one per Linear workspace Taylor connected (USE-100,
 * D-USE-114: OAuth only).
 *
 * TOKENS. `access_token_ct` and `refresh_token_ct` are AES-256-GCM envelopes
 * (`@syn/api`'s `services/integrations/token-crypto.ts`, C5). Only
 * `services/linear/` selects them, naming each column; every other read
 * names the view's columns and never these. Linear rotates the refresh token
 * on every refresh, so the pair is always written together.
 *
 * `client_id` is set when every project belongs to one client;
 * `per_project` maps each project through `linear_project_clients`.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
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
import { clients } from "../work/clients";
import { bytea } from "./bytea";

export const linearConnections = pgTable(
  "linear_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Ciphertext; never in a view. */
    accessTokenCt: bytea("access_token_ct").notNull(),
    lastSyncError: text("last_sync_error"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    /** Linear-hosted; may need auth, so the letter tile is the fallback. */
    logoUrl: text("logo_url"),
    name: text("name").notNull(),
    /** Linear's organization id. */
    organizationId: text("organization_id").notNull(),
    perProject: boolean("per_project").notNull().default(false),
    /** Ciphertext; never in a view. */
    refreshTokenCt: bytea("refresh_token_ct").notNull(),
    /** As Linear granted them, comma-separated ("read,write"). */
    scopes: text("scopes").notNull(),
    tokenExpiresAt: timestamp("token_expires_at", {
      withTimezone: true,
    }).notNull(),
    urlKey: text("url_key").notNull(),

    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("linear_connections_user_id_organization_id_unique").on(
      table.userId,
      table.organizationId,
    ),
    index("linear_connections_client_id_idx").on(table.clientId),
    ...ownerPrivateCrudPolicies({
      prefix: "linear_connections",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const linearConnectionsRelations = relations(
  linearConnections,
  ({ one }) => ({
    client: one(clients, {
      fields: [linearConnections.clientId],
      references: [clients.id],
    }),
    user: one(users, {
      fields: [linearConnections.userId],
      references: [users.id],
    }),
  }),
);
