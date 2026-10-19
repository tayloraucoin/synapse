import type { FixtureRecords } from "../records";

/**
 * Every planner and work write's Undo (USE-36, USE-55): a write notes each row it touches as
 * it was before the first touch, and Undo puts exactly those rows back, no
 * more. A row the write made is removed again; a row it removed comes back.
 */

export type PlannerTable =
  | "blocks"
  | "blockChanges"
  | "blockItems"
  | "slots"
  | "dayEvents"
  | "dayBounds"
  | "workItems"
  | "clients";

type Row = { id: string };

export interface JournalEntry {
  table: PlannerTable;
  id: string;
  /** The row before the write; null when the write made it. */
  before: Row | null;
  /** Its place in its table then, so Undo puts it back there. */
  index: number;
}

function rowsOf(records: FixtureRecords, table: PlannerTable): Row[] {
  return records[table] as Row[];
}

/** One write's touches, applied to the records as they are made. */
export class Journal {
  private readonly entries = new Map<string, JournalEntry>();

  constructor(private readonly records: FixtureRecords) {}

  private note(table: PlannerTable, id: string) {
    const key = `${table}:${id}`;
    if (this.entries.has(key)) return;
    const rows = rowsOf(this.records, table);
    const index = rows.findIndex((r) => r.id === id);
    this.entries.set(key, {
      table,
      id,
      before: index === -1 ? null : structuredClone(rows[index]!),
      index,
    });
  }

  /** Inserts the row, or replaces the row with its id. */
  put<T extends Row>(table: PlannerTable, row: T): T {
    this.note(table, row.id);
    const rows = rowsOf(this.records, table);
    const index = rows.findIndex((r) => r.id === row.id);
    if (index === -1) rows.push(row);
    else rows[index] = row;
    return row;
  }

  remove(table: PlannerTable, id: string) {
    this.note(table, id);
    const rows = rowsOf(this.records, table);
    const index = rows.findIndex((r) => r.id === id);
    if (index !== -1) rows.splice(index, 1);
  }

  /** A block goes with its changes, items and slots (0012's cascades). */
  removeBlock(id: string) {
    for (const change of this.records.blockChanges.filter(
      (c) => c.blockId === id,
    )) {
      this.remove("blockChanges", change.id);
    }
    for (const item of this.records.blockItems.filter(
      (i) => i.blockId === id,
    )) {
      this.removeItem(item.id);
    }
    for (const slot of this.records.slots.filter((s) => s.blockId === id)) {
      this.remove("slots", slot.id);
    }
    this.remove("blocks", id);
  }

  /** An item goes with its slots (`slots_block_item_id_block_items_id_fk`). */
  removeItem(id: string) {
    for (const slot of this.records.slots.filter((s) => s.blockItemId === id)) {
      this.remove("slots", slot.id);
    }
    this.remove("blockItems", id);
  }

  done(): JournalEntry[] {
    return [...this.entries.values()];
  }
}

/** Puts every touched row back as it was and where it was, in reverse. */
export function restore(records: FixtureRecords, entries: JournalEntry[]) {
  for (const entry of [...entries].reverse()) {
    const rows = rowsOf(records, entry.table);
    const index = rows.findIndex((r) => r.id === entry.id);
    if (entry.before === null) {
      if (index !== -1) rows.splice(index, 1);
    } else if (index === -1) {
      rows.splice(entry.index, 0, structuredClone(entry.before));
    } else {
      rows[index] = structuredClone(entry.before);
    }
  }
}

/** What a committed write hands back: its Undo token and what it returned. */
export interface Committed<T> {
  undo: string;
  out: T;
}

/**
 * The one Undo scheme for every fixture write (USE-36; work joins in
 * USE-55): a write is all or nothing through a journal, and its token puts
 * back exactly the rows it touched.
 */
export interface WriteLog {
  commit<T>(fn: (journal: Journal) => T): Promise<Committed<T>>;
  undo(token: string): Promise<void>;
}

export function createWriteLog({
  records,
  isOffline,
  offlineError,
  unknownUndo,
}: {
  records: FixtureRecords;
  isOffline: () => boolean;
  offlineError: () => Error;
  unknownUndo: () => Error;
}): WriteLog {
  const undos = new Map<string, JournalEntry[]>();
  return {
    commit(fn) {
      if (isOffline()) return Promise.reject(offlineError());
      const journal = new Journal(records);
      try {
        const out = fn(journal);
        const token = crypto.randomUUID();
        undos.set(token, journal.done());
        return Promise.resolve({ undo: token, out });
      } catch (error) {
        restore(records, journal.done());
        return Promise.reject(error);
      }
    },
    undo(token) {
      if (isOffline()) return Promise.reject(offlineError());
      const entries = undos.get(token);
      if (!entries) return Promise.reject(unknownUndo());
      undos.delete(token);
      restore(records, entries);
      return Promise.resolve();
    },
  };
}
