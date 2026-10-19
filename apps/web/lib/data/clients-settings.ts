import type { ClientRecord, LinearConnectionView } from "@syn/validators";
import type { ConnectionsRecords, LinearRecords } from "./integration-records";

/**
 * What Settings › Connections says about clients (USE-86), derived from the
 * connections and Linear reads, never stored: what each client covers, each
 * workspace's mapping line and its sheet's project rows. The counts are of
 * projects in Settings, never of the day.
 */

export interface WorkspaceProject {
  id: string;
  name: string;
  /** Linear's project emoji; null draws none. */
  icon: string | null;
  /** The project's client in a per-project workspace; null is no client. */
  clientId: string | null;
}

export interface WorkspaceMapping {
  connection: LinearConnectionView;
  projects: WorkspaceProject[];
}

/** Each connected workspace with its projects and their clients. */
export function workspaceMappings(
  connections: ConnectionsRecords,
  linear: LinearRecords | undefined,
): WorkspaceMapping[] {
  const live = new Set(
    connections.clients.filter((c) => c.archivedAt === null).map((c) => c.id),
  );
  return connections.linear.map((connection) => {
    const payload = linear?.workspaces.find(
      (w) => w.connectionId === connection.id,
    )?.payload;
    return {
      connection,
      projects: (payload?.projects ?? []).map((project) => {
        const mapped =
          connections.projectClients.find(
            (row) =>
              row.connectionId === connection.id &&
              row.projectId === project.id,
          )?.clientId ?? null;
        return {
          id: project.id,
          name: project.name,
          icon: project.icon,
          // A removed client's projects read as no client (resolveClient's rule).
          clientId: mapped !== null && live.has(mapped) ? mapped : null,
        };
      }),
    };
  });
}

/** The workspace row's line with clients on (D-USE-91). */
export function mappingLine(
  mapping: WorkspaceMapping,
  clients: readonly ClientRecord[],
): string {
  const { connection, projects } = mapping;
  if (connection.perProject) {
    const mapped = projects.filter((p) => p.clientId !== null).length;
    return `Set per project · ${mapped} ${mapped === 1 ? "project" : "projects"} for clients`;
  }
  const client = clients.find(
    (c) => c.id === connection.clientId && c.archivedAt === null,
  );
  // [ASSUMPTION] A one-client workspace with none picked reads as unmapped.
  return client
    ? `All projects belong to ${client.name}`
    : "No client · its work shows under Personal";
}

export interface ClientCoverage {
  /** One-client workspaces that are this client's. */
  workspaces: WorkspaceMapping[];
  /** Projects in per-project workspaces mapped to this client. */
  projects: { workspace: string; name: string }[];
}

export function clientCoverage(
  mappings: readonly WorkspaceMapping[],
  clientId: string,
): ClientCoverage {
  return {
    workspaces: mappings.filter(
      (m) => !m.connection.perProject && m.connection.clientId === clientId,
    ),
    projects: mappings.flatMap((m) =>
      m.connection.perProject
        ? m.projects
            .filter((p) => p.clientId === clientId)
            .map((p) => ({
              workspace: m.connection.organizationName,
              name: p.name,
            }))
        : [],
    ),
  };
}

/** The client row's right-hand words: "2 projects", "a workspace". */
export function coverageWords(coverage: ClientCoverage): string {
  const parts: string[] = [];
  const w = coverage.workspaces.length;
  if (w > 0) parts.push(w === 1 ? "a workspace" : `${w} workspaces`);
  const p = coverage.projects.length;
  if (p > 0) parts.push(p === 1 ? "1 project" : `${p} projects`);
  // [ASSUMPTION] A client nothing maps to says so; its work is set item by item.
  return parts.length === 0 ? "No projects yet" : parts.join(" and ");
}

/** The client sheet's Linear row: "Lighthouse: Patient portal, Records import". */
export function coverageLine(coverage: ClientCoverage): string {
  const byWorkspace = new Map<string, string[]>();
  for (const { workspace, name } of coverage.projects) {
    byWorkspace.set(workspace, [...(byWorkspace.get(workspace) ?? []), name]);
  }
  const lines = [
    // [ASSUMPTION] A whole workspace reads as its name and "all projects".
    ...coverage.workspaces.map(
      (m) => `${m.connection.organizationName}: all projects`,
    ),
    ...[...byWorkspace].map(([workspace, names]) =>
      [workspace, names.join(", ")].join(": "),
    ),
  ];
  return lines.length === 0 ? "None yet" : lines.join("; ");
}

/** The first of the six not yet taken, for a new client (rose when all are). */
export function firstFreeColour(
  clients: readonly ClientRecord[],
  keys: readonly ClientRecord["colorKey"][],
): ClientRecord["colorKey"] {
  const taken = new Set(
    clients.filter((c) => c.archivedAt === null).map((c) => c.colorKey),
  );
  return keys.find((key) => !taken.has(key)) ?? keys[0]!;
}

/** "synced 2 min ago": a time, live. */
export function syncedAgo(lastSyncedAt: string | null, now: Date): string {
  if (lastSyncedAt === null) return "not synced yet";
  const min = Math.max(
    0,
    Math.floor((now.getTime() - Date.parse(lastSyncedAt)) / 60_000),
  );
  if (min < 1) return "synced just now";
  if (min < 60) return `synced ${min} min ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `synced ${hours} h ago`;
  return `synced ${Math.floor(hours / 24)} d ago`;
}
