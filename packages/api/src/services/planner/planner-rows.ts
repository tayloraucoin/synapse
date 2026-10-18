import type {
  BlockChangeRecord,
  BlockItemRecord,
  BlockRecord,
  ClientRecord,
  DayBoundsRecord,
  DayEventRecord,
  DayRecordRecord,
  SlotEventRecord,
  SlotRecord,
  TodoRecord,
  WorkItemRecord,
} from "@syn/validators";
import type { GoogleRows } from "../google/read-events";

/**
 * The rows the planner's reads assemble from (USE-91), already records: what
 * `selectPlannerRows` reads for a set of dates, and what a test builds in
 * memory. Date-keyed lists hold only the dates asked; the rest are whole.
 * The Google snapshots are the dates' weeks', with the calendars that are
 * on (USE-103).
 */
export interface PlannerRows extends GoogleRows {
  /** `users.timezone`: block times are wall-clock here. */
  timeZone: string;
  /** `users.day_close_time`, `HH:MM`: the day opens here, not at midnight. */
  dayCloseTime: string;
  /** `users.usual_wake_time`, `HH:MM`. */
  usualWakeTime: string;
  blocks: BlockRecord[];
  blockChanges: BlockChangeRecord[];
  blockItems: BlockItemRecord[];
  slots: SlotRecord[];
  slotEvents: SlotEventRecord[];
  workItems: WorkItemRecord[];
  clients: ClientRecord[];
  todos: TodoRecord[];
  dayEvents: DayEventRecord[];
  dayRecords: DayRecordRecord[];
  dayBounds: DayBoundsRecord[];
}
