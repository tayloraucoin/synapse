/**
 * Add event through the fixtures (USE-53): where an event lands, what moves,
 * Undo, and what is refused in words.
 */
import { describe, expect, it } from "vitest";
import {
  eventWrite,
  landingLine,
  landingOf,
  layBlock,
  openForm,
  reduceForm,
  refusalOf,
  type AddEventForm,
  type EventDay,
} from "@/components/planner/add-event/form";
import { toEventDay } from "@/components/planner/add-event/use-add-event";
import { deriveSetUpDay } from "@/lib/data/use-set-up-day";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { SET_UP_IDS, SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";

/** 12 to 18 October 2026. */
const THIS_WEEK = "2026-W42";
const MON = "2026-10-12";
const KESTREL = "00000000-0000-4000-8000-000000000001";

function setup() {
  const server = createFixtureServer(
    resolveScenario("add-event"),
    () => new Date(SET_UP_NOW),
  );
  return {
    server,
    async day(weekday: number) {
      const records = await server.readWeek(THIS_WEEK);
      return deriveSetUpDay(records.days[weekday]!, records.timeZone);
    },
  };
}

async function eventDay(t: ReturnType<typeof setup>, weekday = 0) {
  return toEventDay(await t.day(weekday)) as EventDay;
}

const designReview = (over: Partial<AddEventForm> = {}) =>
  openForm({
    title: "[Design review]",
    tag: "work",
    startsAt: "11:00",
    endsAt: "11:30",
    ...over,
  });

/** Where each of Work's items starts on the day, the slid left out. */
function workStarts(day: EventDay) {
  const work = day.blocks.find((b) => b.id === SET_UP_IDS.blocks.work)!;
  const bands = day.events.filter(
    (e) => e.startsAt >= work.startsAt && e.startsAt < work.endsAt,
  );
  const lay = layBlock(work, bands);
  return Object.fromEntries(
    work.items.map((item) => [item.title, lay.placed.get(item.id) ?? null]),
  );
}

describe("C5: an event lands where its time falls, moves what follows whole, and Undo puts it back", () => {
  it("at 11:00 it sits inside Work and names what moves (C1's line)", async () => {
    const t = setup();
    const day = await eventDay(t);
    expect(landingLine(designReview(), day, "phone").text).toBe(
      "Sits inside Work at 11:00 as a band. The work around it moves: [Review the Paper handoff] starts at 11:30.",
    );
    const landing = landingOf(designReview(), day);
    expect(landing.inside?.name).toBe("Work");
    expect(landing.moves).toEqual([
      expect.objectContaining({
        title: "[Review the Paper handoff]",
        from: "11:00",
        to: "11:30",
      }),
    ]);
  });

  it("the line changes with every field", async () => {
    const day = await eventDay(setup());
    const later = reduceForm(designReview(), {
      type: "starts",
      startsAt: "15:30",
    });
    expect(later.endsAt).toBe("16:00");
    expect(landingLine(later, day, "phone").text).toBe(
      "Stands as its own block, 15:30 to 16:00.",
    );
    const longer = reduceForm(later, { type: "length", lengthMin: 45 });
    expect(landingLine(longer, day, "phone").text).toBe(
      "Stands as its own block, 15:30 to 16:15.",
    );
  });

  it("adding it moves the handoff to 11:30 whole, slides Stretch then Secondary, and Undo restores the block", async () => {
    const t = setup();
    expect(workStarts(await eventDay(t))).toEqual({
      "[Write the sync spec]": "09:30",
      "[Review the Paper handoff]": "11:00",
      "[Fix the retry backoff]": "11:30",
      "[Tidy the Linear backlog]": "11:45",
    });

    const write = await t.server.writeDayEvent(eventWrite(designReview(), MON));
    const after = await eventDay(t);
    expect((await t.day(0)).events.map((e) => e.title)).toEqual([
      "[Design review]",
    ]);
    // Never split: the handoff starts at the band's end, 30 min long, whole.
    expect(workStarts(after)).toEqual({
      "[Write the sync spec]": "09:30",
      "[Review the Paper handoff]": "11:30",
      "[Fix the retry backoff]": null,
      "[Tidy the Linear backlog]": null,
    });
    const work = after.blocks.find((b) => b.id === SET_UP_IDS.blocks.work)!;
    const slid = layBlock(work, after.events).slid;
    expect(slid.map((id) => work.items.find((i) => i.id === id)?.tier)).toEqual(
      ["stretch", "secondary"],
    );

    await t.server.undo(write.undo);
    const undone = await eventDay(t);
    expect(undone.events).toEqual([]);
    expect(workStarts(undone)["[Review the Paper handoff]"]).toBe("11:00");
  });

  it("only Stretch slides when that is room enough", async () => {
    const work = {
      startsAt: "09:30",
      endsAt: "12:00",
      items: [
        { id: "a", title: "a", lengthMin: 90, atTime: null, tier: "primary" },
        { id: "b", title: "b", lengthMin: 15, atTime: null, tier: "secondary" },
        { id: "c", title: "c", lengthMin: 30, atTime: null, tier: "stretch" },
      ] as const,
    };
    const lay = layBlock(
      { ...work, items: work.items.map((i) => ({ ...i })) },
      [{ startsAt: "11:00", endsAt: "11:30" }],
    );
    expect(lay.slid).toEqual(["c"]);
    expect(lay.placed.get("b")).toBe("11:30");
    expect(lay.noRoom).toBe(false);
  });

  it("an event in no block is its own, and is written to the date only, plum", async () => {
    const t = setup();
    const dentist = openForm({
      title: "Dentist [placeholder]",
      tag: "personal",
      startsAt: "15:30",
      endsAt: "16:15",
    });
    const day = await eventDay(t);
    expect(landingOf(dentist, day).inside).toBeNull();
    const input = eventWrite(dentist, MON);
    expect(input).toMatchObject({
      onDate: MON,
      rrule: null,
      tag: "personal",
      color: null,
      clientId: null,
    });
    await t.server.writeDayEvent(input);
    const after = await t.day(0);
    expect(after.events).toEqual([
      expect.objectContaining({ title: "Dentist [placeholder]", onDate: MON }),
    ]);
  });

  it("an empty name is refused in words, and so is Ends before Starts", async () => {
    const t = setup();
    const unnamed = designReview({ title: "" });
    await expect(
      t.server.writeDayEvent(eventWrite(unnamed, MON)),
    ).rejects.toThrow("Name needed");

    const backwards = designReview({ endsAt: "10:30" });
    expect(refusalOf(backwards, MON)).toBe("Ends after it starts.");
    const day = await eventDay(t);
    expect(landingLine(backwards, day, "phone")).toEqual({
      text: "Ends after it starts.",
      tone: "ink",
    });
    await expect(
      t.server.writeDayEvent(eventWrite(backwards, MON)),
    ).rejects.toThrow("Ends after it starts.");
  });

  it("the desk's line names the block's span and its room (C4)", async () => {
    const t = setup();
    const day = await eventDay(t, 2);
    const call = openForm({
      title: "[Call with Kestrel legal]",
      tag: "work",
      startsAt: "14:00",
      endsAt: "14:30",
    });
    expect(landingLine(call, day, "desk").text).toBe(
      "Sits inside Work, 13:00 to 15:00. Nothing moves: that block has room until 15:00.",
    );
  });

  it("a Synapse event saves in place and Delete event takes it away, with Undo", async () => {
    const t = setup();
    const made = await t.server.writeDayEvent(eventWrite(designReview(), MON));
    const id = made.id!;
    await t.server.writeDayEvent(
      eventWrite(designReview({ id, title: "[Design sync]" }), MON),
    );
    expect((await t.day(0)).events.map((e) => e.title)).toEqual([
      "[Design sync]",
    ]);
    const removed = await t.server.removeDayEvent({ id });
    expect((await t.day(0)).events).toEqual([]);
    await t.server.undo(removed.undo);
    expect((await t.day(0)).events.map((e) => e.id)).toEqual([id]);
  });

  it("a Personal event carries no client", () => {
    const form = reduceForm(designReview({ clientId: KESTREL }), {
      type: "tag",
      tag: "personal",
    });
    expect(eventWrite(form, MON).clientId).toBeNull();
  });
});
