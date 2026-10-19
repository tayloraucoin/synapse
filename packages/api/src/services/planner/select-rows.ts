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
  const [account] = await tx
    .select({
      timeZone: users.timezone,
      dayCloseTime: users.dayCloseTime,
      usualWakeTime: users.usualWakeTime,
    })
    .from(users)
    .where(eq(users.id, userId));
  if (!account) throw new Error("No account row.");

  const dateList = [...dates];
  const slotRows = await tx
    .select()
    .from(slots)
    .where(inArray(slots.onDate, dateList));
  const slotIds = slotRows.map((slot) => slot.id);

  return {
    timeZone: account.timeZone,
    dayCloseTime: clockOf(account.dayCloseTime),
    usualWakeTime: clockOf(account.usualWakeTime),
    blocks: recordsOf(blockRecord, await tx.select().from(blocks)),
    blockChanges: recordsOf(
      blockChangeRecord,
      await tx
        .select()
        .from(blockChanges)
        .where(inArray(blockChanges.onDate, dateList)),
    ),
    blockItems: recordsOf(blockItemRecord, await tx.select().from(blockItems)),
    slots: recordsOf(slotRecord, slotRows),
    slotEvents:
      slotIds.length === 0
        ? []
        : recordsOf(
            slotEventRecord,
            await tx
              .select()
              .from(slotEvents)
              .where(inArray(slotEvents.slotId, slotIds)),
          ),
    workItems: recordsOf(workItemRecord, await tx.select().from(workItems)),
    clients: recordsOf(clientRecord, await tx.select().from(clients)),
    todos: recordsOf(todoRecord, await tx.select().from(todos)),
    dayEvents: recordsOf(dayEventRecord, await tx.select().from(dayEvents)),
    dayRecords: recordsOf(
      dayRecordRecord,
      await tx
        .select()
        .from(dayRecords)
        .where(inArray(dayRecords.onDate, dateList)),
    ),
    dayBounds: recordsOf(dayBoundsRecord, await tx.select().from(dayBounds)),
    // USE-103: the dates' weeks' Google snapshots and the calendars that are on.
    ...(await selectGoogleRows(tx, dateList)),
  };
}
