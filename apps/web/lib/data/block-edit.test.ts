import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BLOCK_EDIT_IDS } from "@/lib/fixtures/scenarios/block-view-editing";
import { SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";
import { blockEditMeta, blockEdits, scopeWords } from "./block-edit";
import { deriveBlockView, inOrderOf, inTimeOrder } from "./use-block-view";
import { createPlannerQueue } from "./use-planner-writes";

/** USE-49: Block view in editing, on the usual week of `block-view-*`. */

const B = BLOCK_EDIT_IDS;
const THURSDAY_15 = "2026-10-15";
const THIS_WEEK = "2026-W42";

function setup(state = "block-view-wellness-editing") {
  const scenario = resolveScenario(state);
  const server = createFixtureServer(scenario, () => new Date(SET_UP_NOW));
  return {
    server,
    async view(week: string, blockId: string, weekday: number) {
      const records = await server.readWeek(week);
      return deriveBlockView(records, blockId, weekday, true)!;
    },
  };
}

const rail = (rows: readonly { title: string; startsAt: string }[]) =>
  rows.map((row) => `${row.startsAt} ${row.title}`);

describe("C-USE-block-view-kind-1: a set-time row through a reorder", () => {
  it("keeps Meditate at 7:10 and in its place; the rest re-flow around it", async () => {
    const { server, view } = setup();
    const before = await view("usual", B.wellness, 0);
    expect(rail(inTimeOrder(before.items))).toEqual([
      "07:05 Pee and weigh",
      "07:07 Water",
      "07:08 Start the cold bath",
      "07:10 Meditate",
      "07:20 Cold bath",
    ]);

    // Cold bath dropped first.
    const ids = before.items.map((item) => item.id);
    const moved = [
      B.items.coldBath,
      ...ids.filter((id) => id !== B.items.coldBath),
    ];
    const shown = inTimeOrder(inOrderOf(before, moved).items);
    // Cold bath can't cross 7:10, so it lands after Meditate; the rest follow.
    expect(rail(shown)).toEqual([
      "07:10 Meditate",
      "07:20 Cold bath",
      "07:30 Pee and weigh",
      "07:32 Water",
      "07:33 Start the cold bath",
    ]);

    await blockEdits(server, B.wellness, { weekday: 0 }).reorder(moved);
    const after = await view("usual", B.wellness, 0);
    expect(rail(inTimeOrder(after.items))).toEqual(rail(shown));
  });
});

describe("C-USE-block-view-kind-3: from This week, that date only", () => {
  it("adds, removes and reorders on Thursday 15; the usual Thursday is unchanged", async () => {
    const { server, view } = setup("block-view-life-set");
    const edits = blockEdits(server, B.dinnerWithFriends, {
      date: THURSDAY_15,
    });
    const week = await view(THIS_WEEK, B.dinnerWithFriends, 3);
    const dinner = week.items.find((i) => i.title === "Dinner")!;

    await edits.add("Dessert", week.items);
    await edits.remove(dinner);

    const dated = await view(THIS_WEEK, B.dinnerWithFriends, 3);
    expect(dated.items.map((i) => i.title)).toContain("Dessert");
    expect(dated.items.map((i) => i.title)).not.toContain("Dinner");

    const usual = await view("usual", B.dinnerWithFriends, 3);
    expect(usual.items.map((i) => i.title)).toEqual([
      "Drive to Marco's",
      "Dinner",
      "Drive home",
    ]);
  });

  it("Not this week frees the date only, and Undo puts it back", async () => {
    const { server } = setup("block-view-life-not-this-week");
    const write = await blockEdits(server, B.dinnerWithFriends, {
      date: THURSDAY_15,
    }).notThisWeek(THURSDAY_15);

    const has = async (week: string) =>
      (await server.readWeek(week)).days[3]!.blocks.some(
        (b) => b.id === B.dinnerWithFriends,
      );
    const onThursday = async () => {
      const records = await server.readWeek(THIS_WEEK);
      return deriveBlockView(records, B.dinnerWithFriends, 3) !== null;
    };
    expect(await onThursday()).toBe(false);
    expect(await has("usual")).toBe(true);

    await server.undo(write.undo);
    expect(await onThursday()).toBe(true);
  });
});

describe("C-USE-block-view-editing-monday-2: the usual week's changes", () => {
  it("a removal reaches every Monday and names its reach", async () => {
    const { server, view } = setup();
    const before = await view("usual", B.wellness, 0);
    const water = before.items.find((i) => i.title === "Water")!;
    const write = await blockEdits(server, B.wellness, { weekday: 0 }).remove(
      water,
    );
    expect(write.reach?.weekday).toBe(0);

    const usual = await view("usual", B.wellness, 0);
    expect(usual.items.map((i) => i.title)).not.toContain("Water");
    const monday = await view(THIS_WEEK, B.wellness, 0);
    expect(monday.items.map((i) => i.title)).not.toContain("Water");
  });
});

describe("C-USE-block-view-empty-2: Return adds 5 min after the last", () => {
  it("adds to the new block at its start, then after the first", async () => {
    const { server, view } = setup("block-view-empty-new-block");
    const edits = blockEdits(server, B.wellnessThursday, { weekday: 3 });
    await edits.add("Pee and weigh", []);
    const one = await view("usual", B.wellnessThursday, 3);
    await edits.add("Water", one.items);
    const two = await view("usual", B.wellnessThursday, 3);
    expect(two.items.map((i) => [i.title, i.startsAt, i.lengthMin])).toEqual([
      ["Pee and weigh", "07:05", 5],
      ["Water", "07:10", 5],
    ]);
    expect(two.reflow.freeFrom).toBe("07:15");
  });
});

describe("C-USE-block-view-overflow-2: the items fit again", () => {
  it("runs 12 min past 8:00, then removing Journal ends it", async () => {
    const { server, view } = setup("block-view-overflow");
    const over = await view("usual", B.wellness, 0);
    expect(over.reflow.overMin).toBe(12);
    const journal = over.items.find((i) => i.title.startsWith("Journal"))!;
    await blockEdits(server, B.wellness, { weekday: 0 }).remove(journal);
    const fits = await view("usual", B.wellness, 0);
    expect(fits.reflow.overMin).toBe(0);
  });
});

describe("C-USE-block-view-editing-offline-2: offline edits wait, then land", () => {
  it("queues a removal and an add, and sends both in order once back", async () => {
    // The queue starts offline over a server that is reachable once back.
    const { server, view } = setup();
    const queue = createPlannerQueue(server, false);
    const planner = {
      writeBlockItem: (...a: Parameters<typeof server.writeBlockItem>) =>
        queue.run({ method: "writeBlockItem", args: a }),
      removeBlockItem: (...a: Parameters<typeof server.removeBlockItem>) =>
        queue.run({ method: "removeBlockItem", args: a }),
      reorderItems: (...a: Parameters<typeof server.reorderItems>) =>
        queue.run({ method: "reorderItems", args: a }),
      editBlock: (...a: Parameters<typeof server.editBlock>) =>
        queue.run({ method: "editBlock", args: a }),
      writeBlockChange: (...a: Parameters<typeof server.writeBlockChange>) =>
        queue.run({ method: "writeBlockChange", args: a }),
    } as unknown as Parameters<typeof blockEdits>[0];
    const before = await view("usual", B.wellness, 0);
    const edits = blockEdits(planner, B.wellness, { weekday: 0 });
    const removed = edits.remove(before.items[0]!);
    const added = edits.add("Stretch", before.items);
    expect(queue.waiting()).toBe(2);

    await queue.setOnline(true);
    await Promise.all([removed, added]);
    const after = await view("usual", B.wellness, 0);
    expect(after.items.map((i) => i.title)).not.toContain("Pee and weigh");
    expect(after.items.map((i) => i.title)).toContain("Stretch");
  });
});

describe("the header's meta (by-kind.md, Words)", () => {
  it("names the kind where the name is not it, and the scope", () => {
    const every = (w: number) => scopeWords({ weekday: w }, w);
    expect(
      blockEditMeta({
        kind: "wellness",
        name: "Wellness",
        startsAt: "07:05",
        endsAt: "08:00",
        scope: every(0),
      }),
    ).toBe("7:05 to 8:00 · every Monday");
    expect(
      blockEditMeta({
        kind: "life",
        name: "Dinner with friends",
        startsAt: "19:00",
        endsAt: "21:00",
        scope: every(3),
      }),
    ).toBe("Life · 19:00 to 21:00 · every Thursday");
    expect(
      blockEditMeta({
        kind: "work",
        name: "Writing",
        startsAt: "09:30",
        endsAt: "12:00",
        scope: every(1),
      }),
    ).toBe("Work · 9:30 to 12:00 · every Tuesday");
    expect(
      blockEditMeta({
        kind: "wellness",
        name: "Sunday",
        startsAt: "00:00",
        endsAt: "24:00",
        scope: every(6),
      }),
    ).toBe("All day · Checklist · every Sunday");
    expect(scopeWords({ date: THURSDAY_15 }, 3)).toBe("this Thursday");
  });
});
