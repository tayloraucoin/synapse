import type { JournalEntryRecord, QuoteRecord } from "@syn/validators";
import type { JournalPromptRecord } from "./morning-records";

/**
 * Close the day's read (USE-44), from the fixture server now and the journal
 * router in wave 3: the date's entry (none written yet is null), the
 * person's prompts in order (the defaults when none are set), and the
 * morning's quote on its day, which closes the page once every prompt is
 * answered (DAY-12).
 */
export interface JournalRecords {
  entry: JournalEntryRecord | null;
  prompts: JournalPromptRecord[];
  quote: QuoteRecord | null;
}
