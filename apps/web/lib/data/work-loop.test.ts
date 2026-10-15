import { describe, expect, it } from "vitest";
import { weekKeyOf } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { TODAY_WORK_IDS } from "@/lib/fixtures/scenarios/today-desk";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { joinIssue } from "./integration-records";
import { slotEventFor } from "./running";
import { deriveTodayWork, workCardFigures } from "./today-work";
import { doneChange, loopEvent, type LoopAction } from "./use-today-work";
import { deriveWeek } from "./use-week";
import { deriveWeekView } from "./week-view";

/**
 * USE-59: the work loop on Today, written as `useWorkLoop` writes it (one
 * `loopEvent` per action through the slot events) against the fixture server,
 * the clock read back through the real `deriveClock` (C1, C2).
 */

const MONDAY = "2026-10-12";
const S = TODAY_WORK_IDS.slots;

/** A scenario's server, read the way the screen reads it, at a moving clock. */
async function open(name: string) {
  const scenario = resolveScenario(name);
  let now = new Date(scenario.now);
  const server = createFixtureServer(scenario, () => now);
  const linear = await server.readLinear();

  async function read() {
    const week = deriveWeek(await server.readWeek(weekKeyOf(MONDAY)));
    const weekView = deriveWeekView({
      weekKey: weekKeyOf(MONDAY),
      week,
      pool: null,
      todayKey: MONDAY,
    });
    const today = deriveToday(await server.readToday(MONDAY));
    return deriveTodayWork({
      today,
      day: weekView.days.find((day) => day.dateKey === MONDAY) ?? null,
      now,
      clientFor: () => null,
      issueFor: (item) => joinIssue(linear, item),
    });
  }

  /** The hook's write: the action's one event, or nothing when it asks. */
  async function act(action: LoopAction, slotId: string) {
    const kind = loopEvent(await read(), action, slotId);
    if (kind === "asks") return "asks";
    await server.writeSlotEvents([slotEventFor(slotId, kind, now)]);
    return kind;
  }

  async function eventsOf(slotId: string) {
    const records = await server.readToday(MONDAY);
    return records.slotEvents
      .filter((event) => event.slotId === slotId)
      .map((event) => event.kind);
  }

  return {
    server,
    read,
    act,
    eventsOf,
    at: (clock: string) => {
      now = new Date(`${MONDAY}T${clock}:00-04:00`);
    },
  };
}

const rowOf = (view: Awaited<ReturnType<typeof deriveTodayWork>>, id: string) =>
  view.tiers.flatMap((group) => group.rows).find((row) => row.id === id)!;

describe("firing (C1)", () => {
  it("Prompt sent on the running card fires it in place with work time paused, and Next lifts", async () => {
    const loop = await open("today-running");
    const running = await loop.read();
    expect(running.inHand?.slotId).toBe(S.alder);
    expect(running.lift).toBe(false);

    expect(await loop.act("promptSent", S.alder)).toBe("prompt_sent");
    loop.at("10:21");
    const view = await loop.read();

    // One prompt_sent; the item fires in its tier and place.
    expect(await loop.eventsOf(S.alder)).toEqual(["started", "prompt_sent"]);
    expect(view.tiers[0]!.rows.map((row) => row.id)).toEqual([
      S.portal,
      S.alder,
    ]);
    expect(rowOf(view, S.alder)).toMatchObject({
      form: "firing",
      firing: { word: "firing", time: "1 min" },
      worked: "worked 35 min",
    });
    // Work time paused: nothing in hand, and it stays at 35 min a minute on.
    expect(view.inHand).toBeNull();
    loop.at("10:30");
    expect(rowOf(await loop.read(), S.alder).worked).toBe("worked 35 min");
    // Next lifted: the SMS copy, first neither firing nor done.
    expect(view.nextRow?.id).toBe(S.sms);
    expect(view.lift).toBe(true);
  });

  it("the ring on any row writes the same one prompt_sent", async () => {
    const loop = await open("today-working");
    expect(await loop.act("promptSent", S.invoice)).toBe("prompt_sent");
    expect(await loop.eventsOf(S.invoice)).toEqual(["prompt_sent"]);
    loop.at("10:20");
    expect(rowOf(await loop.read(), S.invoice)).toMatchObject({
      form: "firing",
      firing: { time: "1 min" },
      worked: null,
    });
  });
});

describe("one in hand and bringing back (C2)", () => {
  it("Start on a second item writes nothing while one runs", async () => {
    const loop = await open("today-running");
    expect(await loop.act("start", S.sms)).toBe("asks");
    expect(await loop.eventsOf(S.sms)).toEqual([]);
    expect((await loop.read()).inHand?.slotId).toBe(S.alder);
  });

  it("bring back writes brought_back and no started; work time stays paused", async () => {
    const loop = await open("today-prompt-sent");
    loop.at("10:32");
    expect(await loop.act("bringBack", S.alder)).toBe("brought_back");
    expect(await loop.eventsOf(S.alder)).toEqual([
      "started",
      "prompt_sent",
      "brought_back",
    ]);
    const view = await loop.read();
    expect(view.states.get(S.alder)).not.toBe("running");
    expect(view.inHand).toBeNull();
    // Back in place with its lengths, no caption; first neither firing nor
    // done, so Next, and its card reads Resume.
    expect(rowOf(view, S.alder)).toMatchObject({
      form: "next",
      worked: "worked 35 min",
      fired: "fired 12 min",
    });
    expect(view.nextResumes).toBe(true);
    // Start after it resumes work time.
    expect(await loop.act("start", S.alder)).toBe("resumed");
  });
});

describe("the card and Done's record", () => {
  it("counts down from the top of the range, then over by Done's bands", async () => {
    const running = await open("today-running");
    const view = await running.read();
    expect(
      workCardFigures(
        view.inHand!,
        new Date("2026-10-12T10:20:00-04:00"),
        view.dayEnd,
        view.timeZone,
      ),
    ).toMatchObject({
      label: "WORK TIME",
      figure: "1:25:00",
      over: null,
      line: "left of 2 h · worked 35 min since 9:45",
      held: false,
    });

    const over = await (await open("today-over")).read();
    expect(
      workCardFigures(
        over.inHand!,
        new Date("2026-10-12T11:36:00-04:00"),
        over.dayEnd,
        over.timeZone,
      ),
    ).toMatchObject({
      label: "WORK TIME · OVER",
      figure: "13 min",
      over: { word: "over", level: "warning" },
      line: "past the top of 2 h · worked 2 h 13 since 9:23",
    });
    expect(rowOf(over, S.portal).firing?.time).toBe("1 h 20");

    const paused = await (await open("today-paused")).read();
    expect(
      workCardFigures(
        paused.inHand!,
        new Date("2026-10-12T10:42:00-04:00"),
        paused.dayEnd,
        paused.timeZone,
      ),
    ).toMatchObject({
      label: "WORK TIME · PAUSED",
      figure: "1:03:00",
      line: "left of 2 h · worked 57 min · paused at 10:40",
      held: true,
    });
    expect(paused.nextRow?.id).toBe(S.sms);
    expect(paused.lift).toBe(false);
  });

  it("Done reads Took and fired, and leaves fired off one that never fired", async () => {
    const back = await (await open("today-brought-back")).read();
    expect(rowOf(back, S.sms).doneRecord).toBe("Took 1 h 10 · fired 32 min");

    const loop = await open("today-running");
    loop.at("10:40");
    const view = await loop.read();
    const change = doneChange(
      view,
      S.alder,
      new Date("2026-10-12T10:40:00-04:00"),
    );
    expect(change.tookMin).toBe(55);
    await loop.server.writeSlotEvents([
      slotEventFor(S.alder, "done", new Date(change.doneAt)),
    ]);
    await loop.server.writeSlots({ id: S.alder, ...change });
    expect(rowOf(await loop.read(), S.alder).doneRecord).toBe("Took 55 min");
  });

  it("everything firing has no Next and no reminder line", async () => {
    const view = await (await open("today-everything-firing")).read();
    expect(view.allFiring).toBe(true);
    expect(view.nextRow).toBeNull();
    expect(view.whileItFires).toBeNull();
  });
});
