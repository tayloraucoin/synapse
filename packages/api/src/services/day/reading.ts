import { eq } from "drizzle-orm";

import { CYCLE_EPOCH } from "@syn/constants";
import { users, type RlsClient } from "@syn/db";
import type { PassageView, QuoteView } from "@syn/types";
import { cycleIndex } from "@syn/utils";

import { readActivePassages } from "../library/passages";
import { readQuoteForDate } from "../system/quotes";

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

/**
 * The morning's reading and where the cycle is today — ONE arithmetic, shared
 * by the orient frame (`readOrient`) and the journal's close
 * (`readJournalClose`; UX v1.3 R54, §7.2; DAY-6), so the two can never
 * disagree about which day is a quote-day.
 *
 * The slides are the active passages in cycle order and, when the bank is
 * opted in and has one, the date's quote as the LAST slide; `cycleIndex`
 * walks them one per day (RUN-4). `quoteToday` is true on the day the index
 * lands on the quote. Nothing about the person's entries chooses anything.
 */
export async function quoteSlotFor(
  tx: Tx,
  userId: string,
  date: string,
): Promise<{
  passages: PassageView[];
  quote: QuoteView | null;
  /** Null when there is nothing to read. */
  todayIndex: number | null;
  quoteToday: boolean;
}> {
  const [account] = await tx
    .select({ quotesOptIn: users.quotesOptIn })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const passages = await readActivePassages(tx, userId);
  const quote = account?.quotesOptIn ? await readQuoteForDate(tx, date) : null;
  const slides = passages.length + (quote ? 1 : 0);
  const todayIndex = cycleIndex(slides, date, CYCLE_EPOCH);
  return { passages, quote, todayIndex, quoteToday: quote !== null && todayIndex === passages.length };
}
