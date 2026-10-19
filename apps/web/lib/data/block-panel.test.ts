import { describe, expect, it } from "vitest";
import type { ClientRecord, WorkItemRecord } from "@syn/validators";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import {
  WEEK_IDS,
  WEEK_TIME_NOW,
  WEEK_TRAINING_IDS,
} from "@/lib/fixtures/scenarios/week";
import { createFixtureServer } from "@/lib/fixtures/server";
import {
  blockPanelHead,
  blockPanelItems,
  blockPanelTiers,
  tierOrderWrites,
} from "./block-panel";
import { PLACE_IDS, readPlaceId, writePlace } from "./place";
import { groupPool } from "./pool-records";
import { writeBlockCheck } from "./use-block-day-writes";
import { deriveBlockView } from "./use-block-view";
import { nextItemInput } from "./use-planner-writes";
import { deriveWeek } from "./use-week";
import { deriveWeekView } from "./week-view";

/**
 * USE-76, the Block panel: a Work block's tiers and a drop on one
 * (C-USE-block-panel-work-block-2, -3), a non-work block's items and a change
 * on its date only (-non-work-block-1, -2), a check from Today
 * (-checking-today-2), and the words: no count, nothing missed (-5).
 */

const B = WEEK_IDS.blocks;
const [MON, TUE] = ["2026-10-12", "2026-10-13"];
const WEEK = "2026-W42";

function setup(scenario = "panel-work") {
  return createFixtureServer(
    resolveScenario(scenario),
    () => new Date(WEEK_TIME_NOW),
  );
}

type Server = ReturnType<typeof setup>;

async function read(server: Server) {
  const [records, poolRecords] = await Promise.all([
    server.readWeek(WEEK),
    server.readPool(),
  ]);
  const week = deriveWeek(records);
  const pool = groupPool(poolRecords);
  const view = deriveWeekView({
    weekKey: WEEK,
    week,
    pool,
    todayKey: MON,
  });
  const clients = new Map(poolRecords.clients.map((c) => [c.id, c]));
  const clientFor = (item: WorkItemRecord): ClientRecord | null =>
    item.clientId ? (clients.get(item.clientId) ?? null) : null;
  return { records, poolRecords, week, view, clientFor };
}

async function workPanel(server: Server, dateKey = TUE) {
  const { week, view, clientFor, records } = await read(server);
  const day = view.days.find((d) => d.dateKey === dateKey)!;
  const tiers = blockPanelTiers({
    week,
    day,
    blockId: B.workMorning,
    clientFor,
    issueFor: () => null,
  });
  const head = blockPanelHead({
    week,
    dateKey,
    blockId: B.workMorning,
    fromToday: false,
    items: null,
  });
  return { tiers, head, records };
}

const everyWord = (value: unknown) => JSON.stringify(value);

describe("C-USE-block-panel-work-block-2: a Work block's slice of the day's tiers", () => {
  it("shows Tue 13's 9:30 Work: Primary, Secondary, Stretch, no Urgent, and the scope line", async () => {
    const { tiers, head } = await workPanel(setup());
    expect(tiers.map((t) => t.word)).toEqual([
      "Primary",
      "Secondary",
      "Stretch",
    ]);
    const [primary, secondary, stretch] = tiers;
    expect(primary!.rows.map((r) => r.title)).toEqual(["[Alder intro]"]);
    expect(primary!.rows[0]!.meta).toContain("session 2 of 3");
    expect(secondary!.rows.map((r) => r.title)).toEqual(["[SMS copy]"]);
    expect(stretch!.rows).toEqual([]);
    expect(head).toMatchObject({
      day: "Tue 13",
      name: "Work",
      kind: "work",
      scope:
        "Tiers belong to Tuesday, not to this block. Items here go first; what's undone carries to the 13:00 Work block.",
    });
    expect(head!.meta).toMatch(
      /^9:30 to 12:00 · ends \d+:\d\d at the top of the ranges$/,
    );
  });

  it("a day's last Work block names no next one", async () => {
    const { week } = await read(setup());
    const head = blockPanelHead({
      week,
      dateKey: TUE,
      blockId: B.workLate,
      fromToday: false,
      items: null,
    });
    expect(head!.scope).toBe(
      "Tiers belong to Tuesday, not to this block. Items here go first; what's undone stays on Tuesday.",
    );
  });
});

describe("C-USE-block-panel-work-block-3: a pool row dropped on a tier", () => {
  it("lands in that tier on that date, and the fit line moves", async () => {
    const server = setup();
    const before = await workPanel(server);
    const { poolRecords } = await read(server);
    const placed = new Set(poolRecords.slots.map((s) => s.workItemId));
    const item = poolRecords.workItems.find(
      (i) => !placed.has(i.id) && i.doneAt === null,
    )!;

    const to = readPlaceId(PLACE_IDS.tier(TUE, B.workMorning, "stretch"));
    expect(to).toEqual({
      kind: "tier",
      dateKey: TUE,
      blockId: B.workMorning,
      tier: "stretch",
    });
    if (to?.kind !== "tier") throw new Error("not a tier");
    await writePlace(
      server,
      { workItemId: item.id },
      { dateKey: to.dateKey, blockId: to.blockId, tier: to.tier },
      poolRecords.slots,
    );

    const after = await workPanel(server);
    const stretch = after.tiers.find((t) => t.tier === "stretch")!;
    expect(stretch.rows.map((r) => r.workItemId)).toEqual([item.id]);
    // Nowhere else: Monday's same block is as it was.
    const monday = await workPanel(server, MON);
    expect(
      monday.tiers.flatMap((t) => t.rows).map((r) => r.workItemId),
    ).not.toContain(item.id);
    expect(after.head!.meta).not.toBe(before.head!.meta);
  });

  it("a grip's new order writes only the slots that moved, in the tier's own places", () => {
    const slots = [
      { id: "a", sortOrder: 2 },
      { id: "b", sortOrder: 5 },
      { id: "c", sortOrder: 9 },
    ];
    expect(tierOrderWrites(slots, ["a", "c", "b"])).toEqual([
      { slotId: "c", sortOrder: 5 },
      { slotId: "b", sortOrder: 9 },
    ]);
    expect(tierOrderWrites(slots, ["a", "b", "c"])).toEqual([]);
  });
});

describe("C-USE-block-panel-non-work-block-1: Training's items", () => {
  it("shows Mon 12's Training on its times, the drives as transitions, ending as planned", async () => {
    const server = setup("panel-training");
    const { records, week } = await read(server);
    const blockView = deriveBlockView(records, B.training, 0)!;
    const rows = blockPanelItems(blockView);
    expect(
      rows.map((r) => [r.startsAt, r.title, r.lengthMin, r.transition]),
    ).toEqual([
      ["08:00", "Drive to the YMCA", 15, true],
      ["08:15", "Workout: gym", 30, false],
      ["08:45", "Drive home", 12, true],
    ]);
    const head = blockPanelHead({
      week,
      dateKey: MON,
      blockId: B.training,
      fromToday: false,
      items: blockView,
    });
    expect(head).toMatchObject({
      day: "Mon 12",
      name: "Training · gym",
      meta: "8:00 to 8:57 · ends 8:57 as planned",
      scope:
        "Changes apply to Monday 12 only. The usual Monday stays as it is.",
    });
  });
});

describe("C-USE-block-panel-non-work-block-2: a change reaches that date only", () => {
  it("adds to Monday 12's Training; the usual Monday and the next Monday keep theirs", async () => {
    const server = setup("panel-training");
    const { records } = await read(server);
    const items = deriveBlockView(records, B.training, 0)!.items;
    await server.writeBlockItem(
      nextItemInput({
        blockId: B.training,
        title: "Stretch",
        items,
        date: MON,
      }),
    );
    const titles = async (week: string) =>
      deriveBlockView(await server.readWeek(week), B.training, 0)!.items.map(
        (i) => i.title,
      );
    expect(await titles(WEEK)).toContain("Stretch");
    expect(await titles("usual")).not.toContain("Stretch");
    expect(await titles("2026-W43")).not.toContain("Stretch");
  });
});

describe("C-USE-block-panel-checking-today-2: a check from Today", () => {
  it("records the planned length as the time taken; the unchecked stay as they are", async () => {
    const server = setup("panel-checking-today");
    const records = await server.readWeek(WEEK);
    const view = deriveBlockView(records, B.training, 0)!;
    const workout = view.items.find((i) => i.id === WEEK_TRAINING_IDS.workout)!;
    expect(workout.done).toBe(true);
    // Uncheck, then check again: the record is the planned 30 min.
    await writeBlockCheck(
      server,
      { blockId: B.training, date: MON },
      workout,
      false,
      new Date(WEEK_TIME_NOW),
    );
    const slot = await writeBlockCheck(
      server,
      { blockId: B.training, date: MON },
      { ...workout, done: false },
      true,
      new Date(WEEK_TIME_NOW),
    );
    expect(slot.tookMin).toBe(30);
    expect(slot.doneAt).not.toBeNull();
    const rows = blockPanelItems(
      deriveBlockView(await server.readWeek(WEEK), B.training, 0)!,
    );
    expect(rows.find((r) => r.title === "Drive home")!.done).toBe(false);
  });
});

describe("C-USE-block-panel-5: no count, nothing missed, from any state", () => {
  it("prints times and lengths only", async () => {
    const work = await workPanel(setup());
    const server = setup("panel-checking-today");
    const { week, records } = await read(server);
    const today = blockPanelHead({
      week,
      dateKey: MON,
      blockId: B.training,
      fromToday: true,
      items: deriveBlockView(records, B.training, 0),
    });
    expect(today).toMatchObject({
      day: "Today",
      scope: "Changes apply to today only. The usual Monday stays as it is.",
    });
    const words = everyWord([work.head, work.tiers, today]);
    expect(words).not.toMatch(
      /missed|late|overdue|\?|\d+ (items|of \d+ done)/i,
    );
  });
});
