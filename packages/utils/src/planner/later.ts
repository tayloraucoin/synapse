/**
 * Where Later puts an item left in a closed block (USE-25; D-USE-70): the
 * end of the next block of the same kind today, else the end of the next
 * block. Today only: the usual week is never changed. Null when no block
 * follows, so Later is not offered (D-USE-74).
 */

/** A block on the date, in start order, with the sort orders it holds. */
export interface LaterBlock {
  id: string;
  kind: string;
  start: Date;
  end: Date;
  /** The all-day checklist is never a block to move into. */
  allDay?: boolean;
  /** Every row's sort order on the date, set items and pulled rows alike. */
  sortOrders: readonly number[];
}

export interface LaterTarget {
  blockId: string;
  /** One past the block's last row: the end. */
  sortOrder: number;
}

export function laterTarget({
  blocks,
  fromBlockId,
  now,
}: {
  blocks: readonly LaterBlock[];
  fromBlockId: string;
  now: Date;
}): LaterTarget | null {
  const from = blocks.find((block) => block.id === fromBlockId);
  if (!from) return null;
  const at = now.getTime();
  // After the closed block in order, and not yet over.
  const later = blocks.filter(
    (block) =>
      block.id !== from.id &&
      block.allDay !== true &&
      block.start.getTime() >= from.start.getTime() &&
      block.end.getTime() > at &&
      blocks.indexOf(block) > blocks.indexOf(from),
  );
  const target =
    later.find((block) => block.kind === from.kind) ?? later[0] ?? null;
  if (target === null) return null;
  return {
    blockId: target.id,
    sortOrder: Math.max(-1, ...target.sortOrders) + 1,
  };
}
