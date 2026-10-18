import { describe, expect, it } from "vitest";
import {
  placeSlotInput,
  removeSlotInput,
  slotUpdateInput,
} from "@syn/validators";
import { memoryDb } from "../undo/memory-store.fixture";
import { recordUndo, undoChangesOf, undoWrite } from "../undo/undo";
import { block, item, slot } from "./planner-rows.fixture";
import type { WriteJournal } from "./write-journal";
import { expectRefusal, journalOver, NOW_ISO } from "./write-plan.fixture";
import { applyChanges } from "./write-rows";
import {
  ALREADY_PLACED,
  planPlaceSlot,
  planRemoveSlot,
  planWriteSlot,
} from "./write-slots";

/**
 * USE-94 C5: placeSlot, removeSlot and writeSlot write and refuse as the
 * fixture server does (`lib/fixtures/planner/index.ts`, `server.ts`), and
 * each hands back a token `services/undo` takes back.
 */

const KEY = "test-undo-key-0123456789abcdef0123456789";
const ME = "00000000-0000-4000-a000-000000000001";
const DATE = "2026-10-17";
const WORK = "00000000-0000-4000-a000-0000000000c1";
const TODO = "00000000-0000-4000-a000-0000000000c2";

/** The write as the router runs it, through a database in memory. */
async function writeAndUndo(journal: WriteJournal) {
  const db = memoryDb();
  const store = db.storeFor(ME);
  for (const table of ["blocks", "blockItems", "slots"] as const) {
    for (const row of journal.rows[table]) {
      await store.insert(table, structuredClone(row));
    }
  }
  const before = db.rowsOf("slots", ME);
  return {
    db,
    before,
    run: async (plan: () => unknown) => {
      plan();
      const changes = journal.changes();
      await db.transaction(() => applyChanges(store, changes));
      return recordUndo(undoChangesOf(changes), ME, KEY);
    },
    undo: (token: string) =>
      db.transaction(() => undoWrite(store, token, ME, KEY)),
  };
}

describe("placeSlot (C-USE-94-5)", () => {
  it("places a set item's slot on its first touch, as the fixture stores it", () => {
    const morning = block();
    const stretch = item({ blockId: morning.id });
    const journal = journalOver({ blocks: [morning], blockItems: [stretch] });
    const out = planPlaceSlot(
      journal,
      placeSlotInput.parse({
        blockId: morning.id,
        onDate: DATE,
        sortOrder: 2,
        blockItemId: stretch.id,
        notes: "",
      }),
    );
    expect(journal.rows.slots).toEqual([
      {
        id: out.id,
        createdAt: NOW_ISO,
        updatedAt: NOW_ISO,
        blockId: morning.id,
        onDate: DATE,
        skipped: false,
        sortOrder: 2,
        blockItemId: stretch.id,
        todoId: null,
        workItemId: null,
        tier: null,
        lengthMin: null,
        tookMin: null,
        doneAt: null,
        notes: null,
        atTime: null,
        icon: null,
      },
    ]);
    expect(out.slot).toEqual(journal.rows.slots[0]);
  });

  it("refuses a second slot for the same item, to-do or work item on a date", () => {
    const morning = block();
    const stretch = item({ blockId: morning.id });
    const elsewhere = block();
    const journal = journalOver({
      blocks: [morning, elsewhere],
      blockItems: [stretch],
      slots: [
        slot({ blockId: morning.id, onDate: DATE, blockItemId: stretch.id }),
        slot({ blockId: elsewhere.id, onDate: DATE, workItemId: WORK }),
        slot({ blockId: elsewhere.id, onDate: DATE, todoId: TODO }),
      ],
    });
    for (const target of [
      { blockItemId: stretch.id },
      { workItemId: WORK },
      { todoId: TODO },
    ]) {
      expectRefusal(
        () =>
          planPlaceSlot(
            journal,
            placeSlotInput.parse({
              blockId: morning.id,
              onDate: DATE,
              sortOrder: 0,
              ...target,
            }),
          ),
        "duplicate",
        ALREADY_PLACED,
      );
    }
    // Another date is its own.
    expect(
      planPlaceSlot(
        journal,
        placeSlotInput.parse({
          blockId: morning.id,
          onDate: "2026-10-18",
          sortOrder: 0,
          workItemId: WORK,
        }),
      ).id,
    ).toBeDefined();
  });

  it("refuses a block not the caller's", () => {
    const journal = journalOver({ blocks: [] });
    expectRefusal(
      () =>
        planPlaceSlot(
          journal,
          placeSlotInput.parse({
            blockId: block().id,
            onDate: DATE,
            sortOrder: 0,
            todoId: TODO,
          }),
        ),
      "unknown",
      "No block with that id.",
    );
  });

  it("hands back a token that takes the slot away again", async () => {
    const morning = block();
    const journal = journalOver({ blocks: [morning] });
    const db = await writeAndUndo(journal);
    const token = await db.run(() =>
      planPlaceSlot(
        journal,
        placeSlotInput.parse({
          blockId: morning.id,
          onDate: DATE,
          sortOrder: 0,
          todoId: TODO,
        }),
      ),
    );
    expect(db.db.rowsOf("slots", ME)).toHaveLength(1);
    await db.undo(token);
    expect(db.db.rowsOf("slots", ME)).toEqual(db.before);
  });
});

describe("removeSlot (C-USE-94-5)", () => {
  it("removes the slot, refuses one not the caller's, and Undo puts it back", async () => {
    const morning = block();
    const held = slot({ blockId: morning.id, onDate: DATE, todoId: TODO });
    const journal = journalOver({ blocks: [morning], slots: [held] });
    expectRefusal(
      () => planRemoveSlot(journal, removeSlotInput.parse({ id: block().id })),
      "unknown",
      "No slot with that id.",
    );
    const db = await writeAndUndo(journal);
    const token = await db.run(() =>
      planRemoveSlot(journal, removeSlotInput.parse({ id: held.id })),
    );
    expect(db.db.rowsOf("slots", ME)).toEqual([]);
    await db.undo(token);
    expect(db.db.rowsOf("slots", ME)).toEqual(db.before);
  });
});

describe("writeSlot (C-USE-94-5)", () => {
  it("changes only the keys sent, null clearing, and drops sessions", () => {
    const morning = block();
    const held = slot({
      blockId: morning.id,
      onDate: DATE,
      workItemId: WORK,
      tier: "primary",
      tookMin: 20,
      doneAt: "2026-10-17T14:00:00.000Z",
    });
    const journal = journalOver({ blocks: [morning], slots: [held] });
    const out = planWriteSlot(
      journal,
      slotUpdateInput.parse({
        id: held.id,
        doneAt: null,
        sortOrder: 4,
        tier: "primary",
        sessions: "all",
      }),
    );
    expect(out.slot).toEqual({
      ...held,
      doneAt: null,
      sortOrder: 4,
      updatedAt: NOW_ISO,
    });
    expect(journal.rows.slots).toEqual([out.slot]);
    expect(out.slot).not.toHaveProperty("sessions");
  });

  it("refuses an unknown slot, a block not the caller's and a date the work item already holds", () => {
    const morning = block();
    const held = slot({ blockId: morning.id, onDate: DATE, workItemId: WORK });
    const tomorrow = slot({
      blockId: morning.id,
      onDate: "2026-10-18",
      workItemId: WORK,
    });
    const journal = journalOver({ blocks: [morning], slots: [held, tomorrow] });
    expectRefusal(
      () => planWriteSlot(journal, slotUpdateInput.parse({ id: block().id })),
      "unknown",
      "No slot with that id.",
    );
    expectRefusal(
      () =>
        planWriteSlot(
          journal,
          slotUpdateInput.parse({ id: held.id, blockId: block().id }),
        ),
      "unknown",
      "No block with that id.",
    );
    expectRefusal(
      () =>
        planWriteSlot(
          journal,
          slotUpdateInput.parse({ id: held.id, onDate: "2026-10-18" }),
        ),
      "duplicate",
      ALREADY_PLACED,
    );
  });

  it("marks a slot done and Undo restores it as it stood", async () => {
    const morning = block();
    const held = slot({ blockId: morning.id, onDate: DATE, todoId: TODO });
    const journal = journalOver({ blocks: [morning], slots: [held] });
    const db = await writeAndUndo(journal);
    const token = await db.run(() =>
      planWriteSlot(
        journal,
        slotUpdateInput.parse({
          id: held.id,
          doneAt: "2026-10-17T14:30:00.000Z",
          tookMin: 25,
        }),
      ),
    );
    expect(db.db.rowsOf("slots", ME)[0]).toMatchObject({
      doneAt: "2026-10-17T14:30:00.000Z",
      tookMin: 25,
    });
    await db.undo(token);
    expect(db.db.rowsOf("slots", ME)).toEqual(db.before);
  });
});
