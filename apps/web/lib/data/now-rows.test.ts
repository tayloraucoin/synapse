import { describe, expect, it } from "vitest";
import { addDays } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { NOW_IDS, onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import {
  deriveNow,
  moveIds,
  undoNotToday,
  writeNotToday,
  writeReorder,
} from "./use-now";

const I = NOW_IDS.items;
const PLACE = { dateKey: BASE_DATE, blockId: NOW_IDS.blocks.wellness };

/**
 * Now's row writes (USE-18) against the fixture server, read back through
 * `deriveNow` as the screen reads them: Not today and every reorder change
 * the date's slots only, never the block's items.
 */
function setup() {
  const server = createFixtureServer(
    resolveScenario("success"),
    () => new Date(Date.parse(onNowDay("07:14"))),
  );
  async function read(dateKey = BASE_DATE, chosenId: string | null = null) {
    const at = new Date(Date.parse(`${dateKey}T07:14:00-04:00`));
    return deriveNow(
      deriveToday(await server.readToday(dateKey)),
      at,
      chosenId,
    );
  }
  async function records() {
    return server.readToday(BASE_DATE);
  }
  return { server, read, records };
}

const titles = (view: { items: { title: string }[] }) =>
  view.items.map((item) => item.title);

describe("Not today (C-USE-now-row-long-press-2, D-USE-70)", () => {
  it("skips the set item's slot for today; the next day keeps it; Undo brings it back", async () => {
    const { server, read, records } = setup();
    const before = await records();
    const coldBath = (await read()).items.find(
      (item) => item.id === I.coldBath,
    )!;

    const undo = await writeNotToday(server, PLACE, coldBath);

    const after = await records();
    const slot = after.slots.find((row) => row.blockItemId === I.coldBath);
    expect(slot).toMatchObject({ onDate: BASE_DATE, skipped: true });
    expect(after.blockItems).toEqual(before.blockItems);
    expect(after.blocks).toEqual(before.blocks);
    expect(titles(await read())).not.toContain("Cold bath");
    expect(titles(await read(addDays(BASE_DATE, 1)))).toContain("Cold bath");

    await undoNotToday(server, undo);
    expect(titles(await read())).toContain("Cold bath");
    // Not today placed the slot, so its Undo removes it: the day is as it was.
    expect((await records()).slots).toEqual(before.slots);
  });

  it("on a slot touched before, Undo keeps its other fields and sets skipped false", async () => {
    const { server, read, records } = setup();
    const start = await read();
    // Dropped above the card first: the slot is placed with its new order.
    await writeReorder(server, PLACE, start.items, [
      I.peeAndWeigh,
      I.water,
      I.startColdBath,
      I.coldBath,
      I.meditate,
    ]);
    const touched = (await read()).items.find(
      (item) => item.id === I.coldBath,
    )!;
    expect(touched.slotId).not.toBeNull();

    const undo = await writeNotToday(server, PLACE, touched);
    expect(undo).toEqual({ kind: "unskip", slotId: touched.slotId });
    await undoNotToday(server, undo);

    const slot = (await records()).slots.find(
      (row) => row.id === touched.slotId,
    );
    expect(slot).toMatchObject({ skipped: false, sortOrder: 3 });
  });
});

describe("Reorder (C-USE-now-reordering-2, D-USE-26)", () => {
  it("a row dropped above the lifted card is next up; the current item stays current", async () => {
    const { server, read, records } = setup();
    const before = await records();
    const start = await read();
    expect(start.current?.title).toBe("Meditate");

    await writeReorder(server, PLACE, start.items, [
      I.peeAndWeigh,
      I.water,
      I.startColdBath,
      I.coldBath,
      I.meditate,
    ]);

    // The screen pins the current item on a reorder (chosenId), as a tap does.
    const view = await read(BASE_DATE, start.current!.id);
    expect(titles(view)).toEqual([
      "Pee and weigh",
      "Water",
      "Start the cold bath",
      "Cold bath",
      "Meditate",
    ]);
    expect(view.current?.title).toBe("Meditate");
    expect(view.next?.title).toBe("Cold bath");

    const after = await records();
    expect(after.blockItems).toEqual(before.blockItems);
    expect(after.slots.every((slot) => slot.onDate === BASE_DATE)).toBe(true);
    // The usual week is untouched: the next day keeps the usual order.
    expect(titles(await read(addDays(BASE_DATE, 1)))).toEqual([
      "Pee and weigh",
      "Water",
      "Start the cold bath",
      "Meditate",
      "Cold bath",
    ]);
  });

  it("Move up and Move down move one place among the undone rows, disabled at the ends", async () => {
    const { server, read, records } = setup();
    const before = await records();
    const start = await read();

    expect(moveIds(start.items, I.meditate, -1)).toBeNull();
    expect(moveIds(start.items, I.coldBath, 1)).toBeNull();
    const up = moveIds(start.items, I.coldBath, -1)!;
    expect(up).toEqual(moveIds(start.items, I.meditate, 1));
    expect(up).toEqual([
      I.peeAndWeigh,
      I.water,
      I.startColdBath,
      I.coldBath,
      I.meditate,
    ]);

    await writeReorder(server, PLACE, start.items, up);
    const view = await read(BASE_DATE, start.current!.id);
    expect(titles(view).slice(3)).toEqual(["Cold bath", "Meditate"]);
    expect(view.current?.title).toBe("Meditate");
    expect((await records()).blockItems).toEqual(before.blockItems);

    const back = moveIds(view.items, I.coldBath, 1)!;
    await writeReorder(server, PLACE, view.items, back);
    expect(titles(await read()).slice(3)).toEqual(["Meditate", "Cold bath"]);
  });
});
