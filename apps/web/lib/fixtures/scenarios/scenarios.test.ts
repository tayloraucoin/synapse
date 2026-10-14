import { describe, expect, it } from "vitest";
import type { z } from "zod";
import {
  blockChangeRecord,
  blockItemRecord,
  blockRecord,
  clientRecord,
  dayEventRecord,
  savedColourRecord,
  slotEventRecord,
  slotRecord,
  todoRecord,
  workItemRecord,
} from "@syn/validators";
import type { FixtureRecords } from "../records";
import { createFixtureServer, FixtureReadError } from "../server";
import { BASE_DATE } from "./base-day";
import { DEFAULT_SCENARIO, resolveScenario, scenarioNames } from "./index";

const SCHEMAS: {
  [
    K in Exclude<
      keyof FixtureRecords,
      "timeZone" | "dayCloseTime" | "account"
    >
  ]: z.ZodTypeAny;
} = {
  blocks: blockRecord,
  blockChanges: blockChangeRecord,
  blockItems: blockItemRecord,
  slots: slotRecord,
  workItems: workItemRecord,
  clients: clientRecord,
  todos: todoRecord,
  dayEvents: dayEventRecord,
  slotEvents: slotEventRecord,
  savedColours: savedColourRecord,
};

describe("C1: every scenario record parses with its @syn/validators schema", () => {
  it.each(scenarioNames())("%s", (name) => {
    const { records } = resolveScenario(name);
    for (const [table, schema] of Object.entries(SCHEMAS)) {
      for (const record of records[table as keyof typeof SCHEMAS]) {
        // Unchanged by a parse: no key dropped, none coerced.
        expect(schema.parse(record)).toEqual(record);
      }
    }
  });

  it("the default day has rows in every table it draws", () => {
    const { records } = resolveScenario("default");
    for (const table of [
      "blocks",
      "blockItems",
      "slots",
      "workItems",
      "clients",
      "todos",
      "slotEvents",
    ] as const) {
      expect(records[table].length).toBeGreaterThan(0);
    }
  });
});

describe("C5: ?state= names resolve to scenarios", () => {
  it("resolves each name to its own scenario", () => {
    for (const name of scenarioNames()) {
      expect(resolveScenario(name).name).toBe(name);
    }
  });

  it("resolves an unknown or missing name to the default", () => {
    expect(resolveScenario(null).name).toBe(DEFAULT_SCENARIO);
    expect(resolveScenario("").name).toBe(DEFAULT_SCENARIO);
    expect(resolveScenario("no-such-state").name).toBe(DEFAULT_SCENARIO);
    expect(resolveScenario("toString").name).toBe(DEFAULT_SCENARIO);
  });

  it("never settles the loading scenario", async () => {
    const scenario = resolveScenario("loading");
    const server = createFixtureServer(scenario, () => new Date(scenario.now));
    const outcome = await Promise.race([
      server.readToday(BASE_DATE).then(
        () => "settled",
        () => "settled",
      ),
      new Promise((resolve) => setTimeout(() => resolve("pending"), 50)),
    ]);
    expect(outcome).toBe("pending");
  });

  it("rejects the error scenario until retried", async () => {
    const scenario = resolveScenario("error");
    const server = createFixtureServer(scenario, () => new Date(scenario.now));
    await expect(server.readToday(BASE_DATE)).rejects.toBeInstanceOf(
      FixtureReadError,
    );
    await expect(server.readToday(BASE_DATE)).rejects.toBeInstanceOf(
      FixtureReadError,
    );
    server.recover();
    await expect(server.readToday(BASE_DATE)).resolves.toMatchObject({
      date: BASE_DATE,
    });
  });

  it("gives each resolve its own copy of the records", () => {
    const a = resolveScenario("default");
    a.records.blocks.pop();
    expect(resolveScenario("default").records.blocks.length).toBe(
      a.records.blocks.length + 1,
    );
  });
});
