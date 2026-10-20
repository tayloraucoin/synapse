import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dehydrate, onlineManager, QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readingListRecord } from "@syn/validators";
import { findPart } from "@/lib/fixtures/parts";
import { resolveScenario, scenarioNames } from "@/lib/fixtures/scenarios";
import { READING_IDS } from "@/lib/fixtures/scenarios/morning-reading";
import { createFixtureServer } from "@/lib/fixtures/server";
import { persistOptions } from "@/lib/offline/persister";
import type { TrpcClient } from "@/lib/trpc/client";
import { morningReadingDomain } from "./live/morning-reading";
import { FixtureOfflineError, MorningReadingRefusal } from "./refusals";
import {
  morningReadingMutationOptions,
  type ReadingCall,
} from "./use-morning-reading";

/**
 * USE-151: Settings › Morning reading's data. C4: the fixture list has the
 * router's shape, the live domain parses before it calls, and Orient reads
 * the order this screen writes. C5: offline nothing is sent, paused or
 * persisted (D-USE-129). C6: every key in the ledger's States table is a
 * `morning-reading-<key>` scenario and a `/dev/parts` part (C-P08).
 */

const R = READING_IDS;
const AT = "2026-10-12T21:40:00-04:00";

function setup(name = "morning-reading-list") {
  return createFixtureServer(resolveScenario(name), () => new Date(AT));
}

describe("C4: one list shape, and Orient's order is this screen's", () => {
  it("the fixture's list parses as the router's record, nothing dropped", async () => {
    const list = await setup().readMorningReading();
    expect(readingListRecord.parse(list)).toEqual(list);
    expect(list.passages.map((p) => p.id)).toEqual([R.feet, R.slow, R.kettle]);
    expect(list.passagesOff.map((p) => p.id)).toEqual([R.longView]);
    expect(list.links.map((l) => l.id)).toEqual([R.calm, R.stretching]);
    expect(list.linksOff.map((l) => l.id)).toEqual([R.cup]);
  });

  it("the live domain reads morning.list and returns its answer as is", async () => {
    const fixture = await setup().readMorningReading();
    const query = vi.fn(async () => fixture);
    const live = morningReadingDomain.methods({
      morning: { list: { query } },
    } as unknown as TrpcClient);
    await expect(live.readMorningReading()).resolves.toEqual(fixture);
    expect(query).toHaveBeenCalledOnce();
  });

  it("live, a bad save is refused in the schema's words before any call", async () => {
    const mutate = vi.fn();
    const live = morningReadingDomain.methods({
      morning: { saveLink: { mutate } },
    } as unknown as TrpcClient);
    await expect(
      live.saveReadingLink({ title: "Notes", url: "http://example.org" }),
    ).rejects.toBeInstanceOf(MorningReadingRefusal);
    expect(mutate).not.toHaveBeenCalled();
  });

  it("after a reorder, Orient's readReading returns the list's order", async () => {
    const server = setup();
    const ids = [R.kettle, R.feet, R.slow];
    await server.reorderReading({ kind: "passage", ids });
    await server.reorderReading({
      kind: "link",
      ids: [R.stretching, R.calm],
    });
    const list = await server.readMorningReading();
    const orient = await server.readReading("2026-10-12");
    expect(list.passages.map((p) => p.id)).toEqual(ids);
    expect(orient.passages.map((p) => p.id)).toEqual(ids);
    expect(orient.links.map((l) => l.id)).toEqual(list.links.map((l) => l.id));
  });

  it("off rows are absent from Orient; Turn on lands at the end, Undo in place", async () => {
    const server = setup();
    await server.turnReadingOff({ kind: "passage", id: R.slow });
    let orient = await server.readReading("2026-10-12");
    expect(orient.passages.map((p) => p.id)).toEqual([R.feet, R.kettle]);
    await server.turnReadingOn({ kind: "passage", id: R.slow, restore: true });
    orient = await server.readReading("2026-10-12");
    expect(orient.passages.map((p) => p.id)).toEqual([
      R.feet,
      R.slow,
      R.kettle,
    ]);
    await server.turnReadingOn({ kind: "passage", id: R.longView });
    const list = await server.readMorningReading();
    expect(list.passages.map((p) => p.id)).toEqual([
      R.feet,
      R.slow,
      R.kettle,
      R.longView,
    ]);
  });

  it("a stale reorder and a delete of a row that is on are refused, as the service refuses them", async () => {
    const server = setup();
    await expect(
      server.reorderReading({ kind: "passage", ids: [R.feet, R.slow] }),
    ).rejects.toMatchObject({ reason: "incomplete_reorder" });
    await expect(
      server.deleteReadingRow({ kind: "passage", id: R.feet }),
    ).rejects.toMatchObject({ reason: "not_off" });
    await server.deleteReadingRow({ kind: "passage", id: R.longView });
    expect((await server.readMorningReading()).passagesOff).toEqual([]);
  });
});

describe("C5: offline, nothing is written or kept to replay", () => {
  afterEach(() => onlineManager.setOnline(true));

  const calls: ReadingCall[] = [
    { method: "saveReadingPassage", args: [{ title: null, bodyMd: "Words." }] },
    { method: "saveReadingLink", args: [{ title: "A", url: "https://a.org" }] },
    {
      method: "reorderReading",
      args: [{ kind: "passage", ids: [R.slow, R.feet, R.kettle] }],
    },
    { method: "turnReadingOff", args: [{ kind: "passage", id: R.feet }] },
    { method: "turnReadingOn", args: [{ kind: "passage", id: R.longView }] },
    { method: "deleteReadingRow", args: [{ kind: "passage", id: R.longView }] },
  ];

  it.each(calls.map((call) => [call.method, call] as const))(
    "%s is refused before the server is called, never paused, never persisted",
    async (_method, call) => {
      onlineManager.setOnline(false);
      const server = setup();
      const spy = vi.spyOn(server, call.method);
      const client = new QueryClient();
      const mutation = client.getMutationCache().build(
        client,
        morningReadingMutationOptions(server, () => true),
      );
      await expect(mutation.execute(call)).rejects.toBeInstanceOf(
        FixtureOfflineError,
      );
      expect(spy).not.toHaveBeenCalled();
      expect(mutation.state.isPaused).toBe(false);
      const kept = dehydrate(client, persistOptions.dehydrateOptions);
      expect(kept.mutations).toEqual([]);
    },
  );

  it("the offline scenario's list still reads, and its server refuses a write that slips through", async () => {
    const server = setup("morning-reading-offline");
    expect((await server.readMorningReading()).passages).toHaveLength(3);
    await expect(
      server.turnReadingOff({ kind: "passage", id: R.feet }),
    ).rejects.toBeInstanceOf(FixtureOfflineError);
    expect((await server.readMorningReading()).passages).toHaveLength(3);
  });
});

describe("C6: every state in the ledger is reachable by ?state=", () => {
  const ledger = readFileSync(
    fileURLToPath(
      new URL(
        "../../../../specs/web/epics/USE-daily-use/ux/account/morning-reading/index.md",
        import.meta.url,
      ),
    ),
    "utf8",
  );
  const keys = [...ledger.matchAll(/`states\/([a-z-]+)\.md`/g)].map(
    (match) => match[1]!,
  );

  it("the States table names the 22 drawn states", () => {
    expect(new Set(keys).size).toBe(22);
  });

  it.each(keys)("morning-reading-%s is a scenario and a part", (key) => {
    const name = `morning-reading-${key}`;
    expect(scenarioNames()).toContain(name);
    expect(resolveScenario(name).name).toBe(name);
    expect(findPart(name)).toBeDefined();
  });
});
