import { describe, expect, it } from "vitest";
import { weekReadOutput } from "@syn/validators";
import {
  block,
  bounds,
  change,
  DAILY,
  event,
  item,
  rows,
  slot,
  todo,
  WEEKDAYS,
  workItem,
} from "./planner-rows.fixture";
import { assembleWeek, datesOf } from "./week-assembly";

/** USE-91 C3: the week's read, assembled from rows in memory. */

const WEEK = "2026-W43";
const MON = "2026-10-19";
const TUE = "2026-10-20";
const SAT = "2026-10-24";

describe("planner.week's assembly (C-USE-91-3)", () => {
  const morning = block({ name: "Morning", rrule: DAILY });
  const work = block({
    kind: "work",
    name: "Work",
    startsAt: "09:00",
    endsAt: "12:00",
    rrule: WEEKDAYS,
  });
  const errands = block({
    kind: "activity",
    name: "Errands",
    startsAt: "10:00",
    endsAt: "12:30",
    rrule: null,
    onDate: SAT,
  });
  const archived = block({
    name: "Old",
    archivedAt: "2026-09-01T00:00:00.000Z",
  });
  const stretch = item({ blockId: morning.id });
  const onlyTue = item({ blockId: morning.id, title: "Ice bath", onDate: TUE });
  const brief = workItem();
  const unslotted = workItem({ title: "Someday" });
  const parcel = todo();
  const all = rows({
    blocks: [morning, work, errands, archived],
    blockItems: [stretch, onlyTue],
    blockChanges: [change({ blockId: work.id, onDate: TUE, skipped: true })],
    slots: [
      slot({
        blockId: work.id,
        onDate: MON,
        workItemId: brief.id,
        tier: "primary",
      }),
      slot({ blockId: errands.id, onDate: SAT, todoId: parcel.id }),
      slot({
        blockId: morning.id,
        onDate: MON,
        blockItemId: stretch.id,
        skipped: true,
      }),
    ],
    workItems: [brief, unslotted],
    todos: [parcel],
    dayEvents: [
      event({ onDate: SAT }),
      event({ rrule: WEEKDAYS, title: "Stand-up" }),
    ],
    dayBounds: [
      bounds({ weekday: 0, upAt: "06:30" }),
      bounds({ weekday: 1, upAt: "07:00" }),
      bounds({ onDate: TUE, upAt: "05:45" }),
    ],
  });

  it("asks for the seven dates of a dated week, and none for the usual week", () => {
    expect(datesOf(WEEK)).toHaveLength(7);
    expect(datesOf(WEEK)[0]).toBe(MON);
    expect(datesOf("usual")).toEqual([]);
  });

  it("returns seven dated days, Monday first, parsing with the week-read schema", () => {
    const week = assembleWeek(all, WEEK);
    expect(weekReadOutput.parse(week)).toEqual(week);
    expect(week.days.map((day) => day.date)).toEqual(datesOf(WEEK));
    expect(week.days.map((day) => day.weekday)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("reads each date's blocks, changes, slots and what they hold", () => {
    const [mon, tue, , , , sat] = assembleWeek(all, WEEK).days;
    expect(mon!.blocks.map((b) => b.name)).toEqual(["Morning", "Work"]);
    // Skipped on the Monday, the set item is left out of its items.
    expect(mon!.items).toEqual([]);
    expect(mon!.workItems).toEqual([brief]);
    expect(tue!.blocks.map((b) => b.name)).toEqual(["Morning"]);
    expect(tue!.changes).toHaveLength(1);
    expect(tue!.items.map((i) => i.title)).toEqual(["Stretch", "Ice bath"]);
    expect(sat!.blocks.map((b) => b.name)).toEqual(["Morning", "Errands"]);
    expect(sat!.todos).toEqual([parcel]);
    expect(sat!.events.map((e) => e.title)).toEqual(["Coffee with Sam"]);
    expect(mon!.events.map((e) => e.title)).toEqual(["Stand-up"]);
  });

  it("reads day_bounds by date over weekday, and by weekday otherwise", () => {
    const [mon, tue, wed] = assembleWeek(all, WEEK).days;
    expect(mon!.bounds?.upAt).toBe("06:30");
    expect(tue!.bounds?.upAt).toBe("05:45");
    expect(wed!.bounds).toBeNull();
  });

  it("reads the usual week by weekday: live blocks with rules, no dated rows", () => {
    const week = assembleWeek(all, "usual");
    expect(weekReadOutput.parse(week)).toEqual(week);
    const [mon, tue, , , , sat] = week.days;
    expect(mon!.date).toBeNull();
    expect(mon!.blocks.map((b) => b.name)).toEqual(["Morning", "Work"]);
    expect(sat!.blocks.map((b) => b.name)).toEqual(["Morning"]);
    expect(mon!.items.map((i) => i.title)).toEqual(["Stretch"]);
    expect(mon!.slots).toEqual([]);
    expect(mon!.events.map((e) => e.title)).toEqual(["Stand-up"]);
    expect(mon!.bounds?.upAt).toBe("06:30");
    expect(tue!.bounds?.upAt).toBe("07:00");
  });
});
