import { createContext, useContext } from "react";
import { useQueryState } from "nuqs";
import { resolveDayKey } from "@syn/utils";
import { resolveScenario, type Scenario } from "@/lib/fixtures/scenarios";
import { createFixtureServer, type FixtureServer } from "@/lib/fixtures/server";
import { useOnline } from "@/lib/hooks/use-online";

/**
 * The one place a data hook gets its server (USE-7): the scenario `?state=`
 * names, and the fixture server for it. Wave 3 replaces the hook bodies with
 * tRPC and this file goes with the fixtures.
 *
 * One server per scenario name for the life of the page: it is the fake
 * backend, not client state. What the UI reads still comes through TanStack
 * Query, as it will from tRPC.
 */

export interface DataSource {
  scenario: Scenario;
  server: FixtureServer;
  /** The fixture clock: the scenario's `now`, plus real time since it loaded. */
  now: () => Date;
  /** The day key at the fixture clock's now, in the person's zone. */
  todayKey: () => string;
}

const sources = new Map<string, DataSource>();

export function getDataSource(name: string | null): DataSource {
  const scenario = resolveScenario(name);
  const existing = sources.get(scenario.name);
  if (existing) return existing;
  const base = Date.parse(scenario.now);
  const loadedAt = Date.now();
  const now = () => new Date(base + (Date.now() - loadedAt));
  const { timeZone, dayCloseTime } = scenario.records;
  const todayKey = () => resolveDayKey(now(), timeZone, dayCloseTime);
  const source = {
    scenario,
    server: createFixtureServer(scenario, now),
    now,
    todayKey,
  };
  sources.set(scenario.name, source);
  return source;
}

/**
 * A scenario pinned by name for a subtree, over `?state=`: the capture host
 * renders a screen's state under a part name of its own (USE-16).
 */
const PinnedScenario = createContext<string | null>(null);
export const PinnedScenarioProvider = PinnedScenario.Provider;

export function useDataSource(): DataSource {
  const pinned = useContext(PinnedScenario);
  const [state] = useQueryState("state");
  return getDataSource(pinned ?? state);
}

/**
 * No connection (USE-21): the scenario's `offline`, else the browser's own
 * signal (`useOnline`). Offline is not an error: every check still works.
 */
export function useIsOffline(): boolean {
  const online = useOnline();
  return useDataSource().scenario.offline === true || !online;
}
