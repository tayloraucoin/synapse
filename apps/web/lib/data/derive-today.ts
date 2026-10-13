import { deriveClock, readDay, type DayClock, type DayRead } from "@syn/utils";
import type { BlockRecord, SlotRecord } from "@syn/validators";
import type { TodayRecords } from "./today-records";

/**
 * A day as surfaces read it: the blocks that run on the date, and the clock
 * derived from the events. Derived on every read (a query's `select`), never
 * stored, so no minute is ever faked.
 */
export interface Today {
  occurrences: DayRead<BlockRecord, SlotRecord>;
  clock: DayClock;
  records: TodayRecords;
}

export function deriveToday(records: TodayRecords): Today {
  const occurrences = readDay({
    dateKey: records.date,
    timeZone: records.timeZone,
    blocks: records.blocks,
    changes: records.blockChanges,
    slots: records.slots,
  });
  // Inside a Work block one slot is in hand at a time (D-USE-43).
  const workSlotIds = new Set(
    occurrences.blocks
      .filter((occurrence) => occurrence.block.kind === "work")
      .flatMap((occurrence) => occurrence.slots.map((slot) => slot.id)),
  );
  const clock = deriveClock(records.slotEvents, {
    dayWindow: records.dayWindow,
    workSlotIds,
  });
  return { occurrences, clock, records };
}
