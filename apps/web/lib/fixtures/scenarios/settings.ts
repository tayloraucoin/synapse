import { noIntegrations } from "../integrations/records";
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

/**
 * Settings › Connections as drawn (USE-85; states/connections.md): clients
 * off, Personal and Lighthouse team on, Family and Holidays off, the two
 * workspaces "Connected" with ···.
 */
export function settingsConnectionsRecords(): FixtureRecords {
  const records = poolRecords();
  records.clientsEnabled = false;
  const integrations = records.integrations!;
  for (const calendar of integrations.googleCalendars) {
    if (calendar.id === INTEGRATION_IDS.calendars.family) {
      calendar.enabled = false;
    }
  }
  for (const { connection } of integrations.linear) {
    connection.lastSyncedAt = SETTINGS_LAST_SYNCED;
  }
  return records;
}

/** Nothing connected (states/empty.md): no account, no workspace, clients off. */
function settingsEmptyRecords(): FixtureRecords {
  const records = settingsConnectionsRecords();
  records.integrations = noIntegrations();
  records.workItems = records.workItems.map((item) => ({
    ...item,
    linearConnectionId: null,
    linearIssueId: null,
  }));
  return records;
}

function connections(
  name: string,
  extra: Partial<Scenario> = {},
  records: () => FixtureRecords = settingsConnectionsRecords,
): () => Scenario {
  return () => ({
    name,
    now: SET_UP_NOW,
    records: records(),
    mode: "ready",
    ...extra,
  });
}

export const SETTINGS_SCENARIOS: Record<string, () => Scenario> = {
  // ---- Settings › Connections (USE-85), at /settings/connections ----
  "settings-connections": connections("settings-connections"),
  "settings-empty": connections("settings-empty", {}, settingsEmptyRecords),
  "settings-loading": connections("settings-loading", {
    regions: { connections: "loading" },
  }),
  "settings-error": connections("settings-error", {
    regions: { calendars: "error" },
  }),
  /** Personal's next switch fails once: "Not saved. Try again." under it. */
  "settings-save-fails": connections("settings-save-fails", {
    failWrites: [INTEGRATION_IDS.calendars.personal],
  }),
  "settings-connecting": connections("settings-connecting", {
    connects: "hang",
    view: { open: "connecting:linear" },
  }),
  /** A Google connect came back failed; Try again connects. */
  "settings-connect-fails": connections("settings-connect-fails", {
    view: { open: "connect-failed:google" },
  }),
  "settings-offline": connections("settings-offline", { offline: true }),
  // ---- Clients on (USE-86) ----
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
