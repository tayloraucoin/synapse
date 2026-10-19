import {
  workflowColumns,
  workflowGroups,
  workflowTasks,
  workflowViews,
  type WorkflowColumn,
  type WorkflowGroup,
  type WorkflowTask,
  type WorkflowTemplate,
} from "@syn/db";
import type {
  WorkflowColumnView,
  WorkflowGroupView,
  WorkflowTaskView,
  WorkflowTemplateView,
  WorkflowViewTab,
} from "@syn/types";

/**
 * Row → view model (placement rule 5). `@syn/ui` never sees a row. No view
 * model carries an order number, a *next* or a firing flag (FLO-1): order is
 * the array's, *next* is computed by the client, firing is the timestamp.
 */

export const TASK_COLUMNS = {
  id: workflowTasks.id,
  title: workflowTasks.title,
  note: workflowTasks.note,
  groupId: workflowTasks.groupId,
  columnId: workflowTasks.columnId,
  viewId: workflowTasks.viewId,
  sortOrder: workflowTasks.sortOrder,
  firingStartedAt: workflowTasks.firingStartedAt,
  lastReturnedAt: workflowTasks.lastReturnedAt,
  closedAt: workflowTasks.closedAt,
  archivedAt: workflowTasks.archivedAt,
} as const;

export type TaskRow = Pick<
  WorkflowTask,
  | "id"
  | "title"
  | "note"
  | "groupId"
  | "columnId"
  | "viewId"
  | "sortOrder"
  | "firingStartedAt"
  | "lastReturnedAt"
  | "closedAt"
  | "archivedAt"
>;

export function toTaskView(row: TaskRow): WorkflowTaskView {
  return {
    id: row.id,
    title: row.title,
    note: row.note,
    groupId: row.groupId,
    columnId: row.columnId,
    firingStartedAt: row.firingStartedAt,
    lastReturnedAt: row.lastReturnedAt,
    closedAt: row.closedAt,
  };
}

export const COLUMN_COLUMNS = {
  id: workflowColumns.id,
  name: workflowColumns.name,
  role: workflowColumns.role,
  viewId: workflowColumns.viewId,
  sortOrder: workflowColumns.sortOrder,
} as const;

export function toColumnView(row: Pick<WorkflowColumn, "id" | "name" | "role">): WorkflowColumnView {
  return { id: row.id, name: row.name, role: row.role };
}

export const GROUP_COLUMNS = {
  id: workflowGroups.id,
  name: workflowGroups.name,
  hue: workflowGroups.hue,
  collapsed: workflowGroups.collapsed,
} as const;

export function toGroupView(
  row: Pick<WorkflowGroup, "id" | "name" | "hue" | "collapsed">,
): WorkflowGroupView {
  return { id: row.id, name: row.name, hue: row.hue, collapsed: row.collapsed };
}

export const VIEW_TAB_COLUMNS = { id: workflowViews.id, name: workflowViews.name } as const;

export function toViewTab(row: { id: string; name: string }): WorkflowViewTab {
  return { id: row.id, name: row.name };
}

export function toTemplateView(
  row: Pick<WorkflowTemplate, "id" | "name" | "columns">,
): WorkflowTemplateView {
  return {
    id: row.id,
    name: row.name,
    builtIn: false,
    columns: row.columns.map((column) => ({ name: column.name, role: column.role })),
  };
}
