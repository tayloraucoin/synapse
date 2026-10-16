import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import type { TrpcClient } from "@/lib/trpc/client";
import { UnwiredDomain } from "./live/errors";
import type { LiveDomain } from "./live/domains";
import { createDataSource, getDataSource, LIVE_SCENARIO } from "./source";

/**
 * USE-90's switch: `?state=` keeps the fixtures outside production; without
 * it the live server answers, a wired domain through tRPC and the rest from
 * the default scenario (development) or as `UnwiredDomain` (a build). C4,
 * the refusal over the wire, is `lib/trpc/refusal.test.ts`.
 */

const fixtures = vi.hoisted(() => ({ server: 0, scenario: 0 }));

vi.mock("@/lib/fixtures/server", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/fixtures/server")>();
  return {
    ...actual,
    createFixtureServer: (...args: Parameters<typeof actual.createFixtureServer>) => {
      fixtures.server += 1;
      return actual.createFixtureServer(...args);
    },
  };
});

vi.mock("@/lib/fixtures/scenarios", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/fixtures/scenarios")>();
  return {
    ...actual,
    resolveScenario: (name: string | null) => {
      fixtures.scenario += 1;
      return actual.resolveScenario(name);
    },
  };
});

const COLOURS = [
  { id: "c1", hex: "#5B4B8A", label: null, sortOrder: 1 },
];

/** A tRPC client with one made-up procedure, counting its calls. */
function fakeClient() {
  const calls: string[] = [];
  const client = {
    colour: {
      list: {
        query: () => {
          calls.push("colour.list");
          return Promise.resolve(COLOURS);
        },
      },
    },
    user: {
      me: {
        query: () =>
          Promise.resolve({ timezone: "Europe/Paris", dayCloseTime: "04:00:00" }),
      },
    },
  };
  return { calls, client: client as unknown as TrpcClient };
}

type FakeClient = ReturnType<typeof fakeClient>["client"] & {
  colour: { list: { query: () => Promise<typeof COLOURS> } };
};

/** A domain marked live: saved colours, from the made-up procedure. */
const colours: LiveDomain = {
  name: "colours",
  methods: (client) => ({
    listSavedColours: () =>
      (client as FakeClient).colour.list.query() as never,
  }),
};

describe("C1: ?state= outside production", () => {
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
});

describe("C2: without ?state=", () => {
  it("calls the tRPC client for a domain marked live", async () => {
    const { calls, client } = fakeClient();
    const source = createDataSource(null, {
      production: false,
      client,
      domains: [colours],
    });
    expect(source.live).toBe(true);
    expect(source.scenario.name).toBe(LIVE_SCENARIO);
    await expect(source.server.listSavedColours()).resolves.toEqual(COLOURS);
    expect(calls).toEqual(["colour.list"]);
  });

  it("falls back to the default scenario for a domain not yet live", async () => {
    const { calls, client } = fakeClient();
    const source = createDataSource(null, {
      production: false,
      client,
      domains: [colours],
    });
    const fixture = getDataSource("default");
    await expect(source.server.listMealTopics()).resolves.toEqual(
      await fixture.server.listMealTopics(),
    );
    expect(calls).toEqual([]);
  });

  it("rejects with UnwiredDomain in a production build", async () => {
    const { client } = fakeClient();
    const source = createDataSource(null, {
      production: true,
      client,
      domains: [colours],
    });
    const read = source.server.listMealTopics();
    await expect(read).rejects.toBeInstanceOf(UnwiredDomain);
    await expect(read).rejects.toMatchObject({ method: "listMealTopics" });
    await expect(source.server.listSavedColours()).resolves.toEqual(COLOURS);
  });

  it("makes the fixtures' retries no-ops and runs on the real clock", () => {
    const { client } = fakeClient();
    const source = createDataSource(null, { production: true, client });
    expect(() => {
      source.server.recover();
      source.server.recoverReading();
      source.server.recoverTodos();
      source.server.reconnect();
    }).not.toThrow();
    expect(Math.abs(source.now().getTime() - Date.now())).toBeLessThan(1000);
    expect(source.todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("C3: a production build", () => {
  it("ignores ?state= and loads no fixture on the live path", async () => {
    const { client } = fakeClient();
    fixtures.server = 0;
    fixtures.scenario = 0;
    const source = createDataSource("now-running", {
      production: true,
      client,
      domains: [colours],
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
