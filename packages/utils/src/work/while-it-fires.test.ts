import { describe, expect, it } from "vitest";
import type { WorkNext } from "./next";
import { pickWhileItFires, type ReminderTodo } from "./while-it-fires";

const DAILY = "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=DAILY";
const WEEKLY = "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=TU";

const todo = (id: string, extra: Partial<ReminderTodo> = {}): ReminderTodo => ({
  id,
  remindAt: "10:00",
  rrule: DAILY,
  onDate: null,
  doneAt: null,
  archivedAt: null,
  createdAt: "2026-10-01T12:00:00Z",
  ...extra,
});

const NEXT: WorkNext = { kind: "slot", slotId: "p1" };
const pick = (todos: ReminderTodo[], next: WorkNext = NEXT, firingCount = 1) =>
  pickWhileItFires({ todos, dateKey: "2026-10-13", next, firingCount });

describe("C6: the first undone daily reminder by time, only while something fires and not everything", () => {
  it("picks the first by time, not array order", () => {
    expect(
      pick([
        todo("late", { remindAt: "15:00" }),
        todo("early", { remindAt: "09:05" }),
      ]),
    ).toBe("early");
  });

  it("settles a tie by when it was made", () => {
    expect(
      pick([
        todo("b", { createdAt: "2026-10-02T00:00:00Z" }),
        todo("a", { createdAt: "2026-10-03T00:00:00Z" }),
      ]),
    ).toBe("b");
  });

  it("shows nothing when nothing fires", () => {
    expect(pick([todo("k")], NEXT, 0)).toBeNull();
  });

  it("shows nothing when everything fires", () => {
    expect(pick([todo("k")], { kind: "all_firing" }, 3)).toBeNull();
  });

  it("shows one while firing with nothing else to do", () => {
    expect(pick([todo("k")], { kind: "none" }, 1)).toBe("k");
  });

  it("takes only undone, unarchived daily reminders dated on or before the day", () => {
    expect(
      pick([
        todo("done", { doneAt: "2026-10-13T08:00:00Z", remindAt: "08:00" }),
        todo("archived", {
          archivedAt: "2026-10-12T08:00:00Z",
          remindAt: "08:00",
        }),
        todo("no-time", { remindAt: null }),
        todo("no-rule", { rrule: null, remindAt: "08:00" }),
        todo("weekly", { rrule: WEEKLY, remindAt: "08:00" }),
        todo("broken", { rrule: "RRULE:FREQ=DAILY", remindAt: "08:00" }),
        todo("tomorrow", { onDate: "2026-10-14", remindAt: "08:00" }),
        todo("dated", { onDate: "2026-10-13", remindAt: "11:00" }),
        todo("undated", { remindAt: "12:00" }),
      ]),
    ).toBe("dated");
  });

  it("is none with no reminders", () => {
    expect(pick([])).toBeNull();
  });
});
