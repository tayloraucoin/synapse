import { and, asc, eq, isNull } from "drizzle-orm";

import { workflowColumns, workflowTasks, workflowViews, type RlsClient } from "@syn/db";
import type { WorkflowTaskView, WorkflowViewTab } from "@syn/types";
import type { WorkflowIdInput } from "@syn/validators";

import { moveTaskInTx } from "./move-task";
import { WorkflowRuleError, found } from "./rule-error";
import { toTaskView, toViewTab } from "./to-view";

/** Past any cell's length, so the clamp puts the task last. */
const END = Number.MAX_SAFE_INTEGER;

/**
 * *Start* — send a queued task to work (UX §3.7, W12, §13 #W13).
 *
 * The target is the first unarchived view, in tab order, that has an active
 * column; the task goes to the end of its own lane's cell there, by the same
 * move every other path uses (so firing and closed are handled by the role
 * effects, and both cells stay dense). Returns the target view's tab so the
 * toast can say *Started in {View}*. With no such view: `no_active_view`.
 */
export async function startWorkflowTask(
  rls: RlsClient,
  userId: string,
  input: WorkflowIdInput,
  now: Date = new Date(),
): Promise<{ task: WorkflowTaskView; view: WorkflowViewTab }> {
  return rls.execute(async (tx) => {
    const task = found(
      (
        await tx
          .select({ id: workflowTasks.id, groupId: workflowTasks.groupId })
          .from(workflowTasks)
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

    const [target] = await tx
      .select({ columnId: workflowColumns.id, viewId: workflowViews.id, viewName: workflowViews.name })
      .from(workflowColumns)
      .innerJoin(workflowViews, eq(workflowViews.id, workflowColumns.viewId))
      .where(
        and(
          eq(workflowColumns.userId, userId),
          eq(workflowColumns.role, "active"),
          isNull(workflowViews.archivedAt),
        ),
      )
      .orderBy(asc(workflowViews.sortOrder), asc(workflowViews.createdAt))
      .limit(1);
    if (!target) throw new WorkflowRuleError("no_active_view");

    const moved = await moveTaskInTx(
      tx,
      userId,
      { id: task.id, toColumnId: target.columnId, toGroupId: task.groupId, toIndex: END },
      now,
    );
    return { task: toTaskView(moved), view: toViewTab({ id: target.viewId, name: target.viewName }) };
  });
}
