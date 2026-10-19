/**
 * A long task's sessions (USE-8; D-USE-40, D-USE-57, D-USE-65,
 * C-USE-sessions-1). One work item placed on several days is one session a
 * day, numbered by DATE, never array order: "session 1 of 3". A session's
 * Done names the next one and never marks the task done; only the task's own
 * done (or Linear's) does, and nothing here reads or writes it.
 */

export interface SessionSlot {
  id: string;
  workItemId: string;
  /** `YYYY-MM-DD`; an unplaced slot (null) is no session. */
  onDate: string | null;
  doneAt: Date | string | null;
}

function byDate(a: SessionSlot, b: SessionSlot): number {
  const ad = a.onDate ?? "";
  const bd = b.onDate ?? "";
  if (ad !== bd) return ad < bd ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** Slot id → its n of m among its item's dated slots. */
export function countSessions(
  slots: readonly SessionSlot[],
): Map<string, { n: number; of: number }> {
  const byItem = new Map<string, SessionSlot[]>();
  for (const slot of slots) {
    if (slot.onDate === null) continue;
    const list = byItem.get(slot.workItemId) ?? [];
    list.push(slot);
    byItem.set(slot.workItemId, list);
  }

  const counted = new Map<string, { n: number; of: number }>();
  for (const list of byItem.values()) {
    list.sort(byDate).forEach((slot, index) => {
      counted.set(slot.id, { n: index + 1, of: list.length });
    });
  }
  return counted;
}

/** The first undone session of the item dated after `afterDateKey`, by id; null past the last. */
export function nextSession(
  slots: readonly SessionSlot[],
  workItemId: string,
  afterDateKey: string,
): string | null {
  const next = slots
    .filter(
      (slot) =>
        slot.workItemId === workItemId &&
        slot.onDate !== null &&
        slot.onDate > afterDateKey &&
        slot.doneAt === null,
    )
    .sort(byDate)[0];
  return next?.id ?? null;
}
