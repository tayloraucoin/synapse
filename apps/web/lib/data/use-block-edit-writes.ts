"use client";

import { blockEdits, type BlockEditPlace } from "./block-edit";
import { usePlannerWrites } from "./use-planner-writes";

/**
 * Block view's writes in editing (USE-49): `blockEdits` over the set-up
 * area's queue, so offline every edit saves on the phone and lands, in the
 * order made, once the connection is back (D-USE-67). Every block and item
 * write waits in the queue; none is refused offline.
 */
export function useBlockEditWrites(blockId: string, place: BlockEditPlace) {
  const planner = usePlannerWrites();
  return {
    ...blockEdits(planner, blockId, place),
    undo: (token: string) => planner.undo(token),
    online: planner.online,
  };
}
