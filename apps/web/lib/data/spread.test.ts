import { describe, expect, it } from "vitest";
import { countSessions, spreadPreview } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { POOL_IDS } from "@/lib/fixtures/scenarios/pool";
import { WEEK_IDS, WEEK_TIME_NOW } from "@/lib/fixtures/scenarios/week";
import { createFixtureServer } from "@/lib/fixtures/server";
import {
  daysWords,
  lengthWords,
  SPREAD_WORDS,
  spreadDaysOf,
  workLeftOf,
  writeSpread,
} from "./spread";
import { deriveWeek } from "./use-week";

/**
 * C2 (USE-77): Add 4 sessions on SYN-218 [Calendar connection settings],
 * 20 h, Morning Work, Tue to Fri, Primary, at 10:20 on Monday 12 Oct.
 */

const SYN218 = POOL_IDS.workItems.syn218;
const MORNING = WEEK_IDS.blocks.workMorning;
const TUE_TO_FRI = ["2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"];

function setup() {
  return createFixtureServer(
    resolveScenario("week-spread"),
    () => new Date(WEEK_TIME_NOW),
  );
}

type Server = ReturnType<typeof setup>;

/** Every row a spread can touch: the pool, the week and Linear's side. */
async function records(server: Server) {
  const [pool, week, linear] = await Promise.all([
    server.readPool(),
    server.readWeek("2026-W42"),
    server.readLinear(),
  ]);
  return { pool, week, linear };
}

async function preview(server: Server) {
  const pool = await server.readPool();
  const week = deriveWeek(await server.readWeek("2026-W42"));
  const item = pool.workItems.find((i) => i.id === SYN218)!;
  const days = spreadDaysOf({
    week,
    slots: pool.slots,
    workItems: pool.workItems,
    workItemId: SYN218,
    todayKey: "2026-10-12",
    nowMin: 10 * 60 + 20,
  });
  const workLeftMin = workLeftOf(item, pool.slots);
  return {
    item,
    pool,
    workLeftMin,
    preview: spreadPreview({
      workLeftMin,
      days,
      picked: TUE_TO_FRI,
      pick: "morning",
      eachMin: "whole",
    }),
  };
}

describe("C1 on the fixture week: the board's preview", () => {
  it("reads 20 h, and Tue 2 h 30, Wed 1 h 30, Thu 1 h, Fri 2 h 30, Monday not offered", async () => {
    const { workLeftMin, preview: p } = await preview(setup());
    expect(lengthWords(workLeftMin)).toBe("20 h");
    expect(
      p.rows.map((row) => [
        row.dateKey,
        row.sharesWith,
        lengthWords(row.getsMin),
      ]),
    ).toEqual([
      ["2026-10-13", [], "2 h 30"],
      ["2026-10-14", ["[Alder intro] 3/3"], "1 h 30"],
      ["2026-10-15", ["[Desk Today layout] 2/3"], "1 h"],
      ["2026-10-16", [], "2 h 30"],
    ]);
    expect(lengthWords(p.totalMin)).toBe("7 h 30");
    expect(lengthWords(p.leftMin)).toBe("12 h 30");
    expect(p.notOffered).toContainEqual({
      dateKey: "2026-10-12",
      reason: "begun",
    });
  });
});

describe("C2: Add 4 sessions places one item's sessions, and Undo takes them all back", () => {
  it("places four sessions of SYN-218 in Primary, each n of 4, leaving 12 h 30 in the pool", async () => {
    const server = setup();
    const before = await records(server);
    const { item, pool, workLeftMin, preview: p } = await preview(server);

    await writeSpread(server, {
      item,
      slots: pool.slots,
      tier: "primary",
      rows: p.rows,
      workLeftMin,
    });

    const after = await records(server);
    // No copy: the same items, four more slots, all SYN-218's.
    expect(after.pool.workItems.map((i) => i.id)).toEqual(
      before.pool.workItems.map((i) => i.id),
    );
    const sessions = after.pool.slots
      .filter((slot) => slot.workItemId === SYN218)
      .sort((a, b) => (a.onDate! < b.onDate! ? -1 : 1));
    expect(
      sessions.map((s) => [s.onDate, s.blockId, s.tier, s.lengthMin]),
    ).toEqual([
      ["2026-10-13", MORNING, "primary", 150],
      ["2026-10-14", MORNING, "primary", 90],
      ["2026-10-15", MORNING, "primary", 60],
      ["2026-10-16", MORNING, "primary", 150],
    ]);
    const counted = countSessions(
      after.pool.slots.flatMap((s) =>
        s.workItemId === null ? [] : [{ ...s, workItemId: s.workItemId }],
      ),
    );
    expect(sessions.map((s) => counted.get(s.id))).toEqual([
      { n: 1, of: 4 },
      { n: 2, of: 4 },
      { n: 3, of: 4 },
      { n: 4, of: 4 },
    ]);

    // Still in the pool, open, its hours as read; what is left is 12 h 30.
    const kept = after.pool.workItems.find((i) => i.id === SYN218)!;
    expect(kept).toEqual(before.pool.workItems.find((i) => i.id === SYN218));
    expect(lengthWords(workLeftOf(kept, after.pool.slots))).toBe("12 h 30");

    // Nothing reaches Linear: no outbox row, the snapshot (estimate too) as it was.
    expect(after.linear.outbox).toEqual(before.linear.outbox);
    expect(after.linear.outbox).toHaveLength(0);
    expect(after.linear.workspaces).toEqual(before.linear.workspaces);

    // Afternoons stay free: nothing of SYN-218 outside Morning Work.
    expect(sessions.every((s) => s.blockId === MORNING)).toBe(true);
  });

  it("Undo removes every one", async () => {
    const server = setup();
    const before = await records(server);
    const { item, pool, workLeftMin, preview: p } = await preview(server);
    const { undo } = await writeSpread(server, {
      item,
      slots: pool.slots,
      tier: "primary",
      rows: p.rows,
      workLeftMin,
    });
    await server.undo(undo);
    expect(await records(server)).toEqual(before);
  });

  it("writes a changed Work left as the item's hours, and Undo puts them back", async () => {
    const server = setup();
    const before = await records(server);
    const { item, pool, preview: p } = await preview(server);
    const { undo } = await writeSpread(server, {
      item,
      slots: pool.slots,
      tier: "primary",
      rows: p.rows,
      workLeftMin: 18 * 60,
    });
    const kept = (await server.readPool()).workItems.find(
      (i) => i.id === SYN218,
    )!;
    expect(kept.lengthMaxMin).toBe(18 * 60);
    expect(lengthWords(workLeftOf(kept, (await server.readPool()).slots))).toBe(
      "10 h 30",
    );
    expect((await server.readLinear()).outbox).toHaveLength(0);
    await server.undo(undo);
    expect(await records(server)).toEqual(before);
  });

  it("refuses them all when a day already holds the item, and writes nothing", async () => {
    const server = setup();
    const { item, pool, workLeftMin, preview: p } = await preview(server);
    await writeSpread(server, {
      item,
      slots: pool.slots,
      tier: "primary",
      rows: p.rows.slice(0, 1),
      workLeftMin,
    });
    const before = await records(server);
    await expect(
      writeSpread(server, {
        item,
        slots: pool.slots,
        tier: "primary",
        rows: p.rows,
        workLeftMin,
      }),
    ).rejects.toThrow();
    expect(await records(server)).toEqual(before);
  });

  it("names the days in the toast", () => {
    expect(SPREAD_WORDS.added(4, daysWords(TUE_TO_FRI))).toBe(
      "4 sessions added, Tue to Fri",
    );
    expect(daysWords(["2026-10-13", "2026-10-15"])).toBe("Tue, Thu");
  });
});
