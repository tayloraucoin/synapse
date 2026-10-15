import { describe, expect, it } from "vitest";
import { addDays } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { NOW_IDS, onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { REVIEW_IDS } from "@/lib/fixtures/scenarios/review-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import { readDismissal, writeDismissal } from "@/lib/hooks/use-dismissed";
import { deriveToday } from "./derive-today";
import { nextFreeTimeMin } from "./next-free-time";
import {
  dismissesRailHint,
  FIRST_CHANGE,
  RAIL_HINT,
  showsFirstChangeLine,
} from "./review-first-times";
import {
  writeDayAdd,
  writeDayRemove,
  writeDayReorder,
  writeDaySwap,
  type DayEdit,
} from "./use-day-edits";
import { undoItemWrite } from "./use-item-sheet";
import { deriveReviewDay } from "./use-review-day";

const R = REVIEW_IDS;
/** The Monday a week on: the usual week, untouched by a today-only edit. */
const NEXT_MONDAY = addDays(BASE_DATE, 7);

/**
 * Review the day's edits (USE-37, C5) against the fixture server: each
 * changes today's records only, every usual-week record stays equal, and
 * Undo returns today's records to exactly what they were.
 */
function setup(name = "review-success") {
  const server = createFixtureServer(
    resolveScenario(name),
    () => new Date(Date.parse(onNowDay("06:58"))),
  );
  const today = () => server.readToday(BASE_DATE);
  return {
    server,
    today,
    view: async () => deriveReviewDay(deriveToday(await today())),
    /** Every record the usual week is made of, and the next Monday as read. */
    async usual() {
      const records = await server.readToday(NEXT_MONDAY);
      return {
        blocks: records.blocks.filter((block) => block.onDate === null),
        items: records.blockItems.filter((item) => item.onDate === null),
        nextMonday: deriveReviewDay(deriveToday(records)),
      };
    },
  };
}

async function proveTodayOnly(
  name: string,
  edit: (
    s: ReturnType<typeof setup>,
    records: Awaited<ReturnType<ReturnType<typeof setup>["today"]>>,
  ) => Promise<DayEdit>,
) {
  const s = setup(name);
  const before = await s.today();
  const usual = await s.usual();
  const written = await edit(s, before);
  expect(await s.today()).not.toEqual(before);
  expect(await s.usual()).toEqual(usual);
  await undoItemWrite(s.server, written.undo);
  expect(await s.today()).toEqual(before);
  expect(await s.usual()).toEqual(usual);
  return written;
}

function block(view: Awaited<ReturnType<ReturnType<typeof setup>["view"]>>) {
  return (name: string, startsAt?: string) =>
    view.blocks.find(
      (entry) =>
        entry.name === name &&
        (startsAt === undefined || entry.startsAt === startsAt),
    );
}

describe("C5: a swap lands today only (C-USE-review-the-day-after-swap-undo-1..3)", () => {
  it("puts Yoga in the workout's place, ends Training at 8:50 and keeps the drives", async () => {
    const s = setup();
    const written = await writeDaySwap(
      s.server,
      await s.today(),
      R.items.workout,
      R.items.yoga,
    );
    expect(written.swapped).toEqual({
      item: "Yoga",
      block: "Training",
      endsAt: "08:50",
    });
    const training = block(await s.view())("Training");
    expect(training).toMatchObject({ startsAt: "08:00", endsAt: "08:50" });
    expect(training?.items.map((item) => [item.label, item.tone])).toEqual([
      ["Drive to the YMCA", "transition"],
      ["Yoga", "dot"],
      ["Drive home", "transition"],
    ]);
  });

  it("Undo puts Workout: gym back and Training's end at 8:57, exactly", async () => {
    await proveTodayOnly("review-success", ({ server }, records) =>
      writeDaySwap(server, records, R.items.workout, R.items.yoga),
    );
    const s = setup();
    const written = await writeDaySwap(
      s.server,
      await s.today(),
      R.items.workout,
      R.items.yoga,
    );
    await undoItemWrite(s.server, written.undo);
    const training = block(await s.view())("Training");
    expect(training?.endsAt).toBe("08:57");
    expect(training?.items.map((item) => item.label)).toEqual([
      "Drive to the YMCA",
      "Workout: gym",
      "Drive home",
    ]);
  });
});

describe("C5: an add, a remove and a reorder change today only (C-USE-review-the-day-first-edit-2)", () => {
  it("adds an item to Wellness for today", async () => {
    await proveTodayOnly("review-success", ({ server }, records) =>
      writeDayAdd(server, records, NOW_IDS.blocks.wellness, {
        kind: "item",
        title: "Stretch",
      }),
    );
  });

  it("adds a work item to Primary for today", async () => {
    await proveTodayOnly("review-no-work", ({ server }, records) =>
      writeDayAdd(server, records, NOW_IDS.blocks.work, {
        kind: "work",
        workItemId: R.workItems.primary,
        tier: "primary",
      }),
    );
  });

  it("swipes Lunch away for today, and Undo puts it back", async () => {
    const written = await proveTodayOnly(
      "review-success",
      ({ server }, records) =>
        writeDayRemove(server, records, {
          kind: "block",
          blockId: R.blocks.lunch,
        }),
    );
    expect(written.removed).toBe("Lunch");
    const s = setup();
    await writeDayRemove(s.server, await s.today(), {
      kind: "block",
      blockId: R.blocks.lunch,
    });
    expect(block(await s.view())("Lunch")).toBeUndefined();
  });

  it("takes one item off today, the set item kept", async () => {
    await proveTodayOnly("review-success", ({ server }, records) =>
      writeDayRemove(server, records, {
        kind: "item",
        id: NOW_IDS.items.water,
      }),
    );
  });

  it("reorders Training for today", async () => {
    await proveTodayOnly("review-success", ({ server }, records) =>
      writeDayReorder(server, records, NOW_IDS.blocks.training, [
        R.items.driveHome,
        R.items.workout,
        R.items.driveThere,
      ]),
    );
  });
});

describe("the rail + at the next free time (D-USE-15)", () => {
  const from = 7 * 60 + 5; // Orient's end

  it("is past the day's last block on the Monday, so it rests at the foot", async () => {
    const { view } = setup();
    expect(
      nextFreeTimeMin({ fromMin: from, blocks: (await view()).blocks }),
    ).toBe(15 * 60);
  });

  it("moves to the freed 8:50 after the swap", async () => {
    const s = setup();
    await writeDaySwap(
      s.server,
      await s.today(),
      R.items.workout,
      R.items.yoga,
    );
    expect(
      nextFreeTimeMin({ fromMin: from, blocks: (await s.view()).blocks }),
    ).toBe(8 * 60 + 50);
  });
});

/** A device's localStorage across mornings. */
function storage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
    clear: () => map.clear(),
    key: (index) => [...map.keys()][index] ?? null,
    get length() {
      return map.size;
    },
  };
}

describe("C6: the hint and the first-change line, once (C-USE-review-the-day-first-mornings-2)", () => {
  it("a tap keeps the hint; Got it or a first drag dismisses it for every later morning", () => {
    for (const action of ["got-it", "drag"] as const) {
      const device = storage();
      expect(readDismissal(device, RAIL_HINT, "forever")).toBe(false);
      expect(dismissesRailHint("tap")).toBe(false);
      expect(dismissesRailHint(action)).toBe(true);
      writeDismissal(device, RAIL_HINT, "forever");
      // The next morning, and a month on: still gone.
      expect(readDismissal(device, RAIL_HINT, "forever", "2026-10-13")).toBe(
        true,
      );
      expect(readDismissal(device, RAIL_HINT, "forever", "2026-11-12")).toBe(
        true,
      );
    }
  });

  it("shows the first-change line on the first edit only", () => {
    const device = storage();
    const seenBefore = readDismissal(device, FIRST_CHANGE, "forever");
    expect(showsFirstChangeLine({ seenBefore, changedThisVisit: false })).toBe(
      false,
    );
    expect(showsFirstChangeLine({ seenBefore, changedThisVisit: true })).toBe(
      true,
    );
    writeDismissal(device, FIRST_CHANGE, "forever");
    // A later edit, the same morning's next visit or any morning after.
    const later = readDismissal(device, FIRST_CHANGE, "forever");
    expect(
      showsFirstChangeLine({ seenBefore: later, changedThisVisit: true }),
    ).toBe(false);
  });
});
