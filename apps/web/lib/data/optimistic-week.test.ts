import { describe, expect, it } from "vitest";
import type { BlockRecord, SetUpDayRead } from "@syn/validators";
import { applyOptimistic } from "./optimistic-week";
import type { PlannerCall } from "./use-planner-writes";
import type { WeekRecords } from "./week-records";

// USE-148 C1: a planner write as the week reads once it lands, written into
// the cache before the server answers.

const now = new Date("2026-10-19T12:00:00Z");
const at = now.toISOString();
const ID = "00000000-0000-4000-8000-000000000001";
const ITEM = "00000000-0000-4000-8000-000000000002";

function day(weekday: number, date: string | null): SetUpDayRead {
  return {
    weekday,
    date,
    bounds: null,
    blocks: [],
    changes: [],
    items: [],
    slots: [],
    events: [],
    workItems: [],
    todos: [],
    googleEvents: [],
  };
}

const usual: WeekRecords = {
  week: "usual",
  timeZone: "Europe/London",
  days: [0, 1, 2, 3, 4, 5, 6].map((w) => day(w, null)),
};

// 2026-10-19 is a Monday.
const dated: WeekRecords = {
  week: "2026-W43",
  timeZone: "Europe/London",
  days: [0, 1, 2, 3, 4, 5, 6].map((w) => day(w, `2026-10-${19 + w}`)),
};

const block: BlockRecord = {
  id: ID,
  createdAt: at,
  updatedAt: at,
  kind: "wellness",
  name: "Wellness",
  icon: null,
  color: null,
  startsAt: "07:05",
  endsAt: "08:05",
  rrule: "DTSTART;VALUE=DATE:20261022\nRRULE:FREQ=WEEKLY;BYDAY=TH",
  onDate: null,
  fill: null,
  checklist: false,
  meal: false,
  notify: false,
  archivedAt: null,
};

const withBlock = (week: WeekRecords, weekday: number): WeekRecords => ({
  ...week,
  days: week.days.map((d) =>
    d.weekday === weekday
      ? {
          ...d,
          blocks: [block],
          items: [
            {
              id: ITEM,
              createdAt: at,
              updatedAt: at,
              blockId: ID,
              title: "Stretch",
              icon: null,
              isTransition: false,
              atTime: null,
              lengthMin: 5,
              meal: false,
              onDate: null,
              sortOrder: 0,
            },
          ],
        }
      : d,
  ),
});

const input = {
  kind: "wellness",
  name: "Wellness",
  startsAt: "07:05",
  endsAt: "08:05",
  rrule: block.rrule,
} as const;

const create: PlannerCall = {
  method: "createBlock",
  args: [input, { weekday: 3 }],
};

describe("applyOptimistic (USE-148)", () => {
  it("adds a new block to each usual day its rule hits, and only those", () => {
    const next = applyOptimistic(create, usual, now)!;
    expect(next.days.map((d) => d.blocks.length)).toEqual([0, 0, 0, 1, 0, 0, 0]);
    expect(next.days[3]!.blocks[0]).toMatchObject({
      name: "Wellness",
      startsAt: "07:05",
      archivedAt: null,
    });
    expect(usual.days[3]!.blocks).toHaveLength(0);
  });

  it("adds it to a dated week's days on or after its start", () => {
    const next = applyOptimistic(create, dated, now)!;
    expect(next.days.map((d) => d.blocks.length)).toEqual([0, 0, 0, 1, 0, 0, 0]);
  });

  it("adds a one-date block to that date only", () => {
    const once: PlannerCall = {
      method: "createBlock",
      args: [{ ...input, rrule: null, onDate: "2026-10-21" }],
    };
    const next = applyOptimistic(once, dated, now)!;
    expect(next.days.map((d) => d.blocks.length)).toEqual([0, 0, 1, 0, 0, 0, 0]);
    expect(applyOptimistic(once, usual, now)!.days.every((d) => d.blocks.length === 0)).toBe(true);
  });

  it("patches an edit by id and keeps what it left out", () => {
    const next = applyOptimistic(
      { method: "editBlock", args: [{ id: ID, name: "Stretch and breathe" }] },
      withBlock(usual, 3),
      now,
    )!;
    expect(next.days[3]!.blocks[0]).toMatchObject({
      name: "Stretch and breathe",
      startsAt: "07:05",
    });
  });

  it("sets a weekday's bounds", () => {
    const next = applyOptimistic(
      {
        method: "writeBounds",
        args: [{ weekday: 0, upAt: "06:30", lightsOut: "22:30" }],
      },
      usual,
      now,
    )!;
    expect(next.days[0]!.bounds).toMatchObject({ upAt: "06:30", lightsOut: "22:30" });
    expect(next.days[1]!.bounds).toBeNull();
  });

  it("adds, removes and orders items in the block's days", () => {
    const week = withBlock(usual, 3);
    const added = applyOptimistic(
      {
        method: "writeBlockItem",
        args: [{ blockId: ID, title: "Breathe", sortOrder: 1, lengthMin: 5 }],
      },
      week,
      now,
    )!;
    expect(added.days[3]!.items.map((i) => i.title)).toEqual(["Stretch", "Breathe"]);
    const removed = applyOptimistic(
      { method: "removeBlockItem", args: [{ id: ITEM }] },
      week,
      now,
    )!;
    expect(removed.days[3]!.items).toHaveLength(0);
  });

  it("leaves a write it does not know, or a dated change, to the server", () => {
    expect(
      applyOptimistic({ method: "clearDay", args: [{ weekday: 0 }] } as never, usual, now),
    ).toBeNull();
    expect(
      applyOptimistic(
        { method: "removeBlockItem", args: [{ id: ITEM, date: "2026-10-22" }] },
        usual,
        now,
      ),
    ).toBeNull();
  });
});
