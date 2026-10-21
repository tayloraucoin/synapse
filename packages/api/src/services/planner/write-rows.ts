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
  type SlotRecord,
} from "@syn/validators";
import type { RowStore } from "../undo/row-store";
import type { RowChange } from "../undo/undo";
import { recordsOf } from "./row-records";
import type { WriteRows } from "./write-journal";
import type { SlotKeys } from "./write-slots";

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
  // Independent reads, sent together on the transaction's connection
  // (pipelined): one round trip for every write's base rows, not six.
  const [[account], blockRows, itemRows, eventRows, boundsRows, clientRows] =
    await Promise.all([
      tx
        .select({
          timeZone: users.timezone,
          usualWakeTime: users.usualWakeTime,
        })
        .from(users)
        .where(eq(users.id, userId)),
      tx.select().from(blocks),
      tx.select().from(blockItems),
      tx.select().from(dayEvents),
      tx.select().from(dayBounds),
      tx.select().from(clients),
    ]);
  if (!account) throw new Error("No account row.");
  return {
    timeZone: account.timeZone,
    usualWakeTime: clockOf(account.usualWakeTime),
    blocks: recordsOf(blockRecord, blockRows),
    blockItems: recordsOf(blockItemRecord, itemRows),
    dayEvents: recordsOf(dayEventRecord, eventRows),
    dayBounds: recordsOf(dayBoundsRecord, boundsRows),
    clients: recordsOf(clientRecord, clientRows),
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
 * The slots a slot write names beyond its block's (USE-94), merged into
 * `read`: the slots by id, then every slot holding the same item, to-do or
 * work item as those or as `keys` names, on any date and in any block.
 */
export async function selectSlotRows(
  tx: Tx,
  read: readonly SlotRecord[],
  keys: SlotKeys,
): Promise<SlotRecord[]> {
  const byId = new Map(read.map((slot) => [slot.id, slot]));
  const add = (rows: readonly Record<string, unknown>[]) => {
    for (const slot of recordsOf(slotRecord, rows)) byId.set(slot.id, slot);
  };
  const ids = [...(keys.ids ?? [])];
  const own =
    ids.length === 0
      ? []
      : recordsOf(
          slotRecord,
          await tx.select().from(slots).where(inArray(slots.id, ids)),
        );
  add(own);
  const of = (key: keyof SlotRecord, given: readonly string[] = []) => [
    ...new Set([
      ...given,
      ...own.flatMap((slot) => (slot[key] ? [slot[key] as string] : [])),
    ]),
  ];
  const blockItemIds = of("blockItemId", keys.blockItemIds);
  const todoIds = of("todoId", keys.todoIds);
  const workItemIds = of("workItemId", keys.workItemIds);
  const filters = [
    blockItemIds.length > 0 && inArray(slots.blockItemId, blockItemIds),
    todoIds.length > 0 && inArray(slots.todoId, todoIds),
    workItemIds.length > 0 && inArray(slots.workItemId, workItemIds),
  ].filter((filter) => filter !== false);
  if (filters.length > 0) {
    add(
      await tx
        .select()
        .from(slots)
        .where(or(...filters)),
    );
  }
  return [...byId.values()];
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
