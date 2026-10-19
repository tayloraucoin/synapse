import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { categoryColorKeyEnum, workflowGroups, type RlsClient } from "@syn/db";
import type { CategoryKey, WorkflowGroupView } from "@syn/types";
import type {
  WorkflowGroupCreateInput,
  WorkflowGroupRenameInput,
  WorkflowGroupSetCollapsedInput,
  WorkflowGroupSetHueInput,
} from "@syn/validators";

import type { Tx } from "./cells";
import { found } from "./rule-error";
import { GROUP_COLUMNS, toGroupView } from "./to-view";

/** The eight hues in the enum's order — the one hue vocabulary (TD-34). */
const HUES: readonly CategoryKey[] = categoryColorKeyEnum.enumValues;

/** The next lane position: after every unarchived group. */
export async function nextGroupOrder(tx: Tx, userId: string): Promise<number> {
  const [last] = await tx
    .select({ max: sql<number>`coalesce(max(${workflowGroups.sortOrder}), -1)` })
    .from(workflowGroups)
    .where(and(eq(workflowGroups.userId, userId), isNull(workflowGroups.archivedAt)));
  return Number(last?.max ?? -1) + 1;
}

/**
 * *Add a group* — at the end of the usual order, taking the hue after the one
 * the person's most recently created group took, wrapping (UX §3.5
 * `[DEFAULT]`). The person may change it; the name is always beside it.
 */
export async function createWorkflowGroup(
  rls: RlsClient,
  userId: string,
  input: WorkflowGroupCreateInput,
): Promise<WorkflowGroupView> {
  return rls.execute(async (tx) => {
    const [latest] = await tx
      .select({ hue: workflowGroups.hue })
      .from(workflowGroups)
      .where(eq(workflowGroups.userId, userId))
      .orderBy(desc(workflowGroups.createdAt))
      .limit(1);
    const hue = latest ? (HUES[(HUES.indexOf(latest.hue) + 1) % HUES.length] ?? "leaf") : (HUES[0] ?? "leaf");

    const [row] = await tx
      .insert(workflowGroups)
      .values({ userId, name: input.name, hue, sortOrder: await nextGroupOrder(tx, userId) })
      .returning(GROUP_COLUMNS);
    return toGroupView(found(row));
  });
}

async function patchGroup(
  rls: RlsClient,
  userId: string,
  id: string,
  patch: Partial<{ name: string; hue: CategoryKey; collapsed: boolean }>,
  now: Date,
): Promise<WorkflowGroupView> {
  const [row] = await rls.execute((tx) =>
    tx
      .update(workflowGroups)
      .set({ ...patch, updatedAt: now })
      .where(and(eq(workflowGroups.id, id), eq(workflowGroups.userId, userId)))
      .returning(GROUP_COLUMNS),
  );
  return toGroupView(found(row));
}

export function renameWorkflowGroup(
  rls: RlsClient,
  userId: string,
  input: WorkflowGroupRenameInput,
  now: Date = new Date(),
): Promise<WorkflowGroupView> {
  return patchGroup(rls, userId, input.id, { name: input.name }, now);
}

/** *Colour* (UX Dialogs) — one of the eight. */
export function setWorkflowGroupHue(
  rls: RlsClient,
  userId: string,
  input: WorkflowGroupSetHueInput,
  now: Date = new Date(),
): Promise<WorkflowGroupView> {
  return patchGroup(rls, userId, input.id, { hue: input.hue }, now);
}

/** Folding is remembered per group, across views (UX §3.5). */
export function setWorkflowGroupCollapsed(
  rls: RlsClient,
  userId: string,
  input: WorkflowGroupSetCollapsedInput,
  now: Date = new Date(),
): Promise<WorkflowGroupView> {
  return patchGroup(rls, userId, input.id, { collapsed: input.collapsed }, now);
}
