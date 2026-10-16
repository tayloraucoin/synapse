import { createContext, useContext } from "react";
import { QueryClientContext, type QueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { resolveDayKey } from "@syn/utils";
import {
  DEFAULT_SCENARIO,
  resolveScenario,
  type Scenario,
} from "@/lib/fixtures/scenarios";
import { createFixtureServer, type FixtureServer } from "@/lib/fixtures/server";
import { useOnline } from "@/lib/hooks/use-online";
import type { TrpcClient } from "@/lib/trpc/client";
import { isProductionBuild, trpcClient } from "@/lib/trpc/provider";
import { deviceZone, liveRecords, readAccountZone } from "./live/clock";
import { LIVE_DOMAINS, type LiveDomain } from "./live/domains";
import { createLiveServer } from "./live/server";

/**
 * The one place a data hook gets its server (USE-7, USE-90). Outside a
 * production build, `?state=` names a scenario and its fixture server, the
 * captures' source. Otherwise the server is the live one: each domain's
 * methods call tRPC once its wave 3 ticket lists it in `LIVE_DOMAINS`, and an
 * unwired method falls back to the default scenario (development) or fails
 * as `UnwiredDomain` (a production build, which never reads a fixture).
 *
 * One source per name for the life of the page. What the UI reads still
 * comes through TanStack Query under the hooks' own keys; the live source's
 * name is `"live"`, so a live cache never mixes with a fixture cache.
 */

export interface DataSource {
  scenario: Scenario;
  server: FixtureServer;
  /** The clock: real time live; the scenario's `now` plus real time since it loaded. */
  now: () => Date;
  /** The day key at the clock's now, in the person's zone. */
  todayKey: () => string;
  /** Whether this is the live source rather than a fixture scenario. */
  live: boolean;
}

export const LIVE_SCENARIO = "live";

/**
 * Call C3 (`technical/calls.md`): live reads refetch on window focus, and
 * Today's read every 15 s while the page is visible. Applied by the source
 * (`applyLiveQueryDefaults`), never by a surface.
 */
export const LIVE_QUERY_DEFAULTS = {
  refetchOnWindowFocus: true,
  today: {
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  },
} as const;

export interface SourceOptions {
  production: boolean;
  client: TrpcClient;
  domains?: readonly LiveDomain[];
}

function createFixtureSource(scenario: Scenario): DataSource {
  const base = Date.parse(scenario.now);
  const loadedAt = Date.now();
  const now = () => new Date(base + (Date.now() - loadedAt));
  const { timeZone, dayCloseTime } = scenario.records;
  const todayKey = () => resolveDayKey(now(), timeZone, dayCloseTime);
  return {
    scenario,
    server: createFixtureServer(scenario, now),
    now,
    todayKey,
    live: false,
  };
}

function createLiveSource({
  production,
  client,
  domains,
}: SourceOptions): DataSource {
  const records = liveRecords(deviceZone());
  const scenario: Scenario = {
    name: LIVE_SCENARIO,
    now: new Date().toISOString(),
    records,
    mode: "ready",
  };
  const now = () => new Date();
  const todayKey = () =>
    resolveDayKey(now(), records.timeZone, records.dayCloseTime);

  // The default scenario answers what is not live yet, on the live clock.
  let fallbackServer: FixtureServer | null = null;
  const fallback = production
    ? null
    : () =>
        (fallbackServer ??= createFixtureServer(
          resolveScenario(DEFAULT_SCENARIO),
          now,
        ));

  if (typeof window !== "undefined") {
    void readAccountZone(client).then((zone) => {
      if (zone) Object.assign(records, zone);
    });
  }

  return {
    scenario,
    server: createLiveServer(client, { domains, fallback }),
    now,
    todayKey,
    live: true,
  };
}

/** The source for a `?state=` name (or none), uncached: the switch itself. */
export function createDataSource(
  name: string | null,
  options: SourceOptions,
): DataSource {
  if (name !== null && !options.production) {
    return createFixtureSource(resolveScenario(name));
  }
  return createLiveSource(options);
}

const sources = new Map<string, DataSource>();

export function getDataSource(name: string | null): DataSource {
  const fixture = name !== null && !isProductionBuild;
  const key = fixture ? resolveScenario(name).name : LIVE_SCENARIO;
  const existing = sources.get(key);
  if (existing) return existing;
  const source = createDataSource(fixture ? name : null, {
    production: isProductionBuild,
    client: trpcClient,
    domains: LIVE_DOMAINS,
  });
  sources.set(key, source);
  return source;
}

const withLiveDefaults = new WeakSet<QueryClient>();

/**
 * Call C3's refetching, on the live keys only: TanStack's own focus refetch
 * covers every live read, and Today's day (`["today", "live", …]`) also
 * polls. Fixture keys are left as they are, so captures stay still.
 */
export function applyLiveQueryDefaults(queryClient: QueryClient) {
  if (withLiveDefaults.has(queryClient)) return;
  withLiveDefaults.add(queryClient);
  // todayQueryKey(LIVE_SCENARIO), written out: use-today imports this file.
  queryClient.setQueryDefaults(["today", LIVE_SCENARIO], {
    refetchOnWindowFocus: LIVE_QUERY_DEFAULTS.refetchOnWindowFocus,
    ...LIVE_QUERY_DEFAULTS.today,
  });
}

/**
 * A scenario pinned by name for a subtree, over `?state=`: the capture host
 * renders a screen's state under a part name of its own (USE-16).
 */
const PinnedScenario = createContext<string | null>(null);
export const PinnedScenarioProvider = PinnedScenario.Provider;

export function useDataSource(): DataSource {
  const pinned = useContext(PinnedScenario);
  const queryClient = useContext(QueryClientContext);
  const [state] = useQueryState("state");
  const source = getDataSource(pinned ?? state);
  if (source.live && queryClient) applyLiveQueryDefaults(queryClient);
  return source;
}

/**
 * No connection (USE-21): the scenario's `offline`, else the browser's own
 * signal (`useOnline`). Offline is not an error: every check still works.
 */
export function useIsOffline(): boolean {
  const online = useOnline();
  return useDataSource().scenario.offline === true || !online;
}
