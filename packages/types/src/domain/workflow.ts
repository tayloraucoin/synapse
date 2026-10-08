/**
 * Workflow — the board of lanes (groups) by columns (states). Workflow UX spec
 * v0.1 §3, §11; Epic 7 TD-34, TD-38, TD-40.
 *
 * In `@syn/types` from day one because `@syn/ui`'s `TaskRow`, `LaneHeader` and
 * `Board` take them (placement rule 5).
 *
 * THREE FACTS ARE DELIBERATELY ABSENT. No view model carries an order number:
 * order is array order, and inside a `(groupId, columnId)` cell the array's
 * order is the cell's (the client reorders the array to move a task; the
 * server rewrites the stored order, TD-35). None carries *next*: it is
 * computed by `resolveNext` in `@syn/utils` on every render (W8, TD-38). And
 * none carries a firing flag: firing is `firingStartedAt !== null` (UX §11 —
 * one fact, not two that can disagree).
 */

import type { CategoryKey } from "./domain";

/** `workflow_columns.role` — W11. At most one of each per view, held by the database. */
export type WorkflowColumnRole = "active" | "done";

/** One column of a template — the built-in ones in `@syn/constants`, a saved one's jsonb snapshot. */
export type WorkflowTemplateColumn = { name: string; role: WorkflowColumnRole | null };

/** A view as its tab names it. */
export type WorkflowViewTab = { id: string; name: string };

export type WorkflowColumnView = {
  id: string;
  name: string;
  role: WorkflowColumnRole | null;
};

/** A lane. The hue is one of the eight category hues (UX §3.5) — no second hue list. */
export type WorkflowGroupView = {
  id: string;
  name: string;
  hue: CategoryKey;
  collapsed: boolean;
};

export type WorkflowTaskView = {
  id: string;
  title: string;
  note: string | null;
  /** `null` is the lane *No group*, always last (UX §3.2). */
  groupId: string | null;
  columnId: string;
  firingStartedAt: Date | null;
  lastReturnedAt: Date | null;
  closedAt: Date | null;
};

/** One board read (TD-39). */
export type WorkflowBoardView = {
  view: WorkflowViewTab;
  /** In order. */
  columns: WorkflowColumnView[];
  /** Usual order, unarchived. */
  groups: WorkflowGroupView[];
  /** Today's *first today* pins, newest first. */
  pinnedGroupIds: string[];
  /** In cell order; a cell is a filter of this array. */
  tasks: WorkflowTaskView[];
  /** The person's day the pins belong to (`YYYY-MM-DD`). */
  dayKey: string;
};

export type WorkflowTemplateView = {
  id: string;
  name: string;
  builtIn: boolean;
  columns: WorkflowTemplateColumn[];
};

/**
 * Which task is next — the Next strip's three states (UX §3.4). `none` is a
 * view with no active column, or an active column with no task in it.
 */
export type WorkflowNext =
  | { kind: "task"; taskId: string }
  | { kind: "all_firing" }
  | { kind: "none" };
