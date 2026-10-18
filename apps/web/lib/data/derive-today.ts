import { deriveClock, readDay, type DayClock, type DayRead } from "@syn/utils";
import type { BlockRecord, SlotEventInput, SlotRecord } from "@syn/validators";
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

/**
 * The clock's taps not yet on the server (USE-106): a write paused offline,
 * or one in flight, counts in the derived clock as made, so Start offline
 * shows the item running and Prompt sent is there to tap. One the read
 * already holds (same `clientEventId`) is not counted twice; the read
 * replaces them all once the writes land.
 */
export function withQueuedEvents(
  records: TodayRecords,
  queued: readonly SlotEventInput[],
): TodayRecords {
  const held = new Set(records.slotEvents.map((e) => e.clientEventId));
  const added = queued
    .filter((input) => !held.has(input.clientEventId))
    .map((input) => ({
      id: input.clientEventId,
      createdAt: input.at,
      slotId: input.slotId,
      kind: input.kind,
      clientEventId: input.clientEventId,
      at: input.at,
      receivedAt: input.at,
      stepAwayId: input.stepAwayId ?? null,
    }));
  if (added.length === 0) return records;
  return { ...records, slotEvents: [...records.slotEvents, ...added] };
}
