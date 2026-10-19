import { clockToMinutes } from "../../time";
import type { WorkTier } from "../../work/next";
import type { DayBlock, DaySlot } from "../day-read";

/**
 * The room engine's day (USE-35): Make room, A later start and a late wake
 * ask one question, minutes to find and what gives, of one day.
 *
 * The day is `readDay`'s, widened by what the engine weighs: a block's kind,
 * and each slot's length, tier, travel and set time. Structural, so the edits
 * ticket maps its rows in without this package importing them. Times are
 * wall-clock minutes from the date's midnight, read from `readDay`'s `HH:MM`
 * strings; no `Date` is ever built here.
 *
 * Every plan is TODAY ONLY: changes to that date's `block_changes` rows and
 * slots, never a block's own times or a `block_items` row, with the exact
 * inverse beside them.
 */

export interface RoomBlock extends DayBlock {
  /** `block_kind`: `orient` never moves; `work` orders what gives by tier. */
  kind: string;
}

export interface RoomSlot extends DaySlot {
  /** The minutes it holds today: the slot's length, else its item's. */
  lengthMin: number;
  tier: WorkTier | null;
  /** A drive there or home (a transition item): never taken. */
  travel: boolean;
  /** A set time (`block_items.at_time`), `HH:MM`: never taken or moved. */
  atTime: string | null;
  doneAt?: string | null;
  /** Off today: cut, as "Not today". */
  off?: boolean;
}

/** One block on the date, as `readDay` returns it. */
export interface RoomOccurrence<
  B extends RoomBlock = RoomBlock,
  S extends RoomSlot = RoomSlot,
> {
  block: B;
  startsAt: string;
  endsAt: string;
  /** A `block_changes` row moved its times on this date. */
  changed: boolean;
  slots: S[];
  /** Off today: a `block_changes` row skips it. */
  off?: boolean;
}

/** A day event: a fixed time, never slotted, never moved. */
export interface RoomEvent {
  id: string;
  startsAt: string;
  endsAt: string;
}

export interface RoomDay<
  B extends RoomBlock = RoomBlock,
  S extends RoomSlot = RoomSlot,
> {
  dateKey: string;
  blocks: readonly RoomOccurrence<B, S>[];
  events: readonly RoomEvent[];
}

/**
 * One today-only write. "Usual" deletes the date's `block_changes` row, so a
 * block that was never changed goes back to having no row at all. "Slot off"
 * names the intent; the edits ticket writes it through USE-14's field.
 */
export type DayChange =
  | {
      kind: "block_times";
      blockId: string;
      onDate: string;
      startsAt: string;
      endsAt: string;
    }
  | { kind: "block_off"; blockId: string; onDate: string }
  | { kind: "block_usual"; blockId: string; onDate: string }
  | { kind: "slot_length"; slotId: string; onDate: string; lengthMin: number }
  | { kind: "slot_off"; slotId: string; onDate: string }
  | { kind: "slot_on"; slotId: string; onDate: string };

export interface RoomPlan<Summary> {
  changes: DayChange[];
  /** Applied after `changes`, gives back the day the plan started from. */
  undo: DayChange[];
  summary: Summary;
}

export interface RoomRefusal {
  kind: "refused";
  /**
   * `past_midnight`: a block would end after 24:00, which a block never does.
   * `not_eligible`: travel, a set time, Orient, Urgent work or a done item.
   * `unknown`: no such block or slot on the day.
   * `too_much`: more than an item may give, or a gap holds.
   */
  reason: "past_midnight" | "not_eligible" | "unknown" | "too_much";
  ids: string[];
}

export type RoomResult<Summary> =
  { kind: "plan"; plan: RoomPlan<Summary> } | RoomRefusal;

/** A block's start, moved: `HH:MM` before and after. */
export interface BlockMove {
  blockId: string;
  from: string;
  to: string;
}

/** A set time inside a block's new span: the block runs on either side. */
export interface SetTimeSplit {
  blockId: string;
  /** The set-time slot's id, or the day event's. */
  id: string;
  at: string;
}

/** The end of a day: 24:00, which a block may reach and never pass. */
export const DAY_END_MIN = 24 * 60;

export const toMinutes = clockToMinutes;

/** Minutes from midnight → `HH:MM`, keeping `24:00` (never wrapped). */
export function toClock(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export interface Span {
  start: number;
  end: number;
}

export const spanOf = (occurrence: RoomOccurrence): Span => ({
  start: toMinutes(occurrence.startsAt),
  end: toMinutes(occurrence.endsAt),
});

export const isOrient = (occurrence: RoomOccurrence): boolean =>
  occurrence.block.kind === "orient";

/** The blocks still on today, by start; skipped ones are gone. */
export function liveBlocks<B extends RoomBlock, S extends RoomSlot>(
  day: RoomDay<B, S>,
): RoomOccurrence<B, S>[] {
  return day.blocks
    .filter((occurrence) => !occurrence.off)
    .sort(
      (a, b) =>
        toMinutes(a.startsAt) - toMinutes(b.startsAt) ||
        toMinutes(a.endsAt) - toMinutes(b.endsAt) ||
        a.block.id.localeCompare(b.block.id),
    );
}

export const liveSlots = <S extends RoomSlot>(
  occurrence: RoomOccurrence<RoomBlock, S>,
): S[] => occurrence.slots.filter((slot) => !slot.off);

/** Minutes two spans share. */
export const overlapMin = (a: Span, b: Span): number =>
  Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));

/** Why a slot can never give minutes or be cut; `null` when it can. */
export function lockedReason(
  slot: RoomSlot,
): "travel" | "set_time" | "urgent" | "done" | null {
  if (slot.travel) return "travel";
  if (slot.atTime !== null) return "set_time";
  if (slot.tier === "urgent") return "urgent";
  if (slot.doneAt != null) return "done";
  return null;
}

/** Everything held at a set time: set-time slots and day events. */
function setTimesOf(day: RoomDay): { id: string; span: Span; at: string }[] {
  const held: { id: string; span: Span; at: string }[] = [];
  for (const occurrence of day.blocks) {
    for (const slot of liveSlots(occurrence)) {
      if (slot.atTime === null || slot.travel) continue;
      const start = toMinutes(slot.atTime);
      held.push({
        id: slot.id,
        span: { start, end: start + slot.lengthMin },
        at: slot.atTime,
      });
    }
  }
  for (const event of day.events) {
    held.push({
      id: event.id,
      span: { start: toMinutes(event.startsAt), end: toMinutes(event.endsAt) },
      at: event.startsAt,
    });
  }
  return held;
}

export interface PlanEdits {
  /** A block's new span today, or off today. */
  blocks: Map<string, Span | "off">;
  /** A slot's new length today, or off today. */
  slots: Map<string, { lengthMin: number } | "off">;
}

export const emptyEdits = (): PlanEdits => ({
  blocks: new Map(),
  slots: new Map(),
});

/**
 * Edits → changes and their inverse, one per block and slot touched, so the
 * undo of each is read from the day as it was. Refuses a block past 24:00.
 */
export function buildPlan<Summary>(
  day: RoomDay,
  edits: PlanEdits,
  summary: Summary,
): RoomResult<Summary> {
  const onDate = day.dateKey;
  const changes: DayChange[] = [];
  const undo: DayChange[] = [];
  const pastMidnight: string[] = [];

  for (const occurrence of day.blocks) {
    const edit = edits.blocks.get(occurrence.block.id);
    if (edit === undefined || occurrence.off) continue;
    const blockId = occurrence.block.id;
    const before: DayChange = occurrence.changed
      ? {
          kind: "block_times",
          blockId,
          onDate,
          startsAt: occurrence.startsAt,
          endsAt: occurrence.endsAt,
        }
      : { kind: "block_usual", blockId, onDate };

    if (edit === "off") {
      changes.push({ kind: "block_off", blockId, onDate });
      undo.push(before);
      continue;
    }
    if (edit.start < 0 || edit.end > DAY_END_MIN) {
      pastMidnight.push(blockId);
      continue;
    }
    const startsAt = toClock(edit.start);
    const endsAt = toClock(edit.end);
    if (startsAt === occurrence.startsAt && endsAt === occurrence.endsAt) {
      continue;
    }
    const usual =
      startsAt === occurrence.block.startsAt &&
      endsAt === occurrence.block.endsAt;
    changes.push(
      usual
        ? { kind: "block_usual", blockId, onDate }
        : { kind: "block_times", blockId, onDate, startsAt, endsAt },
    );
    undo.push(before);
  }

  if (pastMidnight.length > 0) {
    return { kind: "refused", reason: "past_midnight", ids: pastMidnight };
  }

  for (const occurrence of day.blocks) {
    for (const slot of occurrence.slots) {
      const edit = edits.slots.get(slot.id);
      if (edit === undefined || slot.off) continue;
      if (edit === "off") {
        changes.push({ kind: "slot_off", slotId: slot.id, onDate });
        undo.push({ kind: "slot_on", slotId: slot.id, onDate });
      } else if (edit.lengthMin !== slot.lengthMin) {
        changes.push({
          kind: "slot_length",
          slotId: slot.id,
          onDate,
          lengthMin: edit.lengthMin,
        });
        undo.push({
          kind: "slot_length",
          slotId: slot.id,
          onDate,
          lengthMin: slot.lengthMin,
        });
      }
    }
  }

  return { kind: "plan", plan: { changes, undo: undo.reverse(), summary } };
}

/** Every block whose start moves, before and after, by start. */
export function movesOf(day: RoomDay, edits: PlanEdits): BlockMove[] {
  const moves: BlockMove[] = [];
  for (const occurrence of liveBlocks(day)) {
    const edit = edits.blocks.get(occurrence.block.id);
    if (edit === undefined || edit === "off") continue;
    const to = toClock(edit.start);
    if (to !== occurrence.startsAt) {
      moves.push({
        blockId: occurrence.block.id,
        from: occurrence.startsAt,
        to,
      });
    }
  }
  return moves;
}

/**
 * The set times that fall inside a moved block's new span, past its start:
 * they stay where they are, and the block runs on either side of them.
 */
export function splitsOf(day: RoomDay, edits: PlanEdits): SetTimeSplit[] {
  const held = setTimesOf(day);
  const splits: SetTimeSplit[] = [];
  for (const occurrence of liveBlocks(day)) {
    const edit = edits.blocks.get(occurrence.block.id);
    if (edit === undefined || edit === "off") continue;
    for (const item of held) {
      if (item.span.start > edit.start && item.span.start < edit.end) {
        splits.push({ blockId: occurrence.block.id, id: item.id, at: item.at });
      }
    }
  }
  return splits;
}

/** The day's last end, before and after the edits. */
export function dayEndOf(
  day: RoomDay,
  edits: PlanEdits,
): { from: string; to: string } {
  let from = 0;
  let to = 0;
  for (const occurrence of liveBlocks(day)) {
    const span = spanOf(occurrence);
    from = Math.max(from, span.end);
    const edit = edits.blocks.get(occurrence.block.id);
    if (edit === "off") continue;
    to = Math.max(to, (edit ?? span).end);
  }
  return { from: toClock(from), to: toClock(to) };
}

/**
 * Changes applied to a day, as the edits ticket's writes would read back.
 * Pure: the day given is never touched. `block_usual` restores the block's
 * own times, which is what a day with no row for the date reads.
 */
export function applyChanges<B extends RoomBlock, S extends RoomSlot>(
  day: RoomDay<B, S>,
  changes: readonly DayChange[],
): RoomDay<B, S> {
  const blocks = day.blocks.map((occurrence) => ({
    ...occurrence,
    slots: occurrence.slots.map((slot) => ({ ...slot })),
  }));

  for (const change of changes) {
    if (
      change.kind === "block_times" ||
      change.kind === "block_off" ||
      change.kind === "block_usual"
    ) {
      const occurrence = blocks.find(
        (candidate) => candidate.block.id === change.blockId,
      );
      if (occurrence === undefined) continue;
      delete occurrence.off;
      if (change.kind === "block_off") {
        occurrence.off = true;
      } else if (change.kind === "block_usual") {
        occurrence.startsAt = occurrence.block.startsAt;
        occurrence.endsAt = occurrence.block.endsAt;
        occurrence.changed = false;
      } else {
        occurrence.startsAt = change.startsAt;
        occurrence.endsAt = change.endsAt;
        occurrence.changed = true;
      }
      continue;
    }
    for (const occurrence of blocks) {
      const slot = occurrence.slots.find(
        (candidate) => candidate.id === change.slotId,
      );
      if (slot === undefined) continue;
      if (change.kind === "slot_length") slot.lengthMin = change.lengthMin;
      else if (change.kind === "slot_off") slot.off = true;
      else delete slot.off;
    }
  }

  return { ...day, blocks };
}
