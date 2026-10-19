import { describe, expect, it, vi } from "vitest";
import { LINEAR_WRITE_KINDS } from "@syn/constants";
import type { LinearIssue, LinearSnapshotPayload } from "@syn/validators";
import { LinearApiError, LinearUnauthorized } from "./client";
import {
  applyLinearWrite,
  overlayUnsent,
  retryLinearWrite,
  sendDueLinearWrites,
  writeLinearDone,
  writeLinearIssue,
  type LinearOutboxStore,
  type LinearSendDeps,
  type LinearWriteRow,
} from "./outbox";

/**
 * USE-102 C1 to C4, with a stubbed client and a store over rows in memory
 * whose `commit` writes Synapse's value, the kept state and the pending row
 * together (or none of them), as `outbox-store.ts`'s one transaction does:
 * - C1: the value and the row commit together; the send settles the row
 *   sent, or failed with its error, and the value stays either way.
 * - C2: Done moves the issue to its team's first completed state and keeps
 *   the one it left; undone moves it back there.
 * - C3: Try again resends the same failed row once; never a second row.
 * - C4: only the six kinds exist; a client, a firing time, work time or a
 *   session's Done is refused before any row is written.
 */

const ITEM = "00000000-0000-4000-a000-00000000a001";
const CONNECTION = "00000000-0000-4000-8000-00000000c001";
const TEAM = "team-syn";
const NOW = new Date("2026-10-17T18:00:00.000Z");

const states = [
  { id: "st-todo", name: "Todo", type: "unstarted", position: 0 },
  { id: "st-started", name: "In progress", type: "started", position: 1 },
  // Two completed states: the first by position is Done, not Shipped.
  { id: "st-shipped", name: "Shipped", type: "completed", position: 6 },
  { id: "st-done", name: "Done", type: "completed", position: 5 },
  { id: "st-canceled", name: "Canceled", type: "canceled", position: 7 },
] as const;

function issue(id: string, over: Partial<LinearIssue> = {}): LinearIssue {
  return {
    id,
    identifier: `SYN-${id}`,
    title: `Issue ${id}`,
    description: null,
    url: `https://linear.app/lighthouse/issue/SYN-${id}`,
    stateId: "st-started",
    priority: 3,
    estimate: null,
    dueDate: null,
    labels: [],
    projectId: null,
    teamId: TEAM,
    parentId: null,
    assignedToMe: true,
    ...over,
  };
}

function snapshotOf(estimationType = "exponential"): LinearSnapshotPayload {
  return {
    issues: [issue("1")],
    subIssues: [issue("1a", { parentId: "1", stateId: "st-todo" })],
    teams: [
      { id: TEAM, key: "SYN", name: "Synapse", icon: null, estimationType },
    ],
    projects: [],
    states: states.map((s) => ({ ...s, color: "#5e6ad2", teamId: TEAM })),
  };
}

/** The outbox's store over memory; `commit` is all or nothing. */
function memoryStore(
  options: { linked?: boolean; prevStateId?: string | null } = {},
) {
  const state = {
    snapshot: snapshotOf(),
    prevStateId: options.prevStateId ?? null,
    rows: [] as (LinearWriteRow & { updatedAt: Date })[],
  };
  let n = 0;
  const find = (id: string) => state.rows.find((row) => row.id === id);
  const store: LinearOutboxStore = {
    linked: (workItemId) =>
      options.linked === false
        ? Promise.reject(new Error("That task is not in Linear."))
        : Promise.resolve({
            workItemId,
            connectionId: CONNECTION,
            issueId: "1",
            prevStateId: state.prevStateId,
            snapshot: structuredClone(state.snapshot),
          }),
    lastDonePrevState: (_item, issueId) => {
      const done = state.rows
        .filter((row) => row.issueId === issueId && row.kind === "done")
        .at(-1);
      const payload = done?.payload as { prevStateId?: string | null };
      return Promise.resolve(payload?.prevStateId ?? null);
    },
    commit: vi.fn((plan, at: Date) => {
      const row = {
        id: `00000000-0000-4000-9000-${String(++n).padStart(12, "0")}`,
        workItemId: plan.workItemId,
        connectionId: plan.connectionId,
        issueId: plan.issueId,
        kind: plan.kind,
        state: "pending" as const,
        payload: plan.payload,
        attempts: 0,
        lastError: null,
        createdAt: at,
        updatedAt: at,
      };
      state.snapshot = applyLinearWrite(state.snapshot, plan);
      if (plan.prevStateId !== undefined) state.prevStateId = plan.prevStateId;
      state.rows.push(row);
      return Promise.resolve(row);
    }),
    claim: (id, at, before) => {
      const row = find(id);
      if (!row || row.state !== "pending") return Promise.resolve(null);
      if (before && row.updatedAt >= before) return Promise.resolve(null);
      Object.assign(row, { attempts: row.attempts + 1, updatedAt: at });
      return Promise.resolve({ ...row });
    },
    settle: (id, outcome, at) => {
      const row = find(id)!;
      Object.assign(row, { ...outcome, updatedAt: at });
      return Promise.resolve({ ...row });
    },
    requeue: (id, at) => {
      const row = find(id);
      if (!row) return Promise.resolve(null);
      if (row.state !== "failed") {
        return Promise.resolve({ row: { ...row }, requeued: false });
      }
      Object.assign(row, { state: "pending", updatedAt: at });
      return Promise.resolve({ row: { ...row }, requeued: true });
    },
    due: (before) =>
      Promise.resolve(
        state.rows
          .filter((row) => row.state === "pending" && row.updatedAt < before)
          .map((row) => row.id),
      ),
  };
  return { store, state };
}

function stubClient(result: "ok" | Error | (() => void) = "ok") {
  const updateIssue = vi.fn(() => {
    if (result === "ok") return Promise.resolve();
    if (typeof result === "function") {
      result();
      return Promise.resolve();
    }
    return Promise.reject(result);
  });
  return { updateIssue };
}

function deps(
  store: LinearOutboxStore,
  client: ReturnType<typeof stubClient>,
  over: Partial<LinearSendDeps> = {},
): LinearSendDeps {
  return {
    store,
    tokens: {
      accessToken: () => Promise.resolve("lin_oauth_a"),
      refresh: () => Promise.resolve("lin_oauth_b"),
    },
    fetch: vi.fn(() => Promise.reject(new Error("No network in this test."))),
    now: () => NOW,
    client: () => client,
    ...over,
  };
}

const issueOne = (s: LinearSnapshotPayload) =>
  s.issues.find((i) => i.id === "1")!;

describe("a write: Synapse first, then the send (C-USE-102-1)", () => {
  it("commits the value and a pending row, then marks it sent", async () => {
    const { store, state } = memoryStore();
    const client = stubClient(() => {
      // The send runs after the commit: the row is already there, pending.
      expect(state.rows[0]?.state).toBe("pending");
      expect(issueOne(state.snapshot).priority).toBe(1);
    });
    const view = await writeLinearIssue(
      { workItemId: ITEM, priority: 1 },
      deps(store, client),
    );
    expect(view).toMatchObject({
      workItemId: ITEM,
      kind: "priority",
      state: "sent",
    });
    expect(client.updateIssue).toHaveBeenCalledWith("1", { priority: 1 });
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0]).toMatchObject({ attempts: 1, lastError: null });
  });

  it("a failed send keeps its error, and Synapse's value stands", async () => {
    const { store, state } = memoryStore();
    const client = stubClient(new LinearApiError(400, "INVALID_INPUT"));
    const view = await writeLinearIssue(
      { workItemId: ITEM, stateId: "st-todo" },
      deps(store, client),
    );
    expect(view.state).toBe("failed");
    expect(state.rows[0]?.lastError).toBe(
      "Linear answered 400 (INVALID_INPUT).",
    );
    expect(issueOne(state.snapshot).stateId).toBe("st-todo");
  });

  it("a description and an estimate on the team's scale", async () => {
    const { store, state } = memoryStore();
    const client = stubClient();
    await writeLinearIssue(
      { workItemId: ITEM, description: "## Steps" },
      deps(store, client),
    );
    // Large is 5 points in Synapse, 8 on an exponential team.
    await writeLinearIssue(
      { workItemId: ITEM, estimate: 5 },
      deps(store, client),
    );
    expect(client.updateIssue).toHaveBeenNthCalledWith(1, "1", {
      description: "## Steps",
    });
    expect(client.updateIssue).toHaveBeenNthCalledWith(2, "1", { estimate: 8 });
    expect(issueOne(state.snapshot)).toMatchObject({
      description: "## Steps",
      estimate: 8,
    });
  });

  it("a 401 refreshes once and sends again", async () => {
    const { store } = memoryStore();
    let calls = 0;
    const client = {
      updateIssue: vi.fn(() =>
        ++calls === 1
          ? Promise.reject(new LinearUnauthorized())
          : Promise.resolve(),
      ),
    };
    const refresh = vi.fn(() => Promise.resolve("lin_oauth_b"));
    const view = await writeLinearIssue(
      { workItemId: ITEM, priority: 2 },
      deps(store, client, {
        tokens: { accessToken: () => Promise.resolve("lin_oauth_a"), refresh },
      }),
    );
    expect(view.state).toBe("sent");
    expect(refresh).toHaveBeenCalledWith(CONNECTION, {
      rejected: "lin_oauth_a",
    });
  });

  it("a row a request left pending is sent by the next pass, a minute on", async () => {
    const { store, state } = memoryStore();
    const crashed = stubClient(new Error("socket hang up"));
    // The request committed, then died before its send.
    await store.commit(
      {
        workItemId: ITEM,
        connectionId: CONNECTION,
        issueId: "1",
        kind: "priority",
        payload: { priority: 4 },
      },
      new Date(NOW.getTime() - 30_000),
    );
    const client = stubClient();
    expect(await sendDueLinearWrites(deps(store, client))).toBe(0);
    expect(crashed.updateIssue).not.toHaveBeenCalled();
    const later = () => new Date(NOW.getTime() + 60_000);
    expect(await sendDueLinearWrites(deps(store, client, { now: later }))).toBe(
      1,
    );
    expect(state.rows[0]?.state).toBe("sent");
  });

  it("the sync lays an unsent value back over Linear's, and leaves a sent one", () => {
    const linear = snapshotOf();
    const rows = [
      {
        issueId: "1",
        kind: "done",
        state: "sent",
        payload: { stateId: "st-done" },
      },
      {
        issueId: "1",
        kind: "reopen",
        state: "pending",
        payload: { stateId: "st-started" },
      },
      {
        issueId: "1",
        kind: "priority",
        state: "failed",
        payload: { priority: 1 },
      },
      {
        issueId: "1",
        kind: "estimate",
        state: "failed",
        payload: { estimate: 2 },
      },
      {
        issueId: "1",
        kind: "estimate",
        state: "sent",
        payload: { estimate: 4 },
      },
    ] as const;
    const fetched = applyLinearWrite(linear, {
      issueId: "1",
      payload: { stateId: "st-done" },
    });
    const next = issueOne(overlayUnsent(fetched, rows));
    expect(next.stateId).toBe("st-started");
    expect(next.priority).toBe(1);
    // The latest estimate was sent: Linear's value shows.
    expect(next.estimate).toBeNull();
  });
});

describe("Done and Reopen (C-USE-102-2)", () => {
  it("done writes the team's first completed state and keeps the one it left", async () => {
    const { store, state } = memoryStore();
    const client = stubClient();
    const view = await writeLinearDone(
      { workItemId: ITEM, done: true },
      deps(store, client),
    );
    expect(view).toMatchObject({ kind: "done", state: "sent" });
    expect(client.updateIssue).toHaveBeenCalledWith("1", {
      stateId: "st-done",
    });
    expect(state.prevStateId).toBe("st-started");
    expect(issueOne(state.snapshot).stateId).toBe("st-done");
  });

  it("undone writes that state back and clears it", async () => {
    const { store, state } = memoryStore();
    const client = stubClient();
    await writeLinearDone(
      { workItemId: ITEM, done: true },
      deps(store, client),
    );
    const view = await writeLinearDone(
      { workItemId: ITEM, done: false },
      deps(store, client),
    );
    expect(view).toMatchObject({ kind: "reopen", state: "sent" });
    expect(client.updateIssue).toHaveBeenLastCalledWith("1", {
      stateId: "st-started",
    });
    expect(state.prevStateId).toBeNull();
  });

  it("an issue closed in Linear keeps the state kept before; with none, Reopen goes to the first unstarted", async () => {
    const { store, state } = memoryStore({ prevStateId: null });
    state.snapshot = applyLinearWrite(state.snapshot, {
      issueId: "1",
      payload: { stateId: "st-done" },
    });
    const client = stubClient();
    await writeLinearDone(
      { workItemId: ITEM, done: true },
      deps(store, client),
    );
    expect(state.prevStateId).toBeNull();
    await writeLinearDone(
      { workItemId: ITEM, done: false },
      deps(store, client),
    );
    expect(client.updateIssue).toHaveBeenLastCalledWith("1", {
      stateId: "st-todo",
    });
  });

  it("a sub-issue's check keeps its state on its own row, never the item's", async () => {
    const { store, state } = memoryStore({ prevStateId: "st-started" });
    const client = stubClient();
    await writeLinearDone(
      { workItemId: ITEM, done: true, issueId: "1a" },
      deps(store, client),
    );
    expect(state.prevStateId).toBe("st-started");
    await writeLinearDone(
      { workItemId: ITEM, done: false, issueId: "1a" },
      deps(store, client),
    );
    expect(client.updateIssue).toHaveBeenLastCalledWith("1a", {
      stateId: "st-todo",
    });
    expect(state.snapshot.subIssues[0]?.stateId).toBe("st-todo");
  });
});

describe("Try again (C-USE-102-3)", () => {
  it("resends the same failed row once, and never makes a second", async () => {
    const { store, state } = memoryStore();
    let fail = true;
    const client = {
      updateIssue: vi.fn(() =>
        fail
          ? Promise.reject(new LinearApiError(500, null))
          : Promise.resolve(),
      ),
    };
    const failed = await writeLinearIssue(
      { workItemId: ITEM, priority: 2 },
      deps(store, client),
    );
    expect(failed.state).toBe("failed");
    fail = false;
    const retried = await retryLinearWrite(failed.id, deps(store, client));
    expect(retried).toMatchObject({ id: failed.id, state: "sent" });
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0]?.attempts).toBe(2);
    expect(client.updateIssue).toHaveBeenCalledTimes(2);
    expect(store.commit).toHaveBeenCalledTimes(1);

    // A sent row is not sent again.
    const again = await retryLinearWrite(failed.id, deps(store, client));
    expect(again.state).toBe("sent");
    expect(client.updateIssue).toHaveBeenCalledTimes(2);
  });

  it("an unknown row is refused", async () => {
    const { store } = memoryStore();
    await expect(
      retryLinearWrite(
        "00000000-0000-4000-9000-000000000099",
        deps(store, stubClient()),
      ),
    ).rejects.toThrow("No Linear write with that id.");
  });
});

describe("only the six kinds (C-USE-102-4)", () => {
  it("the outbox knows exactly D-USE-113's six", () => {
    expect([...LINEAR_WRITE_KINDS].sort()).toEqual([
      "description",
      "done",
      "estimate",
      "priority",
      "reopen",
      "status",
    ]);
  });

  it.each([
    ["a client", { clientId: "00000000-0000-4000-8000-00000000c1e0" }],
    ["a firing time", { firesAt: "2026-10-17T18:00:00.000Z" }],
    ["work time", { workedMin: 45 }],
    [
      "a session's Done",
      { slotId: "00000000-0000-4000-8000-0000000051a7", done: true },
    ],
    ["the assignee", { assigneeId: "user-2" }],
  ])("%s is refused before any row is written", async (_what, extra) => {
    const { store, state } = memoryStore();
    const client = stubClient();
    await expect(
      writeLinearIssue(
        { workItemId: ITEM, priority: 2, ...extra },
        deps(store, client),
      ),
    ).rejects.toThrow();
    await expect(
      writeLinearDone(
        { workItemId: ITEM, done: true, ...extra },
        deps(store, client),
      ),
    ).rejects.toThrow();
    expect(store.commit).not.toHaveBeenCalled();
    expect(state.rows).toHaveLength(0);
    expect(client.updateIssue).not.toHaveBeenCalled();
  });

  it("an item not in Linear writes nothing", async () => {
    const { store, state } = memoryStore({ linked: false });
    await expect(
      writeLinearIssue(
        { workItemId: ITEM, priority: 2 },
        deps(store, stubClient()),
      ),
    ).rejects.toThrow("That task is not in Linear.");
    expect(state.rows).toHaveLength(0);
  });

  it("a status from another team is refused", async () => {
    const { store, state } = memoryStore();
    await expect(
      writeLinearIssue(
        { workItemId: ITEM, stateId: "st-elsewhere" },
        deps(store, stubClient()),
      ),
    ).rejects.toThrow("No status with that id.");
    expect(state.rows).toHaveLength(0);
  });
});
