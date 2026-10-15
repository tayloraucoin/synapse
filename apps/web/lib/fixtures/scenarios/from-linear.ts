import {
  clientRecord,
  linearIssueSchema,
  linearProjectClientInput,
  type LinearIssue,
} from "@syn/validators";
import { fixtureId } from "../ids";
import {
  INTEGRATION_IDS,
  integrationRecords,
  issueId,
  PROJECTS,
  stateId,
  teamId,
  withIntegrations,
} from "../integrations/workspaces";
import type { FixtureRecords } from "../records";
import { ADD_IDS, addRecords } from "./add";
import type { Scenario } from "./index";
import { SET_UP_IDS, SET_UP_NOW } from "./set-up";

/**
 * From Linear, by size (USE-52; add/states/from-linear-by-size.md) on
 * USE-51's this week, at Sunday 21:10 in Set my days: Mon 12's Work runs
 * 9:30 to 12:00 and its Primary holds [Write the sync spec] (ENG-123, 30 min
 * that day) and [Review the Paper handoff] (no length), so ticking a 2 Small
 * and a 3 Medium runs Primary to 13:00 at the top of its ranges, past Work's
 * end; Secondary and Stretch hold an item each, so they wait. ENG-123 and
 * ENG-140 are already on Mon 12, faded. Clients on: Lighthouse (Sync engine
 * and Synapse), Kestrel (its workspace) and Alder (the Brand site), in that
 * order; SYN-224 has no estimate (30 min). Bracketed names are placeholders.
 */

const STAMP = "2026-10-01T12:00:00.000Z";

/** From Linear's ids count from 471, clear of Add's. */
const id = (table: number, n: number) => fixtureId(table, 470 + n);

export const SYNC_ENGINE = "project-sync-engine";

export const FROM_LINEAR_IDS = {
  clients: { lighthouse: id(5, 1) },
  /** The two the capture ticks: a 2 Small and a 3 Medium. */
  ticked: [issueId("ENG-151"), issueId("ENG-142")],
  syncSpec: issueId("ENG-123"),
  noEstimate: issueId("SYN-224"),
  monday: "2026-10-12",
  work: SET_UP_IDS.blocks.work,
} as const;

function engIssue(
  identifier: string,
  title: string,
  estimate: number,
): LinearIssue {
  return linearIssueSchema.parse({
    id: issueId(identifier),
    identifier,
    title,
    description: null,
    url: `https://linear.app/lighthouse/issue/${identifier}`,
    stateId: stateId("ENG", "Todo"),
    priority: 3,
    estimate,
    dueDate: null,
    labels: [],
    projectId: SYNC_ENGINE,
    teamId: teamId("ENG"),
    parentId: null,
    assignedToMe: true,
  });
}

export function fromLinearRecords(): FixtureRecords {
  const week = addRecords();
  const C = { ...ADD_IDS.clients, ...FROM_LINEAR_IDS.clients };
  const integrations = integrationRecords("2026-10-11T21:08:00.000Z");
  const CONN = INTEGRATION_IDS.connections;

  integrations.linear = integrations.linear.map(({ connection, snapshot }) => {
    if (connection.id === CONN.kestrel) {
      return { connection: { ...connection, clientId: C.kestrel }, snapshot };
    }
    const sync = new Set(["ENG-123", "ENG-140"]);
    return {
      connection: { ...connection, perProject: true },
      snapshot: {
        ...snapshot,
        projects: [
          {
            id: SYNC_ENGINE,
            name: "Sync engine",
            icon: "🔄",
            color: "#4ea7fc",
          },
          ...snapshot.projects,
        ],
        issues: [
          engIssue("ENG-151", "[Add retry queue metrics]", 2),
          engIssue("ENG-142", "[Flaky test in the sync suite]", 3),
          ...snapshot.issues.map((issue) =>
            sync.has(issue.identifier)
              ? { ...issue, projectId: SYNC_ENGINE }
              : issue,
          ),
        ],
      },
    };
  });
  integrations.projectClients = [
    [SYNC_ENGINE, C.lighthouse],
    [PROJECTS.synapse, C.lighthouse],
    [PROJECTS.brandSite, C.alder],
  ].map(([projectId, clientId]) =>
    linearProjectClientInput.parse({
      connectionId: CONN.lighthouse,
      projectId,
      clientId,
    }),
  );

  const records: FixtureRecords = {
    ...week,
    // ENG-123 holds 30 min of Monday's Primary.
    slots: week.slots.map((slot) =>
      slot.workItemId === SET_UP_IDS.workItems.syncSpec
        ? { ...slot, lengthMin: 30 }
        : slot,
    ),
    clients: [
      clientRecord.parse({
        id: C.lighthouse,
        name: "Lighthouse",
        colorKey: "slate",
        logoPath: null,
        archivedAt: null,
        sortOrder: 0,
        createdAt: STAMP,
        updatedAt: STAMP,
      }),
      ...week.clients.map((client) => ({
        ...client,
        sortOrder: client.sortOrder + 1,
      })),
    ],
  };
  return structuredClone(withIntegrations(records, integrations));
}

function fromLinear(
  name: string,
  mode: Scenario["mode"] = "ready",
): () => Scenario {
  return () => ({ name, now: SET_UP_NOW, records: fromLinearRecords(), mode });
}

export const FROM_LINEAR_SCENARIOS: Record<string, () => Scenario> = {
  /** The capture: two ticked, ENG-123 faded, the consequence line. */
  "from-linear-by-size": fromLinear("from-linear-by-size"),
  /** Nothing ticked: no line above Add. */
  "from-linear": fromLinear("from-linear"),
  /** The Size chip's choices open, Small and Medium picked. */
  "from-linear-size-filter": fromLinear("from-linear-size-filter"),
  /** A search that finds nothing. */
  "from-linear-no-match": fromLinear("from-linear-no-match"),
  "from-linear-loading": fromLinear("from-linear-loading", "loading"),
  "from-linear-error": fromLinear("from-linear-error", "error"),
};
