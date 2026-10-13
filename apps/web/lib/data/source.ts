import { useQueryState } from "nuqs";
import { resolveScenario, type Scenario } from "@/lib/fixtures/scenarios";
import { createFixtureServer, type FixtureServer } from "@/lib/fixtures/server";

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
}

const sources = new Map<string, DataSource>();

export function getDataSource(name: string | null): DataSource {
  const scenario = resolveScenario(name);
  const existing = sources.get(scenario.name);
  if (existing) return existing;
  const base = Date.parse(scenario.now);
  const loadedAt = Date.now();
  const now = () => new Date(base + (Date.now() - loadedAt));
  const source = { scenario, server: createFixtureServer(scenario, now), now };
  sources.set(scenario.name, source);
  return source;
}

export function useDataSource(): DataSource {
  const [state] = useQueryState("state");
  return getDataSource(state);
}
