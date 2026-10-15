import { describe, expect, it } from "vitest";
import { addDays, weekKeyOf } from "@syn/utils";
import {
  createPlannerQueue,
  repeatingCall,
  type EditRepeating,
} from "@/lib/data/use-planner-writes";
import { deriveSetUpDay } from "@/lib/data/use-set-up-day";
import { resolveScenario } from "../scenarios";
import { SET_UP_IDS, SET_UP_NOW } from "../scenarios/set-up";
import { createFixtureServer } from "../server";
import type { PlannerWrite } from "./index";

/**
 * USE-47's C4: a repeating block changed from a dated day, at each scope,
 * through the same queue and server the page's writes use. Training runs
 * on the weekdays but Wednesday, 8:00 to 8:57; the date asked from is
 * Thursday 15 October.
 */

const B = SET_UP_IDS.blocks;
const I = SET_UP_IDS.items;
const THU = "2026-10-15";
/** Five weeks from Monday 5 October: before the cut and well after it. */
const FIRST = "2026-10-05";
const DAYS = 35;

function setup() {
  const server = createFixtureServer(
    resolveScenario("set-up-usual"),
    () => new Date(SET_UP_NOW),
  );
  const queue = createPlannerQueue(server, true);
  return {
    server,
    edit: (edit: Omit<EditRepeating, "id" | "date">) =>
      queue.run(
        repeatingCall({ id: B.training, date: THU, ...edit }),
      ) as Promise<PlannerWrite>,
    /** Every Training on each date: the date, the block's id, its times, its items. */
    async trainings() {
      const out: {
        date: string;
        id: string;
        startsAt: string;
        items: string[];
      }[] = [];
      const weeks = new Map<
        string,
        Awaited<ReturnType<typeof server.readWeek>>
      >();
      for (let i = 0; i < DAYS; i += 1) {
        const date = addDays(FIRST, i);
        const key = weekKeyOf(date);
        if (!weeks.has(key)) weeks.set(key, await server.readWeek(key));
        const week = weeks.get(key)!;
        const weekday = week.days.findIndex((d) => d.date === date);
        const day = deriveSetUpDay(week.days[weekday]!, week.timeZone);
        for (const b of day.blocks.filter((x) => x.block.name === "Training")) {
          out.push({
            date,
            id: b.block.id,
            startsAt: b.startsAt,
            items: b.items.map((item) => item.title),
          });
        }
      }
      return out;
    },
  };
}

const PATCH = { startsAt: "08:30", endsAt: "09:27" };

describe("C4: This one, This and following, All", () => {
  it("This and following on 15 October: the old block before it, the new from it, no date dropped or doubled", async () => {
    const t = setup();
    const before = await t.trainings();
    expect(before.length).toBeGreaterThan(10);

    const write = await t.edit({ patch: PATCH, scope: "following" });
    const after = await t.trainings();

    // The same dates, each once.
    expect(after.map((x) => x.date)).toEqual(before.map((x) => x.date));
    expect(new Set(after.map((x) => x.date)).size).toBe(after.length);

    for (const x of after) {
      if (x.date < THU) {
        expect(x.id).toBe(B.training);
        expect(x.startsAt).toBe("08:00");
      } else {
        expect(x.id).toBe(write.id);
        expect(x.id).not.toBe(B.training);
        expect(x.startsAt).toBe("08:30");
      }
      // The usual items go on with the new block.
      expect(x.items).toEqual(before.find((y) => y.date === x.date)!.items);
    }

    // Undo puts the one block back on every date.
    await t.server.undo(write.undo);
    expect(await t.trainings()).toEqual(before);
  });

  it("This one writes one block change: only that date moves", async () => {
    const t = setup();
    const before = await t.trainings();
    await t.edit({ patch: PATCH, scope: "this" });
    const after = await t.trainings();
    expect(after.map((x) => x.id)).toEqual(before.map(() => B.training));
    expect(
      after.filter((x) => x.startsAt === "08:30").map((x) => x.date),
    ).toEqual([THU]);
  });

  it("All edits the block: every date moves, before and after", async () => {
    const t = setup();
    await t.edit({ patch: PATCH, scope: "all" });
    const after = await t.trainings();
    expect(after.every((x) => x.id === B.training)).toBe(true);
    expect(after.every((x) => x.startsAt === "08:30")).toBe(true);
  });

  it("a date's own item and slot move with the dates from the cut", async () => {
    const t = setup();
    const own = await t.server.writeBlockItem({
      blockId: B.training,
      title: "Swim",
      lengthMin: 30,
      sortOrder: 5,
      onDate: "2026-10-20",
    });
    await t.server.removeBlockItem({ id: I.workout, date: "2026-10-22" });
    const write = await t.edit({ patch: PATCH, scope: "following" });
    const after = await t.trainings();
    const tuesday = after.find((x) => x.date === "2026-10-20")!;
    const thursday = after.find((x) => x.date === "2026-10-22")!;
    expect(tuesday.id).toBe(write.id);
    expect(tuesday.items).toContain("Swim");
    expect(own.id).toBeDefined();
    // The skipped Workout stays skipped on its date under the new block.
    expect(thursday.items).not.toContain("Workout: gym");
    expect(after.find((x) => x.date === "2026-10-29")!.items).toEqual(
      after
        .find((x) => x.date === "2026-10-27")!
        .items.filter((title) => title !== "Swim"),
    );
  });

  it("refuses a date the block does not run on", async () => {
    const t = setup();
    await expect(
      t.server.splitBlock({
        id: B.training,
        fromDate: "2026-10-14",
        patch: PATCH,
      }),
    ).rejects.toThrow("That block is not on that date.");
  });
});
