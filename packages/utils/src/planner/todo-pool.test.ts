import { describe, expect, it } from "vitest";
import {
  isReturned,
  todoPool,
  type TodoPoolSlot,
  type TodoPoolTodo,
} from "./todo-pool";

const END = new Date("2026-10-13T19:30:00Z");
const before = new Date(END.getTime() - 60_000);
const after = new Date(END.getTime() + 60_000);

const todo = (id: string, extra: Partial<TodoPoolTodo> = {}): TodoPoolTodo => ({
  id,
  onDate: null,
  doneAt: null,
  archivedAt: null,
  createdAt: "2026-10-01T12:00:00Z",
  ...extra,
});

const slot = (
  todoId: string | null,
  extra: Partial<TodoPoolSlot> = {},
): TodoPoolSlot => ({
  todoId,
  onDate: "2026-10-13",
  doneAt: null,
  blockEnd: END,
  ...extra,
});

describe("C1: an undone to-do slot reads as returned at its block's end, never before", () => {
  it("is not returned a minute before the end", () => {
    expect(isReturned(slot("t"), END, before)).toBe(false);
  });

  it("is returned at the end exactly, and after", () => {
    expect(isReturned(slot("t"), END, END)).toBe(true);
    expect(isReturned(slot("t"), END, after)).toBe(true);
  });

  it("a done slot never returns", () => {
    expect(
      isReturned(slot("t", { doneAt: "2026-10-13T19:00:00Z" }), END, after),
    ).toBe(false);
  });

  it("a work or set-item slot never returns", () => {
    expect(isReturned(slot(null), END, after)).toBe(false);
  });
});

describe("C2: the pool holds undated, undone, unarchived to-dos not in a live slot, oldest first", () => {
  it("orders by when each was made, then id, not array order", () => {
    const pool = todoPool({
      todos: [
        todo("c", { createdAt: "2026-10-03T00:00:00Z" }),
        todo("b", { createdAt: "2026-10-02T00:00:00Z" }),
        todo("a", { createdAt: "2026-10-03T00:00:00Z" }),
      ],
      slots: [],
      now: before,
    });
    expect(pool.map((entry) => entry.todoId)).toEqual(["b", "a", "c"]);
  });

  it("leaves out dated, done and archived to-dos", () => {
    const pool = todoPool({
      todos: [
        todo("dated", { onDate: "2026-10-14" }),
        todo("done", { doneAt: "2026-10-12T10:00:00Z" }),
        todo("archived", { archivedAt: "2026-10-12T10:00:00Z" }),
        todo("open"),
      ],
      slots: [],
      now: before,
    });
    expect(pool).toEqual([{ todoId: "open", returnedFrom: null }]);
  });

  it("leaves out a to-do held by a live slot, and lets it back at the block's end", () => {
    const input = { todos: [todo("t")], slots: [slot("t")] };
    expect(todoPool({ ...input, now: before })).toEqual([]);
    expect(todoPool({ ...input, now: END })).toEqual([
      { todoId: "t", returnedFrom: "2026-10-13" },
    ]);
  });

  it("names the latest date a to-do returned from", () => {
    const pool = todoPool({
      todos: [todo("t")],
      slots: [
        slot("t", {
          onDate: "2026-10-11",
          blockEnd: new Date("2026-10-11T20:00:00Z"),
        }),
        slot("t", {
          onDate: "2026-10-12",
          blockEnd: new Date("2026-10-12T20:00:00Z"),
        }),
      ],
      now: after,
    });
    expect(pool).toEqual([{ todoId: "t", returnedFrom: "2026-10-12" }]);
  });

  it("a to-do returned yesterday and slotted again today is out of the pool", () => {
    const pool = todoPool({
      todos: [todo("t")],
      slots: [
        slot("t", {
          onDate: "2026-10-12",
          blockEnd: new Date("2026-10-12T20:00:00Z"),
        }),
        slot("t"),
      ],
      now: before,
    });
    expect(pool).toEqual([]);
  });

  it("a slot for a later day holds its to-do too", () => {
    const pool = todoPool({
      todos: [todo("t")],
      slots: [
        slot("t", {
          onDate: "2026-10-15",
          blockEnd: new Date("2026-10-15T20:00:00Z"),
        }),
      ],
      now: after,
    });
    expect(pool).toEqual([]);
  });
});
