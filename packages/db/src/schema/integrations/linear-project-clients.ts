/**
 * linear_project_clients — a project's client in a per-project workspace
 * (D-USE-57). Never written to Linear. Gone with its connection; a deleted
 * client leaves the project with none.
 *
 * POLICIES: owner-private CRUD.
 */
import { sql } from "drizzle-orm";
import {
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
import { linearConnections } from "./linear-connections";

export const linearProjectClients = pgTable(
  "linear_project_clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Linear's project id. */
    projectId: text("project_id").notNull(),

    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    connectionId: uuid("connection_id")
      .notNull()
      .references(() => linearConnections.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("linear_project_clients_connection_id_project_id_unique").on(
      table.connectionId,
      table.projectId,
    ),
    index("linear_project_clients_client_id_idx").on(table.clientId),
    index("linear_project_clients_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "linear_project_clients",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);
