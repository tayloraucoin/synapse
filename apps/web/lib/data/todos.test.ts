import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { todoReminderPayload } from "@/components/planner/todos-tray/reminder";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { TRAY_IDS } from "@/lib/fixtures/scenarios/todos-tray";
import { createFixtureServer } from "@/lib/fixtures/server";
import { todayRoute } from "@/lib/routes";
import { todayQueryKey } from "./use-today";
import {
  deriveTray,
  newTodo,
  todosQueryKey,
  writeBox,
  type TodosRecords,
} from "./use-todos";

/**
 * The tray's data against the fixture server (USE-19), read back through
 * `deriveTray` as the tray reads it, and its writes as `useTodos` makes them.
 */
function setup(name = "todos-open", at = "07:14") {
  const nowMs = Date.parse(onNowDay(at));
  const now = () => new Date(nowMs);
  const server = createFixtureServer(resolveScenario(name), now);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const read = async () => deriveTray(await server.readTodos(BASE_DATE), now());
  return { server, now, queryClient, read };
}

describe("the tray on Taylor's Monday", () => {
  it("reads the mechanic at 10:00, then Library books from Sunday", async () => {
    const { read } = setup();
    expect(
      (await read()).map((row) => [
        row.title,
        row.reminderAt,
        row.carriedLabel,
        row.checked,
      ]),
    ).toEqual([
      ["Call the mechanic", "10:00", null, false],
      ["Library books", null, "From Sunday", false],
    ]);
  });

  it("is empty with no to-dos", async () => {
    const { read } = setup("todos-empty");
    expect(await read()).toEqual([]);
  });

  it("a reminder's payload is the title alone and opens Now on the to-do", () => {
    const payload = todoReminderPayload({
      id: TRAY_IDS.mechanic,
      title: "Call the mechanic",
    });
    expect(payload.body).toBe("Call the mechanic");
    expect(payload.url).toBe(todayRoute({ todo: TRAY_IDS.mechanic }));
    expect(payload.url).toBe(`/today?todo=${TRAY_IDS.mechanic}`);
  });
});

describe("C6: Add, a failed list and a failed check", () => {
  it("Add writes a to-do with no day, no reminder, no repeat and type Other", async () => {
    const { server, read } = setup();
    const record = await server.writeTodo(newTodo("Return the drill"));
    expect(record).toMatchObject({
      title: "Return the drill",
      type: "other",
      onDate: null,
      remindAt: null,
      remindOn: null,
      rrule: null,
      doneAt: null,
    });
    const rows = await read();
    expect(rows.map((row) => row.title)).toContain("Return the drill");
    // Undated and new: it sits after the older ones, with nothing beside it.
    expect(rows.at(-1)).toMatchObject({
      title: "Return the drill",
      reminderAt: null,
      carriedLabel: null,
    });
  });

  it("when the to-dos fail, the block's read still settles; Try again refetches only the to-dos", async () => {
    const { server, queryClient } = setup("todos-error");
    const today = todayQueryKey("todos-error", BASE_DATE);
    const todos = todosQueryKey("todos-error", BASE_DATE);

    await expect(
      queryClient.fetchQuery({
        queryKey: today,
        queryFn: () => server.readToday(BASE_DATE),
      }),
    ).resolves.toMatchObject({ date: BASE_DATE });
    await expect(
      queryClient.fetchQuery({
        queryKey: todos,
        queryFn: () => server.readTodos(BASE_DATE),
      }),
    ).rejects.toThrow("The to-dos could not be read.");

    // Try again, as `useTodos().retry` makes it.
    let todayReads = 0;
    queryClient.setQueryDefaults(today, {
      queryFn: () => {
        todayReads += 1;
        return server.readToday(BASE_DATE);
      },
    });
    const todayBefore = queryClient.getQueryState(today)?.dataUpdatedAt;
    server.recoverTodos();
    await queryClient.fetchQuery({
      queryKey: todos,
      queryFn: () => server.readTodos(BASE_DATE),
    });
    expect(queryClient.getQueryState(todos)?.status).toBe("success");
    expect(todayReads).toBe(0);
    expect(queryClient.getQueryState(today)?.dataUpdatedAt).toBe(todayBefore);
  });

  it("the to-dos never settle while loading, and the day reads", async () => {
    const { server } = setup("todos-loading");
    await expect(server.readToday(BASE_DATE)).resolves.toMatchObject({
      date: BASE_DATE,
    });
    const settled = await Promise.race([
      server.readTodos(BASE_DATE).then(() => "settled"),
      new Promise((resolve) => setTimeout(() => resolve("waiting"), 20)),
    ]);
    expect(settled).toBe("waiting");
  });

  it("a failed check reverts the box; the same write then saves", async () => {
    const { server, queryClient, now } = setup("todos-check-error");
    const queryKey = todosQueryKey("todos-check-error", BASE_DATE);
    await queryClient.fetchQuery({
      queryKey,
      queryFn: () => server.readTodos(BASE_DATE),
    });
    const boxOf = () =>
      deriveTray(queryClient.getQueryData<TodosRecords>(queryKey)!, now()).find(
        (row) => row.id === TRAY_IDS.mechanic,
      )?.checked;

    const write = {
      queryClient,
      server,
      queryKey,
      id: TRAY_IDS.mechanic,
      at: now(),
    };
    // The write held open: the box shows the change before it lands.
    let land: () => void = () => {};
    const held = writeBox({
      ...write,
      checked: true,
      server: {
        writeTodoDone: (input) =>
          new Promise((resolve, reject) => {
            land = () => void server.writeTodoDone(input).then(resolve, reject);
          }),
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(boxOf()).toBe(true);
    land();
    // `failWrites` rejects it once: the box reverts.
    expect(await held).toBe(false);
    expect(boxOf()).toBe(false);

    // Try again: the write goes through and the box stays checked.
    expect(await writeBox({ ...write, checked: true })).toBe(true);
    expect(boxOf()).toBe(true);
    const stored = (await server.readTodos(BASE_DATE)).todos.find(
      (todo) => todo.id === TRAY_IDS.mechanic,
    );
    expect(stored?.doneAt).not.toBeNull();
  });

  it("a checked to-do stays in the tray, checked, for the rest of the day", async () => {
    const { server, read, now } = setup();
    await server.writeTodoDone({
      id: TRAY_IDS.books,
      doneAt: now().toISOString(),
    });
    expect(
      (await read()).find((row) => row.id === TRAY_IDS.books),
    ).toMatchObject({ checked: true, carriedLabel: "From Sunday" });
  });

  it("offline, the to-dos write as online", async () => {
    const { server, read, now } = setup("todos-offline");
    await server.writeTodoDone({
      id: TRAY_IDS.mechanic,
      doneAt: now().toISOString(),
    });
    expect((await read())[0]?.checked).toBe(true);
  });
});
