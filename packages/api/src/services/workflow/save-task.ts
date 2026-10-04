import { and, eq, isNull } from "drizzle-orm";

import { workflowColumns, workflowGroups, workflowTasks, workflowViews, type RlsClient } from "@syn/db";
import type { WorkflowTaskView } from "@syn/types";
import type { WorkflowTaskCreateInput, WorkflowTaskUpdateInput } from "@syn/validators";

import { roleEffects } from "./apply-role-effects";
import { readCell, type Tx } from "./cells";
import { moveTaskInTx } from "./move-task";
import { found } from "./rule-error";
import { TASK_COLUMNS, toTaskView } from "./to-view";

/** Past any cell's length, so the clamp puts the task last. */
const END = Number.MAX_SAFE_INTEGER;

async function verifyGroup(tx: Tx, userId: string, groupId: string | null): Promise<void> {
  if (groupId === null) return;
  found(
    (
      await tx
        .select({ id: workflowGroups.id })
        .from(workflowGroups)
        .where(
          and(
            eq(workflowGroups.id, groupId),
            eq(workflowGroups.userId, userId),
            isNull(workflowGroups.archivedAt),
          ),
        )
        .limit(1)
    )[0],
  );
}

/**
 * *Add a task* (WF-01) — at the end of its cell. A task added straight into
 * the done column is closed on arrival, by the role effects like any other
 * entry; nothing is born firing.
 */
export async function createWorkflowTask(
  rls: RlsClient,
  userId: string,
  input: WorkflowTaskCreateInput,
  now: Date = new Date(),
): Promise<WorkflowTaskView> {
  return rls.execute(async (tx) => {
    const column = found(
      (
        await tx
          .select({ id: workflowColumns.id, role: workflowColumns.role })
          .from(workflowColumns)
          .innerJoin(workflowViews, eq(workflowViews.id, workflowColumns.viewId))
          .where(
            and(
              eq(workflowColumns.id, input.columnId),
              eq(workflowColumns.viewId, input.viewId),
              eq(workflowColumns.userId, userId),
              isNull(workflowViews.archivedAt),
            ),
          )
          .limit(1)
      )[0],
    );
    await verifyGroup(tx, userId, input.groupId);

    const cell = await readCell(tx, userId, column.id, input.groupId);
    const effects = roleEffects({ toRole: column.role, closedAt: null, now });

    const [row] = await tx
      .insert(workflowTasks)
      .values({
        userId,
        viewId: input.viewId,
        columnId: column.id,
        groupId: input.groupId,
        title: input.title,
        sortOrder: cell.length,
        firingStartedAt: effects.firingStartedAt,
        closedAt: effects.closedAt,
      })
      .returning(TASK_COLUMNS);
    return toTaskView(found(row));
  });
}

/**
 * The task sheet's fields (WF-02), saved as they change. A new lane is a MOVE
 * — to the end of the new lane's cell in the same column — so order has one
 * code path (TD-35). An empty note is stored as no note.
 */
export async function updateWorkflowTask(
  rls: RlsClient,
  userId: string,
  input: WorkflowTaskUpdateInput,
  now: Date = new Date(),
): Promise<WorkflowTaskView> {
  return rls.execute(async (tx) => {
    const task = found(
      (
        await tx
          .select(TASK_COLUMNS)
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

    if (input.groupId !== undefined && input.groupId !== task.groupId) {
      await moveTaskInTx(
        tx,
        userId,
        { id: task.id, toColumnId: task.columnId, toGroupId: input.groupId, toIndex: END },
        now,
      );
    }

    const patch: { title?: string; note?: string | null } = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.note !== undefined) patch.note = input.note === null || input.note.trim() === "" ? null : input.note;

    const [row] =
      Object.keys(patch).length > 0
        ? await tx
            .update(workflowTasks)
            .set({ ...patch, updatedAt: now })
            .where(and(eq(workflowTasks.id, task.id), eq(workflowTasks.userId, userId)))
            .returning(TASK_COLUMNS)
        : await tx
            .select(TASK_COLUMNS)
            .from(workflowTasks)
            .where(and(eq(workflowTasks.id, task.id), eq(workflowTasks.userId, userId)))
            .limit(1);
    return toTaskView(found(row));
  });
}
