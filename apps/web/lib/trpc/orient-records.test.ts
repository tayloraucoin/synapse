import { describe, expect, it } from "vitest";
import {
  readJournal,
  readMorningDay,
  readReadiedBefore,
  readReading,
  readyGo,
  saveJournalAnswer,
  stampOrient,
  writeMorningLines,
  type DayRecordRow,
  type DayRecordStore,
  type JournalStore,
  type MorningStore,
} from "@syn/api";
import {
  dayRecordRecord,
  journalEntryRecord,
  linkRecord,
  morningLinesRecord,
  passageRecord,
  quoteRecord,
} from "@syn/validators";
import type { JournalRecords } from "@/lib/data/journal-records";
import { orientDomain } from "@/lib/data/live/orient";
import type {
  MorningDayRecords,
  ReadingRecords,
} from "@/lib/data/morning-records";
import { JournalWriteRefusal, MorningLinesRefusal } from "@/lib/data/refusals";
import type { TrpcClient } from "@/lib/trpc/client";

/**
 * USE-96's C1 to C4: the day's stamps, the readied-before read, the
 * journal's one-key merge and the morning's reads, each over rows in memory
 * kept as the tables keep them (the unique `(user_id, on_date)`, the jsonb
 * `||`). The services take a store, so this proves the rules the routers run
 * inside `ctx.rls.execute()`.
 */

const STAMP = new Date("2026-10-12T06:00:00.000Z");

function memoryDayRecords(): DayRecordStore & { rows: DayRecordRow[] } {
  const rows: DayRecordRow[] = [];
  return {
    rows,
    insertIfAbsent(row) {
      // ON CONFLICT (user_id, on_date) DO NOTHING.
      if (!rows.some((r) => r.onDate === row.onDate)) {
        rows.push({
          id: crypto.randomUUID(),
          createdAt: STAMP,
          updatedAt: STAMP,
          closedAt: null,
          ...row,
        });
      }
      return Promise.resolve();
    },
    fillIfEmpty(onDate, column, at) {
      const row = rows.find((r) => r.onDate === onDate);
      if (row && row[column] === null) row[column] = at;
      return Promise.resolve();
    },
    read: (onDate) =>
      Promise.resolve(rows.find((r) => r.onDate === onDate) ?? null),
    anyReadyBefore: (onDate) =>
      Promise.resolve(
        rows.some((r) => r.onDate < onDate && r.readyAt !== null),
      ),
  };
}

type Lines = {
  morningGratitude: string | null;
  intention: string | null;
  visualisation: string | null;
};

/** The old tables a person's morning and evening read, in memory. */
function memoryOldTables(
  seed: {
    prompts?: { key: string; label: string }[];
    answers?: Record<string, Record<string, string>>;
    lines?: Record<string, Lines>;
    optIn?: boolean;
  } = {},
): MorningStore &
  JournalStore & {
    answers: Record<string, Record<string, string>>;
    lines: Record<string, Lines>;
  } {
  const answers = structuredClone(seed.answers ?? {});
  const lines = structuredClone(seed.lines ?? {});
  const stamps = (n: number) => ({
    id: `5b0f7d0e-3c1a-4f7b-9a3e-0d6c2b1e8f4${n}`,
    createdAt: STAMP,
    updatedAt: STAMP,
  });
  return {
    answers,
    lines,
    readPrompts: () => Promise.resolve(seed.prompts ?? []),
    readAnswers: (onDate) => Promise.resolve(answers[onDate] ?? null),
    mergeAnswer(onDate, key, value) {
      // answers || jsonb_build_object(key, value)
      answers[onDate] = { ...(answers[onDate] ?? {}), [key]: value };
      return Promise.resolve();
    },
    quotesOptIn: () => Promise.resolve(seed.optIn ?? true),
    publishedQuotes: () =>
      Promise.resolve([
        { ...stamps(1), text: "One quiet line.", attribution: "Someone" },
      ]),
    activePassages: () =>
      Promise.resolve([
        {
          ...stamps(2),
          title: "Morning reading",
          bodyMd: "Begin where the feet are.",
          images: [],
          sortOrder: 0,
        },
      ]),
    activeLinks: () =>
      Promise.resolve([
        {
          ...stamps(3),
          title: "Morning calm",
          url: "https://open.spotify.com/playlist/morning-calm",
          kind: "spotify" as const,
          sortOrder: 0,
        },
      ]),
    readLines: (onDate) => Promise.resolve(lines[onDate] ?? null),
    writeLines(onDate, patch) {
      lines[onDate] = {
        ...(lines[onDate] ?? {
          morningGratitude: null,
          intention: null,
          visualisation: null,
        }),
        ...patch,
      };
      return Promise.resolve();
    },
  };
}

describe("C1: the stamps keep their first instant", () => {
  it("stampOrient writes the first and a later call returns it unchanged", async () => {
    const store = memoryDayRecords();
    const first = await stampOrient(store, {
      dateKey: "2026-10-12",
      at: "2026-10-12T06:58:00.000Z",
    });
    const second = await stampOrient(store, {
      dateKey: "2026-10-12",
      at: "2026-10-12T08:30:00.000Z",
    });
    expect(dayRecordRecord.parse(first).orientedAt).toBe(
      "2026-10-12T06:58:00.000Z",
    );
    expect(second).toEqual(first);
    expect(store.rows).toHaveLength(1);
  });

  it("readyGo writes the first and a later call returns it unchanged", async () => {
    const store = memoryDayRecords();
    await stampOrient(store, {
      dateKey: "2026-10-12",
      at: "2026-10-12T06:58:00.000Z",
    });
    const first = await readyGo(store, {
      dateKey: "2026-10-12",
      at: "2026-10-12T07:05:00.000Z",
    });
    const second = await readyGo(store, {
      dateKey: "2026-10-12",
      at: "2026-10-12T09:00:00.000Z",
    });
    expect(first.readyAt).toBe("2026-10-12T07:05:00.000Z");
    expect(first.orientedAt).toBe("2026-10-12T06:58:00.000Z");
    expect(second).toEqual(first);
  });

  it("readyGo on a date with no row orients it at the same minute", async () => {
    const store = memoryDayRecords();
    const record = await readyGo(store, {
      dateKey: "2026-10-12",
      at: "2026-10-12T07:05:00.000Z",
    });
    expect(record.orientedAt).toBe("2026-10-12T07:05:00.000Z");
    expect(record.readyAt).toBe("2026-10-12T07:05:00.000Z");
  });
});

describe("C2: readied before is any earlier date's ready_at", () => {
  it("is false with none, or only today's, or only an earlier orient", async () => {
    const store = memoryDayRecords();
    expect(await readReadiedBefore(store, "2026-10-12")).toBe(false);
    await stampOrient(store, {
      dateKey: "2026-10-11",
      at: "2026-10-11T07:00:00.000Z",
    });
    await readyGo(store, {
      dateKey: "2026-10-12",
      at: "2026-10-12T07:05:00.000Z",
    });
    expect(await readReadiedBefore(store, "2026-10-12")).toBe(false);
  });

  it("is true once a day before has a ready_at, and not for that day itself", async () => {
    const store = memoryDayRecords();
    await readyGo(store, {
      dateKey: "2026-10-10",
      at: "2026-10-10T07:05:00.000Z",
    });
    expect(await readReadiedBefore(store, "2026-10-12")).toBe(true);
    expect(await readReadiedBefore(store, "2026-10-10")).toBe(false);
  });
});

describe("C3: a journal save merges one answer", () => {
  it("changes only its key; the date's other answers stay", async () => {
    const store = memoryOldTables({
      answers: {
        "2026-10-12": { day_went: "Slowly.", gratitude_today: "The light." },
        "2026-10-11": { day_went: "Fine." },
      },
    });
    const entry = await saveJournalAnswer(store, {
      date: "2026-10-12",
      key: "gratitude_today",
      value: "The rain.",
    });
    expect(journalEntryRecord.parse(entry)).toEqual({
      onDate: "2026-10-12",
      answers: { day_went: "Slowly.", gratitude_today: "The rain." },
    });
    expect(store.answers["2026-10-11"]).toEqual({ day_went: "Fine." });
  });

  it("makes the entry on a date with none", async () => {
    const store = memoryOldTables();
    const entry = await saveJournalAnswer(store, {
      date: "2026-10-12",
      key: "day_went",
      value: "Well.",
    });
    expect(entry).toEqual({
      onDate: "2026-10-12",
      answers: { day_went: "Well." },
    });
  });

  it("reads the entry, the defaults when no prompts are set, and the quote", async () => {
    const read: JournalRecords = await readJournal(
      memoryOldTables(),
      "2026-10-12",
    );
    expect(read.entry).toBeNull();
    expect(read.prompts.length).toBeGreaterThan(0);
    expect(quoteRecord.parse(read.quote).onDate).toBe("2026-10-12");
    const optedOut = await readJournal(
      memoryOldTables({ optIn: false }),
      "2026-10-12",
    );
    expect(optedOut.quote).toBeNull();
  });
});

describe("C4: the morning reads in the fixture's shapes", () => {
  const store = memoryOldTables({
    prompts: [{ key: "day_went", label: "How the day went" }],
    answers: { "2026-10-11": { day_went: "Slowly." } },
    lines: {
      "2026-10-12": {
        morningGratitude: "Coffee.",
        intention: null,
        visualisation: null,
      },
    },
  });

  it("the reading: passages, the quote on its day and the links", async () => {
    // The fixture server's own answer type, checked when this file compiles.
    const live: ReadingRecords = await readReading(store, "2026-10-12");
    expect(Object.keys(live).sort()).toEqual(["links", "passages", "quote"]);
    live.passages.forEach((p) => passageRecord.parse(p));
    live.links.forEach((l) => linkRecord.parse(l));
    expect(quoteRecord.parse(live.quote).onDate).toBe("2026-10-12");
  });

  it("the day: the lines, yesterday's journal and the prompts", async () => {
    const live: MorningDayRecords = await readMorningDay(store, "2026-10-12");
    expect(Object.keys(live).sort()).toEqual(["lastNight", "lines", "prompts"]);
    expect(morningLinesRecord.parse(live.lines)).toEqual({
      onDate: "2026-10-12",
      grateful: "Coffee.",
      intention: null,
      todayAsISeeIt: null,
    });
    expect(journalEntryRecord.parse(live.lastNight)).toEqual({
      onDate: "2026-10-11",
      answers: { day_went: "Slowly." },
    });
    expect(live.prompts).toEqual([
      { key: "day_went", label: "How the day went" },
    ]);
  });

  it("no lines and no evening read as null", async () => {
    const live = await readMorningDay(memoryOldTables(), "2026-10-12");
    expect(live.lines).toBeNull();
    expect(live.lastNight).toBeNull();
  });

  it("a lines write changes only the lines sent", async () => {
    const lines = memoryOldTables({
      lines: {
        "2026-10-12": {
          morningGratitude: "Coffee.",
          intention: "Go slow.",
          visualisation: null,
        },
      },
    });
    const record = await writeMorningLines(lines, {
      onDate: "2026-10-12",
      intention: "Go slower.",
    });
    expect(morningLinesRecord.parse(record)).toEqual({
      onDate: "2026-10-12",
      grateful: "Coffee.",
      intention: "Go slower.",
      todayAsISeeIt: null,
    });
  });
});

describe("the live domain refuses bad writes before any call", () => {
  const client = {} as unknown as TrpcClient;
  const methods = orientDomain.methods(client);

  it("a journal answer past its length", async () => {
    await expect(
      methods.writeJournalAnswer?.({
        date: "2026-10-12",
        key: "day_went",
        value: "x".repeat(10_000),
      }),
    ).rejects.toBeInstanceOf(JournalWriteRefusal);
  });

  it("a morning line past its length", async () => {
    await expect(
      methods.writeMorningLines?.({
        onDate: "2026-10-12",
        intention: "x".repeat(1_000),
      }),
    ).rejects.toBeInstanceOf(MorningLinesRefusal);
  });
});
