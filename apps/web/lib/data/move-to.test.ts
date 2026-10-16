import { describe, expect, it } from "vitest";
import { addDays } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { MOVE_TO_IDS } from "@/lib/fixtures/scenarios/move-to";
import { onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { onMonday } from "@/lib/fixtures/scenarios/today-desk";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import {
  dayTarget,
  deriveMoveTo,
  undoMove,
  writeMove,
  type MoveTarget,
} from "./move-to";

/**
 * Move to's writes (USE-69, C1) against the fixture server, read back as
 * the step reads them: each target changes only the item's slot (its block,
 * its date) or, back to the pool, takes its sessions off; a work item keeps
 * its tier; nothing reaches Linear's outbox and no block item is written;
 * the usual week is as it was; Undo leaves the records as before.
 */

const TUESDAY = addDays(BASE_DATE, 1);
const NEXT_MONDAY = addDays(BASE_DATE, 7);

function setup(state: string, now: string) {
  const server = createFixtureServer(
    resolveScenario(state),
    () => new Date(Date.parse(now)),
  );
  const day = async (date: string) => deriveToday(await server.readToday(date));
  async function view(id: string, nowClock: string) {
    const read = deriveMoveTo({
      today: await day(BASE_DATE),
      tomorrow: await day(TUESDAY),
      id,
      nowClock,
    });
    if (read === null) throw new Error(`No item ${id} today.`);
    return read;
  }
  /** Everything a move may touch, with the stamps left out. */
  async function snapshot() {
    const days = await Promise.all(
      [BASE_DATE, TUESDAY, "2026-10-15", "2026-10-24", NEXT_MONDAY].map(
        (date) => server.readToday(date),
      ),
    );
    const strip = <T extends { updatedAt?: string }>(rows: T[]) =>
      rows
        .map((row) => ({ ...row, updatedAt: undefined }))
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    return {
      slots: strip(days.flatMap((d) => d.slots)),
      blockItems: strip(days[0]!.blockItems),
      blocks: strip(days[0]!.blocks),
      workItems: strip(days[0]!.workItems),
      todos: strip(days[0]!.todos),
      outbox: (await server.readLinear()).outbox,
    };
  }
  return { server, day, view, snapshot };
}

function block(target: MoveTarget | null | undefined) {
  if (!target || target.kind !== "block") throw new Error("Not a block.");
  return target;
}

describe("a plain item (C-USE-move-to-plain-item-1)", () => {
  const now = onNowDay("06:58");

  it("offers Lunch and [Wind down] later today, each with its consequence, and tomorrow's Wellness", async () => {
    const { view } = setup("move-plain", now);
    const read = await view(MOVE_TO_IDS.plain, "06:58");
    const later = read.later.map((t) => block(t));
    const lunch = later.find((t) => t.blockName === "Lunch")!;
    expect(lunch.fit).toMatchObject({ fits: true, freeMin: 20 });
    expect(lunch.after).toEqual({ title: "Lunch", meal: true });
    const wind = later.find((t) => t.blockName === "[Wind down]")!;
    expect(wind.fit).toMatchObject({
      fits: false,
      overMin: 5,
      runsTo: "22:05",
    });
    expect(block(read.tomorrow)).toMatchObject({
      dateKey: TUESDAY,
      blockName: "Wellness",
      startsAt: "07:05",
    });
  });

  it("later today moves only its slot into Lunch; the usual week is unchanged; Undo restores", async () => {
    const { server, view, day, snapshot } = setup("move-plain", now);
    const before = await snapshot();
    const read = await view(MOVE_TO_IDS.plain, "06:58");
    const lunch = block(
      read.later.find((t) => t.kind === "block" && t.blockName === "Lunch"),
    );
    const written = await writeMove(server, read.subject, lunch, BASE_DATE);

    const after = await snapshot();
    expect(after.blockItems).toEqual(before.blockItems);
    expect(after.blocks).toEqual(before.blocks);
    expect(after.outbox).toEqual([]);
    const today = await day(BASE_DATE);
    const slot = today.records.slots.find(
      (s) => s.blockItemId === MOVE_TO_IDS.plain,
    )!;
    expect(slot).toMatchObject({
      blockId: MOVE_TO_IDS.blocks.lunch,
      skipped: false,
    });
    // A week on, the usual Monday still has it in Wellness with no slot.
    const usual = await day(NEXT_MONDAY);
    expect(
      usual.records.slots.some((s) => s.blockItemId === MOVE_TO_IDS.plain),
    ).toBe(false);

    await undoMove(server, written);
    expect(await snapshot()).toEqual(before);
  });

  it("tomorrow leaves it off today (a skipped slot) and puts its slot on Tuesday; Undo restores", async () => {
    const { server, view, day, snapshot } = setup("move-plain", now);
    const before = await snapshot();
    const read = await view(MOVE_TO_IDS.plain, "06:58");
    const written = await writeMove(
      server,
      read.subject,
      block(read.tomorrow),
      BASE_DATE,
    );

    const today = await day(BASE_DATE);
    expect(
      today.records.slots.find((s) => s.blockItemId === MOVE_TO_IDS.plain),
    ).toMatchObject({ skipped: true });
    const tuesday = await day(TUESDAY);
    expect(
      tuesday.records.slots.find((s) => s.blockItemId === MOVE_TO_IDS.plain),
    ).toMatchObject({ skipped: false, onDate: TUESDAY });
    const after = await snapshot();
    expect(after.blockItems).toEqual(before.blockItems);
    expect(after.outbox).toEqual([]);

    await undoMove(server, written);
    expect(await snapshot()).toEqual(before);
  });

  it("a picked day with no Wellness puts it in that day's to-dos (C-USE-move-to-no-block-of-its-kind-1); Undo restores", async () => {
    const { server, view, day, snapshot } = setup("move-no-kind", now);
    const before = await snapshot();
    const read = await view(MOVE_TO_IDS.plain, "06:58");
    const target = dayTarget(await day("2026-10-24"), read.subject, "picked");
    expect(target).toEqual({
      kind: "todos",
      dateKey: "2026-10-24",
      blockKind: "wellness",
    });
    const written = await writeMove(server, read.subject, target, BASE_DATE);
    const todos = (await day(BASE_DATE)).records.todos.filter(
      (t) => t.title === "Meditate",
    );
    expect(todos).toMatchObject([{ onDate: "2026-10-24", lengthMin: 10 }]);
    expect((await snapshot()).blockItems).toEqual(before.blockItems);

    await undoMove(server, written);
    expect(await snapshot()).toEqual(before);
  });

  it("a picked day with Wellness lands at its end with the room left (C-USE-move-to-pick-a-day-1)", async () => {
    const { view, day } = setup("move-pick-a-day", now);
    const read = await view(MOVE_TO_IDS.plain, "06:58");
    const target = block(
      dayTarget(await day("2026-10-15"), read.subject, "picked"),
    );
    expect(target).toMatchObject({
      blockName: "Wellness",
      startsAt: "07:05",
      fit: { fits: true },
    });
  });
});

describe("a work item (C-USE-move-to-2, C-USE-move-to-work-move-to-2)", () => {
  const now = onMonday("09:40");

  it("a later Work block keeps its tier, writes nothing to Linear; Undo restores", async () => {
    const { server, view, day, snapshot } = setup("move-work", now);
    const before = await snapshot();
    const read = await view(MOVE_TO_IDS.work, "09:40");
    expect(read.subject.type).toBe("work");
    const later = block(read.later[0]);
    expect(later).toMatchObject({ blockName: "Work", startsAt: "13:00" });
    // Measured at the top: this session's 20 min, after the tiers at and above Secondary.
    expect(later.fit.runsTo).not.toBeNull();
    const tier = read.subject.type === "work" ? read.subject.tier : null;

    const written = await writeMove(server, read.subject, later, BASE_DATE);
    const slot = (await day(BASE_DATE)).records.slots.find(
      (s) => s.workItemId === MOVE_TO_IDS.work,
    )!;
    expect(slot).toMatchObject({ blockId: later.blockId, tier });
    const after = await snapshot();
    expect(after.workItems).toEqual(before.workItems);
    expect(after.blockItems).toEqual(before.blockItems);
    expect(after.outbox).toEqual([]);

    await undoMove(server, written);
    expect(await snapshot()).toEqual(before);
  });

  it("tomorrow moves the session's date in its tier; Undo restores", async () => {
    const { server, view, day, snapshot } = setup("move-work", now);
    const before = await snapshot();
    const read = await view(MOVE_TO_IDS.work, "09:40");
    const tomorrow = block(read.tomorrow);
    const written = await writeMove(server, read.subject, tomorrow, BASE_DATE);
    expect(
      (await day(TUESDAY)).records.slots.find(
        (s) => s.workItemId === MOVE_TO_IDS.work,
      ),
    ).toMatchObject({
      onDate: TUESDAY,
      tier: read.subject.type === "work" ? read.subject.tier : null,
    });
    expect((await snapshot()).outbox).toEqual([]);

    await undoMove(server, written);
    expect(await snapshot()).toEqual(before);
  });

  it("back to the pool takes it off every day; Undo restores", async () => {
    const { server, view, day, snapshot } = setup("move-work", now);
    const before = await snapshot();
    const read = await view(MOVE_TO_IDS.work, "09:40");
    const written = await writeMove(
      server,
      read.subject,
      { kind: "pool" },
      BASE_DATE,
    );
    expect(
      (await day(BASE_DATE)).records.slots.some(
        (s) => s.workItemId === MOVE_TO_IDS.work,
      ),
    ).toBe(false);
    expect((await snapshot()).outbox).toEqual([]);

    await undoMove(server, written);
    expect(await snapshot()).toEqual(before);
  });
});
