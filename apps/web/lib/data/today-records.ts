import type {
  BlockChangeRecord,
  BlockItemRecord,
  BlockRecord,
  ClientRecord,
  DayEventRecord,
  SlotEventRecord,
  SlotRecord,
  TodoRecord,
  WorkItemRecord,
} from "@syn/validators";

/**
 * What a day's read returns (USE-7), from the fixture server now and from
 * the routers in wave 3. Every list is a `@syn/validators` record type.
 */

/** One date's read: the date's rows, and the pools the day draws on. */
export interface TodayRecords {
  date: string;
  timeZone: string;
  /** `[start, end)` from `dayWindow` in `day/boundaries.ts`. */
  dayWindow: { start: Date; end: Date };
  /** Every block; `readDay` decides which run on the date. */
  blocks: BlockRecord[];
  blockChanges: BlockChangeRecord[];
  blockItems: BlockItemRecord[];
  slots: SlotRecord[];
  /** The work pool, slotted or not. */
  workItems: WorkItemRecord[];
  clients: ClientRecord[];
  /** The to-do pool, with the daily reminders. */
  todos: TodoRecord[];
  dayEvents: DayEventRecord[];
  /** The events of the date's slots. */
  slotEvents: SlotEventRecord[];
}
