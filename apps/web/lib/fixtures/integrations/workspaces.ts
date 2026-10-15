import {
  googleAccountView,
  googleCalendarView,
  linearConnectionView,
  linearSnapshotPayload,
  type LinearIssue,
  type LinearSnapshotPayload,
  type LinearWorkflowState,
  type WorkItemRecord,
} from "@syn/validators";
import type { FixtureRecords } from "../records";
import { noIntegrations, type IntegrationRecords } from "./records";

/**
 * The one Linear snapshot and the Google account (USE-56; USE-52 reads the
 * same snapshot through `useLinearIssues`). Two workspaces: Kestrel Health
 * (Product Engineering and Business Development; Patient portal and
 * Partnerships) and Taylor's own, Lighthouse (Brand site and Synapse), each
 * team on Lighthouse's workflow. There is an issue for every placeholder in
 * the pool and on Today, and a few assigned ones with no work item yet (not
 * in the pool). The colours are Linear's own data; the screens draw a status
 * through `LinearStatusShape`, never a token named for it.
 */

/** Fixed UUIDs for rows Linear and Google own here: 1 connections, 2 accounts, 3 calendars. */
export function integrationId(kind: number, n: number): string {
  return `00000000-0000-4000-9000-${kind}${String(n).padStart(11, "0")}`;
}

export const INTEGRATION_IDS = {
  connections: {
    kestrel: integrationId(1, 1),
    lighthouse: integrationId(1, 2),
  },
  googleAccount: integrationId(2, 1),
  calendars: {
    personal: integrationId(3, 1),
    team: integrationId(3, 2),
    family: integrationId(3, 3),
    holidays: integrationId(3, 4),
  },
} as const;

const CONN = INTEGRATION_IDS.connections;

/** Lighthouse's workflow, by group, in Linear's order. */
const WORKFLOW = [
  ["Backlog", "backlog", "#bec2c8"],
  ["Blocked", "unstarted", "#eb5757"],
  ["Todo", "unstarted", "#e2e2e2"],
  ["Up next", "unstarted", "#5e6ad2"],
  ["In progress", "started", "#f2c94c"],
  ["Ongoing", "started", "#4cb782"],
  ["Paused", "started", "#95a2b3"],
  ["In review", "started", "#26b5ce"],
  ["Changes requested", "started", "#f2994a"],
  ["Done", "completed", "#5e6ad2"],
  ["Canceled", "canceled", "#95a2b3"],
  ["Duplicate", "duplicate", "#95a2b3"],
] as const;

export type WorkflowName = (typeof WORKFLOW)[number][0];

export const teamId = (key: string) => `team-${key}`;

export function stateId(teamKey: string, name: WorkflowName): string {
  return `state-${teamKey}-${name.toLowerCase().replaceAll(" ", "-")}`;
}

export const issueId = (identifier: string) => `issue-${identifier}`;

function workflow(teamKey: string): LinearWorkflowState[] {
  return WORKFLOW.map(([name, type, color], position) => ({
    id: stateId(teamKey, name),
    name,
    type,
    position,
    color,
    teamId: teamId(teamKey),
  }));
}

interface IssueSeed {
  identifier: string;
  title: string;
  state: WorkflowName;
  project: string | null;
  priority?: number;
  estimate?: number | null;
  labels?: string[];
  dueDate?: string;
  description?: string;
  parent?: string;
}

const LABEL_COLOURS: Record<string, string> = {
  Frontend: "#4ea7fc",
  Backend: "#bb87fc",
  Copy: "#f2994a",
  Bug: "#eb5757",
};

function issue(urlKey: string, seed: IssueSeed): LinearIssue {
  const teamKey = seed.identifier.split("-")[0]!;
  return {
    id: issueId(seed.identifier),
    identifier: seed.identifier,
    title: seed.title,
    description: seed.description ?? null,
    url: `https://linear.app/${urlKey}/issue/${seed.identifier}`,
    stateId: stateId(teamKey, seed.state),
    priority: seed.priority ?? 3,
    estimate: seed.estimate ?? null,
    dueDate: seed.dueDate ?? null,
    labels: (seed.labels ?? []).map((name) => ({
      name,
      color: LABEL_COLOURS[name] ?? "#95a2b3",
    })),
    projectId: seed.project,
    teamId: teamId(teamKey),
    parentId: seed.parent === undefined ? null : issueId(seed.parent),
    assignedToMe: true,
  };
}

function snapshot(
  urlKey: string,
  teams: [key: string, name: string][],
  projects: [id: string, name: string, icon: string, color: string][],
  issues: IssueSeed[],
): LinearSnapshotPayload {
  const all = issues.map((seed) => issue(urlKey, seed));
  return linearSnapshotPayload.parse({
    issues: all.filter((row) => row.parentId === null),
    subIssues: all.filter((row) => row.parentId !== null),
    teams: teams.map(([key, name]) => ({
      id: teamId(key),
      key,
      name,
      icon: null,
    })),
    projects: projects.map(([id, name, icon, color]) => ({
      id,
      name,
      icon,
      color,
    })),
    states: teams.flatMap(([key]) => workflow(key)),
  });
}

export const PROJECTS = {
  patientPortal: "project-patient-portal",
  partnerships: "project-partnerships",
  brandSite: "project-brand-site",
  synapse: "project-synapse",
} as const;

const P = PROJECTS;

function kestrelSnapshot(): LinearSnapshotPayload {
  return snapshot(
    "kestrel",
    [
      ["KES", "Product Engineering"],
      ["BIZ", "Business Development"],
    ],
    [
      [P.patientPortal, "Patient portal [placeholder]", "🩺", "#4ea7fc"],
      [P.partnerships, "Partnerships [placeholder]", "🤝", "#4cb782"],
    ],
    [
      {
        identifier: "KES-41",
        title: "Portal sign-in redirect",
        state: "Done",
        project: P.patientPortal,
        priority: 2,
        estimate: 2,
      },
      {
        identifier: "KES-42",
        title: "Portal sign-in",
        state: "In progress",
        project: P.patientPortal,
        priority: 2,
        estimate: 3,
        labels: ["Frontend"],
        description: "Email and password, then the verify step.",
      },
      {
        identifier: "KES-51",
        title: "[Portal sign-in copy]",
        state: "Done",
        project: P.patientPortal,
        estimate: 2,
        labels: ["Copy"],
      },
      {
        identifier: "KES-58",
        title: "[Patient intake form]",
        state: "Todo",
        project: P.patientPortal,
        priority: 1,
        estimate: 3,
        labels: ["Frontend"],
        dueDate: "2026-10-15",
        description:
          "[The intake form's fields, from the clinic's paper form.]",
      },
      {
        identifier: "KES-63",
        title: "[Appointment reminders]",
        state: "Up next",
        project: P.patientPortal,
        estimate: 2,
        labels: ["Backend"],
      },
      {
        identifier: "KES-66",
        title: "[Records import mapping]",
        state: "Todo",
        project: P.patientPortal,
        estimate: 5,
      },
      {
        identifier: "BIZ-9",
        title: "[Partnership one-pager]",
        state: "Todo",
        project: P.partnerships,
        estimate: 1,
      },
      {
        identifier: "BIZ-11",
        title: "[Partner FAQ]",
        state: "In review",
        project: P.partnerships,
        estimate: 1,
      },
    ],
  );
}

function lighthouseSnapshot(): LinearSnapshotPayload {
  return snapshot(
    "lighthouse",
    [
      ["ALD", "Alder"],
      ["HAR", "Harbor"],
      ["SYN", "Synapse"],
      ["ENG", "Engineering"],
    ],
    [
      [P.brandSite, "Brand site [placeholder]", "🌿", "#f2c94c"],
      [P.synapse, "Synapse", "🧠", "#bb87fc"],
    ],
    [
      {
        identifier: "ALD-9",
        title: "[Old landing page]",
        state: "Canceled",
        project: P.brandSite,
      },
      {
        identifier: "ALD-17",
        title: "[Brand site case studies]",
        state: "In progress",
        project: P.brandSite,
        estimate: 5,
      },
      {
        identifier: "ALD-21",
        title: "[Brand site footer]",
        state: "Todo",
        project: P.brandSite,
        estimate: 2,
        labels: ["Frontend"],
      },
      {
        identifier: "HAR-17",
        title: "Invoice export",
        state: "Todo",
        project: null,
        priority: 2,
        estimate: 2,
        labels: ["Backend"],
      },
      {
        identifier: "SYN-212",
        title: "[Synapse: desk Today layout]",
        state: "In review",
        project: P.synapse,
        estimate: 5,
        labels: ["Frontend"],
      },
      {
        identifier: "SYN-218",
        title: "[Synapse: offline sync]",
        state: "In progress",
        project: P.synapse,
        priority: 2,
        estimate: 8,
        labels: ["Backend"],
      },
      {
        identifier: "SYN-219",
        title: "[Synapse: replay the outbox]",
        state: "Todo",
        project: P.synapse,
        estimate: 3,
        parent: "SYN-218",
      },
      {
        identifier: "SYN-224",
        title: "[Synapse: calendar bands]",
        state: "Backlog",
        project: P.synapse,
        estimate: null,
        priority: 0,
      },
      {
        identifier: "ENG-123",
        title: "[Write the sync spec]",
        state: "In progress",
        project: null,
        estimate: 3,
      },
      {
        identifier: "ENG-140",
        title: "[Fix the retry backoff]",
        state: "Todo",
        project: null,
        estimate: 1,
        labels: ["Bug"],
      },
    ],
  );
}

/**
 * Both workspaces connected (clients unmapped), and the Google account with
 * four calendars, Holidays off. `lastSyncedAt` is the scenario's.
 */
export function integrationRecords(lastSyncedAt: string): IntegrationRecords {
  const connection = (id: string, organizationName: string, urlKey: string) =>
    linearConnectionView.parse({
      id,
      organizationName,
      urlKey,
      logoUrl: null,
      clientId: null,
      perProject: false,
      lastSyncedAt,
      lastSyncError: null,
    });
  const C = INTEGRATION_IDS.calendars;
  return {
    ...noIntegrations(),
    linear: [
      {
        connection: connection(
          CONN.kestrel,
          "Kestrel Health [placeholder]",
          "kestrel",
        ),
        snapshot: kestrelSnapshot(),
      },
      {
        connection: connection(
          CONN.lighthouse,
          "Lighthouse [placeholder]",
          "lighthouse",
        ),
        snapshot: lighthouseSnapshot(),
      },
    ],
    googleAccounts: [
      googleAccountView.parse({
        id: INTEGRATION_IDS.googleAccount,
        email: "taylor@example.com",
        label: "Personal [placeholder]",
      }),
    ],
    googleCalendars: [
      [C.personal, "Personal [placeholder]", "#7986cb", true, true],
      [C.team, "Lighthouse team [placeholder]", "#33b679", false, true],
      [C.family, "Family [placeholder]", "#e67c73", false, true],
      [C.holidays, "Holidays [placeholder]", "#0b8043", false, false],
    ].map(([id, name, color, primary, enabled]) =>
      googleCalendarView.parse({
        id,
        accountId: INTEGRATION_IDS.googleAccount,
        name,
        color,
        primary,
        enabled,
      }),
    ),
  };
}

/**
 * Links each work item whose identifier is an issue in a connected
 * workspace (0012's two columns), as placing that issue did. An item with no
 * identifier stays Synapse-only.
 */
export function withIntegrations(
  records: FixtureRecords,
  integrations: IntegrationRecords,
): FixtureRecords {
  const link = (item: WorkItemRecord): WorkItemRecord => {
    for (const { connection, snapshot: payload } of integrations.linear) {
      const found = [...payload.issues, ...payload.subIssues].find(
        (row) => row.identifier === item.linearIdentifier,
      );
      if (found) {
        return {
          ...item,
          linearConnectionId: connection.id,
          linearIssueId: found.id,
        };
      }
    }
    return item;
  };
  return {
    ...records,
    workItems: records.workItems.map(link),
    integrations,
  };
}
