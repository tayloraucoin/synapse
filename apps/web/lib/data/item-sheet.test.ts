import { describe, expect, it } from "vitest";
import { addDays } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { ITEM_SHEET_IDS } from "@/lib/fixtures/scenarios/item-sheet";
import { NOW_IDS, onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import {
  deriveItemSheet,
  undoItemWrite,
  writeItemAtTime,
  writeItemLength,
  writeItemNotToday,
  writeMakeUsual,
  writeSwap,
} from "./use-item-sheet";

const MEDITATE = NOW_IDS.items.meditate;
const GYM = ITEM_SHEET_IDS.items.gym;
/** The Monday a week on: the usual week, untouched by a today-only edit. */
const NEXT_MONDAY = addDays(BASE_DATE, 7);

/**
 * The Item sheet's writes (USE-64, C1) against the fixture server, read back
 * through `deriveItemSheet` as the sheet reads them: each change is today's
 * only, the usual week moves only by Make it Monday's usual, and each Undo
 * puts back exactly what it changed.
 */
function setup(state = "item-default") {
  const server = createFixtureServer(
    resolveScenario(state),
    () => new Date(Date.parse(onNowDay("06:58"))),
  );
  async function sheet(id: string, date = BASE_DATE) {
    const view = deriveItemSheet(deriveToday(await server.readToday(date)), id);
    if (view === null) throw new Error(`No item ${id} on ${date}.`);
    return view;
  }
  return { server, sheet, records: () => server.readToday(BASE_DATE) };
}

describe("the sheet as read (C-USE-item-sheet-default-1)", () => {
  it("reads Meditate's scope, length and what it follows", async () => {
    const { sheet } = setup();
    const view = await sheet(MEDITATE);
    expect(view.block).toMatchObject({
      name: "Wellness",
      startsAt: "07:05",
      endsAt: "08:00",
    });
    expect(view.item).toMatchObject({
      title: "Meditate",
      lengthMin: 10,
      atTime: null,
      plannedAt: "07:12",
    });
    expect(view.previous).toEqual({ title: "Start the cold bath" });
  });

  it("lists only workouts in Swap, the current first, with where Training ends (C-USE-item-sheet-swap-1)", async () => {
    const { sheet } = setup("item-swap");
    const rows = (await sheet(GYM)).swap.map((row) => [
      row.title,
      row.lengthMin,
      row.startsAt,
      row.endsAt,
      row.current,
    ]);
    expect(rows).toEqual([
      ["Workout: gym", 35, "08:10", "08:55", true],
      ["Home workout", 25, "08:10", "08:45", false],
      ["Yoga", 30, "08:10", "08:50", false],
      ["Abs at home", 20, "08:10", "08:40", false],
    ]);
  });

  it("offers nothing else when the workout is the only one (C-USE-item-sheet-swap-empty-1)", async () => {
    const { sheet } = setup("item-swap-empty");
    const view = await sheet(GYM);
    expect(view.swap.map((row) => row.title)).toEqual(["Workout: gym"]);
  });
});

describe("Length (C1)", () => {
  it("writes the slot's length for today only, and Undo takes it back", async () => {
    const { server, sheet, records } = setup();
    const before = await records();

    const written = await writeItemLength(server, await sheet(MEDITATE), 15);

    const after = await records();
    const slot = after.slots.find((row) => row.blockItemId === MEDITATE);
    expect(slot).toMatchObject({ onDate: BASE_DATE, lengthMin: 15 });
    expect(after.blockItems).toEqual(before.blockItems);
    expect((await sheet(MEDITATE)).item.lengthMin).toBe(15);
    // Cold bath follows Meditate: it moves.
    const cold = await sheet(NOW_IDS.items.coldBath);
    expect(cold.item.plannedAt).toBe("07:27");
    expect((await sheet(MEDITATE, NEXT_MONDAY)).item.lengthMin).toBe(10);

    await undoItemWrite(server, written.undo);
    expect((await records()).slots).toEqual(before.slots);
    expect((await sheet(MEDITATE)).item.lengthMin).toBe(10);
  });

  it("changes a slot already placed, and Undo restores its length", async () => {
    const { server, sheet } = setup();
    await writeItemLength(server, await sheet(MEDITATE), 15);
    const second = await writeItemLength(server, await sheet(MEDITATE), 20);
    expect((await sheet(MEDITATE)).item.lengthMin).toBe(20);
    await undoItemWrite(server, second.undo);
    expect((await sheet(MEDITATE)).item.lengthMin).toBe(15);
  });
});

describe("At a set time (C1)", () => {
  it("pins 7:20 for today only, on today's own copy; the usual Monday is unchanged; Undo takes it back", async () => {
    const { server, sheet, records } = setup();
    const before = await records();

    const written = await writeItemAtTime(
      server,
      await sheet(MEDITATE),
      "07:20",
    );

    expect(written.id).not.toBe(MEDITATE);
    const today = await sheet(written.id);
    expect(today.item).toMatchObject({
      title: "Meditate",
      atTime: "07:20",
      plannedAt: "07:20",
      dated: true,
      lengthMin: 10,
    });
    const usual = before.blockItems.find((row) => row.id === MEDITATE);
    expect(
      (await records()).blockItems.find((row) => row.id === MEDITATE),
    ).toEqual(usual);
    expect((await sheet(MEDITATE, NEXT_MONDAY)).item.atTime).toBeNull();

    // A second change edits the copy; no second copy is made.
    const again = await writeItemAtTime(server, today, "07:25");
    expect(again.id).toBe(written.id);
    expect(
      (await records()).blockItems.filter((row) => row.title === "Meditate"),
    ).toHaveLength(2);

    await undoItemWrite(server, again.undo);
    await undoItemWrite(server, written.undo);
    const after = await records();
    expect(after.blockItems).toEqual(before.blockItems);
    expect(after.slots).toEqual(before.slots);
  });
});

describe("Make it Monday's usual (C1, C-USE-item-sheet-more-open-2)", () => {
  it("writes today's length to the block item; Undo puts the usual back", async () => {
    const { server, sheet, records } = setup();
    const before = await records();
    await writeItemLength(server, await sheet(MEDITATE), 15);

    const written = await writeMakeUsual(
      server,
      await records(),
      await sheet(MEDITATE),
    );

    expect((await sheet(MEDITATE, NEXT_MONDAY)).item.lengthMin).toBe(15);
    expect((await sheet(MEDITATE)).item).toMatchObject({
      lengthMin: 15,
      slotLengthMin: null,
    });
    await undoItemWrite(server, written.undo);
    expect((await sheet(MEDITATE, NEXT_MONDAY)).item.lengthMin).toBe(10);
    expect(
      (await records()).blockItems.find((row) => row.id === MEDITATE),
    ).toEqual(before.blockItems.find((row) => row.id === MEDITATE));
  });

  it("makes today's copy the usual item and the date reads the usual again", async () => {
    const { server, sheet, records } = setup();
    const before = await records();
    const pinned = await writeItemAtTime(
      server,
      await sheet(MEDITATE),
      "07:20",
    );

    const written = await writeMakeUsual(
      server,
      await records(),
      await sheet(pinned.id),
    );

    expect(written.id).toBe(MEDITATE);
    expect((await sheet(MEDITATE, NEXT_MONDAY)).item.atTime).toBe("07:20");
    expect((await sheet(MEDITATE)).item).toMatchObject({
      atTime: "07:20",
      dated: false,
    });
    expect(
      (await records()).blockItems.filter((row) => row.title === "Meditate"),
    ).toHaveLength(1);

    await undoItemWrite(server, written.undo);
    await undoItemWrite(server, pinned.undo);
    expect((await records()).blockItems).toEqual(before.blockItems);
  });
});

describe("Swap and Not today", () => {
  it("swaps Workout: gym for Yoga today only; the drives stay; Undo brings the gym back (C-USE-item-sheet-swap-2)", async () => {
    const { server, sheet, records } = setup("item-swap");
    const before = await records();
    const view = await sheet(GYM);
    const yoga = view.swap.find((row) => row.title === "Yoga")!;

    const written = await writeSwap(server, view, yoga);

    const swapped = await sheet(written.id);
    expect(swapped.item).toMatchObject({ title: "Yoga", lengthMin: 30 });
    expect(swapped.previous).toEqual({ title: "Drive to the YMCA" });
    const titles = (await records()).blockItems
      .filter((row) => row.blockId === NOW_IDS.blocks.training)
      .map((row) => row.title);
    expect(titles).toEqual(
      expect.arrayContaining(["Drive to the YMCA", "Drive home", "Yoga"]),
    );
    expect((await sheet(GYM, NEXT_MONDAY)).item.title).toBe("Workout: gym");

    await undoItemWrite(server, written.undo);
    const after = await records();
    expect(after.blockItems).toEqual(before.blockItems);
    expect(after.slots).toEqual(before.slots);
  });

  it("takes the item off today only, and Undo brings it back", async () => {
    const { server, sheet, records } = setup();
    const before = await records();
    const written = await writeItemNotToday(server, await sheet(MEDITATE));

    const slot = (await records()).slots.find(
      (row) => row.blockItemId === MEDITATE,
    );
    expect(slot).toMatchObject({ onDate: BASE_DATE, skipped: true });
    expect((await sheet(MEDITATE, NEXT_MONDAY)).item.title).toBe("Meditate");

    await undoItemWrite(server, written.undo);
    expect((await records()).slots).toEqual(before.slots);
  });
});
