import type { WorkflowColumnRole } from "@syn/types";

/**
 * The role effects — the ONE place firing and closed are changed by movement
 * (TD-35, UX §3.3, §3.8). Every path that changes a task's column, or a
 * column's role under its tasks, calls this: `move`, `start`, `task.create`,
 * `task.restore`, `column.remove`, `column.setRole`.
 *
 * - **Firing never survives a change of column.** Leaving the active column —
 *   for another column, another view, the archive — ends it, and does NOT
 *   stamp `last_returned_at`: the prompt did not come back, the task left.
 *   Firing is restored only by an undo, which carries the prior
 *   `firingStartedAt`, and only into an active column.
 * - **Closed is the done column.** Entering it stamps `closed_at` (keeping an
 *   existing stamp); anywhere else it is cleared.
 *
 * Pure: `now` is an argument.
 */
export function roleEffects(input: {
  toRole: WorkflowColumnRole | null;
  closedAt: Date | null;
  now: Date;
  /** The undo's prior firing — `undefined` when this is not an undo. */
  restoreFiringStartedAt?: Date | null;
}): { firingStartedAt: Date | null; closedAt: Date | null } {
  const firingStartedAt =
    input.toRole === "active" && input.restoreFiringStartedAt !== undefined
      ? input.restoreFiringStartedAt
      : null;
  const closedAt = input.toRole === "done" ? (input.closedAt ?? input.now) : null;
  return { firingStartedAt, closedAt };
}
