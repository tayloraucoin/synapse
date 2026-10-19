import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { createFixtureServer } from "@/lib/fixtures/server";
import { rowBounds, rowName, usualWeekHint } from "./set-up-view";
import { deriveWeek } from "./use-week";

/** USE-139: a first week's rows and the hint under them (usual-week.md). */

async function usual(state: string) {
  const scenario = resolveScenario(state);
  const server = createFixtureServer(scenario, () => new Date(scenario.now));
  return deriveWeek(await server.readWeek("usual"));
}

describe("an unset row's action (C1; C-USE-set-my-days-usual-week-4)", () => {
  it("names the row as its action, Set <day>, on every unset day", async () => {
    const { days } = await usual("usual-week-empty");
    expect(days.map(rowBounds)).toEqual(Array(7).fill("Not set yet"));
    expect(rowName(days[0]!)).toBe("Set Monday, not set yet");
    expect(rowName(days[6]!)).toBe("Set Sunday, not set yet");
  });

  it("keeps a built day's name as it was", async () => {
    const { days } = await usual("usual-week-monday");
    expect(rowName(days[0]!)).toMatch(/^Monday, 7:00 to 22:30, /);
    expect(rowName(days[1]!)).toBe("Set Tuesday, not set yet");
  });
});

describe("the hint under the usual week (C1; C-USE-set-my-days-usual-week-5)", () => {
  it("says where a first week starts when nothing is built", async () => {
    const { days } = await usual("usual-week-empty");
    expect(usualWeekHint(days)).toBe(
      "Start with any day. Once one is built, the others can copy it.",
    );
  });

  it("names the day an unset day copies once one is built (D-USE-85)", async () => {
    const { days } = await usual("usual-week-monday");
    expect(usualWeekHint(days)).toBe(
      "A day not set yet opens on Copy from Monday.",
    );
  });

  it("says nothing when every day is set", async () => {
    const { days } = await usual("usual-week");
    expect(usualWeekHint(days)).toBeNull();
  });
});
