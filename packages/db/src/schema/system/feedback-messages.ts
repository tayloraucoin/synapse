/**
 * feedback_messages — what a person sends from About (cross-cutting SY-01).
 *
 * THE ONE TABLE IN THIS SCHEMA THAT IS NOT OWNER-PRIVATE, and the only one
 * with policies written inline rather than by a factory — because no factory
 * fits and none is added for it. The shape is insert-only for the author:
 *
 *   insert  → authenticated, `WITH CHECK` the row's `user_id` is the caller's
 *   select  → denied to authenticated
 *   update  → denied to authenticated
 *   delete  → denied to authenticated
 *
 * A person can send a message and cannot read anyone's, including their own.
 * The builder reads it through the service role, out of band. That still keeps
 * the trust line honest — *Nothing from your list is included* — because the
 * row holds only what the person typed plus the two optional context fields
 * the switch controls. No item title, no note, no reason ever reaches here.
 *
 * `user_id` is nullable and `ON DELETE set null`: a deleted account's message
 * survives as anonymous rather than vanishing, which is what makes ST-10a's
 * "everything is removed" true of the person and still leaves the report
 * useful.
 *
 * `[PROVISIONAL — Taylor: confirm that feedback may be read by the builder.]`
 */
import { relations, sql } from "drizzle-orm";
import { index, pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

import { denyAuthenticated, isOwner } from "../rls/helpers";
import { users } from "../user/users";

export const feedbackMessages = pgTable(
  "feedback_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Included only when the *Include app version* switch is on (SY-01). */
    appVersion: text("app_version"),
    /** 1–1000 — `FEEDBACK_MAX`. */
    message: text("message").notNull(),
    /** The route the person was on, as above — a path, never a query string. */
    screenPath: text("screen_path"),

    /** The author. Nullable so a deleted account's message stays as anonymous. */
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("feedback_messages_user_id_idx").on(table.userId),
    pgPolicy("feedback_messages_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isOwner(sql`${table.userId}`),
    }),
    pgPolicy("feedback_messages_select", {
      for: "select",
      to: authenticatedRole,
      using: denyAuthenticated,
    }),
    pgPolicy("feedback_messages_update", {
      for: "update",
      to: authenticatedRole,
      using: denyAuthenticated,
    }),
    pgPolicy("feedback_messages_delete", {
      for: "delete",
      to: authenticatedRole,
      using: denyAuthenticated,
    }),
  ],
);

export const feedbackMessagesRelations = relations(
  feedbackMessages,
  ({ one }) => ({
    user: one(users, {
      fields: [feedbackMessages.userId],
      references: [users.id],
    }),
  }),
);
