import { statusFill, weekdayIndex } from "@syn/utils";
import type {
  ClientRecord,
  LinearIssue,
  WorkItemRecord,
} from "@syn/validators";
import {
  joinIssue,
  lastSyncedOf,
  type LinearRecords,
  type LooseIssue,
} from "./integration-records";
import type { Pool } from "./pool-records";
import { dueBadge, SIZE_WORDS, type DueBadge } from "./week-view";

/**
 * The desk's pool panel, worked out (USE-74; ux/work/week/pool-panel.md and
 * pool-rows.md): the rows grouped by client in Taylor's one order (D-USE-96),
 * then team and project lines (D-USE-42); Sort's order with client order
 * breaking ties (D-USE-98); a search across both tabs that says where each
 * result lives (D-USE-57). Every word is printed here; the parts draw them.
 */

export type PoolGroupBy = "client" | "workspace" | "project";
export type PoolSort = "due" | "priority" | "updated";
export type PoolTab = "pool" | "linear";

export type PriorityLevel = "urgent" | "high" | "normal" | "low";
export type StatusShapeType =
  "backlog" | "unstarted" | "started" | "completed" | "canceled";

export const POOL_WORDS = {
  group: { client: "Client", workspace: "Workspace", project: "Project" },
  sort: { due: "Due date", priority: "Priority", updated: "Updated" },
  priority: { urgent: "Urgent", high: "High", normal: "Normal", low: "Low" },
  noLinear: "No Linear",
  unsized: "unsized",
  noClient: "No client",
  noProject: "No project",
  inPool: "Pool",
  inLinear: "Linear, not in the pool yet",
  ownWorkspace: (name: string) =>
    name ? `In ${name}'s workspace` : "In the own workspace",
  placedOn: (days: string) => `on ${days}`,
  hoursLeft: (hours: number) => `${hours} h`,
  newItem: (query: string) => `+ New item "${query}"`,
  synced: (ago: string) => `Linear synced ${ago}`,
  justNow: "just now",
  minAgo: (n: number) => `${n} min ago`,
  hAgo: (n: number) => `${n} h ago`,
} as const;

const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Linear's numbers: 0 none, 1 Urgent, 2 High, 3 Normal, 4 Low. */
const PRIORITY: Record<number, PriorityLevel | undefined> = {
  1: "urgent",
  2: "high",
  3: "normal",
  4: "low",
};

/** Linear's estimate points to Synapse's sizes (size-and-length.md). */
const ESTIMATE_SIZE: Record<number, keyof typeof SIZE_WORDS | undefined> = {
  1: "quick",
  2: "small",
  3: "medium",
  5: "large",
  8: "huge",
};

export interface PoolRowView {
  /** The work item's id, or `issue:<connection>:<issue>` for an issue not in the pool. */
  key: string;
  workItemId: string | null;
  emoji: string | null;
  title: string;
  /** Shape and colour together, named (D-USE-42); null with no priority. */
  priority: { level: PriorityLevel; word: string } | null;
  /** "KES-58"; null on a Synapse-only item. */
  identifier: string | null;
  /** "No Linear", in the ID's place on a Synapse-only item. */
  noLinear: string | null;
  /** "5 Large", "8 Huge · 20 h" or "unsized". */
  size: string;
  labels: { name: string; color: string }[];
  due: DueBadge | null;
  /** "on Mon, Tue, Wed": placed rows stay, faded, naming their days. */
  placed: string | null;
  /** Spread… on a Huge item. */
  spread: boolean;
  /** The Linear tab's status: the shape as Linear draws it and its word. */
  status: {
    type: StatusShapeType;
    word: string;
    progress: number;
    color: string;
  } | null;
  /** Search only: where the result lives. */
  where: string | null;
  /** The row's accessible name. */
  label: string;
}

export interface PoolLineView {
  key: string;
  /** "💻 Product Engineering" or "In Taylor's workspace"; null when the project stands alone. */
  team: { emoji: string | null; name: string } | null;
  project: { emoji: string | null; name: string } | null;
  rows: PoolRowView[];
}

export type PoolHeadView =
  | {
      kind: "client";
      id: string;
      name: string;
      letter: string;
      hue: ClientRecord["colorKey"];
    }
  | { kind: "plain"; name: string; emoji: string | null };

export interface PoolGroupView {
  key: string;
  head: PoolHeadView;
  /** Lines in the order of their first row; the line-less rows come last as a line with neither part. */
  lines: PoolLineView[];
}

export interface PoolSearchView {
  pool: PoolRowView[];
  linear: PoolRowView[];
  newItem: string;
}

export interface PoolPanelView {
  /** Linear connected: the Linear tab and the sync line show (D-USE-101). */
  linearConnected: boolean;
  /** Client heads take grips and the order line (Group: Client, clients on). */
  byClient: boolean;
  groups: PoolGroupView[];
  search: PoolSearchView | null;
  /** The pool holds nothing (pool-empty.md); never a count. */
  empty: boolean;
  sync: string | null;
}

export interface PoolViewInput {
  pool: Pool;
  linear: LinearRecords | null;
  /** Clients not archived, in Taylor's order (D-USE-96). */
  clients: readonly ClientRecord[];
  clientsEnabled: boolean;
  /** Whose work an issue not in the pool is, through USE-9's resolveClient. */
  clientFor: (
    item: Pick<
      WorkItemRecord,
      "id" | "clientId" | "linearConnectionId" | "linearIssueId"
    >,
  ) => ClientRecord | null;
  /** "Taylor": the own workspace's line. */
  personName: string;
  todayKey: string;
  now: Date;
  group: PoolGroupBy;
  sort: PoolSort;
  query: string;
  tab: PoolTab;
}

/** One row before it is placed in a group: the row and what groups and sorts it. */
interface Entry {
  row: PoolRowView;
  client: ClientRecord | null;
  workspace: { id: string; name: string } | null;
  line: Omit<PoolLineView, "rows">;
  project: { id: string; emoji: string | null; name: string } | null;
  dueOn: string | null;
  priorityRank: number;
  updatedAt: string;
}

function placedDays(dates: readonly string[], todayKey: string): string {
  const unique = [...new Set(dates)].sort();
  const weekStart = mondayOf(todayKey);
  return unique
    .map((date) => {
      const day = WEEKDAY_SHORT[weekdayIndex(date)]!;
      // [ASSUMPTION] A session outside this week carries its date: "Mon 19".
      const inWeek = date >= weekStart && date < addDaysKey(weekStart, 7);
      return inWeek ? day : `${day} ${Number(date.slice(8, 10))}`;
    })
    .join(", ");
}

function mondayOf(dateKey: string): string {
  return addDaysKey(dateKey, -weekdayIndex(dateKey));
}

function addDaysKey(dateKey: string, by: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d! + by)).toISOString().slice(0, 10);
}

function sizeOf(
  size: keyof typeof SIZE_WORDS | null,
  lengthMaxMin: number | null,
): string {
  if (size === null) return POOL_WORDS.unsized;
  // [ASSUMPTION] The hours left are the top of the range, nothing worked yet.
  if (size === "huge" && lengthMaxMin !== null) {
    return `${SIZE_WORDS.huge} · ${POOL_WORDS.hoursLeft(Math.round(lengthMaxMin / 60))}`;
  }
  return SIZE_WORDS[size];
}

function statusType(type: string): StatusShapeType {
  return type === "duplicate" ? "canceled" : (type as StatusShapeType);
}

export function lineOf(
  linear: LinearRecords | null,
  connectionId: string | null,
  issue: Pick<LinearIssue, "teamId" | "projectId"> | null,
  personName: string,
): {
  line: Omit<PoolLineView, "rows">;
  workspace: { id: string; name: string } | null;
  project: { id: string; emoji: string | null; name: string } | null;
} {
  const none = {
    line: { key: "none", team: null, project: null },
    workspace: null,
    project: null,
  };
  if (!linear || connectionId === null || issue === null) return none;
  const workspace = linear.workspaces.find(
    (w) => w.connectionId === connectionId,
  );
  const connection = linear.connections.find((c) => c.id === connectionId);
  if (!workspace || !connection) return none;
  const team = workspace.payload.teams.find((t) => t.id === issue.teamId);
  const project =
    workspace.payload.projects.find((p) => p.id === issue.projectId) ?? null;
  const projectPart = project
    ? { emoji: project.icon, name: project.name }
    : null;
  // One company with two teams is one client with two lines (D-USE-42); a
  // project set to a client inside the own workspace reads the workspace,
  // and a team named as its project stands as the project alone.
  let teamPart: PoolLineView["team"] = team
    ? { emoji: team.icon, name: team.name }
    : null;
  if (connection.perProject) {
    teamPart = { emoji: null, name: POOL_WORDS.ownWorkspace(personName) };
  }
  if (team && project && team.name === project.name) teamPart = null;
  return {
    line: {
      key: `${connectionId}:${issue.teamId}:${issue.projectId ?? ""}`,
      team: teamPart,
      project: projectPart,
    },
    workspace: { id: connectionId, name: connection.organizationName },
    project: project
      ? { id: `${connectionId}:${project.id}`, ...projectPart! }
      : null,
  };
}

function rowLabel(row: Omit<PoolRowView, "label">): string {
  return [
    row.title,
    row.priority ? `${row.priority.word} priority` : null,
    row.identifier ?? row.noLinear,
    row.status?.word ?? null,
    row.size,
    row.due ? row.due.word.replace(/^Due/, "due") : null,
    row.placed,
    row.where,
  ]
    .filter(Boolean)
    .join(", ");
}

function finish(row: Omit<PoolRowView, "label">): PoolRowView {
  return { ...row, label: rowLabel(row) };
}

function poolEntries(input: PoolViewInput): Entry[] {
  const { pool, linear, todayKey, personName } = input;
  return pool.items.map(({ item, client, sessionDates }) => {
    const issue = linear ? joinIssue(linear, item) : null;
    const level = issue ? (PRIORITY[issue.priority] ?? null) : null;
    const dueOn = issue ? (issue.dueDate ?? item.dueOn) : item.dueOn;
    const placed =
      sessionDates.length > 0
        ? POOL_WORDS.placedOn(placedDays(sessionDates, todayKey))
        : null;
    const identifier = issue?.identifier ?? item.linearIdentifier;
    const where = lineOf(
      linear,
      issue?.connectionId ?? null,
      issue
        ? { teamId: issue.team?.id ?? "", projectId: issue.project?.id ?? null }
        : null,
      personName,
    );
    return {
      row: finish({
        key: item.id,
        workItemId: item.id,
        emoji: item.icon?.kind === "emoji" ? item.icon.value : null,
        title: item.title,
        // A placed row reads its days in place of its marks (pool-rows.md).
        priority:
          level && placed === null
            ? { level, word: POOL_WORDS.priority[level] }
            : null,
        identifier,
        noLinear: identifier === null ? POOL_WORDS.noLinear : null,
        size: sizeOf(item.size, item.lengthMaxMin),
        labels: placed === null ? (issue?.labels ?? []) : [],
        due: dueBadge(dueOn, todayKey),
        placed,
        spread: item.size === "huge",
        // The status leads the meta on the Linear tab only (states/linear-tab.md).
        status:
          issue && input.tab === "linear"
            ? {
                type: statusType(issue.status.state.type),
                word: issue.status.state.name,
                progress: issue.status.fill,
                color: issue.status.state.color,
              }
            : null,
        where: null,
      }),
      // usePool resolves whose work it is (USE-9's resolveClient).
      client,
      workspace: where.workspace,
      line: where.line,
      project: where.project,
      dueOn,
      priorityRank: level ? Object.values(PRIORITY).indexOf(level) : 4,
      updatedAt: item.updatedAt,
    };
  });
}

function looseEntries(input: PoolViewInput): Entry[] {
  const { linear, todayKey, personName } = input;
  if (!linear) return [];
  return linear.notInPool.map((issue: LooseIssue) => {
    const workspace = linear.workspaces.find(
      (w) => w.connectionId === issue.connectionId,
    );
    const states = workspace?.payload.states ?? [];
    const state = states.find((s) => s.id === issue.stateId);
    const level = PRIORITY[issue.priority] ?? null;
    const size = issue.estimate === null ? null : ESTIMATE_SIZE[issue.estimate];
    const where = lineOf(linear, issue.connectionId, issue, personName);
    const project = workspace?.payload.projects.find(
      (p) => p.id === issue.projectId,
    );
    return {
      row: finish({
        key: `issue:${issue.connectionId}:${issue.id}`,
        workItemId: null,
        emoji: project?.icon ?? null,
        title: issue.title,
        priority: level ? { level, word: POOL_WORDS.priority[level] } : null,
        identifier: issue.identifier,
        noLinear: null,
        size: size ? SIZE_WORDS[size] : POOL_WORDS.unsized,
        labels: issue.labels,
        due: dueBadge(issue.dueDate, todayKey),
        placed: null,
        spread: false,
        status: state
          ? {
              type: statusType(state.type),
              word: state.name,
              progress: statusFill(state, states),
              color: state.color,
            }
          : null,
        where: null,
      }),
      client: input.clientFor({
        id: issue.id,
        clientId: null,
        linearConnectionId: issue.connectionId,
        linearIssueId: issue.id,
      }),
      workspace: where.workspace,
      line: where.line,
      project: where.project,
      dueOn: issue.dueDate,
      priorityRank: level ? Object.values(PRIORITY).indexOf(level) : 4,
      updatedAt: "",
    };
  });
}

/**
 * Sort's order (D-USE-98): Due date, then Priority, then client order;
 * Priority, then Due date, then client order; Updated, newest first, then
 * client order. Client order breaks every tie (D-USE-96).
 */
export function comparePoolEntries(
  sort: PoolSort,
  clientRank: (client: ClientRecord | null) => number,
) {
  const byDue = (a: Entry, b: Entry) =>
    a.dueOn === b.dueOn
      ? 0
      : a.dueOn === null
        ? 1
        : b.dueOn === null
          ? -1
          : a.dueOn < b.dueOn
            ? -1
            : 1;
  const byPriority = (a: Entry, b: Entry) => a.priorityRank - b.priorityRank;
  const byClient = (a: Entry, b: Entry) =>
    clientRank(a.client) - clientRank(b.client);
  const byUpdated = (a: Entry, b: Entry) =>
    a.updatedAt === b.updatedAt ? 0 : a.updatedAt > b.updatedAt ? -1 : 1;
  const chain =
    sort === "due"
      ? [byDue, byPriority, byClient]
      : sort === "priority"
        ? [byPriority, byDue, byClient]
        : [byUpdated, byClient];
  return (a: Entry, b: Entry) => {
    for (const compare of chain) {
      const result = compare(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
}

function clientHead(client: ClientRecord): PoolHeadView {
  return {
    kind: "client",
    id: client.id,
    name: client.name,
    letter: client.name.trim().charAt(0).toUpperCase(),
    hue: client.colorKey,
  };
}

function headOf(
  entry: Entry,
  group: PoolGroupBy,
): { key: string; head: PoolHeadView } {
  if (group === "client" && entry.client) {
    return {
      key: `client:${entry.client.id}`,
      head: clientHead(entry.client),
    };
  }
  if (group === "client") {
    return {
      key: "client:none",
      head: { kind: "plain", name: POOL_WORDS.noClient, emoji: null },
    };
  }
  if (group === "project") {
    if (entry.project)
      return {
        key: `project:${entry.project.id}`,
        head: {
          kind: "plain",
          name: entry.project.name,
          emoji: entry.project.emoji,
        },
      };
    return entry.workspace
      ? {
          key: "project:none",
          head: { kind: "plain", name: POOL_WORDS.noProject, emoji: null },
        }
      : {
          key: "linear:none",
          head: { kind: "plain", name: POOL_WORDS.noLinear, emoji: null },
        };
  }
  // [ASSUMPTION] Synapse-only work sits under "No Linear" when grouped by workspace.
  return entry.workspace
    ? {
        key: `workspace:${entry.workspace.id}`,
        head: { kind: "plain", name: entry.workspace.name, emoji: null },
      }
    : {
        key: "linear:none",
        head: { kind: "plain", name: POOL_WORDS.noLinear, emoji: null },
      };
}

function groupEntries(
  entries: readonly Entry[],
  group: PoolGroupBy,
  clients: readonly ClientRecord[],
  keepEmptyClients: boolean,
): PoolGroupView[] {
  const groups = new Map<string, PoolGroupView>();
  // Client heads stand in Taylor's order, empty ones too, so each can be dragged.
  if (group === "client" && keepEmptyClients) {
    for (const client of clients) {
      const key = `client:${client.id}`;
      groups.set(key, { key, head: clientHead(client), lines: [] });
    }
  }
  for (const entry of entries) {
    const { key, head } = headOf(entry, group);
    let target = groups.get(key);
    if (!target) {
      target = { key, head, lines: [] };
      groups.set(key, target);
    }
    // Grouped by project, the head is the project: no lines under it.
    const lineKey = group === "project" ? "none" : entry.line.key;
    let line = target.lines.find((l) => l.key === lineKey);
    if (!line) {
      line =
        group === "project"
          ? { key: "none", team: null, project: null, rows: [] }
          : { ...entry.line, rows: [] };
      target.lines.push(line);
    }
    line.rows.push(entry.row);
  }
  for (const target of groups.values()) {
    // Rows with no line (Synapse-only) sit last under their head.
    target.lines.sort(
      (a, b) => Number(a.key === "none") - Number(b.key === "none"),
    );
  }
  const list = [...groups.values()];
  // The client-less and Linear-less groups close the list.
  return list.sort(
    (a, b) => Number(a.key.endsWith(":none")) - Number(b.key.endsWith(":none")),
  );
}

function syncWords(lastSyncedAt: string | null, now: Date): string | null {
  if (lastSyncedAt === null) return null;
  const min = Math.floor((now.getTime() - Date.parse(lastSyncedAt)) / 60_000);
  // [ASSUMPTION] Under a minute "just now"; from an hour in hours.
  const ago =
    min < 1
      ? POOL_WORDS.justNow
      : min < 60
        ? POOL_WORDS.minAgo(min)
        : POOL_WORDS.hAgo(Math.floor(min / 60));
  return POOL_WORDS.synced(ago);
}

function matches(row: PoolRowView, query: string): boolean {
  const q = query.toLowerCase();
  return (
    row.title.toLowerCase().includes(q) ||
    (row.identifier?.toLowerCase().includes(q) ?? false)
  );
}

export function poolView(input: PoolViewInput): PoolPanelView {
  const linearConnected = (input.linear?.connections.length ?? 0) > 0;
  const linear = linearConnected ? input.linear : null;
  const scoped = { ...input, linear };
  const clientRank = (client: ClientRecord | null) => {
    const index = client
      ? input.clients.findIndex((c) => c.id === client.id)
      : -1;
    return index === -1 ? input.clients.length : index;
  };
  const compare = comparePoolEntries(input.sort, clientRank);
  const pooled = poolEntries(scoped).sort(compare);
  const loose = looseEntries(scoped).sort(compare);
  // With clients off there are no client heads [ASSUMPTION: by workspace].
  const group: PoolGroupBy =
    input.group === "client" && !input.clientsEnabled
      ? "workspace"
      : input.group;
  const byClient = group === "client";

  const query = input.query.trim();
  if (query) {
    const where = (row: PoolRowView, place: string) =>
      finish({ ...row, where: place });
    return {
      linearConnected,
      byClient,
      groups: [],
      search: {
        pool: pooled
          .filter((e) => matches(e.row, query))
          .map((e) => where(e.row, POOL_WORDS.inPool)),
        linear: loose
          .filter((e) => matches(e.row, query))
          .map((e) => where(e.row, POOL_WORDS.inLinear)),
        newItem: POOL_WORDS.newItem(query),
      },
      empty: false,
      sync: linearConnected
        ? syncWords(lastSyncedOf(input.linear!.connections), input.now)
        : null,
    };
  }

  // The Linear tab: issues not in the pool, and the placed ones faded with
  // their days [ASSUMPTION, from the phone's From Linear card].
  const tabEntries =
    input.tab === "linear" && linearConnected
      ? [
          ...loose,
          ...pooled.filter((e) => e.row.placed !== null && e.row.status),
        ].sort(compare)
      : pooled;
  const empty = input.tab === "pool" && pooled.length === 0;
  return {
    linearConnected,
    byClient,
    groups: empty
      ? []
      : groupEntries(tabEntries, group, input.clients, input.tab === "pool"),
    search: null,
    empty,
    sync: linearConnected
      ? syncWords(lastSyncedOf(input.linear!.connections), input.now)
      : null,
  };
}
