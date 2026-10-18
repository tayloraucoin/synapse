import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { scenarioNames } from "@/lib/fixtures/scenarios";
import type { TrpcClient } from "@/lib/trpc/client";
import { createDataSource, getDataSource, LIVE_SCENARIO } from "./source";

/**
 * USE-90's switch, without its fallback (USE-108): `?state=` keeps the
 * fixtures outside production; without it every method is a tRPC call, and
 * a production build never reads a fixture. C4, the refusal over the wire,
 * is `lib/trpc/refusal.test.ts`; the bundle is `imports.test.ts`.
 */

const fixtures = vi.hoisted(() => ({ server: 0, scenario: 0 }));

vi.mock("@/lib/fixtures/server", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/fixtures/server")>();
  return {
    ...actual,
    createFixtureServer: (
      ...args: Parameters<typeof actual.createFixtureServer>
    ) => {
      fixtures.server += 1;
      return actual.createFixtureServer(...args);
    },
  };
});

vi.mock("@/lib/fixtures/scenarios", async (importActual) => {
  const actual =
    await importActual<typeof import("@/lib/fixtures/scenarios")>();
  return {
    ...actual,
    resolveScenario: (name: string | null) => {
      fixtures.scenario += 1;
      return actual.resolveScenario(name);
    },
  };
});

/**
 * A tRPC client that answers every procedure, recording its path: a query
 * resolves to `[]`, `user.me` to an account's zone.
 */
function fakeClient() {
  const calls: string[] = [];
  const at = (keys: string[]): unknown =>
    new Proxy(() => {}, {
      get: (_target, key) =>
        typeof key === "string" && key !== "then"
          ? at([...keys, key])
          : undefined,
      apply: () => {
        const name = keys.slice(0, -1).join(".");
        calls.push(name);
        return Promise.resolve(
          name === "user.me"
            ? { timezone: "Europe/Paris", dayCloseTime: "04:00:00" }
            : [],
        );
      },
    });
  return { calls, client: at([]) as TrpcClient };
}

describe("?state= outside production", () => {
  it("returns the fixture server for that scenario, as before", async () => {
    const source = getDataSource("empty");
    expect(source.live).toBe(false);
    expect(source.scenario.name).toBe("empty");
    // The scenario's clock, not the real one.
    expect(
      source.now().getTime() - Date.parse(source.scenario.now),
    ).toBeLessThan(60_000);
    expect(getDataSource("empty")).toBe(source);
    const day = await source.server.readToday(source.todayKey());
    expect(day.blocks).toEqual(source.scenario.records.blocks);
  });

  it("names the default scenario for an unknown name", () => {
    expect(getDataSource("no-such-state").scenario.name).toBe("default");
  });

  it("C3: resolves each registered name to its own scenario", () => {
    const names = scenarioNames();
    expect(names.length).toBeGreaterThan(50);
    const wrong = names.filter((name) => {
      const source = getDataSource(name);
      return source.live || source.scenario.name !== name;
    });
    expect(wrong).toEqual([]);
  });

  it("carries a capture's seeds, and none live", () => {
    expect(getDataSource("panel-training").seeds.blockPanel).toEqual(
      expect.objectContaining({ dateKey: "2026-10-12" }),
    );
    const { client } = fakeClient();
    expect(createDataSource(null, { production: false, client }).seeds).toEqual(
      {},
    );
  });
});

describe("C1: without ?state=, every domain is live", () => {
  it("calls tRPC for a domain the fixtures used to answer", async () => {
    const { calls, client } = fakeClient();
    const source = createDataSource(null, { production: false, client });
    expect(source.live).toBe(true);
    expect(source.scenario.name).toBe(LIVE_SCENARIO);
    fixtures.server = 0;
    fixtures.scenario = 0;
    await source.server.listMealTopics();
    await source.server.removeDayEvent({
      id: "00000000-0000-4000-8000-000000000001",
    });
    await source.server.readMorning("2026-10-12");
    expect(calls).toEqual([
      "planner.mealTopics.list",
      "planner.removeDayEvent",
      "morning.reading",
      "morning.day",
    ]);
    expect(fixtures).toEqual({ server: 0, scenario: 0 });
  });

  it("answers every fixture server method, with no fallback", () => {
    const { client } = fakeClient();
    const live = createDataSource(null, { production: false, client }).server;
    const fixture = getDataSource("default").server;
    const missing = Object.keys(fixture).filter(
      (method) =>
        typeof (live as unknown as Record<string, unknown>)[method] !==
        "function",
    );
    expect(missing).toEqual([]);
  });

  it("makes the fixtures' retries no-ops and runs on the real clock", () => {
    const { calls, client } = fakeClient();
    const source = createDataSource(null, { production: true, client });
    expect(() => {
      source.server.recover();
      source.server.recoverReading();
      source.server.recoverTodos();
      source.server.reconnect();
      source.server.recoverConnections();
      source.server.recoverCalendars();
    }).not.toThrow();
    expect(calls).toEqual([]);
    expect(Math.abs(source.now().getTime() - Date.now())).toBeLessThan(1000);
    expect(source.todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("a production build", () => {
  it("ignores ?state= and loads no fixture on the live path", async () => {
    const { client } = fakeClient();
    fixtures.server = 0;
    fixtures.scenario = 0;
    const source = createDataSource("now-running", {
      production: true,
      client,
    });
    expect(source.live).toBe(true);
    expect(source.scenario.name).toBe(LIVE_SCENARIO);
    expect(source.scenario.records.blocks).toEqual([]);
    await source.server.listSavedColours();
    await source.server.readToday("2026-10-12").catch(() => undefined);
    expect(fixtures).toEqual({ server: 0, scenario: 0 });
  });

  it("imports the fixtures in lib/data/live only as types", () => {
    const live = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "live",
    );
    const hits = readdirSync(live)
      .filter((name) => /\.tsx?$/.test(name))
      .flatMap((name) =>
        [
          ...readFileSync(path.join(live, name), "utf8").matchAll(
            /^import(\s+type)?\b[^;]*?from\s+["']([^"']+)["']/gm,
          ),
        ]
          .filter(
            (match) =>
              match[1] === undefined && /lib\/fixtures|^\.\.\//.test(match[2]!),
          )
          .map((match) => `${name} → ${match[2]}`),
      );
    expect(hits).toEqual([]);
  });
});
