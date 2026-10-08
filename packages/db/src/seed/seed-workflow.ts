/**
 * A Workflow board for the smoke account — Epic 7 FLO-3.
 *
 * So every later ticket has a board to look at before a screen can create
 * one: the two starter views (as `ensureWorkflowDefaults` makes them), three
 * groups, nine tasks over *Working*'s cells — two firing, one back with a note,
 * one closed today, one closed last week — and two in *Queue*.
 *
 * EVERY NAME HERE IS INVENTED. A group is usually a client; none of these is a
 * real client's, company's or person's name, and none ever should be.
 *
 * Idempotent by "any Workflow view exists → do nothing".
 */
import { eq } from "drizzle-orm";

import { WORKFLOW_STARTERS } from "@syn/constants";

import { workflowColumns, workflowGroups, workflowTasks, workflowViews } from "../schema";
import type { Db } from "../client";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

type TaskSeed = {
  view: "working" | "queue";
  column: string;
  group: "Northwind" | "Harbor" | "Internal" | null;
  title: string;
  note?: string;
  firingMinutesAgo?: number;
  returnedMinutesAgo?: number;
  closedDaysAgo?: number;
};

const GROUPS = [
  { name: "Northwind", hue: "leaf" },
  { name: "Harbor", hue: "sky" },
  { name: "Internal", hue: "clay" },
] as const;

/** In cell order: tasks sharing a view, column and group are listed in their order. */
const TASKS: readonly TaskSeed[] = [
  { view: "working", column: "In progress", group: "Northwind", title: "Draft the onboarding email", firingMinutesAgo: 6 },
  {
    view: "working",
    column: "In progress",
    group: "Northwind",
    title: "Review the pricing page copy",
    note: "Asked for a shorter opening line. Check the second paragraph.",
    returnedMinutesAgo: 2,
  },
  { view: "working", column: "In progress", group: "Harbor", title: "Refactor the invoice export", firingMinutesAgo: 25 },
  { view: "working", column: "In progress", group: "Internal", title: "Write the release notes" },
  { view: "working", column: "In progress", group: null, title: "Read the API changelog" },
  { view: "working", column: "Ongoing", group: "Harbor", title: "Weekly sync notes" },
  { view: "working", column: "Finish later", group: "Northwind", title: "Tidy the asset folder" },
  { view: "working", column: "Done", group: "Internal", title: "Fix the link checker", closedDaysAgo: 0 },
  { view: "working", column: "Done", group: "Harbor", title: "Move the staging config", closedDaysAgo: 7 },
  { view: "queue", column: "Up next", group: "Northwind", title: "Plan the autumn landing page" },
  { view: "queue", column: "Later", group: null, title: "Look into a faster test runner" },
];

export async function seedWorkflow(
  db: Db,
  userId: string,
): Promise<{ views: number; groups: number; tasks: number }> {
  const existing = await db
    .select({ id: workflowViews.id })
    .from(workflowViews)
    .where(eq(workflowViews.userId, userId))
    .limit(1);
  if (existing.length > 0) return { views: 0, groups: 0, tasks: 0 };

  const now = Date.now();

  // view key → { viewId, column name → column id }
  const views = new Map<string, { viewId: string; columns: Map<string, string> }>();
  for (const [viewIndex, starter] of WORKFLOW_STARTERS.entries()) {
    const [view] = await db
      .insert(workflowViews)
      .values({ userId, name: starter.name, sortOrder: viewIndex })
      .returning({ id: workflowViews.id });
    if (!view) continue;
    const columns = await db
      .insert(workflowColumns)
      .values(
        starter.columns.map((column, index) => ({
          userId,
          viewId: view.id,
          name: column.name,
          role: column.role,
          sortOrder: index,
        })),
      )
      .returning({ id: workflowColumns.id, name: workflowColumns.name });
    views.set(starter.key, { viewId: view.id, columns: new Map(columns.map((c) => [c.name, c.id])) });
  }

  const groups = new Map<string, string>();
  for (const [index, group] of GROUPS.entries()) {
    const [row] = await db
      .insert(workflowGroups)
      .values({ userId, name: group.name, hue: group.hue, sortOrder: index })
      .returning({ id: workflowGroups.id });
    if (row) groups.set(group.name, row.id);
  }

  const cellLength = new Map<string, number>();
  let tasks = 0;
  for (const task of TASKS) {
    const view = views.get(task.view);
    const columnId = view?.columns.get(task.column);
    if (!view || !columnId) continue;
    const groupId = task.group === null ? null : (groups.get(task.group) ?? null);
    const cell = `${columnId}:${groupId ?? "none"}`;
    const sortOrder = cellLength.get(cell) ?? 0;
    cellLength.set(cell, sortOrder + 1);

    await db.insert(workflowTasks).values({
      userId,
      viewId: view.viewId,
      columnId,
      groupId,
      title: task.title,
      note: task.note ?? null,
      sortOrder,
      firingStartedAt: task.firingMinutesAgo === undefined ? null : new Date(now - task.firingMinutesAgo * MINUTE),
      lastReturnedAt: task.returnedMinutesAgo === undefined ? null : new Date(now - task.returnedMinutesAgo * MINUTE),
      closedAt: task.closedDaysAgo === undefined ? null : new Date(now - task.closedDaysAgo * DAY),
    });
    tasks += 1;
  }

  return { views: views.size, groups: groups.size, tasks };
}
