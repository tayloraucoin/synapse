import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import {
  clientRecord,
  type ClientRecord,
  type LinearProjectClientInput,
} from "@syn/validators";
import { refusalReason } from "../../errors";
import {
  setClientOrder,
  writeClient,
  writeClientArchived,
  writeClientsEnabled,
  writeProjectClient,
  writeWorkspaceClient,
  type ClientConnection,
  type ClientStore,
} from "./clients";

/**
 * USE-104 C1 to C3: the client writes over rows in memory. `run` stands for
 * the router's one RLS transaction: the call works on a copy, which is kept
 * only when it returns, so a refusal leaves every row as it was. The rows
 * belong to two people, and the store sees only the caller's, as the
 * policies do.
 */

const ME = "00000000-0000-4000-8000-000000000001";
const OTHER = "00000000-0000-4000-8000-000000000002";
const STAMP = "2026-10-17T09:00:00.000Z";

let serial = 0;
const uuid = () =>
  `00000000-0000-4000-8000-${String(++serial).padStart(12, "0")}`;

type Owned<T> = T & { userId: string };

interface Tables {
  clients: Owned<ClientRecord>[];
  clientsEnabled: Record<string, boolean>;
  connections: Owned<ClientConnection>[];
  projectClients: Owned<LinearProjectClientInput>[];
  /** Each setSortOrders call, by the ids it named. */
  orderWrites: string[][];
}

function client(name: string, sortOrder: number, userId = ME) {
  return {
    ...clientRecord.parse({
      id: uuid(),
      createdAt: STAMP,
      updatedAt: STAMP,
      name,
      colorKey: "moss",
      logoPath: null,
      sortOrder,
      archivedAt: null,
    }),
    userId,
  };
}

function memoryStore(tables: Tables, userId: string): ClientStore {
  const strip = <T extends { userId: string }>(owned: T) => {
    const row: Partial<T> = structuredClone(owned);
    delete row.userId;
    return row as Omit<T, "userId">;
  };
  const mine = () => tables.clients.filter((c) => c.userId === userId);
  return {
    list: async () =>
      mine()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(strip),
    async insert(values) {
      const row = {
        ...values,
        id: uuid(),
        createdAt: STAMP,
        updatedAt: STAMP,
        archivedAt: null,
        userId,
      };
      tables.clients.push(row);
      return strip(row);
    },
    async update(id, values) {
      const row = mine().find((c) => c.id === id);
      if (!row) return null;
      Object.assign(row, values);
      return strip(row);
    },
    async setArchivedAt(id, at) {
      const row = mine().find((c) => c.id === id);
      if (!row) return false;
      row.archivedAt = at ? at.toISOString() : null;
      return true;
    },
    async setSortOrders(orders) {
      tables.orderWrites.push(orders.map((o) => o.id));
      for (const { id, sortOrder } of orders) {
        const row = mine().find((c) => c.id === id);
        if (row) row.sortOrder = sortOrder;
      }
    },
    async setClientsEnabled(enabled) {
      tables.clientsEnabled[userId] = enabled;
    },
    async connection(id) {
      const row = tables.connections.find(
        (c) => c.id === id && c.userId === userId,
      );
      return row ? strip(row) : null;
    },
    async setConnectionClient(id, values) {
      const row = tables.connections.find(
        (c) => c.id === id && c.userId === userId,
      );
      if (row) Object.assign(row, values);
    },
    async upsertProjectClient(input) {
      tables.projectClients = tables.projectClients.filter(
        (row) =>
          !(
            row.connectionId === input.connectionId &&
            row.projectId === input.projectId
          ),
      );
      tables.projectClients.push({ ...input, userId });
    },
  };
}

function setup() {
  const kestrel = client("Kestrel Health", 0);
  const alder = client("Alder Studio", 1);
  const theirs = client("Their client", 0, OTHER);
  const lighthouse = {
    id: uuid(),
    clientId: null,
    perProject: false,
    userId: ME,
  };
  const theirWorkspace = {
    id: uuid(),
    clientId: null,
    perProject: false,
    userId: OTHER,
  };
  let tables: Tables = {
    clients: [kestrel, alder, theirs],
    clientsEnabled: { [ME]: false },
    connections: [lighthouse, theirWorkspace],
    projectClients: [],
    orderWrites: [],
  };
  /** One transaction: kept when it returns, rolled back when it throws. */
  async function run<T>(fn: (store: ClientStore) => Promise<T>): Promise<T> {
    const draft = structuredClone(tables);
    const result = await fn(memoryStore(draft, ME));
    tables = draft;
    return result;
  }
  return {
    run,
    tables: () => tables,
    kestrel,
    alder,
    theirs,
    lighthouse,
    theirWorkspace,
  };
}

async function reasonOf(promise: Promise<unknown>): Promise<string | null> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof TRPCError) return refusalReason(error);
    throw error;
  }
  throw new Error("Expected a refusal.");
}

describe("C1: a client's writes", () => {
  it("writeClient creates a client, then edits it", async () => {
    const t = setup();
    const made = await t.run((s) =>
      writeClient(s, { name: "Moss & Co", colorKey: "rose", sortOrder: 2 }),
    );
    expect(clientRecord.strict().parse(made)).toEqual(made);
    expect(made).toMatchObject({
      name: "Moss & Co",
      colorKey: "rose",
      logoPath: null,
      sortOrder: 2,
      archivedAt: null,
    });

    const edited = await t.run((s) =>
      writeClient(s, {
        id: made.id,
        name: "Moss and Co",
        colorKey: "moss",
        sortOrder: 2,
      }),
    );
    expect(edited).toMatchObject({ id: made.id, name: "Moss and Co" });
    expect(t.tables().clients.filter((c) => c.userId === ME)).toHaveLength(3);
  });

  it("refuses an edit to a client that is not the caller's", async () => {
    const t = setup();
    await expect(
      reasonOf(
        t.run((s) =>
          writeClient(s, {
            id: t.theirs.id,
            name: "Mine now",
            colorKey: "moss",
            sortOrder: 0,
          }),
        ),
      ),
    ).resolves.toBe("unknown");
    expect(t.tables().clients.find((c) => c.id === t.theirs.id)?.name).toBe(
      "Their client",
    );
  });

  it("writeClientArchived archives and restores, never deleting the row", async () => {
    const t = setup();
    await t.run((s) =>
      writeClientArchived(s, { id: t.kestrel.id, archived: true }),
    );
    const archived = t.tables().clients.find((c) => c.id === t.kestrel.id);
    expect(archived?.archivedAt).not.toBeNull();
    expect(archived?.sortOrder).toBe(0);

    await t.run((s) =>
      writeClientArchived(s, { id: t.kestrel.id, archived: false }),
    );
    expect(
      t.tables().clients.find((c) => c.id === t.kestrel.id)?.archivedAt,
    ).toBeNull();
    await expect(
      reasonOf(
        t.run((s) => writeClientArchived(s, { id: uuid(), archived: true })),
      ),
    ).resolves.toBe("unknown");
  });

  it("writeClientsEnabled sets users.clients_enabled", async () => {
    const t = setup();
    await t.run((s) => writeClientsEnabled(s, { enabled: true }));
    expect(t.tables().clientsEnabled[ME]).toBe(true);
    await t.run((s) => writeClientsEnabled(s, { enabled: false }));
    expect(t.tables().clientsEnabled[ME]).toBe(false);
  });
});

describe("C2: the one client order", () => {
  it("writes every moved sort_order in one write", async () => {
    const t = setup();
    const third = await t.run((s) =>
      writeClient(s, { name: "Personal", colorKey: "ink", sortOrder: 2 }),
    );
    await t.run((s) => setClientOrder(s, [third.id, t.alder.id, t.kestrel.id]));
    const order = t
      .tables()
      .clients.filter((c) => c.userId === ME)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => c.id);
    expect(order).toEqual([third.id, t.alder.id, t.kestrel.id]);
    // Alder stays at 1, so only the two that moved are named, in one call.
    expect(t.tables().orderWrites).toEqual([[third.id, t.kestrel.id]]);
  });

  it("refuses a partial order and leaves the old one", async () => {
    const t = setup();
    const before = structuredClone(t.tables().clients);
    for (const ids of [
      [t.alder.id],
      [t.alder.id, t.kestrel.id, t.theirs.id],
      [t.alder.id, uuid()],
    ]) {
      await expect(
        reasonOf(t.run((s) => setClientOrder(s, ids))),
      ).resolves.toBe("invalid");
    }
    expect(t.tables().clients).toEqual(before);
    expect(t.tables().orderWrites).toEqual([]);
  });

  it("orders the clients not archived; an archived one keeps its place", async () => {
    const t = setup();
    await t.run((s) =>
      writeClientArchived(s, { id: t.kestrel.id, archived: true }),
    );
    await t.run((s) => setClientOrder(s, [t.alder.id]));
    const rows = t.tables().clients;
    expect(rows.find((c) => c.id === t.alder.id)?.sortOrder).toBe(0);
    expect(rows.find((c) => c.id === t.kestrel.id)?.sortOrder).toBe(0);
  });
});

describe("C3: a workspace's and a project's client", () => {
  it("sets the workspace's one client, then per project", async () => {
    const t = setup();
    await t.run((s) =>
      writeWorkspaceClient(s, {
        connectionId: t.lighthouse.id,
        clientId: t.alder.id,
        perProject: false,
      }),
    );
    const row = () =>
      t.tables().connections.find((c) => c.id === t.lighthouse.id);
    expect(row()).toMatchObject({ clientId: t.alder.id, perProject: false });

    // Set per project clears the one client (D-USE-91).
    await t.run((s) =>
      writeWorkspaceClient(s, {
        connectionId: t.lighthouse.id,
        clientId: t.alder.id,
        perProject: true,
      }),
    );
    expect(row()).toMatchObject({ clientId: null, perProject: true });
  });

  it("upserts one mapping per (connection, project)", async () => {
    const t = setup();
    const map = (clientId: string | null) =>
      t.run((s) =>
        writeProjectClient(s, {
          connectionId: t.lighthouse.id,
          projectId: "project-brief",
          clientId,
        }),
      );
    await map(t.kestrel.id);
    await map(t.alder.id);
    expect(t.tables().projectClients).toEqual([
      {
        connectionId: t.lighthouse.id,
        projectId: "project-brief",
        clientId: t.alder.id,
        userId: ME,
      },
    ]);
    await map(null);
    expect(t.tables().projectClients[0]?.clientId).toBeNull();
  });

  it("refuses a connection the caller does not own, and writes nothing", async () => {
    const t = setup();
    const before = structuredClone(t.tables());
    await expect(
      reasonOf(
        t.run((s) =>
          writeWorkspaceClient(s, {
            connectionId: t.theirWorkspace.id,
            clientId: t.alder.id,
            perProject: false,
          }),
        ),
      ),
    ).resolves.toBe("unknown");
    await expect(
      reasonOf(
        t.run((s) =>
          writeProjectClient(s, {
            connectionId: t.theirWorkspace.id,
            projectId: "project-brief",
            clientId: t.alder.id,
          }),
        ),
      ),
    ).resolves.toBe("unknown");
    expect(t.tables()).toEqual(before);
  });

  it("refuses a client that is archived or not the caller's", async () => {
    const t = setup();
    await t.run((s) =>
      writeClientArchived(s, { id: t.kestrel.id, archived: true }),
    );
    for (const clientId of [t.kestrel.id, t.theirs.id]) {
      await expect(
        reasonOf(
          t.run((s) =>
            writeProjectClient(s, {
              connectionId: t.lighthouse.id,
              projectId: "project-brief",
              clientId,
            }),
          ),
        ),
      ).resolves.toBe("unknown");
    }
    expect(t.tables().projectClients).toEqual([]);
  });

  it("the table store reads a connection through the caller, beside RLS", () => {
    const text = readFileSync(
      join(import.meta.dirname, "client-store.ts"),
      "utf8",
    );
    expect(text).toMatch(
      /and\(eq\(linearConnections\.userId, userId\), eq\(linearConnections\.id, id\)\)/,
    );
    expect(text).not.toMatch(/\.delete\(clients\)/);
    expect(text).not.toMatch(
      /import\s+\{[^}]*\bdb\b[^}]*\}\s+from\s+"@syn\/db"/,
    );
  });
});
