import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  dehydrate,
  type DehydratedState,
  hydrate,
  onlineManager,
  QueryClient,
} from "@tanstack/react-query";
import { persistQueryClientSave } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import superjson from "superjson";
import { withQueuedEvents } from "@/lib/data/derive-today";
import { clearOfflineStore } from "./clear";
import { persistOptions, shouldPersistQuery } from "./persister";
import {
  OFFLINE_WRITES,
  offlineWrite,
  offlineWriteKey,
  registerOfflineWrites,
  type OfflineWrite,
} from "./writes";

const HOOKS: Record<OfflineWrite, string> = {
  slotEvents: "../data/use-slot-events.ts",
  work: "../data/use-work-writes.ts",
  planner: "../data/use-planner-writes.ts",
};

function read(path: string) {
  return readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
}

interface Sent {
  write: OfflineWrite;
  scenario: string;
  variables: unknown;
}

function client(sent: Sent[] = []) {
  const queryClient = new QueryClient();
  registerOfflineWrites(queryClient, async (write, scenario, variables) => {
    sent.push({ write, scenario, variables });
    return [];
  });
  return queryClient;
}

/** A tap as a hook makes it: by key, with no function of its own. */
function tap(queryClient: QueryClient, write: OfflineWrite, variables: unknown) {
  const mutation = queryClient
    .getMutationCache()
    .build(queryClient, offlineWrite(write, "live"));
  void mutation.execute(variables).catch(() => undefined);
  return mutation;
}

function slotEvent(kind: string, at: string) {
  return [{ slotId: "slot-1", kind, clientEventId: `id-${kind}`, at }];
}

afterEach(() => onlineManager.setOnline(true));

describe("C2: every offline write is registered under its key", () => {
  it("has a default function for each write, found by the hook's key", () => {
    const queryClient = client();
    for (const write of OFFLINE_WRITES) {
      const defaults = queryClient.getMutationDefaults(
        offlineWriteKey(write, "live"),
      );
      expect(defaults.mutationFn, write).toBeTypeOf("function");
      expect(defaults.networkMode, write).toBe("online");
    }
  });

  it("each write hook passes its key and never a function of its own", () => {
    for (const [write, path] of Object.entries(HOOKS)) {
      const source = read(path);
      expect(source, path).toContain(`offlineWrite("${write}"`);
      expect(source, path).not.toMatch(/mutationFn\s*:/);
    }
  });
});

describe("C1's rule: a paused write survives a reload and replays in order", () => {
  it("sends the three taps once each, in order, with their own times", async () => {
    onlineManager.setOnline(false);
    const before = client();
    const taps = [
      slotEvent("started", "2026-10-17T09:00:00.000Z"),
      slotEvent("prompt_sent", "2026-10-17T09:12:00.000Z"),
      slotEvent("done", "2026-10-17T09:30:00.000Z"),
    ];
    for (const variables of taps) tap(before, "slotEvents", variables);
    expect(
      before
        .getMutationCache()
        .getAll()
        .every((m) => m.state.isPaused),
    ).toBe(true);

    // The reload: what the persister keeps, through its own serializer.
    const kept = superjson.parse<DehydratedState>(
      superjson.stringify(dehydrate(before, persistOptions.dehydrateOptions)),
    );
    const sent: Sent[] = [];
    const after = client(sent);
    hydrate(after, kept);

    onlineManager.setOnline(true);
    await after.resumePausedMutations();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(sent.map((s) => s.variables)).toEqual(taps);
    expect(sent.every((s) => s.scenario === "live")).toBe(true);
  });

  it("runs every offline write in one scope, so a work write waits its turn", () => {
    const scopes = OFFLINE_WRITES.map(
      (write) => offlineWrite(write, "live").scope.id,
    );
    expect(new Set(scopes).size).toBe(1);
  });

  it("never keeps a fixture scenario's reads or writes", () => {
    onlineManager.setOnline(false);
    const queryClient = client();
    queryClient.setQueryData(["today", "default", "2026-10-17"], { day: 1 });
    queryClient.setQueryData(["today", "live", "2026-10-17"], { day: 2 });
    queryClient
      .getMutationCache()
      .build(queryClient, offlineWrite("work", "default"))
      .execute({ method: "placeWork", args: [] })
      .catch(() => undefined);
    const kept = dehydrate(queryClient, persistOptions.dehydrateOptions);
    expect(kept.queries.map((q) => q.queryKey)).toEqual([
      ["today", "live", "2026-10-17"],
    ]);
    expect(kept.mutations).toEqual([]);
    expect(
      shouldPersistQuery(
        queryClient
          .getQueryCache()
          .find({ queryKey: ["today", "default", "2026-10-17"] })!,
      ),
    ).toBe(false);
  });
});

describe("C4: sign-out empties the persisted cache and the paused writes", () => {
  it("leaves no query, no write and no persisted copy", async () => {
    const store = new Map<string, string>();
    const persister = createAsyncStoragePersister({
      storage: {
        getItem: async (key) => store.get(key) ?? null,
        setItem: async (key, value) => void store.set(key, value),
        removeItem: async (key) => void store.delete(key),
      },
      throttleTime: 0,
    });
    onlineManager.setOnline(false);
    const queryClient = client();
    queryClient.setQueryData(["today", "live", "2026-10-17"], { day: 1 });
    tap(
      queryClient,
      "slotEvents",
      slotEvent("started", "2026-10-17T09:00:00.000Z"),
    );
    await persistQueryClientSave({
      queryClient,
      persister,
      dehydrateOptions: persistOptions.dehydrateOptions,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(await persister.restoreClient()).toBeDefined();

    await clearOfflineStore(queryClient, persister);

    expect(queryClient.getMutationCache().getAll()).toEqual([]);
    expect(queryClient.getQueryCache().getAll()).toEqual([]);
    expect(await persister.restoreClient()).toBeUndefined();
    expect(store.size).toBe(0);
  });
});

describe("offline, a queued tap counts in Today's clock as made", () => {
  const SLOT = "00000000-0000-4000-8000-000000000001";
  const tapped = {
    slotId: SLOT,
    kind: "started" as const,
    clientEventId: "00000000-0000-4000-8000-0000000000aa",
    at: "2026-10-17T09:00:00.000Z",
  };
  const records = (slotEvents: unknown[]) =>
    ({ slotEvents }) as unknown as Parameters<typeof withQueuedEvents>[0];

  it("adds the waiting event with its own time", () => {
    const merged = withQueuedEvents(records([]), [tapped]);
    expect(merged.slotEvents).toEqual([
      expect.objectContaining({
        slotId: SLOT,
        kind: "started",
        at: tapped.at,
        stepAwayId: null,
      }),
    ]);
  });

  it("never counts a tap the read already holds twice", () => {
    const held = records([{ ...tapped, id: "x", receivedAt: tapped.at }]);
    expect(withQueuedEvents(held, [tapped])).toBe(held);
  });
});
