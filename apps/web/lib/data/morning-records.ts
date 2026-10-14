import type {
  JournalEntryRecord,
  LinkRecord,
  MorningLinesRecord,
  PassageRecord,
  QuoteRecord,
} from "@syn/validators";

/**
 * The morning's reads (USE-12), from the fixture server now and the routers
 * in wave 3. Two reads, so only the reading can wait or fail on its own
 * (D-USE-63): the reading with its links, and the day's lines with last
 * night.
 */

/** The reading: the passages in order, the quote on its day, the links. */
export interface ReadingRecords {
  passages: PassageRecord[];
  quote: QuoteRecord | null;
  links: LinkRecord[];
}

/** The date's three lines (none written yet is null) and yesterday's evening. */
export interface MorningDayRecords {
  lines: MorningLinesRecord | null;
  lastNight: JournalEntryRecord | null;
}

/** `readMorning`'s whole answer: `{ passages, quote, links, lines, lastNight }`. */
export type MorningRecords = ReadingRecords & MorningDayRecords;
