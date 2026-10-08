import { and, eq, isNull } from "drizzle-orm";

import { workflowColumns, workflowTasks, type RlsClient } from "@syn/db";
import type { WorkflowTaskView } from "@syn/types";
import type { WorkflowTaskSetFiringInput } from "@syn/validators";

import { WorkflowRuleError, found } from "./rule-error";
import { TASK_COLUMNS, toTaskView } from "./to-view";

/**
 * Fire, or mark back — SET, NEVER TOGGLED (TD-36, UX §3.3).
 *
 * The caller sends the state it wants and its own `at`, so the optimistic row
 * and the stored row agree to the millisecond. `firing: true` stamps
 * `firing_started_at` only if it is null; `firing: false` stamps
 * `last_returned_at` and clears firing only if it is set. Either is a no-op
 * otherwise and returns the task as it is — safe under a double tap, a retry,
 * and two devices.
 *
 * Firing exists only in the active column (W11): anywhere else the call is
 * refused with `not_in_active_column`.
 *
 * This signature is the seam for detection from Claude Code (UX §12): a
 * future inbound route would call this same service.
 */
export async function setWorkflowTaskFiring(
  rls: RlsClient,
  userId: string,
  input: WorkflowTaskSetFiringInput,
): Promise<WorkflowTaskView> {
  return rls.execute(async (tx) => {
    const row = found(
      (
        await tx
          .select({ task: TASK_COLUMNS, role: workflowColumns.role })
          .from(workflowTasks)
          .innerJoin(workflowColumns, eq(workflowColumns.id, workflowTasks.columnId))
          .where(
            and(
              eq(workflowTasks.id, input.id),
              eq(workflowTasks.userId, userId),
              isNull(workflowTasks.archivedAt),
            ),
          )
          .limit(1)
      )[0],
    );
    if (row.role !== "active") throw new WorkflowRuleError("not_in_active_column");

    const { task } = row;
    const isFiring = task.firingStartedAt !== null;
    if (input.firing === isFiring) return toTaskView(task);

    const [updated] = await tx
      .update(workflowTasks)
      .set(
        input.firing
          ? { firingStartedAt: input.at, updatedAt: input.at }
          : { firingStartedAt: null, lastReturnedAt: input.at, updatedAt: input.at },
      )
      .where(and(eq(workflowTasks.id, task.id), eq(workflowTasks.userId, userId)))
      .returning(TASK_COLUMNS);
    return toTaskView(found(updated));
  });
}
