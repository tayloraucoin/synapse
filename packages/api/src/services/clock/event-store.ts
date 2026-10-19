import { eq, inArray } from "drizzle-orm";
import { slotEvents, slots, users, type RlsClient } from "@syn/db";
import { slotEventRecord } from "@syn/validators";
import { recordsOf } from "../planner/row-records";
import type { EventStore } from "./write-events";

/**
 * The clock's store in Postgres (USE-94). Runs only inside `rls.execute`
 * (its `tx`), so every row read is the caller's and every insert is checked
 * by `slot_events`' owner policy. It reads and inserts; it has no other verb.
 */

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

export function eventStore(tx: Tx, userId: string): EventStore {
  return {
    async zone() {
      const [account] = await tx
        .select({ timeZone: users.timezone, dayCloseTime: users.dayCloseTime })
        .from(users)
        .where(eq(users.id, userId));
      if (!account) throw new Error("No account row.");
      return {
        timeZone: account.timeZone,
        dayCloseTime: account.dayCloseTime.slice(0, 5),
      };
    },

    slotDays(ids) {
      if (ids.length === 0) return Promise.resolve([]);
      return tx
        .select({ id: slots.id, onDate: slots.onDate })
        .from(slots)
        .where(inArray(slots.id, [...ids]));
    },

    async eventsOf(clientEventIds) {
      if (clientEventIds.length === 0) return [];
      const rows = await tx
        .select()
        .from(slotEvents)
        .where(inArray(slotEvents.clientEventId, [...clientEventIds]));
      return recordsOf(slotEventRecord, rows);
    },

    async insertNew(rows) {
      if (rows.length === 0) return;
      await tx
        .insert(slotEvents)
        .values(
          rows.map((row) => ({
            ...row,
            at: new Date(row.at),
            receivedAt: new Date(row.receivedAt),
            userId,
          })),
        )
        .onConflictDoNothing({
          target: [slotEvents.userId, slotEvents.clientEventId],
        });
    },
  };
}
