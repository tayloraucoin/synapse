import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { Mutation, Query } from "@tanstack/react-query";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";
import { del, get, set } from "idb-keyval";
import superjson from "superjson";
import { isOfflineWriteKey } from "./writes";

/**
 * The cache on the device (USE-106; C4): TanStack's queries and its paused
 * writes, in IndexedDB through idb-keyval, so a tap made offline survives a
 * reload or a killed app and the last-read day shows. Live keys only: a
 * fixture scenario (`?state=`) runs with no persister at all, and its keys
 * are never written here either.
 *
 * Devs' call [ASSUMPTION]: one key, `synapse-cache`; a buster that changes
 * when a persisted shape does; seven days, after which the cache is personal
 * data with no use left and is dropped. superjson, as on the tRPC link, so a
 * `Date` comes back a `Date`.
 */

export const PERSIST_KEY = "synapse-cache";
export const PERSIST_BUSTER = "use-106.1";
export const PERSIST_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/** The live reads the offline screens are drawn from (devs' call). */
export const PERSISTED_QUERIES = new Set([
  "today",
  "planner-week",
  "work-pool",
  "todos",
  "connections",
  "account",
]);

const LIVE = "live";

export function shouldPersistQuery(query: Query): boolean {
  const [name, scenario] = query.queryKey;
  return (
    query.state.status === "success" &&
    scenario === LIVE &&
    typeof name === "string" &&
    PERSISTED_QUERIES.has(name)
  );
}

/** A paused live write (TanStack's default), and only one of the offline writes. */
export function shouldPersistMutation(mutation: Mutation): boolean {
  const key = mutation.options.mutationKey;
  return mutation.state.isPaused && isOfflineWriteKey(key) && key?.[2] === LIVE;
}

const storage = {
  getItem: (key: string) => get<string>(key).then((value) => value ?? null),
  setItem: (key: string, value: string) => set(key, value),
  removeItem: (key: string) => del(key),
};

export const persister = createAsyncStoragePersister({
  storage: typeof window === "undefined" ? undefined : storage,
  key: PERSIST_KEY,
  serialize: (client) => superjson.stringify(client),
  deserialize: (cached) => superjson.parse(cached),
});

export const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
  persister,
  buster: PERSIST_BUSTER,
  maxAge: PERSIST_MAX_AGE,
  dehydrateOptions: {
    shouldDehydrateQuery: shouldPersistQuery,
    shouldDehydrateMutation: shouldPersistMutation,
  },
};
