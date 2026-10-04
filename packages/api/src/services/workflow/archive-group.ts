import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";

import { workflowGroups, workflowTasks, type RlsClient } from "@syn/db";
import type { WorkflowGroupView } from "@syn/types";
import type { WorkflowIdInput } from "@syn/validators";

import { readCell, rewriteOrder } from "./cells";
import { readGroups, writeGroupOrder } from "./reorder-groups";
import { found } from "./rule-error";
import { nextGroupOrder } from "./save-group";
import { GROUP_COLUMNS, toGroupView } from "./to-view";

/**
 * *Archive group* (UX Dialogs: *Its tasks move to No group.*).
 *
 * In one transaction: each column's open tasks in the lane are appended to
 * that column's *No group* cell, keeping their relative order; the lane's
 * archived tasks lose the lane too, so a later *Restore* lands in *No group*
 * rather than in a lane nobody can see; the group is archived and the usual
 * order closes up. Nothing about firing changes — a task that keeps its
 * column keeps its state.
 */
export async function archiveWorkflowGroup(
  rls: RlsClient,
  userId: string,
  input: WorkflowIdInput,
  now: Date = new Date(),
): Promise<WorkflowGroupView> {
  return rls.execute(async (tx) => {
    const group = found(
      (
        await tx
          .select(GROUP_COLUMNS)
          .from(workflowGroups)
          .where(
            and(
              eq(workflowGroups.id, input.id),
              eq(workflowGroups.userId, userId),
              isNull(workflowGroups.archivedAt),
            ),
          )
          .limit(1)
      )[0],
    );

    const tasks = await tx
      .select({ id: workflowTasks.id, columnId: workflowTasks.columnId })
      .from(workflowTasks)
      .where(
        and(
          eq(workflowTasks.groupId, group.id),
          eq(workflowTasks.userId, userId),
          isNull(workflowTasks.archivedAt),
        ),
      )
      .orderBy(asc(workflowTasks.sortOrder), asc(workflowTasks.createdAt), asc(workflowTasks.id));

    const byColumn = new Map<string, string[]>();
    for (const task of tasks) byColumn.set(task.columnId, [...(byColumn.get(task.columnId) ?? []), task.id]);

    for (const [columnId, ids] of byColumn) {
      const noGroup = await readCell(tx, userId, columnId, null);
      for (const [offset, id] of ids.entries()) {
        await tx
          .update(workflowTasks)
          .set({ groupId: null, sortOrder: noGroup.length + offset, updatedAt: now })
          .where(and(eq(workflowTasks.id, id), eq(workflowTasks.userId, userId)));
      }
      const merged = await readCell(tx, userId, columnId, null);
      await rewriteOrder(
        tx,
        userId,
        merged.map((row) => row.id),
        new Map(merged.map((row) => [row.id, row.sortOrder])),
        now,
      );
    }

    await tx
      .update(workflowTasks)
      .set({ groupId: null, updatedAt: now })
      .where(
        and(
          eq(workflowTasks.groupId, group.id),
          eq(workflowTasks.userId, userId),
          isNotNull(workflowTasks.archivedAt),
        ),
      );

    await tx
      .update(workflowGroups)
      .set({ archivedAt: now, updatedAt: now })
      .where(and(eq(workflowGroups.id, group.id), eq(workflowGroups.userId, userId)));

    const rest = await readGroups(tx, userId);
    await writeGroupOrder(
      tx,
      userId,
      rest.map((other) => other.id),
      now,
    );
    return toGroupView(group);
  });
}

/** A restored group returns empty, at the end of the usual order (WF-05). */
export async function restoreWorkflowGroup(
  rls: RlsClient,
  userId: string,
  input: WorkflowIdInput,
  now: Date = new Date(),
): Promise<WorkflowGroupView> {
  return rls.execute(async (tx) => {
    const sortOrder = await nextGroupOrder(tx, userId);
    const [row] = await tx
      .update(workflowGroups)
      .set({ archivedAt: null, sortOrder, updatedAt: now })
      .where(
        and(
          eq(workflowGroups.id, input.id),
          eq(workflowGroups.userId, userId),
          isNotNull(workflowGroups.archivedAt),
        ),
      )
      .returning(GROUP_COLUMNS);
    return toGroupView(found(row));
  });
}
