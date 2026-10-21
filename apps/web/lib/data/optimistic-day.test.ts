import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { BlockItemRecord, SlotRecord } from "@syn/validators";
import {
  applyItemWrite,
  applyTick,
  applyToCache,
  onToday,
  pendingId,
  priorOfTick,
  restoreCache,
  revertTick,
  type DayRows,
  type Tick,
} from "./optimistic-day";
import type { TodayRecords } from "./today-records";

// The day-level half of the optimistic rule: a change applied at once, and
// a rollback that takes back only what it applied.

const DATE = "2026-10-18";
const BLOCK = "00000000-0000-4000-8000-0000000000b1";
const GROCERIES = "00000000-0000-4000-8000-0000000000a1";
const LAUNDRY = "00000000-0000-4000-8000-0000000000a2";
const LAUNDRY_SLOT = "00000000-0000-4000-8000-0000000000c2";
const at = "2026-10-18T09:00:00.000Z";
const now = new Date(at);

function item(id: string, title: string, sortOrder: number): BlockItemRecord {
  return {
    id,
    createdAt: at,
    updatedAt: at,
    blockId: BLOCK,
    title,
    icon: null,
    isTransition: false,
    atTime: null,
    lengthMin: null,
    meal: false,
    onDate: null,
    sortOrder,
  };
}

function slot(
  id: string,
  blockItemId: string,
  doneAt: string | null,
): SlotRecord {
  return {
    id,
    createdAt: at,
    updatedAt: at,
    blockId: BLOCK,
    onDate: DATE,
    skipped: false,
    sortOrder: 1,
    blockItemId,
    todoId: null,
    workItemId: null,
    tier: null,
    lengthMin: null,
    tookMin: null,
    doneAt,
    notes: null,
    atTime: null,
    icon: null,
  };
}

const rows: DayRows = {
  date: DATE,
  items: [item(GROCERIES, "Groceries", 0), item(LAUNDRY, "Laundry", 1)],
  slots: [slot(LAUNDRY_SLOT, LAUNDRY, null)],
  todos: [],
};

function tick(
  slotId: string,
  blockItemId: string,
  doneAt: string | null,
): Tick {
  return {
    dateKey: DATE,
    blockId: BLOCK,
    slotId,
    blockItemId,
    todoId: null,
    sortOrder: 0,
    change: { doneAt, tookMin: null },
  };
}

const doneOf = (day: DayRows, blockItemId: string) =>
  day.slots.find((row) => row.blockItemId === blockItemId)?.doneAt ?? null;

describe("a tick shows at once and its rollback takes back only itself", () => {
  it("a row with a slot is ticked in place and put back as it was", () => {
    const ticked = tick(LAUNDRY_SLOT, LAUNDRY, at);
    const prior = priorOfTick(ticked, rows)!;
    const applied = applyTick(ticked, rows)!;
    expect(doneOf(applied, LAUNDRY)).toBe(at);

    const back = revertTick(ticked, prior, applied)!;
    expect(doneOf(back, LAUNDRY)).toBeNull();
    expect(back.slots).toEqual(rows.slots);
  });

  it("a set item with no slot gets a stand-in, gone again on rollback", () => {
    const ticked = tick(pendingId(), GROCERIES, at);
    const prior = priorOfTick(ticked, rows)!;
    expect(prior.slot).toBeNull();
    const applied = applyTick(ticked, rows)!;
    expect(doneOf(applied, GROCERIES)).toBe(at);

    const back = revertTick(ticked, prior, applied)!;
    expect(back.slots.some((row) => row.blockItemId === GROCERIES)).toBe(false);
  });

  it("a failed tick never takes a second tick's change with it", () => {
    const first = tick(pendingId(), GROCERIES, at);
    const second = tick(LAUNDRY_SLOT, LAUNDRY, at);
    const firstPrior = priorOfTick(first, rows)!;
    const both = applyTick(second, applyTick(first, rows)!)!;

    const firstFailed = revertTick(first, firstPrior, both)!;
    expect(doneOf(firstFailed, GROCERIES)).toBeNull();
    expect(doneOf(firstFailed, LAUNDRY)).toBe(at);
  });

  it("an untick puts the done time back when it fails", () => {
    const done = { ...rows, slots: [slot(LAUNDRY_SLOT, LAUNDRY, at)] };
    const untick = tick(LAUNDRY_SLOT, LAUNDRY, null);
    const prior = priorOfTick(untick, done)!;
    const applied = applyTick(untick, done)!;
    expect(doneOf(applied, LAUNDRY)).toBeNull();
    expect(doneOf(revertTick(untick, prior, applied)!, LAUNDRY)).toBe(at);
  });

  it("another date's rows are left alone", () => {
    const elsewhere = { ...rows, date: "2026-10-19" };
    expect(applyTick(tick(LAUNDRY_SLOT, LAUNDRY, at), elsewhere)).toBeNull();
  });
});

describe("a checklist's add, edit, remove and reorder show at once", () => {
  it("add: the new row is last, with a stand-in id", () => {
    const next = applyItemWrite(
      {
        method: "writeBlockItem",
        args: [
          { blockId: BLOCK, title: "Meal prep", sortOrder: 2, onDate: DATE },
        ],
      },
      rows,
      now,
    )!;
    expect(next.items.map((row) => row.title)).toEqual([
      "Groceries",
      "Laundry",
      "Meal prep",
    ]);
  });

  it("add for another date leaves this date alone", () => {
    const call = {
      method: "writeBlockItem" as const,
      args: [
        {
          blockId: BLOCK,
          title: "Meal prep",
          sortOrder: 2,
          onDate: "2026-10-19",
        },
      ] as [
        { blockId: string; title: string; sortOrder: number; onDate: string },
      ],
    };
    expect(applyItemWrite(call, rows, now)).toBeNull();
  });

  it("edit: the row's words change in place", () => {
    const next = applyItemWrite(
      { method: "editBlockItem", args: [{ id: LAUNDRY, title: "Towels" }] },
      rows,
      now,
    )!;
    expect(next.items.find((row) => row.id === LAUNDRY)?.title).toBe("Towels");
  });

  it("remove for the date: the row leaves the date", () => {
    const next = applyItemWrite(
      { method: "removeBlockItem", args: [{ id: GROCERIES, date: DATE }] },
      rows,
      now,
    )!;
    expect(next.items.map((row) => row.id)).toEqual([LAUNDRY]);
  });

  it("reorder for the date: a slot takes its place, an item with none takes it", () => {
    const next = applyItemWrite(
      {
        method: "reorderItems",
        args: [{ blockId: BLOCK, ids: [LAUNDRY, GROCERIES], date: DATE }],
      },
      rows,
      now,
    )!;
    expect(next.slots.find((row) => row.id === LAUNDRY_SLOT)?.sortOrder).toBe(
      0,
    );
    expect(next.items.find((row) => row.id === GROCERIES)?.sortOrder).toBe(1);
  });
});

describe("the cache: applied to every loaded read, restored on an error", () => {
  it("restores each read exactly as the snapshot saw it", async () => {
    const queryClient = new QueryClient();
    const records = {
      date: DATE,
      blockItems: rows.items,
      slots: rows.slots,
      todos: [],
    } as unknown as TodayRecords;
    const key = ["today", "test", DATE];
    queryClient.setQueryData(key, records);

    const snapshot = await applyToCache<TodayRecords>(
      queryClient,
      ["today", "test"],
      (data) =>
        onToday(data, (day) =>
          applyItemWrite(
            {
              method: "writeBlockItem",
              args: [{ blockId: BLOCK, title: "Meal prep", sortOrder: 2 }],
            },
            day,
            now,
          ),
        ),
    );
    expect(
      queryClient.getQueryData<TodayRecords>(key)?.blockItems,
    ).toHaveLength(3);

    restoreCache(queryClient, snapshot);
    expect(queryClient.getQueryData<TodayRecords>(key)).toEqual(records);
  });
});
