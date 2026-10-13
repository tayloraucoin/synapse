import { and, eq, isNull } from "drizzle-orm";

import { workflowColumns, workflowGroups, workflowTasks, workflowViews, type RlsClient } from "@syn/db";
import type { WorkflowTaskView } from "@syn/types";
import type { WorkflowTaskMoveInput } from "@syn/validators";

import { roleEffects } from "./apply-role-effects";
import { clampIndex, insertAt, readCell, rewriteOrder, type Tx } from "./cells";
import { found } from "./rule-error";
import { TASK_COLUMNS, toTaskView, type TaskRow } from "./to-view";

/**
 * One move, whatever it changes — Epic 7 TD-35, UX §3.3, §3.7, W12.
 *
 * In ONE transaction: verify the destination column (and its view, unarchived)
 * and lane are the caller's; take the task out of its cell and close the gap;
 * put it into the destination cell at `toIndex`, clamped; write its column,
 * view and lane; and, when the column changed, apply the role effects — the
 * one function that ends firing and sets or clears `closed_at`. Both cells are
 * dense (0…n−1) when the transaction commits.
 *
 * THE SAME MOVE TWICE WRITES NOTHING THE SECOND TIME: the task is already in
 * the destination cell at the clamped index, the list comes out unchanged,
 * and `rewriteOrder` touches no row whose order did not change.
 *
 * UNDO IS THIS CALL WITH THE PRIOR PLACE. `restoreFiringStartedAt` carries the
 * firing the task had before the move being undone; it is applied only when
 * the column changes and the destination is the active one.
 *
 * Another person's task, column or lane — or an archived one — is not found.
 */
export async function moveTaskInTx(
  tx: Tx,
  userId: string,
  input: WorkflowTaskMoveInput,
  now: Date,
): Promise<TaskRow> {
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

  const destination = found(
    (
      await tx
        .select({ id: workflowColumns.id, viewId: workflowColumns.viewId, role: workflowColumns.role })
        .from(workflowColumns)
        .innerJoin(workflowViews, eq(workflowViews.id, workflowColumns.viewId))
        .where(
          and(
            eq(workflowColumns.id, input.toColumnId),
            eq(workflowColumns.userId, userId),
            isNull(workflowViews.archivedAt),
          ),
        )
        .limit(1)
    )[0],
  );

  if (input.toGroupId !== null) {
    found(
      (
        await tx
          .select({ id: workflowGroups.id })
          .from(workflowGroups)
          .where(
            and(
              eq(workflowGroups.id, input.toGroupId),
              eq(workflowGroups.userId, userId),
              isNull(workflowGroups.archivedAt),
            ),
          )
          .limit(1)
      )[0],
    );
  }

  const sameCell = task.columnId === destination.id && task.groupId === input.toGroupId;

  if (sameCell) {
    // Path 1 — a reorder inside the cell. No role effect: the column did not change.
    const cell = await readCell(tx, userId, destination.id, input.toGroupId);
    const ids = cell.map((row) => row.id);
    const next = insertAt(ids, task.id, input.toIndex);
    if (next.every((id, index) => ids[index] === id)) return task;
    await rewriteOrder(tx, userId, next, new Map(cell.map((row) => [row.id, row.sortOrder])), now);
    return { ...task, sortOrder: next.indexOf(task.id) };
  }

  // Close the gap in the source cell.
  const source = (await readCell(tx, userId, task.columnId, task.groupId)).filter(
    (row) => row.id !== task.id,
  );
  await rewriteOrder(
    tx,
    userId,
    source.map((row) => row.id),
    new Map(source.map((row) => [row.id, row.sortOrder])),
    now,
  );

  // Open one in the destination.
  const target = await readCell(tx, userId, destination.id, input.toGroupId);
  const index = clampIndex(input.toIndex, target.length);
  const next = insertAt(
    target.map((row) => row.id),
    task.id,
    index,
  );

  const columnChanged = task.columnId !== destination.id;
  const effects = columnChanged
    ? roleEffects({
        toRole: destination.role,
        closedAt: task.closedAt,
        now,
        restoreFiringStartedAt: input.restoreFiringStartedAt,
      })
    : { firingStartedAt: task.firingStartedAt, closedAt: task.closedAt };

  const [moved] = await tx
    .update(workflowTasks)
    .set({
      columnId: destination.id,
      viewId: destination.viewId,
      groupId: input.toGroupId,
      sortOrder: index,
      firingStartedAt: effects.firingStartedAt,
      closedAt: effects.closedAt,
      updatedAt: now,
    })
    .where(and(eq(workflowTasks.id, task.id), eq(workflowTasks.userId, userId)))
    .returning(TASK_COLUMNS);

  // The task's own order is already written; the rest of the destination shifts.
  await rewriteOrder(
    tx,
    userId,
    next,
    new Map([...target.map((row): [string, number] => [row.id, row.sortOrder]), [task.id, index]]),
    now,
  );

  return found(moved);
}

export async function moveWorkflowTask(
  rls: RlsClient,
  userId: string,
  input: WorkflowTaskMoveInput,
  now: Date = new Date(),
): Promise<WorkflowTaskView> {
  return toTaskView(await rls.execute((tx) => moveTaskInTx(tx, userId, input, now)));
}
