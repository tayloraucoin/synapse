/**
 * data_exports — one request for "export everything" (official spec §7.6,
 * Epic 1 ST-10).
 *
 * Created here, empty, so SET-10 is a code ticket rather than a second
 * migration. The bundle is built inside the mutation and uploaded to the
 * private `exports` bucket; `expires_at` is 24 hours after it is ready, and a
 * scheduled job flips the row to `expired` and removes the object.
 *
 * `error` IS NEVER SHOWN. ST-10 has its own sentence for a failed export; the
 * column exists so a failure can be diagnosed, not so a stack trace can reach
 * a person who asked for their data.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { ExportStatus } from "@syn/types";

import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

/** One table uses it, so it lives here (drizzle-orm-conventions §3). */
export const exportStatusEnum = pgEnum(
  "export_status",
  enumValues<ExportStatus>()(["preparing", "ready", "expired", "failed"]),
);

export const dataExports = pgTable(
  "data_exports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Shown as the size beside *ready* (ST-10). */
    byteSize: integer("byte_size"),
    /** Never shown — see the note above. */
    error: text("error"),
    /** 24 hours after the export became ready. */
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    status: exportStatusEnum("status").notNull().default("preparing"),
    /** `exports/{user_id}/{id}.zip` in the private bucket. */
    storagePath: text("storage_path"),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("data_exports_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("data_exports_user_id_idx").on(table.userId),
    ...ownerPrivateCrudPolicies({
      prefix: "data_exports",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const dataExportsRelations = relations(dataExports, ({ one }) => ({
  user: one(users, {
    fields: [dataExports.userId],
    references: [users.id],
  }),
}));
