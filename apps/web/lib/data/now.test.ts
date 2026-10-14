import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { NOW_IDS, onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { deriveNow, doneChange, type NowItemView } from "./use-now";

const I = NOW_IDS.items;

/**
 * Now's writes against the fixture server, read back through `deriveNow`
 * as the screen reads them. The writes are `useSlotWrites`' own: place a set
 * item's slot on first touch, then change it.
 */
function setup(name = "success", at = "07:14") {
  const nowMs = Date.parse(onNowDay(at));
  const now = () => new Date(nowMs);
  const server = createFixtureServer(resolveScenario(name), now);
  async function read(chosenId: string | null = null) {
    return deriveNow(
      deriveToday(await server.readToday(BASE_DATE)),
      now(),
      chosenId,
    );
  }
  async function slotFor(item: NowItemView) {
    if (item.slotId !== null) return item.slotId;
    const placed = await server.writeSlots({
      blockId: NOW_IDS.blocks.wellness,
      onDate: BASE_DATE,
      sortOrder: item.sortOrder,
      blockItemId: item.blockItemId,
    });
    return placed.id;
  }
  async function write(
    item: NowItemView,
    change: { doneAt?: string | null; tookMin?: number | null },
  ) {
    return server.writeSlots({ id: await slotFor(item), ...change });
  }
  const find = (view: Awaited<ReturnType<typeof read>>, id: string) =>
    view.items.find((item) => item.id === id)!;
  return { server, now, read, write, find };
}

describe("Now's view on Taylor's Monday", () => {
  it("is Wellness at 7:14, Meditate current at 7:10, Cold bath next at 7:20", async () => {
    const { read } = setup();
    const view = await read();
    expect(view.block).toMatchObject({
      name: "Wellness",
      startsAt: "07:05",
      endsAt: "08:00",
    });
    expect(
      view.items.map((item) => [item.title, item.done, item.plannedAt]),
    ).toEqual([
      ["Pee and weigh", true, "07:05"],
      ["Water", true, "07:07"],
      ["Start the cold bath", true, "07:08"],
      ["Meditate", false, "07:10"],
      ["Cold bath", false, "07:20"],
    ]);
    expect(view.current?.title).toBe("Meditate");
    expect(view.next?.title).toBe("Cold bath");
    expect(view.trayFirst).toBe("Call the mechanic about the brakes");
  });

  it("a tapped row is current and keeps its own planned start", async () => {
    const { read } = setup();
    const view = await read(I.coldBath);
    expect(view.current).toMatchObject({
      title: "Cold bath",
      plannedAt: "07:20",
    });
    expect(view.items.map((item) => item.title)[3]).toBe("Meditate");
  });
});

describe("C5: Done, a row's box, and unchecking", () => {
  it("Done writes doneAt and tookMin = the planned length and lifts the next undone item", async () => {
    const { read, write, find, now } = setup();
    const before = await read();
    const meditate = before.current!;
    const stored = await write(meditate, doneChange(meditate, now()));
    expect(stored).toMatchObject({
      blockItemId: I.meditate,
      doneAt: now().toISOString(),
      tookMin: 10,
    });
    const after = await read();
    expect(find(after, I.meditate)).toMatchObject({ done: true, tookMin: 10 });
    expect(after.current?.title).toBe("Cold bath");
  });

  it("a row's box completes it without lifting it", async () => {
    const { read, write, find, now } = setup();
    const before = await read();
    const coldBath = find(before, I.coldBath);
    await write(coldBath, doneChange(coldBath, now()));
    const after = await read();
    expect(find(after, I.coldBath)).toMatchObject({ done: true, tookMin: 10 });
    expect(after.current?.title).toBe("Meditate");
  });

  it("unchecking clears doneAt and tookMin, and the order lifts it again", async () => {
    const { read, write, find } = setup();
    const water = find(await read(), I.water);
    expect(water.done).toBe(true);
    await write(water, { doneAt: null, tookMin: null });
    const after = await read();
    expect(find(after, I.water)).toMatchObject({
      done: false,
      doneAt: null,
      tookMin: null,
    });
    expect(after.current?.title).toBe("Water");
  });

  it("a set item's slot is placed once; a second place is refused", async () => {
    const { server } = setup();
    const place = {
      blockId: NOW_IDS.blocks.wellness,
      onDate: BASE_DATE,
      sortOrder: 3,
      blockItemId: I.meditate,
    };
    await server.writeSlots(place);
    await expect(server.writeSlots(place)).rejects.toMatchObject({
      reason: "duplicate",
    });
  });
});

describe("C6: the time-taken sheet", () => {
  it("Save with 14 records tookMin 14", async () => {
    const { read, write, find } = setup();
    const startBath = find(await read(), I.startColdBath);
    await write(startBath, { tookMin: 14 });
    expect(find(await read(), I.startColdBath)).toMatchObject({
      done: true,
      tookMin: 14,
    });
  });

  it("× records nothing new: the planned length stands", async () => {
    const { read, find } = setup("time-taken-sheet");
    // Closing the sheet writes nothing; the read is what Done recorded.
    expect(find(await read(), I.startColdBath)).toMatchObject({
      done: true,
      tookMin: 2,
    });
  });
});
