import { describe, expect, it } from "vitest";
import { weekKeyOf } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { TODAY_WORK_IDS } from "@/lib/fixtures/scenarios/today-desk";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { joinIssue } from "./integration-records";
import { capHelper, stillOpenView } from "./tier-edges";
import { deriveTodayWork } from "./today-work";
import { deriveWeek } from "./use-week";
import { deriveWeekView } from "./week-view";

/**
 * USE-61 (C1): Today's tier edges read from their scenarios as the screen
 * reads them. The cap is soft and only above the usual number; Urgent shows
 * only while it holds something; the later Work block keeps only what is
 * still open, a firing item in its tier, and names the earlier block.
 */

const MONDAY = "2026-10-12";
const S = TODAY_WORK_IDS.slots;

async function read(name: string) {
  const scenario = resolveScenario(name);
  const now = new Date(scenario.now);
  const server = createFixtureServer(scenario, () => now);
  const week = deriveWeek(await server.readWeek(weekKeyOf(MONDAY)));
  const view = deriveWeekView({
    weekKey: weekKeyOf(MONDAY),
    week,
    pool: null,
    todayKey: MONDAY,
  });
  const today = deriveToday(await server.readToday(MONDAY));
  const linear = await server.readLinear();
  return deriveTodayWork({
    today,
    day: view.days.find((day) => day.dateKey === MONDAY) ?? null,
    now,
    clientFor: () => null,
    issueFor: (item) => joinIssue(linear, item),
  });
}

const shape = (tiers: { word: string; rows: { id: string }[] }[]) =>
  tiers.map((group) => [group.word, group.rows.map((row) => row.id)]);

describe("the soft cap (C-USE-today-9, D-USE-65)", () => {
  it("speaks only above two Primary or four Secondary, and leaves at the usual", () => {
    expect(capHelper("primary", 2)).toBeNull();
    expect(capHelper("primary", 3)).toBe("Two is the usual for Primary.");
    expect(capHelper("primary", 1)).toBeNull();
    expect(capHelper("secondary", 4)).toBeNull();
    expect(capHelper("secondary", 5)).toBe("Four is the usual for Secondary.");
    // Urgent and Stretch have no cap at any number (D-USE-79).
    expect(capHelper("urgent", 9)).toBeNull();
    expect(capHelper("stretch", 9)).toBeNull();
  });

  it("a third Primary goes in, with the helper under its heading", async () => {
    const work = await read("today-past-cap");
    const primary = work.tiers.find((group) => group.tier === "primary")!;
    expect(primary.rows).toHaveLength(3);
    expect(primary.helper).toBe("Two is the usual for Primary.");
    const secondary = work.tiers.find((group) => group.tier === "secondary")!;
    expect(secondary.helper).toBeNull();
  });
});

describe("only Primary, and Urgent (C-USE-today-primary-only-1, urgent-above-primary-1, -2)", () => {
  it("keeps Secondary and Stretch as empty headings and shows no Urgent", async () => {
    const work = await read("today-primary-only");
    expect(shape(work.tiers)).toEqual([
      ["Primary", [S.portal, S.alder]],
      ["Secondary", []],
      ["Stretch", []],
    ]);
    expect(work.tiers.every((group) => group.helper === null)).toBe(true);
  });

  it("puts Urgent above Primary and lifts its item; the old Next is a row", async () => {
    const work = await read("today-urgent");
    expect(work.tiers.map((group) => group.word)).toEqual([
      "Urgent",
      "Primary",
      "Secondary",
      "Stretch",
    ]);
    const urgent = work.tiers[0]!.rows;
    expect(urgent.map((row) => row.title)).toEqual([
      "[Sync errors in production]",
    ]);
    expect(work.next).toEqual({ kind: "slot", slotId: urgent[0]!.id });
    expect(work.lift).toBe(true);
    expect(work.tiers[1]!.rows[0]).toMatchObject({
      id: S.portal,
      form: "idle",
    });
  });
});

describe("the later Work block (C-USE-today-later-work-block-1, -2)", () => {
  it("keeps only what is open, the firing item in its tier, and names 9:30", async () => {
    const work = await read("today-later-block");
    expect(work.later?.line).toBe(
      "What's still open from the morning's Work. What was done stays in the 9:30 block.",
    );
    const shown = stillOpenView(work);
    expect(shape(shown.tiers)).toEqual([
      ["Primary", [S.alder]],
      ["Secondary", [S.desk]],
      ["Stretch", [S.invoice]],
    ]);
    expect(shown.tiers[1]!.rows[0]!.form).toBe("firing");
    // Next stays resolveWorkNext's, across both blocks.
    expect(shown.next).toEqual({ kind: "slot", slotId: S.alder });
    expect(shown.lift).toBe(true);
    // The day's tiers still hold the done work (the desk, Review, Schedule).
    expect(shape(work.tiers)).toEqual([
      ["Primary", [S.portal, S.alder]],
      ["Secondary", [S.sms, S.desk]],
      ["Stretch", [S.invoice]],
    ]);
  });

  it("has no later block in the morning's Work", async () => {
    const work = await read("today-working");
    expect(work.later).toBeNull();
    expect(stillOpenView(work)).toBe(work);
  });
});
