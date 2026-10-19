import { issueId, PROJECTS } from "../integrations/workspaces";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { POOL_IDS, poolRecords } from "./pool";
import { SET_UP_NOW } from "./set-up";

/**
 * Linear, Google and clients on the pool's week (USE-56). The pool scenario
 * itself carries both workspaces, Lighthouse set per project; these change
 * one thing each. In the clients ones a linked item's own client is cleared,
 * so its client comes from the workspace, as a placed issue's does.
 */

const C = POOL_IDS.clients;

function fromWorkspaces(records: FixtureRecords): FixtureRecords {
  return {
    ...records,
    clientsEnabled: true,
    workItems: records.workItems.map((item) =>
      item.linearConnectionId === null ? item : { ...item, clientId: null },
    ),
  };
}

function scenario(
  name: string,
  records: FixtureRecords,
  extra: Partial<Scenario> = {},
): Scenario {
  return { name, now: SET_UP_NOW, records, mode: "ready", ...extra };
}

export const INTEGRATION_SCENARIOS: Record<string, () => Scenario> = {
  /** No workspace connected: every item is Synapse-only; Google stays. */
  "linear-off": () => {
    const records = poolRecords();
    records.integrations!.linear = [];
    records.integrations!.projectClients = [];
    records.workItems = records.workItems.map((item) => ({
      ...item,
      linearConnectionId: null,
      linearIssueId: null,
    }));
    return scenario("linear-off", records);
  },
  /** Each Linear write's first send fails; Try again sends it. */
  "linear-write-fails": () =>
    scenario("linear-write-fails", poolRecords(), { linearSends: "fail" }),
  /** The next sync finds KES-58 closed in Linear. */
  "linear-closed": () =>
    scenario("linear-closed", poolRecords(), {
      linearClosesOnSync: [issueId("KES-58")],
    }),
  /** Clients on, each workspace one client: Kestrel's, and Lighthouse Alder's. */
  "clients-on": () => {
    const records = fromWorkspaces(poolRecords());
    const [kestrel, lighthouse] = records.integrations!.linear;
    kestrel!.connection.clientId = C.kestrel;
    lighthouse!.connection.perProject = false;
    lighthouse!.connection.clientId = C.alder;
    records.integrations!.projectClients = [];
    return scenario("clients-on", records);
  },
  /** Clients on, Lighthouse per project: Brand site is Alder's, Synapse is unmapped. */
  "clients-per-project": () => {
    const records = fromWorkspaces(poolRecords());
    const lighthouse = records.integrations!.linear[1]!.connection;
    records.integrations!.projectClients = [
      {
        connectionId: lighthouse.id,
        projectId: PROJECTS.brandSite,
        clientId: C.alder,
      },
    ];
    return scenario("clients-per-project", records);
  },
};
