import { z } from "zod";

import {
  WORKFLOW_NAME_MAX,
  WORKFLOW_NOTE_MAX,
  WORKFLOW_STARTER_KEYS,
  WORKFLOW_TITLE_MAX,
} from "@syn/constants";

import { categoryKeySchema } from "./icon";

/**
 * Workflow's inputs — Workflow UX spec v0.1 §3, §7; Epic 7 TD-35, TD-36,
 * TD-40. One schema per `workflow.*` procedure input; the task sheet and the
 * dialogs parse with the same ones.
 *
 * Messages are §7's sentences, verbatim. Titles and names are trimmed here;
 * a length past its bound fails with no sentence, because the field stops
 * accepting and says nothing (WF-01) — the bound is only ever met by a
 * request that did not come from the form.
 */

const TASK_TITLE_REQUIRED = "A task needs a title.";
const VIEW_NAME_REQUIRED = "A view needs a name.";
const TEMPLATE_NAME_REQUIRED = "A template needs a name.";

const id = z.string().uuid();

const taskTitle = z
  .string()
  .trim()
  .min(1, TASK_TITLE_REQUIRED)
  .max(WORKFLOW_TITLE_MAX);

const named = (message?: string) =>
  z.string().trim().min(1, message).max(WORKFLOW_NAME_MAX);

// [COPY — needs Vesper sign-off: §7 gives no line for an empty group or column
// name. The add rows submit nothing when empty, so the bare refusal is never shown.]
const groupOrColumnName = named();

/**
 * A saved template is a uuid; a built-in one is listed as `starter:<key>`
 * (FLO-3), so the id is a short string here and the service refuses a built-in
 * one by name rather than the schema refusing it as malformed.
 */
const templateId = z.string().min(1).max(64);

export const workflowColumnRoleSchema = z.enum(["active", "done"]);

/* ---- the board ---- */

export const workflowBoardInput = z.object({ viewId: id });
export type WorkflowBoardInput = z.infer<typeof workflowBoardInput>;

export const workflowIdInput = z.object({ id });
export type WorkflowIdInput = z.infer<typeof workflowIdInput>;

/** The full ordered id list, as `reorderLinksInput` — the service refuses an incomplete one (TD-35). */
export const workflowReorderInput = z.object({ ids: z.array(id).min(1) });
export type WorkflowReorderInput = z.infer<typeof workflowReorderInput>;

/* ---- tasks ---- */

export const workflowTaskCreateInput = z.object({
  viewId: id,
  columnId: id,
  groupId: id.nullable(),
  title: taskTitle,
});
export type WorkflowTaskCreateInput = z.infer<typeof workflowTaskCreateInput>;

export const workflowTaskUpdateInput = z.object({
  id,
  title: taskTitle.optional(),
  note: z.string().max(WORKFLOW_NOTE_MAX).nullable().optional(),
  groupId: id.nullable().optional(),
});
export type WorkflowTaskUpdateInput = z.infer<typeof workflowTaskUpdateInput>;

/**
 * One move, whatever it changes — column, lane and place together (TD-35).
 * `restoreFiringStartedAt` is the undo's: the firing the task had before the
 * move it undoes, applied only when the destination is the active column.
 */
export const workflowTaskMoveInput = z.object({
  id,
  toColumnId: id,
  toGroupId: id.nullable(),
  toIndex: z.number().int().min(0),
  restoreFiringStartedAt: z.coerce.date().nullable().optional(),
});
export type WorkflowTaskMoveInput = z.infer<typeof workflowTaskMoveInput>;

/** Set, never toggled (TD-36): the wanted state and the client's own `at`; safe to send twice. */
export const workflowTaskSetFiringInput = z.object({
  id,
  firing: z.boolean(),
  at: z.coerce.date(),
});
export type WorkflowTaskSetFiringInput = z.infer<typeof workflowTaskSetFiringInput>;

/** *Closed earlier*, newest first, a page at a time; the cursor is the service's to shape. */
export const workflowListClosedInput = z.object({
  viewId: id,
  cursor: z.string().min(1).optional(),
});
export type WorkflowListClosedInput = z.infer<typeof workflowListClosedInput>;

/* ---- groups ---- */

export const workflowGroupCreateInput = z.object({ name: groupOrColumnName });
export type WorkflowGroupCreateInput = z.infer<typeof workflowGroupCreateInput>;

export const workflowGroupRenameInput = z.object({ id, name: groupOrColumnName });
export type WorkflowGroupRenameInput = z.infer<typeof workflowGroupRenameInput>;

export const workflowGroupSetHueInput = z.object({ id, hue: categoryKeySchema });
export type WorkflowGroupSetHueInput = z.infer<typeof workflowGroupSetHueInput>;

export const workflowGroupSetCollapsedInput = z.object({ id, collapsed: z.boolean() });
export type WorkflowGroupSetCollapsedInput = z.infer<typeof workflowGroupSetCollapsedInput>;

/* ---- views and columns ---- */

/** A new view starts from exactly one template: a built-in one by key, or a saved one by id. */
export const workflowViewCreateInput = z
  .object({
    name: named(VIEW_NAME_REQUIRED),
    starterKey: z.enum(WORKFLOW_STARTER_KEYS).optional(),
    templateId: id.optional(),
  })
  .refine(
    (value) => (value.starterKey === undefined) !== (value.templateId === undefined),
    { path: ["templateId"] },
  );
export type WorkflowViewCreateInput = z.infer<typeof workflowViewCreateInput>;

export const workflowViewRenameInput = z.object({ id, name: named(VIEW_NAME_REQUIRED) });
export type WorkflowViewRenameInput = z.infer<typeof workflowViewRenameInput>;

/** Add a column (no `id`) or rename one. */
export const workflowColumnSaveInput = z.object({
  viewId: id,
  id: id.optional(),
  name: groupOrColumnName,
});
export type WorkflowColumnSaveInput = z.infer<typeof workflowColumnSaveInput>;

export const workflowColumnSetRoleInput = z.object({
  id,
  role: workflowColumnRoleSchema.nullable(),
});
export type WorkflowColumnSetRoleInput = z.infer<typeof workflowColumnSetRoleInput>;

/** `moveTasksTo` is required by the service when the column holds tasks (WF-04). */
export const workflowColumnRemoveInput = z.object({
  id,
  moveTasksTo: id.optional(),
});
export type WorkflowColumnRemoveInput = z.infer<typeof workflowColumnRemoveInput>;

/* ---- templates ---- */

export const workflowTemplateSaveInput = z.object({
  viewId: id,
  name: named(TEMPLATE_NAME_REQUIRED),
});
export type WorkflowTemplateSaveInput = z.infer<typeof workflowTemplateSaveInput>;

export const workflowTemplateRenameInput = z.object({
  id: templateId,
  name: named(TEMPLATE_NAME_REQUIRED),
});
export type WorkflowTemplateRenameInput = z.infer<typeof workflowTemplateRenameInput>;
