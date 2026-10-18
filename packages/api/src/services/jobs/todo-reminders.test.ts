import { describe, expect, it } from "vitest";
import { memoryPush } from "./push-fakes.fixture";
import { pushWindow } from "./push-window";
import {
  dueTodoReminders,
  sendTodoReminders,
  type ReminderTodo,
} from "./todo-reminders";

/** USE-105 C2, C3: a daily reminder in the window, sent once. */

const ZONE = "America/Toronto";
// 2026-10-19 09:02 in Toronto (EDT, UTC-4).
const NOW = new Date("2026-10-19T13:02:00Z");

const daily: ReminderTodo = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Take vitamins",
  onDate: null,
  rrule: "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=DAILY",
  remindAt: "09:00",
  remindOn: null,
  doneAt: null,
  archivedAt: null,
};

async function run(
  now: Date,
  todos: ReminderTodo[],
  push = memoryPush(),
  doneSlots: Array<{ todoId: string; onDate: string }> = [],
) {
  const due = dueTodoReminders({
    todos,
    doneSlots,
    timeZone: ZONE,
    window: pushWindow(now),
  });
  const count = await sendTodoReminders(due, ZONE, push);
  return { count, push };
}

describe("todo_reminder (C-USE-105-2)", () => {
  it("sends one push for a daily reminder whose time is in the window", async () => {
    const { count, push } = await run(NOW, [daily]);
    expect(count).toBe(1);
    expect(push.sent).toHaveLength(1);
    expect(push.sent[0]?.payload.title).toBe("Take vitamins · 9:00 AM");
    expect(push.sent[0]?.payload.url).toBe(`/today?todo=${daily.id}`);
  });

  it("sends none on a second run over an overlapping window", async () => {
    const push = memoryPush();
    await run(NOW, [daily], push);
    // The next tick, four minutes on: (08:59:xx, 09:06] still holds 09:00.
    const second = await run(
      new Date(NOW.getTime() + 4 * 60_000),
      [daily],
      push,
    );
    expect(second.count).toBe(0);
    expect(push.sent).toHaveLength(1);
  });

  it("sends nothing before its time or once the window has passed it", async () => {
    expect((await run(new Date("2026-10-19T12:58:00Z"), [daily])).count).toBe(
      0,
    );
    expect((await run(new Date("2026-10-19T13:07:00Z"), [daily])).count).toBe(
      0,
    );
  });

  it("reminds on remind_on, and not on another day", async () => {
    const once = { ...daily, rrule: null, remindOn: "2026-10-19" };
    expect((await run(NOW, [once])).count).toBe(1);
    expect((await run(NOW, [{ ...once, remindOn: "2026-10-20" }])).count).toBe(
      0,
    );
  });

  it("does not remind on a date the rule misses", async () => {
    const weekly = {
      ...daily,
      rrule: "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=TU",
    };
    expect((await run(NOW, [weekly])).count).toBe(0);
  });
});

describe("a reminder already done sends nothing (C-USE-105-3)", () => {
  it("skips a checked to-do", async () => {
    const done = { ...daily, doneAt: new Date("2026-10-19T12:00:00Z") };
    expect((await run(NOW, [done])).count).toBe(0);
  });

  it("skips one checked in a To-dos block that date", async () => {
    const { count } = await run(NOW, [daily], memoryPush(), [
      { todoId: daily.id, onDate: "2026-10-19" },
    ]);
    expect(count).toBe(0);
  });

  it("skips an archived one", async () => {
    const archived = { ...daily, archivedAt: new Date("2026-10-18T12:00:00Z") };
    expect((await run(NOW, [archived])).count).toBe(0);
  });
});
