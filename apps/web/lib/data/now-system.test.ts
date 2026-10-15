import { describe, expect, it } from "vitest";
import { clockAt, todoPool } from "@syn/utils";
import { NOW_COPY } from "@/app/(shell)/today/_components/now/copy";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { NOW_IDS } from "@/lib/fixtures/scenarios/now-day";
import { ERRANDS_IDS } from "@/lib/fixtures/scenarios/now-system";
import { createFixtureServer, FixtureWriteError } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { deriveRunning, isRunningCard, slotEventFor } from "./running";
import {
  deriveNow,
  doneChange,
  writeRowChange,
  type NowItemView,
} from "./use-now";
import { deriveTray } from "./use-todos";

/**
 * Now's To-dos block and system states (USE-21) on the fixture server, read
 * back as the screen and the tray read them: `deriveNow`, `deriveTray`
 * (`trayTodos`), `todoPool` and `deriveClock` through `deriveRunning`.
 */

/** An instant on the Monday, `HH:MM` in Toronto. */
function at(time: string) {
  return new Date(`${BASE_DATE}T${time}:00-04:00`);
}

function setup(name: string) {
  const scenario = resolveScenario(name);
  let nowMs = Date.parse(scenario.now);
  const now = () => new Date(nowMs);
  const server = createFixtureServer(scenario, now);
  async function read() {
    const today = deriveToday(await server.readToday(BASE_DATE));
    const view = deriveNow(today, now(), null);
    return { today, view, running: deriveRunning(today, view) };
  }
  async function tray() {
    return deriveTray(await server.readTodos(BASE_DATE), now());
  }
  /** A row's box, as `useSlotWrites` writes it: placed on first touch. */
  async function check(blockId: string, item: NowItemView, done = true) {
    const slotId =
      item.slotId ??
      (
        await server.writeSlots({
          blockId,
          onDate: BASE_DATE,
          sortOrder: item.sortOrder,
          blockItemId: item.blockItemId,
        })
      ).id;
    return writeRowChange(
      server,
      slotId,
      item,
      done ? doneChange(item, now()) : { doneAt: null, tookMin: null },
    );
  }
  return {
    server,
    read,
    tray,
    check,
    set: (time: string) => {
      nowMs = at(time).getTime();
    },
  };
}

/** Settles, or reports "waiting" after a tick: a loading read never settles. */
function settled(promise: Promise<unknown>) {
  return Promise.race([
    promise.then(
      () => "ok",
      () => "error",
    ),
    new Promise((resolve) => setTimeout(() => resolve("waiting"), 20)),
  ]);
}

describe("C6: a To-dos block runs like any block", () => {
  it("Errands at 11:22: three done to-dos, Return the parcel lifted at 11:20, made Tue", async () => {
    const { view } = await setup("todos-block").read();
    expect(view.block).toMatchObject({
      kind: "todos",
      name: "Errands",
      form: "items",
    });
    expect(NOW_COPY.todosSpan(view.block!.startsAt, view.block!.endsAt)).toBe(
      "To-dos · 10:00 to 12:30",
    );
    expect(
      view.items.map((item) => [item.title, item.done, item.lengthMin]),
    ).toEqual([
      ["Drop off the dry cleaning", true, 20],
      ["Call the mechanic", true, 15],
      ["Groceries", true, 45],
      ["Return the parcel", false, 15],
      ["Pick up the prescription", false, 10],
    ]);
    expect(view.items.every((item) => item.source === "todo")).toBe(true);
    expect(view.items[0]?.icon).toEqual({ kind: "emoji", value: "🧥" });
    expect(view.current).toMatchObject({
      title: "Return the parcel",
      plannedAt: "11:20",
      madeOn: "2026-10-06",
    });
    expect(NOW_COPY.todoSince(view.current!.madeOn!, BASE_DATE)).toBe(
      "a to-do since Tue",
    );
    expect(view.next?.title).toBe("Pick up the prescription");
  });

  it("the tray holds what the block did not pull, never the block's own", async () => {
    const titles = (await setup("todos-block").tray()).map((row) => row.title);
    expect(titles).toEqual(["Repot the fern", "Clean the fridge"]);
  });

  it("checking a to-do row sets the to-do's doneAt and it never shows in the tray", async () => {
    const { server, read, tray, check } = setup("todos-block");
    const parcel = (await read()).view.current!;
    await check(ERRANDS_IDS.block, parcel);

    const todos = await server.readTodos(BASE_DATE);
    const todo = todos.todos.find((row) => row.id === ERRANDS_IDS.todos.parcel);
    expect(todo?.doneAt).not.toBeNull();
    expect((await read()).view.items[3]).toMatchObject({ done: true });
    expect((await tray()).map((row) => row.id)).not.toContain(
      ERRANDS_IDS.todos.parcel,
    );

    // Unchecked, both clear and the block holds it again.
    await check(ERRANDS_IDS.block, { ...parcel, done: true }, false);
    const back = await server.readTodos(BASE_DATE);
    expect(
      back.todos.find((row) => row.id === ERRANDS_IDS.todos.parcel)?.doneAt,
    ).toBeNull();
    expect((await read()).view.current?.title).toBe("Return the parcel");
  });

  it("at the block's end an undone to-do is back in To-dos with no day", async () => {
    const { server, tray, set } = setup("todos-block");
    set("12:31");
    const records = await server.readTodos(BASE_DATE);
    const ends = new Map([[ERRANDS_IDS.block, at("12:30")]]);
    const pool = todoPool({
      todos: records.todos,
      slots: records.slots.map((slot) => ({
        todoId: slot.todoId,
        onDate: slot.onDate,
        doneAt: slot.doneAt,
        blockEnd: ends.get(slot.blockId)!,
      })),
      now: at("12:31"),
    });
    const ids = pool.map((entry) => entry.todoId);
    expect(ids).toContain(ERRANDS_IDS.todos.parcel);
    expect(ids).toContain(ERRANDS_IDS.todos.prescription);
    expect(ids).not.toContain(ERRANDS_IDS.todos.groceries);
    const prescription = records.todos.find(
      (row) => row.id === ERRANDS_IDS.todos.prescription,
    );
    expect(prescription?.onDate).toBeNull();
    // Derived, never written: the tray shows it, and the to-do has no day.
    expect((await tray()).map((row) => row.title)).toContain(
      "Pick up the prescription",
    );
  });

  it("offline, a Start lands and deriveClock reads it running; the count runs", async () => {
    const { server, read, set } = setup("offline");
    const meditate = (await read()).view.current!;
    expect(meditate.title).toBe("Meditate");
    const slot = await server.writeSlots({
      blockId: NOW_IDS.blocks.wellness,
      onDate: BASE_DATE,
      sortOrder: meditate.sortOrder,
      blockItemId: meditate.blockItemId,
    });
    await server.writeSlotEvents([
      slotEventFor(slot.id, "started", at("07:14")),
    ]);
    set("07:17");
    const { running } = await read();
    const clock = running.clocks.get(NOW_IDS.items.meditate);
    expect(isRunningCard(clock)).toBe(true);
    expect(clock?.state).toBe("running");
    expect(clockAt(clock!, at("07:17"), running.dayEnd).workMs).toBe(180_000);
  });

  it("offline, a box still saves", async () => {
    const { read, check } = setup("offline");
    const coldBath = (await read()).view.items.find(
      (item) => item.title === "Cold bath",
    )!;
    await check(NOW_IDS.blocks.wellness, coldBath);
    const after = (await read()).view.items.find(
      (item) => item.title === "Cold bath",
    );
    expect(after?.done).toBe(true);
  });
});

describe("C7: a failed check, and each region on its own", () => {
  it("a write named in failWrites rejects once: the box reads unchecked; Try again checks it", async () => {
    const { read, check } = setup("error-on-check");
    const coldBath = (await read()).view.items.find(
      (item) => item.title === "Cold bath",
    )!;
    await expect(
      check(NOW_IDS.blocks.wellness, coldBath),
    ).rejects.toBeInstanceOf(FixtureWriteError);
    // The slot was placed; its change did not land.
    const failed = (await read()).view.items.find(
      (item) => item.title === "Cold bath",
    )!;
    expect(failed.done).toBe(false);
    expect(failed.slotId).not.toBeNull();

    // Try again: the same write once more.
    await check(NOW_IDS.blocks.wellness, failed);
    const saved = (await read()).view.items.find(
      (item) => item.title === "Cold bath",
    );
    expect(saved?.done).toBe(true);
  });

  it("the words are ink sentences: Not saved, Try again", () => {
    expect(NOW_COPY.notSaved).toEqual({
      notSaved: "Not saved.",
      tryAgain: "Try again",
    });
    expect(NOW_COPY.offline).toBe("Offline. Checks are saved on this phone.");
  });

  it("the to-dos failing leaves the day's read settling", async () => {
    const { server } = setup("now-partial-todos");
    expect(await settled(server.readToday(BASE_DATE))).toBe("ok");
    expect(await settled(server.readTodos(BASE_DATE))).toBe("error");
    server.recoverTodos();
    expect(await settled(server.readTodos(BASE_DATE))).toBe("ok");
  });

  it("the block failing leaves the to-dos settling; its retry reads the day", async () => {
    const { server } = setup("now-partial-block");
    expect(await settled(server.readTodos(BASE_DATE))).toBe("ok");
    expect(await settled(server.readToday(BASE_DATE))).toBe("error");
    server.recover();
    expect(await settled(server.readToday(BASE_DATE))).toBe("ok");
  });

  it("loading: the block waits while the to-dos read", async () => {
    const { server } = setup("now-loading");
    expect(await settled(server.readToday(BASE_DATE))).toBe("waiting");
    expect(await settled(server.readTodos(BASE_DATE))).toBe("ok");
  });
});
