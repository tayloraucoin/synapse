import type { FixtureRecords } from "../records";

/**
 * Every planner write's Undo (USE-36): a write notes each row it touches as
 * it was before the first touch, and Undo puts exactly those rows back, no
 * more. A row the write made is removed again; a row it removed comes back.
 */

export type PlannerTable =
  | "blocks"
  | "blockChanges"
  | "blockItems"
  | "slots"
  | "dayEvents"
  | "dayBounds";

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
