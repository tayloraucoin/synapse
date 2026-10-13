import { WORK_TIERS } from "@syn/constants";
import type { SlotClockState } from "../planner";

/**
 * Which work slot is Next (USE-8; D-USE-43, D-USE-45, D-USE-78).
 *
 * ORDER AND NOTHING ELSE: Urgent, Primary, Secondary, Stretch, then each
 * slot's sort order; never time, size or due date. Next is the first slot
 * neither firing, running, done nor waiting. The running slot holds the lift,
 * so it is never Next; a waiting slot (Blocked, Paused, In review) has left
 * the tiers. A slot brought back is idle or paused again, so it can be Next.
 *
 * Total: any slots give one of three answers. Every device runs this over the
 * same rows, and the server never stores the result.
 */

export type WorkTier = (typeof WORK_TIERS)[number];

export interface NextSlot {
  id: string;
  tier: WorkTier;
  sortOrder: number;
  waiting: boolean;
}

export type WorkNext =
  { kind: "slot"; slotId: string } | { kind: "all_firing" } | { kind: "none" };

/** A tier's place in the walk; anything unknown walks last. */
export function tierRank(tier: string): number {
  const index = (WORK_TIERS as readonly string[]).indexOf(tier);
  return index === -1 ? WORK_TIERS.length : index;
}

/** Tier, then sort order, then id, so array order never decides. */
export function compareInTiers(
  a: { id: string; tier: string; sortOrder: number },
  b: { id: string; tier: string; sortOrder: number },
): number {
  const byTier = tierRank(a.tier) - tierRank(b.tier);
  if (byTier !== 0) return byTier;
  const aOrder = Number.isFinite(a.sortOrder) ? a.sortOrder : Infinity;
  const bOrder = Number.isFinite(b.sortOrder) ? b.sortOrder : Infinity;
  if (aOrder !== bOrder) return aOrder < bOrder ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

const NOT_NEXT: ReadonlySet<SlotClockState> = new Set([
  "firing",
  "running",
  "done",
]);

export function resolveWorkNext(input: {
  slots: readonly NextSlot[];
  states: ReadonlyMap<string, SlotClockState>;
}): WorkNext {
  const stateOf = (id: string): SlotClockState =>
    input.states.get(id) ?? "idle";

  const next = [...input.slots]
    .sort(compareInTiers)
    .find((slot) => !slot.waiting && !NOT_NEXT.has(stateOf(slot.id)));
  if (next) return { kind: "slot", slotId: next.id };

  // Nothing left to do: "Everything is firing." only with nothing in hand.
  const states = input.slots.map((slot) => stateOf(slot.id));
  if (states.includes("running")) return { kind: "none" };
  return states.includes("firing") ? { kind: "all_firing" } : { kind: "none" };
}
