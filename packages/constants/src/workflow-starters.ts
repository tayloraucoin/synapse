/**
 * The two built-in Workflow templates — Workflow UX spec v0.1 §3.6, Epic 7
 * TD-40, TD-41.
 *
 * Constants, never rows: `workflow_templates` holds only what the person saved.
 * The first board read makes a person's two starting views from these
 * (`ensureWorkflowDefaults`, FLO-3), and *New view* offers them beside the
 * saved ones. A view made from one owns its columns from then on (W10), so
 * editing this file never changes an existing view.
 *
 * `key` is stable and is what `workflowViewCreateInput.starterKey` names. The
 * names are the UX document's words; like `default-reasons.ts`, they are seed
 * data the person may rename, not app-voice prose.
 *
 * A column spells `WorkflowTemplateColumn` in `@syn/types` (constants sit beside
 * types, not above them, so the shape is written here and checked structurally
 * wherever the two meet).
 */

export type WorkflowStarterColumn = {
  readonly name: string;
  readonly role: "active" | "done" | null;
};

export const WORKFLOW_STARTER_KEYS = ["working", "queue"] as const;

export type WorkflowStarterKey = (typeof WORKFLOW_STARTER_KEYS)[number];

export type WorkflowStarter = {
  readonly key: WorkflowStarterKey;
  readonly name: string;
  readonly columns: ReadonlyArray<WorkflowStarterColumn>;
};

export const WORKFLOW_STARTERS: ReadonlyArray<WorkflowStarter> = [
  {
    key: "working",
    name: "Working",
    columns: [
      { name: "In progress", role: "active" },
      { name: "Ongoing", role: null },
      { name: "Finish later", role: null },
      { name: "Done", role: "done" },
    ],
  },
  {
    key: "queue",
    name: "Queue",
    columns: [
      { name: "Up next", role: null },
      { name: "Later", role: null },
      { name: "Someday", role: null },
    ],
  },
] as const;
