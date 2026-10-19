import { describe, expect, it } from "vitest";
import { resolveScenario } from "./scenarios";
import { BASE_DATE } from "./scenarios/base-day";
import {
  createFixtureServer,
  FixtureOfflineError,
  FixtureReadingError,
} from "./server";

/** A server on an Orient scenario with a clock the test moves. */
function setup(name = "orient-success") {
  const scenario = resolveScenario(name);
  let nowMs = Date.parse(scenario.now);
  const server = createFixtureServer(scenario, () => new Date(nowMs));
  return {
    server,
    at: () => new Date(nowMs).toISOString(),
    advance(minutes: number) {
      nowMs += minutes * 60_000;
    },
  };
}

describe("C9: the orient stamp writes orientedAt once", () => {
  it("stamps the first open and keeps it on a second", async () => {
    const { server, at, advance } = setup();
    expect((await server.readToday(BASE_DATE)).dayRecord).toBeNull();

    const first = at();
    const record = await server.stampOrient(BASE_DATE, first);
    expect(record.orientedAt).toBe(first);
    expect(record.readyAt).toBeNull();

    advance(12);
    const again = await server.stampOrient(BASE_DATE, at());
    expect(again.orientedAt).toBe(first);
    expect((await server.readToday(BASE_DATE)).dayRecord?.orientedAt).toBe(
      first,
    );
  });

  it("stamps the late open at its own time, 8:10", async () => {
    const { server, at } = setup("orient-late");
    const record = await server.stampOrient(BASE_DATE, at());
    expect(Date.parse(record.orientedAt!)).toBe(
      Date.parse("2026-10-12T08:10:00-04:00"),
    );
    expect((await server.readToday(BASE_DATE)).usualWakeTime).toBe("07:00");
  });
});

describe("C9: a morning-lines write changes only the lines it sends", () => {
  it("leaves the other lines as they were", async () => {
    const { server } = setup();
    const before = (await server.readMorningDay(BASE_DATE)).lines;
    expect(before?.grateful).toMatch(/^A slow start/);

    const written = await server.writeMorningLines({
      onDate: BASE_DATE,
      intention: "Ship the first Primary before lunch.",
    });
    expect(written).toEqual({
      ...before,
      intention: "Ship the first Primary before lunch.",
    });

    const cleared = await server.writeMorningLines({
      onDate: BASE_DATE,
      grateful: "",
    });
    expect(cleared.grateful).toBe("");
    expect(cleared.intention).toBe("Ship the first Primary before lunch.");
    expect(cleared.todayAsISeeIt).toBeNull();
  });

  it("starts the date's lines on a first write", async () => {
    const { server } = setup("orient-loading");
    expect((await server.readMorningDay(BASE_DATE)).lines).toBeNull();
    const written = await server.writeMorningLines({
      onDate: BASE_DATE,
      todayAsISeeIt: "A long walk first.",
    });
    expect(written).toEqual({
      onDate: BASE_DATE,
      grateful: null,
      intention: null,
      todayAsISeeIt: "A long walk first.",
    });
  });

  it("refuses a line past its limit", async () => {
    const { server } = setup();
    await expect(
      server.writeMorningLines({
        onDate: BASE_DATE,
        intention: "x".repeat(141),
      }),
    ).rejects.toThrow();
  });

  it("waits offline, and goes through once the connection is back", async () => {
    const { server } = setup("orient-offline");
    const patch = { onDate: BASE_DATE, intention: "Ship it." };
    await expect(server.writeMorningLines(patch)).rejects.toBeInstanceOf(
      FixtureOfflineError,
    );
    server.reconnect();
    await expect(server.writeMorningLines(patch)).resolves.toMatchObject(patch);
  });
});

describe("the reading alone waits or fails", () => {
  it("fails the reading until retried, while the lines still read", async () => {
    const { server } = setup("orient-error");
    await expect(server.readReading(BASE_DATE)).rejects.toBeInstanceOf(
      FixtureReadingError,
    );
    await expect(server.readMorningDay(BASE_DATE)).resolves.toMatchObject({
      lastNight: { onDate: "2026-10-11" },
    });
    server.recoverReading();
    const reading = await server.readReading(BASE_DATE);
    expect(reading.passages).toHaveLength(2);
    expect(reading.links).toHaveLength(2);
  });

  it("reads the whole morning as one", async () => {
    const { server } = setup();
    const morning = await server.readMorning(BASE_DATE);
    expect(Object.keys(morning).sort()).toEqual([
      "lastNight",
      "lines",
      "links",
      "passages",
      // USE-13: the evening's prompts, for Last night's captions.
      "prompts",
      "quote",
    ]);
    expect(morning.quote?.onDate).toBe(BASE_DATE);
  });

  it("has no passages and no evening on the empty morning, and keeps the links", async () => {
    const { server } = setup("orient-empty");
    const morning = await server.readMorning(BASE_DATE);
    expect(morning.passages).toEqual([]);
    expect(morning.quote).toBeNull();
    expect(morning.lastNight).toBeNull();
    expect(morning.links).toHaveLength(2);
  });
});
