/**
 * Workflow story fixtures — view models shaped exactly as `workflow.board`
 * returns them (FLO-1's `@syn/types`), so the stories prove what the board can
 * really do.
 *
 * EVERY NAME HERE IS INVENTED. A group is usually a client; none of these is a
 * real client's, company's or person's name.
 *
 * Times are fixed instants relative to `WORKFLOW_STORY_NOW`, never `new Date()`,
 * so a story renders the same frame every time.
 */
import type {
  WorkflowColumnView,
  WorkflowGroupView,
  WorkflowTaskView,
} from "@syn/types";

export const WORKFLOW_STORY_NOW = new Date(Date.UTC(2026, 9, 3, 18, 0));

const minutesAgo = (minutes: number): Date =>
  new Date(WORKFLOW_STORY_NOW.getTime() - minutes * 60_000);
const secondsAgo = (seconds: number): Date =>
  new Date(WORKFLOW_STORY_NOW.getTime() - seconds * 1000);

export const WORKING_COLUMNS: WorkflowColumnView[] = [
  { id: "col-progress", name: "In progress", role: "active" },
  { id: "col-ongoing", name: "Ongoing", role: null },
  { id: "col-later", name: "Finish later", role: null },
  { id: "col-done", name: "Done", role: "done" },
];

export const QUEUE_COLUMNS: WorkflowColumnView[] = [
  { id: "col-next", name: "Up next", role: null },
  { id: "col-later-q", name: "Later", role: null },
  { id: "col-someday", name: "Someday", role: null },
];

export const NORTHWIND: WorkflowGroupView = { id: "g-northwind", name: "Northwind", hue: "leaf", collapsed: false };
export const HARBOR: WorkflowGroupView = { id: "g-harbor", name: "Harbor", hue: "sky", collapsed: false };
export const INTERNAL: WorkflowGroupView = { id: "g-internal", name: "Internal", hue: "clay", collapsed: true };

const task = (overrides: Partial<WorkflowTaskView> & Pick<WorkflowTaskView, "id" | "title">): WorkflowTaskView => ({
  note: null,
  groupId: NORTHWIND.id,
  columnId: "col-progress",
  firingStartedAt: null,
  lastReturnedAt: null,
  closedAt: null,
  ...overrides,
});

export const TASK_FIRING_4 = task({ id: "t-firing-4", title: "Draft the onboarding email", firingStartedAt: minutesAgo(4) });
export const TASK_FIRING_FIRST_MINUTE = task({
  id: "t-firing-0",
  title: "Refactor the invoice export",
  groupId: HARBOR.id,
  firingStartedAt: secondsAgo(30),
});
export const TASK_FIRING_72 = task({
  id: "t-firing-72",
  title: "Migrate the reporting jobs",
  groupId: HARBOR.id,
  firingStartedAt: minutesAgo(72),
});
export const TASK_BACK_WITH_NOTE = task({
  id: "t-back",
  title: "Review the pricing page copy",
  note: "Asked for a shorter opening line. Check the second paragraph.",
  lastReturnedAt: minutesAgo(2),
});
export const TASK_NEVER_FIRED = task({ id: "t-never", title: "Write the release notes", groupId: INTERNAL.id });
export const TASK_PLAIN = task({ id: "t-plain", title: "Weekly sync notes", columnId: "col-ongoing" });
export const TASK_CLOSED = task({
  id: "t-closed",
  title: "Fix the link checker",
  columnId: "col-done",
  closedAt: minutesAgo(40),
});
export const TASK_LONG_TITLE = task({
  id: "t-long",
  title: "Reconcile the quarterly stockpile measurements against the vendor spreadsheet and flag outliers",
  lastReturnedAt: minutesAgo(12),
});
