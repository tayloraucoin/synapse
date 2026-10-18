import type { RowChange } from "../undo/undo";
import type { PlannerRows } from "./planner-rows";

/**
 * The planner writes' pure half (USE-92): each write is a plan over the
 * caller's rows in memory, made through this journal, as the fixture server
 * makes it (`lib/fixtures/planner/journal.ts`). The journal notes every row
 * as it stood before its first touch, so `changes()` says exactly what the
 * write did, row by row: what `applyChanges` writes to Postgres and what
 * Undo puts back. The tests read the plan; nothing here touches a database.
 */

/** The rows a planner write reads and changes. */
export type WriteRows = Pick<
  PlannerRows,
  | "timeZone"
  | "usualWakeTime"
  | "blocks"
  | "blockChanges"
  | "blockItems"
  | "slots"
  | "dayEvents"
  | "dayBounds"
  | "clients"
>;

export type WriteTable =
  | "blocks"
  | "blockChanges"
  | "blockItems"
  | "slots"
  | "dayEvents"
  | "dayBounds";

/** The write's clock and its new rows' ids. */
export interface WriteClock {
  now: () => Date;
  newId: () => string;
}

export const systemClock: WriteClock = {
  now: () => new Date(),
  newId: () => crypto.randomUUID(),
};

type Row = { id: string };

export class WriteJournal {
  private readonly before = new Map<
    string,
    { table: WriteTable; id: string; row: Row | null }
  >();

  constructor(
    readonly rows: WriteRows,
    private readonly clock: WriteClock = systemClock,
  ) {}

  now(): Date {
    return this.clock.now();
  }

  stamp(): string {
    return this.clock.now().toISOString();
  }

  /** A new row's id and both stamps. */
  stamps(): { id: string; createdAt: string; updatedAt: string } {
    const at = this.stamp();
    return { id: this.clock.newId(), createdAt: at, updatedAt: at };
  }

  private list(table: WriteTable): Row[] {
    return this.rows[table] as Row[];
  }

  private note(table: WriteTable, id: string) {
    const key = `${table}:${id}`;
    if (this.before.has(key)) return;
    const row = this.list(table).find((r) => r.id === id);
    this.before.set(key, {
      table,
      id,
      row: row === undefined ? null : structuredClone(row),
    });
  }

  /** Inserts the row, or replaces the row with its id. */
  put<T extends Row>(table: WriteTable, row: T): T {
    this.note(table, row.id);
    const rows = this.list(table);
    const index = rows.findIndex((r) => r.id === row.id);
    if (index === -1) rows.push(row);
    else rows[index] = row;
    return row;
  }

  remove(table: WriteTable, id: string) {
    this.note(table, id);
    const rows = this.list(table);
    const index = rows.findIndex((r) => r.id === id);
    if (index !== -1) rows.splice(index, 1);
  }

  /** A block goes with its changes, items and slots (0012's cascades). */
  removeBlock(id: string) {
    for (const change of this.rows.blockChanges.filter(
      (c) => c.blockId === id,
    )) {
      this.remove("blockChanges", change.id);
    }
    for (const item of this.rows.blockItems.filter((i) => i.blockId === id)) {
      this.removeItem(item.id);
    }
    for (const slot of this.rows.slots.filter((s) => s.blockId === id)) {
      this.remove("slots", slot.id);
    }
    this.remove("blocks", id);
  }

  /** An item goes with its slots (`slots_block_item_id_block_items_id_fk`). */
  removeItem(id: string) {
    for (const slot of this.rows.slots.filter((s) => s.blockItemId === id)) {
      this.remove("slots", slot.id);
    }
    this.remove("blockItems", id);
  }

  /** Every row the write touched, in first-touch order, before and after. */
  changes(): RowChange[] {
    return [...this.before.values()].map(({ table, id, row }) => {
      const after = this.list(table).find((r) => r.id === id) ?? null;
      return {
        table,
        id,
        before: row as RowChange["before"],
        after:
          after === null
            ? null
            : (structuredClone(after) as RowChange["after"]),
      };
    });
  }
}
