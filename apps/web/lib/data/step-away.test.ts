import { describe, expect, it } from "vitest";
import { clockAt, weekKeyOf } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import {
  TODAY_WORK_BLOCKS,
  TODAY_WORK_IDS,
} from "@/lib/fixtures/scenarios/today-desk";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { joinIssue } from "./integration-records";
import { slotEventFor } from "./running";
import { resumeAllInputs, stepAwayInputs } from "./step-away";
import { deriveTodayWork } from "./today-work";
import { doneChange, startEvents } from "./use-today-work";
import { deriveWeek } from "./use-week";
import { deriveWeekView } from "./week-view";

/**
 * USE-60: Step away and Resume all (C1), the ask's Start (C2) and a
 * session's Done (C3), written as `useWorkLoop` writes them against the
 * fixture server and read back through the real `deriveClock`.
 */

const MONDAY = "2026-10-12";
const S = TODAY_WORK_IDS.slots;

async function open(name: string) {
  const scenario = resolveScenario(name);
  let now = new Date(scenario.now);
  const server = createFixtureServer(scenario, () => now);
  const linear = await server.readLinear();
  let n = 0;
  const newId = () =>
    `00000000-0000-4000-8000-9${String(++n).padStart(11, "0")}`;

  async function today() {
    return deriveToday(await server.readToday(MONDAY));
  }

  async function read() {
    const week = deriveWeek(await server.readWeek(weekKeyOf(MONDAY)));
    const weekView = deriveWeekView({
      weekKey: weekKeyOf(MONDAY),
      week,
      pool: null,
      todayKey: MONDAY,
    });
    const pool = await server.readPool();
    return deriveTodayWork({
      today: await today(),
      day: weekView.days.find((day) => day.dateKey === MONDAY) ?? null,
      now,
      clientFor: () => null,
      issueFor: (item) => joinIssue(linear, item),
      sessionSlots: pool.slots.flatMap((slot) =>
        slot.workItemId === null
          ? []
          : [{ ...slot, workItemId: slot.workItemId }],
      ),
    });
  }

  async function events() {
    return (await server.readToday(MONDAY)).slotEvents;
  }

  return {
    server,
    today,
    read,
    events,
    newId,
    now: () => now,
    at: (clock: string) => {
      now = new Date(`${MONDAY}T${clock}:00-04:00`);
    },
  };
}

describe("Step away and Resume all (C1)", () => {
  it("tags every running timer under one id, resumes exactly those, and firing counts on", async () => {
    const t = await open("today-running");
    // A second timer: Kegels pulled into Training and started at 10:00.
    const kegels = await t.server.writeSlots({
      blockId: TODAY_WORK_BLOCKS.training,
      onDate: MONDAY,
      sortOrder: 0,
      todoId: TODAY_WORK_IDS.todos.kegels,
    });
    // Held by its own Pause: the SMS copy, 9:30 to 9:40.
    await t.server.writeSlotEvents([
      slotEventFor(kegels.id, "started", new Date(`${MONDAY}T10:00:00-04:00`)),
      slotEventFor(S.sms, "started", new Date(`${MONDAY}T09:30:00-04:00`)),
      slotEventFor(S.sms, "paused", new Date(`${MONDAY}T09:40:00-04:00`)),
    ]);
    // The SMS copy's pause came first; [Alder intro] started at 9:45 after it.
    t.at("10:20");
    const before = await t.today();
    expect(before.clock.slots.get(S.alder)?.state).toBe("running");
    expect(before.clock.slots.get(kegels.id)?.state).toBe("running");
    expect(before.clock.slots.get(S.sms)?.state).toBe("paused");
    const firingBefore = clockAt(
      before.clock.slots.get(S.portal)!,
      t.now(),
      before.records.dayWindow.end,
    ).firingMs;

    // Step away at 10:42: two paused events under one id, at the same time.
    t.at("10:42");
    const { stepAwayId, inputs } = stepAwayInputs(
      before.clock,
      t.now(),
      t.newId,
    );
    await t.server.writeSlotEvents(inputs);
    const tagged = (await t.events()).filter(
      (event) => event.stepAwayId === stepAwayId,
    );
    expect(tagged.map((event) => event.slotId).sort()).toEqual(
      [S.alder, kegels.id].sort(),
    );
    expect(tagged.every((event) => event.kind === "paused")).toBe(true);
    expect(new Set(tagged.map((event) => event.at)).size).toBe(1);

    // Today shows the bar's time and hides Step away; the SMS copy is untagged.
    const away = await t.read();
    expect(away.steppedAway).toEqual({
      id: stepAwayId,
      words: "Stepped away at 10:42",
    });
    expect(away.workRunning).toBe(false);
    const held = await t.today();
    expect(held.clock.slots.get(S.sms)?.heldBy).toBeNull();

    // Firing grows across the step away.
    t.at("10:51");
    const during = await t.today();
    const firingDuring = clockAt(
      during.clock.slots.get(S.portal)!,
      t.now(),
      during.records.dayWindow.end,
    ).firingMs;
    expect(firingDuring - firingBefore).toBe(31 * 60_000);
    expect(during.clock.slots.get(S.portal)?.state).toBe("firing");

    // Resume all resumes those two only.
    const resumes = resumeAllInputs(during.clock, stepAwayId, t.now(), t.newId);
    expect(resumes.map((input) => input.slotId).sort()).toEqual(
      [S.alder, kegels.id].sort(),
    );
    await t.server.writeSlotEvents(resumes);
    const back = await t.today();
    expect(back.clock.slots.get(S.alder)?.state).toBe("running");
    expect(back.clock.slots.get(kegels.id)?.state).toBe("running");
    expect(back.clock.slots.get(S.sms)?.state).toBe("paused");
    expect(back.clock.stepAway).toBeNull();
    const view = await t.read();
    expect(view.steppedAway).toBeNull();
    expect(view.workRunning).toBe(true);
  });

  it("Step away is hidden while no work timer runs", async () => {
    const paused = await (await open("today-paused")).read();
    expect(paused.workRunning).toBe(false);
    expect(paused.steppedAway).toBeNull();
    const running = await (await open("today-running")).read();
    expect(running.workRunning).toBe(true);
  });

  it("the stepped-away scenario holds the card and drops 'paused at'", async () => {
    const view = await (await open("today-stepped-away")).read();
    expect(view.steppedAway?.words).toBe("Stepped away at 10:42");
    expect(view.inHand?.slotId).toBe(S.alder);
    expect(view.inHand?.clock.heldBy).not.toBeNull();
  });
});

describe("Start while one runs (C2)", () => {
  it("Firing writes prompt_sent for the running one, then started", async () => {
    const t = await open("today-ask");
    const view = await t.read();
    const before = (await t.events()).length;
    const writes = startEvents(view, S.sms, "firing");
    expect(writes).toEqual([
      { slotId: S.alder, kind: "prompt_sent" },
      { slotId: S.sms, kind: "started" },
    ]);
    await t.server.writeSlotEvents(
      writes.map((entry) => slotEventFor(entry.slotId, entry.kind, t.now())),
    );
    const after = await t.events();
    expect(
      after.slice(before).map((event) => [event.slotId, event.kind]),
    ).toEqual([
      [S.alder, "prompt_sent"],
      [S.sms, "started"],
    ]);
    const clock = (await t.today()).clock;
    expect(clock.slots.get(S.alder)?.state).toBe("firing");
    expect(clock.slots.get(S.sms)?.state).toBe("running");
  });

  it("Paused writes paused, then started; the held one carries no Step away id", async () => {
    const t = await open("today-ask");
    const writes = startEvents(await t.read(), S.sms, "paused");
    expect(writes).toEqual([
      { slotId: S.alder, kind: "paused" },
      { slotId: S.sms, kind: "started" },
    ]);
    await t.server.writeSlotEvents(
      writes.map((entry) => slotEventFor(entry.slotId, entry.kind, t.now())),
    );
    const clock = (await t.today()).clock;
    expect(clock.slots.get(S.alder)?.state).toBe("paused");
    expect(clock.slots.get(S.alder)?.heldBy).toBeNull();
    expect(clock.slots.get(S.sms)?.state).toBe("running");
  });

  it("Cancel writes nothing", async () => {
    const t = await open("today-ask");
    const before = await t.events();
    // Cancel closes the ask; the loop is never called.
    expect(await t.events()).toEqual(before);
    expect((await t.today()).clock.slots.get(S.alder)?.state).toBe("running");
  });
});

describe("a session's Done (C3)", () => {
  it("writes done for that slot only, names the next session, and Undo writes undone", async () => {
    const t = await open("today-done-for-today");
    t.at("09:10");
    // Reopen the staged Done, then Done again the way the loop does.
    await t.server.writeSlots({ id: S.desk, doneAt: null, tookMin: null });
    await t.server.writeSlotEvents([slotEventFor(S.desk, "undone", t.now())]);
    t.at("11:15");
    const view = await t.read();
    expect(view.oneDay.get(S.desk)).toBe(false);
    expect(view.sessionNext.get(S.desk)).toEqual({
      dateKey: "2026-10-14",
      n: 2,
    });

    const change = doneChange(view, S.desk, t.now());
    await t.server.writeSlotEvents([slotEventFor(S.desk, "done", t.now())]);
    await t.server.writeSlots({ id: S.desk, ...change });

    const done = await t.read();
    const row = done.tiers
      .flatMap((group) => group.rows)
      .find((entry) => entry.id === S.desk)!;
    expect(row.form).toBe("done");
    expect(row.doneRecord).toBe(
      "Done for today · took 2 h 05 · next session Wed 14",
    );
    // The task is untouched: the work item's doneAt stays null.
    const records = await t.server.readToday(MONDAY);
    const item = records.workItems.find(
      (entry) => entry.id === done.workItemIds.get(S.desk),
    );
    expect(item?.doneAt).toBeNull();
    // Other slots are not done.
    expect(done.states.get(S.alder)).not.toBe("done");

    // Undo, a minute on: the stamp cleared, then undone.
    t.at("11:16");
    await t.server.writeSlots({ id: S.desk, doneAt: null, tookMin: null });
    await t.server.writeSlotEvents([slotEventFor(S.desk, "undone", t.now())]);
    const kinds = (await t.events())
      .filter((event) => event.slotId === S.desk)
      .map((event) => event.kind);
    expect(kinds.at(-1)).toBe("undone");
    expect((await t.read()).states.get(S.desk)).not.toBe("done");
  });
});
