import { and, eq, isNotNull, isNull, lt } from "drizzle-orm";
import { dayRecords, type RlsClient } from "@syn/db";
import type { DayRecordRecord, DayStampInput } from "@syn/validators";

/**
 * The day's record (USE-96): when it was oriented and when Ready, go was
 * pressed, one `day_records` row per date.
 *
 * FIRST WRITE WINS. A stamp inserts the date's row with `ON CONFLICT DO
 * NOTHING`, fills its column only while it is null, then reads the row back,
 * all in one transaction. Two opens racing both land on the unique
 * `(user_id, on_date)`; the loser's insert does nothing and its fill finds
 * the column already set, so the first instant stays.
 *
 * Ready, go on a date with no row yet orients it at the same minute, as the
 * fixture does [ASSUMPTION there: Review the day is reached only after
 * Orient].
 */

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

export type DayRecordRow = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  onDate: string;
  orientedAt: Date | null;
  readyAt: Date | null;
  closedAt: Date | null;
};

export type StampColumn = "orientedAt" | "readyAt";

/** The reads and writes the stamps need, over one person's rows. */
export interface DayRecordStore {
  /** `INSERT … ON CONFLICT (user_id, on_date) DO NOTHING`. */
  insertIfAbsent(row: {
    onDate: string;
    orientedAt: Date;
    readyAt: Date | null;
  }): Promise<void>;
  /** Sets `column` to `at` only where it is still null. */
  fillIfEmpty(onDate: string, column: StampColumn, at: Date): Promise<void>;
  read(onDate: string): Promise<DayRecordRow | null>;
  /** Whether any date before `onDate` has a `ready_at`. */
  anyReadyBefore(onDate: string): Promise<boolean>;
}

function toRecord(row: DayRecordRow): DayRecordRecord {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    onDate: row.onDate,
    orientedAt: row.orientedAt?.toISOString() ?? null,
    readyAt: row.readyAt?.toISOString() ?? null,
    closedAt: row.closedAt?.toISOString() ?? null,
  };
}

async function stamp(
  store: DayRecordStore,
  { dateKey, at }: DayStampInput,
  column: StampColumn,
): Promise<DayRecordRecord> {
  const instant = new Date(at);
  await store.insertIfAbsent({
    onDate: dateKey,
    orientedAt: instant,
    readyAt: column === "readyAt" ? instant : null,
  });
  await store.fillIfEmpty(dateKey, column, instant);
  const row = await store.read(dateKey);
  if (!row) throw new Error("day_records stamp read back no row");
  return toRecord(row);
}

/** The open is the wake: `oriented_at`, once. */
export function stampOrient(
  store: DayRecordStore,
  input: DayStampInput,
): Promise<DayRecordRecord> {
  return stamp(store, input, "orientedAt");
}

/** Ready, go (D-USE-71): `ready_at`, once. */
export function readyGo(
  store: DayRecordStore,
  input: DayStampInput,
): Promise<DayRecordRecord> {
  return stamp(store, input, "readyAt");
}

/** The welcome's first go ever is derived from this; nothing is stored for it. */
export function readReadiedBefore(
  store: DayRecordStore,
  dateKey: string,
): Promise<boolean> {
  return store.anyReadyBefore(dateKey);
}

const STAMP_COLUMNS = {
  orientedAt: dayRecords.orientedAt,
  readyAt: dayRecords.readyAt,
} as const;

/** The store over `day_records`, inside the caller's RLS transaction. */
export function dayRecordStore(tx: Tx, userId: string): DayRecordStore {
  const ofDate = (onDate: string) =>
    and(eq(dayRecords.userId, userId), eq(dayRecords.onDate, onDate));
  return {
    async insertIfAbsent(row) {
      await tx
        .insert(dayRecords)
        .values({ userId, ...row })
        .onConflictDoNothing({
          target: [dayRecords.userId, dayRecords.onDate],
        });
    },
    async fillIfEmpty(onDate, column, at) {
      await tx
        .update(dayRecords)
        .set({ [column]: at, updatedAt: new Date() })
        .where(and(ofDate(onDate), isNull(STAMP_COLUMNS[column])));
    },
    async read(onDate) {
      const [row] = await tx
        .select({
          id: dayRecords.id,
          createdAt: dayRecords.createdAt,
          updatedAt: dayRecords.updatedAt,
          onDate: dayRecords.onDate,
          orientedAt: dayRecords.orientedAt,
          readyAt: dayRecords.readyAt,
          closedAt: dayRecords.closedAt,
        })
        .from(dayRecords)
        .where(ofDate(onDate))
        .limit(1);
      return row ?? null;
    },
    async anyReadyBefore(onDate) {
      const [row] = await tx
        .select({ id: dayRecords.id })
        .from(dayRecords)
        .where(
          and(
            eq(dayRecords.userId, userId),
            lt(dayRecords.onDate, onDate),
            isNotNull(dayRecords.readyAt),
          ),
        )
        .limit(1);
      return row !== undefined;
    },
  };
}
