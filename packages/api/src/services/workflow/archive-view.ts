import { and, eq, isNotNull } from "drizzle-orm";

import { workflowViews, type RlsClient } from "@syn/db";
import type { WorkflowViewTab } from "@syn/types";
import type { WorkflowIdInput } from "@syn/validators";

import { WorkflowRuleError, found } from "./rule-error";
import { nextViewOrder, readTabs } from "./save-view";
import { VIEW_TAB_COLUMNS, toViewTab } from "./to-view";

/**
 * *Archive this view* (UX Dialogs) — its columns and tasks are kept and come
 * back with it. The last unarchived view cannot be archived (`last_view`);
 * the tabs left behind are rewritten dense.
 */
export async function archiveWorkflowView(
  rls: RlsClient,
  userId: string,
  input: WorkflowIdInput,
  now: Date = new Date(),
): Promise<WorkflowViewTab> {
  return rls.execute(async (tx) => {
    const tabs = await readTabs(tx, userId);
    const view = found(tabs.find((tab) => tab.id === input.id));
    if (tabs.length <= 1) throw new WorkflowRuleError("last_view");

    await tx
      .update(workflowViews)
      .set({ archivedAt: now, updatedAt: now })
      .where(and(eq(workflowViews.id, view.id), eq(workflowViews.userId, userId)));

    for (const [index, tab] of tabs.filter((other) => other.id !== view.id).entries()) {
      await tx
        .update(workflowViews)
        .set({ sortOrder: index })
        .where(and(eq(workflowViews.id, tab.id), eq(workflowViews.userId, userId)));
    }
    return view;
  });
}

/** Restored to the end of the tabs (WF-05), with everything it held. */
export async function restoreWorkflowView(
  rls: RlsClient,
  userId: string,
  input: WorkflowIdInput,
  now: Date = new Date(),
): Promise<WorkflowViewTab> {
  return rls.execute(async (tx) => {
    const sortOrder = await nextViewOrder(tx, userId);
    const [row] = await tx
      .update(workflowViews)
      .set({ archivedAt: null, sortOrder, updatedAt: now })
      .where(
        and(
          eq(workflowViews.id, input.id),
          eq(workflowViews.userId, userId),
          isNotNull(workflowViews.archivedAt),
        ),
      )
      .returning(VIEW_TAB_COLUMNS);
    return toViewTab(found(row));
  });
}
