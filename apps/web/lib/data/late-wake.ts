import {
  clockMinutes,
  instantToWallClockMinutes,
  type RoomDay,
} from "@syn/utils";
import type { Today } from "./derive-today";
import { isAllDay } from "./use-now";

/**
 * A late wake (USE-38; review-the-day/states/late.md): the day as the room
 * engine (USE-35) reads it, and the wake it is laid out from. Nothing here
 * is stored: the layout is `layoutFromWake` over the day on every read, and
 * only Move later writes.
 */

/**
 * The date's blocks as the engine's day: their spans only. The all-day
 * checklist is not in time, so it never passes or slides. Slots are left
 * out: a wake's layout and Move later move whole blocks.
 */
export function roomDayOf(today: Today): RoomDay {
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
        slots: [],
      })),
    events: [],
  };
}

/**
 * Up at and the wake, minutes from midnight, when Orient opened after Up at
 * on this date; null otherwise, and the day reads as planned. The wake is
 * Orient's stamp (`dayRecord.orientedAt`); Up at is the day's.
 */
export function lateWakeOf(
  today: Today,
): { upAt: number; wokeAt: number } | null {
  const { usualWakeTime, dayRecord, timeZone } = today.records;
  if (!usualWakeTime || dayRecord?.orientedAt == null) return null;
  const upAt = clockMinutes(usualWakeTime);
  const wokeAt = instantToWallClockMinutes(
    new Date(dayRecord.orientedAt),
    timeZone,
  );
  return wokeAt > upAt ? { upAt, wokeAt } : null;
}
