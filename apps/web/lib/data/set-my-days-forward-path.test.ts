import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { createFixtureServer } from "@/lib/fixtures/server";
import { daysRoute, newBlockSheetRoute, readDayParam } from "@/lib/routes";
import { copyOntoDay } from "./copy-onto-day";
import { firstDaySet, lastBuiltBefore } from "./set-up-view";
import { resolveDaysPlace } from "./use-days";
import { deriveWeek } from "./use-week";

/** USE-140: the day keys, and Copy from onto a day with no times yet. */

function serverOf(state: string) {
  const scenario = resolveScenario(state);
  return createFixtureServer(scenario, () => new Date(scenario.now));
}

async function usualOf(server: ReturnType<typeof serverOf>) {
  return deriveWeek(await server.readWeek("usual")).days;
}

const place = (day: string | null, week: string | null = "usual") =>
  resolveDaysPlace({ week, day, opens: "usual", thisWeek: "2026-W42" });

describe("the day in the URL (C1; layout.md, C-USE-set-my-days-usual-week-6)", () => {
  it("writes a weekday as its key, a date as itself", () => {
    expect(daysRoute({ week: "usual", day: 0 })).toBe("/days?week=usual&day=mon");
    expect(daysRoute({ week: "usual", day: 6 })).toBe("/days?week=usual&day=sun");
    expect(daysRoute({ day: "2026-10-13" })).toBe("/days?day=2026-10-13");
    expect(newBlockSheetRoute("/days?week=usual&day=tue", { day: 1 })).toContain(
      "day=tue",
    );
  });

  it("reads mon to sun, the old 0 to 6, and date keys to the same day", () => {
    expect(place("mon").day).toBe(0);
    expect(place("0").day).toBe(0);
    expect(place("thu").day).toBe(3);
    expect(place("3").day).toBe(3);
    expect(place("2026-10-15", null).day).toBe(3);
    expect(readDayParam("someday")).toBeNull();
    expect(readDayParam("7")).toBeNull();
  });
});

describe("Copy from onto an unset day (C3; C-USE-set-my-days-unset-day-copy-2, -3)", () => {
  it("takes Monday's times and blocks; one Undo leaves the day unset", async () => {
    const server = serverOf("unset-day-copy");
    const before = await usualOf(server);
    const monday = before[0]!;
    const tuesday = before[1]!;
    expect(tuesday.isSet).toBe(false);
    expect(lastBuiltBefore(before, 1)).toBe(0);

    const { undo } = await copyOntoDay(server, { from: monday, to: tuesday });
    const after = (await usualOf(server))[1]!;
    expect(after.bounds).toEqual(monday.bounds);
    expect(after.blocks.map((b) => b.block.name)).toEqual(
      monday.blocks.map((b) => b.block.name),
    );

    await undo();
    const undone = (await usualOf(server))[1]!;
    expect(undone.isSet).toBe(false);
    expect(undone.bounds).toBeNull();
    expect(undone.blocks).toEqual([]);
  });

});

describe("the first day's way forward (C2; C-USE-set-my-days-empty-first-day-2, -3, -4)", () => {
  const SUGGESTED = { upAt: "07:00", lightsOut: "22:30" };

  it("names the suggestions until a field changes, then the new time", () => {
    expect(firstDaySet(0, {}, SUGGESTED).label).toBe(
      "Set Monday, 7:00 to 22:30",
    );
    const changed = firstDaySet(0, { upAt: "06:30" }, SUGGESTED);
    expect(changed.label).toBe("Set Monday, 6:30 to 22:30");
    expect(changed).toMatchObject({ upAt: "06:30", lightsOut: "22:30" });
  });

  it("leaves the day unset until the button writes the times shown", async () => {
    const server = serverOf("empty-first-day");
    expect((await usualOf(server))[0]!.bounds).toBeNull();
    const { upAt, lightsOut } = firstDaySet(0, {}, SUGGESTED);
    await server.writeBounds({ weekday: 0, upAt, lightsOut });
    expect((await usualOf(server))[0]!.bounds).toEqual(SUGGESTED);
  });
});
