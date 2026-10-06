/**
 * quotes — the bank a person may opt into for the morning frame (UX v1.2
 * §3.12, §11.6; R36, TD-13).
 *
 * APP CONTENT, NOT A PERSON'S. The first table under `catalogReadPolicies`:
 * every signed-in person may read it, nobody may write it through the
 * authenticated role, and there is no `user_id` — a quote belongs to the
 * product, the way the curated icon set does. It changes by migration or seed
 * (the factory's own rule) or, if RUN-14 ships, through an admin surface that
 * writes with the service role. It never changes through an RLS policy for
 * "admins": a role column on `users` is one careless policy away from an
 * admin-read on user data, which this schema promises never exists.
 *
 * NOTHING ABOUT THE PERSON DECIDES THE QUOTE. `quote.today` picks by date
 * order over the published rows, so two people on the same day see the same
 * quote and nobody sees one "for them". The read filters `published_at IS NOT
 * NULL`; a draft is invisible to every person.
 *
 * THE APP NEVER SPEAKS IT. The frame renders a quote in quotation marks with
 * its attribution as a caption, under the neutral chrome caption *A quote*.
 * The tone rule for whoever curates the bank (v1.2 §13 #24): nothing that
 * instructs, exhorts, or commands in the second person.
 *
 * POLICIES: `catalogReadPolicies` — select for authenticated; insert, update,
 * delete denied.
 */
import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { catalogReadPolicies } from "../rls/standard-policies";

export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** 1–120. Always shown; a quote without one is not published. */
    attribution: text("attribution").notNull(),
    /** Null = a draft, invisible to every person. The cycle orders by this, then id. */
    publishedAt: timestamp("published_at", { withTimezone: true }),
    /** ≤ 200, optional — a book, a talk, a letter. */
    source: text("source"),
    /** Curator's tags; nothing reads them in v1.2 beyond the admin list. */
    tags: text("tags").array().notNull().default([]),
    /** 1–400. */
    text: text("text").notNull(),
  },
  (table) => [
    index("quotes_published_at_idx").on(table.publishedAt),
    check("quotes_text_check", sql`length(${table.text}) BETWEEN 1 AND 400`),
    check(
      "quotes_attribution_check",
      sql`length(${table.attribution}) BETWEEN 1 AND 120`,
    ),
    check(
      "quotes_source_check",
      sql`${table.source} IS NULL OR length(${table.source}) <= 200`,
    ),
    ...catalogReadPolicies("quotes"),
  ],
);
