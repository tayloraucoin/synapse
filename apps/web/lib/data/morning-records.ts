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

/** A journal prompt as the person named it: `answers` is keyed by `key`. */
export interface JournalPromptRecord {
  key: string;
  label: string;
}

/**
 * The date's three lines (none written yet is null), yesterday's evening and
 * the prompts it was written under (empty: the defaults), so "Last night"
 * reads back under the person's own captions (USE-13).
 */
export interface MorningDayRecords {
  lines: MorningLinesRecord | null;
  lastNight: JournalEntryRecord | null;
  prompts: JournalPromptRecord[];
}

/** `readMorning`'s whole answer: `{ passages, quote, links, lines, lastNight, prompts }`. */
export type MorningRecords = ReadingRecords & MorningDayRecords;
