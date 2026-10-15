import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  googleAccountView,
  googleCalendarView,
  linearConnectionView,
  linearProjectClientInput,
  linearSnapshotPayload,
  linearWriteView,
} from "@syn/validators";
import { LINEAR_SEND_MS } from "@/lib/fixtures/integrations";
import { issueId, stateId } from "@/lib/fixtures/integrations/workspaces";
import { resolveScenario, scenarioNames } from "@/lib/fixtures/scenarios";
import { BASE_IDS, BASE_NOW } from "@/lib/fixtures/scenarios/base-day";
import { POOL_IDS } from "@/lib/fixtures/scenarios/pool";
import { SET_UP_IDS, SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";
import { clientOf, joinIssue } from "./integration-records";

const W = POOL_IDS.workItems;
const C = POOL_IDS.clients;

function setup(name: string, now = SET_UP_NOW) {
  return createFixtureServer(resolveScenario(name), () => new Date(now));
}

/** Every key anywhere in a value, objects and arrays walked. */
function keysOf(value: unknown, into: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const entry of value) keysOf(entry, into);
  } else if (value !== null && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      into.push(key);
      keysOf(entry, into);
    }
  }
  return into;
}

const CREDENTIAL = /token|secret|cipher|password/i;

async function itemOf(server: ReturnType<typeof setup>, id: string) {
  const { workItems } = await server.readToday("2026-10-12");
  return workItems.find((item) => item.id === id)!;
}

describe("C1: every Linear and Google fixture parses, and nothing returned carries a token", () => {
  const withIntegrations = scenarioNames().filter(
    (name) => resolveScenario(name).records.integrations !== undefined,
  );

  it("covers the default and the integration scenarios", () => {
    expect(withIntegrations).toEqual(
      expect.arrayContaining([
        "default",
        "pool",
        "linear-off",
        "linear-write-fails",
        "linear-closed",
        "clients-on",
        "clients-per-project",
      ]),
    );
  });

  it.each(withIntegrations)("%s parses with USE-32's view schemas", (name) => {
    const data = resolveScenario(name).records.integrations!;
    for (const { connection, snapshot } of data.linear) {
      expect(linearConnectionView.parse(connection)).toEqual(connection);
      expect(linearSnapshotPayload.parse(snapshot)).toEqual(snapshot);
    }
    for (const row of data.projectClients) {
      expect(linearProjectClientInput.parse(row)).toEqual(row);
    }
    for (const account of data.googleAccounts) {
      expect(googleAccountView.parse(account)).toEqual(account);
    }
    for (const calendar of data.googleCalendars) {
      expect(googleCalendarView.parse(calendar)).toEqual(calendar);
    }
  });

  it.each(withIntegrations)(
    "%s: no read or join has a credential key",
    async (name) => {
      const server = setup(name);
      const linear = await server.readLinear();
      const connections = await server.readConnections();
      const { workItems } = resolveScenario(name).records;
      const joins = workItems.map((item) => joinIssue(linear, item));
      const clients = workItems.map((item) =>
        clientOf(connections, linear, item),
      );
      const keys = keysOf([linear, connections, joins, clients]);
      expect(keys.length).toBeGreaterThan(0);
      expect(keys.filter((key) => CREDENTIAL.test(key))).toEqual([]);
    },
  );

  it("an outbox row reads back as the view alone", async () => {
    const server = setup("pool");
    await server.writeLinearIssue({ workItemId: W.kes63, priority: 1 });
    const [row] = (await server.readLinear()).outbox;
    expect(Object.keys(row!).sort()).toEqual(
      Object.keys(linearWriteView.shape).sort(),
    );
  });
});

describe("C2: useLinear's join gives a linked item its issue, and a Synapse-only item none", () => {
  it("joins Portal sign-in to KES-42 with everything the rows draw", async () => {
    const server = setup("default", BASE_NOW);
    const linear = await server.readLinear();
    const join = joinIssue(
      linear,
      await itemOf(server, BASE_IDS.workItems.primary),
    );
    expect(join).toMatchObject({
      identifier: "KES-42",
      title: "Portal sign-in",
      priority: 2,
      estimate: 3,
      labels: [{ name: "Frontend" }],
      description: "Email and password, then the verify step.",
      url: "https://linear.app/kestrel/issue/KES-42",
      project: { name: "Patient portal [placeholder]" },
      team: { key: "KES", name: "Product Engineering" },
      write: null,
    });
    // In progress is the first of five started: 1 / 6, and it starts the timer.
    expect(join!.status.state.name).toBe("In progress");
    expect(join!.status.fill).toBeCloseTo(1 / 6);
    expect(join!.status.effect).toBe("start");
  });

  it("a Done issue is full and checks; In review waits", async () => {
    const server = setup("pool");
    const linear = await server.readLinear();
    const { workItems } = await server.readPool();
    const syn212 = workItems.find((i) => i.id === W.syn212)!;
    expect(joinIssue(linear, syn212)!.status).toMatchObject({
      effect: "waiting",
    });
    const base = setup("default", BASE_NOW);
    const done = joinIssue(
      await base.readLinear(),
      await itemOf(base, BASE_IDS.workItems.urgent),
    )!;
    expect(done.status.fill).toBe(1);
    expect(done.status.effect).toBe("check");
  });

  it("a Synapse-only item has no issue", async () => {
    const server = setup("default", BASE_NOW);
    const linear = await server.readLinear();
    for (const id of [
      BASE_IDS.workItems.stretch,
      BASE_IDS.workItems.unslotted,
    ]) {
      expect(joinIssue(linear, await itemOf(server, id))).toBeNull();
    }
  });

  it("with Linear off, a linked identifier still has no issue", async () => {
    const server = setup("linear-off");
    const linear = await server.readLinear();
    const { workItems } = await server.readPool();
    expect(linear.connections).toEqual([]);
    expect(workItems.map((item) => joinIssue(linear, item))).toEqual(
      workItems.map(() => null),
    );
  });

  it("not in the pool is the assigned, open issues with no work item", async () => {
    const linear = await setup("pool").readLinear();
    expect(linear.notInPool.map((i) => i.identifier).sort()).toEqual([
      "BIZ-11",
      "HAR-17",
      "KES-42",
      "KES-66",
      "SYN-219",
      "SYN-224",
    ]);
  });
});

describe("C3: a status or priority write goes pending, then sent or failed; failed keeps the new value", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const IN_PROGRESS = stateId("KES", "In progress");

  async function kes58(server: ReturnType<typeof setup>) {
    const linear = await server.readLinear();
    const { workItems } = await server.readPool();
    return joinIssue(
      linear,
      workItems.find((i) => i.id === W.kes58)!,
    )!;
  }

  it("changes the item at once with a pending row, which the sender marks sent", async () => {
    const server = setup("pool");
    const row = await server.writeLinearIssue({
      workItemId: W.kes58,
      stateId: IN_PROGRESS,
    });
    expect(row).toMatchObject({ kind: "status", state: "pending" });
    const before = await kes58(server);
    expect(before.status.state.name).toBe("In progress");
    expect(before.write).toMatchObject({ id: row.id, state: "pending" });

    vi.advanceTimersByTime(LINEAR_SEND_MS);
    const after = await kes58(server);
    expect(after.write).toMatchObject({ id: row.id, state: "sent" });
    expect(after.status.state.name).toBe("In progress");
  });

  it("a priority write goes the same way", async () => {
    const server = setup("pool");
    const row = await server.writeLinearIssue({
      workItemId: W.kes58,
      priority: 4,
    });
    expect(row).toMatchObject({ kind: "priority", state: "pending" });
    expect((await kes58(server)).priority).toBe(4);
    vi.advanceTimersByTime(LINEAR_SEND_MS);
    expect((await kes58(server)).write!.state).toBe("sent");
  });

  it("failed leaves the new status in place, and Try again resends it", async () => {
    const server = setup("linear-write-fails");
    const row = await server.writeLinearIssue({
      workItemId: W.kes58,
      stateId: IN_PROGRESS,
    });
    vi.advanceTimersByTime(LINEAR_SEND_MS);
    const failed = await kes58(server);
    expect(failed.write).toMatchObject({ id: row.id, state: "failed" });
    expect(failed.status.state.name).toBe("In progress");

    expect(await server.retryLinearWrite(row.id)).toMatchObject({
      state: "pending",
    });
    vi.advanceTimersByTime(LINEAR_SEND_MS);
    const sent = await kes58(server);
    expect(sent.write).toMatchObject({ id: row.id, state: "sent" });
    expect(sent.status.state.name).toBe("In progress");
  });

  it("offline holds the write pending", async () => {
    const records = resolveScenario("pool");
    const server = createFixtureServer(
      { ...records, offline: true },
      () => new Date(SET_UP_NOW),
    );
    await server.writeLinearIssue({
      workItemId: W.kes58,
      stateId: IN_PROGRESS,
    });
    vi.advanceTimersByTime(LINEAR_SEND_MS * 10);
    expect((await kes58(server)).write!.state).toBe("pending");
  });

  it("done keeps the status it left, and reopen goes back to it", async () => {
    const server = setup("pool");
    await server.writeLinearDone({ workItemId: W.kes58, done: true });
    expect((await kes58(server)).status.state.name).toBe("Done");
    const row = await server.writeLinearDone({
      workItemId: W.kes58,
      done: false,
    });
    expect(row.kind).toBe("reopen");
    expect((await kes58(server)).status.state.name).toBe("Todo");
  });

  it("a Synapse-only item is never written to Linear", async () => {
    const server = setup("pool");
    await expect(
      server.writeLinearIssue({ workItemId: W.synapseOnly, priority: 1 }),
    ).rejects.toThrow("That task is not in Linear.");
  });

  it("placing, tiers, clients, calendars and mappings write nothing to the outbox", async () => {
    const server = setup("pool");
    const { slots } = await server.readPool();
    const slot = slots.find((s) => s.workItemId === W.ald17)!;
    const lighthouse = (await server.readConnections()).linear[1]!;
    await server.placeWork({
      workItemId: W.kes63,
      dateKey: "2026-10-12",
      blockId: SET_UP_IDS.blocks.work,
      tier: "primary",
      sortOrder: 20,
    });
    await server.setWorkTier({
      slotId: slot.id,
      tier: "primary",
      sessions: "all",
    });
    await server.setClientOrder({ ids: [C.personal, C.alder, C.kestrel] });
    await server.writeClientsEnabled({ enabled: false });
    await server.writeProjectClient({
      connectionId: lighthouse.id,
      projectId: "project-synapse",
      clientId: null,
    });
    await server.writeWorkspaceClient({
      connectionId: lighthouse.id,
      clientId: C.alder,
      perProject: false,
    });
    const calendar = (await server.readConnections()).googleCalendars[0]!;
    await server.writeCalendar({ calendarId: calendar.id, enabled: false });
    await server.writeClient({
      name: "Fern [placeholder]",
      colorKey: "leaf",
      sortOrder: 3,
    });
    expect((await server.readLinear()).outbox).toEqual([]);
  });
});

describe("C4: a work item's client comes from resolveClient", () => {
  async function clientsOf(name: string, ids: string[]) {
    const server = setup(name);
    const [linear, connections, pool] = await Promise.all([
      server.readLinear(),
      server.readConnections(),
      server.readPool(),
    ]);
    return ids.map(
      (id) =>
        clientOf(
          connections,
          linear,
          pool.workItems.find((item) => item.id === id)!,
        )?.id ?? null,
    );
  }

  it("with clients off, every item resolves to no client", async () => {
    const server = setup("default", BASE_NOW);
    const [linear, connections, today] = await Promise.all([
      server.readLinear(),
      server.readConnections(),
      server.readToday("2026-10-12"),
    ]);
    expect(connections.clientsEnabled).toBe(false);
    expect(today.workItems.length).toBeGreaterThan(0);
    for (const item of today.workItems) {
      expect(clientOf(connections, linear, item)).toBeNull();
    }
  });

  it("clients off by the switch: none, whatever is mapped", async () => {
    const server = setup("clients-per-project");
    await server.writeClientsEnabled({ enabled: false });
    const [linear, connections, pool] = await Promise.all([
      server.readLinear(),
      server.readConnections(),
      server.readPool(),
    ]);
    for (const item of pool.workItems) {
      expect(clientOf(connections, linear, item)).toBeNull();
    }
  });

  it("per project: a mapped project is its client's, an unmapped one none", async () => {
    expect(
      await clientsOf("clients-per-project", [W.ald21, W.syn218, W.kes58]),
    ).toEqual([C.alder, null, C.kestrel]);
  });

  it("one client per workspace: every project is that client's", async () => {
    expect(await clientsOf("clients-on", [W.ald21, W.syn218, W.biz9])).toEqual([
      C.alder,
      C.alder,
      C.kestrel,
    ]);
  });

  it("a mapping written in Settings is read back", async () => {
    const server = setup("clients-per-project");
    const lighthouse = (await server.readConnections()).linear[1]!;
    await server.writeProjectClient({
      connectionId: lighthouse.id,
      projectId: "project-synapse",
      clientId: C.personal,
    });
    const [linear, connections, pool] = await Promise.all([
      server.readLinear(),
      server.readConnections(),
      server.readPool(),
    ]);
    const syn218 = pool.workItems.find((item) => item.id === W.syn218)!;
    expect(clientOf(connections, linear, syn218)?.id).toBe(C.personal);
  });
});

describe("C5: Sync now stamps the clock's now; a closed issue closes the task from Linear", () => {
  it("sets lastSyncedAt to the fixture clock's now", async () => {
    const server = setup("pool");
    const before = await server.readLinear();
    expect(before.connections.every((c) => c.lastSyncedAt !== SET_UP_NOW)).toBe(
      true,
    );
    await server.syncLinear();
    const after = await server.readLinear();
    const now = new Date(SET_UP_NOW).toISOString();
    expect(after.connections.map((c) => c.lastSyncedAt)).toEqual([now, now]);
  });

  it("syncs one workspace when named", async () => {
    const server = setup("pool");
    const [kestrel, lighthouse] = (await server.readLinear()).connections;
    await server.syncLinear(kestrel!.id);
    const after = (await server.readLinear()).connections;
    expect(after[0]!.lastSyncedAt).toBe(new Date(SET_UP_NOW).toISOString());
    expect(after[1]!.lastSyncedAt).toBe(lighthouse!.lastSyncedAt);
  });

  it("linear-closed: KES-58 closes as done from Linear, with its session", async () => {
    const server = setup("linear-closed");
    const now = new Date(SET_UP_NOW).toISOString();
    await server.syncLinear();
    const { workItems, slots } = await server.readToday("2026-10-13");
    const item = workItems.find((i) => i.id === W.kes58)!;
    expect(item).toMatchObject({ doneAt: now, doneSource: "linear" });
    expect(slots.find((s) => s.id === POOL_IDS.slots.kes58Tue)!.doneAt).toBe(
      now,
    );
    expect((await server.readPool()).workItems.map((i) => i.id)).not.toContain(
      W.kes58,
    );
    const linear = await server.readLinear();
    expect(joinIssue(linear, item)!.status.state.name).toBe("Done");
    expect(linear.outbox).toEqual([]);
    expect(issueId("KES-58")).toBe(item.linearIssueId);
  });

  it("offline, Sync now does not reach Linear", async () => {
    const scenario = resolveScenario("pool");
    const server = createFixtureServer(
      { ...scenario, offline: true },
      () => new Date(SET_UP_NOW),
    );
    await expect(server.syncLinear()).rejects.toThrow("No connection.");
  });
});
