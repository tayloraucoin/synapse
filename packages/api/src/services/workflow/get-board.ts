import { and, asc, eq, gte, isNull, or } from "drizzle-orm";

import {
  workflowColumns,
  workflowDayPins,
  workflowGroups,
  workflowTasks,
  workflowViews,
  type RlsClient,
} from "@syn/db";
import type { WorkflowBoardView } from "@syn/types";
import type { WorkflowBoardInput } from "@syn/validators";

import { readWorkflowDay } from "./day-context";
import { ensureWorkflowDefaults } from "./ensure-defaults";
import { found } from "./rule-error";
import {
  COLUMN_COLUMNS,
  GROUP_COLUMNS,
  TASK_COLUMNS,
  toColumnView,
  toGroupView,
  toTaskView,
  toViewTab,
} from "./to-view";

/**
 * The whole board for one view — TD-39, UX WF-01.
 *
 * - **Columns** in order; **groups**, every unarchived one, in usual order —
 *   all groups appear on every view (§13 #W3). Today's lane order is NOT
 *   computed here: the client runs `orderGroupsForDay` over `pinnedGroupIds`.
 * - **Pins** are the row for today's day key, or none (TD-37). A new day has a
 *   new key, so yesterday's pins are simply not read.
 * - **Tasks** are the view's unarchived ones that are open or were closed
 *   inside today's window; anything closed earlier is `listClosed`'s (§3.8).
 *   Array order inside a `(groupId, columnId)` pair is `sort_order` (FLO-1).
 * - ***Next* is not here.** The client computes it with `resolveNext` (W8).
 *
 * An archived or unknown view — or another person's — is not found; the page
 * redirects to the first view (assessment §5).
 */
export async function getBoard(
  rls: RlsClient,
  userId: string,
  input: WorkflowBoardInput,
  now: Date = new Date(),
): Promise<WorkflowBoardView> {
  return rls.execute(async (tx) => {
    await ensureWorkflowDefaults(tx, userId);

    const view = found(
      (
        await tx
          .select({ id: workflowViews.id, name: workflowViews.name })
          .from(workflowViews)
          .where(
            and(
              eq(workflowViews.id, input.viewId),
              eq(workflowViews.userId, userId),
              isNull(workflowViews.archivedAt),
            ),
          )
          .limit(1)
      )[0],
    );

    const day = await readWorkflowDay(tx, userId, now);

    const [columns, groups, pins, tasks] = await Promise.all([
      tx
        .select(COLUMN_COLUMNS)
        .from(workflowColumns)
        .where(and(eq(workflowColumns.viewId, view.id), eq(workflowColumns.userId, userId)))
        .orderBy(asc(workflowColumns.sortOrder), asc(workflowColumns.createdAt)),
      tx
        .select(GROUP_COLUMNS)
        .from(workflowGroups)
        .where(and(eq(workflowGroups.userId, userId), isNull(workflowGroups.archivedAt)))
        .orderBy(asc(workflowGroups.sortOrder), asc(workflowGroups.createdAt)),
      tx
        .select({ groupIds: workflowDayPins.groupIds })
        .from(workflowDayPins)
        .where(and(eq(workflowDayPins.userId, userId), eq(workflowDayPins.dayKey, day.dayKey)))
        .limit(1),
      tx
        .select(TASK_COLUMNS)
        .from(workflowTasks)
        .where(
          and(
            eq(workflowTasks.viewId, view.id),
            eq(workflowTasks.userId, userId),
            isNull(workflowTasks.archivedAt),
            or(isNull(workflowTasks.closedAt), gte(workflowTasks.closedAt, day.start)),
          ),
        )
        .orderBy(asc(workflowTasks.sortOrder), asc(workflowTasks.createdAt), asc(workflowTasks.id)),
    ]);

    return {
      view: toViewTab(view),
      columns: columns.map(toColumnView),
      groups: groups.map(toGroupView),
      pinnedGroupIds: pins[0]?.groupIds ?? [],
      tasks: tasks.map(toTaskView),
      dayKey: day.dayKey,
    };
  });
}
