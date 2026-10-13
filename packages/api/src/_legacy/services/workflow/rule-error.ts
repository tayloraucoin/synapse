/**
 * Workflow's two failures — Epic 7 TD-40.
 *
 * A RULE ERROR CARRIES A CODE AND NOTHING ELSE. The router maps it to
 * `BAD_REQUEST` with the code as the message, as `LinkRuleError` is. A task's
 * title, a group's name, a note — the person's client work — never appear in
 * an error (TD-45).
 *
 * NOT FOUND IS ONE ERROR FOR EVERY KIND OF ROW. Absent, archived where it must
 * not be, or another person's: the service cannot tell them apart under RLS
 * and the caller must not be able to either (`NOT_FOUND`, never `FORBIDDEN`).
 */

export type WorkflowRuleCode =
  | "built_in_template"
  | "column_has_tasks"
  | "incomplete_reorder"
  | "last_column"
  | "last_view"
  | "no_active_view"
  | "not_in_active_column"
  | "too_many_columns";

export class WorkflowRuleError extends Error {
  readonly code: WorkflowRuleCode;
  constructor(code: WorkflowRuleCode) {
    super(code);
    this.name = "WorkflowRuleError";
    this.code = code;
  }
}

export class WorkflowNotFoundError extends Error {
  constructor() {
    super("not_found");
    this.name = "WorkflowNotFoundError";
  }
}

/** Narrow a row that must exist, or throw the one not-found error. */
export function found<T>(row: T | undefined | null): T {
  if (row === undefined || row === null) throw new WorkflowNotFoundError();
  return row;
}
