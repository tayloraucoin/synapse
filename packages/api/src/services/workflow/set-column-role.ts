import { and, eq, isNull } from "drizzle-orm";

import { workflowColumns, workflowTasks, type RlsClient } from "@syn/db";
import type { WorkflowColumnRole, WorkflowColumnView } from "@syn/types";
import type { WorkflowColumnSetRoleInput } from "@syn/validators";

import { roleEffects } from "./apply-role-effects";
import type { Tx } from "./cells";
import { found } from "./rule-error";
import { readColumns } from "./save-columns";

/**
 * A column's role changed under its tasks: run the role effects over each
 * open task in it, as if each had arrived in a column with the new role.
 * Taking *Tasks fire here* off ends firing (WF-04's dialog says so first);
 * taking *Closed tasks land here* off reopens what was closed there.
 */
async function applyRoleToTasks(
  tx: Tx,
  userId: string,
  columnId: string,
  toRole: WorkflowColumnRole | null,
  now: Date,
): Promise<void> {
  const tasks = await tx
    .select({
      id: workflowTasks.id,
      firingStartedAt: workflowTasks.firingStartedAt,
      closedAt: workflowTasks.closedAt,
    })
    .from(workflowTasks)
    .where(
      and(
        eq(workflowTasks.columnId, columnId),
        eq(workflowTasks.userId, userId),
        isNull(workflowTasks.archivedAt),
      ),
    );
  for (const task of tasks) {
    const effects = roleEffects({ toRole, closedAt: task.closedAt, now });
    if (
      effects.firingStartedAt?.getTime() === task.firingStartedAt?.getTime() &&
      effects.closedAt?.getTime() === task.closedAt?.getTime()
    ) {
      continue;
    }
    await tx
      .update(workflowTasks)
      .set({ ...effects, updatedAt: now })
      .where(and(eq(workflowTasks.id, task.id), eq(workflowTasks.userId, userId)));
  }
}

/**
 * *Tasks fire here* / *Closed tasks land here* (W11, WF-04). Setting a role
 * takes it from any other column in the view in the same transaction — the
 * other column first, so the partial unique index never sees two — and both
 * columns' tasks get the role effects. Clearing a role is `role: null`.
 */
export async function setWorkflowColumnRole(
  rls: RlsClient,
  userId: string,
  input: WorkflowColumnSetRoleInput,
  now: Date = new Date(),
): Promise<WorkflowColumnView[]> {
  return rls.execute(async (tx) => {
    const column = found(
      (
        await tx
          .select({ id: workflowColumns.id, viewId: workflowColumns.viewId, role: workflowColumns.role })
          .from(workflowColumns)
          .where(and(eq(workflowColumns.id, input.id), eq(workflowColumns.userId, userId)))
          .limit(1)
      )[0],
    );
    if (column.role === input.role) return readColumns(tx, userId, column.viewId);

    if (input.role !== null) {
      const holders = await tx
        .update(workflowColumns)
        .set({ role: null, updatedAt: now })
        .where(
          and(
            eq(workflowColumns.viewId, column.viewId),
            eq(workflowColumns.userId, userId),
            eq(workflowColumns.role, input.role),
          ),
        )
        .returning({ id: workflowColumns.id });
      for (const holder of holders) await applyRoleToTasks(tx, userId, holder.id, null, now);
    }

    await tx
      .update(workflowColumns)
      .set({ role: input.role, updatedAt: now })
      .where(and(eq(workflowColumns.id, column.id), eq(workflowColumns.userId, userId)));
    await applyRoleToTasks(tx, userId, column.id, input.role, now);

    return readColumns(tx, userId, column.viewId);
  });
}
