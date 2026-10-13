import { and, asc, eq, isNull, type SQL } from "drizzle-orm";

import { workflowTasks, type RlsClient } from "@syn/db";

/**
 * A cell — one lane in one column — and its dense order (TD-35).
 *
 * A cell is the unarchived tasks with one `column_id` and one `group_id`
 * (null is the lane *No group*). The column fixes the view. Archived tasks keep
 * a stale `sort_order` and sit in no cell. `sort_order` is 0…n−1 inside a cell
 * after every write, rewritten by the server from the full ordered id list —
 * the house's one ordering idiom; no fractional keys.
 */

export type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

export function cellWhere(userId: string, columnId: string, groupId: string | null): SQL {
  return and(
    eq(workflowTasks.userId, userId),
    eq(workflowTasks.columnId, columnId),
    groupId === null ? isNull(workflowTasks.groupId) : eq(workflowTasks.groupId, groupId),
    isNull(workflowTasks.archivedAt),
  ) as SQL;
}

/** The cell's ids in order. */
export async function readCell(
  tx: Tx,
  userId: string,
  columnId: string,
  groupId: string | null,
): Promise<{ id: string; sortOrder: number }[]> {
  return tx
    .select({ id: workflowTasks.id, sortOrder: workflowTasks.sortOrder })
    .from(workflowTasks)
    .where(cellWhere(userId, columnId, groupId))
    .orderBy(asc(workflowTasks.sortOrder), asc(workflowTasks.createdAt), asc(workflowTasks.id));
}

/**
 * Write `sort_order` 0…n−1 over `ids`, touching only the rows whose order
 * changed — so the same move sent twice writes nothing the second time.
 * `current` is what each id held before (absent for a row joining the cell).
 */
export async function rewriteOrder(
  tx: Tx,
  userId: string,
  ids: readonly string[],
  current: ReadonlyMap<string, number>,
  now: Date,
): Promise<void> {
  for (const [index, id] of ids.entries()) {
    if (current.get(id) === index) continue;
    await tx
      .update(workflowTasks)
      .set({ sortOrder: index, updatedAt: now })
      .where(and(eq(workflowTasks.id, id), eq(workflowTasks.userId, userId)));
  }
}

/** `toIndex` clamped into `[0, length]`. */
export function clampIndex(toIndex: number, length: number): number {
  return Math.max(0, Math.min(toIndex, length));
}

/** A list with `id` placed at `index` (after removing any earlier occurrence). */
export function insertAt(ids: readonly string[], id: string, index: number): string[] {
  const rest = ids.filter((other) => other !== id);
  const at = clampIndex(index, rest.length);
  return [...rest.slice(0, at), id, ...rest.slice(at)];
}

/**
 * A full-list reorder over one list of rows (views, columns, groups): every
 * row in `active` must be named, extras are ignored — `reorderLinks`' rule.
 * Returns the ordered ids to write, or throws `incomplete_reorder`.
 */
export function orderFromFullList(
  activeIds: readonly string[],
  ids: readonly string[],
  onIncomplete: () => never,
): string[] {
  const wanted = new Set(ids);
  if (activeIds.some((id) => !wanted.has(id))) onIncomplete();
  const active = new Set(activeIds);
  return [...new Set(ids)].filter((id) => active.has(id));
}
