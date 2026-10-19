import { describe, expect, it } from "vitest";
import { addDays, weekdayIndex, weekKeyOf } from "@syn/utils";
import {
  blockViewFrom,
  isFocusedPath,
  tabForPath,
} from "@/app/(shell)/_components/nav-items";
import {
  nowMark,
  rowHeightPx,
  spanLabel,
} from "@/components/planner/block-view/geometry";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { NOW_IDS, onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import { todayBlockRoute, withSearch } from "@/lib/routes";
import { writeBlockCheck } from "./use-block-day-writes";
import { deriveBlockView, inOrderOf, type BlockView } from "./use-block-view";
import { nextItemInput } from "./use-planner-writes";

/**
 * Block view from the day (USE-48) against the fixture server: rows from
 * the week's read, a check that stays in place (C-USE-block-view-3), every
 * write today's only (C-USE-block-view-4), the now-line only while current
 * (C-USE-block-view-current-2), and the crumb back to where it came from
 * (C-USE-block-view-2).
 */

const W = NOW_IDS.blocks.wellness;
const I = NOW_IDS.items;

function setup(name = "block-view-success", at = "07:01") {
  const server = createFixtureServer(
    resolveScenario(name),
    () => new Date(Date.parse(onNowDay(at))),
  );
  async function view(date = BASE_DATE): Promise<BlockView> {
    const records = await server.readWeek(weekKeyOf(date));
    const read = deriveBlockView(records, W, weekdayIndex(date));
    if (!read) throw new Error("Wellness is not on the date.");
    return read;
  }
  /** The usual Monday's Wellness: what no change from the day may touch. */
  async function usual() {
    const records = await server.readWeek("usual");
    return deriveBlockView(records, W, weekdayIndex(BASE_DATE));
  }
  return { server, view, usual };
}

const titles = (view: BlockView) => view.items.map((item) => item.title);
const starts = (view: BlockView) => view.items.map((item) => item.startsAt);

describe("Block view's rows (C1)", () => {
  it("reads Wellness in order with its planned starts, free from 7:30", async () => {
    const view = await setup().view();
    expect(titles(view)).toEqual([
      "Pee and weigh",
      "Water",
      "Start the cold bath",
      "Meditate",
      "Cold bath",
    ]);
    expect(starts(view)).toEqual(["07:05", "07:07", "07:08", "07:10", "07:20"]);
    expect(view.reflow.freeFrom).toBe("07:30");
    expect(spanLabel(view.block.startsAt, view.block.endsAt)).toBe(
      "7:05 to 8:00",
    );
  });

  it("draws no row under 56 px and a 10 min row taller", () => {
    expect(rowHeightPx(1)).toBe(56);
    expect(rowHeightPx(2)).toBe(56);
    expect(rowHeightPx(10)).toBe(96);
  });
});

describe("a check (C-USE-block-view-3; D-USE-13)", () => {
  it("records the planned length and the row stays in its place", async () => {
    const { server, view } = setup();
    const before = await view();
    const water = before.items.find((item) => item.id === I.water)!;
    const slot = await writeBlockCheck(
      server,
      { blockId: W, date: BASE_DATE },
      water,
      true,
      new Date(Date.parse(onNowDay("07:01"))),
    );
    expect(slot.tookMin).toBe(1);
    const after = await view();
    expect(titles(after)).toEqual(titles(before));
    expect(after.items.find((item) => item.id === I.water)?.done).toBe(true);
  });

  it("checks a later item ahead of its start, and unchecks it", async () => {
    const { server, view } = setup();
    const place = { blockId: W, date: BASE_DATE };
    const at = new Date(Date.parse(onNowDay("07:01")));
    const coldBath = (await view()).items.find((i) => i.id === I.coldBath)!;
    await writeBlockCheck(server, place, coldBath, true, at);
    const checked = (await view()).items.find((i) => i.id === I.coldBath)!;
    expect(checked.done).toBe(true);
    await writeBlockCheck(server, place, checked, false, at);
    expect((await view()).items.find((i) => i.id === I.coldBath)?.done).toBe(
      false,
    );
  });
});

describe("changes from the day are today's only (C-USE-block-view-4)", () => {
  it("Remove skips the item today; later rows move up by its length", async () => {
    const { server, view, usual } = setup();
    const usualBefore = await usual();
    const write = await server.removeBlockItem({
      id: I.startColdBath,
      date: BASE_DATE,
    });
    const after = await view();
    expect(titles(after)).not.toContain("Start the cold bath");
    expect(starts(after)).toEqual(["07:05", "07:07", "07:08", "07:18"]);
    expect(after.reflow.freeFrom).toBe("07:28");
    expect(await usual()).toEqual(usualBefore);
    // Next Monday still has it.
    expect(titles(await view(addDays(BASE_DATE, 7)))).toContain(
      "Start the cold bath",
    );
    await server.undo(write.undo);
    expect(titles(await view())).toContain("Start the cold bath");
  });

  it("a reorder writes the date's order and flows the times again", async () => {
    const { server, view, usual } = setup();
    const usualBefore = await usual();
    const ids = [
      I.peeAndWeigh,
      I.water,
      I.startColdBath,
      I.coldBath,
      I.meditate,
    ];
    await server.reorderItems({ blockId: W, ids, date: BASE_DATE });
    const after = await view();
    expect(after.items.map((item) => item.id)).toEqual(ids);
    expect(after.items.find((i) => i.id === I.coldBath)?.startsAt).toBe(
      "07:10",
    );
    expect(await usual()).toEqual(usualBefore);
  });

  it("Edit's held drag shows the new times without a write", async () => {
    const before = await setup().view();
    const ids = [
      I.peeAndWeigh,
      I.water,
      I.startColdBath,
      I.coldBath,
      I.meditate,
    ];
    const shown = inOrderOf(before, ids);
    expect(shown.items.map((item) => item.startsAt)).toEqual([
      "07:05",
      "07:07",
      "07:08",
      "07:10",
      "07:20",
    ]);
  });

  it("an add is a dated item, 5 min, after the last", async () => {
    const { server, view, usual } = setup();
    const usualBefore = await usual();
    const before = await view();
    await server.writeBlockItem(
      nextItemInput({
        blockId: W,
        title: "Stretch",
        items: before.items,
        date: BASE_DATE,
      }),
    );
    const after = await view();
    const stretch = after.items.at(-1)!;
    expect(stretch).toMatchObject({
      title: "Stretch",
      lengthMin: 5,
      startsAt: "07:30",
      onDate: BASE_DATE,
    });
    expect(await usual()).toEqual(usualBefore);
  });

  it("Delete block skips today's Wellness; the usual keeps it", async () => {
    const { server, usual } = setup();
    const usualBefore = await usual();
    await server.writeBlockChange({
      blockId: W,
      onDate: BASE_DATE,
      skipped: true,
    });
    const records = await server.readWeek(weekKeyOf(BASE_DATE));
    expect(deriveBlockView(records, W, weekdayIndex(BASE_DATE))).toBeNull();
    expect(await usual()).toEqual(usualBefore);
  });
});

describe("the now-line (D-USE-30)", () => {
  const rows = [
    { id: "a", startsAt: "07:05", lengthMin: 5 },
    { id: "meditate", startsAt: "07:10", lengthMin: 10 },
  ];
  const block = { startsAt: "07:05", endsAt: "08:00" };

  it("crosses the item under way while the block is current", () => {
    expect(nowMark(block, rows, 7 * 60 + 14)).toEqual({
      rowId: "meditate",
      fraction: 0.4,
      label: "7:14",
    });
  });

  it("is not drawn on a block not current (C-USE-block-view-current-2)", () => {
    expect(nowMark(block, rows, 9 * 60 + 40)).toBeNull();
    expect(nowMark(block, rows, 7 * 60)).toBeNull();
    expect(nowMark(block, rows, null)).toBeNull();
  });
});

describe("the crumb and the frame (C-USE-block-view-2)", () => {
  const path = todayBlockRoute(W);

  it("keeps where it was opened, and the capture's query", () => {
    expect(todayBlockRoute(W, "review")).toBe(`${path}?from=review`);
    expect(
      withSearch(todayBlockRoute(W, "schedule"), "?state=block-view-current"),
    ).toBe(`${path}?state=block-view-current&from=schedule`);
  });

  it("is focused from Review the day, with the tabs from Schedule", () => {
    const review = new URLSearchParams("from=review");
    const schedule = new URLSearchParams("from=schedule");
    expect(isFocusedPath(path, review)).toBe(true);
    expect(isFocusedPath(path, schedule)).toBe(false);
    expect(tabForPath(path, schedule)).toBe("schedule");
    // From Now's Edit block: Now's tab [ASSUMPTION].
    expect(isFocusedPath(path)).toBe(false);
    expect(tabForPath(path)).toBe("today");
  });

  it("falls back to the scenario's opening for a bare `?state=`", () => {
    expect(blockViewFrom(new URLSearchParams(""), "schedule")).toBe("schedule");
    expect(blockViewFrom(new URLSearchParams("from=review"), "schedule")).toBe(
      "review",
    );
  });
});
