/**
 * saved_colours — custom colours, saved for reuse (D-USE-36). `#rrggbb`,
 * lower case, once each per person.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const savedColours = pgTable(
  "saved_colours",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    hex: text("hex").notNull(),
    sortOrder: smallint("sort_order").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    check("saved_colours_hex_check", sql`${table.hex} ~ '^#[0-9a-f]{6}$'`),
    // Leads with user_id, so it also serves as the user_id index.
    unique("saved_colours_user_id_hex_key").on(table.userId, table.hex),
    ...ownerPrivateCrudPolicies({
      prefix: "saved_colours",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const savedColoursRelations = relations(savedColours, ({ one }) => ({
  user: one(users, {
    fields: [savedColours.userId],
    references: [users.id],
  }),
}));
