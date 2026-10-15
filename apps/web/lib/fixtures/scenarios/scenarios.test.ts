import { describe, expect, it } from "vitest";
import type { z } from "zod";
import {
  blockChangeRecord,
  blockItemRecord,
  blockRecord,
  clientRecord,
  dayBoundsRecord,
  dayEventRecord,
  dayRecordRecord,
  journalEntryRecord,
  linkRecord,
  mealTopicRecord,
  morningLinesRecord,
  passageRecord,
  quoteRecord,
  savedColourRecord,
  slotEventRecord,
  slotRecord,
  todoRecord,
  workItemRecord,
} from "@syn/validators";
import { deriveSetUpDay } from "@/lib/data/use-set-up-day";
import type { FixtureRecords } from "../records";
import { createFixtureServer, FixtureReadError } from "../server";
import { BASE_DATE } from "./base-day";
import { DEFAULT_SCENARIO, resolveScenario, scenarioNames } from "./index";
import { SET_UP_NOW } from "./set-up";

const SCHEMAS: {
  [
    K in Exclude<
      keyof FixtureRecords,
      | "timeZone"
      | "dayCloseTime"
      | "account"
      | "usualWakeTime"
      | "clientsEnabled"
      // USE-13: the account's evening prompts, a setting, not a table.
      | "journalPrompts"
      // USE-56: Linear and Google, parsed by their views in integrations.test.ts.
      | "integrations"
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
  // USE-36 (C1): the set-up scenarios' bounds too.
  dayBounds: dayBoundsRecord,
  slotEvents: slotEventRecord,
  savedColours: savedColourRecord,
  // USE-12 (C9): every morning record parses too.
  dayRecords: dayRecordRecord,
  passages: passageRecord,
  links: linkRecord,
  quotes: quoteRecord,
  morningLines: morningLinesRecord,
  journalEntries: journalEntryRecord,
  // USE-22: the meal topics, where a scenario has them.
  mealTopics: mealTopicRecord,
};

describe("C1: every scenario record parses with its @syn/validators schema", () => {
  it.each(scenarioNames())("%s", (name) => {
    const { records } = resolveScenario(name);
    for (const [table, schema] of Object.entries(SCHEMAS)) {
      for (const record of records[table as keyof typeof SCHEMAS] ?? []) {
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

describe("C1 (USE-36): the set-up scenarios read back as the boards draw them", () => {
  async function week(name: string, ref: string) {
    const scenario = resolveScenario(name);
    const server = createFixtureServer(scenario, () => new Date(SET_UP_NOW));
    const records = await server.readWeek(ref);
    return records.days.map((day) => deriveSetUpDay(day, records.timeZone));
  }
  const names = (day: { blocks: { block: { name: string } }[] }) =>
    day.blocks.map((b) => b.block.name);

  it("set-up-usual is usual-week.md's seven rows", async () => {
    const days = await week("set-up-usual", "usual");
    const weekday = [
      "Wellness",
      "Training",
      "Breakfast",
      "Work",
      "Lunch",
      "Work",
    ];
    expect(days.map((day) => day.bounds)).toEqual([
      ...Array(5).fill({ upAt: "07:00", lightsOut: "22:30" }),
      { upAt: "08:00", lightsOut: "23:00" },
      null,
    ]);
    expect(names(days[0]!)).toEqual([...weekday, "Evening"]);
    expect(names(days[1]!)).toEqual([
      ...weekday,
      "Climbing [placeholder]",
      "Evening",
    ]);
    expect(names(days[2]!)).toEqual([
      "Wellness",
      "Rest",
      "Breakfast",
      "Work",
      "Lunch",
      "Work",
      "Evening",
    ]);
    expect(names(days[3]!)).toEqual([
      ...weekday,
      "Dinner with friends [placeholder]",
      "Evening",
    ]);
    expect(names(days[4]!)).toEqual([...weekday, "Errands", "Evening"]);
    expect(names(days[5]!)).toEqual([
      "Wellness",
      "Breakfast",
      "Errands",
      "Lunch",
      "Out with friends [placeholder]",
      "Evening",
    ]);
    expect(names(days[6]!)).toEqual(["Sunday checklist", "Sunday reset"]);
    // Sunday is "All day": no bounds, so no strip.
    expect(days[6]!.strip).toEqual([]);
    expect(days[0]!.strip[0]).toMatchObject({ part: "orient" });
    expect(
      days.every((day) => day.overlaps.length === 0 || day.weekday === 6),
    ).toBe(true);
  });

  it("set-up-this-week is the-week.md's 12 to 18 Oct", async () => {
    const days = await week("set-up-this-week", "2026-W42");
    expect(days.map((day) => day.date)).toEqual([
      "2026-10-12",
      "2026-10-13",
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
      "2026-10-17",
      "2026-10-18",
    ]);
    expect(days.map((day) => day.isSet)).toEqual([
      true,
      true,
      true,
      true,
      false,
      false,
      true,
    ]);
    const monday = days[0]!;
    const work = monday.blocks.find((b) => b.block.kind === "work")!;
    expect(work.slots.map((slot) => slot.tier)).toEqual([
      "primary",
      "primary",
      "secondary",
      "stretch",
    ]);
    expect(monday.records.workItems).toHaveLength(4);
    expect(days[1]!.records.slots).toEqual([]);
    expect(days[3]!.events.map((event) => event.title)).toEqual([
      "Dentist [placeholder]",
    ]);
    expect(names(days[6]!)).toEqual(["Sunday checklist"]);
  });

  it("set-up-first-day has nothing set", async () => {
    const days = await week("set-up-first-day", "usual");
    expect(days.every((day) => !day.isSet)).toBe(true);
  });
});
