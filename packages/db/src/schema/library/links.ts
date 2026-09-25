/**
 * links — a thing to open from the morning: a playlist, a track, a page
 * (UX v1.3 R53, §3.17, §11.4; TD-28).
 *
 * A TITLE AND A URL, THE PERSON'S. The orient frame shows each as a callout
 * under the reading; a tap opens it in a new tab (the Spotify app intercepts
 * its own links on a phone). Settings lists them. Nothing else reads them.
 *
 * THE KIND IS DERIVED, NEVER CHOSEN. `kind` is `spotify` for `open.spotify.com`,
 * `spotify.link` and the `spotify:` scheme, `other` for anything else — the
 * service computes it on every save (`deriveLinkKind`) and stores it, so the
 * frame never parses a URL. The default `other` keeps a row valid if a path
 * ever inserts without it.
 *
 * NOTHING IS FETCHED. The app never requests a link on the person's behalf —
 * no preview, no title lookup, no favicon. The URL is `https:` or `spotify:`
 * (the validator's rule); the column bounds its length.
 *
 * NO UNIQUE URL. The same playlist saved twice under two names is the
 * person's list, not a mistake.
 *
 * ARCHIVE, NEVER DELETE, as passages. `sort_order` is the frame's order.
 *
 * POLICIES: owner-private CRUD.
 */
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { LinkKind } from "@syn/types";

import { enumValues } from "../enum-values";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";

/** Link.kind — v1.3 §3.17. One table, so it lives in this file (drizzle-orm-conventions §3). */
export const linkKindEnum = pgEnum("link_kind", enumValues<LinkKind>()(["spotify", "other"]));

export const links = pgTable(
  "links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** Derived from the host by the service; stored so the frame does not parse. */
    kind: linkKindEnum("kind").notNull().default("other"),
    /** The frame's order. */
    sortOrder: smallint("sort_order").notNull().default(0),
    /** 1–80 — the callout's words. */
    title: text("title").notNull(),
    /** ≤ 2048; `https:` or `spotify:` (the validator's rule). */
    url: text("url").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("links_user_id_sort_order_idx").on(table.userId, table.sortOrder),
    index("links_user_id_archived_at_idx").on(table.userId, table.archivedAt),
    index("links_user_id_idx").on(table.userId),
    check("links_title_check", sql`length(${table.title}) BETWEEN 1 AND 80`),
    check("links_url_check", sql`length(${table.url}) BETWEEN 1 AND 2048`),
    ...ownerPrivateCrudPolicies({
      prefix: "links",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);

export const linksRelations = relations(links, ({ one }) => ({
  user: one(users, {
    fields: [links.userId],
    references: [users.id],
  }),
}));
