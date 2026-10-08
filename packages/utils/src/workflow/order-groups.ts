/**
 * Today's lane order — Workflow UX spec v0.1 §3.5 (W9), Epic 7 TD-37, TD-38.
 *
 * The pinned groups first, in pin order (newest first, as stored), then the
 * rest in their usual order. A pinned id that names no group in the list — a
 * group archived after it was pinned — is ignored, not an error; a duplicated
 * pin keeps its first place.
 *
 * Pure: the day's pins are an argument, so the server's board read and the
 * client's patched cache order the lanes with the same function.
 */
export function orderGroupsForDay<T extends { id: string }>(
  groups: readonly T[],
  pinnedIds: readonly string[],
): T[] {
  const byId = new Map(groups.map((group) => [group.id, group]));
  const pinned: T[] = [];
  const placed = new Set<string>();

  for (const id of pinnedIds) {
    const group = byId.get(id);
    if (group === undefined || placed.has(id)) continue;
    pinned.push(group);
    placed.add(id);
  }

  return [...pinned, ...groups.filter((group) => !placed.has(group.id))];
}
