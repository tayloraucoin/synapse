import { and, asc, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";

import { workflowColumns, workflowViews, type RlsClient } from "@syn/db";
import type { WorkflowColumnView, WorkflowViewTab } from "@syn/types";

import { ensureWorkflowDefaults } from "./ensure-defaults";
import { COLUMN_COLUMNS, toColumnView, toViewTab } from "./to-view";

export type WorkflowViewList = {
  /** The view tabs, in tab order. */
  tabs: WorkflowViewTab[];
  /** For *Archived views* at the foot of *New view* (WF-05), newest first. */
  archived: (WorkflowViewTab & { archivedAt: Date })[];
  /** The view `/workflow` opens: the last one opened, else the first (UX §3.6). */
  lastOpenedId: string | null;
  /** Each unarchived view's columns, in order — *Move to view*'s second level (FLO-7). */
  columnsByView: Record<string, WorkflowColumnView[]>;
};

/**
 * The view tabs — the first Workflow read a fresh account makes (`/workflow`
 * has no view id yet), so it ensures the two starter views (TD-41).
 */
export async function listViews(rls: RlsClient, userId: string): Promise<WorkflowViewList> {
  return rls.execute(async (tx) => {
    await ensureWorkflowDefaults(tx, userId);

    const [active, archived] = await Promise.all([
      tx
        .select({
          id: workflowViews.id,
          name: workflowViews.name,
          lastOpenedAt: workflowViews.lastOpenedAt,
        })
        .from(workflowViews)
        .where(and(eq(workflowViews.userId, userId), isNull(workflowViews.archivedAt)))
        .orderBy(asc(workflowViews.sortOrder), asc(workflowViews.createdAt)),
      tx
        .select({ id: workflowViews.id, name: workflowViews.name, archivedAt: workflowViews.archivedAt })
        .from(workflowViews)
        .where(and(eq(workflowViews.userId, userId), isNotNull(workflowViews.archivedAt)))
        .orderBy(desc(workflowViews.archivedAt)),
    ]);

    const columns =
      active.length === 0
        ? []
        : await tx
            .select({ ...COLUMN_COLUMNS })
            .from(workflowColumns)
            .where(
              and(
                eq(workflowColumns.userId, userId),
                inArray(
                  workflowColumns.viewId,
                  active.map((view) => view.id),
                ),
              ),
            )
            .orderBy(asc(workflowColumns.sortOrder), asc(workflowColumns.createdAt));
    const columnsByView: Record<string, WorkflowColumnView[]> = {};
    for (const column of columns) {
      (columnsByView[column.viewId] ??= []).push(toColumnView(column));
    }

    let last = active[0] ?? null;
    for (const view of active) {
      if (view.lastOpenedAt === null) continue;
      if (last?.lastOpenedAt == null || view.lastOpenedAt > last.lastOpenedAt) last = view;
    }

    return {
      tabs: active.map(toViewTab),
      archived: archived.flatMap((view) =>
        view.archivedAt === null ? [] : [{ ...toViewTab(view), archivedAt: view.archivedAt }],
      ),
      lastOpenedId: last?.id ?? null,
      columnsByView,
    };
  });
}
