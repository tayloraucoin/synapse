import { tierRank } from "../../work/next";
import {
  buildPlan,
  emptyEdits,
  isOrient,
  liveBlocks,
  liveSlots,
  lockedReason,
  movesOf,
  overlapMin,
  spanOf,
  splitsOf,
  toMinutes,
  type BlockMove,
  type RoomDay,
  type RoomOccurrence,
  type RoomPlan,
  type RoomRefusal,
  type RoomResult,
  type RoomSlot,
  type SetTimeSplit,
  type Span,
} from "./day";

/**
 * Make room (make-room/index.md; D-USE-11, D-USE-16): minutes for an addition
 * to a block. The Phase 1 default needs no sheet: the block's free minutes,
 * then the gap after it, then ONE item in the same block, the most flexible,
 * giving at most half its length. Only when that is not enough does the
 * sheet ask, listing every candidate here and in the other blocks, with why
 * the ones that can never give cannot. Urgent work is never offered.
 *
 * Minutes taken from another block ripple: the blocks between it and this
 * one move by those minutes, so this block grows by exactly what was taken
 * and nothing after the far block moves.
 */

/** An item gives at most this share of its length (the dev notes' default). */
export const ITEM_GIVES_AT_MOST = 0.5;

/** "Most flexible" in a Work block: Stretch, then Secondary, then Primary. */
const WORK_GIVES = new Set(["stretch", "secondary", "primary"]);

export type RoomTake =
  | {
      kind: "gap";
      blockId: string;
      /** The block's free minutes, or the free run after its end. */
      where: "inside" | "after";
      minutes: number;
    }
  | { kind: "item"; blockId: string; slotId: string; minutes: number };

export type RoomLockReason =
  "travel" | "set_time" | "day_event" | "orient" | "done";

export interface RoomCandidate {
  /** The sheet's two sources: "From <block>" and "From other blocks". */
  source: "this_block" | "other_blocks";
  blockId: string;
  kind: "gap" | "item" | "event" | "orient";
  where?: "inside" | "after";
  /** The slot's or the event's id; null for a gap or Orient. */
  id: string | null;
  /** The item's length, the gap's free minutes, the event's length. */
  lengthMin: number;
  /** The most it may give; 0 when it never gives. */
  gives: number;
  eligible: boolean;
  reason: RoomLockReason | null;
}

export interface RoomSummary {
  needed: number;
  /** "<found> of <needed> min found": every take's minutes, summed. */
  found: number;
  takes: RoomTake[];
  moves: BlockMove[];
  splits: SetTimeSplit[];
}

export type FindRoom =
  | { kind: "fits"; freeMin: number }
  | { kind: "default"; takes: RoomTake[]; plan: RoomPlan<RoomSummary> }
  | { kind: "ask"; needed: number; candidates: RoomCandidate[] }
  | RoomRefusal;

const gives = (slot: RoomSlot): number =>
  Math.floor(slot.lengthMin * ITEM_GIVES_AT_MOST);

/** A block's free minutes: its length less its items and the events in it. */
function freeMin(day: RoomDay, occurrence: RoomOccurrence): number {
  const span = spanOf(occurrence);
  const held = liveSlots(occurrence).reduce(
    (sum, slot) => sum + slot.lengthMin,
    0,
  );
  const events = day.events.reduce(
    (sum, event) => sum + overlapMin(span, eventSpan(event)),
    0,
  );
  return Math.max(0, span.end - span.start - held - events);
}

const eventSpan = (event: { startsAt: string; endsAt: string }): Span => ({
  start: toMinutes(event.startsAt),
  end: toMinutes(event.endsAt),
});

/** The free run after a block, to the next block or event; none after the last. */
function gapAfterMin(day: RoomDay, occurrence: RoomOccurrence): number {
  const end = spanOf(occurrence).end;
  const starts: number[] = [];
  for (const other of liveBlocks(day)) {
    if (other === occurrence) continue;
    const span = spanOf(other);
    if (span.end > end && span.start < end) return 0;
    if (span.start >= end) starts.push(span.start);
  }
  if (starts.length === 0) return 0;
  for (const event of day.events) {
    const span = eventSpan(event);
    if (span.start <= end && span.end > end) return 0;
    if (span.start >= end) starts.push(span.start);
  }
  return Math.min(...starts) - end;
}

/** The one item that gives first, by the dev notes' "most flexible". */
function mostFlexible(occurrence: RoomOccurrence): RoomSlot | null {
  const work = occurrence.block.kind === "work";
  const open = liveSlots(occurrence).filter(
    (slot) =>
      lockedReason(slot) === null && (!work || WORK_GIVES.has(slot.tier ?? "")),
  );
  open.sort(
    (a, b) =>
      (work ? tierRank(b.tier ?? "") - tierRank(a.tier ?? "") : 0) ||
      b.lengthMin - a.lengthMin ||
      a.sortOrder - b.sortOrder ||
      a.id.localeCompare(b.id),
  );
  return open[0] ?? null;
}

/** The order the ripple walks, Orient included so it is never crossed. */
const orderOf = (day: RoomDay) => liveBlocks(day);

function crossesOrient(
  order: RoomOccurrence[],
  from: number,
  to: number,
): boolean {
  const [low, high] = from < to ? [from, to] : [to, from];
  return order.slice(low, high + 1).some(isOrient);
}

/** Every candidate the sheet lists, Urgent work left out. */
function candidatesFor(day: RoomDay, target: RoomOccurrence): RoomCandidate[] {
  const order = orderOf(day);
  const at = order.indexOf(target);
  const candidates: RoomCandidate[] = [];

  for (const occurrence of order) {
    const source = occurrence === target ? "this_block" : "other_blocks";
    const blockId = occurrence.block.id;
    if (isOrient(occurrence)) {
      const span = spanOf(occurrence);
      candidates.push({
        source,
        blockId,
        kind: "orient",
        id: null,
        lengthMin: span.end - span.start,
        gives: 0,
        eligible: false,
        reason: "orient",
      });
      continue;
    }
    const across = crossesOrient(order, order.indexOf(occurrence), at);

    const free = freeMin(day, occurrence);
    if (free > 0) {
      candidates.push({
        source,
        blockId,
        kind: "gap",
        where: "inside",
        id: null,
        lengthMin: free,
        gives: across ? 0 : free,
        eligible: !across,
        reason: across ? "orient" : null,
      });
    }
    if (occurrence === target) {
      const after = gapAfterMin(day, occurrence);
      if (after > 0) {
        candidates.push({
          source,
          blockId,
          kind: "gap",
          where: "after",
          id: null,
          lengthMin: after,
          gives: after,
          eligible: true,
          reason: null,
        });
      }
    }

    for (const slot of liveSlots(occurrence)) {
      const locked = lockedReason(slot);
      if (locked === "urgent") continue;
      const reason = locked ?? (across ? "orient" : null);
      candidates.push({
        source,
        blockId,
        kind: "item",
        id: slot.id,
        lengthMin: slot.lengthMin,
        gives: reason === null ? gives(slot) : 0,
        eligible: reason === null,
        reason,
      });
    }

    const span = spanOf(occurrence);
    for (const event of day.events) {
      if (overlapMin(span, eventSpan(event)) === 0) continue;
      const own = eventSpan(event);
      candidates.push({
        source,
        blockId,
        kind: "event",
        id: event.id,
        lengthMin: own.end - own.start,
        gives: 0,
        eligible: false,
        reason: "day_event",
      });
    }
  }

  return candidates;
}

/**
 * The takes the sheet picked (or the default) → a today-only plan. Each take
 * is refused when it gives more than it holds or was never eligible.
 */
export function planRoom(
  day: RoomDay,
  {
    blockId,
    minutes,
    takes,
  }: { blockId: string; minutes: number; takes: readonly RoomTake[] },
): RoomResult<RoomSummary> {
  const order = orderOf(day);
  const target = order.find((occurrence) => occurrence.block.id === blockId);
  if (target === undefined || isOrient(target)) {
    return {
      kind: "refused",
      reason: target ? "not_eligible" : "unknown",
      ids: [blockId],
    };
  }
  const at = order.indexOf(target);
  const candidates = candidatesFor(day, target);

  const delta = new Map<string, { start: number; end: number }>();
  const shift = (id: string, start: number, end: number) => {
    const was = delta.get(id) ?? { start: 0, end: 0 };
    delta.set(id, { start: was.start + start, end: was.end + end });
  };
  const edits = emptyEdits();
  const given = new Map<string, number>();

  for (const take of takes) {
    const id = take.kind === "item" ? take.slotId : null;
    const where = take.kind === "gap" ? take.where : undefined;
    const candidate = candidates.find(
      (one) =>
        one.blockId === take.blockId &&
        one.kind === take.kind &&
        one.id === id &&
        one.where === where,
    );
    const ref = id ?? `${take.blockId}:${where}`;
    if (candidate === undefined) {
      return { kind: "refused", reason: "unknown", ids: [ref] };
    }
    if (!candidate.eligible)
      return { kind: "refused", reason: "not_eligible", ids: [ref] };
    const total = (given.get(ref) ?? 0) + take.minutes;
    if (take.minutes <= 0 || total > candidate.gives) {
      return { kind: "refused", reason: "too_much", ids: [ref] };
    }
    given.set(ref, total);

    if (take.kind === "item") {
      const slot = order
        .flatMap((occurrence) => occurrence.slots)
        .find((one) => one.id === take.slotId) as RoomSlot;
      const was = edits.slots.get(slot.id);
      const length =
        was === undefined || was === "off" ? slot.lengthMin : was.lengthMin;
      edits.slots.set(slot.id, { lengthMin: length - take.minutes });
    }

    if (take.kind === "gap" && take.where === "after") {
      shift(blockId, 0, take.minutes);
      continue;
    }
    const from = order.findIndex(
      (occurrence) => occurrence.block.id === take.blockId,
    );
    if (from === at) continue;

    // The far block gives its minutes up; every block between moves by them.
    const m = take.minutes;
    if (from < at) {
      shift(order[from]!.block.id, 0, -m);
      for (let i = from + 1; i < at; i++) shift(order[i]!.block.id, -m, -m);
      shift(blockId, -m, 0);
    } else {
      shift(blockId, 0, m);
      for (let i = at + 1; i < from; i++) shift(order[i]!.block.id, m, m);
      shift(order[from]!.block.id, m, 0);
    }
  }

  for (const occurrence of order) {
    const change = delta.get(occurrence.block.id);
    if (change === undefined) continue;
    const span = spanOf(occurrence);
    edits.blocks.set(occurrence.block.id, {
      start: span.start + change.start,
      end: span.end + change.end,
    });
  }

  return buildPlan(day, edits, {
    needed: minutes,
    found: takes.reduce((sum, take) => sum + take.minutes, 0),
    takes: [...takes],
    moves: movesOf(day, edits),
    splits: splitsOf(day, edits),
  });
}

export function findRoom(
  day: RoomDay,
  { blockId, minutes }: { blockId: string; at?: number; minutes: number },
): FindRoom {
  const target = liveBlocks(day).find(
    (occurrence) => occurrence.block.id === blockId,
  );
  if (target === undefined) {
    return { kind: "refused", reason: "unknown", ids: [blockId] };
  }
  if (isOrient(target))
    return { kind: "refused", reason: "not_eligible", ids: [blockId] };

  const free = freeMin(day, target);
  if (free >= minutes) return { kind: "fits", freeMin: free };

  const takes: RoomTake[] = [];
  let need = minutes;
  if (free > 0) {
    takes.push({ kind: "gap", blockId, where: "inside", minutes: free });
    need -= free;
  }
  const after = Math.min(need, gapAfterMin(day, target));
  if (after > 0) {
    takes.push({ kind: "gap", blockId, where: "after", minutes: after });
    need -= after;
  }
  if (need > 0) {
    const slot = mostFlexible(target);
    if (slot === null || gives(slot) < need) {
      return {
        kind: "ask",
        needed: minutes,
        candidates: candidatesFor(day, target),
      };
    }
    takes.push({ kind: "item", blockId, slotId: slot.id, minutes: need });
  }

  const result = planRoom(day, { blockId, minutes, takes });
  if (result.kind !== "plan") {
    return {
      kind: "ask",
      needed: minutes,
      candidates: candidatesFor(day, target),
    };
  }
  return { kind: "default", takes, plan: result.plan };
}
