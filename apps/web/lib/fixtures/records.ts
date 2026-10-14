import type {
  BlockChangeRecord,
  BlockItemRecord,
  BlockRecord,
  ClientRecord,
  DayBoundsRecord,
  DayEventRecord,
  DayRecordRecord,
  JournalEntryRecord,
  LinkRecord,
  MorningLinesRecord,
  PassageRecord,
  QuoteRecord,
  SavedColourRecord,
  SlotEventRecord,
  SlotRecord,
  TodoRecord,
  WorkItemRecord,
} from "@syn/validators";
import type { AccountView } from "@/lib/data/use-account";

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
  /** Each weekday's usual Up at and Lights out, and a date's own (USE-36). */
  dayBounds: DayBoundsRecord[];
  /** `users.usual_wake_time`: "Up at" (USE-12). */
  usualWakeTime: string;
  /** One per date: the orient, Ready, go and close stamps (USE-12). */
  dayRecords: DayRecordRecord[];
  /** The morning reading, its links and the quote on its day (USE-12). */
  passages: PassageRecord[];
  links: LinkRecord[];
  quotes: QuoteRecord[];
  /** Orient's three lines, one per date. */
  morningLines: MorningLinesRecord[];
  /** Evenings written; "Last night" reads the day before's. */
  journalEntries: JournalEntryRecord[];
  /** The signed-in person behind the avatar (USE-83). */
  account: AccountView;
}
