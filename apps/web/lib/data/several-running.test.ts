import { describe, expect, it } from "vitest";
import { clockAt, formatCountdown, overBand } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { SEVERAL_IDS } from "@/lib/fixtures/scenarios/running";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import {
  deriveRunning,
  isTimedDone,
  runningGroup,
  runningRowFigure,
  settledLine,
  slotEventFor,
  timedDoneChange,
} from "./running";
import { deriveNow } from "./use-now";

const I = SEVERAL_IDS.items;
const S = SEVERAL_IDS.slots;

/** An instant on the Monday, `HH:MM:SS` in Toronto. */
function at(time: string) {
  return new Date(`${BASE_DATE}T${time}-04:00`);
}

/**
 * Several running on a Life block (USE-24) against the fixture server: the
 * spec, the refactor and the tests started before 10:20. Focus is the chosen
 * item, as the screen holds it; every figure is read back from the events.
 */
function setup(name = "several-running", kind?: "work") {
  let nowMs = at("10:20:00").getTime();
  const now = () => new Date(nowMs);
  const scenario = resolveScenario(name);
  if (kind) scenario.records.blocks[0]!.kind = kind;
  const server = createFixtureServer(scenario, now);
  async function read(chosenId: string | null = I.spec) {
    const today = deriveToday(await server.readToday(BASE_DATE));
    const view = deriveNow(today, now(), chosenId);
    const running = deriveRunning(today, view);
    return { today, view, running };
  }
  return {
    server,
    now,
    read,
    set: (time: string) => {
      nowMs = at(time).getTime();
    },
  };
}

/** A row's words at the read's instant, as the screen shows them. */
function rowCounts(
  read: Awaited<ReturnType<ReturnType<typeof setup>["read"]>>,
  instant: Date,
  settled: ReadonlySet<string> = new Set(),
) {
  const group = runningGroup(read.view, read.running, settled)!;
  return {
    focusedId: group.focusedId,
    rows: group.rows.map(({ item, slotClock, settled: done }) => ({
      id: item.id,
      settled: done,
      ...(done
        ? { tookMin: item.tookMin }
        : runningRowFigure(
            slotClock,
            item.lengthMin!,
            instant,
            read.running.dayEnd,
          )),
    })),
  };
}

/** The card's figure: "18:20". */
function cardFigure(
  read: Awaited<ReturnType<ReturnType<typeof setup>["read"]>>,
  id: string,
  instant: Date,
) {
  const item = read.view.items.find((row) => row.id === id)!;
  const clock = read.running.clocks.get(id)!;
  const { workMs } = clockAt(clock, instant, read.running.dayEnd);
  return formatCountdown(item.lengthMin! * 60_000, workMs).text;
}

describe("C5: several run at once; a lift writes nothing", () => {
  it("reads the drawn figures: the card and two rows, each its own count", async () => {
    const { read, now } = setup();
    const before = await read();
    expect(cardFigure(before, I.spec, now())).toBe("18:20");
    expect(rowCounts(before, now())).toEqual({
      focusedId: I.spec,
      rows: [
        {
          id: I.refactor,
          settled: false,
          count: "12:04 of 30 min",
          band: null,
          ring: expect.closeTo(17 / 30 + 56 / 1800, 5),
          held: false,
        },
        {
          id: I.tests,
          settled: false,
          count: "4 min over",
          band: "warning",
          ring: 1,
          held: false,
        },
      ],
    });
  });

  it("starting a second item leaves the first running", async () => {
    const { server, read, now, set } = setup();
    const review = (await read()).view.items.find(
      (row) => row.id === I.review,
    )!;
    expect(review.slotId).toBeNull();
    // Lifted, then Start: the slot placed on first touch, one event.
    const slot = await server.writeSlots({
      blockId: SEVERAL_IDS.block,
      onDate: BASE_DATE,
      sortOrder: review.sortOrder,
      blockItemId: review.blockItemId,
    });
    await server.writeSlotEvents([slotEventFor(slot.id, "started", now())]);

    set("10:21:00");
    const after = await read(I.review);
    for (const id of [I.spec, I.refactor, I.tests, I.review]) {
      expect(after.running.clocks.get(id)!.state).toBe("running");
    }
    const group = rowCounts(after, now());
    expect(group.focusedId).toBe(I.review);
    expect(group.rows.map((row) => row.id)).toEqual([
      I.spec,
      I.refactor,
      I.tests,
    ]);
    expect(cardFigure(after, I.review, now())).toBe("29:00");
    expect(group.rows[0]).toMatchObject({ count: "17:20 of 45 min" });
  });

  it("a lift changes no event and both figures read the same before and after", async () => {
    const { server, read, now } = setup();
    const events = (await server.readToday(BASE_DATE)).slotEvents.length;

    const before = await read(I.spec);
    const lifted = await read(I.refactor);

    expect((await server.readToday(BASE_DATE)).slotEvents).toHaveLength(events);
    // The card and the row trade places; neither count moves.
    expect(cardFigure(before, I.spec, now())).toBe("18:20");
    expect(rowCounts(before, now()).rows[0]).toMatchObject({
      id: I.refactor,
      count: "12:04 of 30 min",
    });
    const after = rowCounts(lifted, now());
    expect(after.focusedId).toBe(I.refactor);
    expect(cardFigure(lifted, I.refactor, now())).toBe("12:04");
    expect(
      after.rows.map((row) => [row.id, "count" in row ? row.count : null]),
    ).toEqual([
      [I.spec, "18:20 of 45 min"],
      [I.tests, "4 min over"],
    ]);
  });

  it("a row's Pause holds only that slot", async () => {
    const { server, read, now, set } = setup();
    await server.writeSlotEvents([slotEventFor(S.refactor, "paused", now())]);
    set("10:25:00");
    const later = await read();
    expect(later.running.clocks.get(I.refactor)!.state).toBe("paused");
    expect(later.running.clocks.get(I.spec)!.state).toBe("running");
    expect(later.running.clocks.get(I.tests)!.state).toBe("running");
    expect(cardFigure(later, I.spec, now())).toBe("13:20");
    expect(rowCounts(later, now()).rows).toMatchObject([
      { id: I.refactor, count: "12:04 of 30 min", held: true },
      { id: I.tests, count: "9 min over", band: "danger", held: false },
    ]);
  });
});

describe("C6: a settled row, the done bands, and no group in a Work block", () => {
  it("a Done row settles, then leaves Running for its place, checked", async () => {
    const { server, read, now } = setup();
    const before = await read();
    const tests = before.view.items.find((row) => row.id === I.tests)!;
    const clock = before.running.clocks.get(I.tests)!;
    await server.writeSlotEvents([slotEventFor(S.tests, "done", now())]);
    await server.writeSlots({
      id: S.tests,
      ...timedDoneChange(clock, now(), before.running.dayEnd),
    });

    const after = await read();
    // Held settled: "Done · 35 min", the others still running.
    const held = rowCounts(after, now(), new Set([tests.id]));
    expect(held.rows).toEqual([
      expect.objectContaining({ id: I.refactor, settled: false }),
      { id: I.tests, settled: true, tookMin: 35 },
    ]);
    expect(after.running.clocks.get(I.spec)!.state).toBe("running");

    // After its moment: gone from Running, checked in its place, timed.
    const gone = rowCounts(after, now());
    expect(gone.rows.map((row) => row.id)).toEqual([I.refactor]);
    const row = after.view.items.find((item) => item.id === I.tests)!;
    expect(row).toMatchObject({ done: true, tookMin: 35 });
    expect(after.view.items.indexOf(row)).toBe(2);
    expect(isTimedDone(after.running, row)).toBe(true);
  });

  it("the seeded Done reads its band: 34 of 30 warning, 41 danger", async () => {
    for (const [name, took, band] of [
      ["done-on-a-running-row", 34, "warning"],
      ["done-well-over", 41, "danger"],
    ] as const) {
      const { read, now } = setup(name);
      const view = await read();
      const group = rowCounts(view, now(), new Set([I.tests]));
      expect(group.rows[1]).toEqual({
        id: I.tests,
        settled: true,
        tookMin: took,
      });
      expect(settledLine(took, 30)).toEqual({ band, ofPlan: 30 });
    }
  });

  it("done lines: ink to 33, warning at 34 and 37, danger at 38, for 30 min", () => {
    expect(settledLine(33, 30)).toEqual({ band: "ink", ofPlan: null });
    expect(settledLine(34, 30)).toEqual({ band: "warning", ofPlan: 30 });
    expect(settledLine(37, 30)).toEqual({ band: "warning", ofPlan: 30 });
    expect(settledLine(38, 30)).toEqual({ band: "danger", ofPlan: 30 });
    expect(settledLine(20, 30)).toEqual({ band: "ink", ofPlan: null });
    expect(overBand(30, 41)).toBe("danger");
  });

  it("a Work block's view model has no Running group", async () => {
    const { read } = setup("several-running", "work");
    const view = await read();
    expect(view.view.block!.kind).toBe("work");
    expect(view.running.clocks.size).toBe(3);
    expect(runningGroup(view.view, view.running)).toBeNull();
  });

  it("one running item is USE-23's card alone, with no group", async () => {
    const { server, read, now } = setup();
    for (const slot of [S.refactor, S.tests]) {
      await server.writeSlotEvents([slotEventFor(slot, "done", now())]);
    }
    const view = await read();
    expect(runningGroup(view.view, view.running)).toBeNull();
  });
});
