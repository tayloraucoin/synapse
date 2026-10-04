import { and, asc, eq, isNull } from "drizzle-orm";

import { workflowGroups, type RlsClient } from "@syn/db";
import type { WorkflowGroupView } from "@syn/types";
import type { WorkflowReorderInput } from "@syn/validators";

import { orderFromFullList, type Tx } from "./cells";
import { WorkflowRuleError } from "./rule-error";
import { GROUP_COLUMNS, toGroupView } from "./to-view";

/** Every unarchived group, in usual order. */
export async function readGroups(tx: Tx, userId: string): Promise<WorkflowGroupView[]> {
  const rows = await tx
    .select(GROUP_COLUMNS)
    .from(workflowGroups)
    .where(and(eq(workflowGroups.userId, userId), isNull(workflowGroups.archivedAt)))
    .orderBy(asc(workflowGroups.sortOrder), asc(workflowGroups.createdAt));
  return rows.map(toGroupView);
}

/** Write 0…n−1 over the given group ids. */
export async function writeGroupOrder(
  tx: Tx,
  userId: string,
  ids: readonly string[],
  now: Date,
): Promise<void> {
  for (const [index, id] of ids.entries()) {
    await tx
      .update(workflowGroups)
      .set({ sortOrder: index, updatedAt: now })
      .where(and(eq(workflowGroups.id, id), eq(workflowGroups.userId, userId)));
  }
}

/**
 * The usual order (UX §3.5) from the full id list — *Move up* / *Move down*
 * and the lane drag both send it. *First today* is not this: pins are a day's
 * and live in `workflow_day_pins`.
 */
export async function reorderWorkflowGroups(
  rls: RlsClient,
  userId: string,
  input: WorkflowReorderInput,
  now: Date = new Date(),
): Promise<WorkflowGroupView[]> {
  return rls.execute(async (tx) => {
    const groups = await readGroups(tx, userId);
    const ordered = orderFromFullList(
      groups.map((group) => group.id),
      input.ids,
      () => {
        throw new WorkflowRuleError("incomplete_reorder");
      },
    );
    await writeGroupOrder(tx, userId, ordered, now);
    return readGroups(tx, userId);
  });
}
