import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BLOCK_WORK_TODOS_IDS } from "@/lib/fixtures/scenarios/block-view-work-todos";
import { SET_UP_IDS, SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";
import {
  placeTodosInputs,
  todoOrderWrites,
  todosBlock,
  todosPickerView,
} from "./block-view-todos";
import { blockFitLine, blockWorkTiers } from "./block-view-work";
import { deriveBlockView } from "./use-block-view";

/** USE-50: a This week Work block on its tiers, and a To-dos block, on `block-view-*`. */

const B = SET_UP_IDS.blocks;
const T = BLOCK_WORK_TODOS_IDS.todos;
const THIS_WEEK = "2026-W42";
const MON = 0;
const SAT = 5;
const SUN = 6;
const SAT_17 = "2026-10-17";
const now = () => new Date(SET_UP_NOW);

function setup(state: string) {
  const server = createFixtureServer(resolveScenario(state), now);
  return {
    server,
    async view(blockId: string, weekday: number, week = THIS_WEEK) {
      const records = await server.readWeek(week);
      return deriveBlockView(records, blockId, weekday, true)!;
    },
  };
}

describe("C-USE-block-view-work-tiers-1, -2: Work on Mon 12", () => {
  it("draws the four tiers, Urgent with nothing in it, rows with ID and size and range", async () => {
    const { view } = setup("block-view-work-tiers");
    const tiers = blockWorkTiers(await view(B.work, MON));
    expect(
      tiers.map((tier) => [
        tier.word,
        tier.rows.map((row) => [row.title, row.meta, row.range]),
      ]),
    ).toEqual([
      ["Urgent", []],
      [
        "Primary",
        [
          ["[Write the sync spec]", "ENG-123 · 3 Medium", "1 to 2 h"],
          ["[Review the Paper handoff]", null, "30 min"],
        ],
      ],
      [
        "Secondary",
        [["[Fix the retry backoff]", "ENG-140 · 2 Small", "30 min to 1 h"]],
      ],
      ["Stretch", [["[Tidy the Linear backlog]", null, "15 min"]]],
    ]);
  });
});

describe("C-USE-block-view-work-tiers-4: the fit line in words, never a count", () => {
  it("says where Primary ends at the top of its ranges", async () => {
    const { view } = setup("block-view-work-tiers");
    expect(blockFitLine(await view(B.work, MON))).toBe(
      "Primary fills to 12:00 at the top of its ranges. Secondary and Stretch go in if there's room.",
    );
  });

  it("past the end, and with nothing in Primary, re-states it in words", async () => {
    const past = blockFitLine(
      await setup("block-view-work-past-end").view(B.work, MON),
    );
    expect(past).toBe(
      "Primary runs to 13:00 at the top of its ranges, past the end at 12:00. Secondary and Stretch go in if there's room.",
    );
    const none = blockFitLine(
      await setup("block-view-work-nothing-in-primary").view(B.work, MON),
    );
    expect(none).toMatch(/^Nothing in Primary yet\./);
    // Times are the only numbers: no tally of items anywhere in the line.
    for (const line of [past, none]) {
      expect(line.replace(/\d{1,2}:\d{2}/g, "")).not.toMatch(/\d/);
    }
  });
});

describe("C-USE-block-view-kind-3: a change on This week is that date's only", () => {
  it("a to-do placed and a work slot moved on This week leave the usual week as it was", async () => {
    const { server, view } = setup("block-view-todos-pool");
    const usual = await server.readWeek("usual");
    const errands = await view(B.errandsSaturday, SAT);
    for (const input of placeTodosInputs(errands, [T.parcel])) {
      await server.placeSlot(input);
    }
    const work = await view(B.work, MON);
    const [first] = blockWorkTiers(work)[1]!.rows;
    await server.moveWork({ slotId: first!.slotId, sortOrder: 9 });
    expect(await server.readWeek("usual")).toEqual(usual);
    const after = todosBlock(await view(B.errandsSaturday, SAT));
    expect(after.todos.map((row) => row.title).at(-1)).toBe(
      "Return the parcel",
    );
  });
});

describe("C-USE-block-view-todos-pool: From To-dos on Errands", () => {
  async function picker(
    state: string,
    checked: string[],
    type: Parameters<typeof todosPickerView>[0]["type"] = null,
  ) {
    const { server, view } = setup(state);
    return todosPickerView({
      records: await server.readTodos(SAT_17),
      view: await view(B.errandsSaturday, SAT),
      now: now(),
      checked,
      type,
    });
  }

  it("-1, -2, -3: the pool oldest first, Groceries greyed, the line over Add", async () => {
    const view = await picker("block-view-todos-pool", [T.parcel, T.groceries]);
    expect(view.context).toBe("Into Errands · Sat 17, 10:00 to 12:30");
    expect(view.chips.map((chip) => chip.label)).toEqual([
      "All types",
      "Home",
      "Errand",
    ]);
    expect(
      view.rows.map((row) => [
        row.title,
        row.inBlock ? row.trailing : row.meta,
      ]),
    ).toEqual([
      ["Return the parcel", "Errand · added Sat 3 Oct"],
      ["Return the library books", "Errand · added Mon 5 Oct"],
      ["Post office: stamps", "Errand · repeats monthly"],
      ["Hang the shelf [placeholder]", "Home · added Thu 8 Oct"],
      ["Drop off the dry cleaning", "In Errands"],
      ["Call the mechanic", "In Errands"],
      ["Groceries", "In Errands"],
    ]);
    // Groceries is in the block: it can't be picked twice.
    expect(view.checked).toEqual([T.parcel]);
    expect(view.footer).toEqual({
      text: "Adds Return the parcel. Errands then runs to 11:35, inside its time.",
      inside: true,
    });
  });

  it("D-USE-87: picks past the end say so, adding still allowed", async () => {
    const view = await picker("block-view-todos-pool-past-end", [
      T.parcel,
      T.libraryBooks,
      T.postOffice,
    ]);
    expect(view.footer).toEqual({
      text: "Adds Return the parcel, Return the library books and Post office: stamps. Errands then runs to 12:45, past its time.",
      inside: false,
    });
  });

  it("-4, C-USE-block-view-kind-2: a type narrows the list only; the block keeps every type", async () => {
    const view = await picker("block-view-todos-pool", [T.parcel], "home");
    expect(view.rows.map((row) => row.title)).toEqual([
      "Hang the shelf [placeholder]",
    ]);
    // The check made under All types still counts, though the filter hides it.
    expect(view.checked).toEqual([T.parcel]);
    const { view: read } = setup("block-view-todos-pool");
    const block = todosBlock(await read(B.errandsSaturday, SAT));
    expect(block.todos.map((row) => row.title)).toEqual([
      "Drop off the dry cleaning",
      "Call the mechanic",
      "Groceries",
    ]);
  });

  it("-5: Add slots the checked to-dos after the last, for that date", async () => {
    const { view } = setup("block-view-todos-pool");
    const errands = await view(B.errandsSaturday, SAT);
    expect(placeTodosInputs(errands, [T.parcel, T.shelf])).toEqual([
      {
        blockId: B.errandsSaturday,
        onDate: SAT_17,
        sortOrder: 3,
        todoId: T.parcel,
      },
      {
        blockId: B.errandsSaturday,
        onDate: SAT_17,
        sortOrder: 4,
        todoId: T.shelf,
      },
    ]);
  });

  it("no to-dos with no day: nothing listed to pick", async () => {
    const view = await picker("block-view-todos-pool-empty", []);
    expect(view.rows.every((row) => row.inBlock)).toBe(true);
  });
});

describe("C-USE-block-view-todos-dated-plan-1, -2: a dated plan inside Errands", () => {
  it("pins Coffee with Sam as a band; Groceries moves after it whole", async () => {
    const { view } = setup("block-view-todos-dated-plan");
    const block = todosBlock(await view(B.errandsSaturday, SAT));
    expect(
      block.rows.map((row) =>
        row.kind === "event"
          ? `${row.startsAt} ${row.title} · ${row.words}`
          : `${row.startsAt} ${row.title} ${row.lengthMin}`,
      ),
    ).toEqual([
      "10:00 Drop off the dry cleaning 20",
      "10:20 Call the mechanic 15",
      "11:00 Coffee with Sam · Personal · 11:00 to 11:30",
      "11:30 Groceries 45",
    ]);
    expect(block.reflow.freeFrom).toBe("12:15");
    expect(block.lines).toEqual([
      "Coffee with Sam is a dated plan for this Saturday only, a band inside Errands at its time.",
      "Groceries moved after it: an item is never split.",
    ]);
  });
});

describe("C-USE-block-view-todos-sunday-reset-1: Sunday reset", () => {
  it("holds its home jobs on the rail and names the repeating one", async () => {
    const { view } = setup("block-view-todos-sunday-reset");
    const block = todosBlock(await view(B.sundayReset, SUN));
    expect(
      block.rows.map((row) => `${row.startsAt} ${row.title} ${row.lengthMin}`),
    ).toEqual([
      "13:00 Clear out the bedroom 90",
      "14:30 Sort the pantry 45",
      "15:15 Clean the fridge 40",
    ]);
    expect(block.lines.at(-1)).toBe(
      "Clean the fridge repeats every 2 weeks; once done, its next one waits in To-dos.",
    );
  });
});

describe("todoOrderWrites: a drop among the to-dos", () => {
  it("writes only the slots whose place changed, the bands left out", () => {
    const rows = [
      { id: "a", sortOrder: 0 },
      { id: "b", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ];
    expect(todoOrderWrites(rows, ["c", "band", "a", "b"])).toEqual([
      { slotId: "c", sortOrder: 0 },
      { slotId: "a", sortOrder: 1 },
      { slotId: "b", sortOrder: 2 },
    ]);
  });
});
