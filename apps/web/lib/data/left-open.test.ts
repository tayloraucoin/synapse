import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { TODAY_EMPTY_IDS } from "@/lib/fixtures/scenarios/today-empty";
import { WEEK_IDS } from "@/lib/fixtures/scenarios/week";
import { createFixtureServer } from "@/lib/fixtures/server";
import { lastWorkday, leftOpen, todayEmpty, writeBringIn } from "./left-open";
import { deriveWeek, type SetUpWeek } from "./use-week";

/** C1 (USE-82): what was left open, derived, and Bring these in. */

const MON = "2026-10-12";
const F = TODAY_EMPTY_IDS.friday;

function setup(name: string) {
  const scenario = resolveScenario(name);
  return createFixtureServer(scenario, () => new Date(scenario.now));
}

type Server = ReturnType<typeof setup>;

/** This week and the one before, as the hook reads them. */
async function days(server: Server) {
  const weeks = await Promise.all(
    ["2026-W41", "2026-W42"].map((week) => server.readWeek(week)),
  );
  return weeks.flatMap((records) => (deriveWeek(records) as SetUpWeek).days);
}

describe("C1: leftOpen reads the last workday", () => {
  it("is Friday on a Monday, never the weekend", async () => {
    const all = await days(setup("today-nothing-planned"));
    expect(lastWorkday(MON, all)?.date).toBe("2026-10-09");
  });

  it("gives Friday's undone sessions of open items with their tiers, nothing from Thursday", async () => {
    const all = await days(setup("today-nothing-planned"));
    const open = leftOpen(MON, all);
    expect(open?.weekday).toBe("Friday");
    expect(
      open?.items.map((item) => [item.slotId, item.tier, item.tierWord]),
    ).toEqual([
      [F.audit, "primary", "Primary"],
      [F.sms, "secondary", "Secondary"],
    ]);
    expect(todayEmpty(MON, all)?.kind).toBe("nothing-planned");
  });

  it("is null when the last workday left nothing open: no work slotted", async () => {
    const all = await days(setup("today-no-work-slotted"));
    expect(leftOpen(MON, all)).toBeNull();
    expect(todayEmpty(MON, all)).toEqual({ kind: "no-work-slotted" });
  });

  it("is no empty state once anything is slotted today", async () => {
    const all = await days(setup("today-working"));
    expect(todayEmpty(MON, all)).toBeNull();
  });
});

describe("C1: Bring these in", () => {
  it("places the checked ones today at their old tiers; the unchecked stays in the pool", async () => {
    const server = setup("today-nothing-planned-now");
    const open = leftOpen(MON, await days(server))!;
    expect(open.items.map((item) => item.tier)).toEqual([
      "primary",
      "secondary",
      "stretch",
    ]);
    const before = await server.readPool();

    await writeBringIn(
      server,
      open,
      new Set([F.portal, F.sms]),
      { dateKey: MON, blockId: WEEK_IDS.blocks.workMorning },
      before.slots,
    );

    const after = await server.readPool();
    const monday = after.slots
      .filter((slot) => slot.onDate === MON)
      .map((slot) => [slot.workItemId, slot.tier]);
    expect(monday).toEqual([
      [WEEK_IDS.workItems.kes42, "primary"],
      [WEEK_IDS.workItems.kes51, "secondary"],
    ]);
    // The unchecked one is still open in the pool, with nothing on Monday.
    expect(after.workItems.map((item) => item.id)).toContain(
      WEEK_IDS.workItems.invoice,
    );
    expect(
      after.slots.some(
        (slot) =>
          slot.workItemId === WEEK_IDS.workItems.invoice && slot.onDate === MON,
      ),
    ).toBe(false);
    // Nothing is marked: Friday's sessions stay as they were.
    expect(after.slots.filter((slot) => slot.onDate === "2026-10-09")).toEqual(
      before.slots.filter((slot) => slot.onDate === "2026-10-09"),
    );
  });
});
