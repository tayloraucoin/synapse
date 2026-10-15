import { describe, expect, it } from "vitest";
import { resolveDayEntry } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { SUNDAY_DATE } from "@/lib/fixtures/scenarios/now-forms";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { deriveWelcome } from "./use-welcome";

/** The welcome as the screen reads it, from a scenario's own server. */
async function welcomeOf(name: string, dateKey = BASE_DATE) {
  const scenario = resolveScenario(name);
  const now = new Date(scenario.now);
  const server = createFixtureServer(scenario, () => now);
  const today = deriveToday(await server.readToday(dateKey));
  const day = await server.readMorningDay(dateKey);
  const readiedBefore = await server.readReadiedBefore(dateKey);
  return {
    today,
    view: deriveWelcome(today, {
      now,
      linesToday: day.lines?.todayAsISeeIt ?? null,
      firstEver: !readiedBefore,
    }),
  };
}

describe("USE-43: the welcome's scenarios read as drawn", () => {
  it("ready-welcome: First, Wellness then Training then Breakfast, Start Wellness", async () => {
    const { today, view } = await welcomeOf("ready-welcome");
    expect(
      resolveDayEntry({
        dayRecord: today.records.dayRecord,
        startedOnDevice: false,
      }),
    ).toBe("welcome");
    expect(view.heading).toBe("first");
    expect(view.rows.map((row) => row.name)).toEqual([
      "Wellness",
      "Training",
      "Breakfast",
    ]);
    expect(view.start).toMatchObject({
      name: "Wellness",
      startsAt: "07:05",
      form: "early",
    });
    expect(view.orientLine).toMatch(/^Slow start/);
    expect(view.bar).toMatchObject({ from: 420, to: 1020, nowMin: 422 });
    expect(view.bar.segments.map((segment) => segment.label)).toEqual([
      "Wellness",
      "Training",
      "Breakfast",
      "Work",
      "Lunch",
      "Work",
    ]);
  });

  it("ready-first-go-ever: the teaching in place of Orient's line, two rows", async () => {
    const { view } = await welcomeOf("ready-first-go-ever");
    expect(view.teaching).toBe(true);
    expect(view.orientLine).toBeNull();
    expect(view.rows).toHaveLength(2);
  });

  it("ready-late-wake: Now, Training under way until 8:57, from 8:15, Wellness faded", async () => {
    const { view } = await welcomeOf("ready-late-wake");
    expect(view.heading).toBe("now");
    expect(view.rows.map((row) => row.name)).toEqual([
      "Training",
      "Breakfast",
      "Work",
    ]);
    expect(view.rows[0]).toMatchObject({ underWay: true, endsAt: "08:57" });
    expect(view.start).toMatchObject({
      name: "Training",
      startsAt: "08:15",
      form: "under-way",
    });
    expect(
      view.bar.segments
        .filter((segment) => segment.faded)
        .map((segment) => segment.label),
    ).toEqual(["Wellness"]);
  });

  it("ready-checklist-day: Sunday's list all day, then Lunch with Sam, Open the list", async () => {
    const { view } = await welcomeOf("ready-checklist-day", SUNDAY_DATE);
    expect(view.rows.map((row) => [row.name, row.allDay])).toEqual([
      ["Sunday's list", true],
      ["Lunch with Sam", false],
    ]);
    expect(view.start?.form).toBe("list");
    expect(view.orientLine).toMatch(/^Nothing to prove today/);
  });

  it("ready-offline: the same welcome, offline", async () => {
    expect(resolveScenario("ready-offline").offline).toBe(true);
    const { view } = await welcomeOf("ready-offline");
    expect(view.start?.name).toBe("Wellness");
  });
});
