import { and, desc, eq } from "drizzle-orm";
import { savedColours, type RlsClient } from "@syn/db";
import type { SavedColourRecord, SavedColourWriteInput } from "@syn/validators";
import { refuse } from "../../errors";

/**
 * Saved colours (USE-97; D-USE-36): custom colours kept for reuse, newest
 * first, one row per hex per person (`saved_colours_user_id_hex_key`).
 *
 * The rules sit over a `SavedColourStore`, so they are proved over rows in
 * memory and run over the table through `savedColourStore(tx, userId)`.
 *
 * A HEX SAVED TWICE. A new colour whose hex is already saved returns the row
 * already there, never a second one and never an error: the picker's "save"
 * is idempotent. Changing a saved colour to a hex another row holds is
 * refused "duplicate", as the fixture refuses it.
 */

export interface SavedColourStore {
  list(): Promise<SavedColourRecord[]>;
  byHex(hex: string): Promise<SavedColourRecord | null>;
  /** The new row, or null when the hex is already saved (the unique key). */
  insert(values: {
    hex: string;
    sortOrder: number;
  }): Promise<SavedColourRecord | null>;
  update(
    id: string,
    values: { hex: string; sortOrder: number },
  ): Promise<SavedColourRecord | null>;
  /** True when a row went. */
  remove(id: string): Promise<boolean>;
}

/** Newest (highest `sortOrder`) first, as the fixture lists them. */
export function listSavedColours(
  store: SavedColourStore,
): Promise<SavedColourRecord[]> {
  return store.list();
}

export async function writeSavedColour(
  store: SavedColourStore,
  { id, hex, sortOrder }: SavedColourWriteInput,
): Promise<SavedColourRecord> {
  if (id === undefined) {
    const inserted = await store.insert({ hex, sortOrder });
    if (inserted) return inserted;
    const existing = await store.byHex(hex);
    if (existing) return existing;
    // Inserted by nobody and read by nobody: the row went between the two.
    throw refuse("unknown", "No saved colour with that colour.");
  }
  const clash = await store.byHex(hex);
  if (clash && clash.id !== id) {
    throw refuse("duplicate", "That colour is already saved.");
  }
  const updated = await store.update(id, { hex, sortOrder });
  if (!updated) throw refuse("unknown", "No saved colour with that id.");
  return updated;
}

export async function removeSavedColour(
  store: SavedColourStore,
  id: string,
): Promise<void> {
  if (!(await store.remove(id))) {
    throw refuse("unknown", "No saved colour with that id.");
  }
}

/* ------------------------------------------------------------ the table -- */

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

const COLUMNS = {
  id: savedColours.id,
  createdAt: savedColours.createdAt,
  updatedAt: savedColours.updatedAt,
  hex: savedColours.hex,
  sortOrder: savedColours.sortOrder,
} as const;

type Row = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  hex: string;
  sortOrder: number;
};

function toRecord(row: Row): SavedColourRecord {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** The store over `saved_colours`, inside the caller's RLS transaction. */
export function savedColourStore(tx: Tx, userId: string): SavedColourStore {
  const mine = eq(savedColours.userId, userId);
  const first = (rows: Row[]) => (rows[0] ? toRecord(rows[0]) : null);
  return {
    async list() {
      const rows = await tx
        .select(COLUMNS)
        .from(savedColours)
        .where(mine)
        .orderBy(desc(savedColours.sortOrder), desc(savedColours.createdAt));
      return rows.map(toRecord);
    },
    async byHex(hex) {
      return first(
        await tx
          .select(COLUMNS)
          .from(savedColours)
          .where(and(mine, eq(savedColours.hex, hex)))
          .limit(1),
      );
    },
    async insert(values) {
      return first(
        await tx
          .insert(savedColours)
          .values({ ...values, userId })
          .onConflictDoNothing({
            target: [savedColours.userId, savedColours.hex],
          })
          .returning(COLUMNS),
      );
    },
    async update(id, values) {
      return first(
        await tx
          .update(savedColours)
          .set({ ...values, updatedAt: new Date() })
          .where(and(mine, eq(savedColours.id, id)))
          .returning(COLUMNS),
      );
    },
    async remove(id) {
      const rows = await tx
        .delete(savedColours)
        .where(and(mine, eq(savedColours.id, id)))
        .returning({ id: savedColours.id });
      return rows.length > 0;
    },
  };
}
