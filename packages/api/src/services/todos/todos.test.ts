import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import {
  todosReadOutput,
  type BlockChangeRecord,
  type BlockRecord,
  type SlotEventRecord,
  type SlotRecord,
  type TodoRecord,
} from "@syn/validators";
import { refusalReason } from "../../errors";
import {
  block,
  change,
  DAILY,
  id,
  item,
  slot,
  todo,
  TZ,
} from "../planner/planner-rows.fixture";
import { memoryDb, type MemoryDb } from "../undo/memory-store.fixture";
import type { UndoTable } from "../undo/tables";
import { recordUndo, undoWrite } from "../undo/undo";
import {
  createTodo,
  listTodos,
  removeTodo,
  restoreTodo,
  setTodoDone,
  updateTodo,
  type TodoStore,
} from "./todos";

/**
 * USE-95 C1 to C3: the to-dos over rows in memory for two people. The store
 * sees only the caller's rows, as the policies do; removing a to-do takes
 * its slots and their events as the foreign keys' cascade does; and each
 * write runs in `db.transaction`, which stands for the router's one RLS
 * transaction, so a refusal leaves every row as it was.
 *
 * The clock: Saturday 17 October 2026 at 08:00 in Vancouver.
 */

const ME = "00000000-0000-4000-a000-000000000001";
const THEM = "00000000-0000-4000-a000-000000000002";
const NOW = new Date("2026-10-17T15:00:00.000Z");
const TODAY = "2026-10-17";
const STAMP_OLD = "2026-09-01T12:00:00.000Z";
const KEY = "test-undo-key-0123456789abcdef0123456789";
const TABLES: UndoTable[] = ["todos", "slots", "slotEvents", "blocks"];

function slotEvent(
  over: Partial<SlotEventRecord> & Pick<SlotEventRecord, "slotId">,
): SlotEventRecord {
  return {
    id: id(),
    createdAt: "2026-10-16T17:00:00.000Z",
    kind: "started",
    clientEventId: id(),
    at: "2026-10-16T17:00:00.000Z",
    receivedAt: "2026-10-16T17:00:01.000Z",
    stepAwayId: null,
    ...over,
  };
}

/** The `TodoStore` over the database in memory, as `userId` sees it. */
function storeOver(db: MemoryDb, userId: string): TodoStore {
  const rows = db.storeFor(userId);
  const mine = <T>(table: UndoTable) =>
    structuredClone(db.rowsOf(table, userId)) as unknown as T[];
  return {
    account: async () => ({ timeZone: TZ, dayCloseTime: "03:00" }),
    todos: async () => mine<TodoRecord>("todos"),
    todoSlots: async () =>
      mine<SlotRecord>("slots").filter((s) => s.todoId !== null),
    slotEvents: async (ids) =>
      mine<SlotEventRecord>("slotEvents").filter((e) => ids.includes(e.slotId)),
    blocks: async () => mine<BlockRecord>("blocks"),
    blockChanges: async (dates) =>
      mine<BlockChangeRecord>("blockChanges").filter((c) =>
        dates.includes(c.onDate),
      ),
    rows: {
      insert: rows.insert,
      update: rows.update,
      async remove(table, rowId) {
        const gone = await rows.remove(table, rowId);
        if (gone && table === "todos") {
          // `slots.todo_id` and `slot_events.slot_id` cascade (USE-2).
          const slots = db.tables.get("slots") ?? new Map();
          const events = db.tables.get("slotEvents") ?? new Map();
          for (const [slotId, held] of slots) {
            if (held.row.todoId !== rowId) continue;
            slots.delete(slotId);
            for (const [eventId, e] of events) {
              if (e.row.slotId === slotId) events.delete(eventId);
            }
          }
        }
        return gone;
      },
    },
  };
}

async function seed(
  db: MemoryDb,
  owner: string,
  rows: Partial<Record<UndoTable, { id: string }[]>>,
) {
  const store = db.storeFor(owner);
  for (const [table, list] of Object.entries(rows)) {
    for (const row of list) {
      await store.insert(table as UndoTable, structuredClone(row));
    }
  }
}

function snapshot(db: MemoryDb, userId: string) {
  return Object.fromEntries(TABLES.map((t) => [t, db.rowsOf(t, userId)]));
}

async function refused(run: () => Promise<unknown>) {
  const thrown = await run().then(
    () => null,
    (error: unknown) => error,
  );
  expect(thrown).toBeInstanceOf(TRPCError);
  return {
    reason: refusalReason(thrown as TRPCError),
    message: (thrown as TRPCError).message,
  };
}

/** Errands on Saturday with a to-do slot, and a set item's slot beside it. */
async function errandsSetUp() {
  const db = memoryDb();
  const errands = block({ name: "Errands", kind: "todos" });
  const drill = todo({ title: "Return the drill", createdAt: STAMP_OLD });
  const parcel = todo({ title: "Post the parcel", onDate: TODAY });
  const drillSat = slot({
    blockId: errands.id,
    onDate: TODAY,
    todoId: drill.id,
  });
  const drillFri = slot({
    blockId: errands.id,
    onDate: "2026-10-16",
    todoId: drill.id,
  });
  const stretch = item({ blockId: errands.id });
  const setSlot = slot({
    blockId: errands.id,
    onDate: TODAY,
    blockItemId: stretch.id,
  });
  const started = slotEvent({ slotId: drillFri.id });
  const paused = slotEvent({
    slotId: drillFri.id,
    kind: "paused",
    at: "2026-10-16T17:10:00.000Z",
  });
  const satChange = change({ blockId: errands.id, onDate: TODAY });
  const farChange = change({ blockId: errands.id, onDate: "2026-11-02" });
  await seed(db, ME, {
    blocks: [errands],
    todos: [drill, parcel],
    slots: [drillSat, drillFri, setSlot],
    slotEvents: [started, paused],
    blockChanges: [satChange, farChange],
  });
  // Another person's to-do and block, which no call of mine may reach.
  const theirBlock = block({ name: "Theirs" });
  const theirTodo = todo({ title: "Their errand" });
  await seed(db, THEM, {
    blocks: [theirBlock],
    todos: [theirTodo],
    slots: [
      slot({ blockId: theirBlock.id, onDate: TODAY, todoId: theirTodo.id }),
    ],
  });
  return {
    db,
    store: storeOver(db, ME),
    errands,
    drill,
    parcel,
    drillSat,
    drillFri,
    setSlot,
    started,
    paused,
    satChange,
    farChange,
    theirBlock,
    theirTodo,
  };
}

describe("todo.list (C1)", () => {
  it("returns the dated to-dos, the pool and their slots in readTodos' shape", async () => {
    const s = await errandsSetUp();
    const read = await listTodos(s.store, TODAY);

    expect(todosReadOutput.safeParse(read).success).toBe(true);
    expect(read.date).toBe(TODAY);
    expect(read.timeZone).toBe(TZ);
    // The day opens at 03:00 in Vancouver.
    expect(read.dayWindow.start.toISOString()).toBe("2026-10-17T10:00:00.000Z");
    expect(read.dayWindow.end.toISOString()).toBe("2026-10-18T10:00:00.000Z");
    expect(read.todos.map((t) => t.title).sort()).toEqual([
      "Post the parcel",
      "Return the drill",
    ]);
    // Only the slots that hold a to-do, on any date; never another person's.
    expect(read.slots.map((x) => x.id).sort()).toEqual(
      [s.drillSat.id, s.drillFri.id].sort(),
    );
    expect(read.blocks.map((b) => b.id)).toEqual([s.errands.id]);
    // The changes of the slots' dates, so a slot's end reads as the day's.
    expect(read.blockChanges.map((c) => c.id)).toEqual([s.satChange.id]);
  });

  it("an account with no to-do slots reads no block changes", async () => {
    const db = memoryDb();
    await seed(db, ME, { todos: [todo()] });
    const read = await listTodos(storeOver(db, ME), TODAY);
    expect(read.slots).toEqual([]);
    expect(read.blockChanges).toEqual([]);
    expect(todosReadOutput.safeParse(read).success).toBe(true);
  });
});

describe("todo.create, update and setDone (C2)", () => {
  it("create stores the to-do as the fixture's writeTodo makes it", async () => {
    const db = memoryDb();
    const made = await db.transaction(() =>
      createTodo(
        storeOver(db, ME),
        { title: "Call the dentist", type: "call", onDate: TODAY },
        NOW,
      ),
    );
    expect(made).toMatchObject({
      title: "Call the dentist",
      type: "call",
      onDate: TODAY,
      icon: null,
      lengthMin: null,
      rrule: null,
      remindAt: null,
      remindOn: null,
      doneAt: null,
      archivedAt: null,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    });
    expect(db.rowsOf("todos", ME)).toEqual([made]);
  });

  it("update changes only the keys sent", async () => {
    const s = await errandsSetUp();
    const saved = await s.db.transaction(() =>
      updateTodo(
        s.store,
        { id: s.drill.id, patch: { notes: "The blue case", type: "home" } },
        NOW,
      ),
    );
    expect(saved).toEqual({
      ...s.drill,
      notes: "The blue case",
      type: "home",
      updatedAt: NOW.toISOString(),
    });
    const stored = s.db.rowsOf("todos", ME).find((t) => t.id === s.drill.id);
    expect(stored).toEqual(saved);
  });

  it("update refuses as the fixture does, writing nothing", async () => {
    const s = await errandsSetUp();
    const held = structuredClone(s.db.tables);

    expect(
      await refused(() =>
        s.db.transaction(() =>
          updateTodo(s.store, { id: s.drill.id, patch: { title: "  " } }, NOW),
        ),
      ),
    ).toMatchObject({ reason: "invalid" });
    expect(
      await refused(() =>
        s.db.transaction(() =>
          updateTodo(
            s.store,
            { id: s.drill.id, patch: { onDate: "2026-10-16" } },
            NOW,
          ),
        ),
      ),
    ).toEqual({ reason: "past-day", message: "A day before today." });
    expect(
      await refused(() =>
        s.db.transaction(() =>
          updateTodo(
            s.store,
            { id: s.drill.id, patch: { remindOn: "2026-10-01" } },
            NOW,
          ),
        ),
      ),
    ).toEqual({ reason: "past-day", message: "A day before today." });
    // Another person's to-do is no to-do of mine.
    expect(
      await refused(() =>
        s.db.transaction(() =>
          updateTodo(
            s.store,
            { id: s.theirTodo.id, patch: { notes: "x" } },
            NOW,
          ),
        ),
      ),
    ).toEqual({ reason: "unknown", message: "No to-do with that id." });
    expect(s.db.tables).toEqual(held);
  });

  it("update leaves a stored past day sent again alone", async () => {
    const db = memoryDb();
    const old = todo({ onDate: "2026-10-10" });
    await seed(db, ME, { todos: [old] });
    const saved = await db.transaction(() =>
      updateTodo(
        storeOver(db, ME),
        { id: old.id, patch: { onDate: "2026-10-10", notes: "Still" } },
        NOW,
      ),
    );
    expect(saved.onDate).toBe("2026-10-10");
    expect(saved.notes).toBe("Still");
  });

  it("setDone checks and unchecks a to-do", async () => {
    const s = await errandsSetUp();
    const at = "2026-10-17T15:30:00.000Z";
    const done = await s.db.transaction(() =>
      setTodoDone(s.store, { id: s.parcel.id, doneAt: at }, NOW),
    );
    expect(done.doneAt).toBe(at);
    const undone = await s.db.transaction(() =>
      setTodoDone(s.store, { id: s.parcel.id, doneAt: null }, NOW),
    );
    expect(undone.doneAt).toBeNull();
    expect(s.db.rowsOf("todos", ME).find((t) => t.id === s.parcel.id)).toEqual(
      undone,
    );
    expect(
      await refused(() =>
        s.db.transaction(() =>
          setTodoDone(s.store, { id: s.theirTodo.id, doneAt: at }, NOW),
        ),
      ),
    ).toEqual({ reason: "unknown", message: "No to-do with that id." });
  });

  it("setDone on a repeating to-do makes the next one and moves the rule to it", async () => {
    const db = memoryDb();
    const water = todo({
      title: "Water the plants",
      onDate: TODAY,
      rrule: DAILY,
      remindAt: "09:00",
      remindOn: TODAY,
    });
    await seed(db, ME, { todos: [water] });
    const done = await db.transaction(() =>
      setTodoDone(
        storeOver(db, ME),
        { id: water.id, doneAt: "2026-10-17T16:00:00.000Z" },
        NOW,
      ),
    );
    expect(done.rrule).toBeNull();
    expect(done.doneAt).toBe("2026-10-17T16:00:00.000Z");
    const next = db.rowsOf("todos", ME).find((t) => t.id !== water.id);
    expect(next).toMatchObject({
      title: "Water the plants",
      onDate: "2026-10-18",
      remindOn: "2026-10-18",
      rrule: DAILY,
      doneAt: null,
    });
  });
});

describe("todo.remove and restore (C3)", () => {
  it("remove takes the to-do, its slots and their events; restore puts all three back, ids included", async () => {
    const s = await errandsSetUp();
    const before = snapshot(s.db, ME);
    const theirs = snapshot(s.db, THEM);

    const { removed } = await s.db.transaction(() =>
      removeTodo(s.store, s.drill.id),
    );
    expect(removed.todo).toEqual(s.drill);
    expect(removed.slots.map((x) => x.id).sort()).toEqual(
      [s.drillSat.id, s.drillFri.id].sort(),
    );
    expect(removed.slotEvents.map((e) => e.id).sort()).toEqual(
      [s.started.id, s.paused.id].sort(),
    );
    // Gone together, and nothing else: the set item's slot and the parcel stay.
    expect(s.db.rowsOf("todos", ME).map((t) => t.id)).toEqual([s.parcel.id]);
    expect(s.db.rowsOf("slots", ME).map((x) => x.id)).toEqual([s.setSlot.id]);
    expect(s.db.rowsOf("slotEvents", ME)).toEqual([]);

    await s.db.transaction(() => restoreTodo(s.store, removed));
    expect(snapshot(s.db, ME)).toEqual(before);
    // Undo twice puts it back once.
    await s.db.transaction(() => restoreTodo(s.store, removed));
    expect(snapshot(s.db, ME)).toEqual(before);
    expect(snapshot(s.db, THEM)).toEqual(theirs);
  });

  it("the remove's Undo token puts back the same three tables", async () => {
    const s = await errandsSetUp();
    const before = snapshot(s.db, ME);
    const { changes } = await s.db.transaction(() =>
      removeTodo(s.store, s.drill.id),
    );
    const token = recordUndo(changes, ME, KEY);
    await s.db.transaction(() => undoWrite(s.db.storeFor(ME), token, ME, KEY));
    expect(snapshot(s.db, ME)).toEqual(before);
  });

  it("remove refuses another person's to-do, and restore one naming their block", async () => {
    const s = await errandsSetUp();
    const held = structuredClone(s.db.tables);
    expect(
      await refused(() =>
        s.db.transaction(() => removeTodo(s.store, s.theirTodo.id)),
      ),
    ).toEqual({ reason: "unknown", message: "No to-do with that id." });

    const { removed } = await s.db.transaction(() =>
      removeTodo(s.store, s.drill.id),
    );
    const afterRemove = structuredClone(s.db.tables);
    const forged = {
      ...removed,
      slots: removed.slots.map((x) => ({ ...x, blockId: s.theirBlock.id })),
    };
    expect(
      await refused(() => s.db.transaction(() => restoreTodo(s.store, forged))),
    ).toMatchObject({ reason: "unknown" });
    // A to-do id another account holds reaches no row of mine.
    const taken = { todo: { ...s.theirTodo }, slots: [], slotEvents: [] };
    expect(
      await refused(() => s.db.transaction(() => restoreTodo(s.store, taken))),
    ).toEqual({ reason: "unknown", message: "No to-do with that id." });
    expect(s.db.tables).toEqual(afterRemove);
    expect(held).not.toEqual(afterRemove);
  });
});
