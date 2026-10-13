import type { SlotEventKind } from "@syn/types";

/**
 * The clock, derived from a day's slot events (USE-5; the data contract's
 * "The clock"). The same function runs on every device and on the server, so
 * a timer started on the phone reads right at the desk.
 *
 * Two clocks per slot (D-USE-44): work time runs from started or resumed to
 * paused, prompt_sent, done or day_closed; firing runs from prompt_sent to
 * brought_back, done or day_closed, and brought_back never opens a work span.
 * Inside a Work block one slot is in hand at a time (D-USE-43); outside one,
 * several run at once (D-USE-27). Step away pauses with one shared id that
 * Resume all reads (D-USE-46). The day's close is derived, never written (C11).
 *
 * TOTAL: any events, in any order, duplicated or unparseable, give one clock.
 * Order is `at`, then `receivedAt`, then `clientEventId`, never array order.
 */

/** One slot event as the clock reads it; structural, so any row shape fits. */
export interface ClockEvent {
  slotId: string;
  kind: SlotEventKind;
  at: string;
  receivedAt: string;
  clientEventId: string;
  stepAwayId: string | null;
}

/** `end` is null while the span is open. */
export interface Span {
  start: Date;
  end: Date | null;
}

export type SlotClockState = "idle" | "running" | "paused" | "firing" | "done";

export interface SlotClock {
  state: SlotClockState;
  work: Span[];
  firing: Span[];
  doneAt: Date | null;
  /** The Step away id holding this slot, until a span opens again. */
  heldBy: string | null;
}

export interface StepAwayHold {
  id: string;
  at: Date;
  slotIds: string[];
}

export interface DayClock {
  slots: Map<string, SlotClock>;
  /** The latest hold with a slot still held, or null. */
  stepAway: StepAwayHold | null;
}

export interface DeriveClockOptions {
  /** `[start, end)` from `dayWindow` — it opens at `day_close_time`. */
  dayWindow: { start: Date; end: Date };
  /** Slots in a Work block, where at most one work span is open. */
  workSlotIds: ReadonlySet<string>;
}

interface ParsedEvent extends ClockEvent {
  atMs: number;
  receivedMs: number;
}

interface FoldSlot {
  state: SlotClockState;
  work: [number, number | null][];
  firing: [number, number | null][];
  doneAt: number | null;
  heldBy: string | null;
}

/** A replay is the same event; the earliest arrival wins, ties settled by content. */
function isEarlierCopy(a: ParsedEvent, b: ParsedEvent): boolean {
  if (a.receivedMs !== b.receivedMs) return a.receivedMs < b.receivedMs;
  return canonical(a) < canonical(b);
}

function canonical(event: ParsedEvent): string {
  return [event.atMs, event.slotId, event.kind, event.stepAwayId ?? ""].join(
    "\u0000",
  );
}

function compareEvents(a: ParsedEvent, b: ParsedEvent): number {
  if (a.atMs !== b.atMs) return a.atMs - b.atMs;
  if (a.receivedMs !== b.receivedMs) return a.receivedMs - b.receivedMs;
  if (a.clientEventId !== b.clientEventId)
    return a.clientEventId < b.clientEventId ? -1 : 1;
  return 0;
}

function orderEvents(
  events: readonly ClockEvent[],
  startMs: number,
  endMs: number,
): ParsedEvent[] {
  const byId = new Map<string, ParsedEvent>();
  for (const event of events) {
    const atMs = Date.parse(event.at);
    const receivedMs = Date.parse(event.receivedAt);
    if (Number.isNaN(atMs) || Number.isNaN(receivedMs)) continue;
    const parsed: ParsedEvent = { ...event, atMs, receivedMs };
    const kept = byId.get(event.clientEventId);
    if (!kept || isEarlierCopy(parsed, kept))
      byId.set(event.clientEventId, parsed);
  }
  return [...byId.values()]
    .filter((event) => event.atMs >= startMs && event.atMs < endMs)
    .sort(compareEvents);
}

function closeOpen(spans: [number, number | null][], atMs: number): void {
  const last = spans[spans.length - 1];
  if (last && last[1] === null) last[1] = atMs;
}

function isOpen(spans: [number, number | null][]): boolean {
  const last = spans[spans.length - 1];
  return last !== undefined && last[1] === null;
}

/** Where a slot rests with nothing counting. */
function restingState(slot: FoldSlot): SlotClockState {
  return slot.work.length ? "paused" : "idle";
}

function slotFor(slots: Map<string, FoldSlot>, slotId: string): FoldSlot {
  let slot = slots.get(slotId);
  if (!slot) {
    slot = { state: "idle", work: [], firing: [], doneAt: null, heldBy: null };
    slots.set(slotId, slot);
  }
  return slot;
}

function openWork(
  slots: Map<string, FoldSlot>,
  event: ParsedEvent,
  workSlotIds: ReadonlySet<string>,
): void {
  const slot = slotFor(slots, event.slotId);
  if (workSlotIds.has(event.slotId)) {
    for (const [otherId, other] of slots) {
      if (otherId === event.slotId || !workSlotIds.has(otherId)) continue;
      if (!isOpen(other.work)) continue;
      closeOpen(other.work, event.atMs);
      other.state = restingState(other);
    }
  }
  closeOpen(slot.firing, event.atMs);
  if (!isOpen(slot.work)) slot.work.push([event.atMs, null]);
  slot.state = "running";
  slot.heldBy = null;
}

function applyEvent(
  slots: Map<string, FoldSlot>,
  event: ParsedEvent,
  workSlotIds: ReadonlySet<string>,
  holdAt: Map<string, number>,
): void {
  const slot = slotFor(slots, event.slotId);
  if (slot.state === "done") {
    if (event.kind !== "undone") return;
    slot.doneAt = null;
    slot.state = restingState(slot);
    return;
  }
  switch (event.kind) {
    case "started":
    case "resumed":
      openWork(slots, event, workSlotIds);
      return;
    case "paused":
      closeOpen(slot.work, event.atMs);
      slot.state = isOpen(slot.firing) ? "firing" : restingState(slot);
      if (event.stepAwayId) {
        slot.heldBy = event.stepAwayId;
        if (!holdAt.has(event.stepAwayId))
          holdAt.set(event.stepAwayId, event.atMs);
      }
      return;
    case "prompt_sent":
      closeOpen(slot.work, event.atMs);
      if (!isOpen(slot.firing)) slot.firing.push([event.atMs, null]);
      slot.state = "firing";
      return;
    case "brought_back":
      closeOpen(slot.firing, event.atMs);
      slot.state = isOpen(slot.work) ? "running" : restingState(slot);
      return;
    case "done":
      closeOpen(slot.work, event.atMs);
      closeOpen(slot.firing, event.atMs);
      slot.doneAt = event.atMs;
      slot.state = "done";
      slot.heldBy = null;
      return;
    case "day_closed":
      closeOpen(slot.work, event.atMs);
      closeOpen(slot.firing, event.atMs);
      slot.state = restingState(slot);
      return;
    default:
      // `undone` on a slot that is not done, and any kind added later.
      return;
  }
}

/** Zero-length spans come from same-instant events and count for nothing. */
function toSpans(spans: [number, number | null][]): Span[] {
  return spans
    .filter(([start, end]) => end === null || end > start)
    .map(([start, end]) => ({
      start: new Date(start),
      end: end === null ? null : new Date(end),
    }));
}

function latestHold(
  slots: Map<string, SlotClock>,
  holdAt: Map<string, number>,
): StepAwayHold | null {
  const held = new Map<string, string[]>();
  for (const [slotId, slot] of slots) {
    if (!slot.heldBy) continue;
    held.set(slot.heldBy, [...(held.get(slot.heldBy) ?? []), slotId]);
  }
  let latest: StepAwayHold | null = null;
  for (const [id, slotIds] of held) {
    const atMs = holdAt.get(id) ?? 0;
    const later =
      !latest ||
      atMs > latest.at.getTime() ||
      (atMs === latest.at.getTime() && id > latest.id);
    if (later) latest = { id, at: new Date(atMs), slotIds: slotIds.sort() };
  }
  return latest;
}

/** One day's slot events → each slot's work, firing, done and Step away hold. */
export function deriveClock(
  events: readonly ClockEvent[],
  { dayWindow, workSlotIds }: DeriveClockOptions,
): DayClock {
  const ordered = orderEvents(
    events,
    dayWindow.start.getTime(),
    dayWindow.end.getTime(),
  );
  const folding = new Map<string, FoldSlot>();
  const holdAt = new Map<string, number>();
  for (const event of ordered) applyEvent(folding, event, workSlotIds, holdAt);

  const slots = new Map<string, SlotClock>();
  for (const slotId of [...folding.keys()].sort()) {
    const slot = folding.get(slotId)!;
    slots.set(slotId, {
      state: slot.state,
      work: toSpans(slot.work),
      firing: toSpans(slot.firing),
      doneAt: slot.doneAt === null ? null : new Date(slot.doneAt),
      heldBy: slot.heldBy,
    });
  }
  return { slots, stepAway: latestHold(slots, holdAt) };
}

function sumSpans(spans: Span[], limitMs: number): number {
  let total = 0;
  for (const span of spans) {
    const end = span.end === null ? limitMs : span.end.getTime();
    total += Math.max(0, end - span.start.getTime());
  }
  return total;
}

/**
 * A slot's two clocks at an instant. An open span counts to the earlier of
 * `now` and `dayEnd`; at or past `dayEnd` nothing runs (C11).
 */
export function clockAt(
  slot: SlotClock,
  now: Date,
  dayEnd: Date,
): { workMs: number; firingMs: number; running: boolean; firing: boolean } {
  const limitMs = Math.min(now.getTime(), dayEnd.getTime());
  const beforeEnd = now.getTime() < dayEnd.getTime();
  const openWork = slot.work.some((span) => span.end === null);
  const openFiring = slot.firing.some((span) => span.end === null);
  return {
    workMs: sumSpans(slot.work, limitMs),
    firingMs: sumSpans(slot.firing, limitMs),
    running: openWork && beforeEnd,
    firing: openFiring && beforeEnd,
  };
}
