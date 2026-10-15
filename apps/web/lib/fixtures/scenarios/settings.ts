import { INTEGRATION_IDS, PROJECTS } from "../integrations/workspaces";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { POOL_IDS, poolRecords } from "./pool";
import { SET_UP_NOW } from "./set-up";

/**
 * Settings › Connections with clients on (USE-86), on the pool's week at
 * 21:10. Two clients, Kestrel Health and Alder Studio; the pool's Personal
 * client is removed (archived), since work with no client already shows
 * under Personal. Kestrel's workspace is set per project, both its projects
 * Kestrel's; Lighthouse is one client, Alder's. A linked item's own client
 * is cleared, so its client comes from the mapping, as a placed issue's does.
 * `view.open` opens a sheet: "client:<id>" or "workspace:<connection id>".
 */

const C = POOL_IDS.clients;

/** Two minutes before the scenario's 21:10: "synced 2 min ago". */
const SETTINGS_LAST_SYNCED = "2026-10-12T01:08:00.000Z";

export function settingsClientsRecords(): FixtureRecords {
  const records = poolRecords();
  records.clientsEnabled = true;
  records.clients = records.clients.map((client) =>
    client.id === C.personal
      ? { ...client, archivedAt: SETTINGS_LAST_SYNCED }
      : client,
  );
  records.workItems = records.workItems.map((item) =>
    item.linearConnectionId === null ? item : { ...item, clientId: null },
  );
  const integrations = records.integrations!;
  const [kestrel, lighthouse] = integrations.linear;
  kestrel!.connection.perProject = true;
  kestrel!.connection.clientId = null;
  lighthouse!.connection.perProject = false;
  lighthouse!.connection.clientId = C.alder;
  for (const { connection } of integrations.linear) {
    connection.lastSyncedAt = SETTINGS_LAST_SYNCED;
  }
  integrations.projectClients = [
    PROJECTS.patientPortal,
    PROJECTS.partnerships,
  ].map((projectId) => ({
    connectionId: kestrel!.connection.id,
    projectId,
    clientId: C.kestrel,
  }));
  return records;
}

function scenario(name: string, open?: string): () => Scenario {
  return () => ({
    name,
    now: SET_UP_NOW,
    records: settingsClientsRecords(),
    mode: "ready",
    ...(open === undefined ? {} : { view: { open } }),
  });
}

export const SETTINGS_SCENARIOS: Record<string, () => Scenario> = {
  "settings-clients-on": scenario("settings-clients-on"),
  "settings-client-sheet": scenario(
    "settings-client-sheet",
    `client:${C.kestrel}`,
  ),
  "settings-workspace-sheet": scenario(
    "settings-workspace-sheet",
    `workspace:${INTEGRATION_IDS.connections.kestrel}`,
  ),
};
