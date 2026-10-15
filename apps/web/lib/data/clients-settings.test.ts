import { describe, expect, it } from "vitest";
import { CLIENT_COLOR_KEYS } from "@syn/constants";
import {
  INTEGRATION_IDS,
  PROJECTS,
} from "@/lib/fixtures/integrations/workspaces";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { POOL_IDS } from "@/lib/fixtures/scenarios/pool";
import { SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";
import {
  clientCoverage,
  coverageLine,
  coverageWords,
  mappingLine,
  syncedAgo,
  workspaceMappings,
} from "./clients-settings";
import { clientOf } from "./integration-records";
import { groupPool } from "./pool-records";

/**
 * USE-86 C1: Settings' client writes on fixtures. Removing a client leaves
 * its work with no client (Personal) and Linear untouched; a project's
 * mapping regroups its work in the pool; the order set here is the one the
 * pool groups by (D-USE-96). Nothing reaches the outbox.
 */

const C = POOL_IDS.clients;
const W = POOL_IDS.workItems;
const KESTREL = INTEGRATION_IDS.connections.kestrel;
const LIGHTHOUSE = INTEGRATION_IDS.connections.lighthouse;

function setup() {
  return createFixtureServer(
    resolveScenario("settings-clients-on"),
    () => new Date(SET_UP_NOW),
  );
}

/** The pool as `usePool` groups it: through the mappings. */
async function poolOf(server: ReturnType<typeof setup>) {
  const [records, connections, linear] = await Promise.all([
    server.readPool(),
    server.readConnections(),
    server.readLinear(),
  ]);
  return groupPool(records, (item) => clientOf(connections, linear, item));
}

function groupOf(pool: Awaited<ReturnType<typeof poolOf>>, itemId: string) {
  return (
    pool.groups.find((g) => g.items.some((e) => e.item.id === itemId))?.client
      ?.id ?? null
  );
}

describe("C1: clients and their mappings on fixtures", () => {
  it("the scenario reads as drawn: two clients in order, Kestrel per project, Lighthouse Alder's", async () => {
    const server = setup();
    const [connections, linear] = await Promise.all([
      server.readConnections(),
      server.readLinear(),
    ]);
    const live = connections.clients.filter((c) => c.archivedAt === null);
    expect(live.map((c) => c.id)).toEqual([C.kestrel, C.alder]);
    const mappings = workspaceMappings(connections, linear);
    expect(mappings.map((m) => mappingLine(m, live))).toEqual([
      "Set per project · 2 projects for clients",
      "All projects belong to Alder Studio [placeholder]",
    ]);
    expect(
      live.map((c) => coverageWords(clientCoverage(mappings, c.id))),
    ).toEqual(["2 projects", "a workspace"]);
    expect(coverageLine(clientCoverage(mappings, C.kestrel))).toBe(
      "Kestrel Health [placeholder]: Patient portal [placeholder], Partnerships [placeholder]",
    );
  });

  it("removing Kestrel Health leaves its work with no client, under Personal, and writes no outbox row", async () => {
    const server = setup();
    const before = await poolOf(server);
    expect(groupOf(before, W.kes58)).toBe(C.kestrel);
    expect(groupOf(before, W.biz9)).toBe(C.kestrel);

    await server.writeClientArchived({ id: C.kestrel, archived: true });
    const after = await poolOf(server);
    expect(after.groups.map((g) => g.client?.id ?? null)).toEqual([
      C.alder,
      null,
    ]);
    expect(groupOf(after, W.kes58)).toBeNull();
    expect(groupOf(after, W.biz9)).toBeNull();
    // The work itself stays: nothing deleted, nothing archived.
    expect(after.items.map((e) => e.item.id)).toEqual(
      before.items.map((e) => e.item.id),
    );
    expect((await server.readLinear()).outbox).toEqual([]);

    // Undo brings it back with its mappings and its place in the order.
    await server.writeClientArchived({ id: C.kestrel, archived: false });
    const undone = await poolOf(server);
    expect(undone.groups[0]!.client?.id).toBe(C.kestrel);
    expect(groupOf(undone, W.kes58)).toBe(C.kestrel);
  });

  it("mapping Patient portal to Kestrel regroups its work under Kestrel; unmapped, it has no client", async () => {
    const server = setup();
    await server.writeProjectClient({
      connectionId: KESTREL,
      projectId: PROJECTS.patientPortal,
      clientId: null,
    });
    // A per-project workspace's unmapped project falls back to nothing.
    const unmapped = await poolOf(server);
    expect(groupOf(unmapped, W.kes58)).toBeNull();
    expect(groupOf(unmapped, W.biz9)).toBe(C.kestrel);

    await server.writeProjectClient({
      connectionId: KESTREL,
      projectId: PROJECTS.patientPortal,
      clientId: C.kestrel,
    });
    expect(groupOf(await poolOf(server), W.kes58)).toBe(C.kestrel);
    expect((await server.readLinear()).outbox).toEqual([]);
  });

  it("one client for a workspace maps every project; per project keeps the rows", async () => {
    const server = setup();
    await server.writeWorkspaceClient({
      connectionId: LIGHTHOUSE,
      clientId: C.kestrel,
      perProject: false,
    });
    expect(groupOf(await poolOf(server), W.ald21)).toBe(C.kestrel);
    await server.writeWorkspaceClient({
      connectionId: LIGHTHOUSE,
      clientId: null,
      perProject: true,
    });
    // Lighthouse's projects have no rows: per project, its work is no one's.
    expect(groupOf(await poolOf(server), W.ald21)).toBeNull();
    expect((await server.readLinear()).outbox).toEqual([]);
  });

  it("an order set here is the order readPool groups by, and the clients read in it", async () => {
    const server = setup();
    await server.setClientOrder({ ids: [C.alder, C.kestrel] });
    const pool = groupPool(await server.readPool());
    expect(pool.groups.map((g) => g.client?.id ?? null).slice(0, 2)).toEqual([
      C.alder,
      C.kestrel,
    ]);
    const { clients } = await server.readConnections();
    expect(
      clients.filter((c) => c.archivedAt === null).map((c) => c.id),
    ).toEqual([C.alder, C.kestrel]);
    expect((await server.readLinear()).outbox).toEqual([]);
  });

  it("a new client goes last; only the six colours are taken", async () => {
    const server = setup();
    const made = await server.writeClient({
      name: "Harbor",
      colorKey: "leaf",
      sortOrder: 3,
    });
    const { clients } = await server.readConnections();
    expect(clients.filter((c) => c.archivedAt === null).at(-1)?.id).toBe(
      made.id,
    );
    expect([...CLIENT_COLOR_KEYS]).toEqual([
      "rose",
      "leaf",
      "amber",
      "moss",
      "slate",
      "ink",
    ]);
    for (const reserved of ["sky", "plum", "clay"]) {
      await expect(
        server.writeClient({
          name: "Harbor",
          colorKey: reserved as "rose",
          sortOrder: 4,
        }),
      ).rejects.toThrow();
    }
    expect((await server.readLinear()).outbox).toEqual([]);
  });

  it("the sync line is a time", () => {
    const now = new Date("2026-10-12T01:10:00.000Z");
    expect(syncedAgo("2026-10-12T01:08:00.000Z", now)).toBe("synced 2 min ago");
    expect(syncedAgo(null, now)).toBe("not synced yet");
  });
});
