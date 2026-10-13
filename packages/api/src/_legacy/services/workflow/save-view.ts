import { and, asc, eq, isNull, sql } from "drizzle-orm";

import { workflowColumns, workflowTemplates, workflowViews, type RlsClient } from "@syn/db";
import { WORKFLOW_STARTERS } from "@syn/constants";
import type { WorkflowTemplateColumn, WorkflowViewTab } from "@syn/types";
import type {
  WorkflowReorderInput,
  WorkflowViewCreateInput,
  WorkflowViewRenameInput,
} from "@syn/validators";

import { orderFromFullList, type Tx } from "./cells";
import { WorkflowRuleError, found } from "./rule-error";
import { VIEW_TAB_COLUMNS, toViewTab } from "./to-view";

/** The next tab position: after every unarchived view. */
export async function nextViewOrder(tx: Tx, userId: string): Promise<number> {
  const [last] = await tx
    .select({ max: sql<number>`coalesce(max(${workflowViews.sortOrder}), -1)` })
    .from(workflowViews)
    .where(and(eq(workflowViews.userId, userId), isNull(workflowViews.archivedAt)));
  return Number(last?.max ?? -1) + 1;
}

/** The unarchived tabs, in order. */
export async function readTabs(tx: Tx, userId: string): Promise<WorkflowViewTab[]> {
  const rows = await tx
    .select(VIEW_TAB_COLUMNS)
    .from(workflowViews)
    .where(and(eq(workflowViews.userId, userId), isNull(workflowViews.archivedAt)))
    .orderBy(asc(workflowViews.sortOrder), asc(workflowViews.createdAt));
  return rows.map(toViewTab);
}

/**
 * *New view* (WF-03) — at the end of the tabs, its columns COPIED from a
 * built-in template or a saved one (W10): the view owns them from here on,
 * and nothing points back at the template.
 */
export async function createWorkflowView(
  rls: RlsClient,
  userId: string,
  input: WorkflowViewCreateInput,
): Promise<WorkflowViewTab> {
  return rls.execute(async (tx) => {
    let columns: readonly WorkflowTemplateColumn[];
    if (input.starterKey !== undefined) {
      columns = found(WORKFLOW_STARTERS.find((starter) => starter.key === input.starterKey)).columns;
    } else {
      columns = found(
        (
          await tx
            .select({ columns: workflowTemplates.columns })
            .from(workflowTemplates)
            .where(
              and(
                eq(workflowTemplates.id, input.templateId ?? ""),
                eq(workflowTemplates.userId, userId),
                isNull(workflowTemplates.archivedAt),
              ),
            )
            .limit(1)
        )[0],
      ).columns;
    }

    const [view] = await tx
      .insert(workflowViews)
      .values({ userId, name: input.name, sortOrder: await nextViewOrder(tx, userId) })
      .returning(VIEW_TAB_COLUMNS);
    const created = found(view);
    if (columns.length > 0) {
      await tx.insert(workflowColumns).values(
        columns.map((column, index) => ({
          userId,
          viewId: created.id,
          name: column.name,
          role: column.role,
          sortOrder: index,
        })),
      );
    }
    return toViewTab(created);
  });
}

export async function renameWorkflowView(
  rls: RlsClient,
  userId: string,
  input: WorkflowViewRenameInput,
  now: Date = new Date(),
): Promise<WorkflowViewTab> {
  const [row] = await rls.execute((tx) =>
    tx
      .update(workflowViews)
      .set({ name: input.name, updatedAt: now })
      .where(and(eq(workflowViews.id, input.id), eq(workflowViews.userId, userId)))
      .returning(VIEW_TAB_COLUMNS),
  );
  return toViewTab(found(row));
}

/** The tabs' order from the full id list (TD-35); an incomplete list is refused. */
export async function reorderWorkflowViews(
  rls: RlsClient,
  userId: string,
  input: WorkflowReorderInput,
  now: Date = new Date(),
): Promise<WorkflowViewTab[]> {
  return rls.execute(async (tx) => {
    const active = await readTabs(tx, userId);
    const ordered = orderFromFullList(
      active.map((view) => view.id),
      input.ids,
      () => {
        throw new WorkflowRuleError("incomplete_reorder");
      },
    );
    for (const [index, id] of ordered.entries()) {
      await tx
        .update(workflowViews)
        .set({ sortOrder: index, updatedAt: now })
        .where(and(eq(workflowViews.id, id), eq(workflowViews.userId, userId)));
    }
    return readTabs(tx, userId);
  });
}

/** Stamp the view `/workflow` returns to (UX §3.6, TD-44). */
export async function markWorkflowViewOpened(
  rls: RlsClient,
  userId: string,
  input: { id: string },
  now: Date = new Date(),
): Promise<{ opened: true }> {
  const rows = await rls.execute((tx) =>
    tx
      .update(workflowViews)
      .set({ lastOpenedAt: now })
      .where(
        and(
          eq(workflowViews.id, input.id),
          eq(workflowViews.userId, userId),
          isNull(workflowViews.archivedAt),
        ),
      )
      .returning({ id: workflowViews.id }),
  );
  found(rows[0]);
  return { opened: true };
}
