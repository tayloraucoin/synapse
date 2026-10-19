/**
 * Google events on the day through the fixtures (USE-109; google-events.md):
 * a yes is a read-only band the work re-flows past, a maybe is a dashed
 * offer whose Add to day writes one day event with Undo, a no and the usual
 * week show nothing.
 */
import { describe, expect, it } from "vitest";
import {
  ownEventCards,
  ownOffers,
  withEventBands,
  type GoogleOnDay,
} from "@/app/(shell)/days/_components/event-bands";
import {
  addToDayInput,
  bandShapeOf,
  googleBandsOf,
  type GoogleDayEvent,
} from "@/lib/data/google-bands";
import { setUpColumn } from "@/lib/data/set-up-view";
import { deriveSetUpDay } from "@/lib/data/use-set-up-day";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import {
  GOOGLE_EVENT_IDS,
  SET_UP_IDS,
  SET_UP_NOW,
} from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";

/** 12 to 18 October 2026. */
const THIS_WEEK = "2026-W42";
const MON = "2026-10-12";

function setup() {
  const server = createFixtureServer(
    resolveScenario("google-events"),
    () => new Date(SET_UP_NOW),
  );
  return {
    server,
    async day(week = THIS_WEEK, weekday = 0) {
      const records = await server.readWeek(week);
      return deriveSetUpDay(records.days[weekday]!, records.timeZone);
    },
  };
}

async function onDay(t: ReturnType<typeof setup>, week = THIS_WEEK) {
  const day = await t.day(week);
  const events = day.date ? await t.server.readGoogleEvents(day.date) : [];
  const added: GoogleDayEvent[] = [];
  const google: GoogleOnDay = {
    bands: googleBandsOf(day, events),
    addToDay: (event) => added.push(event),
  };
  const view = setUpColumn(day);
  const blocks = withEventBands(view.blocks, day, () => {}, google);
  const work = blocks.find((b) => b.id === SET_UP_IDS.blocks.work)!;
  return {
    day,
    google,
    added,
    work,
    own: ownEventCards(view.blocks, day, () => {}, google),
    offers: ownOffers(view.blocks, google),
  };
}

/** Work's items as the column labels them, segment by segment. */
function workLabels(work: Awaited<ReturnType<typeof onDay>>["work"]) {
  return (work.segments ?? []).map((segment) =>
    segment.tiers.flatMap((tier) => tier.items.map((item) => item.label)),
  );
}

describe("C1 and C5: an accepted event is a read-only plum band ending in 'Google', and the work after it re-flows", () => {
  it("draws Standup as a band in Work, plum, 'Google' at its end, with no tap", async () => {
    const { work } = await onDay(setup());
    expect(work.bands).toHaveLength(1);
    const standup = work.bands![0]!;
    expect(standup).toMatchObject({
      id: GOOGLE_EVENT_IDS.standup,
      title: "[Standup]",
      startsAt: "10:30",
      endsAt: "11:00",
      hue: "plum",
      meta: "10:30 to 11:00",
      event: { tag: "Google" },
    });
    expect(standup.event?.onOpen).toBeUndefined();
  });

  it("moves the handoff to the band's end, as a day event does", async () => {
    const { work } = await onDay(setup());
    expect(workLabels(work)).toEqual([
      ["[Write the sync spec] · ENG-123"],
      [
        "[Review the Paper handoff] · 11:00",
        "[Fix the retry backoff] · ENG-140 · 11:30",
        "[Tidy the Linear backlog] · 11:45",
      ],
    ]);
  });
});

describe("C2: a maybe is a dashed band with Add to day, which lands a day event for that date with Undo", () => {
  it("offers Coffee with Ana in Work, after the band, taking no time", async () => {
    const t = setup();
    const { work, added } = await onDay(t);
    expect(work.offers).toEqual([
      expect.objectContaining({
        id: GOOGLE_EVENT_IDS.coffee,
        startsAt: "11:00",
        title: "[Coffee with Ana]",
        meta: "11:00 · maybe",
        actionLabel: "Add to day",
      }),
    ]);
    // No time taken: the handoff still starts at 11:00, at the band's end.
    expect(workLabels(work)[1]![0]).toBe("[Review the Paper handoff] · 11:00");
    work.offers![0]!.onAdd!();
    expect(added.map((e) => e.id)).toEqual([GOOGLE_EVENT_IDS.coffee]);
  });

  it("not answered is dashed too", () => {
    expect(bandShapeOf({ answer: "none", date: MON }, MON)).toBe("dashed");
    expect(bandShapeOf({ answer: "maybe", date: MON }, MON)).toBe("dashed");
  });

  it("Add to day writes one day event on that date only; it then draws as a read-only band, and Undo takes it off", async () => {
    const t = setup();
    const coffee = (await t.server.readGoogleEvents(MON)).find(
      (e) => e.id === GOOGLE_EVENT_IDS.coffee,
    )!;
    const write = await t.server.writeDayEvent(addToDayInput(coffee));
    expect(write.undo).toEqual(expect.any(String));

    const after = await onDay(t);
    const rows = after.day.events.filter((e) => e.title === coffee.title);
    expect(rows).toEqual([
      expect.objectContaining({
        onDate: MON,
        rrule: null,
        startsAt: "11:00",
        endsAt: "11:30",
      }),
    ]);
    // Drawn once, as its Google band: no offer, no editable Synapse band.
    expect(after.work.offers).toBeUndefined();
    expect(after.work.bands!.map((b) => [b.title, b.event?.tag])).toEqual([
      ["[Standup]", "Google"],
      ["[Coffee with Ana]", "Google"],
    ]);
    expect(after.work.bands!.every((b) => b.event?.onOpen === undefined)).toBe(
      true,
    );
    // Only Monday 12 has it.
    const tuesday = await t.day(THIS_WEEK, 1);
    expect(tuesday.events.some((e) => e.title === coffee.title)).toBe(false);

    await t.server.undo(write.undo);
    const undone = await onDay(t);
    expect(undone.day.events.some((e) => e.title === coffee.title)).toBe(false);
    expect(undone.work.offers?.map((o) => o.id)).toEqual([
      GOOGLE_EVENT_IDS.coffee,
    ]);
  });
});

describe("C3: a declined event is not drawn, and the usual week shows no Google events", () => {
  it("hides the declined Vendor call, and Holidays' event, whose calendar is off", async () => {
    const t = setup();
    const { work, own, offers, google } = await onDay(t);
    const drawn = [
      ...(work.bands ?? []).map((b) => b.id),
      ...(work.offers ?? []).map((o) => o.id),
      ...own.map((e) => e.id),
      ...offers.map((o) => o.id),
    ];
    expect(drawn).not.toContain(GOOGLE_EVENT_IDS.vendorCall);
    expect(drawn).not.toContain(GOOGLE_EVENT_IDS.holiday);
    expect(
      [...google.bands.bands, ...google.bands.dashed].map((e) => e.id),
    ).toEqual([GOOGLE_EVENT_IDS.standup, GOOGLE_EVENT_IDS.coffee]);
    expect(bandShapeOf({ answer: "no", date: MON }, MON)).toBe("hidden");
  });

  it("the usual week's Monday draws none of them", async () => {
    const t = setup();
    const events = await t.server.readGoogleEvents(MON);
    const usual = await t.day("usual");
    expect(usual.date).toBeNull();
    expect(googleBandsOf(usual, events)).toEqual({
      bands: [],
      dashed: [],
      covered: [],
    });
    for (const event of events) {
      expect(bandShapeOf(event, null)).toBe("hidden");
    }
  });
});
