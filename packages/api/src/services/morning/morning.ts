import { and, asc, eq, isNull } from "drizzle-orm";
import { days, links, passages, type RlsClient } from "@syn/db";
import { addDays } from "@syn/utils";
import type {
  JournalEntryRecord,
  LinkRecord,
  MorningLinesInput,
  MorningLinesRecord,
  PassageRecord,
  QuoteRecord,
} from "@syn/validators";
import { ensureOldDayRow } from "../day/old-day-row";
import {
  journalReads,
  readJournalEntry,
  type JournalPrompt,
  type JournalReads,
} from "../journal/journal";
import { pickQuote, quoteSource, type QuoteSource } from "./quote";

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

/**
 * Orient's reads and its one write (USE-96), on the old tables: the reading
 * from `passages`, `links` and the quote bank (read only), the three lines
 * from the date's `days` row (`morning_gratitude`, `intention`,
 * `visualisation`, and no other column of it), and last night from
 * `journal_entries`. Two reads, as the fixture splits them, so the reading
 * alone can wait or fail (D-USE-63).
 */

export type Reading = {
  passages: PassageRecord[];
  quote: QuoteRecord | null;
  links: LinkRecord[];
};

export type MorningDay = {
  lines: MorningLinesRecord | null;
  lastNight: JournalEntryRecord | null;
  prompts: JournalPrompt[];
};

type Stamps = { id: string; createdAt: Date; updatedAt: Date };

export type PassageRow = Stamps & {
  title: string | null;
  bodyMd: string;
  images: string[];
  sortOrder: number;
};

export type LinkRow = Stamps & {
  title: string;
  url: string;
  kind: "spotify" | "other";
  sortOrder: number;
};

/** The `days` row's three morning columns, by their own names. */
export type LinesRow = {
  morningGratitude: string | null;
  intention: string | null;
  visualisation: string | null;
};

export interface MorningStore extends QuoteSource, JournalReads {
  /** Not archived, in the frame's order. */
  activePassages(): Promise<PassageRow[]>;
  activeLinks(): Promise<LinkRow[]>;
  /** Null with no `days` row for the date. */
  readLines(onDate: string): Promise<LinesRow | null>;
  /** Only the columns in `patch` change; the row is made if need be. */
  writeLines(onDate: string, patch: Partial<LinesRow>): Promise<void>;
}

function stampsOf(row: Stamps) {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function readReading(
  store: MorningStore,
  dateKey: string,
): Promise<Reading> {
  // One transaction's connection: the reads go in turn, never in parallel.
  const passageRows = await store.activePassages();
  const linkRows = await store.activeLinks();
  const quote = await pickQuote(store, dateKey);
  return {
    passages: passageRows.map((row) => ({
      ...stampsOf(row),
      title: row.title,
      bodyMd: row.bodyMd,
      images: row.images,
      sortOrder: row.sortOrder,
    })),
    quote,
    links: linkRows.map((row) => ({
      ...stampsOf(row),
      title: row.title,
      url: row.url,
      kind: row.kind,
      sortOrder: row.sortOrder,
    })),
  };
}

function linesRecord(onDate: string, row: LinesRow): MorningLinesRecord {
  return {
    onDate,
    grateful: row.morningGratitude,
    intention: row.intention,
    todayAsISeeIt: row.visualisation,
  };
}

/** The date's lines, yesterday's evening and the prompts it was written under. */
export async function readMorningDay(
  store: MorningStore,
  dateKey: string,
): Promise<MorningDay> {
  const lines = await store.readLines(dateKey);
  return {
    lines: lines === null ? null : linesRecord(dateKey, lines),
    lastNight: await readJournalEntry(store, addDays(dateKey, -1)),
    prompts: await store.readPrompts(),
  };
}

/** An autosave: only the lines sent change. */
export async function writeMorningLines(
  store: MorningStore,
  { onDate, grateful, intention, todayAsISeeIt }: MorningLinesInput,
): Promise<MorningLinesRecord> {
  const patch: Partial<LinesRow> = {};
  if (grateful !== undefined) patch.morningGratitude = grateful;
  if (intention !== undefined) patch.intention = intention;
  if (todayAsISeeIt !== undefined) patch.visualisation = todayAsISeeIt;
  await store.writeLines(onDate, patch);
  const row = await store.readLines(onDate);
  return linesRecord(
    onDate,
    row ?? { morningGratitude: null, intention: null, visualisation: null },
  );
}

/** The store over the old tables, inside the caller's RLS transaction. */
export function morningStore(tx: Tx, userId: string): MorningStore {
  const ofDate = (onDate: string) =>
    and(eq(days.userId, userId), eq(days.date, onDate));
  return {
    ...quoteSource(tx, userId),
    ...journalReads(tx, userId),
    activePassages() {
      return tx
        .select({
          id: passages.id,
          createdAt: passages.createdAt,
          updatedAt: passages.updatedAt,
          title: passages.title,
          bodyMd: passages.bodyMd,
          images: passages.images,
          sortOrder: passages.sortOrder,
        })
        .from(passages)
        .where(and(eq(passages.userId, userId), isNull(passages.archivedAt)))
        .orderBy(
          asc(passages.sortOrder),
          asc(passages.createdAt),
          asc(passages.id),
        );
    },
    activeLinks() {
      return tx
        .select({
          id: links.id,
          createdAt: links.createdAt,
          updatedAt: links.updatedAt,
          title: links.title,
          url: links.url,
          kind: links.kind,
          sortOrder: links.sortOrder,
        })
        .from(links)
        .where(and(eq(links.userId, userId), isNull(links.archivedAt)))
        .orderBy(asc(links.sortOrder), asc(links.createdAt), asc(links.id));
    },
    async readLines(onDate) {
      const [row] = await tx
        .select({
          morningGratitude: days.morningGratitude,
          intention: days.intention,
          visualisation: days.visualisation,
        })
        .from(days)
        .where(ofDate(onDate))
        .limit(1);
      return row ?? null;
    },
    async writeLines(onDate, patch) {
      await ensureOldDayRow(tx, userId, onDate);
      if (Object.keys(patch).length === 0) return;
      await tx
        .update(days)
        .set({ ...patch, updatedAt: new Date() })
        .where(ofDate(onDate));
    },
  };
}
