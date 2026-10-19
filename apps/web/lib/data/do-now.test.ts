import { describe, expect, it } from "vitest";
import { dayEventRecord } from "@syn/validators";
import { NOW_COPY as COPY } from "@/app/(shell)/today/_components/now/copy";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { NOW_IDS } from "@/lib/fixtures/scenarios/now-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import { doNowPlans, writeDoNow, type NowClosing } from "./block-close";
import { deriveToday } from "./derive-today";
import type { BlockCloseState } from "./use-block-close";
import { deriveNow } from "./use-now";

/**
 * Do now on the close card (USE-26) against the fixture server, read back
 * through `deriveNow` as the screen reads it: the line each item shows, and
 * what the tap leaves on Now and on the date.
 */
const W = NOW_IDS.blocks.wellness;
const T = NOW_IDS.blocks.training;

function setup() {
  const scenario = resolveScenario("not-done-do-now");
  const dateKey = scenario.now.slice(0, 10);
  // A meeting at 9:00, pinned: the slide passes it by.
  scenario.records.dayEvents = [
    ...scenario.records.dayEvents,
    dayEventRecord.parse({
      id: "0e000000-0000-4000-8000-000000000126",
      createdAt: scenario.now,
      updatedAt: scenario.now,
      onDate: dateKey,
      rrule: null,
      title: "Call with Sam",
      icon: null,
      startsAt: "09:00",
      endsAt: "09:30",
      tag: "work",
      notes: null,
      color: null,
      clientId: null,
    }),
  ];
  const now = () => new Date(scenario.now);
  const server = createFixtureServer(scenario, now);
  async function read(
    close: BlockCloseState | null,
    focus: string | null = null,
    chosenId: string | null = null,
  ) {
    return deriveNow(
      deriveToday(await server.readToday(dateKey)),
      now(),
      chosenId,
      focus === null ? null : { blockId: focus, at: now() },
      close,
    );
  }
  return { server, dateKey, now, read };
}

const card: BlockCloseState = {
  closed: [W],
  card: { blockId: W, open: true, items: null, seeded: false },
};

/** The line each item shows, in the card's words. */
function lines(closing: NowClosing, now: Date) {
  const plans = doNowPlans(closing, closing.left, now);
  return closing.left.map((item) => {
    const plan = plans.get(item.id)!;
    return [
      COPY.close.withLength(item.title, item.lengthMin),
      "fitsBy" in plan.line
        ? COPY.close.fitsBy(plan.at)
        : COPY.close.wouldStart(closing.doNow.next!.name, plan.at),
    ];
  });
}

/** After Do now: the block reopened in focus with the item made current. */
async function doNow(title: string) {
  const { server, dateKey, now, read } = setup();
  const closing = (await read(card)).closing!;
  const item = closing.left.find((entry) => entry.title === title)!;
  const plan = doNowPlans(closing, closing.left, now()).get(item.id)!;
  const before = (await server.readToday(dateKey)).blockChanges.length;
  await writeDoNow(server, plan);
  const after = await server.readToday(dateKey);
  const view = await read({ closed: [], card: null }, W, item.id);
  return { server, dateKey, plan, view, before, after };
}

describe("the lines (C2, on the card)", () => {
  it("at 7:45: Meditate fits by 7:55; Cold bath after it starts Training at 8:05", async () => {
    const { now, read } = setup();
    const closing = (await read(card)).closing!;
    expect(lines(closing, now())).toEqual([
      ["Meditate · 10 min", "Fits by 7:55"],
      ["Cold bath · 10 min", "Training would start 8:05"],
    ]);
  });

  it("an item above leaving the list recomputes the one below", async () => {
    const { now, read } = setup();
    const closing = (await read(card)).closing!;
    const left = closing.left.map((item) =>
      item.title === "Meditate" ? { ...item, state: "leave" as const } : item,
    );
    const plans = doNowPlans(closing, left, now());
    const coldBath = left.find((item) => item.title === "Cold bath")!;
    expect(plans.get(coldBath.id)?.at).toBe("07:55");
    expect("fitsBy" in plans.get(coldBath.id)!.line).toBe(true);
  });
});

describe("C3: Do now", () => {
  it("on Meditate at 7:45: Wellness in focus, Meditate current, no block change", async () => {
    const { view, before, after, plan } = await doNow("Meditate");
    expect(plan.changes).toEqual([]);
    expect(after.blockChanges.length).toBe(before);
    expect(view.closing).toBeNull();
    expect(view.block?.name).toBe("Wellness");
    expect(view.block?.endsAt).toBe("08:00");
    expect(view.current?.title).toBe("Meditate");
  });

  it("on Cold bath after it: the slide is written, and Now reads Training as 8:05 to 9:02", async () => {
    const { view, after } = await doNow("Cold bath");
    expect(view.block?.name).toBe("Wellness");
    expect(view.current?.title).toBe("Cold bath");
    const spans = Object.fromEntries(
      view.dayBlocks.map((block) => [
        block.name,
        [block.startsAt, block.endsAt],
      ]),
    );
    expect(spans.Wellness).toEqual(["07:05", "08:05"]);
    expect(spans.Training).toEqual(["08:05", "09:02"]);
    expect(spans.Breakfast).toEqual(["09:05", "09:35"]);
    // Dated rows only: each block keeps its own times.
    expect(
      after.blockChanges.every((change) => change.onDate === after.date),
    ).toBe(true);
    expect(after.blocks.find((block) => block.id === T)).toMatchObject({
      startsAt: "08:00",
      endsAt: "08:57",
    });
  });

  it("what the line said is what the tap did", async () => {
    const { server, dateKey, now, read } = setup();
    const closing = (await read(card)).closing!;
    for (const item of closing.left) {
      const plan = doNowPlans(closing, closing.left, now()).get(item.id)!;
      if (!("nextStartsAt" in plan.line)) continue;
      await writeDoNow(server, plan);
      const today = deriveToday(await server.readToday(dateKey));
      const training = today.occurrences.blocks.find(
        (entry) => entry.block.id === T,
      )!;
      expect(training.startsAt).toBe(plan.at);
    }
  });

  it("day events never move", async () => {
    const { server, dateKey } = setup();
    const events = (await server.readToday(dateKey)).dayEvents;
    expect(events.map((event) => event.startsAt)).toEqual(["09:00"]);
    const { after } = await doNow("Cold bath");
    expect(after.dayEvents).toEqual(events);
  });
});

describe("C4: the usual week", () => {
  it("the next Monday reads as it did before the slide", async () => {
    const { server, dateKey, now, read } = setup();
    const next = new Date(`${dateKey}T12:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 7);
    const nextKey = next.toISOString().slice(0, 10);
    const spansOn = async (key: string) =>
      deriveToday(await server.readToday(key)).occurrences.blocks.map(
        (entry) => [entry.block.name, entry.startsAt, entry.endsAt],
      );
    const usual = await spansOn(nextKey);
    expect(usual.length).toBeGreaterThan(0);
    const closing = (await read(card)).closing!;
    const coldBath = closing.left.find((item) => item.title === "Cold bath")!;
    await writeDoNow(
      server,
      doNowPlans(closing, closing.left, now()).get(coldBath.id)!,
    );
    expect(await spansOn(nextKey)).toEqual(usual);
  });
});
