/**
 * Workflow's words — Workflow UX spec v0.1 §7, verbatim. One home for the
 * route: the pages, the loading frames and the board all read this file. The
 * composites' own defaults (*next*, *firing*, *Collapse {name}*, …) live in
 * their `copy.ts` files in `@syn/ui`.
 *
 * No tally of anything appears here, by design (W15).
 */
export const WORKFLOW_COPY = {
  /** Nav and `h1` (§7). */
  title: "Workflow",

  /* ---- the browser tab's title (§3.4, §7 *Tab title*) ---- */
  tabTitleNext: (task: string) => `Next: ${task} — Synapse`,
  tabTitleAllFiring: "Everything is firing — Synapse",
  tabTitleDefault: "Workflow — Synapse",

  /* ---- the one polite announcement (WF-01 accessibility) ---- */
  announceNext: (task: string) => `Next: ${task}`,
  announceAllFiring: "Everything is firing.",

  /* ---- states (§7 *Empty*, *Failure, offline*) ---- */
  nothingInProgress: "Nothing in progress.",
  /** The day list's save-failure sentence, reused verbatim (§7) — not imported from its file. */
  saveError: "Couldn't save. Try again.",

  /** [COPY — needs Vesper sign-off: the view tabs' accessible name; §7 has none.] */
  viewsLabel: "Views",

  /* ---- add rows (§7 *Add rows*) ---- */
  addTask: "Add a task",
  taskPlaceholder: "Task",
  addGroup: "Add a group",
  groupPlaceholder: "Group, usually a client",

  /* ---- the row menu (§7 *Row menu*) ---- */
  taskOptions: (title: string) => `${title} options`,
  open: "Open",
  moveTo: "Move to",
  moveToView: "Move to view",
  start: "Start",
  archive: "Archive",

  /* ---- the lane menu (§7 *Lane menu*) ---- */
  laneOptions: (name: string) => `${name} options`,
  firstToday: "First today",
  backToUsualOrder: "Back to usual order",
  rename: "Rename",
  colour: "Colour",
  moveUp: "Move up",
  moveDown: "Move down",
  archiveGroup: "Archive group",
  noGroup: "No group",

  /* ---- toasts (§7 *Toasts*), each with Undo ---- */
  movedTo: (column: string) => `Moved to ${column}`,
  startedIn: (view: string) => `Started in ${view}`,
  closed: "Closed",
  archived: "Archived",

  /* ---- the foot (§7 *Foot*) ---- */
  closedEarlier: "Closed earlier",

  /* ---- the task sheet (§7 *Task sheet*, WF-02) ---- */
  sheetTitle: "Title",
  whereItStands: "Where it stands",
  whereItStandsHelper: "What was asked, what to check when it comes back.",
  group: "Group",
  column: "Column",
  firing: "Firing",
  titleRequired: "A task needs a title.",
  done: "Done",

  /* ---- dialogs (§7 *Dialogs*) ---- */
  archiveGroupTitle: (group: string) => `Archive ${group}.`,
  archiveGroupBody: "Its tasks move to No group.",
  archiveViewTitle: (view: string) => `Archive ${view}.`,
  archiveViewBody: "Its tasks are kept and come back with it.",
  cancel: "Cancel",

  /* ---- the header (§7 *Header*, *View menu*) ---- */
  newView: "New view",
  viewOptions: "View options",
  columns: "Columns",
  saveAsTemplate: "Save as a template",
  archivedSheet: "Archived",
  archiveThisView: "Archive this view",

  /* ---- New view (§7 *New view*, WF-03) ---- */
  name: "Name",
  startFrom: "Start from",
  viewNameRequired: "A view needs a name.",
  archivedViews: "Archived views",
  createView: "Create view",
  /** A template row's menu, named by what it acts on, as every menu here. */
  templateOptions: (name: string) => `${name} options`,

  /* ---- Columns (§7 *Columns*, WF-04) ---- */
  tasksFireHere: "Tasks fire here",
  closedTasksLandHere: "Closed tasks land here",
  remove: "Remove",
  addColumn: "Add a column",
  columnOptions: (name: string) => `${name} options`,
  moveItsTasksFirst: "Move its tasks first.",
  whereShouldTasksGo: (column: string) => `Where should the tasks in ${column} go?`,
  moveAndRemove: "Move and remove",
  stopFiring: (column: string) => `Tasks in ${column} will stop firing.`,
  continue: "Continue",
  removed: "Removed",

  /* ---- Save as a template (§7 *Save a template*) ---- */
  templateNameRequired: "A template needs a name.",
  save: "Save",

  /* ---- Archived (§7 *Archived*, WF-05) ---- */
  tasks: "Tasks",
  groups: "Groups",
  restore: "Restore",
  archivedOn: (group: string, date: string) => `${group} · archived ${date}`,
  nothingArchived: "Nothing archived.",
  restored: "Restored",
} as const;
