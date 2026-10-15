import type { LinearSnapshotPayload, WorkItemRecord } from "@syn/validators";
import { noIntegrations } from "../integrations/records";
import {
  issueId,
  PROJECTS,
  stateId,
  teamId,
  withIntegrations,
} from "../integrations/workspaces";
import type { FixtureRecords } from "../records";
import { POOL_IDS } from "./pool";

/**
 * The desk's pool panel (USE-74) on the Week's records: the rows the
 * Priority board draws (priority-lens-1728.png). The pool's items take the
 * board's names and marks, and the Week's own items are linked to their
 * issues; the pool's second ALD-17 and SYN-212 go, so each ID is one item.
 * Kestrel's teams and projects take the board's emoji, and KES-71 waits in
 * Linear, not in the pool. Bracketed names are the boards' placeholders.
 */

/** Two minutes before WEEK_NOW (Monday 12 Oct, 9:10 in Toronto). */
export const POOL_PANEL_SYNCED = "2026-10-12T13:08:00.000Z";

const W = POOL_IDS.workItems;
const emoji = (value: string) => ({ kind: "emoji" as const, value });

/** The pool's items as the board names them. */
const BOARD_ITEMS: Record<string, Partial<WorkItemRecord>> = {
  [W.kes58]: { title: "[Audit log export]", icon: emoji("📤"), size: "large" },
  [W.kes63]: {
    title: "[Session timeout copy]",
    icon: emoji("🔐"),
    size: "quick",
  },
  [W.biz9]: {
    title: "[Partner deck refresh]",
    icon: emoji("📊"),
    size: "small",
  },
  [W.ald21]: {
    title: "[Homepage hero copy]",
    icon: emoji("🦸"),
    size: "quick",
  },
  [W.syn218]: {
    title: "[Calendar connection settings]",
    icon: emoji("📅"),
    size: "huge",
  },
  [W.synapseOnly]: {
    title: "[Tidy the client files folder]",
    icon: emoji("🧹"),
    size: "small",
    clientId: POOL_IDS.clients.personal,
  },
};

/** The board's issue marks: priority (1 Urgent, 2 High, 3 Normal), labels, due. */
const BOARD_ISSUES: Record<
  string,
  { title: string; priority: number; labels: string[]; dueDate?: string }
> = {
  "KES-58": {
    title: "[Audit log export]",
    priority: 2,
    labels: ["Compliance"],
    dueDate: "2026-10-14",
  },
  "KES-63": {
    title: "[Session timeout copy]",
    priority: 1,
    labels: ["Copy"],
    dueDate: "2026-10-12",
  },
  "BIZ-9": { title: "[Partner deck refresh]", priority: 3, labels: ["Docs"] },
  "ALD-21": { title: "[Homepage hero copy]", priority: 3, labels: ["Copy"] },
  "SYN-218": {
    title: "[Calendar connection settings]",
    priority: 2,
    labels: [],
  },
};

const LABEL_COLOURS: Record<string, string> = {
  Compliance: "#eb5757",
  Copy: "#bb87fc",
  Docs: "#95a2b3",
};

function boardSnapshot(
  payload: LinearSnapshotPayload,
  kestrel: boolean,
): LinearSnapshotPayload {
  const issues = payload.issues.map((issue) => {
    const board = BOARD_ISSUES[issue.identifier];
    const patched = board
      ? {
          ...issue,
          title: board.title,
          priority: board.priority,
          dueDate: board.dueDate ?? null,
          labels: board.labels.map((name) => ({
            name,
            color: LABEL_COLOURS[name] ?? "#95a2b3",
          })),
        }
      : issue;
    // KES-51 is open again here: its work item is placed on Monday and Tuesday.
    return issue.identifier === "KES-51"
      ? { ...patched, stateId: stateId("KES", "Todo") }
      : patched;
  });
  if (!kestrel) {
    return {
      ...payload,
      issues,
      projects: payload.projects.map((p) =>
        p.id === PROJECTS.brandSite ? { ...p, icon: "🎨" } : p,
      ),
    };
  }
  const extra = (
    identifier: string,
    title: string,
    estimate: number | null,
  ) => ({
    id: issueId(identifier),
    identifier,
    title,
    description: null,
    url: `https://linear.app/kestrel/issue/${identifier}`,
    stateId: stateId("KES", "Todo"),
    priority: 3,
    estimate,
    dueDate: null,
    labels: [],
    projectId: PROJECTS.patientPortal,
    teamId: teamId("KES"),
    parentId: null,
    assignedToMe: true,
  });
  return {
    ...payload,
    issues: [
      ...issues,
      extra("KES-60", "[Audit notes]", 2),
      // Not in the pool: the add popover's "KES-71 · unsized".
      extra("KES-71", "[Audit trail retention]", null),
    ],
    teams: payload.teams.map((t) => ({
      ...t,
      icon: t.key === "KES" ? "💻" : t.key === "BIZ" ? "💼" : t.icon,
    })),
    projects: payload.projects.map((p) =>
      p.id === PROJECTS.patientPortal ? { ...p, icon: "🏥" } : p,
    ),
  };
}

/** The Week's records with the board's pool; Linear synced two minutes ago. */
export function poolPanelRecords(week: FixtureRecords): FixtureRecords {
  const integrations = structuredClone(week.integrations ?? noIntegrations());
  integrations.linear = integrations.linear.map(({ connection, snapshot }) => ({
    connection: { ...connection, lastSyncedAt: POOL_PANEL_SYNCED },
    snapshot: boardSnapshot(snapshot, connection.urlKey === "kestrel"),
  }));
  const dropped = new Set<string>([W.ald17, W.syn212]);
  const workItems = week.workItems
    .filter((item) => !dropped.has(item.id))
    .map((item) => ({
      ...item,
      ...BOARD_ITEMS[item.id],
      // Unlinked, so withIntegrations links each by its identifier.
      linearConnectionId: null,
      linearIssueId: null,
    }));
  return withIntegrations(
    {
      ...week,
      workItems,
      slots: week.slots.filter(
        (slot) => slot.workItemId === null || !dropped.has(slot.workItemId),
      ),
    },
    integrations,
  );
}

/** Nothing waits in the pool: every work item and its sessions gone. */
export function emptyPoolRecords(week: FixtureRecords): FixtureRecords {
  return {
    ...poolPanelRecords(week),
    workItems: [],
    slots: week.slots.filter((slot) => slot.workItemId === null),
  };
}

/** Linear not connected (D-USE-101): no Linear tab and no sync line. */
export function linearOffRecords(week: FixtureRecords): FixtureRecords {
  const records = poolPanelRecords(week);
  return {
    ...records,
    workItems: records.workItems.map((item) => ({
      ...item,
      linearConnectionId: null,
      linearIssueId: null,
    })),
    integrations: {
      ...noIntegrations(),
      googleAccounts: records.integrations?.googleAccounts ?? [],
      googleCalendars: records.integrations?.googleCalendars ?? [],
    },
  };
}
