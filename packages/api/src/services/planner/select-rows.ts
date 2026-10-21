import { eq, inArray } from "drizzle-orm";
import {
  blockChanges,
  blockItems,
  blocks,
  clients,
  dayBounds,
  dayEvents,
  dayRecords,
  slotEvents,
  slots,
  todos,
  users,
  workItems,
  type RlsClient,
} from "@syn/db";
import {
  blockChangeRecord,
  blockItemRecord,
  blockRecord,
  clientRecord,
  dayBoundsRecord,
  dayEventRecord,
  dayRecordRecord,
  slotEventRecord,
  slotRecord,
  todoRecord,
  workItemRecord,
} from "@syn/validators";
import { selectGoogleRows } from "../google/read-events";
import type { PlannerRows } from "./planner-rows";
import { recordsOf } from "./row-records";

/**
 * The planner reads' SELECT half (USE-91): the account's rows a set of dates
 * needs, each parsed into its `@syn/validators` record. Assembly is pure and
 * lives beside it (`day-assembly.ts`, `week-assembly.ts`), so it is proved
 * over rows in memory.
 *
 * Runs only inside `rls.execute` (its `tx`): RLS keeps every table to the
 * caller's rows, so no query names a user but `users` itself.
 *
 * WHAT IS NARROWED IN SQL. Rows keyed by a date (block changes, slots, slot
 * events, day records) are read for the dates asked. Blocks, items, events,
 * to-dos, the work pool and clients are read whole: a repeating block's or
 * event's rule cannot be tested in SQL (USE-6 expands it in TypeScript), and
 * the day's read carries the pools as the fixture's does. It is one person's
 * dozen blocks and a few hundred rows.
 */

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

/** `HH:MM` from Postgres's `HH:MM:SS`. */
function clockOf(value: string): string {
  return value.slice(0, 5);
}

export async function selectPlannerRows(
  tx: Tx,
  userId: string,
  dates: readonly string[],
): Promise<PlannerRows> {
  const dateList = [...dates];
  // The reads are independent, so they are sent together on the
  // transaction's one connection (postgres.js pipelines them): one round
  // trip for the lot, and one more for the slots' events, instead of one
  // each. A day's read was a round trip per table (the tick's seconds).
  const [
    [account],
    slotRows,
    blockRows,
    changeRows,
    itemRows,
    workRows,
    clientRows,
    todoRows,
    eventRows,
    recordRows,
    boundsRows,
    google,
  ] = await Promise.all([
    tx
      .select({
        timeZone: users.timezone,
        dayCloseTime: users.dayCloseTime,
        usualWakeTime: users.usualWakeTime,
      })
      .from(users)
      .where(eq(users.id, userId)),
    tx.select().from(slots).where(inArray(slots.onDate, dateList)),
    tx.select().from(blocks),
    tx
      .select()
      .from(blockChanges)
      .where(inArray(blockChanges.onDate, dateList)),
    tx.select().from(blockItems),
    tx.select().from(workItems),
    tx.select().from(clients),
    tx.select().from(todos),
    tx.select().from(dayEvents),
    tx.select().from(dayRecords).where(inArray(dayRecords.onDate, dateList)),
    tx.select().from(dayBounds),
    // USE-103: the dates' weeks' Google snapshots and the calendars that are on.
    selectGoogleRows(tx, dateList),
  ]);
  if (!account) throw new Error("No account row.");

  const slotIds = slotRows.map((slot) => slot.id);
  const eventsOfSlots =
    slotIds.length === 0
      ? []
      : await tx
          .select()
          .from(slotEvents)
          .where(inArray(slotEvents.slotId, slotIds));

  return {
    timeZone: account.timeZone,
    dayCloseTime: clockOf(account.dayCloseTime),
    usualWakeTime: clockOf(account.usualWakeTime),
    blocks: recordsOf(blockRecord, blockRows),
    blockChanges: recordsOf(blockChangeRecord, changeRows),
    blockItems: recordsOf(blockItemRecord, itemRows),
    slots: recordsOf(slotRecord, slotRows),
    slotEvents: recordsOf(slotEventRecord, eventsOfSlots),
    workItems: recordsOf(workItemRecord, workRows),
    clients: recordsOf(clientRecord, clientRows),
    todos: recordsOf(todoRecord, todoRows),
    dayEvents: recordsOf(dayEventRecord, eventRows),
    dayRecords: recordsOf(dayRecordRecord, recordRows),
    dayBounds: recordsOf(dayBoundsRecord, boundsRows),
    ...google,
  };
}
