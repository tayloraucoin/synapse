import { eq, inArray, or } from "drizzle-orm";
import {
  blockChanges,
  blockItems,
  blocks,
  clients,
  dayBounds,
  dayEvents,
  slots,
  users,
  type RlsClient,
} from "@syn/db";
import {
  blockChangeRecord,
  blockItemRecord,
  blockRecord,
  clientRecord,
  dayBoundsRecord,
  dayEventRecord,
  slotRecord,
} from "@syn/validators";
import type { RowStore } from "../undo/row-store";
import type { RowChange } from "../undo/undo";
import { recordsOf } from "./row-records";
import type { WriteRows } from "./write-journal";

/**
 * The planner writes' database half (USE-92): read the rows a plan needs,
 * then write what it changed. Runs only inside `rls.execute` (its `tx`), so
 * every row read is the caller's and every row written is checked by RLS.
 *
 * WHAT IS READ. Blocks, items, events, bounds and clients whole, as the
 * reads do (one person's few hundred rows). Block changes and slots, which
 * grow with every date, only for the blocks the write names: the plan
 * reads nothing else of them.
 */

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

/** `HH:MM` from Postgres's `HH:MM:SS`. */
function clockOf(value: string): string {
  return value.slice(0, 5);
}

/** The rows a write reads, without the date-keyed ones. */
export type BaseRows = Omit<WriteRows, "blockChanges" | "slots">;

export async function selectBaseRows(
  tx: Tx,
  userId: string,
): Promise<BaseRows> {
  const [account] = await tx
    .select({ timeZone: users.timezone, usualWakeTime: users.usualWakeTime })
    .from(users)
    .where(eq(users.id, userId));
  if (!account) throw new Error("No account row.");
  return {
    timeZone: account.timeZone,
    usualWakeTime: clockOf(account.usualWakeTime),
    blocks: recordsOf(blockRecord, await tx.select().from(blocks)),
    blockItems: recordsOf(blockItemRecord, await tx.select().from(blockItems)),
    dayEvents: recordsOf(dayEventRecord, await tx.select().from(dayEvents)),
    dayBounds: recordsOf(dayBoundsRecord, await tx.select().from(dayBounds)),
    clients: recordsOf(clientRecord, await tx.select().from(clients)),
  };
}

/** The named blocks' changes and slots, and every slot of their items. */
export async function selectBlockRows(
  tx: Tx,
  base: BaseRows,
  blockIds: readonly string[],
): Promise<WriteRows> {
  const ids = [...new Set(blockIds)];
  if (ids.length === 0) return { ...base, blockChanges: [], slots: [] };
  const itemIds = base.blockItems
    .filter((item) => ids.includes(item.blockId))
    .map((item) => item.id);
  const slotRows = await tx
    .select()
    .from(slots)
    .where(
      itemIds.length === 0
        ? inArray(slots.blockId, ids)
        : or(inArray(slots.blockId, ids), inArray(slots.blockItemId, itemIds)),
    );
  return {
    ...base,
    blockChanges: recordsOf(
      blockChangeRecord,
      await tx
        .select()
        .from(blockChanges)
        .where(inArray(blockChanges.blockId, ids)),
    ),
    slots: recordsOf(slotRecord, slotRows),
  };
}

/**
 * Writes a plan's changes in the order it made them: a parent before the
 * rows that name it, a child's delete before its parent's. A step that
 * reaches no row fails the whole write, which the transaction rolls back.
 */
export async function applyChanges(
  store: RowStore,
  changes: readonly RowChange[],
): Promise<void> {
  for (const { table, id, before, after } of changes) {
    let reached = true;
    if (before === null && after !== null) {
      reached = await store.insert(table, after);
    } else if (before !== null && after !== null) {
      reached = await store.update(table, after);
    } else if (before !== null) {
      reached = await store.remove(table, id);
    }
    if (!reached) throw new Error(`The write could not reach ${table} ${id}.`);
  }
}
