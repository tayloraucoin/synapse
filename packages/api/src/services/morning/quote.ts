import { asc, eq, isNotNull } from "drizzle-orm";

import { CYCLE_EPOCH } from "@syn/constants";
import { quotes, users, type RlsClient } from "@syn/db";
import type { QuoteRecord } from "@syn/validators";
import { cycleIndex } from "@syn/utils";

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

/**
 * The quote on its day (USE-96), read by Orient's reading and Close the
 * day's close alike, so the two never disagree. With the bank opted in, the
 * date picks one published quote by `cycleIndex` over `published_at, id`:
 * the same date gives everyone the same quote, and nothing about the person
 * chooses it. Opted out, or an empty bank, is no quote.
 */

export type QuoteRow = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  text: string;
  attribution: string;
};

export interface QuoteSource {
  quotesOptIn(): Promise<boolean>;
  /** Published only, in the cycle's order. */
  publishedQuotes(): Promise<QuoteRow[]>;
}

export async function pickQuote(
  source: QuoteSource,
  dateKey: string,
): Promise<QuoteRecord | null> {
  if (!(await source.quotesOptIn())) return null;
  const rows = await source.publishedQuotes();
  const index = cycleIndex(rows.length, dateKey, CYCLE_EPOCH);
  const row = index === null ? undefined : rows[index];
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    onDate: dateKey,
    text: row.text,
    attribution: row.attribution,
  };
}

export function quoteSource(tx: Tx, userId: string): QuoteSource {
  return {
    async quotesOptIn() {
      const [row] = await tx
        .select({ quotesOptIn: users.quotesOptIn })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      return row?.quotesOptIn ?? false;
    },
    publishedQuotes() {
      return tx
        .select({
          id: quotes.id,
          createdAt: quotes.createdAt,
          updatedAt: quotes.updatedAt,
          text: quotes.text,
          attribution: quotes.attribution,
        })
        .from(quotes)
        .where(isNotNull(quotes.publishedAt))
        .orderBy(asc(quotes.publishedAt), asc(quotes.id));
    },
  };
}
