import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { TODAY_WORK_IDS } from "@/lib/fixtures/scenarios/today-desk";
import { MEETING_IDS } from "@/lib/fixtures/scenarios/today-meetings";
import { WEEK_IDS } from "@/lib/fixtures/scenarios/week";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { deriveTodayWork } from "./today-work";

/**
 * USE-62: a meeting inside the Work block, read from its scenarios as Now
 * and Today read them. The block stays one block; the band sits where the
 * plan reaches it; at its time it lifts and nothing running stops.
 */

const MONDAY = "2026-10-12";
const S = TODAY_WORK_IDS.slots;

async function read(name: string) {
  const scenario = resolveScenario(name);
  const now = new Date(scenario.now!);
  const server = createFixtureServer(scenario, () => now);
  const today = deriveToday(await server.readToday(MONDAY));
  return deriveTodayWork({
    today,
    day: null,
    now,
    clientFor: () => null,
    issueFor: () => null,
  });
}

describe("meeting coming up (C-USE-today-meeting-coming-up-1, -2, C-USE-today-8)", () => {
  it("is a band after the row the plan crosses it in, with in n min, and the block stays one", async () => {
    const work = await read("today-meeting-coming-up");
    expect(work.band).toMatchObject({
      id: WEEK_IDS.blocks.workMorning,
      headerDetail:
        "9:30 to 12:00 · [Design sync] at 10:30 · [Kestrel weekly] at 11:00",
    });
    expect(work.meetings.lifted).toEqual([]);
    expect(work.meetings.bands[0]).toEqual({
      id: MEETING_IDS.designSync,
      title: "[Design sync]",
      tag: "Work",
      span: "10:30 to 11:00",
      afterSlotId: S.portal,
      line: "10:30 to 11:00 · the work below waits until 11:00",
      lead: "in 10 min",
      name: "[Design sync], 10:30 to 11:00, in 10 min",
    });
    // Kestrel's weekly follows in the flow, after the same row.
    expect(work.meetings.bands[1]).toMatchObject({
      id: WEEK_IDS.events.kestrelWeekly,
      afterSlotId: S.portal,
      lead: "in 40 min",
    });
  });

  it("puts the consequence on Next's card as a time, nothing more", async () => {
    const work = await read("today-meeting-coming-up");
    expect(work.lift).toBe(true);
    expect(work.nextRow).toMatchObject({
      id: S.portal,
      consequence: {
        length: "30 min",
        words: "would end 10:50, past [Design sync]",
      },
    });
    // Only the lifted card names it.
    const others = work.tiers
      .flatMap((group) => group.rows)
      .filter((row) => row.id !== S.portal);
    expect(others.every((row) => !row.consequence)).toBe(true);
  });
});

describe("meeting lifted (C-USE-today-meeting-lifted-1, -2)", () => {
  it("lifts under At 11:00 with its Tag", async () => {
    const work = await read("today-meeting-lifted");
    expect(work.meetings.bands).toEqual([]);
    expect(work.meetings.lifted).toEqual([
      {
        id: MEETING_IDS.standup,
        title: "[Standup]",
        tag: "Work",
        span: "11:00 to 11:15",
        heading: "At 11:00",
        meta: "Meeting · 11:00 to 11:15",
        said: "At 11:00: [Standup]",
      },
    ]);
  });

  it("leaves the running item running and the firing one firing", async () => {
    const work = await read("today-meeting-lifted");
    expect(work.states.get(S.sms)).toBe("running");
    expect(work.inHand?.slotId).toBe(S.sms);
    expect(work.states.get(S.portal)).toBe("firing");
    const portal = work.tiers[0]!.rows.find((row) => row.id === S.portal);
    expect(portal).toMatchObject({
      form: "firing",
      firing: { word: "firing", time: "44 min" },
    });
  });
});

describe("no meeting", () => {
  it("draws no band and no consequence", async () => {
    const work = await read("today-working");
    expect(work.meetings.lifted).toEqual([]);
    expect(work.meetings.bands.map((band) => band.id)).toEqual([
      WEEK_IDS.events.kestrelWeekly,
    ]);
    expect(work.nextRow?.consequence ?? null).toBeNull();
  });
});
