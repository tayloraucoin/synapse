import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";

import { workflowColumns, workflowGroups, workflowTasks, workflowViews, type RlsClient } from "@syn/db";
import type { WorkflowTaskView } from "@syn/types";
import type { WorkflowIdInput, WorkflowTaskRestoreInput } from "@syn/validators";

import { roleEffects } from "./apply-role-effects";
import { clampIndex, insertAt, readCell, rewriteOrder } from "./cells";
import { found } from "./rule-error";
import { TASK_COLUMNS, toTaskView } from "./to-view";

/**
 * *Archive* — take off the board, keep (W18, UX §1.4). The gap in its cell
 * closes and firing ends: an archived task is in no column's active state.
 * The row keeps its column, lane and view so *Restore* has somewhere to go.
 */
export async function archiveWorkflowTask(
  rls: RlsClient,
  userId: string,
  input: WorkflowIdInput,
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

    const [row] = await tx
      .update(workflowTasks)
      .set({ archivedAt: now, firingStartedAt: null, updatedAt: now })
      .where(and(eq(workflowTasks.id, task.id), eq(workflowTasks.userId, userId)))
      .returning(TASK_COLUMNS);

    const rest = await readCell(tx, userId, task.columnId, task.groupId);
    await rewriteOrder(
      tx,
      userId,
      rest.map((cellRow) => cellRow.id),
      new Map(rest.map((cellRow) => [cellRow.id, cellRow.sortOrder])),
      now,
    );
    return toTaskView(found(row));
  });
}

/**
 * *Restore* (WF-05) — to the end of its cell, or to `toIndex` when it is the
 * undo of *Archive*, with `restoreFiringStartedAt` applied in an active
 * column. If its view is archived it goes to the first unarchived view's first
 * column; if its lane was archived since, to *No group*. The role effects run
 * as on any arrival, so a task restored into the done column is closed.
 */
export async function restoreWorkflowTask(
  rls: RlsClient,
  userId: string,
  input: WorkflowTaskRestoreInput,
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
              isNotNull(workflowTasks.archivedAt),
            ),
          )
          .limit(1)
      )[0],
    );

    const [home] = await tx
      .select({ id: workflowColumns.id, viewId: workflowColumns.viewId, role: workflowColumns.role })
      .from(workflowColumns)
      .innerJoin(workflowViews, eq(workflowViews.id, workflowColumns.viewId))
      .where(
        and(
          eq(workflowColumns.id, task.columnId),
          eq(workflowColumns.userId, userId),
          isNull(workflowViews.archivedAt),
        ),
      )
      .limit(1);

    const column =
      home ??
      found(
        (
          await tx
            .select({ id: workflowColumns.id, viewId: workflowColumns.viewId, role: workflowColumns.role })
            .from(workflowColumns)
            .innerJoin(workflowViews, eq(workflowViews.id, workflowColumns.viewId))
            .where(and(eq(workflowColumns.userId, userId), isNull(workflowViews.archivedAt)))
            .orderBy(
              asc(workflowViews.sortOrder),
              asc(workflowViews.createdAt),
              asc(workflowColumns.sortOrder),
            )
            .limit(1)
        )[0],
      );

    let groupId = task.groupId;
    if (groupId !== null) {
      const [group] = await tx
        .select({ id: workflowGroups.id })
        .from(workflowGroups)
        .where(
          and(
            eq(workflowGroups.id, groupId),
            eq(workflowGroups.userId, userId),
            isNull(workflowGroups.archivedAt),
          ),
        )
        .limit(1);
      if (!group) groupId = null;
    }

    const cell = await readCell(tx, userId, column.id, groupId);
    const index = clampIndex(input.toIndex ?? cell.length, cell.length);
    const next = insertAt(
      cell.map((row) => row.id),
      task.id,
      index,
    );
    const effects = roleEffects({
      toRole: column.role,
      closedAt: task.closedAt,
      now,
      restoreFiringStartedAt: input.restoreFiringStartedAt,
    });

    const [row] = await tx
      .update(workflowTasks)
      .set({
        archivedAt: null,
        columnId: column.id,
        viewId: column.viewId,
        groupId,
        sortOrder: index,
        firingStartedAt: effects.firingStartedAt,
        closedAt: effects.closedAt,
        updatedAt: now,
      })
      .where(and(eq(workflowTasks.id, task.id), eq(workflowTasks.userId, userId)))
      .returning(TASK_COLUMNS);

    await rewriteOrder(
      tx,
      userId,
      next,
      new Map([...cell.map((cellRow): [string, number] => [cellRow.id, cellRow.sortOrder]), [task.id, index]]),
      now,
    );
    return toTaskView(found(row));
  });
}
