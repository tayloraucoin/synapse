import type {
  BlockChangeRecord,
  BlockItemRecord,
  BlockRecord,
  ClientRecord,
  DayEventRecord,
  DayRecordRecord,
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
  /** The date's orient, Ready, go and close stamps; none before the first open (USE-12). */
  dayRecord: DayRecordRecord | null;
  /** "Up at", `HH:MM`: the day lays out from the wake against it. */
  usualWakeTime: string;
}

/**
 * The date's items as the day reads them (USE-87): a slot's own time and icon
 * stand over the item's for its date; the usual item is unchanged. A write
 * reads `records.blockItems`, never this.
 */
export function itemsOnDate(records: TodayRecords): BlockItemRecord[] {
  const own = new Map(
    records.slots
      .filter(
        (slot) =>
          slot.blockItemId !== null &&
          slot.onDate === records.date &&
          (slot.atTime !== null || slot.icon !== null),
      )
      .map((slot) => [slot.blockItemId!, slot]),
  );
  if (own.size === 0) return records.blockItems;
  return records.blockItems.map((item) => {
    const slot = own.get(item.id);
    if (!slot) return item;
    return {
      ...item,
      atTime: slot.atTime ?? item.atTime,
      icon: slot.icon ?? item.icon,
    };
  });
}
