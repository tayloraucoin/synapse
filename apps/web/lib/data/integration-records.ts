import {
  resolveClient,
  statusEffect,
  statusFill,
  type ClientConnection,
  type StatusEffect,
} from "@syn/utils";
import type {
  ClientRecord,
  GoogleAccountView,
  GoogleCalendarView,
  LinearConnectionView,
  LinearIssue,
  LinearProject,
  LinearProjectClientInput,
  LinearSnapshotPayload,
  LinearTeam,
  LinearWorkflowState,
  LinearWriteView,
  WorkItemRecord,
} from "@syn/validators";

/**
 * What the integration reads return (USE-56), from the fixture server now and
 * the Linear and connections routers in wave 3, and the joins the hooks make
 * from them. Views only: no field here can hold a credential. A status's fill
 * and effect are recomputed on every read, never stored.
 */

export interface LinearWorkspace {
  connectionId: string;
  payload: LinearSnapshotPayload;
}

/** An assigned, open issue with no work item yet: placing it creates the row. */
export type LooseIssue = LinearIssue & { connectionId: string };

export interface LinearRecords {
  connections: LinearConnectionView[];
  workspaces: LinearWorkspace[];
  /** Every outbox row, oldest first. */
  outbox: LinearWriteView[];
  notInPool: LooseIssue[];
}

export interface ConnectionsRecords {
  linear: LinearConnectionView[];
  googleAccounts: GoogleAccountView[];
  googleCalendars: GoogleCalendarView[];
  /** `users.clients_enabled` (D-USE-40: off by default). */
  clientsEnabled: boolean;
  /** Every client, archived ones too, so a resolved archived one reads as none. */
  clients: ClientRecord[];
  projectClients: LinearProjectClientInput[];
}

export interface LinearStatus {
  state: LinearWorkflowState;
  /** 0 to 1, from USE-32's `statusFill`. */
  fill: number;
  effect: StatusEffect;
}

/** A linked work item's issue, as every work row and the Item sheet draw it. */
export interface LinearIssueJoin {
  connectionId: string;
  issueId: string;
  identifier: string;
  title: string;
  url: string;
  /** The item's Notes (D-USE-36). */
  description: string | null;
  priority: number;
  estimate: number | null;
  dueDate: string | null;
  labels: LinearIssue["labels"];
  status: LinearStatus;
  project: LinearProject | null;
  team: LinearTeam | null;
  /** Its latest outbox row: pending is in flight, failed is "Not updated in Linear." */
  write: LinearWriteView | null;
}

type LinkedItem = Pick<
  WorkItemRecord,
  "id" | "linearConnectionId" | "linearIssueId"
>;

function statusOf(
  state: LinearWorkflowState,
  states: readonly LinearWorkflowState[],
): LinearStatus {
  return {
    state,
    fill: statusFill(state, states),
    effect: statusEffect(state, states),
  };
}

/** The issue behind a work item; null for a Synapse-only item or one whose workspace is gone. */
export function joinIssue(
  records: LinearRecords,
  item: LinkedItem,
): LinearIssueJoin | null {
  if (item.linearConnectionId === null || item.linearIssueId === null) {
    return null;
  }
  const workspace = records.workspaces.find(
    (w) => w.connectionId === item.linearConnectionId,
  );
  if (!workspace) return null;
  const { payload } = workspace;
  const issue = [...payload.issues, ...payload.subIssues].find(
    (row) => row.id === item.linearIssueId,
  );
  if (!issue) return null;
  const state = payload.states.find((s) => s.id === issue.stateId);
  if (!state) return null;
  const write =
    records.outbox.filter((row) => row.workItemId === item.id).at(-1) ?? null;
  return {
    connectionId: workspace.connectionId,
    issueId: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    url: issue.url,
    description: issue.description,
    priority: issue.priority,
    estimate: issue.estimate,
    dueDate: issue.dueDate,
    labels: issue.labels,
    status: statusOf(state, payload.states),
    project: payload.projects.find((p) => p.id === issue.projectId) ?? null,
    team: payload.teams.find((t) => t.id === issue.teamId) ?? null,
    write,
  };
}

const GROUP_ORDER = [
  "triage",
  "backlog",
  "unstarted",
  "started",
  "completed",
  "canceled",
  "duplicate",
];

/** A team's statuses as the status sheet lists them: by group, then position. */
export function statesOfTeam(
  records: LinearRecords,
  teamId: string,
): LinearStatus[] {
  const workspace = records.workspaces.find((w) =>
    w.payload.teams.some((team) => team.id === teamId),
  );
  if (!workspace) return [];
  const states = workspace.payload.states;
  return states
    .filter((state) => state.teamId === teamId)
    .sort(
      (a, b) =>
        GROUP_ORDER.indexOf(a.type) - GROUP_ORDER.indexOf(b.type) ||
        a.position - b.position,
    )
    .map((state) => statusOf(state, states));
}

/** The latest sync across the workspaces; null when none has synced. */
export function lastSyncedOf(
  connections: readonly LinearConnectionView[],
): string | null {
  return connections.reduce<string | null>(
    (latest, c) =>
      c.lastSyncedAt !== null && (latest === null || c.lastSyncedAt > latest)
        ? c.lastSyncedAt
        : latest,
    null,
  );
}

/**
 * Whose work an item is, through USE-9's `resolveClient` alone: the project
 * comes from the issue's snapshot, the mapping from Connections.
 */
export function clientOf(
  connections: ConnectionsRecords,
  linear: LinearRecords | undefined,
  item: Pick<
    WorkItemRecord,
    "id" | "clientId" | "linearConnectionId" | "linearIssueId"
  >,
): ClientRecord | null {
  const issue = linear ? joinIssue(linear, item) : null;
  const id = resolveClient({
    clientsEnabled: connections.clientsEnabled,
    item: {
      clientId: item.clientId,
      linearConnectionId: item.linearConnectionId,
      linearProjectId: issue?.project?.id ?? null,
    },
    connections: new Map<string, ClientConnection>(
      connections.linear.map((c) => [
        c.id,
        { clientId: c.clientId, perProject: c.perProject },
      ]),
    ),
    projectClients: new Map(
      connections.projectClients.map((row) => [
        `${row.connectionId}:${row.projectId}`,
        row.clientId,
      ]),
    ),
    archived: new Set(
      connections.clients
        .filter((client) => client.archivedAt !== null)
        .map((client) => client.id),
    ),
  });
  return id === null
    ? null
    : (connections.clients.find((client) => client.id === id) ?? null);
}
