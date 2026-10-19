import { describe, expect, it } from "vitest";
import {
  createPlannerQueue,
  PlannerOfflineRefusal,
} from "@/lib/data/use-planner-writes";
import { deriveSetUpDay } from "@/lib/data/use-set-up-day";
import type { WeekRecords } from "@/lib/data/week-records";
import { resolveScenario } from "../scenarios";
import { SET_UP_IDS, SET_UP_NOW } from "../scenarios/set-up";
import { createFixtureServer, FixtureOfflineError } from "../server";
import { PlannerRefusal } from "./index";

const B = SET_UP_IDS.blocks;
const I = SET_UP_IDS.items;
/** 12 to 18 October 2026. */
const THIS_WEEK = "2026-W42";
const LATER_WEEK = "2026-W44";
const [MON, TUE, WED, THU, FRI] = [
  "2026-10-12",
  "2026-10-13",
  "2026-10-14",
  "2026-10-15",
  "2026-10-16",
];

function setup(name: string, now = SET_UP_NOW) {
  const scenario = resolveScenario(name);
  let at = Date.parse(now);
  const server = createFixtureServer(scenario, () => new Date(at));
  return {
    server,
    moveTo(instant: string) {
      at = Date.parse(instant);
    },
    /** One derived day of a week; `weekday` Monday 0. */
    async day(week: string, weekday: number) {
      const records = await server.readWeek(week);
      return deriveSetUpDay(records.days[weekday]!, records.timeZone);
    },
  };
}

const names = (day: { blocks: { block: { name: string } }[] }) =>
  day.blocks.map((b) => b.block.name);

const occurrence = (
  day: Awaited<ReturnType<ReturnType<typeof setup>["day"]>>,
  blockId: string,
) => day.blocks.find((b) => b.block.id === blockId);

describe("C2: a Usual week edit reaches every week; a This week edit, its date only", () => {
  it("changes the weekday in every week and names this week's date it reaches", async () => {
    const t = setup("set-up-usual");
    const write = await t.server.editBlock(
      { id: B.wellness, startsAt: "07:10" },
      { weekday: 3 },
    );
    expect(write.reach).toEqual({ weekday: 3, follows: THU });
    expect(occurrence(await t.day("usual", 3), B.wellness)?.startsAt).toBe(
      "07:10",
    );
    expect(occurrence(await t.day(THIS_WEEK, 3), B.wellness)?.startsAt).toBe(
      "07:10",
    );
    expect(occurrence(await t.day(LATER_WEEK, 3), B.wellness)?.startsAt).toBe(
      "07:10",
    );
  });

  it("reaches no date that has begun", async () => {
    const t = setup("set-up-usual", "2026-10-15T09:00:00-04:00");
    const write = await t.server.editBlock(
      { id: B.wellness, startsAt: "07:10" },
      { weekday: 3 },
    );
    expect(write.reach).toEqual({ weekday: 3, follows: null });
  });

  it("leaves a block changed on that date its own", async () => {
    const t = setup("set-up-usual");
    await t.server.writeBlockChange({
      blockId: B.wellness,
      onDate: THU,
      startsAt: "07:20",
      endsAt: "08:00",
    });
    const write = await t.server.editBlock(
      { id: B.wellness, startsAt: "07:10" },
      { weekday: 3 },
    );
    expect(write.reach).toEqual({ weekday: 3, follows: null });
    const thursday = occurrence(await t.day(THIS_WEEK, 3), B.wellness);
    expect(thursday?.startsAt).toBe("07:20");
    expect(thursday?.ownChange).toBe(true);
  });

  it("changes only the date on a This week edit; the usual week reads the same", async () => {
    const t = setup("set-up-usual");
    const usual = await t.server.readWeek("usual");
    await t.server.writeBlockChange({
      blockId: B.wellness,
      onDate: TUE,
      startsAt: "07:30",
      endsAt: "08:15",
    });
    await t.server.writeBlockItem({
      blockId: B.wellness,
      title: "Vitamins",
      sortOrder: 9,
      onDate: TUE,
    });
    await t.server.removeBlockItem({ id: I.water, date: TUE });
    expect(occurrence(await t.day(THIS_WEEK, 1), B.wellness)?.startsAt).toBe(
      "07:30",
    );
    expect(occurrence(await t.day(THIS_WEEK, 2), B.wellness)?.startsAt).toBe(
      "07:05",
    );
    expect(await t.server.readWeek("usual")).toEqual(usual);
  });

  it("names the reach of a weekday's bounds, and a date's own bounds keep theirs", async () => {
    const t = setup("set-up-usual");
    await t.server.writeBounds({
      onDate: TUE,
      upAt: "06:30",
      lightsOut: "22:00",
    });
    const tuesday = await t.server.writeBounds({
      weekday: 1,
      upAt: "07:30",
      lightsOut: "22:30",
    });
    expect(tuesday.reach).toEqual({ weekday: 1, follows: null });
    const wednesday = await t.server.writeBounds({
      weekday: 2,
      upAt: "07:30",
      lightsOut: "22:30",
    });
    expect(wednesday.reach).toEqual({ weekday: 2, follows: WED });
    expect((await t.day(THIS_WEEK, 1)).bounds?.upAt).toBe("06:30");
    expect((await t.day(THIS_WEEK, 2)).bounds?.upAt).toBe("07:30");
  });
});

describe("C3: copyDay, clearDay and resetDay, each undone exactly", () => {
  it("copies onto an empty day: blocks, times, kinds and items, not the bounds, Work as time only", async () => {
    const t = setup("set-up-this-week");
    const before = await t.server.readWeek(THIS_WEEK);
    const write = await t.server.copyDay({
      from: { date: MON },
      to: { date: FRI },
    });
    const monday = await t.day(THIS_WEEK, 0);
    const friday = await t.day(THIS_WEEK, 4);

    const shape = (day: typeof monday) =>
      day.blocks.map((b) => [b.block.kind, b.block.name, b.startsAt, b.endsAt]);
    expect(shape(friday)).toEqual(shape(monday));
    expect(friday.bounds).toBeNull();
    for (const copied of friday.blocks) {
      expect(copied.block.onDate).toBe(FRI);
      expect(copied.block.rrule).toBeNull();
      const source = monday.blocks.find(
        (b) =>
          b.block.name === copied.block.name && b.startsAt === copied.startsAt,
      )!;
      const titles = (b: typeof copied) => b.items.map((item) => item.title);
      if (copied.block.kind === "work") {
        expect(titles(copied)).toEqual([]);
        expect(copied.slots).toEqual([]);
      } else {
        expect(titles(copied)).toEqual(titles(source));
      }
    }
    // The slotted work stays on its own day.
    expect(monday.records.slots).toHaveLength(4);
    expect(write.reach).toBeUndefined();

    await t.server.undo(write.undo);
    expect(await t.server.readWeek(THIS_WEEK)).toEqual(before);
  });

  it("replaces a built day, and Undo puts its own blocks back", async () => {
    const t = setup("set-up-this-week");
    const before = await t.server.readWeek(THIS_WEEK);
    const write = await t.server.copyDay({
      from: { date: MON },
      to: { date: WED },
    });
    const wednesday = await t.day(THIS_WEEK, 2);
    expect(names(wednesday)).toEqual(names(await t.day(THIS_WEEK, 0)));
    expect(names(wednesday)).not.toContain("Rest");
    // The usual Wednesday is untouched.
    expect(names(await t.day(LATER_WEEK, 2))).toContain("Rest");

    await t.server.undo(write.undo);
    expect(await t.server.readWeek(THIS_WEEK)).toEqual(before);
  });

  it("copies into a usual weekday from this week's date on, and Undo restores the usual week", async () => {
    const t = setup("set-up-usual");
    const usual = await t.server.readWeek("usual");
    const tuesday = names(await t.day("usual", 1));
    const write = await t.server.copyDay({
      from: { weekday: 0 },
      to: { weekday: 3 },
    });
    expect(write.reach).toEqual({ weekday: 3, follows: THU });
    const thursday = await t.day("usual", 3);
    expect(names(thursday)).toEqual(names(await t.day("usual", 0)));
    expect(names(thursday)).not.toContain("Dinner with friends [placeholder]");
    expect(names(await t.day("usual", 1))).toEqual(tuesday);
    expect(names(await t.day(THIS_WEEK, 3))).toEqual(names(thursday));

    await t.server.undo(write.undo);
    expect(await t.server.readWeek("usual")).toEqual(usual);
  });

  it("clears a day, and Undo puts it back", async () => {
    const t = setup("set-up-this-week");
    const before = await t.server.readWeek(THIS_WEEK);
    const write = await t.server.clearDay({ date: TUE });
    expect((await t.day(THIS_WEEK, 1)).blocks).toEqual([]);
    expect((await t.day(LATER_WEEK, 1)).blocks).not.toEqual([]);
    await t.server.undo(write.undo);
    expect(await t.server.readWeek(THIS_WEEK)).toEqual(before);
  });

  it("resets a date to its usual, and Undo brings its own changes back", async () => {
    const t = setup("set-up-this-week");
    const before = await t.server.readWeek(THIS_WEEK);
    await t.server.writeBlockChange({
      blockId: B.training,
      onDate: TUE,
      startsAt: "08:10",
      endsAt: "09:00",
    });
    await t.server.removeBlockItem({ id: I.water, date: TUE });
    await t.server.writeBlockItem({
      blockId: B.training,
      title: "Workout: swim [placeholder]",
      sortOrder: 1,
      onDate: TUE,
    });
    await t.server.writeBounds({
      onDate: TUE,
      upAt: "06:30",
      lightsOut: "22:00",
    });
    const changed = await t.server.readWeek(THIS_WEEK);
    expect((await t.day(THIS_WEEK, 1)).ownChange).toBe(true);

    const write = await t.server.resetDay({ date: TUE });
    expect(await t.server.readWeek(THIS_WEEK)).toEqual(before);
    expect((await t.day(THIS_WEEK, 1)).ownChange).toBe(false);

    await t.server.undo(write.undo);
    expect(await t.server.readWeek(THIS_WEEK)).toEqual(changed);
  });

  it("undoes a usual edit exactly, items with it", async () => {
    const t = setup("set-up-usual");
    const usual = await t.server.readWeek("usual");
    const write = await t.server.removeBlockItem(
      { id: I.water },
      { weekday: 0 },
    );
    expect(
      (await t.day("usual", 0)).blocks
        .flatMap((b) => b.items)
        .map((i) => i.title),
    ).not.toContain("Water");
    await t.server.undo(write.undo);
    expect(await t.server.readWeek("usual")).toEqual(usual);
  });
});

describe("C4: one date's item changes", () => {
  it("skips a set item for one date with a skipped slot; the usual item stays", async () => {
    const t = setup("set-up-usual");
    const write = await t.server.removeBlockItem({ id: I.water, date: TUE });
    const tuesday = await t.server.readWeek(THIS_WEEK);
    const slot = tuesday.days[1]!.slots.find((s) => s.id === write.id);
    expect(slot).toMatchObject({
      blockItemId: I.water,
      onDate: TUE,
      skipped: true,
    });
    const titles = async (week: string, weekday: number) =>
      occurrence(await t.day(week, weekday), B.wellness)!.items.map(
        (i) => i.title,
      );
    expect(await titles(THIS_WEEK, 1)).not.toContain("Water");
    expect(await titles(THIS_WEEK, 2)).toContain("Water");
    expect(await titles("usual", 1)).toContain("Water");
  });

  it("adds an item for one date as a dated item, shown on that date only", async () => {
    const t = setup("set-up-usual");
    await t.server.writeBlockItem({
      blockId: B.wellness,
      title: "Vitamins",
      sortOrder: 9,
      onDate: TUE,
    });
    const titles = async (week: string, weekday: number) =>
      occurrence(await t.day(week, weekday), B.wellness)!.items.map(
        (i) => i.title,
      );
    expect(await titles(THIS_WEEK, 1)).toContain("Vitamins");
    expect(await titles(THIS_WEEK, 2)).not.toContain("Vitamins");
    expect(await titles(LATER_WEEK, 1)).not.toContain("Vitamins");
    expect(await titles("usual", 1)).not.toContain("Vitamins");
  });

  it("orders a date through its slots, the usual order untouched", async () => {
    const t = setup("set-up-usual");
    const ids = [
      I.water,
      I.peeAndWeigh,
      I.startColdBath,
      I.meditate,
      I.stretch,
    ];
    await t.server.reorderItems({ blockId: B.wellness, ids, date: TUE });
    const order = async (week: string, weekday: number) =>
      occurrence(await t.day(week, weekday), B.wellness)!.items.map(
        (i) => i.id,
      );
    expect(await order(THIS_WEEK, 1)).toEqual(ids);
    expect((await order("usual", 1))[0]).toBe(I.peeAndWeigh);
  });
});

describe("C5: every write refuses what its schema refuses, in the schema's words", () => {
  const refusals: [
    string,
    (t: ReturnType<typeof setup>) => Promise<unknown>,
    string,
  ][] = [
    [
      "a block with no name",
      (t) =>
        t.server.createBlock({
          kind: "life",
          name: "   ",
          startsAt: "19:00",
          endsAt: "21:00",
          onDate: TUE,
        }),
      "Name needed",
    ],
    [
      "a block ending before it starts",
      (t) =>
        t.server.createBlock({
          kind: "life",
          name: "Climbing",
          startsAt: "19:00",
          endsAt: "18:00",
          onDate: TUE,
        }),
      "Ends after it starts.",
    ],
    [
      "a lone end before the stored start",
      (t) => t.server.editBlock({ id: B.wellness, endsAt: "07:00" }),
      "Ends after it starts.",
    ],
    [
      "a date's change ending before it starts",
      (t) =>
        t.server.writeBlockChange({
          blockId: B.wellness,
          onDate: TUE,
          startsAt: "08:00",
          endsAt: "07:30",
        }),
      "Ends after it starts.",
    ],
    [
      "Lights out before Up at",
      (t) =>
        t.server.writeBounds({ weekday: 0, upAt: "07:00", lightsOut: "06:00" }),
      "Lights out comes after Up at.",
    ],
    [
      "an item with no name",
      (t) =>
        t.server.writeBlockItem({
          blockId: B.wellness,
          title: "",
          sortOrder: 9,
        }),
      "Name needed",
    ],
    [
      "an item renamed to nothing",
      (t) => t.server.editBlockItem({ id: I.water, title: " " }),
      "Name needed",
    ],
    [
      "an event with no name",
      (t) =>
        t.server.writeDayEvent({
          title: "",
          startsAt: "14:00",
          endsAt: "15:00",
          onDate: THU,
        }),
      "Name needed",
    ],
    [
      "a transition between blocks with no name",
      (t) =>
        t.server.createTransition({
          placement: "between_blocks",
          name: "",
          startsAt: "08:57",
          endsAt: "09:00",
          onDate: TUE,
        }),
      "Name needed",
    ],
  ];

  it.each(refusals)("refuses %s", async (_name, act, message) => {
    const t = setup("set-up-usual");
    const usual = await t.server.readWeek("usual");
    const week = await t.server.readWeek(THIS_WEEK);
    const refusal = await act(t).then(
      () => null,
      (error: unknown) => error,
    );
    expect(refusal).toBeInstanceOf(PlannerRefusal);
    expect((refusal as PlannerRefusal).message).toBe(message);
    // Nothing is half-written.
    expect(await t.server.readWeek("usual")).toEqual(usual);
    expect(await t.server.readWeek(THIS_WEEK)).toEqual(week);
  });

  it("refuses a date the block is not on", async () => {
    const t = setup("set-up-usual");
    await expect(
      t.server.writeBlockChange({
        blockId: B.climbing,
        onDate: WED,
        skipped: true,
      }),
    ).rejects.toMatchObject({ reason: "not-on-date" });
  });
});

describe("C6: offline, the day's own writes are refused; block and item writes wait in order", () => {
  it("the server takes no write while offline", async () => {
    const t = setup("set-up-offline");
    await expect(
      t.server.editBlock({ id: B.wellness, name: "Morning" }),
    ).rejects.toBeInstanceOf(FixtureOfflineError);
  });

  it("refuses the day's own writes and lands the rest in order when back", async () => {
    const t = setup("set-up-offline");
    const queue = createPlannerQueue(t.server, false);
    const before: WeekRecords = await t.server.readWeek(THIS_WEEK);

    const dayWrites = [
      queue.run({
        method: "writeBounds",
        args: [{ weekday: 0, upAt: "07:30", lightsOut: "22:30" }],
      }),
      queue.run({
        method: "createBlock",
        args: [
          {
            kind: "life",
            name: "Climbing",
            startsAt: "19:00",
            endsAt: "21:00",
            onDate: TUE,
          },
        ],
      }),
      queue.run({
        method: "copyDay",
        args: [{ from: { date: MON }, to: { date: FRI } }],
      }),
      queue.run({ method: "resetDay", args: [{ date: TUE }] }),
      queue.run({ method: "clearDay", args: [{ date: TUE }] }),
    ];
    for (const write of dayWrites) {
      await expect(write).rejects.toBeInstanceOf(PlannerOfflineRefusal);
    }

    const landed = [
      queue.run({
        method: "editBlock",
        args: [{ id: B.wellness, name: "One" }],
      }),
      queue.run({
        method: "writeBlockItem",
        args: [
          { blockId: B.wellness, title: "First", sortOrder: 9, onDate: TUE },
        ],
      }),
      queue.run({
        method: "writeBlockItem",
        args: [
          { blockId: B.wellness, title: "Second", sortOrder: 10, onDate: TUE },
        ],
      }),
      queue.run({
        method: "editBlock",
        args: [{ id: B.wellness, name: "Two" }],
      }),
    ];
    expect(queue.waiting()).toBe(4);
    expect(await t.server.readWeek(THIS_WEEK)).toEqual(before);

    t.server.reconnect();
    await queue.setOnline(true);
    await Promise.all(landed);
    expect(queue.waiting()).toBe(0);

    const tuesday = occurrence(await t.day(THIS_WEEK, 1), B.wellness)!;
    expect(tuesday.block.name).toBe("Two");
    const titles = (await t.server.readWeek(THIS_WEEK)).days[1]!.items.map(
      (i) => i.title,
    );
    expect(titles.indexOf("First")).toBeLessThan(titles.indexOf("Second"));
    expect(titles.indexOf("First")).toBeGreaterThan(-1);
  });
});
