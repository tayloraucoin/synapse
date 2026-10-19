import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { SET_UP_IDS, SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";
import { dueWords, workPartsOf } from "./this-week-day";
import { deriveWeek } from "./use-week";

/**
 * USE-81 on the board's Tuesday 13 (`this-week-day`): the Work block open to
 * its tiers, the session mark and the day's due words, the fit line as a
 * length; a past day and a day with no Work block.
 */

const WORK = SET_UP_IDS.blocks.work;

async function read(todayKey = "2026-10-12") {
  const server = createFixtureServer(
    resolveScenario("this-week-day"),
    () => new Date(SET_UP_NOW),
  );
  const pool = await server.readPool();
  const week = deriveWeek(await server.readWeek("2026-W42"));
  const partsOf = (index: number) =>
    workPartsOf({ day: week.days[index]!, slots: pool.slots, todayKey });
  return { partsOf };
}

describe("the day: Tuesday 13's Work open to its tiers", () => {
  it("draws Primary, Secondary and Stretch with its add row, no Urgent", async () => {
    const { partsOf } = await read();
    const work = partsOf(1).get(WORK)!;
    expect(
      work.tiers.map((t) => [
        t.word,
        t.rows.map((r) => [r.title, r.trail?.words ?? null]),
        t.add,
      ]),
    ).toEqual([
      [
        "Primary",
        [
          ["[Case studies: Alder intro]", "2 of 3"],
          ["[Booking: reschedule flow]", "due Wed"],
        ],
        null,
      ],
      ["Secondary", [["[Brand site: case study template]", null]], null],
      ["Stretch", [], "+ Add to Stretch"],
    ]);
    expect(work.tiers[0]!.rows[0]!.trail).toMatchObject({ kind: "session" });
    expect(work.tiers[0]!.rows[0]!.label).toBe(
      "[Case studies: Alder intro], session 2 of 3",
    );
  });

  it("says the fit as a length in ink words, never a count", async () => {
    const { partsOf } = await read();
    expect(partsOf(1).get(WORK)!.fitLine).toBe(
      "Doesn't fit by 40 min at the top of the ranges",
    );
  });

  it("works the due words out for the day shown, not today", () => {
    expect(dueWords("2026-10-14", "2026-10-13")).toBe("due Wed");
    expect(dueWords("2026-10-14", "2026-10-14")).toBe("due today");
    expect(dueWords("2026-10-14", "2026-10-12")).toBe("due Wed");
    expect(dueWords("2026-10-14", "2026-10-11")).toBeNull();
    expect(dueWords("2026-10-14", "2026-10-15")).toBe("due Wed");
  });

  it("a past day keeps its rows and drops the fit line", async () => {
    const { partsOf } = await read("2026-10-14");
    const monday = partsOf(0).get(WORK)!;
    expect(monday.fitLine).toBeNull();
    expect(monday.tiers.flatMap((t) => t.rows).length).toBeGreaterThan(0);
  });

  it("a day with no Work block has no parts", async () => {
    const { partsOf } = await read();
    expect(partsOf(5).size).toBe(0);
  });
});
