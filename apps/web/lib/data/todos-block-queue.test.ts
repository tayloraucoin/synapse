import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { SET_UP_IDS, SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";
import {
  todoOrderWrites,
  todosBlock,
  withPendingTodos,
} from "./block-view-todos";
import { deriveBlockView } from "./use-block-view";
import { createPlannerQueue } from "./use-planner-writes";

/**
 * USE-111 C1: a To-dos block's reorder and New to-do on This week go through
 * the planner queue. Offline they show at once and wait; back, they land
 * once, in the order made, on that date only.
 */

const B = SET_UP_IDS.blocks;
const THIS_WEEK = "2026-W42";
const SAT = 5;
const SAT_17 = "2026-10-17";

function setup() {
  const server = createFixtureServer(
    resolveScenario("block-view-todos-pool"),
    () => new Date(SET_UP_NOW),
  );
  return {
    server,
    async view() {
      const records = await server.readWeek(THIS_WEEK);
      return deriveBlockView(records, B.errandsSaturday, SAT, true)!;
    },
  };
}

const titles = (rows: readonly { title: string }[]) =>
  rows.map((row) => row.title);

describe("C1: offline, a to-do reordered and one added in Errands", () => {
  it("shows at once, waits, and lands once, in order, when back", async () => {
    const { server, view } = setup();
    const usual = await server.readWeek("usual");
    const queue = createPlannerQueue(server, false);
    const before = todosBlock(await view());
    expect(titles(before.todos)).toEqual([
      "Drop off the dry cleaning",
      "Call the mechanic",
      "Groceries",
    ]);

    // Groceries dragged to the top.
    const ids = before.todos.map((row) => row.id);
    const dragged = [ids[2]!, ids[0]!, ids[1]!];
    const moves = todoOrderWrites(before.todos, dragged);
    const reordered = Promise.all(
      moves.map((move) =>
        queue.run({
          method: "writeSlots",
          args: [{ id: move.slotId, sortOrder: move.sortOrder }],
        }),
      ),
    );
    // Then New to-do, after the last.
    const added = queue.run({
      method: "writeTodoSlot",
      args: [
        {
          todo: { title: "Buy stamps", type: "other" },
          slot: {
            blockId: B.errandsSaturday,
            onDate: SAT_17,
            sortOrder: before.nextSortOrder,
          },
        },
      ],
    });
    expect(queue.waiting()).toBe(moves.length + 1);

    // At once: the order held on the screen and the new one on the rail.
    const shown = todosBlock(
      withPendingTodos(await view(), SAT_17, [
        {
          key: crypto.randomUUID(),
          title: "Buy stamps",
          icon: null,
          sortOrder: before.nextSortOrder,
        },
      ]),
      dragged,
    );
    expect(titles(shown.todos)).toEqual([
      "Groceries",
      "Drop off the dry cleaning",
      "Call the mechanic",
      "Buy stamps",
    ]);
    // Nothing has landed while offline.
    expect(titles(todosBlock(await view()).todos)).toEqual(
      titles(before.todos),
    );

    await queue.setOnline(true);
    await Promise.all([reordered, added]);
    expect(queue.waiting()).toBe(0);

    const after = todosBlock(await view());
    expect(titles(after.todos)).toEqual([
      "Groceries",
      "Drop off the dry cleaning",
      "Call the mechanic",
      "Buy stamps",
    ]);
    const todos = await server.readTodos(SAT_17);
    expect(
      todos.todos.filter((todo) => todo.title === "Buy stamps"),
    ).toHaveLength(1);
    // That date's only: the usual week is as it was.
    expect(await server.readWeek("usual")).toEqual(usual);
  });
});
