import { describe, expect, it, vi } from "vitest";
import type {
  LinearApiIssueWithChildren,
  LinearSnapshotPayload,
  WorkItemRecord,
} from "@syn/validators";
import { block, id, slot, workItem } from "../planner/planner-rows.fixture";
import { RowJournal } from "../planner/write-journal";
import { NOW, NOW_ISO } from "../planner/write-plan.fixture";
import { applyChanges } from "../planner/write-rows";
import { memoryDb } from "../undo/memory-store.fixture";
import { planReopenTask } from "../work/items";
import { planLinearCloses } from "../work/linear-items";
import type { WorkJournal } from "../work/work-rows";
import { workJournal } from "../work/work.fixture";
import type { LinearClient } from "./client";
import { LINEAR_GRAPHQL_URL } from "./oauth";
import type { LinearFetched } from "./snapshot";
import {
  LINEAR_SYNC_FAILED_MESSAGE,
  rateLimitedMessage,
  syncLinearConnection,
  type LinearConnectionState,
  type LinearSyncDeps,
  type LinearSyncStore,
} from "./sync";

/**
 * USE-101 C2 and C3, with a stubbed client and a store over rows in memory
 * whose `writeSync` is one transaction, as `sync-store.ts`'s is:
 * - C2: a placed issue found completed, canceled or duplicate closes its
 *   work item (`done_source` linear) and every open session, in one write.
 * - C3: RATELIMITED stops the sync and records the reset time; a sync
 *   before that time makes no request.
 */

const ME = "00000000-0000-4000-a000-000000000001";
const CONNECTION = "00000000-0000-4000-8000-00000000c001";
const EARLIER = "2026-10-12T20:00:00.000Z";
const TEAM = "team-syn";
const MON = "2026-10-19";
const TUE = "2026-10-20";

const STATES = {
  todo: { id: "st-todo", name: "Todo", type: "unstarted" },
  started: { id: "st-started", name: "In progress", type: "started" },
  done: { id: "st-done", name: "Done", type: "completed" },
  canceled: { id: "st-canceled", name: "Canceled", type: "canceled" },
  duplicate: { id: "st-duplicate", name: "Duplicate", type: "duplicate" },
} as const;

const teams: LinearFetched["teams"] = [
  {
    id: TEAM,
    key: "SYN",
    name: "Synapse",
    icon: null,
    issueEstimationType: "fibonacci",
    states: {
      nodes: Object.values(STATES).map((state, position) => ({
        ...state,
        position,
        color: "#5e6ad2",
      })),
    },
  },
];

function node(
  n: number,
  stateId: string,
  over: Partial<LinearApiIssueWithChildren> = {},
): LinearApiIssueWithChildren {
  return {
    id: `issue-${n}`,
    identifier: `SYN-${n}`,
    title: `Issue ${n}`,
    description: null,
    url: `https://linear.app/lighthouse/issue/SYN-${n}`,
    priority: 0,
    estimate: null,
    dueDate: null,
    state: { id: stateId },
    team: { id: TEAM },
    project: null,
    parent: null,
    assignee: { id: "viewer" },
    labels: { nodes: [] },
    children: { nodes: [] },
    ...over,
  };
}

function stubClient(fetched: {
  assigned: LinearApiIssueWithChildren[];
  placed?: LinearApiIssueWithChildren[];
}) {
  const client = {
    assignedIssues: vi.fn(() =>
      Promise.resolve({ viewerId: "viewer", issues: fetched.assigned }),
    ),
    issuesById: vi.fn((ids: readonly string[]) =>
      Promise.resolve((fetched.placed ?? []).filter((n) => ids.includes(n.id))),
    ),
    teamStates: vi.fn(() => Promise.resolve(teams)),
  };
  return client as typeof client & LinearClient;
}

/** The sync's store over `memoryDb`: `writeSync` runs the closes in one transaction. */
function memoryStore(db: ReturnType<typeof memoryDb>) {
  const store = db.storeFor(ME);
  const snapshots: LinearSnapshotPayload[] = [];
  const errors: string[] = [];
  const writeSync = vi.fn(
    (connectionId: string, payload: LinearSnapshotPayload, at: Date) =>
      db.transaction(async () => {
        snapshots.push(payload);
        const journal: WorkJournal = new RowJournal(
          {
            blocks: [],
            clients: [],
            workItems: db.rowsOf("workItems", ME) as never,
            slots: db.rowsOf("slots", ME) as never,
          },
          { now: () => at, newId: id },
        );
        const closed = planLinearCloses(journal, connectionId, payload);
        await applyChanges(store, journal.changes());
        return { closed };
      }),
  );
  const sync: LinearSyncStore & {
    snapshots: typeof snapshots;
    errors: typeof errors;
    writeSync: typeof writeSync;
  } = {
    snapshots,
    errors,
    connections: () => Promise.resolve([]),
    placedIssueIds: () =>
      Promise.resolve(
        (db.rowsOf("workItems", ME) as unknown as WorkItemRecord[])
          .map((row) => row.linearIssueId)
          .filter((id): id is string => id !== null),
      ),
    writeSync,
    markSyncError: (_id, message) => {
      errors.push(message);
      return Promise.resolve();
    },
  };
  return sync;
}

const never: LinearConnectionState = {
  id: CONNECTION,
  lastSyncedAt: null,
  lastSyncError: null,
};

function deps(
  store: LinearSyncStore,
  over: Partial<LinearSyncDeps> = {},
): LinearSyncDeps {
  return {
    store,
    tokens: {
      accessToken: () => Promise.resolve("lin_oauth_a"),
      refresh: () => Promise.resolve("lin_oauth_b"),
    },
    fetch: vi.fn(() => Promise.reject(new Error("No network in this test."))),
    now: () => NOW,
    ...over,
  };
}

describe("a placed issue closed in Linear (C-USE-101-2)", () => {
  async function setUp() {
    const work = block({ kind: "work", name: "Work" });
    const linked = (n: number) =>
      workItem({
        title: `Issue ${n}`,
        linearConnectionId: CONNECTION,
        linearIssueId: `issue-${n}`,
        linearIdentifier: `SYN-${n}`,
      });
    const completed = linked(1);
    const canceled = linked(2);
    const duplicate = linked(3);
    const started = linked(4);
    const sessions = {
      mon: slot({ blockId: work.id, onDate: MON, workItemId: completed.id }),
      tue: slot({ blockId: work.id, onDate: TUE, workItemId: completed.id }),
      before: slot({
        blockId: work.id,
        onDate: "2026-10-16",
        workItemId: completed.id,
        doneAt: EARLIER,
      }),
      canceled: slot({
        blockId: work.id,
        onDate: MON,
        workItemId: canceled.id,
      }),
      started: slot({ blockId: work.id, onDate: MON, workItemId: started.id }),
    };
    const db = memoryDb();
    const rows = db.storeFor(ME);
    for (const item of [completed, canceled, duplicate, started]) {
      await rows.insert("workItems", structuredClone(item));
    }
    for (const s of Object.values(sessions)) {
      await rows.insert("slots", structuredClone(s));
    }
    return { db, completed, canceled, duplicate, started, sessions };
  }

  it("closes the task, done_source linear, and every open session, in one transaction", async () => {
    const { db, completed, canceled, duplicate, started, sessions } =
      await setUp();
    const store = memoryStore(db);
    // Issue 1 is still assigned but Done; 2 and 3 are read by id only.
    const client = stubClient({
      assigned: [node(1, STATES.done.id), node(4, STATES.started.id)],
      placed: [node(2, STATES.canceled.id), node(3, STATES.duplicate.id)],
    });

    const result = await syncLinearConnection(
      never,
      deps(store, { client: () => client }),
    );

    expect(result).toEqual({
      outcome: "synced",
      closed: [completed.id, canceled.id, duplicate.id],
    });
    expect(client.issuesById).toHaveBeenCalledWith(["issue-2", "issue-3"]);
    expect(store.writeSync).toHaveBeenCalledTimes(1);

    const items = new Map(
      (
        db.rowsOf("workItems", ME) as {
          id: string;
          doneAt: string | null;
          doneSource: string | null;
        }[]
      ).map((row) => [row.id, row]),
    );
    for (const item of [completed, canceled, duplicate]) {
      expect(items.get(item.id)).toMatchObject({
        doneAt: NOW_ISO,
        doneSource: "linear",
      });
    }
    expect(items.get(started.id)).toMatchObject({
      doneAt: null,
      doneSource: null,
    });

    const doneAt = new Map(
      db.rowsOf("slots", ME).map((row) => [row.id, row.doneAt]),
    );
    expect(doneAt.get(sessions.mon.id)).toBe(NOW_ISO);
    expect(doneAt.get(sessions.tue.id)).toBe(NOW_ISO);
    expect(doneAt.get(sessions.canceled.id)).toBe(NOW_ISO);
    // A session done on its own day keeps its Done; an open issue's stays open.
    expect(doneAt.get(sessions.before.id)).toBe(EARLIER);
    expect(doneAt.get(sessions.started.id)).toBeNull();
  });

  it("closes nothing twice, and Reopen opens exactly the sessions the sync closed", async () => {
    const { db, completed, sessions } = await setUp();
    const store = memoryStore(db);
    const client = stubClient({ assigned: [node(1, STATES.done.id)] });

    await syncLinearConnection(never, deps(store, { client: () => client }));
    const again = await syncLinearConnection(
      never,
      deps(store, { client: () => client }),
    );
    expect(again).toEqual({ outcome: "synced", closed: [] });

    const reopen = workJournal({
      workItems: db.rowsOf("workItems", ME) as never,
      slots: db.rowsOf("slots", ME) as never,
    });
    planReopenTask(reopen, { workItemId: completed.id });
    await applyChanges(db.storeFor(ME), reopen.changes());
    const doneAt = new Map(
      db.rowsOf("slots", ME).map((row) => [row.id, row.doneAt]),
    );
    expect(doneAt.get(sessions.mon.id)).toBeNull();
    expect(doneAt.get(sessions.before.id)).toBe(EARLIER);
  });

  it("a fetch that fails writes nothing and records last_sync_error", async () => {
    const { db } = await setUp();
    const store = memoryStore(db);
    const fetch = vi.fn(() =>
      Promise.resolve(new Response("{}", { status: 500 })),
    );

    const result = await syncLinearConnection(never, deps(store, { fetch }));

    expect(result).toEqual({ outcome: "failed" });
    expect(store.errors).toEqual([LINEAR_SYNC_FAILED_MESSAGE]);
    expect(store.writeSync).not.toHaveBeenCalled();
  });
});

describe("RATELIMITED (C-USE-101-3)", () => {
  const RESET = Date.parse("2026-10-17T15:40:00.000Z");

  const rateLimited = () =>
    new Response(
      JSON.stringify({
        errors: [
          {
            message: "Rate limit exceeded",
            extensions: { code: "RATELIMITED" },
          },
        ],
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Requests-Remaining": "0",
          "X-RateLimit-Requests-Reset": String(RESET),
        },
      },
    );

  it("stops the sync, records the reset time, and retries nothing", async () => {
    const store = memoryStore(memoryDb());
    const fetch = vi.fn((url: string) => {
      expect(url).toBe(LINEAR_GRAPHQL_URL);
      return Promise.resolve(rateLimited());
    });

    const result = await syncLinearConnection(never, deps(store, { fetch }));

    expect(result).toEqual({ outcome: "rate-limited" });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(store.errors).toEqual([rateLimitedMessage(new Date(RESET))]);
    expect(store.writeSync).not.toHaveBeenCalled();
  });

  it("makes no request before the reset time, and syncs after it", async () => {
    const store = memoryStore(memoryDb());
    const limited: LinearConnectionState = {
      id: CONNECTION,
      lastSyncedAt: new Date("2026-10-17T14:00:00.000Z"),
      lastSyncError: rateLimitedMessage(new Date(RESET)),
    };
    const fetch = vi.fn(() => Promise.resolve(rateLimited()));
    const client = stubClient({ assigned: [] });
    const open = vi.fn(() => client);

    const before = await syncLinearConnection(
      limited,
      deps(store, { fetch, client: open }),
      { force: true },
    );
    expect(before).toEqual({ outcome: "rate-limited" });
    expect(fetch).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();

    const after = await syncLinearConnection(
      limited,
      deps(store, {
        fetch,
        client: open,
        now: () => new Date(RESET + 1000),
      }),
    );
    expect(after).toEqual({ outcome: "synced", closed: [] });
    expect(client.assignedIssues).toHaveBeenCalledTimes(1);
  });
});

describe("the cadence's server side", () => {
  it("refuses a sync within 30 s of the last one, Sync now included", async () => {
    const store = memoryStore(memoryDb());
    const open = vi.fn(() => stubClient({ assigned: [] }));
    const recent: LinearConnectionState = {
      id: CONNECTION,
      lastSyncedAt: new Date(NOW.getTime() - 10_000),
      lastSyncError: null,
    };

    expect(
      await syncLinearConnection(recent, deps(store, { client: open }), {
        force: true,
      }),
    ).toEqual({ outcome: "recent" });
    expect(open).not.toHaveBeenCalled();
  });

  it("a read syncs only a snapshot two minutes old; Sync now any past 30 s", async () => {
    const store = memoryStore(memoryDb());
    const open = vi.fn(() => stubClient({ assigned: [] }));
    const minuteOld: LinearConnectionState = {
      id: CONNECTION,
      lastSyncedAt: new Date(NOW.getTime() - 60_000),
      lastSyncError: null,
    };

    expect(
      await syncLinearConnection(minuteOld, deps(store, { client: open })),
    ).toEqual({ outcome: "recent" });
    expect(
      await syncLinearConnection(minuteOld, deps(store, { client: open }), {
        force: true,
      }),
    ).toEqual({ outcome: "synced", closed: [] });
  });

  it("a 401 refreshes the token once and fetches again", async () => {
    const store = memoryStore(memoryDb());
    const refresh = vi.fn(() => Promise.resolve("lin_oauth_b"));
    const fetch = vi.fn((_url: string, init?: RequestInit) => {
      const auth = new Headers(init?.headers).get("Authorization");
      if (auth === "Bearer lin_oauth_a") {
        return Promise.resolve(new Response("{}", { status: 401 }));
      }
      const query = JSON.parse(String(init?.body)) as { query: string };
      return Promise.resolve(
        Response.json({
          data: query.query.includes("TeamStates")
            ? {
                teams: {
                  nodes: [],
                  pageInfo: { hasNextPage: false, endCursor: null },
                },
              }
            : {
                viewer: {
                  id: "viewer",
                  assignedIssues: {
                    nodes: [],
                    pageInfo: { hasNextPage: false, endCursor: null },
                  },
                },
              },
        }),
      );
    });

    const result = await syncLinearConnection(
      never,
      deps(store, {
        fetch,
        tokens: {
          accessToken: () => Promise.resolve("lin_oauth_a"),
          refresh,
        },
      }),
    );

    expect(result).toEqual({ outcome: "synced", closed: [] });
    expect(refresh).toHaveBeenCalledWith(CONNECTION, {
      rejected: "lin_oauth_a",
    });
  });
});
