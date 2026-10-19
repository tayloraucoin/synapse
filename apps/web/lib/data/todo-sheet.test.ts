import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { todoRepeatOptions } from "@syn/utils";
import {
  notesWrite,
  reminderSwitchWrite,
  reminderTimeWrite,
  titleWrite,
} from "@/components/planner/todo-sheet/fields";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { TODO_SHEET_IDS } from "@/lib/fixtures/scenarios/todo-sheet";
import { createFixtureServer } from "@/lib/fixtures/server";
import { reminderAvailability } from "@/lib/pwa/reminder-availability";
import { todosQueryKey, writeTodoPatch, type TodosRecords } from "./use-todos";

/**
 * The To-do sheet's writes (USE-28) against the fixture server, as
 * `useTodos().update` makes them, and what each field decides to write.
 */
const ID = TODO_SHEET_IDS.mechanic;

function setup(name = "todo-sheet", at = "07:14") {
  const now = () => new Date(Date.parse(onNowDay(at)));
  const server = createFixtureServer(resolveScenario(name), now);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const queryKey = todosQueryKey(name, BASE_DATE);
  const load = async () =>
    queryClient.setQueryData(queryKey, await server.readTodos(BASE_DATE));
  const cached = () =>
    queryClient
      .getQueryData<TodosRecords>(queryKey)
      ?.todos.find((todo) => todo.id === ID);
  const stored = async () =>
    (await server.readTodos(BASE_DATE)).todos.find((todo) => todo.id === ID);
  return { server, queryClient, queryKey, load, cached, stored };
}

describe("C6: a repeating to-do checked", () => {
  it("writes a new to-do due the next Monday; the checked one stays done", async () => {
    const { server } = setup();
    const weekly = todoRepeatOptions(BASE_DATE)[2]!.rrule!;
    await server.updateTodo({ id: ID, patch: { rrule: weekly } });
    await server.writeTodoDone({ id: ID, doneAt: onNowDay("09:00") });

    const todos = (await server.readTodos(BASE_DATE)).todos;
    const done = todos.find((todo) => todo.id === ID)!;
    const next = todos.filter(
      (todo) => todo.id !== ID && todo.title === "Call the mechanic",
    );
    expect(done.doneAt).not.toBeNull();
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({
      onDate: "2026-10-19",
      doneAt: null,
      rrule: weekly,
      type: "call",
      notes: done.notes,
    });
  });

  it("a to-do that does not repeat writes nothing more", async () => {
    const { server } = setup();
    const before = (await server.readTodos(BASE_DATE)).todos.length;
    await server.writeTodoDone({ id: ID, doneAt: onNowDay("09:00") });
    expect((await server.readTodos(BASE_DATE)).todos).toHaveLength(before);
  });
});

describe("C7: each field writes once as it changes", () => {
  it("a select writes once, and the to-do reads it back", async () => {
    const { server, queryClient, queryKey, load, cached, stored } = setup();
    await load();
    const update = vi.spyOn(server, "updateTodo");
    const saved = await writeTodoPatch({
      queryClient,
      server,
      queryKey,
      id: ID,
      patch: { type: "errand" },
    });
    expect(saved).toBe(true);
    expect(update).toHaveBeenCalledTimes(1);
    expect(cached()?.type).toBe("errand");
    expect((await stored())?.type).toBe("errand");
  });

  it("the reminder writes remindOn and remindAt; off clears both", async () => {
    const { server, stored } = setup();
    const on = reminderSwitchWrite({
      on: true,
      nowMinutes: 7 * 60 + 14,
      todayKey: BASE_DATE,
      tomorrowKey: "2026-10-13",
    });
    expect(on).toEqual({ remindOn: BASE_DATE, remindAt: "08:00" });
    await server.updateTodo({ id: ID, patch: on });
    expect(await stored()).toMatchObject(on);

    const time = reminderTimeWrite("12:30", (await stored())!, BASE_DATE);
    expect(time).toEqual({ remindOn: BASE_DATE, remindAt: "12:30" });
    await server.updateTodo({ id: ID, patch: time! });
    expect(await stored()).toMatchObject({ remindAt: "12:30" });

    const off = reminderSwitchWrite({
      on: false,
      nowMinutes: 0,
      todayKey: BASE_DATE,
      tomorrowKey: "2026-10-13",
    });
    await server.updateTodo({ id: ID, patch: off });
    expect(await stored()).toMatchObject({ remindOn: null, remindAt: null });
    // The to-do keeps no day of its own.
    expect((await stored())?.onDate).toBeNull();
  });

  it("switched on late at night lands at midnight tomorrow", () => {
    expect(
      reminderSwitchWrite({
        on: true,
        nowMinutes: 23 * 60 + 40,
        todayKey: BASE_DATE,
        tomorrowKey: "2026-10-13",
      }),
    ).toEqual({ remindOn: "2026-10-13", remindAt: "00:00" });
  });

  it("nothing is written when nothing changed", async () => {
    const { stored } = setup();
    const todo = (await stored())!;
    expect(titleWrite(" Call the mechanic ", todo)).toEqual({ kind: "none" });
    expect(titleWrite("", todo)).toEqual({ kind: "none" });
    expect(notesWrite(todo.notes ?? "", todo)).toBeNull();
    expect(
      reminderTimeWrite(
        "12:30",
        { remindOn: null, remindAt: "12:30" },
        BASE_DATE,
      ),
    ).toBeNull();
    expect(titleWrite("Call Dave", todo)).toEqual({
      kind: "update",
      patch: { title: "Call Dave" },
    });
    expect(notesWrite("  ", todo)).toEqual({ notes: null });
  });

  it("a failed write reverts its field", async () => {
    const { server, queryClient, queryKey, load, cached, stored } =
      setup("todo-sheet-error");
    await load();
    const saved = await writeTodoPatch({
      queryClient,
      server,
      queryKey,
      id: ID,
      patch: { type: "home" },
    });
    expect(saved).toBe(false);
    expect(cached()?.type).toBe("call");
    expect((await stored())?.type).toBe("call");
    // Try again goes through.
    expect(
      await writeTodoPatch({
        queryClient,
        server,
        queryKey,
        id: ID,
        patch: { type: "home" },
      }),
    ).toBe(true);
    expect((await stored())?.type).toBe("home");
  });

  it("a new sheet creates the to-do only once a title is typed", () => {
    expect(titleWrite("", null)).toEqual({ kind: "none" });
    expect(titleWrite("   ", null)).toEqual({ kind: "none" });
    expect(titleWrite("Sort the pantry", null)).toEqual({
      kind: "create",
      title: "Sort the pantry",
    });
  });

  it("offline, a change saves as online", async () => {
    const { server, stored } = setup("todo-sheet-offline");
    await server.updateTodo({ id: ID, patch: { notes: "Ask for Dave" } });
    expect((await stored())?.notes).toBe("Ask for Dave");
  });
});

describe("C7: reminderAvailability", () => {
  it("is not-installed in an iPhone browser, whatever the permission", () => {
    expect(
      reminderAvailability({
        ios: true,
        standalone: false,
        permission: "granted",
      }),
    ).toBe("not-installed");
  });

  it("is notifications-off when installed and not allowed", () => {
    expect(
      reminderAvailability({
        ios: true,
        standalone: true,
        permission: "denied",
      }),
    ).toBe("notifications-off");
    expect(
      reminderAvailability({
        ios: false,
        standalone: false,
        permission: "default",
      }),
    ).toBe("notifications-off");
  });

  it("is available once allowed", () => {
    expect(
      reminderAvailability({
        ios: true,
        standalone: true,
        permission: "granted",
      }),
    ).toBe("available");
    expect(
      reminderAvailability({
        ios: false,
        standalone: false,
        permission: "granted",
      }),
    ).toBe("available");
  });
});
