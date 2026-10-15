import { describe, expect, it } from "vitest";
import type { TodoPoolSlot } from "./todo-pool";
import { carriedLabel, reminderBody, trayTodos, type TrayTodo } from "./tray";

// Monday 12 October 2026, 7:14 in Toronto; the day opened at 4:00.
const MONDAY = "2026-10-12";
const NOW = new Date("2026-10-12T07:14:00-04:00");
const DAY_START = new Date("2026-10-12T04:00:00-04:00");

const todo = (id: string, extra: Partial<TrayTodo> = {}): TrayTodo => ({
  id,
  title: id,
  onDate: null,
  rrule: null,
  remindAt: null,
  remindOn: null,
  doneAt: null,
  archivedAt: null,
  createdAt: "2026-10-01T12:00:00Z",
  ...extra,
});

const read = (todos: TrayTodo[], slots: TodoPoolSlot[] = [], now = NOW) =>
  trayTodos({ todos, slots, dateKey: MONDAY, now, dayStart: DAY_START });

const ids = (rows: { todo: { id: string } }[]) => rows.map((r) => r.todo.id);

describe("C5: the tray's rows, their order and their labels", () => {
  it("puts reminders first by time, then the rest oldest first", () => {
    const rows = read([
      todo("old", { createdAt: "2026-09-01T12:00:00Z" }),
      todo("late", { onDate: MONDAY, remindAt: "15:00" }),
      todo("new", { createdAt: "2026-10-10T12:00:00Z" }),
      todo("early", { onDate: MONDAY, remindAt: "10:00" }),
    ]);
    expect(ids(rows)).toEqual(["early", "late", "old", "new"]);
    expect(rows[0]?.reminderAt).toBe("10:00");
    expect(rows[2]?.reminderAt).toBeNull();
  });

  it('labels an unchecked to-do from Sunday "From Sunday" on Monday', () => {
    const [row] = read([todo("books", { onDate: "2026-10-11" })]);
    expect(row?.carriedFrom).toBe("2026-10-11");
    expect(row?.carriedLabel).toBe("From Sunday");
  });

  it('labels one past a week by its date, "From 3 Oct"', () => {
    const [row] = read([todo("form", { onDate: "2026-10-03" })]);
    expect(row?.carriedLabel).toBe("From 3 Oct");
    expect(carriedLabel("2026-10-06", MONDAY)).toBe("From Tuesday");
    expect(carriedLabel("2026-10-05", MONDAY)).toBe("From 5 Oct");
  });

  it("labels an undated to-do back from Sunday's block", () => {
    const [row] = read(
      [todo("back")],
      [
        {
          todoId: "back",
          onDate: "2026-10-11",
          doneAt: null,
          blockEnd: new Date("2026-10-11T16:00:00-04:00"),
        },
      ],
    );
    expect(row?.carriedLabel).toBe("From Sunday");
  });

  it("keeps a to-do checked today until the day ends, then it leaves", () => {
    const checked = todo("done", { doneAt: "2026-10-12T06:50:00-04:00" });
    expect(ids(read([checked]))).toEqual(["done"]);
    const yesterday = todo("gone", { doneAt: "2026-10-11T21:00:00-04:00" });
    expect(read([yesterday])).toEqual([]);
  });

  it("leaves out a future date, an archived to-do and one in a live slot", () => {
    const rows = read(
      [
        todo("later", { onDate: "2026-10-13" }),
        todo("archived", { archivedAt: "2026-10-10T12:00:00Z" }),
        todo("slotted"),
      ],
      [
        {
          todoId: "slotted",
          onDate: MONDAY,
          doneAt: null,
          blockEnd: new Date("2026-10-12T16:00:00-04:00"),
        },
      ],
    );
    expect(rows).toEqual([]);
  });

  it("shows a repeating to-do on the dates its rule hits", () => {
    const weekly = (day: string) =>
      todo(`bins-${day}`, {
        rrule: `DTSTART;VALUE=DATE:20261005\nRRULE:FREQ=WEEKLY;BYDAY=${day}`,
      });
    expect(ids(read([weekly("MO"), weekly("TU")]))).toEqual(["bins-MO"]);
  });

  it("reminds only on the reminder's own day", () => {
    const [row] = read([
      todo("tomorrow", { remindAt: "09:00", remindOn: "2026-10-13" }),
    ]);
    expect(row?.reminderAt).toBeNull();
  });

  it("reminderBody returns the title unchanged", () => {
    expect(reminderBody({ title: "Call the mechanic" })).toBe(
      "Call the mechanic",
    );
    expect(reminderBody({ title: "  📞 call Sam re: brakes?! " })).toBe(
      "  📞 call Sam re: brakes?! ",
    );
  });
});
