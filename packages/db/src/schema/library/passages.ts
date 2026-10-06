/**
 * passages — a saved piece of morning reading, the person's own or chosen
 * (UX v1.2 §3.12, §4.6, §11.4; R36, TD-15).
 *
 * A COLLECTION, NOT A COLUMN. v1.1 kept one passage on a column of `users`;
 * v1.2 gives passages a title, a rich body, up to four images and tags, and
 * an order that IS the morning cycle (one per day, by `sort_order`, advancing
 * at day-open, wrapping — nothing about which one was read is recorded,
 * §13 #21). Migration 0007 copied every non-blank one into a row here; the
 * old column is dropped by `0010_retirements` (DAY-13).
 *
 * THE BODY IS MARKDOWN (TD-15). Readable in an export, in a row, and by the
 * future Expo app without the editor; the five controls the editor allows
 * round-trip losslessly. Never HTML, never the editor's JSON. `images` holds
 * bucket-qualified paths (`passages/{user_id}/{file}`) in the `passages`
 * bucket, with the icons' owner-segment policies; the read route serves them
 * as it serves an icon — a foreign path is a 404, never a 403.
 *
 * TAGS ARE THE PERSON'S, FOR THE PERSON. v1.2 reads them for the list's
 * filter and nothing else; "chosen against the day" (ledger §25) is phase 2
 * and this is its seam.
 *
 * ARCHIVE, NEVER DELETE. An archived passage's images stay in the bucket
 * (the export may still reference them; orphan reaping is a later concern,
 * as for icons).
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

export const passages = pgTable(
  "passages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** Markdown, the storage form; 1–8000. */
    bodyMd: text("body_md").notNull(),
    /** JSON shape: string[] — up to four bucket-qualified paths. */
    images: jsonb("images").$type<string[]>().notNull().default([]),
    /** The cycle's order (v1.2 §3.12). */
    sortOrder: smallint("sort_order").notNull().default(0),
    /** Up to ten, each ≤ 24. */
    tags: text("tags").array().notNull().default([]),
    /** ≤ 80; null shows the body's first line as the card's title. */
    title: text("title"),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("passages_user_id_sort_order_idx").on(table.userId, table.sortOrder),
    index("passages_user_id_archived_at_idx").on(table.userId, table.archivedAt),
    index("passages_user_id_idx").on(table.userId),
    check(
      "passages_body_md_check",
      sql`length(${table.bodyMd}) BETWEEN 1 AND 8000`,
    ),
    check(
      "passages_title_check",
      sql`${table.title} IS NULL OR length(${table.title}) <= 80`,
    ),
    check(
      "passages_images_check",
      sql`jsonb_typeof(${table.images}) = 'array' AND jsonb_array_length(${table.images}) <= 4`,
    ),
    check(
      "passages_tags_check",
      sql`cardinality(${table.tags}) <= 10`,
    ),
    ...ownerPrivateCrudPolicies({
      prefix: "passages",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const passagesRelations = relations(passages, ({ one }) => ({
  user: one(users, {
    fields: [passages.userId],
    references: [users.id],
  }),
}));
