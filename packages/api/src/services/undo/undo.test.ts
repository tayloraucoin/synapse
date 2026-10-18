import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { refusalReason } from "../../errors";
import { block, change, item, slot } from "../planner/planner-rows.fixture";
import { planSplitBlock } from "../planner/write-blocks";
import { planRemoveBlockItem } from "../planner/write-items";
import type { WriteJournal } from "../planner/write-journal";
import { journalOver } from "../planner/write-plan.fixture";
import { applyChanges } from "../planner/write-rows";
import { memoryDb, type MemoryDb } from "./memory-store.fixture";
import type { RowStore } from "./row-store";
import type { UndoTable } from "./tables";
import { signToken } from "./token";
import {
  NOTHING_TO_UNDO,
  recordUndo,
  undoChangesOf,
  undoWrite,
  type UndoChange,
} from "./undo";

/** USE-92 C4: a write's token puts back exactly what it changed, and only the caller's. */

const KEY = "test-undo-key-0123456789abcdef0123456789";
const ME = "00000000-0000-4000-a000-000000000001";
const THEM = "00000000-0000-4000-a000-000000000002";
const TABLES: UndoTable[] = ["blocks", "blockChanges", "blockItems", "slots"];

async function expectNothingToUndo(run: () => Promise<unknown>) {
  const thrown = await run().then(
    () => null,
    (error: unknown) => error,
  );
  expect(thrown).toBeInstanceOf(TRPCError);
  expect(refusalReason(thrown as TRPCError)).toBe("unknown");
  expect((thrown as TRPCError).message).toBe(NOTHING_TO_UNDO);
}

/** A store that counts every call, to show a refusal read no row. */
function countingStore(): RowStore & { calls: number } {
  const store = {
    calls: 0,
    insert: () => (store.calls++, Promise.resolve(true)),
    update: () => (store.calls++, Promise.resolve(true)),
    remove: () => (store.calls++, Promise.resolve(true)),
  };
  return store;
}

/** Seeds the database with the journal's rows, as `owner`'s. */
async function seed(db: MemoryDb, journal: WriteJournal, owner: string) {
  const store = db.storeFor(owner);
  for (const table of TABLES) {
    for (const row of journal.rows[table as "blocks"]) {
      await store.insert(table, structuredClone(row));
    }
  }
}

function snapshot(db: MemoryDb, userId: string) {
  return Object.fromEntries(TABLES.map((t) => [t, db.rowsOf(t, userId)]));
}

/** The write as the router runs it: the plan's changes applied, its token signed. */
async function write(db: MemoryDb, journal: WriteJournal, userId: string) {
  const changes = journal.changes();
  await db.transaction(() => applyChanges(db.storeFor(userId), changes));
  return recordUndo(undoChangesOf(changes), userId, KEY);
}

function undo(db: MemoryDb, token: string, userId: string) {
  return db.transaction(() =>
    undoWrite(db.storeFor(userId), token, userId, KEY),
  );
}

function splitSetUp() {
  const morning = block();
  const stretch = item({ blockId: morning.id });
  const wedSlot = slot({
    blockId: morning.id,
    onDate: "2026-10-21",
    blockItemId: stretch.id,
  });
  const tueMove = change({
    blockId: morning.id,
    onDate: "2026-10-20",
    startsAt: "07:30",
    endsAt: "08:30",
  });
  const journal = journalOver({
    blocks: [morning],
    blockItems: [stretch],
    slots: [wedSlot],
    blockChanges: [tueMove],
  });
  return { journal, morning, stretch };
}

describe("planner.undo (C-USE-92-4)", () => {
  it("restores every row a split changed, removes every row it added, and brings back the one it deleted", async () => {
    const db = memoryDb();
    const { journal, morning } = splitSetUp();
    await seed(db, journal, ME);
    const before = snapshot(db, ME);

    planSplitBlock(journal, {
      id: morning.id,
      fromDate: "2026-10-20",
      patch: { startsAt: "06:30", endsAt: "07:30" },
    });
    const token = await write(db, journal, ME);
    const after = snapshot(db, ME);
    expect(after.blocks).toHaveLength(2);
    expect(after.blockItems).toHaveLength(2);
    expect(after.blockChanges).toHaveLength(0);

    await undo(db, token, ME);
    expect(snapshot(db, ME)).toEqual(before);
  });

  it("puts a removed item back with its slots", async () => {
    const db = memoryDb();
    const { journal, stretch } = splitSetUp();
    await seed(db, journal, ME);
    const before = snapshot(db, ME);

    planRemoveBlockItem(journal, { id: stretch.id });
    const token = await write(db, journal, ME);
    expect(db.rowsOf("blockItems", ME)).toEqual([]);
    expect(db.rowsOf("slots", ME)).toEqual([]);

    await undo(db, token, ME);
    expect(snapshot(db, ME)).toEqual(before);
  });

  it("refuses a token whose signature fails before any row is read", async () => {
    const store = countingStore();
    const token = recordUndo([], ME, KEY);
    const [body, mac] = token.split(".") as [string, string];
    const forged = signToken(
      { v: 1, userId: ME, changes: [] },
      "another-key-0123456789abcdef0123456",
    );
    for (const bad of [
      `${body}.${mac.slice(1)}x`,
      `${body}x.${mac}`,
      forged,
      "not a token",
      "",
    ]) {
      await expectNothingToUndo(() => undoWrite(store, bad, ME, KEY));
    }
    expect(store.calls).toBe(0);
  });

  it("refuses another account's token, and a table outside the planner, work and to-dos", async () => {
    const store = countingStore();
    const theirs = recordUndo(
      [{ table: "blocks", op: "insert", id: block().id }],
      THEM,
      KEY,
    );
    await expectNothingToUndo(() => undoWrite(store, theirs, ME, KEY));
    const users = signToken(
      { v: 1, userId: ME, changes: [{ table: "users", op: "insert", id: ME }] },
      KEY,
    );
    await expectNothingToUndo(() => undoWrite(store, users, ME, KEY));
    expect(store.calls).toBe(0);
  });

  it("a token naming a row the caller does not own changes nothing and is refused", async () => {
    const db = memoryDb();
    const mine = block({ name: "Mine" });
    const theirs = block({ name: "Theirs" });
    await db.storeFor(ME).insert("blocks", mine);
    await db.storeFor(THEM).insert("blocks", theirs);
    const held = structuredClone(db.tables);

    // Genuine and the caller's, but its second step reaches another user's row.
    const changes: UndoChange[] = [
      { table: "blocks", op: "update", before: { ...theirs, name: "Taken" } },
      { table: "blocks", op: "update", before: { ...mine, name: "Restored" } },
    ];
    await expectNothingToUndo(() => undo(db, recordUndo(changes, ME, KEY), ME));
    // The step that did reach (undone last first) is rolled back with it.
    expect(db.tables).toEqual(held);

    const remove: UndoChange[] = [
      { table: "blocks", op: "insert", id: theirs.id },
    ];
    await expectNothingToUndo(() => undo(db, recordUndo(remove, ME, KEY), ME));
    const reinsert: UndoChange[] = [
      { table: "blocks", op: "delete", before: theirs },
    ];
    await expectNothingToUndo(() =>
      undo(db, recordUndo(reinsert, ME, KEY), ME),
    );
    expect(db.tables).toEqual(held);
  });
});
