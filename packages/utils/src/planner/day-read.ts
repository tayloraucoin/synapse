import { wallClockToInstant } from "../day/wall-clock";
import { occursOn, parseRule } from "./rrule";

/**
 * A day is read, not built (the data contract): expand every block's rule
 * for the date, apply that date's `block_changes`, then join the slots.
 *
 * The inputs are structural, named as USE-3's records name them, so a record
 * from `@syn/validators` fits without this package importing it. Times are
 * `HH:MM`; an end may be `24:00`, which is the next date's midnight.
 */

export interface DayBlock {
  id: string;
  startsAt: string;
  endsAt: string;
  rrule: string | null;
  onDate: string | null;
  archivedAt: string | null;
}

export interface DayBlockChange {
  blockId: string;
  onDate: string;
  skipped: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export interface DaySlot {
  id: string;
  blockId: string;
  onDate: string;
  sortOrder: number;
}

export interface DayOccurrence<B extends DayBlock, S extends DaySlot> {
  block: B;
  /** The times it runs on this date: the block's, or its change's. */
  startsAt: string;
  endsAt: string;
  start: Date;
  end: Date;
  /** A `block_changes` row moved its times on this date. */
  changed: boolean;
  /** Its slots on this date, in sort order. */
  slots: S[];
}

export interface DayRead<B extends DayBlock, S extends DaySlot> {
  /** The date's blocks, ordered by start. */
  blocks: DayOccurrence<B, S>[];
  /**
   * Every slot given that no block holds on this date: its block was skipped,
   * archived, or its rule moved off the date. Nothing is dropped silently.
   */
  unplaced: S[];
}

/** Whether a block is on a date, by its rule or its one date. */
function isOn(block: DayBlock, dateKey: string): boolean {
  if (block.rrule === null) return block.onDate === dateKey;
  // A rule that cannot be read hits nothing; the validator stops it earlier.
  const parsed = parseRule(block.rrule);
  return parsed.ok && occursOn(parsed.rule, dateKey);
}

export function readDay<B extends DayBlock, S extends DaySlot>({
  dateKey,
  timeZone,
  blocks,
  changes,
  slots,
}: {
  dateKey: string;
  timeZone: string;
  blocks: readonly B[];
  changes: readonly DayBlockChange[];
  slots: readonly S[];
}): DayRead<B, S> {
  const changeFor = new Map<string, DayBlockChange>();
  for (const change of changes) {
    if (change.onDate === dateKey) changeFor.set(change.blockId, change);
  }

  const slotsFor = new Map<string, S[]>();
  for (const slot of slots) {
    if (slot.onDate !== dateKey) continue;
    const list = slotsFor.get(slot.blockId) ?? [];
    list.push(slot);
    slotsFor.set(slot.blockId, list);
  }

  const read: DayOccurrence<B, S>[] = [];
  for (const block of blocks) {
    if (block.archivedAt !== null || !isOn(block, dateKey)) continue;

    const change = changeFor.get(block.id);
    if (change?.skipped) continue;

    const moved =
      change !== undefined &&
      change.startsAt !== null &&
      change.endsAt !== null;
    const startsAt = moved ? (change.startsAt as string) : block.startsAt;
    const endsAt = moved ? (change.endsAt as string) : block.endsAt;

    read.push({
      block,
      startsAt,
      endsAt,
      start: wallClockToInstant(dateKey, startsAt, timeZone),
      end: wallClockToInstant(dateKey, endsAt, timeZone),
      changed: moved,
      slots: (slotsFor.get(block.id) ?? []).sort(
        (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id),
      ),
    });
  }

  read.sort(
    (a, b) =>
      a.startsAt.localeCompare(b.startsAt) ||
      a.endsAt.localeCompare(b.endsAt) ||
      a.block.id.localeCompare(b.block.id),
  );

  const placed = new Set(read.flatMap((occurrence) => occurrence.slots));
  return { blocks: read, unplaced: slots.filter((slot) => !placed.has(slot)) };
}
