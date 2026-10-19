/**
 * linear_snapshots — what one sync fetched from a workspace (USE-100's table,
 * USE-101's rows): the payload is `@syn/validators`' `linearSnapshotPayload`,
 * parsed before it is stored, so Linear's own shape stays out of the tables.
 * Gone with its connection.
 *
 * POLICIES: owner-private CRUD.
 */
import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { linearConnections } from "./linear-connections";

export const linearSnapshots = pgTable(
  "linear_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
    // JSON shape: LinearSnapshotPayload — see @syn/validators.
    payload: jsonb("payload").notNull(),

    connectionId: uuid("connection_id")
      .notNull()
      .references(() => linearConnections.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("linear_snapshots_connection_id_fetched_at_idx").on(
      table.connectionId,
      table.fetchedAt,
    ),
    index("linear_snapshots_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "linear_snapshots",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);
