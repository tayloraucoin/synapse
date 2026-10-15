import { describe, expect, it } from "vitest";
import { addDays } from "@syn/utils";
import { ROOM_COPY } from "@/components/planner/room/copy";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { NOW_IDS, onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { REVIEW_IDS } from "@/lib/fixtures/scenarios/review-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import { readDismissal, writeDismissal } from "@/lib/hooks/use-dismissed";
import { deriveToday } from "./derive-today";
import { LATER_START } from "./later-start-flag";
import {
  cutView,
  makeRoomView,
  openingPicks,
  opensLaterStart,
  slideView,
  takesOf,
  toggleBlockCut,
  togglePick,
} from "./room";
import { roomCandidatesOf, roomDayWithRowsOf } from "./room-day";
import type { TodayRecords } from "./today-records";
import { undoItemWrite } from "./use-item-sheet";
import { deriveReviewDay } from "./use-review-day";
import {
  laterStartAskOf,
  writeLaterStart,
  writeMakeRoom,
  writePlace,
} from "./use-room";

/**
 * Finding minutes (USE-41) against the fixture server: every figure is the
 * engine's, every write is today only, and one Undo puts the day back.
 */

const R = REVIEW_IDS;
const B = NOW_IDS.blocks;
const NEXT_MONDAY = addDays(BASE_DATE, 7);
const FOAM_ROLL = {
  blockId: B.training,
  title: "Foam roll [placeholder]",
  lengthMin: 10,
  at: "08:45",
};

function setup(name: string, now: string) {
  const server = createFixtureServer(
    resolveScenario(name),
    () => new Date(Date.parse(onNowDay(now))),
  );
  const today = () => server.readToday(BASE_DATE);
  return {
    server,
    today,
    day: async () => roomDayWithRowsOf(deriveToday(await today())),
    usual: async () =>
      deriveReviewDay(deriveToday(await server.readToday(NEXT_MONDAY))),
  };
}

const makeRoom = () => setup("room-make-room", "06:58");
const later = () => setup("room-later-cut", "08:10");

/** The blocks as "<name> HH:MM-HH:MM", by start; skipped ones gone. */
async function spans(s: ReturnType<typeof setup>) {
  const day = await s.day();
  return day.blocks
    .filter((occurrence) => !occurrence.off)
    .map((o) => `${o.block.name} ${o.startsAt}-${o.endsAt}`)
    .sort((a, b) => a.slice(-11).localeCompare(b.slice(-11)));
}

/** A block's rows on the date as "<title> <min>". */
async function rowsOf(s: ReturnType<typeof setup>, blockId: string) {
  const day = await s.day();
  return (
    day.blocks
      .find((occurrence) => occurrence.block.id === blockId)
      ?.slots.map((slot) => `${slot.title} ${slot.lengthMin}`) ?? []
  );
}

/** Writes, proves today-only, undoes, proves the day back as it was. */
async function proveUndo<
  E extends { undo: Parameters<typeof undoItemWrite>[1] },
>(
  s: ReturnType<typeof setup>,
  write: (records: TodayRecords) => Promise<E>,
  check: (written: E) => Promise<void>,
) {
  const before = await s.today();
  const usual = await s.usual();
  const written = await write(before);
  await check(written);
  expect(await s.usual()).toEqual(usual);
  await undoItemWrite(s.server, written.undo);
  expect(await s.today()).toEqual(before);
  return written;
}

describe("C4: place lands with no sheet when the engine fits or guesses (C-USE-make-room-1)", () => {
  it("fits: an addition with room is added and nothing gives", async () => {
    const s = makeRoom();
    await proveUndo(
      s,
      (records) =>
        writePlace(s.server, records, {
          blockId: R.blocks.afternoonWork,
          title: "Stretch",
          lengthMin: 10,
          at: null,
        }),
      async (written) => {
        expect(written.room).toEqual({
          kind: "placed",
          title: "Stretch",
          block: "Work",
          gave: [],
        });
        expect(await rowsOf(s, R.blocks.afternoonWork)).toContain("Stretch 10");
      },
    );
  });

  it("default: the gap before Breakfast, then 7 min of the workout, with the Toaster naming both", async () => {
    const s = makeRoom();
    await proveUndo(
      s,
      (records) => writePlace(s.server, records, FOAM_ROLL),
      async (written) => {
        expect(written.room.kind).toBe("placed");
        if (written.room.kind !== "placed") return;
        expect(written.room.gave).toEqual([
          { kind: "gap", where: "after", block: "Breakfast", minutes: 3 },
          { kind: "item", title: "Workout: gym", minutes: 7 },
        ]);
        expect(
          ROOM_COPY.makeRoom.placed(written.room.title, written.room.block, [
            { name: ROOM_COPY.makeRoom.gapGave.after("Breakfast"), minutes: 3 },
            { name: "Workout: gym", minutes: 7 },
          ]),
        ).toBe(
          "Foam roll [placeholder] added to Training. The gap before Breakfast gave 3 min and Workout: gym gave 7 min.",
        );
        expect(await spans(s)).toContain("Training 08:00-09:00");
        expect(await rowsOf(s, B.training)).toEqual([
          "Drive to the YMCA 11",
          "Workout: gym 28",
          "Drive home 11",
          "Foam roll [placeholder] 10",
        ]);
      },
    );
  });

  it("ask: with no default to guess, nothing is written and Make room opens", async () => {
    const s = makeRoom();
    const before = await s.today();
    const written = await writePlace(s.server, before, {
      ...FOAM_ROLL,
      lengthMin: 30,
    });
    expect(written).toEqual({
      undo: [],
      room: { kind: "asked", addition: { ...FOAM_ROLL, lengthMin: 30 } },
    });
    expect(await s.today()).toEqual(before);
  });
});

describe("Make room's sheet over the engine (C-USE-make-room-sheet-1, -2; C-USE-make-room-3)", () => {
  it("opens on the workout's 7 and the gap's 3, travel shown and never ticked", async () => {
    const s = makeRoom();
    const day = await s.day();
    const candidates = roomCandidatesOf(day, B.training);
    const view = makeRoomView(day, FOAM_ROLL, {
      picks: openingPicks(candidates, 10),
      source: "this_block",
      candidates,
    });
    expect(view.blockName).toBe("Training");
    expect(
      view.rows.map((row) => [
        row.kind === "gap" ? `before ${row.before}` : row.title,
        row.eligible ? row.picked : row.reason,
        row.nowMin,
      ]),
    ).toEqual([
      ["Workout: gym", 7, 28],
      ["before Breakfast", 3, null],
      ["Drive to the YMCA", "travel", null],
      ["Drive home", "travel", null],
    ]);
    expect(ROOM_COPY.makeRoom.found(view.found, view.needed)).toBe(
      "10 of 10 min found",
    );
    expect(view.ready).toBe(true);
  });

  it("the foot follows a step and an untick; Make room waits until the minutes are found", async () => {
    const s = makeRoom();
    const day = await s.day();
    const candidates = roomCandidatesOf(day, B.training);
    const workout = R.items.workout;
    const stepped = new Map(openingPicks(candidates, 10)).set(workout, 5);
    let view = makeRoomView(day, FOAM_ROLL, {
      picks: stepped,
      source: "this_block",
      candidates,
    });
    expect(ROOM_COPY.makeRoom.found(view.found, view.needed)).toBe(
      "8 of 10 min found",
    );
    expect(view.ready).toBe(false);
    view = makeRoomView(day, FOAM_ROLL, {
      picks: togglePick(candidates, stepped, workout, 10),
      source: "this_block",
      candidates,
    });
    expect(view.found).toBe(3);
    // A travel row never takes a tick.
    const drive = togglePick(candidates, new Map(), R.items.driveThere, 10);
    expect(drive.size).toBe(0);
  });

  it("Make room applies the picks for today; Undo takes the addition off and gives every minute back", async () => {
    const s = makeRoom();
    const day = await s.day();
    const candidates = roomCandidatesOf(day, B.training);
    const takes = takesOf(candidates, openingPicks(candidates, 10));
    await proveUndo(
      s,
      (records) => writeMakeRoom(s.server, records, FOAM_ROLL, takes),
      async () => {
        expect(await rowsOf(s, B.training)).toContain("Workout: gym 28");
        expect(await rowsOf(s, B.training)).toContain(
          "Foam roll [placeholder] 10",
        );
      },
    );
  });
});

describe("A later start (C-USE-later-start-cut-some-2, -3; slide-1, -2)", () => {
  it("asks for the 70 minutes past Up at, from after Orient", async () => {
    const s = later();
    const ask = laterStartAskOf(deriveToday(await s.today()));
    expect(ask).toEqual({ upAt: 420, wokeAt: 490, short: 70, from: 425 });
  });

  it("Cut some lists Wellness and Training; ticks read back in the engine's foot", async () => {
    const s = later();
    const day = await s.day();
    const ask = laterStartAskOf(deriveToday(await s.today()))!;
    const cuts = new Set([NOW_IDS.items.meditate, R.room.journal]);
    const view = cutView(day, ask, { cuts, shown: 2 });
    expect(view.blocks.map((block) => block.name)).toEqual([
      "Wellness",
      "Training",
    ]);
    expect(view.blocks[1]!.rows.map((row) => row.title)).toEqual([
      "Workout: gym",
    ]);
    expect(view.blocks[1]!.travel).toEqual({ count: 2, with: "workout" });
    expect(view.more).toBe(true);
    expect(
      ROOM_COPY.later.cutFoot(
        view.summary!.cut,
        view.summary!.short,
        view.slides,
      ),
    ).toBe("25 of 70 min cut. The rest slides: Breakfast 9:45, Work 10:15.");
    // Cut the block ticks every item in it, then none.
    const all = toggleBlockCut(view, cuts, B.wellness);
    expect(all.size).toBe(view.blocks[0]!.rows.length);
  });

  it("Cut these takes the ticks off today and slides the rest; Undo restores the day", async () => {
    const s = later();
    await proveUndo(
      s,
      (records) =>
        writeLaterStart(s.server, records, {
          tab: "cut",
          cuts: [NOW_IDS.items.meditate, R.room.journal],
        }),
      async (written) => {
        expect(written.room).toEqual({
          kind: "cut",
          names: ["Meditate", "Journal [placeholder]"],
          stillShort: 45,
        });
        const now = await spans(s);
        expect(now.slice(0, 4)).toEqual([
          "Wellness 08:15-08:45",
          "Training 08:45-09:42",
          "Breakfast 09:45-10:15",
          "Work 10:15-12:45",
        ]);
        const wellness = await rowsOf(s, B.wellness);
        expect(wellness).not.toContain("Meditate 10");
        expect(wellness).not.toContain("Journal [placeholder] 15");
      },
    );
  });

  it("cutting the workout takes its drives with it, and Training is off today", async () => {
    const s = later();
    await proveUndo(
      s,
      (records) =>
        writeLaterStart(s.server, records, {
          tab: "cut",
          cuts: [R.items.workout],
        }),
      async () => {
        expect(
          (await spans(s)).some((span) => span.startsWith("Training")),
        ).toBe(false);
      },
    );
  });

  it("Slide keeps every length, Call with Sam stays at 11:00 inside Work, and the day ends 23:40", async () => {
    const s = later();
    const day = await s.day();
    const ask = laterStartAskOf(deriveToday(await s.today()))!;
    const view = slideView(day, ask, { shown: 4 });
    expect(view.rows.map((row) => `${row.name} ${row.from}→${row.to}`)).toEqual(
      [
        "Wellness 07:05→08:15",
        "Training 08:00→09:10",
        "Breakfast 09:00→10:10",
        "Work 09:30→10:40",
      ],
    );
    expect(view.setTimes).toEqual([
      {
        id: R.room.callWithSam,
        title: "Call with Sam [placeholder]",
        at: "11:00",
        block: "Work",
      },
    ]);
    expect(ROOM_COPY.later.setTime(view.setTimes[0]!.at, "Work")).toBe(
      "At a set time, stays at 11:00. Work splits around it.",
    );
    expect(ROOM_COPY.later.slideFoot(view.minutes, view.dayEnd!.to)).toBe(
      "The day ends 70 min later: Lights out at 23:40.",
    );
    await proveUndo(
      s,
      (records) => writeLaterStart(s.server, records, { tab: "slide" }),
      async (written) => {
        expect(written.room).toEqual({ kind: "slid", minutes: 70 });
        expect((await spans(s)).slice(0, 4)).toEqual([
          "Wellness 08:15-09:10",
          "Training 09:10-10:07",
          "Breakfast 10:10-10:40",
          "Work 10:40-13:10",
        ]);
      },
    );
  });
});

/** An in-memory Storage for the day flag. */
function memoryStore(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => void map.delete(key),
    setItem: (key, value) => void map.set(key, value),
  };
}

describe("C5: the later-start sheet opens by itself once a day, from 15 min past Up at (C-USE-later-start-1)", () => {
  it("opens at 15 minutes and more, never on a day on time or nearly so", () => {
    const upAt = 7 * 60;
    expect(
      opensLaterStart({ wake: { upAt, wokeAt: upAt + 70 }, flagged: false }),
    ).toBe(true);
    expect(
      opensLaterStart({ wake: { upAt, wokeAt: upAt + 15 }, flagged: false }),
    ).toBe(true);
    expect(
      opensLaterStart({ wake: { upAt, wokeAt: upAt + 14 }, flagged: false }),
    ).toBe(false);
    expect(opensLaterStart({ wake: null, flagged: false })).toBe(false);
  });

  it("never twice that day: the date's flag holds it shut, and the next day it may open again", () => {
    const store = memoryStore();
    const wake = { upAt: 420, wokeAt: 490 };
    expect(readDismissal(store, LATER_START, "day", BASE_DATE)).toBe(false);
    writeDismissal(store, LATER_START, "day", BASE_DATE);
    const flagged = readDismissal(store, LATER_START, "day", BASE_DATE);
    expect(opensLaterStart({ wake, flagged })).toBe(false);
    expect(
      readDismissal(store, LATER_START, "day", addDays(BASE_DATE, 1)),
    ).toBe(false);
  });

  it("USE-38's late frames pin the flag so they stay as drawn; the room scenarios leave it unset", () => {
    expect(resolveScenario("review-late").seen).toContain(LATER_START);
    expect(resolveScenario("review-late-passed-open").seen).toContain(
      LATER_START,
    );
    expect(resolveScenario("room-later-cut").seen ?? []).not.toContain(
      LATER_START,
    );
    expect(resolveScenario("review-success").seen ?? []).not.toContain(
      LATER_START,
    );
  });

  it("the words never use the second person or a verdict (C-USE-later-start-3)", () => {
    const words = [
      ROOM_COPY.later.scope("08:10", "07:00"),
      ROOM_COPY.later.title,
      ROOM_COPY.later.line(70),
      ROOM_COPY.later.cutFoot(25, 70, [{ name: "Breakfast", at: "09:45" }]),
      ROOM_COPY.later.slideFoot(70, "23:40"),
      ROOM_COPY.later.notNow,
    ].join(" ");
    expect(words).not.toMatch(/\b(you|your|late|missed|behind|overdue)\b/i);
    expect(ROOM_COPY.later.scope("08:10", "07:00")).toBe(
      "Up at 8:10 · planned from 7:00",
    );
  });
});
