import { describe, expect, it } from "vitest";
import { clockAt } from "@syn/utils";
import type { SlotEventInput } from "@syn/validators";
import { deriveToday } from "@/lib/data/derive-today";
import { resumeAllInputs, stepAwayInputs } from "@/lib/data/step-away";
import { fixtureId } from "./ids";
import { resolveScenario } from "./scenarios";
import { BASE_DATE, BASE_IDS } from "./scenarios/base-day";
import { createFixtureServer, SlotEventRefusal } from "./server";

const S = BASE_IDS.slots;

/** A server on the default day with a clock the test moves. */
function setup(start = "2026-10-12T10:20:00-04:00") {
  let nowMs = Date.parse(start);
  const server = createFixtureServer(
    resolveScenario("default"),
    () => new Date(nowMs),
  );
  let n = 0;
  const newId = () => fixtureId(9, ++n);
  return {
    server,
    newId,
    now: () => new Date(nowMs),
    advance(minutes: number) {
      nowMs += minutes * 60_000;
    },
    async today() {
      return deriveToday(await server.readToday(BASE_DATE));
    },
    event(slotId: string, kind: SlotEventInput["kind"]): SlotEventInput {
      return {
        slotId,
        kind,
        clientEventId: newId(),
        at: new Date(nowMs).toISOString(),
      };
    },
  };
}

describe("C2: started, prompt_sent, brought_back through the real deriveClock", () => {
  it("reads running, then firing with work paused, then not running and work not restarted", async () => {
    const t = setup();
    // Primary runs from 09:50 in the base day; start Secondary, which takes it from hand.
    await t.server.writeSlotEvents([t.event(S.secondary, "started")]);
    let slot = (await t.today()).clock.slots.get(S.secondary)!;
    expect(slot.state).toBe("running");
    expect(
      clockAt(slot, t.now(), (await t.today()).records.dayWindow.end).running,
    ).toBe(true);

    t.advance(10);
    await t.server.writeSlotEvents([t.event(S.secondary, "prompt_sent")]);
    slot = (await t.today()).clock.slots.get(S.secondary)!;
    expect(slot.state).toBe("firing");
    expect(slot.work.every((span) => span.end !== null)).toBe(true);
    expect(slot.firing.at(-1)?.end).toBeNull();

    t.advance(5);
    const end = (await t.today()).records.dayWindow.end;
    const before = clockAt(slot, t.now(), end);
    expect(before.firing).toBe(true);
    expect(before.workMs).toBe(10 * 60_000);

    await t.server.writeSlotEvents([t.event(S.secondary, "brought_back")]);
    t.advance(5);
    slot = (await t.today()).clock.slots.get(S.secondary)!;
    const after = clockAt(slot, t.now(), end);
    expect(slot.state).toBe("paused");
    expect(after.running).toBe(false);
    expect(after.firing).toBe(false);
    expect(after.workMs).toBe(10 * 60_000);
    expect(after.firingMs).toBe(5 * 60_000);
  });
});

describe("C3: Step away and Resume all", () => {
  it("pauses each running slot under one id and resumes exactly those", async () => {
    const t = setup();
    // Two running outside the Work block (a to-do each), Primary running inside it.
    await t.server.writeSlotEvents([
      t.event(S.errand, "started"),
      t.event(S.call, "started"),
    ]);
    // A Wellness slot paused by its own Pause before Step away.
    await t.server.writeSlotEvents([t.event(S.stretch, "started")]);
    t.advance(1);
    await t.server.writeSlotEvents([t.event(S.stretch, "paused")]);
    // Secondary fires; Step away must not touch it.
    await t.server.writeSlotEvents([t.event(S.secondary, "prompt_sent")]);

    t.advance(1);
    const { stepAwayId, inputs } = stepAwayInputs(
      (await t.today()).clock,
      t.now(),
      t.newId,
    );
    expect(inputs.map((input) => input.slotId).sort()).toEqual(
      [S.call, S.errand, S.primary].sort(),
    );
    const written = await t.server.writeSlotEvents(inputs);
    expect(written.every((event) => event.kind === "paused")).toBe(true);
    expect(new Set(written.map((event) => event.stepAwayId))).toEqual(
      new Set([stepAwayId]),
    );

    let today = await t.today();
    expect(today.clock.stepAway?.id).toBe(stepAwayId);
    expect(today.clock.slots.get(S.stretch)?.heldBy).toBeNull();
    const firingBefore = clockAt(
      today.clock.slots.get(S.secondary)!,
      t.now(),
      today.records.dayWindow.end,
    ).firingMs;

    t.advance(10);
    const resumes = resumeAllInputs(today.clock, stepAwayId, t.now(), t.newId);
    expect(resumes.map((input) => input.slotId).sort()).toEqual(
      [S.call, S.errand, S.primary].sort(),
    );
    await t.server.writeSlotEvents(resumes);

    today = await t.today();
    expect(today.clock.slots.get(S.stretch)?.state).toBe("paused");
    expect(today.clock.slots.get(S.errand)?.state).toBe("running");
    expect(today.clock.slots.get(S.call)?.state).toBe("running");
    expect(today.clock.slots.get(S.primary)?.state).toBe("running");
    expect(today.clock.stepAway).toBeNull();

    const secondary = today.clock.slots.get(S.secondary)!;
    expect(secondary.state).toBe("firing");
    const firingAfter = clockAt(
      secondary,
      t.now(),
      today.records.dayWindow.end,
    ).firingMs;
    expect(firingAfter - firingBefore).toBe(10 * 60_000);
  });
});

describe("C4: writeSlotEvents refuses what the router refuses", () => {
  it("refuses what slotEventInput refuses", async () => {
    const t = setup();
    const bad = { ...t.event(S.primary, "started"), stepAwayId: t.newId() };
    await expect(t.server.writeSlotEvents([bad])).rejects.toMatchObject({
      reason: "invalid",
    });
    await expect(
      t.server.writeSlotEvents([
        { ...t.event(S.primary, "paused"), slotId: "nope" },
      ]),
    ).rejects.toBeInstanceOf(SlotEventRefusal);
  });

  it("refuses an at outside the day window with checkEventTime's reason", async () => {
    const t = setup();
    await expect(
      t.server.writeSlotEvents([
        { ...t.event(S.primary, "paused"), at: "2026-10-12T02:59:00-04:00" },
      ]),
    ).rejects.toMatchObject({ reason: "before-day" });
    await expect(
      t.server.writeSlotEvents([
        { ...t.event(S.primary, "paused"), at: "2026-10-13T03:00:00-04:00" },
      ]),
    ).rejects.toMatchObject({ reason: "after-day" });
  });

  it("refuses an at more than two minutes past now, and takes one at two", async () => {
    const t = setup();
    const ahead = (ms: number) =>
      new Date(t.now().getTime() + ms).toISOString();
    await expect(
      t.server.writeSlotEvents([
        { ...t.event(S.primary, "paused"), at: ahead(120_001) },
      ]),
    ).rejects.toMatchObject({ reason: "ahead-of-now" });
    await expect(
      t.server.writeSlotEvents([
        { ...t.event(S.primary, "paused"), at: ahead(120_000) },
      ]),
    ).resolves.toHaveLength(1);
  });

  it("writes nothing from a batch with one refusal", async () => {
    const t = setup();
    const before = (await t.server.readToday(BASE_DATE)).slotEvents.length;
    await expect(
      t.server.writeSlotEvents([
        t.event(S.secondary, "started"),
        { ...t.event(S.call, "started"), at: "2026-10-11T12:00:00-04:00" },
      ]),
    ).rejects.toMatchObject({ reason: "before-day" });
    expect((await t.server.readToday(BASE_DATE)).slotEvents).toHaveLength(
      before,
    );
  });

  it("changes nothing on a repeated clientEventId", async () => {
    const t = setup();
    const first = t.event(S.primary, "paused");
    const [written] = await t.server.writeSlotEvents([first]);
    const after = await t.server.readToday(BASE_DATE);

    t.advance(3);
    const [replayed] = await t.server.writeSlotEvents([
      { ...first, at: t.now().toISOString(), kind: "resumed" },
    ]);
    expect(replayed).toEqual(written);
    expect(await t.server.readToday(BASE_DATE)).toEqual(after);
  });
});
