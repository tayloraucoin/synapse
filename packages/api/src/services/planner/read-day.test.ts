import { describe, expect, it } from "vitest";
import { readDay } from "@syn/utils";
import { blockRecord, dayReadOutput, slotRecord } from "@syn/validators";
import { assembleDay } from "./day-assembly";
import {
  block,
  change,
  DAILY,
  event,
  id,
  item,
  rows,
  slot,
  STAMP,
  todo,
  TZ,
  workItem,
} from "./planner-rows.fixture";
import { recordOf } from "./row-records";

/** USE-91 C1 and C2: the day's read, assembled from rows in memory. */

const MON = "2026-10-19";
const TUE = "2026-10-20";
const WED = "2026-10-21";

describe("planner.today's assembly (C-USE-91-1)", () => {
  const morning = block({ name: "Morning" });
  const work = block({
    kind: "work",
    name: "Work",
    startsAt: "09:30",
    endsAt: "12:00",
  });
  const stretch = item({ blockId: morning.id });
  const brief = workItem();
  const parcel = todo();
  const monSlot = slot({
    blockId: work.id,
    onDate: MON,
    workItemId: brief.id,
    tier: "primary",
  });
  const tueSlot = slot({
    blockId: morning.id,
    onDate: TUE,
    blockItemId: stretch.id,
  });
  const all = rows({
    blocks: [morning, work],
    blockItems: [stretch],
    blockChanges: [
      change({
        blockId: work.id,
        onDate: MON,
        startsAt: "10:00",
        endsAt: "12:00",
      }),
    ],
    slots: [monSlot, tueSlot],
    slotEvents: [
      {
        id: id(),
        createdAt: STAMP,
        slotId: monSlot.id,
        kind: "started",
        clientEventId: id(),
        at: STAMP,
        receivedAt: STAMP,
        stepAwayId: null,
      },
    ],
    workItems: [brief],
    todos: [parcel],
    dayEvents: [
      event({ onDate: MON, title: "Dentist" }),
      event({ onDate: TUE, title: "Coffee with Sam" }),
      event({ rrule: DAILY, title: "Walk" }),
    ],
    dayRecords: [
      {
        id: id(),
        createdAt: STAMP,
        updatedAt: STAMP,
        onDate: MON,
        orientedAt: STAMP,
        readyAt: null,
        closedAt: null,
      },
    ],
  });

  const day = assembleDay(all, MON);

  it("returns the date's records, and parses with the day-read schema", () => {
    expect(dayReadOutput.parse(day)).toEqual(day);
    expect(day.date).toBe(MON);
    expect(day.timeZone).toBe(TZ);
    expect(day.blocks).toHaveLength(2);
    expect(day.blockItems).toEqual([stretch]);
    expect(day.slots).toEqual([monSlot]);
    expect(day.slotEvents.map((e) => e.slotId)).toEqual([monSlot.id]);
    expect(day.blockChanges).toHaveLength(1);
    expect(day.workItems).toEqual([brief]);
    expect(day.todos).toEqual([parcel]);
    expect(day.dayEvents.map((e) => e.title)).toEqual(["Dentist", "Walk"]);
    expect(day.dayRecord?.orientedAt).toBe(STAMP);
    expect(day.usualWakeTime).toBe("07:00");
  });

  it("opens the day at day_close_time in the account's zone, not midnight", () => {
    // 03:00 PDT is 10:00 UTC.
    expect(day.dayWindow.start.toISOString()).toBe("2026-10-19T10:00:00.000Z");
    expect(day.dayWindow.end.toISOString()).toBe("2026-10-20T10:00:00.000Z");
  });

  it("reads no day record before the first open", () => {
    expect(assembleDay(all, TUE).dayRecord).toBeNull();
  });

  it("reads a row's instants and Postgres times as the record's", () => {
    const row = {
      id: morning.id,
      createdAt: new Date(STAMP),
      updatedAt: new Date(STAMP),
      userId: id(),
      kind: "morning",
      name: "Morning",
      icon: null,
      color: null,
      startsAt: "07:00:00",
      endsAt: "24:00:00",
      rrule: DAILY,
      onDate: null,
      fill: null,
      checklist: false,
      meal: false,
      notify: false,
      archivedAt: null,
    };
    const record = recordOf(blockRecord, row);
    expect(record).not.toHaveProperty("userId");
    expect(record.createdAt).toBe(STAMP);
    expect(record.startsAt).toBe("07:00");
    expect(record.endsAt).toBe("24:00");
  });

  it("fails loudly on a row missing a column the record needs", () => {
    expect(() => recordOf(slotRecord, { id: id() })).toThrow();
  });
});

describe("a repeating block moved by a block_change (C-USE-91-2)", () => {
  const work = block({
    kind: "work",
    name: "Work",
    startsAt: "09:00",
    endsAt: "12:00",
  });
  const all = rows({
    blocks: [work],
    blockChanges: [
      change({
        blockId: work.id,
        onDate: MON,
        startsAt: "13:00",
        endsAt: "16:00",
      }),
      change({ blockId: work.id, onDate: WED, skipped: true }),
    ],
  });

  /** The hooks' `select`: the date's blocks from its records. */
  function running(dateKey: string) {
    const day = assembleDay(all, dateKey);
    return readDay({
      dateKey,
      timeZone: day.timeZone,
      blocks: day.blocks,
      changes: day.blockChanges,
      slots: day.slots,
    }).blocks;
  }

  it("reads at its new times on the changed date", () => {
    const [occurrence] = running(MON);
    expect(occurrence).toMatchObject({
      startsAt: "13:00",
      endsAt: "16:00",
      changed: true,
    });
  });

  it("reads at its usual times on the next date", () => {
    const [occurrence] = running(TUE);
    expect(occurrence).toMatchObject({
      startsAt: "09:00",
      endsAt: "12:00",
      changed: false,
    });
  });

  it("reads without it on a skipped date", () => {
    expect(running(WED)).toEqual([]);
  });

  it("carries only the date's own change", () => {
    expect(assembleDay(all, TUE).blockChanges).toEqual([]);
    expect(assembleDay(all, MON).blockChanges.map((c) => c.onDate)).toEqual([
      MON,
    ]);
  });
});
