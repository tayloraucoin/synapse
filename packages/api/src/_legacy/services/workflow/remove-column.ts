import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";

import { workflowColumns, workflowTasks, type RlsClient } from "@syn/db";
import type { WorkflowColumnView } from "@syn/types";
import type { WorkflowColumnRemoveInput } from "@syn/validators";

import { roleEffects } from "./apply-role-effects";
import { readCell, rewriteOrder } from "./cells";
import { WorkflowRuleError, found } from "./rule-error";
import { readColumns } from "./save-columns";

/**
 * *Remove* a column (WF-04).
 *
 * - The view's last column cannot go (`last_column`).
 * - Holding open tasks and no `moveTasksTo`: refused (`column_has_tasks`) — the
 *   screen asks *Where should the tasks in {Column} go?* first. `column_id`
 *   restricts underneath, so the database agrees.
 * - With `moveTasksTo` (a column in the same view): each lane's tasks are
 *   appended to that lane's cell there, in order, with the role effects.
 * - ARCHIVED TASKS MOVE TOO — they still reference the column, and a later
 *   *Restore* needs a column to return to: to `moveTasksTo`, or to the view's
 *   first remaining column when only archived tasks were left.
 *
 * Then the column is deleted and the rest are rewritten dense.
 */
export async function removeWorkflowColumn(
  rls: RlsClient,
  userId: string,
  input: WorkflowColumnRemoveInput,
  now: Date = new Date(),
): Promise<WorkflowColumnView[]> {
  return rls.execute(async (tx) => {
    const column = found(
      (
        await tx
          .select({ id: workflowColumns.id, viewId: workflowColumns.viewId })
          .from(workflowColumns)
          .where(and(eq(workflowColumns.id, input.id), eq(workflowColumns.userId, userId)))
          .limit(1)
      )[0],
    );
    const columns = await readColumns(tx, userId, column.viewId);
    if (columns.length <= 1) throw new WorkflowRuleError("last_column");

    const open = await tx
      .select({
        id: workflowTasks.id,
        groupId: workflowTasks.groupId,
        closedAt: workflowTasks.closedAt,
      })
      .from(workflowTasks)
      .where(
        and(
          eq(workflowTasks.columnId, column.id),
          eq(workflowTasks.userId, userId),
          isNull(workflowTasks.archivedAt),
        ),
      )
      .orderBy(asc(workflowTasks.sortOrder), asc(workflowTasks.createdAt), asc(workflowTasks.id));

    if (open.length > 0 && input.moveTasksTo === undefined) {
      throw new WorkflowRuleError("column_has_tasks");
    }

    const destination =
      input.moveTasksTo !== undefined
        ? found(columns.find((other) => other.id === input.moveTasksTo && other.id !== column.id))
        : found(columns.find((other) => other.id !== column.id));

    // Open tasks, lane by lane, appended to the destination cell in their order.
    const lanes = new Map<string | null, typeof open>();
    for (const task of open) lanes.set(task.groupId, [...(lanes.get(task.groupId) ?? []), task]);
    for (const [groupId, tasks] of lanes) {
      const cell = await readCell(tx, userId, destination.id, groupId);
      for (const [offset, task] of tasks.entries()) {
        const effects = roleEffects({ toRole: destination.role, closedAt: task.closedAt, now });
        await tx
          .update(workflowTasks)
          .set({
            columnId: destination.id,
            sortOrder: cell.length + offset,
            firingStartedAt: effects.firingStartedAt,
            closedAt: effects.closedAt,
            updatedAt: now,
          })
          .where(and(eq(workflowTasks.id, task.id), eq(workflowTasks.userId, userId)));
      }
      // Belt and braces: the destination cell is dense whatever it held before.
      const merged = await readCell(tx, userId, destination.id, groupId);
      await rewriteOrder(
        tx,
        userId,
        merged.map((row) => row.id),
        new Map(merged.map((row) => [row.id, row.sortOrder])),
        now,
      );
    }

    // Archived tasks keep a column to come back to.
    await tx
      .update(workflowTasks)
      .set({ columnId: destination.id, updatedAt: now })
      .where(
        and(
          eq(workflowTasks.columnId, column.id),
          eq(workflowTasks.userId, userId),
          isNotNull(workflowTasks.archivedAt),
        ),
      );

    await tx
      .delete(workflowColumns)
      .where(and(eq(workflowColumns.id, column.id), eq(workflowColumns.userId, userId)));

    for (const [index, remaining] of columns.filter((other) => other.id !== column.id).entries()) {
      await tx
        .update(workflowColumns)
        .set({ sortOrder: index })
        .where(and(eq(workflowColumns.id, remaining.id), eq(workflowColumns.userId, userId)));
    }
    return readColumns(tx, userId, column.viewId);
  });
}
