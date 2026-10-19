import { and, desc, eq, isNull, lt, or } from "drizzle-orm";

import { workflowTasks, workflowViews, type RlsClient } from "@syn/db";
import type { WorkflowTaskView } from "@syn/types";
import type { WorkflowListClosedInput } from "@syn/validators";

import { readWorkflowDay } from "./day-context";
import { found } from "./rule-error";
import { TASK_COLUMNS, toTaskView } from "./to-view";

const PAGE = 50;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The cursor is the last row's `closed_at` and id — a keyset, so a task closed
 * while the section is open cannot shift a page. Opaque to the client.
 */
function encodeCursor(closedAt: Date, id: string): string {
  return `${closedAt.toISOString()}|${id}`;
}

function decodeCursor(cursor: string | undefined): { closedAt: Date; id: string } | null {
  if (cursor === undefined) return null;
  const [at, id] = cursor.split("|");
  const closedAt = new Date(at ?? "");
  if (id === undefined || !UUID.test(id) || Number.isNaN(closedAt.getTime())) return null;
  return { closedAt, id };
}

/**
 * *Closed earlier* (UX §3.8, TD-39) — a view's tasks closed before today's
 * window, newest first, a page at a time. The second, lazy read: the board
 * stays bounded by what is open. Nothing here is counted.
 */
export async function listClosedWorkflowTasks(
  rls: RlsClient,
  userId: string,
  input: WorkflowListClosedInput,
  now: Date = new Date(),
): Promise<{ tasks: WorkflowTaskView[]; nextCursor: string | null }> {
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
    const day = await readWorkflowDay(tx, userId, now);
    const after = decodeCursor(input.cursor);

    const rows = await tx
      .select(TASK_COLUMNS)
      .from(workflowTasks)
      .where(
        and(
          eq(workflowTasks.viewId, input.viewId),
          eq(workflowTasks.userId, userId),
          isNull(workflowTasks.archivedAt),
          lt(workflowTasks.closedAt, day.start),
          after === null
            ? undefined
            : or(
                lt(workflowTasks.closedAt, after.closedAt),
                and(eq(workflowTasks.closedAt, after.closedAt), lt(workflowTasks.id, after.id)),
              ),
        ),
      )
      .orderBy(desc(workflowTasks.closedAt), desc(workflowTasks.id))
      .limit(PAGE + 1);

    const page = rows.slice(0, PAGE);
    const last = page.at(-1);
    return {
      tasks: page.map(toTaskView),
      nextCursor:
        rows.length > PAGE && last?.closedAt ? encodeCursor(last.closedAt, last.id) : null,
    };
  });
}
