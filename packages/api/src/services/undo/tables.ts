import {
  blockChanges,
  blockItems,
  blocks,
  clients,
  dayBounds,
  dayEvents,
  slotEvents,
  slots,
  todos,
  workItems,
} from "@syn/db";
import {
  blockChangeRecord,
  blockItemRecord,
  blockRecord,
  clientRecord,
  dayBoundsRecord,
  dayEventRecord,
  slotEventRecord,
  slotRecord,
  todoRecord,
  workItemRecord,
} from "@syn/validators";

/**
 * The tables an Undo may touch (USE-92): the planner's, the work pool's and
 * the to-dos', each with the record its rows are kept as. A token naming any
 * other table is refused when it is read. Keys are the records' own names, as
 * the fixture's write log names them.
 *
 * `slotEvents` (USE-95) is here only for a deleted to-do's Undo, which puts
 * its slots' events back; slot_events is append-only, so its insert is the
 * one step a token can take there (an update or delete reaches no row).
 */
export const UNDO_TABLES = {
  blocks: { table: blocks, record: blockRecord },
  blockChanges: { table: blockChanges, record: blockChangeRecord },
  blockItems: { table: blockItems, record: blockItemRecord },
  slots: { table: slots, record: slotRecord },
  slotEvents: { table: slotEvents, record: slotEventRecord },
  dayEvents: { table: dayEvents, record: dayEventRecord },
  dayBounds: { table: dayBounds, record: dayBoundsRecord },
  workItems: { table: workItems, record: workItemRecord },
  clients: { table: clients, record: clientRecord },
  todos: { table: todos, record: todoRecord },
} as const;

export type UndoTable = keyof typeof UNDO_TABLES;

export const UNDO_TABLE_NAMES = Object.keys(UNDO_TABLES) as [
  UndoTable,
  ...UndoTable[],
];

/** A row as its record: an id and the record's fields. */
export type Row = { id: string } & Record<string, unknown>;
