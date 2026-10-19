import type { JournalEntryRecord } from "@syn/validators";

/**
 * The Wind-down block's Journal row (USE-110; close-the-day, DYN-18): the
 * row opens Close the day (`journalRoute(date)`), never the Item sheet, and
 * ticks itself while the day's journal holds any answer. An emptied journal
 * clears it again; a row ticked by hand stays ticked. No column marks the
 * row [ASSUMPTION: an item named "Journal" is it]; USE-96 reads it live.
 */
export const JOURNAL_ITEM_TITLE = "Journal";

export function isJournalItem(title: string): boolean {
  return title.trim().toLowerCase() === JOURNAL_ITEM_TITLE.toLowerCase();
}

/** Any field written; an empty string is no answer (the jsonb merge keeps it). */
export function journalWritten(
  entry: Pick<JournalEntryRecord, "answers"> | null | undefined,
): boolean {
  return Object.values(entry?.answers ?? {}).some(
    (answer) => answer.trim() !== "",
  );
}

/** Rows with the Journal row ticked while something is written. */
export function withJournalTick<R extends { title: string; done: boolean }>(
  rows: readonly R[],
  written: boolean,
): R[] {
  if (!written) return [...rows];
  return rows.map((row) =>
    !row.done && isJournalItem(row.title) ? { ...row, done: true } : row,
  );
}
