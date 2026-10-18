import { eq, getTableColumns, type Table } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { RlsClient } from "@syn/db";
import { UNDO_TABLES, type Row, type UndoTable } from "./tables";

/**
 * Row writes by record (USE-92), for the planner's writes and their Undo:
 * insert, update and delete one row by id, each saying whether it reached a
 * row. Runs only inside `rls.execute` (its `tx`), so a row of another user's
 * is invisible: its update or delete reaches nothing, and the caller refuses.
 */

export interface RowStore {
  /** False when a row with that id already stands (or RLS refuses it). */
  insert(table: UndoTable, row: Row): Promise<boolean>;
  /** False when no row with that id is the caller's. */
  update(table: UndoTable, row: Row): Promise<boolean>;
  remove(table: UndoTable, id: string): Promise<boolean>;
}

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

/**
 * A record as Drizzle's insert values: only the table's own columns, an
 * instant back to a `Date`, and the caller's `user_id`.
 */
export function valuesOf(
  table: Table,
  row: Row,
  userId: string,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(getTableColumns(table))) {
    if (key === "userId" || !(key in row)) continue;
    const value = row[key];
    values[key] =
      column.dataType === "date" && typeof value === "string"
        ? new Date(value)
        : value;
  }
  if ("userId" in getTableColumns(table)) values.userId = userId;
  return values;
}

export function rowStore(tx: Tx, userId: string): RowStore {
  // Every table here has `id`; Drizzle's types cannot see it through the union.
  const tableOf = (name: UndoTable) =>
    UNDO_TABLES[name].table as unknown as PgTable & { id: PgColumn };

  return {
    async insert(name, row) {
      const table = tableOf(name);
      const made = await tx
        .insert(table)
        .values(valuesOf(table, row, userId))
        .onConflictDoNothing()
        .returning({ id: table.id });
      return made.length === 1;
    },

    async update(name, row) {
      const table = tableOf(name);
      const values = valuesOf(table, row, userId);
      delete values.id;
      const changed = await tx
        .update(table)
        .set(values)
        .where(eq(table.id, row.id))
        .returning({ id: table.id });
      return changed.length === 1;
    },

    async remove(name, id) {
      const table = tableOf(name);
      const gone = await tx
        .delete(table)
        .where(eq(table.id, id))
        .returning({ id: table.id });
      return gone.length === 1;
    },
  };
}
