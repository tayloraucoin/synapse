/**
 * clients — who the work is for (D-USE-42, D-USE-95). `sort_order` is Taylor's
 * drag order, which is also client priority. A tile always carries the
 * client's letter, so colour is never alone. Shown only while
 * `users.clients_enabled` is on.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { CLIENT_COLOR_KEYS } from "@syn/constants";
import type { ClientColorKey } from "@syn/types";

import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { workItems } from "./work-items";

/** D-USE-95's six. */
export const clientColorKeyEnum = pgEnum(
  "client_color_key",
  enumValues<ClientColorKey>()(CLIENT_COLOR_KEYS),
);

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    colorKey: clientColorKeyEnum("color_key").notNull(),
    /** An uploaded logo's storage path (D-USE-42); null shows the letter tile. */
    logoPath: text("logo_path"),
    name: text("name").notNull(),
    sortOrder: smallint("sort_order").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("clients_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "clients",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const clientsRelations = relations(clients, ({ many, one }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  workItems: many(workItems),
}));
