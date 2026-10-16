import { and, eq, sql } from "drizzle-orm";

import { DEFAULT_JOURNAL_PROMPTS } from "@syn/constants";
import { days, journalEntries, users, type RlsClient } from "@syn/db";
import type { JournalEntryRecord, JournalSaveInput, QuoteRecord } from "@syn/validators";

import { ensureOldDayRow } from "../day/old-day-row";
import { pickQuote, quoteSource, type QuoteSource } from "../morning/quote";

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

/**
 * The journal (USE-96), on the old `journal_entries`: one row per date, its
 * answers a jsonb map keyed by the person's prompt keys, the prompts read
 * from `users.journal_prompts`.
 *
 * ONE KEY PER SAVE. `save` merges `{ key: value }` into the date's entry
 * (`answers || jsonb_build_object(key, value)`), so an answer written from
 * one device never drops another written from a second. The entry hangs off
 * the date's old `days` row, made on demand.
 */

export type JournalPrompt = { key: string; label: string };

/** Close the day's read, as the fixture answers `readJournal`. */
export type JournalRead = {
  entry: JournalEntryRecord | null;
  prompts: JournalPrompt[];
  quote: QuoteRecord | null;
};

export interface JournalReads {
  /** `users.journal_prompts`, in order. */
  readPrompts(): Promise<JournalPrompt[]>;
  /** The date's answers, or null with no entry. */
  readAnswers(onDate: string): Promise<Record<string, string> | null>;
}

export interface JournalStore extends JournalReads, QuoteSource {
  /** Merges one key into the date's entry, making the entry if need be. */
  mergeAnswer(onDate: string, key: string, value: string): Promise<void>;
}

/** The date's entry, or null with nothing written. */
export async function readJournalEntry(
  reads: JournalReads,
  onDate: string,
): Promise<JournalEntryRecord | null> {
  const answers = await reads.readAnswers(onDate);
  return answers === null ? null : { onDate, answers };
}

export async function readJournal(
  store: JournalStore,
  dateKey: string,
): Promise<JournalRead> {
  const prompts = await store.readPrompts();
  return {
    entry: await readJournalEntry(store, dateKey),
    prompts:
      prompts.length > 0
        ? prompts
        : DEFAULT_JOURNAL_PROMPTS.map(({ key, label }) => ({ key, label })),
    quote: await pickQuote(store, dateKey),
  };
}

export async function saveJournalAnswer(
  store: JournalStore,
  { date, key, value }: JournalSaveInput,
): Promise<JournalEntryRecord> {
  await store.mergeAnswer(date, key, value);
  const entry = await readJournalEntry(store, date);
  if (!entry) throw new Error("journal save read back no entry");
  return entry;
}

export function journalReads(tx: Tx, userId: string): JournalReads {
  return {
    async readPrompts() {
      const [row] = await tx
        .select({ journalPrompts: users.journalPrompts })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      return (row?.journalPrompts ?? []).map(({ key, label }) => ({ key, label }));
    },
    async readAnswers(onDate) {
      const [row] = await tx
        .select({ answers: journalEntries.answers })
        .from(journalEntries)
        .innerJoin(days, eq(days.id, journalEntries.dayId))
        .where(and(eq(journalEntries.userId, userId), eq(days.date, onDate)))
        .limit(1);
      return row?.answers ?? null;
    },
  };
}

/** The store over `journal_entries`, inside the caller's RLS transaction. */
export function journalStore(tx: Tx, userId: string): JournalStore {
  return {
    ...journalReads(tx, userId),
    ...quoteSource(tx, userId),
    async mergeAnswer(onDate, key, value) {
      const dayId = await ensureOldDayRow(tx, userId, onDate);
      await tx
        .insert(journalEntries)
        .values({ userId, dayId, answers: { [key]: value } })
        .onConflictDoUpdate({
          target: journalEntries.dayId,
          set: {
            answers: sql`${journalEntries.answers} || jsonb_build_object(${key}::text, ${value}::text)`,
            updatedAt: new Date(),
          },
        });
    },
  };
}
