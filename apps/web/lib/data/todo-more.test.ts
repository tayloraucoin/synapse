import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
  giveADayWrite,
  remindOnWrite,
} from "@/components/planner/todo-sheet/fields";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { ERRANDS_IDS } from "@/lib/fixtures/scenarios/now-system";
import { TODO_SHEET_IDS } from "@/lib/fixtures/scenarios/todo-sheet";
import { createFixtureServer, TodoWriteRefusal } from "@/lib/fixtures/server";
import {
  todosQueryKey,
  writeBox,
  writeRemove,
  type TodosRecords,
} from "./use-todos";

/**
 * The To-do sheet's ··· (USE-29) against the fixture server, as `useTodos`
 * writes it: Delete to-do and its Undo, Mark done and its Undo, and the
 * month step's two days.
 */
function setup(name: string, at: string) {
  const now = () => new Date(Date.parse(onNowDay(at)));
  const server = createFixtureServer(resolveScenario(name), now);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const queryKey = todosQueryKey(name, BASE_DATE);
  const load = async () =>
    queryClient.setQueryData(queryKey, await server.readTodos(BASE_DATE));
  return { server, queryClient, queryKey, load, now };
}

describe("C4: Delete to-do and Mark done, each with Undo", () => {
  // Errands at 11:22: "Return the parcel" sits in the To-dos block's slot.
  const PARCEL = ERRANDS_IDS.todos.parcel;

  it("Delete takes the to-do and every slot that took it; Undo brings both back as they were", async () => {
    const { server, queryClient, queryKey, load } = setup(
      "todos-block",
      "11:22",
    );
    await load();
    const before = await server.readToday(BASE_DATE);
    const beforeSlots = before.slots.filter((slot) => slot.todoId === PARCEL);
    expect(beforeSlots.length).toBeGreaterThan(0);

    const removed = await writeRemove({
      queryClient,
      server,
      queryKey,
      id: PARCEL,
    });
    expect(removed).not.toBeNull();
    expect(removed!.slots.map((slot) => slot.id).sort()).toEqual(
      beforeSlots.map((slot) => slot.id).sort(),
    );

    // Gone from the tray (the cache and the server) and from the block.
    const cached = queryClient.getQueryData<TodosRecords>(queryKey)!;
    expect(cached.todos.some((todo) => todo.id === PARCEL)).toBe(false);
    expect(cached.slots.some((slot) => slot.todoId === PARCEL)).toBe(false);
    const gone = await server.readToday(BASE_DATE);
    expect(gone.todos.some((todo) => todo.id === PARCEL)).toBe(false);
    expect(gone.slots.some((slot) => slot.todoId === PARCEL)).toBe(false);

    await server.restoreTodo(removed!);
    const back = await server.readToday(BASE_DATE);
    expect(back.todos.find((todo) => todo.id === PARCEL)).toEqual(
      before.todos.find((todo) => todo.id === PARCEL),
    );
    expect(back.slots.filter((slot) => slot.todoId === PARCEL)).toEqual(
      beforeSlots,
    );
    expect(back.slotEvents).toEqual(before.slotEvents);
  });

  it("Undo twice puts it back once", async () => {
    const { server } = setup("todos-block", "11:22");
    const removed = await server.removeTodo(PARCEL);
    await server.restoreTodo(removed);
    await server.restoreTodo(removed);
    const todos = (await server.readTodos(BASE_DATE)).todos;
    expect(todos.filter((todo) => todo.id === PARCEL)).toHaveLength(1);
  });

  it("a delete that fails puts the to-do back in the tray", async () => {
    const id = TODO_SHEET_IDS.mechanic;
    const { server, queryClient, queryKey, load } = setup(
      "todo-sheet-error",
      "07:14",
    );
    await load();
    const removed = await writeRemove({ queryClient, server, queryKey, id });
    expect(removed).toBeNull();
    const cached = queryClient.getQueryData<TodosRecords>(queryKey)!;
    expect(cached.todos.some((todo) => todo.id === id)).toBe(true);
  });

  it("Mark done sets doneAt; Undo clears it", async () => {
    const id = TODO_SHEET_IDS.mechanic;
    const { server, queryClient, queryKey, load, now } = setup(
      "more-open",
      "07:14",
    );
    await load();
    const stored = async () =>
      (await server.readTodos(BASE_DATE)).todos.find((todo) => todo.id === id)!;

    expect(
      await writeBox({
        queryClient,
        server,
        queryKey,
        id,
        checked: true,
        at: now(),
      }),
    ).toBe(true);
    expect((await stored()).doneAt).toBe(now().toISOString());

    expect(
      await writeBox({
        queryClient,
        server,
        queryKey,
        id,
        checked: false,
        at: now(),
      }),
    ).toBe(true);
    expect((await stored()).doneAt).toBeNull();
  });
});

describe("C5: the month step's two days", () => {
  const ID = TODO_SHEET_IDS.mechanic;
  // Monday the 12th; the reminder is set for today at 12:30.
  const reminding = () => setup("reminder-on", "07:14");
  const stored = async (server: ReturnType<typeof reminding>["server"]) =>
    (await server.readTodos(BASE_DATE)).todos.find((todo) => todo.id === ID)!;

  it("Give it a day… sets onDate and leaves remindOn alone", async () => {
    const { server } = reminding();
    const before = await stored(server);
    const patch = giveADayWrite("2026-10-15", before, BASE_DATE);
    expect(patch).toEqual({ onDate: "2026-10-15" });
    await server.updateTodo({ id: ID, patch: patch! });
    const after = await stored(server);
    expect(after.onDate).toBe("2026-10-15");
    expect(after.remindOn).toBe(before.remindOn);
    expect(after.remindAt).toBe(before.remindAt);
  });

  it("Pick a day… in the At row sets remindOn and leaves onDate alone", async () => {
    const { server } = reminding();
    const before = await stored(server);
    const patch = remindOnWrite("2026-10-16", before, BASE_DATE);
    expect(patch).toEqual({ remindOn: "2026-10-16" });
    await server.updateTodo({ id: ID, patch: patch! });
    const after = await stored(server);
    expect(after.remindOn).toBe("2026-10-16");
    expect(after.onDate).toBe(before.onDate);
  });

  it("a day before today is refused, by the step and by the server", async () => {
    const { server } = reminding();
    const before = await stored(server);
    expect(giveADayWrite("2026-10-11", before, BASE_DATE)).toBeNull();
    expect(remindOnWrite("2026-10-11", before, BASE_DATE)).toBeNull();
    for (const patch of [
      { onDate: "2026-10-11" },
      { remindOn: "2026-10-11" },
    ]) {
      await expect(server.updateTodo({ id: ID, patch })).rejects.toMatchObject({
        reason: "past-day",
      } satisfies Partial<TodoWriteRefusal>);
    }
    expect(await stored(server)).toEqual(before);
  });

  it("today itself can be given", () => {
    expect(giveADayWrite(BASE_DATE, { onDate: null }, BASE_DATE)).toEqual({
      onDate: BASE_DATE,
    });
  });
});
