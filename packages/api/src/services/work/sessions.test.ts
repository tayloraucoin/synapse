import { describe, expect, it } from "vitest";
import {
  placeOnDaysInput,
  slotRecord,
  type SlotRecord,
  type WorkItemRecord,
} from "@syn/validators";
import {
  block,
  slot,
  WEEKDAYS,
  workItem,
} from "../planner/planner-rows.fixture";
import { expectRefusal, NOW_ISO } from "../planner/write-plan.fixture";
import { applyChanges } from "../planner/write-rows";
import { memoryDb, type MemoryDb } from "../undo/memory-store.fixture";
import type { RowStore } from "../undo/row-store";
import { recordUndo, undoChangesOf, undoWrite } from "../undo/undo";
import {
  ALREADY_PLACED,
  planMoveWork,
  planPlaceOnDays,
  planPlaceWork,
  planSetWorkTier,
  planSpreadWork,
  planUnplaceWork,
} from "./sessions";
import type { WorkJournal } from "./work-rows";
import { workJournal } from "./work.fixture";

/**
 * USE-99 C1 to C4: a work item's sessions over rows in memory, each as the
 * fixture server's (`lib/fixtures/work/index.ts`), and through a store that
 * honours `slots_work_item_id_on_date_key` as Postgres does: an insert that
 * clashes reaches no row, an update that clashes throws 23505.
 */

const MON = "2026-10-19";
const TUE = "2026-10-20";
const WED = "2026-10-21";
const THU = "2026-10-22";
const EARLIER = "2026-10-12T20:00:00.000Z";
const KEY = "test-undo-key-0123456789abcdef0123456789";
const ME = "00000000-0000-4000-a000-000000000001";

const workBlock = () =>
  block({
    kind: "work",
    name: "Work",
    startsAt: "09:30",
    endsAt: "12:00",
    rrule: WEEKDAYS,
  });

/** `memoryDb`'s store, with the slots' one-item-one-day key. */
function keyedStore(db: MemoryDb): RowStore {
  const store = db.storeFor(ME);
  const clashes = (row: { id: string }) => {
    const next = row as SlotRecord;
    return (
      next.workItemId != null &&
      (db.rowsOf("slots", ME) as SlotRecord[]).some(
        (s) =>
          s.id !== next.id &&
          s.workItemId === next.workItemId &&
          s.onDate === next.onDate,
      )
    );
  };
  return {
    insert: (table, row) =>
      table === "slots" && clashes(row)
        ? Promise.resolve(false)
        : store.insert(table, row),
    update: (table, row) => {
      if (table === "slots" && clashes(row)) {
        const error = Object.assign(new Error("duplicate key"), {
          code: "23505",
          constraint_name: "slots_work_item_id_on_date_key",
        });
        return Promise.reject(error);
      }
      return store.update(table, row);
    },
    remove: (table, id) => store.remove(table, id),
  };
}

async function seed(
  db: MemoryDb,
  rows: { workItems?: WorkItemRecord[]; slots?: SlotRecord[] },
) {
  const store = db.storeFor(ME);
  for (const item of rows.workItems ?? [])
    await store.insert("workItems", structuredClone(item));
  for (const s of rows.slots ?? [])
    await store.insert("slots", structuredClone(s));
}

function snapshot(db: MemoryDb) {
  return {
    workItems: db.rowsOf("workItems", ME),
    slots: db.rowsOf("slots", ME),
  };
}

/** One write as `runWorkWrite` runs it: plan, apply, sign, in one transaction. */
async function run(
  db: MemoryDb,
  blocks: ReturnType<typeof workBlock>[],
  plan: (journal: WorkJournal) => unknown,
  rows: ReturnType<typeof snapshot> = snapshot(db),
) {
  const journal = workJournal({
    blocks,
    workItems: structuredClone(rows.workItems) as never,
    slots: structuredClone(rows.slots) as never,
  });
  plan(journal);
  const changes = journal.changes();
  await db.transaction(() => applyChanges(keyedStore(db), changes));
  return recordUndo(undoChangesOf(changes), ME, KEY);
}

const undo = (db: MemoryDb, token: string) =>
  db.transaction(() => undoWrite(db.storeFor(ME), token, ME, KEY));

describe("placeWork, moveWork and unplaceWork (C-USE-99-1)", () => {
  it("places, moves and unplaces the slot the fixture writes", () => {
    const work = workBlock();
    const task = workItem();
    const journal = workJournal({ blocks: [work], workItems: [task] });

    const { id } = planPlaceWork(journal, {
      workItemId: task.id,
      dateKey: MON,
      blockId: work.id,
      tier: "primary",
      sortOrder: 2,
    });
    const placed = journal.rows.slots.find((s) => s.id === id)!;
    expect(slotRecord.parse(placed)).toEqual(placed);
    expect(placed).toMatchObject({
      blockId: work.id,
      onDate: MON,
      sortOrder: 2,
      workItemId: task.id,
      tier: "primary",
      skipped: false,
      blockItemId: null,
      todoId: null,
      lengthMin: null,
      doneAt: null,
      createdAt: NOW_ISO,
    });

    planMoveWork(journal, { slotId: id, dateKey: TUE, tier: "secondary" });
    expect(journal.rows.slots.find((s) => s.id === id)).toMatchObject({
      onDate: TUE,
      tier: "secondary",
      sortOrder: 2,
      blockId: work.id,
    });

    planUnplaceWork(journal, { slotId: id });
    expect(journal.rows.slots).toEqual([]);
    expect(journal.rows.workItems).toEqual([task]);
  });

  it("refuses a second place, or a move, onto a day that holds the item", () => {
    const work = workBlock();
    const task = workItem();
    const mon = slot({ blockId: work.id, onDate: MON, workItemId: task.id });
    const tue = slot({ blockId: work.id, onDate: TUE, workItemId: task.id });
    const journal = () =>
      workJournal({ blocks: [work], workItems: [task], slots: [mon, tue] });

    expectRefusal(
      () =>
        planPlaceWork(journal(), {
          workItemId: task.id,
          dateKey: MON,
          blockId: work.id,
          tier: "primary",
          sortOrder: 0,
        }),
      "duplicate",
      ALREADY_PLACED,
    );
    expectRefusal(
      () => planMoveWork(journal(), { slotId: tue.id, dateKey: MON }),
      "duplicate",
      ALREADY_PLACED,
    );
    // A move on its own day is no clash with itself.
    const own = journal();
    planMoveWork(own, { slotId: mon.id, tier: "urgent" });
    expect(own.rows.slots.find((s) => s.id === mon.id)?.tier).toBe("urgent");
  });

  it("a race past the plan is refused by the key, never merged", async () => {
    const work = workBlock();
    const task = workItem();
    const db = memoryDb();
    await seed(db, { workItems: [task] });
    const stale = snapshot(db);
    // Another tab places it on Monday after this write read its rows.
    await run(db, [work], (j) =>
      planPlaceWork(j, {
        workItemId: task.id,
        dateKey: MON,
        blockId: work.id,
        tier: "primary",
        sortOrder: 0,
      }),
    );
    const before = snapshot(db);
    await expect(
      run(
        db,
        [work],
        (j) =>
          planPlaceWork(j, {
            workItemId: task.id,
            dateKey: MON,
            blockId: work.id,
            tier: "secondary",
            sortOrder: 1,
          }),
        stale,
      ),
    ).rejects.toThrow();
    expect(snapshot(db)).toEqual(before);
  });

  it("refuses in the fixture's words", () => {
    const work = workBlock();
    const task = workItem();
    const gone = workItem({ archivedAt: EARLIER });
    const plain = slot({ blockId: work.id, onDate: MON, todoId: task.id });
    const journal = () =>
      workJournal({ blocks: [work], workItems: [task, gone], slots: [plain] });
    const place = (over: Record<string, unknown>) => ({
      workItemId: task.id,
      dateKey: MON,
      blockId: work.id,
      tier: "primary" as const,
      sortOrder: 0,
      ...over,
    });

    expectRefusal(
      () => planPlaceWork(journal(), place({ workItemId: gone.id })),
      "unknown",
      "No work item with that id.",
    );
    expectRefusal(
      () => planPlaceWork(journal(), place({ blockId: crypto.randomUUID() })),
      "unknown",
      "No block with that id.",
    );
    expectRefusal(
      () => planMoveWork(journal(), { slotId: crypto.randomUUID() }),
      "unknown",
      "No slot with that id.",
    );
    expectRefusal(
      () => planUnplaceWork(journal(), { slotId: plain.id }),
      "invalid",
      "Only a work item takes a tier.",
    );
  });
});

describe("spreadWork (C-USE-99-2)", () => {
  const four = (blockId: string) =>
    [MON, TUE, WED, THU].map((dateKey) => ({
      dateKey,
      blockId,
      lengthMin: 45,
    }));

  it("writes four sessions and the item's length together", async () => {
    const work = workBlock();
    const task = workItem({ lengthMinMin: 240, lengthMaxMin: 300 });
    const other = workItem();
    const held = slot({
      blockId: work.id,
      onDate: TUE,
      workItemId: other.id,
      sortOrder: 4,
    });
    const db = memoryDb();
    await seed(db, { workItems: [task, other], slots: [held] });

    await run(db, [work], (j) =>
      planSpreadWork(j, {
        workItemId: task.id,
        tier: "primary",
        sessions: four(work.id),
        lengthMaxMin: 180,
      }),
    );

    const sessions = (db.rowsOf("slots", ME) as SlotRecord[])
      .filter((s) => s.workItemId === task.id)
      .sort((a, b) => a.onDate.localeCompare(b.onDate));
    expect(sessions.map((s) => s.onDate)).toEqual([MON, TUE, WED, THU]);
    for (const s of sessions) {
      expect(s).toMatchObject({ tier: "primary", lengthMin: 45 });
    }
    // After the block's own slots on the date.
    expect(sessions.map((s) => s.sortOrder)).toEqual([0, 5, 0, 0]);
    expect(
      db.rowsOf("workItems", ME).find((w) => w.id === task.id),
    ).toMatchObject({ lengthMaxMin: 180, lengthMinMin: 180 });
  });

  it("a refusal on the third day writes none of them", async () => {
    const work = workBlock();
    const task = workItem({ lengthMaxMin: 300 });
    const wed = slot({ blockId: work.id, onDate: WED, workItemId: task.id });
    const db = memoryDb();
    await seed(db, { workItems: [task], slots: [wed] });
    const before = snapshot(db);
    const spread = (j: WorkJournal) =>
      planSpreadWork(j, {
        workItemId: task.id,
        tier: "primary",
        sessions: four(work.id),
        lengthMaxMin: 180,
      });

    expectRefusal(
      () =>
        spread(
          workJournal({ blocks: [work], workItems: [task], slots: [wed] }),
        ),
      "duplicate",
      ALREADY_PLACED,
    );
    await expect(run(db, [work], spread)).rejects.toThrow(ALREADY_PLACED);
    expect(snapshot(db)).toEqual(before);
  });

  it("a race on the third day rolls back every day and the length", async () => {
    const work = workBlock();
    const task = workItem({ lengthMaxMin: 300 });
    const db = memoryDb();
    await seed(db, { workItems: [task] });
    const stale = snapshot(db);
    await seed(db, {
      slots: [slot({ blockId: work.id, onDate: WED, workItemId: task.id })],
    });
    const before = snapshot(db);

    await expect(
      run(
        db,
        [work],
        (j) =>
          planSpreadWork(j, {
            workItemId: task.id,
            tier: "primary",
            sessions: four(work.id),
            lengthMaxMin: 180,
          }),
        stale,
      ),
    ).rejects.toThrow();
    expect(snapshot(db)).toEqual(before);
  });

  it("refuses a day picked twice and a session with no length", () => {
    const work = workBlock();
    const task = workItem();
    const journal = () => workJournal({ blocks: [work], workItems: [task] });
    expectRefusal(
      () =>
        planSpreadWork(journal(), {
          workItemId: task.id,
          tier: "primary",
          sessions: [
            { dateKey: MON, blockId: work.id, lengthMin: 30 },
            { dateKey: MON, blockId: work.id, lengthMin: 30 },
          ],
        }),
      "duplicate",
      ALREADY_PLACED,
    );
    expectRefusal(
      () =>
        planSpreadWork(journal(), {
          workItemId: task.id,
          tier: "primary",
          sessions: [{ dateKey: MON, blockId: work.id, lengthMin: 0 }],
        }),
      "invalid",
      "A session needs a length.",
    );
  });
});

describe("setWorkTier (C-USE-99-3)", () => {
  function tierSetUp() {
    const work = workBlock();
    const task = workItem();
    const mon = slot({
      blockId: work.id,
      onDate: MON,
      workItemId: task.id,
      tier: "secondary",
    });
    const tue = slot({
      blockId: work.id,
      onDate: TUE,
      workItemId: task.id,
      tier: "secondary",
    });
    const done = slot({
      blockId: work.id,
      onDate: "2026-10-12",
      workItemId: task.id,
      tier: "secondary",
      doneAt: EARLIER,
    });
    return { work, task, mon, tue, done };
  }

  it("All changes every open session's tier and no done session's, in one write", async () => {
    const { work, task, mon, tue, done } = tierSetUp();
    const db = memoryDb();
    await seed(db, { workItems: [task], slots: [mon, tue, done] });
    const before = snapshot(db);

    const token = await run(db, [work], (j) =>
      planSetWorkTier(j, { slotId: tue.id, tier: "urgent", sessions: "all" }),
    );
    const tiers = new Map(
      (db.rowsOf("slots", ME) as SlotRecord[]).map((s) => [s.id, s.tier]),
    );
    expect(tiers.get(mon.id)).toBe("urgent");
    expect(tiers.get(tue.id)).toBe("urgent");
    expect(tiers.get(done.id)).toBe("secondary");

    // One token takes every session back.
    await undo(db, token);
    expect(snapshot(db)).toEqual(before);
  });

  it("This changes the one session", () => {
    const { work, task, mon, tue, done } = tierSetUp();
    const journal = workJournal({
      blocks: [work],
      workItems: [task],
      slots: [mon, tue, done],
    });
    planSetWorkTier(journal, {
      slotId: mon.id,
      tier: "primary",
      sessions: "this",
    });
    expect(journal.changes().map((c) => c.id)).toEqual([mon.id]);
    expect(journal.rows.slots.find((s) => s.id === mon.id)?.tier).toBe(
      "primary",
    );
  });
});

describe("placeOnDays and its Undo (C-USE-99-4)", () => {
  it("places on Tue and Wed from the place sheet, and Undo leaves both days as they were", async () => {
    const work = workBlock();
    const task = workItem();
    const other = workItem();
    const tueHeld = slot({
      blockId: work.id,
      onDate: TUE,
      workItemId: other.id,
      sortOrder: 1,
    });
    const db = memoryDb();
    await seed(db, { workItems: [task, other], slots: [tueHeld] });
    const before = snapshot(db);

    const token = await run(db, [work], (j) =>
      planPlaceOnDays(
        j,
        placeOnDaysInput.parse({
          workItemId: task.id,
          tier: "primary",
          days: [
            { dateKey: TUE, blockId: work.id },
            { dateKey: WED, blockId: work.id },
          ],
        }),
      ),
    );
    const placed = (db.rowsOf("slots", ME) as SlotRecord[]).filter(
      (s) => s.workItemId === task.id,
    );
    expect(placed.map((s) => [s.onDate, s.sortOrder, s.tier]).sort()).toEqual([
      [TUE, 2, "primary"],
      [WED, 0, "primary"],
    ]);

    await undo(db, token);
    expect(snapshot(db)).toEqual(before);
  });

  it("a day that holds the item refuses every day", () => {
    const work = workBlock();
    const task = workItem();
    const wed = slot({ blockId: work.id, onDate: WED, workItemId: task.id });
    const journal = workJournal({
      blocks: [work],
      workItems: [task],
      slots: [wed],
    });
    expectRefusal(
      () =>
        planPlaceOnDays(journal, {
          workItemId: task.id,
          tier: "primary",
          days: [
            { dateKey: TUE, blockId: work.id },
            { dateKey: WED, blockId: work.id },
          ],
        }),
      "duplicate",
      ALREADY_PLACED,
    );
  });
});
