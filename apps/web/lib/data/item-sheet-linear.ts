import type { WorkSize } from "@syn/types";
import type { LinearStatusType } from "@syn/ui";
import type { StatusEffect } from "@syn/utils";
import type { LinearWriteView, WorkItemRecord } from "@syn/validators";
import type { PriorityLevel } from "@/components/work/view";
import type { PlannerWrite } from "@/lib/fixtures/planner";
import type { FixtureServer } from "@/lib/fixtures/server";
import type { LinearIssueJoin, LinearStatus } from "./integration-records";
import type { WorkSheetView } from "./item-sheet-work";
import { sizeOfEstimate } from "./linear-size";
import { wallWords } from "./today-work";

/**
 * A linked work item's Linear side on the Item sheet (USE-66;
 * day/item-sheet/states/linear-*.md, interactions/linear-status): the Linear
 * line and the line under it, the status list grouped as in Linear, Priority,
 * Assignee and Description, and the writes they make. Pure over the issue's
 * join and the server, so a test drives what the sheet drives.
 *
 * SYNAPSE'S VALUE STANDS. A change shows at once; the outbox row goes
 * pending ("Updating Linear"), and a failed send keeps the value here with
 * Try again, never red and never reverted (C-USE-item-sheet-linear-failed-1).
 * Offline the row waits: "Updates Linear when back online".
 *
 * A PICKED STATUS TAKES ITS CONSEQUENCE HERE (statusEffect, the status
 * sheet): Waiting needs no write (Today reads it from the status); off today
 * takes the date's session off; back to the pool takes every open session
 * off; Done checks it off; start is the work loop's, so the hook runs it. An
 * open status on a closed item opens it again first.
 *
 * UNLINK touches nothing in Linear: the item stays as a plain item with the
 * description as its notes, and Undo puts the link back.
 *
 * ASSIGNEE IS SHOWN, NEVER WRITTEN (D-USE-113).
 */

/* -------------------------------------------------------------- reads -- */

/** Linear's group to the shape's: triage reads as backlog, duplicate as canceled. */
export function shapeType(type: string): LinearStatusType {
  switch (type) {
    case "started":
    case "completed":
    case "canceled":
    case "unstarted":
      return type;
    case "duplicate":
      return "canceled";
    default:
      return "backlog";
  }
}

export interface StatusOption {
  id: string;
  name: string;
  type: LinearStatusType;
  fill: number;
  color: string;
  effect: StatusEffect;
}

export interface StatusGroup {
  key: "backlog" | "unstarted" | "started" | "closed";
  options: StatusOption[];
}

const GROUP_OF: Record<string, StatusGroup["key"]> = {
  triage: "backlog",
  backlog: "backlog",
  unstarted: "unstarted",
  started: "started",
  completed: "closed",
  canceled: "closed",
  duplicate: "closed",
};

const GROUPS: StatusGroup["key"][] = [
  "backlog",
  "unstarted",
  "started",
  "closed",
];

export function optionOf(status: LinearStatus): StatusOption {
  return {
    id: status.state.id,
    name: status.state.name,
    type: shapeType(status.state.type),
    fill: status.fill,
    color: status.state.color,
    effect: status.effect,
  };
}

/** The team's statuses (already by group, then position) in the sheet's four groups. */
export function statusGroups(states: readonly LinearStatus[]): StatusGroup[] {
  return GROUPS.map((key) => ({
    key,
    options: states
      .filter((status) => (GROUP_OF[status.state.type] ?? "backlog") === key)
      .map(optionOf),
  })).filter((group) => group.options.length > 0);
}

/** Linear's priority: 0 none, 1 urgent, 2 high, 3 normal (Medium in Linear), 4 low. */
export const PRIORITY_LEVELS: Record<number, PriorityLevel | null> = {
  0: null,
  1: "urgent",
  2: "high",
  3: "normal",
  4: "low",
};

/** The menu's order: Urgent to Low, then No priority after a rule. */
export const PRIORITY_ORDER = [1, 2, 3, 4, 0] as const;

/** The line under the Linear line, from the latest outbox row and the item. */
export type LinearLineView =
  | { kind: "syncing" }
  | { kind: "offline" }
  | { kind: "failed"; writeId: string; kept: string }
  /** `at` as the day's clock words: "10:42". */
  | { kind: "closed"; at: string }
  | null;

/** What a failed row keeps here, in its own words: the status, the priority. */
export interface KeptWords {
  status: string;
  priority: string;
  description: string;
  size: string;
}

export function keptOf(write: LinearWriteView, words: KeptWords): string {
  switch (write.kind) {
    case "priority":
      return words.priority;
    case "description":
      return words.description;
    case "estimate":
      return words.size;
    default:
      return words.status;
  }
}

export function linearLineOf(input: {
  write: LinearWriteView | null;
  offline: boolean;
  item: Pick<WorkItemRecord, "doneAt" | "doneSource">;
  words: KeptWords;
  timeZone: string;
}): LinearLineView {
  const { write, offline, item, words, timeZone } = input;
  if (write?.state === "pending") {
    return { kind: offline ? "offline" : "syncing" };
  }
  if (write?.state === "failed") {
    return { kind: "failed", writeId: write.id, kept: keptOf(write, words) };
  }
  if (item.doneAt !== null && item.doneSource === "linear") {
    return { kind: "closed", at: wallWords(new Date(item.doneAt), timeZone) };
  }
  return null;
}

/**
 * Size follows Linear's estimate on read (C-USE-item-sheet-size-and-length-2):
 * the estimate's nearest size on the issue's team's scale (USE-112), else
 * the item's own.
 */
export function sizeFromIssue(
  view: WorkSheetView,
  issue: Pick<LinearIssueJoin, "estimate" | "team"> | null,
): WorkSize | null {
  if (issue === null) return view.item.size;
  return (
    sizeOfEstimate(issue.estimate, issue.team?.estimationType) ?? view.item.size
  );
}

/* ------------------------------------------------------------- writes -- */

export type LinearSheetServer = Pick<
  FixtureServer,
  | "writeLinearIssue"
  | "retryLinearWrite"
  | "markTaskDone"
  | "reopenTask"
  | "backToPool"
  | "unplaceWork"
  | "unlinkFromLinear"
  | "undo"
>;

const OPEN_TYPES = new Set(["triage", "backlog", "unstarted", "started"]);

/**
 * A picked status: one outbox row, then its consequence here. Returns the
 * effect, so the hook can start the timer (the work loop's).
 */
export async function writeStatus(
  server: LinearSheetServer,
  view: WorkSheetView,
  status: LinearStatus,
  done: boolean,
): Promise<StatusEffect> {
  const id = view.item.id;
  // An open status on a closed item unchecks it here (linear-done.md).
  if (done && OPEN_TYPES.has(status.state.type)) {
    await server.reopenTask({ workItemId: id });
  }
  await server.writeLinearIssue({ workItemId: id, stateId: status.state.id });
  switch (status.effect) {
    case "check":
      if (!done) await server.markTaskDone({ workItemId: id });
      break;
    case "off_today":
      if (view.slot?.today && !view.slot.done) {
        await server.unplaceWork({ slotId: view.slot.id });
      }
      break;
    case "to_pool":
      await server.backToPool({ workItemId: id });
      break;
    default:
      // Waiting is read from the status; start is the work loop's.
      break;
  }
  return status.effect;
}

export function writePriority(
  server: LinearSheetServer,
  view: WorkSheetView,
  priority: number,
) {
  return server.writeLinearIssue({ workItemId: view.item.id, priority });
}

/** Description is the issue's (D-USE-36): edits go to Linear, markdown kept. */
export function writeDescription(
  server: LinearSheetServer,
  view: WorkSheetView,
  description: string,
) {
  return server.writeLinearIssue({
    workItemId: view.item.id,
    description: description.trim() === "" ? null : description,
  });
}

/** Try again: the same row, sent again. */
export function retryLinear(server: LinearSheetServer, writeId: string) {
  return server.retryLinearWrite(writeId);
}

/** Not today: the date's session off; the item stays in the pool. */
export async function writeNotToday(
  server: LinearSheetServer,
  view: WorkSheetView,
): Promise<PlannerWrite | null> {
  if (view.slot === null || !view.slot.today) return null;
  return server.unplaceWork({ slotId: view.slot.id });
}

/** Unlink: asks nothing, writes nothing to Linear; Undo restores the link. */
export function writeUnlink(server: LinearSheetServer, view: WorkSheetView) {
  return server.unlinkFromLinear({ workItemId: view.item.id });
}

/* --------------------------------------------------------------- view -- */

/** Everything the sheet draws of a linked item's Linear side. */
export interface WorkLinearView {
  identifier: string;
  /** The issue's own title; the item may keep its own (N4, USE-68). */
  title: string;
  project: string | null;
  url: string;
  /** The workspace's name: "Moves it in Linear (Lighthouse)". */
  workspace: string;
  current: StatusOption;
  statuses: LinearStatus[];
  groups: StatusGroup[];
  priority: number;
  description: string;
  line: LinearLineView;
  /** Size as Linear's estimate reads (synced both ways). */
  size: WorkSize | null;
  /** Checked off here, by Synapse or by Linear. */
  done: boolean;
}

export function deriveLinearView(input: {
  view: WorkSheetView;
  issue: LinearIssueJoin;
  /** The issue's team's statuses, by group then position (`statesOfTeam`). */
  states: readonly LinearStatus[];
  workspace: string;
  item: Pick<WorkItemRecord, "doneAt" | "doneSource">;
  offline: boolean;
  timeZone: string;
  words: {
    priorities: Record<number, string>;
    description: string;
    size: string;
  };
}): WorkLinearView {
  const { view, issue, states, item, words } = input;
  const current = optionOf(issue.status);
  const size = sizeFromIssue(view, issue);
  return {
    identifier: issue.identifier,
    title: issue.title,
    project: issue.project?.name ?? null,
    url: issue.url,
    workspace: input.workspace,
    current,
    statuses: [...states],
    groups: statusGroups(states),
    priority: issue.priority,
    description: issue.description ?? "",
    line: linearLineOf({
      write: issue.write,
      offline: input.offline,
      item,
      timeZone: input.timeZone,
      words: {
        status: current.name,
        priority: words.priorities[issue.priority] ?? "",
        description: words.description,
        size: words.size,
      },
    }),
    size,
    done: item.doneAt !== null,
  };
}
