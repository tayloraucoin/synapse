import { describe, expect, it } from "vitest";
import { weekKeyOf } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { SUNDAY_DATE } from "@/lib/fixtures/scenarios/now-forms";
import { createFixtureServer } from "@/lib/fixtures/server";
import { daysRoute } from "@/lib/routes";
import { openingCopyStep } from "./set-up-start";
import { copySources } from "./set-up-view";
import { resolveDaysPlace } from "./use-days";
import { deriveWeek } from "./use-week";

/**
 * C2 (USE-110; review-the-day/states/sunday-nothing-set.md, D-USE-68): Copy
 * another day lands on Set my days at today's date with Copy from's picker
 * open; picking a built day copies it there, and Undo puts the day back.
 */

const SCENARIO = "review-nothing-set-copy";

function setup() {
  const scenario = resolveScenario(SCENARIO);
  const server = createFixtureServer(scenario, () => new Date(scenario.now));
  return { scenario, server };
}

describe("C2: Copy another day on Review the day with nothing set", () => {
  it("links to Set my days at today's date with the picker asked for", () => {
    const href = daysRoute({ day: SUNDAY_DATE, copy: "picker" });
    expect(href).toBe(`/days?day=${SUNDAY_DATE}&copy=picker`);
    const query = new URLSearchParams(href.split("?")[1]);
    const place = resolveDaysPlace({
      week: null,
      day: query.get("day"),
      opens: "usual",
      thisWeek: weekKeyOf(SUNDAY_DATE),
    });
    // Today's own date, in its dated week: a copy there is this Sunday's only.
    expect(place).toMatchObject({
      week: weekKeyOf(SUNDAY_DATE),
      day: 6,
      date: SUNDAY_DATE,
    });
    expect(openingCopyStep(undefined, query.get("copy"))).toBe("picker");
  });

  it("opens nothing without the param, and a scenario's own step wins", () => {
    expect(openingCopyStep(undefined, null)).toBeUndefined();
    expect(openingCopyStep({ copy: "replace" }, "picker")).toBe("replace");
  });

  it("offers the week's built days; picking one copies it to today, and Undo empties it again", async () => {
    const { server } = setup();
    const week = weekKeyOf(SUNDAY_DATE);
    const before = deriveWeek(await server.readWeek(week)).days;
    expect(before[6]!.blocks).toEqual([]);
    const sources = copySources(before, 6);
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.map((day) => day.weekday)).not.toContain(6);

    const from = sources[0]!;
    const write = await server.copyDay({
      from: { date: from.date! },
      to: { date: SUNDAY_DATE },
    });
    const copied = deriveWeek(await server.readWeek(week)).days[6]!;
    expect(copied.blocks.map((b) => b.block.name)).toEqual(
      from.blocks.map((b) => b.block.name),
    );

    await server.undo(write.undo);
    const undone = deriveWeek(await server.readWeek(week)).days[6]!;
    expect(undone.blocks).toEqual([]);
  });
});
