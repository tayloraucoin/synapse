import { describe, expect, it } from "vitest";
import {
  clockMinutes,
  countSessions,
  spreadPreview,
  type WorkTier,
} from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import {
  SPREAD_PHONE_ITEM,
  SPREAD_PHONE_NOW,
} from "@/lib/fixtures/scenarios/spread";
import { createFixtureServer } from "@/lib/fixtures/server";
import {
  carryDateOf,
  dayRoomOf,
  lengthWords,
  sessionTimesOf,
  shortDate,
  spreadDaysOf,
  workLeftOf,
  writeSpread,
} from "./spread";
import { deriveWeek } from "./use-week";

/**
 * USE-78 on the phone's fixture week (`spread-402`): ALD-22, 10 h, 2 h
 * sessions in Morning Work, Monday 12 at 21:10. The sheet draws
 * `spreadPreview` and these helpers only; nothing here re-counts.
 */

const ALD22 = SPREAD_PHONE_ITEM;
const TUE_TO_FRI = ["2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"];

function setup() {
  return createFixtureServer(
    resolveScenario("spread-402"),
    () => new Date(SPREAD_PHONE_NOW),
  );
}

async function read(server: ReturnType<typeof setup>) {
  const pool = await server.readPool();
  const week = deriveWeek(await server.readWeek("2026-W42"));
  const item = pool.workItems.find((i) => i.id === ALD22)!;
  const days = spreadDaysOf({
    week,
    slots: pool.slots,
    workItems: pool.workItems,
    workItemId: ALD22,
    todayKey: "2026-10-12",
    nowMin: 21 * 60 + 10,
  });
  const workLeftMin = workLeftOf(item, pool.slots);
  const preview = (picked: readonly string[]) =>
    spreadPreview({ workLeftMin, days, picked, pick: "morning", eachMin: 120 });
  return { pool, item, days, workLeftMin, preview };
}

describe("C1: the full sheet's sessions and carry line", () => {
  it("reads 10 h, Tue to Fri 9:30 to 11:30 each, and 2 h carry on to Mon 19", async () => {
    const { days, workLeftMin, preview } = await read(setup());
    expect(lengthWords(workLeftMin)).toBe("10 h");
    const p = preview(TUE_TO_FRI);
    expect(
      p.rows.map((row) => {
        const t = sessionTimesOf(row, days)!;
        return [shortDate(row.dateKey), `${t.start} to ${t.end}`];
      }),
    ).toEqual([
      ["Tue 13", "9:30 to 11:30"],
      ["Wed 14", "9:30 to 11:30"],
      ["Thu 15", "9:30 to 11:30"],
      ["Fri 16", "9:30 to 11:30"],
    ]);
    // Work ends with the session in: never before the session does.
    for (const row of p.rows) {
      const t = sessionTimesOf(row, days)!;
      expect(clockMinutes(t.workEnds)).toBeGreaterThanOrEqual(
        clockMinutes(t.end),
      );
    }
    expect(lengthWords(p.leftMin)).toBe("2 h");
    expect(shortDate(carryDateOf(days)!)).toBe("Mon 19");
  });
});

describe("C2: Days and tier", () => {
  it("offers each weekday by its free time, and today, past 9:30, not at all", async () => {
    const { days } = await read(setup());
    const rooms = days
      .filter((day) => day.blocks.length > 0)
      .map((day) => [day.dateKey, dayRoomOf(day, "morning")] as const);
    expect(rooms[0]).toEqual([
      "2026-10-12",
      { kind: "not", reason: "begun", since: "9:30" },
    ]);
    expect(rooms.slice(1).map(([dateKey]) => dateKey)).toEqual(TUE_TO_FRI);
    for (const [, room] of rooms.slice(1)) {
      expect(room).toMatchObject({ kind: "free" });
    }
  });

  it("unticking a day drops its session and grows the carry line (C-USE-spread-days-and-tier-2)", async () => {
    const { preview } = await read(setup());
    const all = preview(TUE_TO_FRI);
    const less = preview(TUE_TO_FRI.filter((d) => d !== "2026-10-14"));
    expect(less.rows.map((r) => r.dateKey)).toEqual([
      "2026-10-13",
      "2026-10-15",
      "2026-10-16",
    ]);
    expect(less.leftMin).toBe(all.leftMin + 120);
  });
});

describe("Spread it (C-USE-spread-across-the-week-402-3, C-USE-spread-days-and-tier-3)", () => {
  it("places one session per picked day in the tier picked, each n of N, and nothing in Linear", async () => {
    const tier: WorkTier = "secondary";
    const server = setup();
    const before = await server.readLinear();
    const { item, pool, workLeftMin, preview } = await read(server);
    await writeSpread(server, {
      item,
      slots: pool.slots,
      tier,
      rows: preview(TUE_TO_FRI).rows,
      workLeftMin,
    });
    const after = await server.readPool();
    const sessions = after.slots
      .filter((s) => s.workItemId === ALD22)
      .sort((a, b) => (a.onDate! < b.onDate! ? -1 : 1));
    expect(sessions.map((s) => [s.onDate, s.tier, s.lengthMin])).toEqual(
      TUE_TO_FRI.map((d) => [d, tier, 120]),
    );
    const counted = countSessions(
      after.slots.flatMap((s) =>
        s.workItemId === null ? [] : [{ ...s, workItemId: s.workItemId }],
      ),
    );
    expect(sessions.map((s) => counted.get(s.id)?.of)).toEqual([4, 4, 4, 4]);
    expect((await server.readLinear()).outbox).toEqual(before.outbox);
  });
});
