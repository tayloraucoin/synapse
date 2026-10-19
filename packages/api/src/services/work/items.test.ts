import { describe, expect, it } from "vitest";
import {
  createTaskInput,
  editWorkItemInput,
  poolReadOutput,
  slotRecord,
  workItemRecord,
} from "@syn/validators";
import {
  block,
  slot,
  STAMP,
  WEEKDAYS,
  workItem,
} from "../planner/planner-rows.fixture";
import { expectRefusal, NOW_ISO } from "../planner/write-plan.fixture";
import { applyChanges } from "../planner/write-rows";
import { memoryDb } from "../undo/memory-store.fixture";
import { recordUndo, undoChangesOf, undoWrite } from "../undo/undo";
import {
  NO_WORK_BLOCK,
  ONE_SESSION_A_DAY,
  planBackToPool,
  planCreateTask,
  planEditWorkItem,
  planMarkTaskDone,
  planRemoveFromSynapse,
  planReopenTask,
} from "./items";
import { assemblePool } from "./read-pool";
import { workJournal } from "./work.fixture";

/**
 * USE-98 C1 to C5: the pool read and the item writes over rows in memory,
 * each as the fixture server's (`lib/fixtures/work/`).
 */

const MON = "2026-10-19";
const TUE = "2026-10-20";
const SAT = "2026-10-17";
const EARLIER = "2026-10-12T20:00:00.000Z";
const KEY = "test-undo-key-0123456789abcdef0123456789";
const ME = "00000000-0000-4000-a000-000000000001";

function client(over: Record<string, unknown> = {}) {
  return {
    id: crypto.randomUUID(),
    createdAt: STAMP,
    updatedAt: STAMP,
    name: "Northwind",
    colorKey: "leaf",
    logoPath: null,
    sortOrder: 0,
    archivedAt: null,
    ...over,
  } as never;
}

const workBlock = () =>
  block({
    kind: "work",
    name: "Work",
    startsAt: "09:30",
    endsAt: "12:00",
    rrule: WEEKDAYS,
  });

describe("the pool read (C-USE-98-1)", () => {
  it("returns the open work, its sessions, the clients in order and the switch, in readPool's shape", () => {
    const work = workBlock();
    const open = workItem({ title: "Open" });
    const done = workItem({
      title: "Done",
      doneAt: EARLIER,
      doneSource: "synapse",
    });
    const gone = workItem({ title: "Gone", archivedAt: EARLIER });
    const second = client({ name: "Second", sortOrder: 1 });
    const first = client({ name: "First", sortOrder: 0 });
    const archived = client({ name: "Old", sortOrder: 2, archivedAt: EARLIER });
    const session = slot({
      blockId: work.id,
      onDate: MON,
      workItemId: open.id,
      tier: "primary",
    });
    const skipped = slot({
      blockId: work.id,
      onDate: TUE,
      workItemId: open.id,
      skipped: true,
    });
    const doneSession = slot({
      blockId: work.id,
      onDate: MON,
      workItemId: done.id,
    });

    const pool = assemblePool({
      clientsEnabled: true,
      clients: [second, first, archived],
      workItems: [open, done, gone],
      slots: [session, skipped, doneSession],
    });

    expect(poolReadOutput.parse(pool)).toEqual(pool);
    expect(pool).toEqual({
      clientsEnabled: true,
      clients: [first, second],
      workItems: [open],
      slots: [session],
    });
  });
});

describe("createTask (C-USE-98-2)", () => {
  it("writes the item and a first session a picked day, after the block's last slot", () => {
    const work = workBlock();
    const other = workItem();
    const held = slot({
      blockId: work.id,
      onDate: MON,
      workItemId: other.id,
      sortOrder: 3,
    });
    const journal = workJournal({
      blocks: [work],
      workItems: [other],
      slots: [held],
    });
    const out = planCreateTask(
      journal,
      createTaskInput.parse({
        item: { title: "Draft the scope", size: "small" },
        tier: "primary",
        days: [{ dateKey: MON, blockId: work.id }],
      }),
    );
    const made = journal.rows.workItems.find((w) => w.id === out.id)!;
    expect(workItemRecord.parse(made)).toEqual(made);
    expect(made).toMatchObject({
      title: "Draft the scope",
      size: "small",
      doneAt: null,
      archivedAt: null,
      linearIssueId: null,
      createdAt: NOW_ISO,
    });
    const sessions = journal.rows.slots.filter((s) => s.workItemId === out.id);
    expect(sessions).toHaveLength(1);
    expect(slotRecord.parse(sessions[0])).toMatchObject({
      blockId: work.id,
      onDate: MON,
      tier: "primary",
      sortOrder: 4,
      doneAt: null,
    });
    // One write: the item, then its session, so one Undo takes both.
    expect(journal.changes().map((c) => [c.table, c.before])).toEqual([
      ["workItems", null],
      ["slots", null],
    ]);
  });

  it("leaves the task in the pool with no days, and two days are two sessions of one item", () => {
    const work = workBlock();
    const pooled = workJournal({ blocks: [work] });
    planCreateTask(
      pooled,
      createTaskInput.parse({
        item: { title: "Later" },
        tier: "primary",
        days: [],
      }),
    );
    expect(pooled.rows.workItems).toHaveLength(1);
    expect(pooled.rows.slots).toHaveLength(0);

    const twice = workJournal({ blocks: [work] });
    const { id } = planCreateTask(
      twice,
      createTaskInput.parse({
        item: { title: "Both days" },
        tier: "secondary",
        days: [
          { dateKey: MON, blockId: work.id },
          { dateKey: TUE, blockId: work.id },
        ],
      }),
    );
    expect(twice.rows.workItems).toHaveLength(1);
    expect(twice.rows.slots.map((s) => [s.workItemId, s.onDate])).toEqual([
      [id, MON],
      [id, TUE],
    ]);
  });

  it("refuses in the fixture's words", () => {
    const work = workBlock();
    const morning = block();
    const input = (
      days: { dateKey: string; blockId: string }[],
      item: object = { title: "Task" },
    ) => createTaskInput.parse({ item, tier: "primary", days });
    expectRefusal(
      () =>
        planCreateTask(
          workJournal({ blocks: [work] }),
          input([
            { dateKey: MON, blockId: work.id },
            { dateKey: MON, blockId: work.id },
          ]),
        ),
      "invalid",
      ONE_SESSION_A_DAY,
    );
    expectRefusal(
      () =>
        planCreateTask(
          workJournal({ blocks: [work] }),
          input([{ dateKey: SAT, blockId: work.id }]),
        ),
      "not-on-date",
      NO_WORK_BLOCK,
    );
    expectRefusal(
      () =>
        planCreateTask(
          workJournal({ blocks: [morning] }),
          input([{ dateKey: MON, blockId: morning.id }]),
        ),
      "not-on-date",
      NO_WORK_BLOCK,
    );
    expectRefusal(
      () =>
        planCreateTask(
          workJournal(),
          input([{ dateKey: MON, blockId: crypto.randomUUID() }]),
        ),
      "unknown",
      "No block with that id.",
    );
    expectRefusal(
      () =>
        planCreateTask(
          workJournal(),
          input([], { title: "Task", clientId: crypto.randomUUID() }),
        ),
      "unknown",
      "No client with that id.",
    );
    expectRefusal(
      () =>
        planCreateTask(
          workJournal(),
          input([], { title: "Task", lengthMinMin: 60, lengthMaxMin: 30 }),
        ),
      "invalid",
      "The longest is at least the shortest.",
    );
  });
});

describe("markTaskDone and reopenTask (C-USE-98-3)", () => {
  function doneSetUp() {
    const work = workBlock();
    const task = workItem();
    const openMon = slot({
      blockId: work.id,
      onDate: MON,
      workItemId: task.id,
    });
    const openTue = slot({
      blockId: work.id,
      onDate: TUE,
      workItemId: task.id,
    });
    const doneBefore = slot({
      blockId: work.id,
      onDate: "2026-10-12",
      workItemId: task.id,
      doneAt: EARLIER,
    });
    return { work, task, openMon, openTue, doneBefore };
  }

  it("marks the task done from Synapse and closes every open session on the one stamp", () => {
    const { task, openMon, openTue, doneBefore } = doneSetUp();
    const journal = workJournal({
      workItems: [task],
      slots: [openMon, openTue, doneBefore],
    });
    planMarkTaskDone(journal, { workItemId: task.id });
    expect(journal.rows.workItems[0]).toMatchObject({
      doneAt: NOW_ISO,
      doneSource: "synapse",
    });
    const byId = new Map(journal.rows.slots.map((s) => [s.id, s.doneAt]));
    expect(byId.get(openMon.id)).toBe(NOW_ISO);
    expect(byId.get(openTue.id)).toBe(NOW_ISO);
    expect(byId.get(doneBefore.id)).toBe(EARLIER);
    expectRefusal(
      () => planMarkTaskDone(journal, { workItemId: task.id }),
      "invalid",
      "That task is already done.",
    );
  });

  it("a session's Done never marks the task", () => {
    const { task, doneBefore } = doneSetUp();
    const pool = assemblePool({
      clientsEnabled: false,
      clients: [],
      workItems: [task],
      slots: [doneBefore],
    });
    expect(pool.workItems).toEqual([task]);
  });

  it("reopens the task and exactly the sessions Done closed, through Postgres's round trip", async () => {
    const { task, openMon, openTue, doneBefore } = doneSetUp();
    const db = memoryDb();
    const store = db.storeFor(ME);
    await store.insert("workItems", structuredClone(task));
    for (const s of [openMon, openTue, doneBefore])
      await store.insert("slots", structuredClone(s));

    const rows = () => ({
      workItems: db.rowsOf("workItems", ME) as never,
      slots: db.rowsOf("slots", ME) as never,
    });
    const done = workJournal(rows());
    planMarkTaskDone(done, { workItemId: task.id });
    await db.transaction(() => applyChanges(store, done.changes()));

    const reopen = workJournal(rows());
    planReopenTask(reopen, { workItemId: task.id });
    await db.transaction(() => applyChanges(store, reopen.changes()));

    expect(db.rowsOf("workItems", ME)[0]).toMatchObject({
      doneAt: null,
      doneSource: null,
    });
    const after = new Map(db.rowsOf("slots", ME).map((s) => [s.id, s.doneAt]));
    expect(after.get(openMon.id)).toBeNull();
    expect(after.get(openTue.id)).toBeNull();
    expect(after.get(doneBefore.id)).toBe(EARLIER);
    expectRefusal(
      () => planReopenTask(workJournal(rows()), { workItemId: task.id }),
      "invalid",
      "That task is open.",
    );
  });

  it("Done's Undo puts the task and its sessions back as they stood", async () => {
    const { task, openMon, doneBefore } = doneSetUp();
    const db = memoryDb();
    const store = db.storeFor(ME);
    await store.insert("workItems", structuredClone(task));
    for (const s of [openMon, doneBefore])
      await store.insert("slots", structuredClone(s));
    const before = {
      items: db.rowsOf("workItems", ME),
      slots: db.rowsOf("slots", ME),
    };

    const journal = workJournal({
      workItems: db.rowsOf("workItems", ME) as never,
      slots: db.rowsOf("slots", ME) as never,
    });
    planMarkTaskDone(journal, { workItemId: task.id });
    const changes = journal.changes();
    await db.transaction(() => applyChanges(store, changes));
    const token = recordUndo(undoChangesOf(changes), ME, KEY);
    await db.transaction(() => undoWrite(store, token, ME, KEY));

    expect({
      items: db.rowsOf("workItems", ME),
      slots: db.rowsOf("slots", ME),
    }).toEqual(before);
  });
});

describe("backToPool and removeFromSynapse (C-USE-98-4)", () => {
  function setUp() {
    const work = workBlock();
    const task = workItem();
    const open = slot({ blockId: work.id, onDate: MON, workItemId: task.id });
    const done = slot({
      blockId: work.id,
      onDate: "2026-10-12",
      workItemId: task.id,
      doneAt: EARLIER,
    });
    return {
      task,
      open,
      done,
      journal: workJournal({
        blocks: [work],
        workItems: [task],
        slots: [open, done],
      }),
    };
  }

  it("backToPool removes the open sessions and keeps the done ones", () => {
    const { task, done, journal } = setUp();
    planBackToPool(journal, { workItemId: task.id });
    expect(journal.rows.slots).toEqual([done]);
    expect(journal.rows.workItems).toEqual([task]);
  });

  it("removeFromSynapse archives the item, deletes nothing of it, and drops its open sessions", () => {
    const { task, done, journal } = setUp();
    planRemoveFromSynapse(journal, { workItemId: task.id });
    expect(journal.rows.workItems).toEqual([
      { ...task, archivedAt: NOW_ISO, updatedAt: NOW_ISO },
    ]);
    expect(journal.rows.slots).toEqual([done]);
    expect(
      journal
        .changes()
        .filter((c) => c.after === null)
        .map((c) => c.table),
    ).toEqual(["slots"]);
    // Gone from Synapse: no write reaches it again.
    expectRefusal(
      () => planBackToPool(journal, { workItemId: task.id }),
      "unknown",
      "No work item with that id.",
    );
  });
});

describe("editWorkItem (C-USE-98-5)", () => {
  it("writes only the fields sent", () => {
    const task = workItem({ title: "Old", lengthMinMin: 30, lengthMaxMin: 60 });
    const northwind = client();
    const journal = workJournal({ workItems: [task], clients: [northwind] });
    planEditWorkItem(
      journal,
      editWorkItemInput.parse({
        id: task.id,
        title: "New",
        clientId: (northwind as { id: string }).id,
      }),
    );
    expect(journal.rows.workItems[0]).toEqual({
      ...task,
      title: "New",
      clientId: (northwind as { id: string }).id,
      updatedAt: NOW_ISO,
    });
    planEditWorkItem(
      journal,
      editWorkItemInput.parse({ id: task.id, clientId: null }),
    );
    expect(journal.rows.workItems[0]!.clientId).toBeNull();
  });

  it("refuses as the fixture does", () => {
    const task = workItem({ lengthMinMin: 30, lengthMaxMin: 60 });
    const parent = workItem({ archivedAt: EARLIER });
    const journal = () => workJournal({ workItems: [task, parent] });
    const edit = (raw: object) =>
      editWorkItemInput.parse({ id: task.id, ...raw });
    expectRefusal(
      () =>
        planEditWorkItem(
          journal(),
          editWorkItemInput.parse({ id: crypto.randomUUID(), title: "X" }),
        ),
      "unknown",
      "No work item with that id.",
    );
    expectRefusal(
      () =>
        planEditWorkItem(journal(), edit({ clientId: crypto.randomUUID() })),
      "unknown",
      "No client with that id.",
    );
    expectRefusal(
      () => planEditWorkItem(journal(), edit({ parentWorkItemId: task.id })),
      "invalid",
      "A task is not its own parent.",
    );
    expectRefusal(
      () => planEditWorkItem(journal(), edit({ parentWorkItemId: parent.id })),
      "unknown",
      "No work item with that id.",
    );
    // A lone end, checked against the stored other.
    expectRefusal(
      () => planEditWorkItem(journal(), edit({ lengthMaxMin: 15 })),
      "invalid",
      "The longest is at least the shortest.",
    );
  });
});
