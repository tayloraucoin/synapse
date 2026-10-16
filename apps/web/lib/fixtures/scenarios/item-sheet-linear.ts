import { slotRecord, workItemRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import {
  INTEGRATION_IDS,
  issueId,
  stateId,
  type WorkflowName,
} from "../integrations/workspaces";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { onMonday, TODAY_WORK_IDS, todayWorkRecords } from "./today-desk";

/**
 * A linked work item's Item sheet (USE-66; day/item-sheet/states/linear-*,
 * interactions/linear-status): [Fix the sync retry], ENG-123 in Lighthouse's
 * Sync engine, In progress, High, 3 Medium (1 h to 2 h), assigned to Taylor,
 * first in Monday's Primary (Work 9:30 to 12:00), on work's Monday.
 * `?sheet=item&id=<ITEM_SHEET_LINEAR_IDS.item>&state=item-linear-<state>`.
 *
 * - linked, status, priority, more-open: 6:58, before the day begins (no
 *   Start or Done); status opens the status list, priority its menu.
 * - syncing, failed, offline: set to In review here; its row in flight,
 *   failed once (Try again sends it), or held offline.
 * - done: closed in Linear by someone else at 10:42, the day under way.
 */

export const ITEM_SHEET_LINEAR_IDS = {
  item: fixtureId(4, 666),
  slot: fixtureId(3, 666),
  write: fixtureId(8, 666),
} as const;

const IDS = ITEM_SHEET_LINEAR_IDS;
const ISSUE = "ENG-123";
const PROJECT = "project-sync-engine";
const STAMP = "2026-10-11T12:00:00.000Z";

/** Before the day begins, as the boards draw the linked sheet. */
const EARLY = "2026-10-12T06:58:00-04:00";
const CLOSED_AT = "10:42";

const DESCRIPTION =
  "[Retries fire twice when the socket drops mid-flush. Dedupe on the mutation id before requeueing, and add a test for the drop.]";

function lighthouseOf(records: FixtureRecords) {
  const workspace = records.integrations!.linear.find(
    (w) => w.connection.id === INTEGRATION_IDS.connections.lighthouse,
  )!;
  const issue = workspace.snapshot.issues.find(
    (row) => row.identifier === ISSUE,
  )!;
  return { workspace, issue };
}

/** The Monday with [Fix the sync retry] linked to ENG-123, first in Primary. */
export function itemSheetLinearRecords(
  options: { ready?: boolean; status?: WorkflowName } = {},
): FixtureRecords {
  const records = todayWorkRecords();
  const { workspace, issue } = lighthouseOf(records);
  workspace.connection = {
    ...workspace.connection,
    organizationName: "Lighthouse",
  };
  workspace.snapshot.projects.push({
    id: PROJECT,
    name: "Sync engine",
    icon: "🔄",
    color: "#4ea7fc",
  });
  Object.assign(issue, {
    title: "[Fix the sync retry]",
    description: DESCRIPTION,
    projectId: PROJECT,
    priority: 2,
    estimate: 3,
    stateId: stateId("ENG", options.status ?? "In progress"),
  });

  records.workItems.push(
    workItemRecord.parse({
      id: IDS.item,
      createdAt: STAMP,
      updatedAt: STAMP,
      title: "[Fix the sync retry]",
      notes: null,
      icon: { kind: "emoji", value: "🔄" },
      size: "medium",
      lengthMinMin: 60,
      lengthMaxMin: 120,
      dueOn: null,
      clientId: null,
      parentWorkItemId: null,
      doneAt: null,
      doneSource: null,
      archivedAt: null,
      linearIdentifier: ISSUE,
      linearConnectionId: INTEGRATION_IDS.connections.lighthouse,
      linearIssueId: issueId(ISSUE),
    }),
  );
  const portal = records.slots.find(
    (row) => row.id === TODAY_WORK_IDS.slots.portal,
  )!;
  const first = portal.sortOrder;
  // First in the block: the Monday's other work moves down one.
  records.slots = records.slots.map((row) =>
    row.blockId === portal.blockId &&
    row.onDate === portal.onDate &&
    row.sortOrder >= first
      ? { ...row, sortOrder: row.sortOrder + 1 }
      : row,
  );
  records.slots.push(
    slotRecord.parse({
      ...portal,
      id: IDS.slot,
      createdAt: STAMP,
      updatedAt: STAMP,
      workItemId: IDS.item,
      tier: "primary",
      sortOrder: first,
      lengthMin: null,
      tookMin: null,
      doneAt: null,
    }),
  );

  if (options.ready === false) {
    records.dayRecords = records.dayRecords.map((row) =>
      row.onDate === "2026-10-12" ? { ...row, readyAt: null } : row,
    );
  }
  return records;
}

/** In review set here, and its outbox row in `state`. */
function inReview(state: "pending" | "failed") {
  return (records: FixtureRecords) => {
    const { workspace, issue } = lighthouseOf(records);
    records.integrations!.outbox.push({
      id: IDS.write,
      workItemId: IDS.item,
      kind: "status",
      state,
      createdAt: onMonday("06:57"),
      connectionId: workspace.connection.id,
      issueId: issue.id,
      change: { stateId: stateId("ENG", "In review") },
      sends: state === "failed" ? 1 : 0,
    });
  };
}

/** Closed in Linear at 10:42 (D-USE-97): the task and every open session. */
function closedInLinear(records: FixtureRecords) {
  const at = onMonday(CLOSED_AT);
  const item = records.workItems.find((row) => row.id === IDS.item)!;
  item.doneAt = at;
  item.doneSource = "linear";
  for (const slot of records.slots) {
    if (slot.workItemId === IDS.item && slot.doneAt === null) slot.doneAt = at;
  }
  records.integrations!.prevStateIds[IDS.item] = stateId("ENG", "In progress");
}

function scenario(
  name: string,
  options: {
    early?: boolean;
    status?: WorkflowName;
    edit?: (records: FixtureRecords) => void;
  } & Partial<Scenario> = {},
): () => Scenario {
  const { early = true, status, edit, ...rest } = options;
  return () => {
    const records = itemSheetLinearRecords({ ready: !early, status });
    edit?.(records);
    return {
      name,
      now: early ? EARLY : `2026-10-12T${CLOSED_AT}:00-04:00`,
      records,
      mode: "ready",
      ...rest,
    };
  };
}

export const ITEM_SHEET_LINEAR_SCENARIOS: Record<string, () => Scenario> = {
  "item-linear-linked": scenario("item-linear-linked"),
  "item-linear-status": scenario("item-linear-status", {
    view: { open: "item:status" },
  }),
  "item-linear-priority": scenario("item-linear-priority", {
    view: { open: "item:priority" },
  }),
  "item-linear-more-open": scenario("item-linear-more-open", {
    view: { open: "item:more" },
  }),
  "item-linear-syncing": scenario("item-linear-syncing", {
    status: "In review",
    edit: inReview("pending"),
  }),
  "item-linear-failed": scenario("item-linear-failed", {
    status: "In review",
    edit: inReview("failed"),
    linearSends: "fail",
  }),
  "item-linear-offline": scenario("item-linear-offline", {
    status: "In review",
    edit: inReview("pending"),
    offline: true,
  }),
  "item-linear-done": scenario("item-linear-done", {
    early: false,
    status: "Done",
    edit: closedInLinear,
  }),
};
