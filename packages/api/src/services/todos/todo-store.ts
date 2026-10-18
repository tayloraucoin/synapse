import { eq, inArray, isNotNull } from "drizzle-orm";
import {
  blockChanges,
  blocks,
  slotEvents,
  slots,
  todos,
  users,
  type RlsClient,
} from "@syn/db";
import {
  blockChangeRecord,
  blockRecord,
  slotEventRecord,
  slotRecord,
  todoRecord,
} from "@syn/validators";
import { recordsOf } from "../planner/row-records";
import { rowStore } from "../undo/row-store";
import type { TodoStore } from "./todos";

/**
 * The `TodoStore` over `todos`, `slots`, `slot_events`, `blocks` and
 * `block_changes`, inside the caller's RLS transaction (USE-95): every
 * statement reaches only the caller's rows, and the writes are `rowStore`'s,
 * which name the caller's `user_id` on each insert.
 */

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

export function todoStore(tx: Tx, userId: string): TodoStore {
  return {
    async account() {
      const [account] = await tx
        .select({ timeZone: users.timezone, dayCloseTime: users.dayCloseTime })
        .from(users)
        .where(eq(users.id, userId));
      if (!account) throw new Error("No account row.");
      // `HH:MM` from Postgres's `HH:MM:SS`.
      return { ...account, dayCloseTime: account.dayCloseTime.slice(0, 5) };
    },

    todos: async () => recordsOf(todoRecord, await tx.select().from(todos)),

    todoSlots: async () =>
      recordsOf(
        slotRecord,
        await tx.select().from(slots).where(isNotNull(slots.todoId)),
      ),

    slotEvents: async (slotIds) =>
      recordsOf(
        slotEventRecord,
        await tx
          .select()
          .from(slotEvents)
          .where(inArray(slotEvents.slotId, [...slotIds])),
      ),

    blocks: async () => recordsOf(blockRecord, await tx.select().from(blocks)),

    blockChanges: async (dates) =>
      recordsOf(
        blockChangeRecord,
        await tx
          .select()
          .from(blockChanges)
          .where(inArray(blockChanges.onDate, [...dates])),
      ),

    rows: rowStore(tx, userId),
  };
}
