import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { SET_UP_IDS } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";
import {
  clearWords,
  reachWords,
  resetWords,
  rowBounds,
  rowLine,
  setUpColumn,
  THIS_DAY_ONLY,
} from "./set-up-view";
import { openingDay } from "./use-days";
import { deriveWeek } from "./use-week";

/**
 * Set my days, This week (USE-42): the week and the day dated, item icons,
 * the day's menu words, a usual change's reach, a day's own change, the
 * overlap and its one fix, and the day the 1024 pane selects.
 */

const B = SET_UP_IDS.blocks;

function serverOf(state: string) {
  const scenario = resolveScenario(state);
  const server = createFixtureServer(scenario, () => new Date(scenario.now));
  return { scenario, server };
}

async function weekOf(state: string, week: string) {
  const { server } = serverOf(state);
  return deriveWeek(await server.readWeek(week));
}

describe("the week (C1; the-week.md)", () => {
  it("dates the rows, words where nothing is slotted, Fri and Sat not set", async () => {
    const { days } = await weekOf("the-week", "2026-W42");
    expect(rowLine(days[1]!)).toBe("No work slotted yet");
    expect(rowBounds(days[4]!)).toBe("Not set yet");
    expect(rowBounds(days[5]!)).toBe("Not set yet");
    expect(days[4]!.isSet).toBe(false);
  });
});

describe("the day (C2, C5; the-day.md, item-icons.md)", () => {
  it("lists Work's tiers and leaves the dot where an item has no icon", async () => {
    const { days } = await weekOf("the-day", "2026-W42");
    const work = setUpColumn(days[0]!).blocks.find((b) => b.id === B.work)!;
    expect(work.tiers.map((t) => t.tier)).toEqual([
      "primary",
      "secondary",
      "stretch",
    ]);
    expect(work.tiers[0]!.items[0]!.icon).toBeNull();
  });

  it("carries each item's icon and a work item's project emoji", async () => {
    const { days } = await weekOf("item-icons", "2026-W42");
    const column = setUpColumn(days[0]!);
    const wellness = column.blocks.find((b) => b.id === B.wellness)!;
    expect(wellness.items[0]!.icon).toEqual({ kind: "emoji", value: "⚖️" });
    const work = column.blocks.find((b) => b.id === B.work)!;
    expect(work.tiers[0]!.items[0]!.icon).toEqual({
      kind: "emoji",
      value: "🛰️",
    });
    // A meal keeps its glyph: it has no items to carry an icon.
    expect(column.blocks.find((b) => b.id === B.breakfast)!.form).toBe("meal");
  });
});

describe("the day's menu (C7; day-menu.md)", () => {
  it("asks once, naming what goes, and Undo restores the day", async () => {
    const { server } = serverOf("clear-confirm");
    const before = deriveWeek(await server.readWeek("2026-W42")).days[0]!;
    expect(clearWords(before)).toEqual({
      title: "Clear Monday, 12 October?",
      body: "Monday's Wellness, Training, Breakfast, Work and Lunch go.",
      done: "Monday, 12 October cleared.",
    });
    const write = await server.clearDay({ date: "2026-10-12" });
    const cleared = deriveWeek(await server.readWeek("2026-W42")).days[0]!;
    expect(cleared.blocks).toHaveLength(0);
    // The usual Monday is untouched: Tuesday still runs the same blocks.
    const tuesday = deriveWeek(await server.readWeek("2026-W42")).days[1]!;
    expect(tuesday.blocks.length).toBeGreaterThan(0);
    await server.undo(write.undo);
    const back = deriveWeek(await server.readWeek("2026-W42")).days[0]!;
    expect(back.blocks.map((b) => b.block.id)).toEqual(
      before.blocks.map((b) => b.block.id),
    );
  });

  it("offers Reset to usual only once the date differs, and resets it", async () => {
    const plain = await weekOf("the-day", "2026-W42");
    expect(plain.days[0]!.ownChange).toBe(false);
    const { server } = serverOf("day-menu");
    const changed = deriveWeek(await server.readWeek("2026-W42")).days[0]!;
    expect(changed.ownChange).toBe(true);
    expect(resetWords(changed)).toBe(
      "Monday, 12 October is the usual Monday again.",
    );
    await server.resetDay({ date: "2026-10-12" });
    const reset = deriveWeek(await server.readWeek("2026-W42")).days[0]!;
    expect(reset.ownChange).toBe(false);
  });
});

describe("a usual change names its reach (C8; D-USE-33)", () => {
  it("says the change, the date that follows and the exception", async () => {
    const { server } = serverOf("usual-change-reaches");
    const write = await server.editBlock(
      { id: B.wellness, startsAt: "07:05" },
      { weekday: 3 },
    );
    expect(write.reach).toEqual({ weekday: 3, follows: "2026-10-15" });
    expect(reachWords({ blockName: "Wellness", ...write.reach! })).toBe(
      "Wellness changed for every Thursday. This week's Thursday 15 follows, except blocks changed on that day.",
    );
  });

  it("with the day begun, says only the change", () => {
    expect(
      reachWords({ blockName: "Wellness", weekday: 3, follows: null }),
    ).toBe("Wellness changed for every Thursday.");
  });
});

describe("a day's own change (C9; day-own-change.md)", () => {
  it("marks Training's own version and leaves Wellness unmarked", async () => {
    const { days } = await weekOf("day-own-change", "2026-W42");
    const column = setUpColumn(days[3]!);
    expect(column.blocks.find((b) => b.id === B.training)!.marker).toBe(
      THIS_DAY_ONLY,
    );
    expect(column.blocks.find((b) => b.id === B.wellness)!.marker).toBe(
      undefined,
    );
  });

  it("never marks the usual week", async () => {
    const { days } = await weekOf("usual-week", "usual");
    for (const day of days) {
      for (const b of setUpColumn(day).blocks) expect(b.marker).toBe(undefined);
    }
  });
});

describe("overlap and its one fix (C10; overlap.md)", () => {
  it("names the overlap from the hook and the fix keeps the length", async () => {
    const { server } = serverOf("overlap");
    const monday = deriveWeek(await server.readWeek("2026-W42")).days[0]!;
    const [pair] = setUpColumn(monday).overlaps;
    expect(pair).toMatchObject({
      a: B.training,
      b: B.breakfast,
      line: "Overlaps Training, 8:30 to 8:57.",
      actionLabel: "Start at 8:57",
      fixStartsAt: "08:57",
    });
  });

  it("moves the dragged block on the date only, never the usual block", async () => {
    const { server } = serverOf("the-day");
    await server.writeBlockChange({
      blockId: B.breakfast,
      onDate: "2026-10-12",
      startsAt: "08:30",
      endsAt: "09:00",
    });
    const week = deriveWeek(await server.readWeek("2026-W42"));
    const monday = week.days[0]!;
    const at = (id: string) => monday.blocks.find((b) => b.block.id === id)!;
    expect(at(B.breakfast).startsAt).toBe("08:30");
    // Others don't move.
    expect(at(B.training).startsAt).toBe("08:00");
    // Tuesday's Breakfast, the same usual block, stays at 9:00.
    const tuesday = week.days[1]!.blocks.find(
      (b) => b.block.id === B.breakfast,
    )!;
    expect(tuesday.startsAt).toBe("09:00");
    const usual = deriveWeek(await server.readWeek("usual")).days[0]!;
    expect(usual.blocks.find((b) => b.block.id === B.breakfast)!.startsAt).toBe(
      "09:00",
    );
  });
});

describe("the 1024 pane's day (C-USE-set-my-days-the-day-4)", () => {
  const timeZone = "America/New_York";
  const week = [
    "2026-10-12",
    "2026-10-13",
    "2026-10-14",
    "2026-10-15",
    "2026-10-16",
    "2026-10-17",
    "2026-10-18",
  ];
  it("selects today in its week", () => {
    expect(
      openingDay({
        dates: week,
        now: new Date("2026-10-14T10:00:00-04:00"),
        timeZone,
      }),
    ).toBe(2);
  });
  it("from Sunday evening, the week's first day", () => {
    expect(
      openingDay({
        dates: week,
        now: new Date("2026-10-11T21:10:00-04:00"),
        timeZone,
      }),
    ).toBe(0);
    expect(
      openingDay({
        dates: [],
        now: new Date("2026-10-11T21:10:00-04:00"),
        timeZone,
      }),
    ).toBe(0);
  });
});
