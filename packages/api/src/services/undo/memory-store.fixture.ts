import type { RowStore } from "./row-store";
import type { Row, UndoTable } from "./tables";

/**
 * A database in memory for the write and Undo tests (USE-92): rows by table,
 * each with its owner, and RLS's one rule, that a caller reaches only their
 * own rows. `transaction` rolls every table back when its body throws, as
 * `rls.execute`'s transaction does.
 */
export interface MemoryDb {
  tables: Map<UndoTable, Map<string, { owner: string; row: Row }>>;
  storeFor(userId: string): RowStore;
  transaction<T>(body: () => Promise<T>): Promise<T>;
  /** The caller's rows of one table, as records, sorted by id. */
  rowsOf(table: UndoTable, userId: string): Row[];
}

export function memoryDb(): MemoryDb {
  const tables = new Map<UndoTable, Map<string, { owner: string; row: Row }>>();
  const tableOf = (name: UndoTable) => {
    let table = tables.get(name);
    if (!table) {
      table = new Map();
      tables.set(name, table);
    }
    return table;
  };

  const db: MemoryDb = {
    tables,
    storeFor(userId) {
      return {
        insert(name, row) {
          const table = tableOf(name);
          if (table.has(row.id)) return Promise.resolve(false);
          table.set(row.id, { owner: userId, row: structuredClone(row) });
          return Promise.resolve(true);
        },
        update(name, row) {
          const table = tableOf(name);
          const held = table.get(row.id);
          if (!held || held.owner !== userId) return Promise.resolve(false);
          table.set(row.id, { owner: userId, row: structuredClone(row) });
          return Promise.resolve(true);
        },
        remove(name, id) {
          const table = tableOf(name);
          const held = table.get(id);
          if (!held || held.owner !== userId) return Promise.resolve(false);
          table.delete(id);
          return Promise.resolve(true);
        },
      };
    },
    async transaction(body) {
      const snapshot = structuredClone(tables);
      try {
        return await body();
      } catch (error) {
        tables.clear();
        for (const [name, table] of snapshot) tables.set(name, table);
        throw error;
      }
    },
    rowsOf(name, userId) {
      return [...tableOf(name).values()]
        .filter((held) => held.owner === userId)
        .map((held) => held.row)
        .sort((a, b) => a.id.localeCompare(b.id));
    },
  };
  return db;
}
