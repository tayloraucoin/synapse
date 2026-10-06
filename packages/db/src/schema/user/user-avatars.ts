/**
 * user_avatars — the optional account photo (official spec §3.1 `avatar`,
 * §9.8).
 *
 * ONE PER PERSON, so `user_id` IS the primary key and there is no separate
 * `id`. Replacing a photo replaces this row; removing it deletes the row and
 * the `Avatar` primitive falls back to initials, which is the default state
 * rather than an error state.
 *
 * The bytes live in the private `avatars` bucket; `storage_path` is the object
 * key (`avatars/{user_id}/{uuid}.jpg`). SET-3 mints the signed upload and
 * serves reads through its session-gated streaming route — the path alone is
 * worthless without a cookie.
 *
 * No status dots, rings, or presence (official spec §9.8): Synapse is
 * single-player and there is no one to be present to.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "./users";

export const userAvatars = pgTable(
  "user_avatars",
  {
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    byteSize: integer("byte_size").notNull(),
    /** jpeg, png or webp — `USER_IMAGE_MIME_TYPES` in `@syn/constants`. */
    contentType: text("content_type").notNull(),
    /** `avatars/{user_id}/{uuid}.jpg` in the private bucket. */
    storagePath: text("storage_path").notNull(),

    /** The primary key: one avatar per person, no surrogate id. */
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    ...ownerPrivateCrudPolicies({
      prefix: "user_avatars",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const userAvatarsRelations = relations(userAvatars, ({ one }) => ({
  user: one(users, {
    fields: [userAvatars.userId],
    references: [users.id],
  }),
}));
