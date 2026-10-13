import { and, asc, eq, isNull } from "drizzle-orm";

import { workflowColumns, workflowTemplates, workflowViews, type RlsClient } from "@syn/db";
import { WORKFLOW_STARTERS } from "@syn/constants";
import type { WorkflowTemplateView } from "@syn/types";
import type {
  WorkflowTemplateIdInput,
  WorkflowTemplateRenameInput,
  WorkflowTemplateSaveInput,
} from "@syn/validators";

import { WorkflowRuleError, found } from "./rule-error";
import { toTemplateView } from "./to-view";

/**
 * Templates (UX §3.6, W10, WF-03) — where a view's columns started.
 *
 * THE TWO BUILT-IN ONES ARE CONSTANTS, NEVER ROWS (TD-41). They are listed
 * first, with `builtIn: true` and an id `starter:<key>`; renaming or archiving
 * one is refused with `built_in_template`. `workflow_templates` holds only what
 * the person saved, as a snapshot of names and roles: nothing refers to a
 * template after a view is made from it, so editing one never changes a view.
 */

const STARTER_PREFIX = "starter:";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A built-in id is refused by name; anything else that is not a uuid names nothing. */
function savedTemplateId(id: string): string {
  if (id.startsWith(STARTER_PREFIX)) throw new WorkflowRuleError("built_in_template");
  if (!UUID.test(id)) found(null);
  return id;
}

/** The built-in two, then the saved ones in created order. */
export async function listWorkflowTemplates(
  rls: RlsClient,
  userId: string,
): Promise<WorkflowTemplateView[]> {
  const saved = await rls.execute((tx) =>
    tx
      .select({ id: workflowTemplates.id, name: workflowTemplates.name, columns: workflowTemplates.columns })
      .from(workflowTemplates)
      .where(and(eq(workflowTemplates.userId, userId), isNull(workflowTemplates.archivedAt)))
      .orderBy(asc(workflowTemplates.createdAt)),
  );
  const builtIn: WorkflowTemplateView[] = WORKFLOW_STARTERS.map((starter) => ({
    id: `${STARTER_PREFIX}${starter.key}`,
    name: starter.name,
    builtIn: true,
    columns: starter.columns.map((column) => ({ name: column.name, role: column.role })),
  }));
  return [...builtIn, ...saved.map(toTemplateView)];
}

/** *Save as a template* — the view's current column names and roles, in order. */
export async function saveWorkflowTemplate(
  rls: RlsClient,
  userId: string,
  input: WorkflowTemplateSaveInput,
): Promise<WorkflowTemplateView> {
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
    const columns = await tx
      .select({ name: workflowColumns.name, role: workflowColumns.role })
      .from(workflowColumns)
      .where(and(eq(workflowColumns.viewId, input.viewId), eq(workflowColumns.userId, userId)))
      .orderBy(asc(workflowColumns.sortOrder), asc(workflowColumns.createdAt));

    const [row] = await tx
      .insert(workflowTemplates)
      .values({ userId, name: input.name, columns })
      .returning({ id: workflowTemplates.id, name: workflowTemplates.name, columns: workflowTemplates.columns });
    return toTemplateView(found(row));
  });
}

export async function renameWorkflowTemplate(
  rls: RlsClient,
  userId: string,
  input: WorkflowTemplateRenameInput,
  now: Date = new Date(),
): Promise<WorkflowTemplateView> {
  const id = savedTemplateId(input.id);
  const [row] = await rls.execute((tx) =>
    tx
      .update(workflowTemplates)
      .set({ name: input.name, updatedAt: now })
      .where(and(eq(workflowTemplates.id, id), eq(workflowTemplates.userId, userId)))
      .returning({ id: workflowTemplates.id, name: workflowTemplates.name, columns: workflowTemplates.columns }),
  );
  return toTemplateView(found(row));
}

/** Archive, never delete (W18). */
export async function archiveWorkflowTemplate(
  rls: RlsClient,
  userId: string,
  input: WorkflowTemplateIdInput,
  now: Date = new Date(),
): Promise<WorkflowTemplateView> {
  const id = savedTemplateId(input.id);
  const [row] = await rls.execute((tx) =>
    tx
      .update(workflowTemplates)
      .set({ archivedAt: now, updatedAt: now })
      .where(
        and(
          eq(workflowTemplates.id, id),
          eq(workflowTemplates.userId, userId),
          isNull(workflowTemplates.archivedAt),
        ),
      )
      .returning({ id: workflowTemplates.id, name: workflowTemplates.name, columns: workflowTemplates.columns }),
  );
  return toTemplateView(found(row));
}
