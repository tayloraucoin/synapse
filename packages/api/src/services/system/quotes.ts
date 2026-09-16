import { asc, isNotNull } from "drizzle-orm";

import { CYCLE_EPOCH } from "@syn/constants";
import { quotes, type RlsClient } from "@syn/db";
import type { QuoteView } from "@syn/types";
import { cycleIndex } from "@syn/utils";

/**
 * The quote bank's one read (UX v1.2 §3.12, TD-13, RUN-4).
 *
 * `quotes` is a catalogue: every signed-in person may read the PUBLISHED rows
 * through `catalogReadPolicies`; the draft filter is here, in the query, so a
 * draft is invisible to every person whatever the policy says. Nothing writes
 * this table from the app in RUN-4; RUN-14 adds the admin surface if D3 is
 * ratified.
 *
 * NOTHING ABOUT THE PERSON DECIDES THE QUOTE. The pick is `cycleIndex` over
 * the published rows by `published_at, id` — the same date gives every
 * person the same quote, and no tag, mood, or record of theirs is read.
 */

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

export async function readQuoteForDate(tx: Tx, dateKey: string): Promise<QuoteView | null> {
  const rows = await tx
    .select({
      id: quotes.id,
      text: quotes.text,
      attribution: quotes.attribution,
      source: quotes.source,
    })
    .from(quotes)
    .where(isNotNull(quotes.publishedAt))
    .orderBy(asc(quotes.publishedAt), asc(quotes.id));

  const index = cycleIndex(rows.length, dateKey, CYCLE_EPOCH);
  if (index === null) return null;
  const row = rows[index];
  return row ? { id: row.id, text: row.text, attribution: row.attribution, source: row.source } : null;
}

/** `quote.today` — null when the bank is empty; the opt-in is the caller's to honour. */
export async function quoteForDate(
  rls: RlsClient,
  dateKey: string,
): Promise<QuoteView | null> {
  return rls.execute((tx) => readQuoteForDate(tx, dateKey));
}
