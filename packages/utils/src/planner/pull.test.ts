import { describe, expect, it } from "vitest";
import {
  PULL_DEFAULT_LENGTH_MIN,
  pullTodos,
  type PullBlock,
  type PullTodo,
} from "./pull";

const at = (clock: string) => new Date(`2026-10-13T${clock}:00Z`);

const block = (
  id: string,
  start: string,
  end: string,
  extra: Partial<PullBlock> = {},
): PullBlock => ({
  id,
  fill: "from_todos",
  start: at(start),
  end: at(end),
  slots: [],
  ...extra,
});

const todo = (
  todoId: string,
  lengthMin: number | null = 15,
  extra: Partial<PullTodo> = {},
): PullTodo => ({
  todoId,
  lengthMin,
  remindAt: null,
  ...extra,
});

describe("C3: each From to-dos block fills in start order, oldest first, walking past what doesn't fit", () => {
  it("fills the earlier block first, whatever the array order", () => {
    const pulled = pullTodos({
      blocks: [
        block("late", "14:00", "14:30"),
        block("early", "10:00", "10:30"),
      ],
      pool: [todo("a", 30), todo("b", 30)],
    });
    expect(pulled).toEqual([
      { blockId: "early", todoId: "a", sortOrder: 0 },
      { blockId: "late", todoId: "b", sortOrder: 0 },
    ]);
  });

  it("keeps the pool's order inside a block", () => {
    const pulled = pullTodos({
      blocks: [block("b1", "10:00", "11:00")],
      pool: [todo("oldest", 10), todo("middle", 10), todo("newest", 10)],
    });
    expect(pulled.map((slot) => slot.todoId)).toEqual([
      "oldest",
      "middle",
      "newest",
    ]);
  });

  it("walks on past a to-do too long for the minutes left", () => {
    const pulled = pullTodos({
      blocks: [block("b1", "10:00", "10:45")],
      pool: [
        todo("a", 30),
        todo("long", 30),
        todo("short", 15),
        todo("more", 5),
      ],
    });
    expect(pulled.map((slot) => slot.todoId)).toEqual(["a", "short"]);
  });

  it("never overfills: what it takes sums to the block or less", () => {
    const pulled = pullTodos({
      blocks: [block("b1", "10:00", "10:50")],
      pool: [todo("a", 20), todo("b", 20), todo("c", 20)],
    });
    expect(pulled.map((slot) => slot.todoId)).toEqual(["a", "b"]);
  });

  it("takes only From to-dos blocks", () => {
    const pulled = pullTodos({
      blocks: [block("hand", "10:00", "11:00", { fill: "by_hand" })],
      pool: [todo("a")],
    });
    expect(pulled).toEqual([]);
  });
});

describe("C4: slots already in a block count, nothing is taken twice, reminders stay out, no length is 15", () => {
  it("counts the block's slots against its minutes and follows its highest sort order", () => {
    const pulled = pullTodos({
      blocks: [
        block("b1", "10:00", "11:00", {
          slots: [
            { todoId: "x", lengthMin: 30, sortOrder: 4 },
            { todoId: "y", lengthMin: null, sortOrder: 1 },
          ],
        }),
      ],
      pool: [todo("a", 20), todo("b", 15), todo("c", 10)],
    });
    expect(pulled).toEqual([{ blockId: "b1", todoId: "b", sortOrder: 5 }]);
  });

  it("never takes one already slotted, in any block", () => {
    const pulled = pullTodos({
      blocks: [
        block("hand", "09:00", "10:00", {
          fill: "by_hand",
          slots: [{ todoId: "a", lengthMin: 10, sortOrder: 0 }],
        }),
        block("b1", "10:00", "11:00"),
      ],
      pool: [todo("a", 10), todo("b", 10)],
    });
    expect(pulled.map((slot) => slot.todoId)).toEqual(["b"]);
  });

  it("never takes one to-do into two blocks", () => {
    const pulled = pullTodos({
      blocks: [block("b1", "10:00", "10:15"), block("b2", "11:00", "12:00")],
      pool: [todo("a", 15), todo("b", 15)],
    });
    expect(pulled).toEqual([
      { blockId: "b1", todoId: "a", sortOrder: 0 },
      { blockId: "b2", todoId: "b", sortOrder: 0 },
    ]);
  });

  it("leaves a to-do with a reminder time out", () => {
    const pulled = pullTodos({
      blocks: [block("b1", "10:00", "11:00")],
      pool: [todo("reminder", 5, { remindAt: "10:30" }), todo("plain", 5)],
    });
    expect(pulled.map((slot) => slot.todoId)).toEqual(["plain"]);
  });

  it("gives a to-do with no length 15 minutes", () => {
    expect(PULL_DEFAULT_LENGTH_MIN).toBe(15);
    const pulled = pullTodos({
      blocks: [block("b1", "10:00", "10:20")],
      pool: [todo("a", null), todo("b", null), todo("c", 5)],
    });
    expect(pulled.map((slot) => slot.todoId)).toEqual(["a", "c"]);
  });
});
