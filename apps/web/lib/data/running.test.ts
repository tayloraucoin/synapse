import { describe, expect, it } from "vitest";
import { clockAt, formatCountdown } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { NOW_IDS } from "@/lib/fixtures/scenarios/now-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import {
  deriveRunning,
  isRunningCard,
  isTimedDone,
  slotEventFor,
  startedAt,
  timedDoneChange,
  wallClock,
} from "./running";
import { deriveNow } from "./use-now";

const I = NOW_IDS.items;

/** An instant on Now's Monday, `HH:MM:SS` in Toronto. */
function at(time: string) {
  return new Date(`${BASE_DATE}T${time}-04:00`);
}

/**
 * The running card's writes against the fixture server, as
 * `useRunningWrites` makes them: place Meditate's slot on first touch, one
 * event per action, and Done's slot change from the clock at that instant.
 * The clock is moved by hand; every figure is read back from the events.
 */
function setup(name = "success") {
  let nowMs = at("07:14:00").getTime();
  const now = () => new Date(nowMs);
  const server = createFixtureServer(resolveScenario(name), now);
  async function read() {
    const today = deriveToday(await server.readToday(BASE_DATE));
    const view = deriveNow(today, now(), null);
    return { today, view, running: deriveRunning(today, view) };
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

describe("C7: Start, Pause, Resume and a timed Done", () => {
  it("records tookMin as work time without the paused span, from the events", async () => {
    const { server, now, read, set } = setup();
    const meditate = (await read()).view.current!;
    expect(meditate.title).toBe("Meditate");

    // Start at 7:14: the slot is placed on first touch.
    const slot = await server.writeSlots({
      blockId: NOW_IDS.blocks.wellness,
      onDate: BASE_DATE,
      sortOrder: meditate.sortOrder,
      blockItemId: meditate.blockItemId,
    });
    await server.writeSlotEvents([slotEventFor(slot.id, "started", now())]);

    // Pause at 4:10 left: 5:50 worked.
    set("07:19:50");
    await server.writeSlotEvents([slotEventFor(slot.id, "paused", now())]);
    const paused = await read();
    const pausedClock = paused.running.clocks.get(I.meditate)!;
    expect(pausedClock.state).toBe("paused");
    set("07:22:00");
    const held = clockAt(pausedClock, now(), paused.running.dayEnd);
    expect(formatCountdown(10 * 60_000, held.workMs).text).toBe("4:10");

    // Resume at 7:22 and Done at 7:28:10: 5:50 + 6:10 = 12 min worked.
    await server.writeSlotEvents([slotEventFor(slot.id, "resumed", now())]);
    set("07:28:10");
    const before = await read();
    const clock = before.running.clocks.get(I.meditate)!;
    expect(isRunningCard(clock)).toBe(true);
    await server.writeSlotEvents([slotEventFor(slot.id, "done", now())]);
    const stored = await server.writeSlots({
      id: slot.id,
      ...timedDoneChange(clock, now(), before.running.dayEnd),
    });
    expect(stored).toMatchObject({
      doneAt: now().toISOString(),
      tookMin: 12,
    });

    // The events, in order, are the record.
    const records = await server.readToday(BASE_DATE);
    expect(
      records.slotEvents
        .filter((event) => event.slotId === slot.id)
        .map((event) => event.kind),
    ).toEqual(["started", "paused", "resumed", "done"]);

    // A fresh read, as a reopened app: the same figure from the events alone.
    set("08:30:00");
    const after = await read();
    const done = after.running.clocks.get(I.meditate)!;
    expect(done.state).toBe("done");
    expect(startedAt(done)).toEqual(at("07:14:00"));
    const fresh = clockAt(done, now(), after.running.dayEnd);
    expect(fresh.workMs).toBe(12 * 60_000);
    expect(timedDoneChange(done, now(), after.running.dayEnd).tookMin).toBe(12);
    const row = after.view.items.find((item) => item.id === I.meditate)!;
    expect(row).toMatchObject({ done: true, tookMin: 12 });
    expect(isTimedDone(after.running, row)).toBe(true);
  });

  it("a reopened app reads start minus paused spans, not where it stopped", async () => {
    const { read, set } = setup("paused");
    set("07:40:00");
    const { running } = await read();
    const clock = running.clocks.get(I.meditate)!;
    // Paused at 7:19:50, read twenty minutes later: still 4:10 left.
    const { workMs } = clockAt(clock, at("07:40:00"), running.dayEnd);
    expect(formatCountdown(10 * 60_000, workMs).text).toBe("4:10");
  });
});

describe("the running scenarios read the drawn figures", () => {
  async function figure(name: string, time: string) {
    const { read, set } = setup(name);
    set(time);
    const { running, view } = await read();
    const clock = running.clocks.get(I.meditate)!;
    const { workMs } = clockAt(clock, at(time), running.dayEnd);
    return { text: formatCountdown(10 * 60_000, workMs).text, running, view };
  }

  it("counting-down at 7:16:18 reads 7:42, started 7:14", async () => {
    const { text, running } = await figure("counting-down", "07:16:18");
    expect(text).toBe("7:42");
    const clock = running.clocks.get(I.meditate)!;
    expect(wallClock(startedAt(clock)!, running.timeZone)).toBe("07:14");
  });

  it("over-under-a-minute reads 0:40 over; over-a-minute-or-more 3 min over", async () => {
    expect((await figure("over-under-a-minute", "07:24:40")).text).toBe(
      "0:40 over",
    );
    expect((await figure("over-a-minute-or-more", "07:27:00")).text).toBe(
      "3 min over",
    );
  });

  it("after a timed Done, Cold bath lifts at the Done's time, 7:26", async () => {
    const { running, view } = await figure("timed-over-warning", "07:26:00");
    expect(view.current?.title).toBe("Cold bath");
    expect(running.liftedAt).toBe("07:26");
    const meditate = view.items.find((item) => item.id === I.meditate)!;
    expect(isTimedDone(running, meditate)).toBe(true);
    expect(meditate.tookMin).toBe(12);
  });
});
