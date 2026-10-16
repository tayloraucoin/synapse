import {
  DAY_END_MIN,
  findRoom,
  type RoomCandidate,
  type RoomDay,
  type RoomEvent,
  type RoomSlot,
} from "@syn/utils";
import type { BlockRecord } from "@syn/validators";
import type { Today } from "./derive-today";
import { isAllDay } from "./use-now";
import { itemsOnDate } from "./today-records";

/**
 * The room engine's day with its rows (USE-41): Make room and A later start
 * weigh items, so each block carries its rows on the date, set items and
 * what was pulled in, with what the engine reads (length, tier, travel, a
 * set time, done) and the title the sheets name. The day's events are its
 * set times. `roomDayOf` (USE-38) stays the spans-only day a wake lays out.
 */

/** D-USE-81: an item with no length counts 5 minutes. */
const DEFAULT_LENGTH_MIN = 5;

export interface AppRoomSlot extends RoomSlot {
  title: string;
  /** A set item's id: its writes go through the Item sheet's; null when pulled in. */
  blockItemId: string | null;
}

export interface AppRoomEvent extends RoomEvent {
  title: string;
}

export interface AppRoomDay extends RoomDay<BlockRecord, AppRoomSlot> {
  events: readonly AppRoomEvent[];
}

type Occurrence = Today["occurrences"]["blocks"][number];

function slotsOf(today: Today, occurrence: Occurrence): AppRoomSlot[] {
  const { records } = today;
  const { block, slots } = occurrence;
  const date = records.date;
  const set = itemsOnDate(records)
    .filter(
      (item) =>
        item.blockId === block.id &&
        (item.onDate === null || item.onDate === date),
    )
    .flatMap((item): AppRoomSlot[] => {
      const slot = slots.find((row) => row.blockItemId === item.id);
      // Not today (D-USE-70): the date's slot is skipped.
      if (slot?.skipped) return [];
      return [
        {
          id: item.id,
          blockId: block.id,
          onDate: date,
          sortOrder: slot?.sortOrder ?? item.sortOrder,
          lengthMin: slot?.lengthMin ?? item.lengthMin ?? DEFAULT_LENGTH_MIN,
          tier: null,
          travel: item.isTransition,
          atTime: item.atTime,
          doneAt: slot?.doneAt ?? null,
          title: item.title,
          blockItemId: item.id,
        },
      ];
    });
  const pulled = slots
    .filter((slot) => slot.blockItemId === null && !slot.skipped)
    .map((slot): AppRoomSlot => {
      const source =
        records.todos.find((todo) => todo.id === slot.todoId) ??
        records.workItems.find((work) => work.id === slot.workItemId);
      return {
        id: slot.id,
        blockId: block.id,
        onDate: date,
        sortOrder: slot.sortOrder,
        lengthMin:
          slot.lengthMin ??
          (source && "lengthMin" in source ? source.lengthMin : null) ??
          DEFAULT_LENGTH_MIN,
        tier: slot.tier,
        travel: false,
        atTime: null,
        doneAt: slot.doneAt,
        title: source?.title ?? "",
        blockItemId: null,
      };
    });
  return [...set, ...pulled].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** The date as the engine weighs it: blocks in time with their rows, and the events. */
export function roomDayWithRowsOf(today: Today): AppRoomDay {
  return {
    dateKey: today.records.date,
    blocks: today.occurrences.blocks
      .filter(
        (occurrence) =>
          !isAllDay(occurrence.block, occurrence.startsAt, occurrence.endsAt),
      )
      .map((occurrence) => ({
        block: occurrence.block,
        startsAt: occurrence.startsAt,
        endsAt: occurrence.endsAt,
        changed: occurrence.changed,
        slots: slotsOf(today, occurrence),
      })),
    events: today.records.dayEvents.map((event) => ({
      id: event.id,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      title: event.title,
    })),
  };
}

/**
 * Every candidate the Make room sheet lists for a block. A block's
 * candidates never depend on the minutes asked, and no block holds a whole
 * day free, so asking `findRoom` for a day's minutes always answers "ask"
 * with them.
 */
export function roomCandidatesOf(
  day: RoomDay,
  blockId: string,
): RoomCandidate[] {
  const asked = findRoom(day, { blockId, minutes: DAY_END_MIN });
  return asked.kind === "ask" ? asked.candidates : [];
}
