import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BLOCK_EDIT_IDS } from "@/lib/fixtures/scenarios/block-view-editing";
import { SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";
import {
  blockEditMeta,
  blockEdits,
  scopeWords,
  spanTotal,
  stepLength,
  suggestionsFor,
  withDraftLength,
} from "./block-edit";
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

describe("USE-156: the suggestion list and the span total", () => {
  const titles = (rows: readonly { title: string }[]) => rows.map((r) => r.title);

  it("C1: a tap adds one item at the end with its title, icon and length; it leaves the list and the total moves", async () => {
    const { server, view } = setup("suggested-added");
    const records = await server.readWeek("usual");
    const before = suggestionsFor(records, B.wellnessThursday, 3)!;
    // Monday's Wellness items, minus the three already in Thursday's.
    expect(titles(before.usedBefore)).toEqual(["Start the cold bath", "Cold bath"]);
    expect(before.seed.length).toBeGreaterThan(0);
    const blockBefore = await view("usual", B.wellnessThursday, 3);
    expect(spanTotal(blockBefore.block, blockBefore.items)).toEqual({
      plannedMin: 13,
      spanMin: 60,
      freeMin: 47,
      overMin: 0,
    });

    const pick = before.usedBefore[1]!;
    await blockEdits(server, B.wellnessThursday, { weekday: 3 }).add(
      pick.title,
      blockBefore.items,
      pick.icon,
      pick.lengthMin,
    );

    const after = await view("usual", B.wellnessThursday, 3);
    expect(after.items).toHaveLength(blockBefore.items.length + 1);
    const last = inTimeOrder(after.items).at(-1)!;
    expect(last).toMatchObject({
      title: "Cold bath",
      icon: { kind: "emoji", value: "🧊" },
      lengthMin: 10,
      startsAt: "07:18",
    });
    const list = suggestionsFor(await server.readWeek("usual"), B.wellnessThursday, 3)!;
    expect(titles(list.usedBefore)).toEqual(["Start the cold bath"]);
    expect(spanTotal(after.block, after.items)).toMatchObject({
      plannedMin: 23,
      freeMin: 37,
    });
  });

  it("C1: a new block lists Used before from another day's block of its kind, then the seed", async () => {
    const { server } = setup("suggested-new");
    const list = suggestionsFor(await server.readWeek("usual"), B.wellnessThursday, 3)!;
    expect(titles(list.usedBefore)).toEqual([
      "Pee and weigh",
      "Water",
      "Start the cold bath",
      "Meditate",
      "Cold bath",
    ]);
    expect(titles(list.seed)[0]).toBe("Breath work");
    expect(titles(list.seed)).not.toContain("Meditate");
  });

  it("C1: the first block of a kind shows only the seed; Work shows no list", async () => {
    const { server } = setup("suggested-first-of-kind");
    const records = await server.readWeek("usual");
    const evening = suggestionsFor(records, B.eveningTuesday, 1)!;
    expect(evening.usedBefore).toEqual([]);
    expect(titles(evening.seed).slice(0, 6)).toEqual([
      "Read",
      "Stretch",
      "Meditate",
      "Lay out tomorrow",
      "Journal",
      "Phone away",
    ]);
    expect(suggestionsFor(records, B.work, 0)).toBeNull();
    // A checklist with no times has no list either.
    expect(suggestionsFor(records, B.sunday, 6)).toBeNull();
  });

  it("C3: past the span the total runs over, and a + still adds", async () => {
    const { server, view } = setup("suggested-past-span");
    const block = await view("usual", B.wellnessThursday, 3);
    expect(spanTotal(block.block, block.items)).toEqual({
      plannedMin: 68,
      spanMin: 60,
      freeMin: 0,
      overMin: 8,
    });
    const list = suggestionsFor(await server.readWeek("usual"), B.wellnessThursday, 3)!;
    expect(titles(list.usedBefore)).toEqual(["Start the cold bath"]);
    const pick = list.usedBefore[0]!;
    await blockEdits(server, B.wellnessThursday, { weekday: 3 }).add(
      pick.title,
      block.items,
      pick.icon,
      pick.lengthMin,
    );
    const after = await view("usual", B.wellnessThursday, 3);
    expect(spanTotal(after.block, after.items).overMin).toBe(10);
    expect(inTimeOrder(after.items).at(-1)!.title).toBe("Start the cold bath");
  });
});

describe("USE-157: a length edited in place", () => {
  it("steps by 5 min, or 1 min below 5, never under 1", () => {
    expect(stepLength(10, 1)).toBe(15);
    expect(stepLength(10, -1)).toBe(5);
    expect(stepLength(5, -1)).toBe(4);
    expect(stepLength(4, 1)).toBe(5);
    expect(stepLength(1, -1)).toBe(1);
    expect(stepLength(7, 1)).toBe(10);
    expect(stepLength(7, -1)).toBe(5);
  });

  it("C1: stepping moves the total and every later rail time at once, and Return saves one length write", async () => {
    const { server, view } = setup("suggested-length");
    const block = await view("usual", B.wellnessThursday, 3);
    const draft = withDraftLength(block, block.items, {
      id: B.items.addedMeditate,
      lengthMin: 15,
    });
    expect(rail(inTimeOrder(draft.items))).toEqual([
      "07:05 Pee and weigh",
      "07:07 Water",
      "07:08 Meditate",
    ]);
    expect(spanTotal(block.block, draft.items)).toMatchObject({
      plannedMin: 18,
      freeMin: 42,
    });
    expect(draft.reflow.freeFrom).toBe("07:23");

    // A set-time row keeps its time; only the rows after a stepped one move.
    const monday = await view("usual", B.wellness, 0);
    const longer = withDraftLength(monday, monday.items, {
      id: monday.items[0]!.id,
      lengthMin: 4,
    });
    expect(rail(inTimeOrder(longer.items))).toEqual([
      "07:05 Pee and weigh",
      "07:09 Water",
      "07:10 Meditate",
      "07:20 Start the cold bath",
      "07:22 Cold bath",
    ]);

    const writes: unknown[] = [];
    const counting = {
      ...server,
      editBlockItem: (...args: Parameters<typeof server.editBlockItem>) => {
        writes.push(args);
        return server.editBlockItem(...args);
      },
    };
    await blockEdits(counting, B.wellnessThursday, { weekday: 3 }).length(
      { id: B.items.addedMeditate },
      15,
    );
    expect(writes).toHaveLength(1);
    const saved = await view("usual", B.wellnessThursday, 3);
    expect(saved.items.find((i) => i.id === B.items.addedMeditate)!.lengthMin).toBe(15);
    expect(spanTotal(saved.block, saved.items).plannedMin).toBe(18);
  });
});
