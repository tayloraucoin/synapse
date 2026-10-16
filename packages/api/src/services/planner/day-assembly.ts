import { dayWindow, occursOn, parseRule } from "@syn/utils";
import type { DayEventRecord, DayReadOutput } from "@syn/validators";
import type { PlannerRows } from "./planner-rows";

/**
 * A date's read from its rows (USE-91), pure: what the fixture server's
 * `readToday` returns, field for field. Records, never occurrences: which
 * blocks run, where a block_change moves one, the clock, fit and Next are
 * `readDay` and the hooks' `select`, on the client, as on fixtures (USE-7).
 * Nothing is written.
 */

/** A one-off on its date, or a repeating event on a date its rule reaches. */
export function eventOn(event: DayEventRecord, dateKey: string): boolean {
  if (event.rrule === null) return event.onDate === dateKey;
  const parsed = parseRule(event.rrule);
  return parsed.ok && occursOn(parsed.rule, dateKey);
}

export function assembleDay(rows: PlannerRows, dateKey: string): DayReadOutput {
  const slots = rows.slots.filter((slot) => slot.onDate === dateKey);
  const slotIds = new Set(slots.map((slot) => slot.id));
  return {
    date: dateKey,
    timeZone: rows.timeZone,
    dayWindow: dayWindow(dateKey, rows.timeZone, rows.dayCloseTime),
    blocks: rows.blocks,
    blockChanges: rows.blockChanges.filter(
      (change) => change.onDate === dateKey,
    ),
    blockItems: rows.blockItems,
    slots,
    workItems: rows.workItems,
    clients: rows.clients,
    todos: rows.todos,
    // Repeating events too, as the week reads them (USE-58).
    dayEvents: rows.dayEvents.filter((event) => eventOn(event, dateKey)),
    slotEvents: rows.slotEvents.filter((event) => slotIds.has(event.slotId)),
    dayRecord:
      rows.dayRecords.find((record) => record.onDate === dateKey) ?? null,
    usualWakeTime: rows.usualWakeTime,
  };
}
