import type { WorkTier } from "@syn/types";
import { compareInTiers } from "@syn/utils";

/**
 * A row dragged between Today's tiers at the desk (USE-71; the work menu's
 * note, N6): the drag ids DragToPlace carries, and the moves a drop makes.
 *
 * A row let go over another row lands just before it; over a tier, past
 * its rows, at that tier's end. The tier it lands in is numbered again from
 * 0 in its new order, and only a slot whose tier or place changes is
 * written, so a drop where it started writes nothing.
 */

export const TODAY_DRAG = {
  /** What lifts: one of today's work rows, by slot. */
  row: (slotId: string) => `today-row:${slotId}`,
  /** Lands just before this row. */
  before: (slotId: string) => `today-before:${slotId}`,
  /** Lands at this tier's end. */
  end: (tier: WorkTier) => `today-end:${tier}`,
} as const;

export type TodayDragId =
  | { kind: "row"; slotId: string }
  | { kind: "before"; slotId: string }
  | { kind: "end"; tier: WorkTier };

export function readTodayDrag(id: string): TodayDragId | null {
  const cut = id.indexOf(":");
  if (cut < 0) return null;
  const kind = id.slice(0, cut);
  const tail = id.slice(cut + 1);
  if (!tail) return null;
  if (kind === "today-row") return { kind: "row", slotId: tail };
  if (kind === "today-before") return { kind: "before", slotId: tail };
  if (kind === "today-end") return { kind: "end", tier: tail as WorkTier };
  return null;
}

export interface TierSlot {
  id: string;
  tier: WorkTier;
  sortOrder: number;
}

export interface TierMove {
  slotId: string;
  tier: WorkTier;
  sortOrder: number;
}

/**
 * The writes one drop makes: `slotId` into `tier`, before `beforeId` or at
 * the end; the moved slot first. Empty when nothing would change.
 */
export function tierDropMoves(
  slots: readonly TierSlot[],
  drop: { slotId: string; tier: WorkTier; beforeId: string | null },
): TierMove[] {
  const moved = slots.find((slot) => slot.id === drop.slotId);
  if (!moved || drop.beforeId === drop.slotId) return [];
  const inTier = (tier: WorkTier) =>
    slots.filter((slot) => slot.tier === tier).sort(compareInTiers);

  const was = inTier(drop.tier).map((slot) => slot.id);
  const order = was.filter((id) => id !== drop.slotId);
  const before = drop.beforeId === null ? -1 : order.indexOf(drop.beforeId);
  order.splice(before < 0 ? order.length : before, 0, drop.slotId);
  if (
    moved.tier === drop.tier &&
    order.every((id, index) => was[index] === id)
  ) {
    return [];
  }

  const byId = new Map(slots.map((slot) => [slot.id, slot]));
  const moves = order.flatMap((id, sortOrder) => {
    const slot = byId.get(id)!;
    return slot.tier === drop.tier && slot.sortOrder === sortOrder
      ? []
      : [{ slotId: id, tier: drop.tier, sortOrder }];
  });
  return [
    ...moves.filter((move) => move.slotId === drop.slotId),
    ...moves.filter((move) => move.slotId !== drop.slotId),
  ];
}
