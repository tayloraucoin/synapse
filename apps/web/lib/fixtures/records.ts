import type {
  BlockChangeRecord,
  BlockItemRecord,
  BlockRecord,
  ClientRecord,
  DayEventRecord,
  SavedColourRecord,
  SlotEventRecord,
  SlotRecord,
  TodoRecord,
  WorkItemRecord,
} from "@syn/validators";

/**
 * What the fixture server holds (USE-7). Every list is a `@syn/validators`
 * record type, as the routers will return them; no shape is invented here.
 * What a read returns is `TodayRecords`, in `lib/data`, which outlives this.
 */

/** One person's rows, across dates: what the routers would read from. */
export interface FixtureRecords {
  /** `users.timezone`: block times are wall clock in it. */
  timeZone: string;
  /** `users.day_close_time`: the day opens and closes here (C11). */
  dayCloseTime: string;
  blocks: BlockRecord[];
  blockChanges: BlockChangeRecord[];
  blockItems: BlockItemRecord[];
  slots: SlotRecord[];
  workItems: WorkItemRecord[];
  clients: ClientRecord[];
  todos: TodoRecord[];
  dayEvents: DayEventRecord[];
  slotEvents: SlotEventRecord[];
  /** Custom colours saved for reuse (USE-11), any order; reads sort newest first. */
  savedColours: SavedColourRecord[];
}
