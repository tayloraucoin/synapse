import { and, asc, eq } from "drizzle-orm";

import { workflowColumns, workflowViews, type RlsClient } from "@syn/db";
import { WORKFLOW_COLUMNS_MAX } from "@syn/constants";
import type { WorkflowColumnView } from "@syn/types";
import type { WorkflowColumnSaveInput, WorkflowReorderInput } from "@syn/validators";

import { orderFromFullList, type Tx } from "./cells";
import { WorkflowRuleError, found } from "./rule-error";
import { COLUMN_COLUMNS, toColumnView } from "./to-view";

/** One view's columns, in order — what every column mutation answers with (FLO-8 re-renders from it). */
export async function readColumns(tx: Tx, userId: string, viewId: string): Promise<WorkflowColumnView[]> {
  const rows = await tx
    .select(COLUMN_COLUMNS)
    .from(workflowColumns)
    .where(and(eq(workflowColumns.viewId, viewId), eq(workflowColumns.userId, userId)))
    .orderBy(asc(workflowColumns.sortOrder), asc(workflowColumns.createdAt));
  return rows.map(toColumnView);
}

/**
 * *Add a column* at the end, or rename one (WF-04). A view holds one to five
 * columns (§13 #W4): a sixth is refused with `too_many_columns`.
 */
export async function saveWorkflowColumn(
  rls: RlsClient,
  userId: string,
  input: WorkflowColumnSaveInput,
  now: Date = new Date(),
): Promise<WorkflowColumnView[]> {
  return rls.execute(async (tx) => {
    found(
      (
        await tx
          .select({ id: workflowViews.id })
          .from(workflowViews)
          .where(and(eq(workflowViews.id, input.viewId), eq(workflowViews.userId, userId)))
          .limit(1)
      )[0],
    );

    if (input.id !== undefined) {
      const rows = await tx
        .update(workflowColumns)
        .set({ name: input.name, updatedAt: now })
        .where(
          and(
            eq(workflowColumns.id, input.id),
            eq(workflowColumns.viewId, input.viewId),
            eq(workflowColumns.userId, userId),
          ),
        )
        .returning({ id: workflowColumns.id });
      found(rows[0]);
      return readColumns(tx, userId, input.viewId);
    }

    const existing = await readColumns(tx, userId, input.viewId);
    if (existing.length >= WORKFLOW_COLUMNS_MAX) throw new WorkflowRuleError("too_many_columns");
    await tx.insert(workflowColumns).values({
      userId,
      viewId: input.viewId,
      name: input.name,
      role: null,
      sortOrder: existing.length,
    });
    return readColumns(tx, userId, input.viewId);
  });
}

/** One view's columns from the full id list; the view is the first id's. */
export async function reorderWorkflowColumns(
  rls: RlsClient,
  userId: string,
  input: WorkflowReorderInput,
  now: Date = new Date(),
): Promise<WorkflowColumnView[]> {
  return rls.execute(async (tx) => {
    const first = found(
      (
        await tx
          .select({ viewId: workflowColumns.viewId })
          .from(workflowColumns)
          .where(and(eq(workflowColumns.id, input.ids[0] ?? ""), eq(workflowColumns.userId, userId)))
          .limit(1)
      )[0],
    );
    const columns = await readColumns(tx, userId, first.viewId);
    const ordered = orderFromFullList(
      columns.map((column) => column.id),
      input.ids,
      () => {
        throw new WorkflowRuleError("incomplete_reorder");
      },
    );
    for (const [index, id] of ordered.entries()) {
      await tx
        .update(workflowColumns)
        .set({ sortOrder: index, updatedAt: now })
        .where(and(eq(workflowColumns.id, id), eq(workflowColumns.userId, userId)));
    }
    return readColumns(tx, userId, first.viewId);
  });
}
