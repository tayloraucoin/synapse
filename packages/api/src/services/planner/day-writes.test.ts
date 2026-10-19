import { describe, expect, it } from "vitest";
import { occursOn, parseRule } from "@syn/utils";
import { memoryDb, type MemoryDb } from "../undo/memory-store.fixture";
import type { RowStore } from "../undo/row-store";
import type { UndoTable } from "../undo/tables";
import { undoWrite } from "../undo/undo";
import {
  applyDayWrite,
  planClearDay,
  planCopyBlock,
  planCopyDay,
  planResetDay,
  readSetUpDay,
} from "./day-writes";
import type { PlannerRows } from "./planner-rows";
import {
  block,
  bounds,
  change,
  DAILY,
  id,
  item,
  rows,
  slot,
  WEEKDAYS,
} from "./planner-rows.fixture";
import type { WriteJournal, WriteRows } from "./write-journal";
import type { PlanOut } from "./write-plan";
import { expectRefusal, journalOver, NOW } from "./write-plan.fixture";

/** USE-93 C1 to C4: the day-level writes over rows in memory, and their Undo. */

const KEY = "test-undo-key-0123456789abcdef0123456789";
const ME = "00000000-0000-4000-a000-000000000001";
const MON = "2026-10-19";
const THU = "2026-10-22";
const TABLES: UndoTable[] = [
  "blocks",
  "blockChanges",
  "blockItems",
  "slots",
  "dayBounds",
];

/**
 * Monday has its morning moved, an item of its own and a dated trip;
 * Thursday has its own groceries block, an item of its own and a skipped
 * slot. The usual week is a daily morning and a weekdays Work block.
 */
function week(): Partial<PlannerRows> {
  const morning = block({ name: "Morning", rrule: DAILY });
  const work = block({
    kind: "work",
    name: "Work",
    startsAt: "09:00",
    endsAt: "12:00",
    rrule: WEEKDAYS,
  });
  const trip = block({
    kind: "life",
    name: "Dentist trip",
    startsAt: "14:00",
    endsAt: "15:00",
    rrule: null,
    onDate: MON,
  });
  const groceries = block({
    kind: "life",
    name: "Groceries",
    startsAt: "17:00",
    endsAt: "18:00",
    rrule: null,
    onDate: THU,
  });
  const stretch = item({ blockId: morning.id, title: "Stretch" });
  const water = item({ blockId: morning.id, title: "Water", sortOrder: 1 });
  return {
    blocks: [morning, work, trip, groceries],
    blockItems: [
      stretch,
      water,
      item({ blockId: morning.id, title: "Call mum", onDate: MON }),
      item({ blockId: morning.id, title: "Bins out", onDate: THU }),
      item({ blockId: trip.id, title: "Bring the form" }),
    ],
    blockChanges: [
      change({
        blockId: morning.id,
        onDate: MON,
        startsAt: "07:30",
        endsAt: "08:30",
      }),
      change({
        blockId: work.id,
        onDate: THU,
        startsAt: "10:00",
        endsAt: "13:00",
      }),
    ],
    slots: [
      slot({
        blockId: morning.id,
        onDate: THU,
        blockItemId: water.id,
        skipped: true,
      }),
      slot({ blockId: morning.id, onDate: THU, blockItemId: stretch.id }),
    ],
    dayBounds: [
      bounds({ weekday: 3 }),
      bounds({ onDate: THU, upAt: "06:30", lightsOut: "22:00" }),
    ],
  };
}

/** A day as a person sees it: each block's name, times and item titles. */
function dayOf(
  rowsNow: WriteRows,
  ref: { date: string } | { weekday: number },
) {
  const day = readSetUpDay(rowsNow, ref);
  return day.blocks.map((b) => {
    const moved = day.changes.find((c) => c.blockId === b.id && c.startsAt);
    return {
      name: b.name,
      startsAt: moved?.startsAt ?? b.startsAt,
      endsAt: moved?.endsAt ?? b.endsAt,
      items: day.items
        .filter((i) => i.blockId === b.id)
        .map((i) => i.title)
        .sort(),
    };
  });
}

/** The rows of the usual week: its repeating blocks and their every-date items. */
function usualRows(rowsNow: WriteRows) {
  const usual = rowsNow.blocks.filter((b) => b.rrule !== null);
  const ids = new Set(usual.map((b) => b.id));
  return {
    blocks: usual,
    items: rowsNow.blockItems.filter(
      (i) => ids.has(i.blockId) && i.onDate === null,
    ),
    bounds: rowsNow.dayBounds.filter((r) => r.weekday !== null),
  };
}

async function seed(db: MemoryDb, seeded: WriteRows) {
  const store = db.storeFor(ME);
  for (const table of TABLES) {
    for (const row of seeded[table as "blocks"]) {
      await store.insert(table, structuredClone(row));
    }
  }
}

function snapshot(db: MemoryDb) {
  return Object.fromEntries(TABLES.map((t) => [t, db.rowsOf(t, ME)]));
}

type Plan = (journal: WriteJournal) => PlanOut;

/** The write as `runDayWrite` runs it, over the database in memory. */
function write(db: MemoryDb, seeded: WriteRows, plan: Plan, store?: RowStore) {
  return db.transaction(() =>
    applyDayWrite(
      {
        read: () => Promise.resolve(structuredClone(seeded)),
        store: store ?? db.storeFor(ME),
      },
      ME,
      plan,
      { now: () => NOW, newId: id },
      KEY,
    ),
  );
}

function undo(db: MemoryDb, token: string) {
  return db.transaction(() => undoWrite(db.storeFor(ME), token, ME, KEY));
}

describe("copyDay (C-USE-93-1)", () => {
  it("clears Thursday, then gives it Monday's blocks, times and items", () => {
    const journal = journalOver(week());
    planCopyDay(journal, { from: { date: MON }, to: { date: THU } });
    expect(dayOf(journal.rows, { date: THU })).toEqual([
      {
        name: "Morning",
        startsAt: "07:30",
        endsAt: "08:30",
        items: ["Call mum", "Stretch", "Water"],
      },
      // D-USE-87: Work copies as time only.
      { name: "Work", startsAt: "09:00", endsAt: "12:00", items: [] },
      {
        name: "Dentist trip",
        startsAt: "14:00",
        endsAt: "15:00",
        items: ["Bring the form"],
      },
    ]);
  });

  it("writes dated blocks onto a date, never a second rule, and skips the date's own", () => {
    const before = week();
    const had = new Set(before.blocks!.map((b) => b.id));
    const usual = usualRows(journalOver(structuredClone(before)).rows);
    const journal = journalOver(before);
    planCopyDay(journal, { from: { date: MON }, to: { date: THU } });
    const made = journal.rows.blocks.filter((b) => !had.has(b.id));
    expect(made).toHaveLength(3);
    for (const row of made) {
      expect(row.rrule).toBeNull();
      expect(row.onDate).toBe(THU);
    }
    // No slot is copied: sessions are placed, never copied.
    expect(journal.rows.slots.every((s) => s.onDate === THU)).toBe(true);
    expect(
      journal.rows.slots.some((s) => made.some((b) => b.id === s.blockId)),
    ).toBe(false);
    // The usual week is untouched.
    expect(usualRows(journal.rows)).toEqual(usual);
  });

  it("refuses the same day and a day with nothing, in the fixture's words", () => {
    expectRefusal(
      () =>
        planCopyDay(journalOver(week()), {
          from: { date: THU },
          to: { date: THU },
        }),
      "invalid",
      "Pick another day to copy.",
    );
    expectRefusal(
      () =>
        planCopyDay(journalOver(), {
          from: { date: MON },
          to: { date: THU },
        }),
      "invalid",
      "That day has nothing to copy.",
    );
  });

  it("names the usual weekday's reach when it copies onto one", () => {
    const out = planCopyDay(journalOver(week()), {
      from: { date: MON },
      to: { weekday: 5 },
    });
    expect(out.reach).toEqual({ weekday: 5 });
  });

  it("is undone whole: Thursday is back as it was, row for row", async () => {
    const db = memoryDb();
    const seeded = rows(week());
    await seed(db, seeded);
    const was = snapshot(db);
    const { undo: token } = await write(db, seeded, (j) =>
      planCopyDay(j, { from: { date: MON }, to: { date: THU } }),
    );
    expect(snapshot(db)).not.toEqual(was);
    await undo(db, token);
    expect(snapshot(db)).toEqual(was);
  });
});

describe("copyBlock (C-USE-93-2)", () => {
  it("copies one block and its items to a date at a new start, keeping its length", () => {
    const seeded = week();
    const morning = seeded.blocks![0]!;
    const journal = journalOver(seeded);
    const out = planCopyBlock(journal, {
      blockId: morning.id,
      from: { date: MON },
      to: { date: THU },
      startsAt: "19:00",
    });
    const row = journal.rows.blocks.find((b) => b.id === out.id)!;
    expect(row).toMatchObject({
      name: "Morning",
      startsAt: "19:00",
      endsAt: "20:00",
      rrule: null,
      onDate: THU,
    });
    expect(
      journal.rows.blockItems
        .filter((i) => i.blockId === row.id)
        .map((i) => [i.title, i.onDate])
        .sort(),
    ).toEqual([
      ["Call mum", null],
      ["Stretch", null],
      ["Water", null],
    ]);
    expect(out.reach).toBeUndefined();
  });

  it("onto a usual weekday writes a weekly rule on that day, and names its reach", () => {
    const seeded = week();
    const journal = journalOver(seeded);
    const out = planCopyBlock(journal, {
      blockId: seeded.blocks![2]!.id,
      from: { date: MON },
      to: { weekday: 3 },
      startsAt: "16:00",
    });
    const row = journal.rows.blocks.find((b) => b.id === out.id)!;
    expect(row.onDate).toBeNull();
    expect(row.rrule).toMatch(/RRULE:FREQ=WEEKLY;BYDAY=TH$/);
    const parsed = parseRule(row.rrule!);
    expect(parsed.ok && occursOn(parsed.rule, "2026-10-29")).toBe(true);
    expect(out.reach).toEqual({ weekday: 3 });
  });

  it("refuses a block not on the day", () => {
    const seeded = week();
    expectRefusal(
      () =>
        planCopyBlock(journalOver(seeded), {
          blockId: seeded.blocks![3]!.id,
          from: { date: MON },
          to: { date: THU },
          startsAt: "09:00",
        }),
      "unknown",
      "That block is not on that day.",
    );
  });
});

describe("resetDay and clearDay (C-USE-93-3)", () => {
  it("resetDay deletes the date's own rows and nothing of the usual week", () => {
    const seeded = week();
    const untouched = journalOver(structuredClone(seeded)).rows;
    const journal = journalOver(seeded);
    planResetDay(journal, { date: THU });
    const r = journal.rows;
    expect(r.blockChanges.filter((c) => c.onDate === THU)).toEqual([]);
    expect(
      r.slots.filter((s) => s.onDate === THU).map((s) => s.skipped),
    ).toEqual([false]);
    expect(r.blockItems.filter((i) => i.onDate === THU)).toEqual([]);
    expect(r.blocks.filter((b) => b.onDate === THU)).toEqual([]);
    expect(r.dayBounds.filter((b) => b.onDate === THU)).toEqual([]);
    // Monday's own rows and the usual week stay.
    expect(r.blockChanges.filter((c) => c.onDate === MON)).toHaveLength(1);
    expect(r.blocks.filter((b) => b.onDate === MON)).toHaveLength(1);
    expect(usualRows(r)).toEqual(usualRows(untouched));
    expect(dayOf(r, { date: THU })).toEqual(dayOf(untouched, { weekday: 3 }));
  });

  it("clearDay skips the date's repeating blocks, archives its dated ones, and edits no rule", () => {
    const seeded = week();
    const rules = seeded.blocks!.map((b) => b.rrule);
    const journal = journalOver(seeded);
    planClearDay(journal, { date: THU });
    const r = journal.rows;
    const [morning, work, , groceries] = seeded.blocks!;
    for (const b of [morning!, work!]) {
      expect(
        r.blockChanges.find((c) => c.blockId === b.id && c.onDate === THU),
      ).toMatchObject({ skipped: true, startsAt: null, endsAt: null });
    }
    expect(
      r.blocks.find((b) => b.id === groceries!.id)?.archivedAt,
    ).not.toBeNull();
    expect(r.blockItems.filter((i) => i.onDate === THU)).toEqual([]);
    expect(r.blocks.map((b) => b.rrule)).toEqual(rules);
    expect(dayOf(r, { date: THU })).toEqual([]);
  });

  it("clearDay on a usual weekday takes the day off each rule", () => {
    const journal = journalOver(week());
    const out = planClearDay(journal, { weekday: 3 });
    expect(dayOf(journal.rows, { weekday: 3 })).toEqual([]);
    expect(dayOf(journal.rows, { weekday: 2 })).toHaveLength(2);
    expect(out.reach).toEqual({ weekday: 3 });
  });

  it("refuses a day with nothing to clear", () => {
    expectRefusal(
      () => planClearDay(journalOver(), { date: THU }),
      "invalid",
      "That day has nothing to clear.",
    );
  });

  it("each is undone whole", async () => {
    for (const plan of [
      (j: WriteJournal) => planResetDay(j, { date: THU }),
      (j: WriteJournal) => planClearDay(j, { date: THU }),
    ]) {
      const db = memoryDb();
      const seeded = rows(week());
      await seed(db, seeded);
      const was = snapshot(db);
      const { undo: token } = await write(db, seeded, plan);
      expect(snapshot(db)).not.toEqual(was);
      await undo(db, token);
      expect(snapshot(db)).toEqual(was);
    }
  });
});

describe("a failure part way (C-USE-93-4)", () => {
  /** A store that writes every step but throws on the plan's last. */
  function failingLast(db: MemoryDb, steps: number): RowStore {
    const inner = db.storeFor(ME);
    let calls = 0;
    const step =
      <A extends unknown[]>(fn: (...args: A) => Promise<boolean>) =>
      (...args: A) => {
        calls += 1;
        if (calls === steps) return Promise.reject(new Error("Lost the line."));
        return fn(...args);
      };
    return {
      insert: step(inner.insert),
      update: step(inner.update),
      remove: step(inner.remove),
    };
  }

  const cases: [string, Plan][] = [
    [
      "copyDay",
      (j) => planCopyDay(j, { from: { date: MON }, to: { date: THU } }),
    ],
    [
      "copyBlock",
      (j) =>
        planCopyBlock(j, {
          blockId: j.rows.blocks[0]!.id,
          from: { date: MON },
          to: { date: THU },
          startsAt: "19:00",
        }),
    ],
    ["clearDay", (j) => planClearDay(j, { date: THU })],
    ["resetDay", (j) => planResetDay(j, { date: THU })],
  ];

  it.each(cases)("%s leaves no row changed", async (_name, plan) => {
    const db = memoryDb();
    const seeded = rows(week());
    await seed(db, seeded);
    const was = snapshot(db);
    // The same rows, so the same plan: count its steps.
    const dry = journalOver(structuredClone(seeded));
    plan(dry);
    const steps = dry.changes().length;
    expect(steps).toBeGreaterThan(1);
    await expect(
      write(db, seeded, plan, failingLast(db, steps)),
    ).rejects.toThrow("Lost the line.");
    expect(snapshot(db)).toEqual(was);
  });
});
