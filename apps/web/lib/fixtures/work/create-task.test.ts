import { describe, expect, it } from "vitest";
import { PlannerRefusal } from "@/lib/fixtures/planner";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { ADD_IDS } from "@/lib/fixtures/scenarios/add";
import { SET_UP_IDS, SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";
import { NO_WORK_BLOCK } from "./create-task";

/** C5 (USE-51): New task's write through the fixture server, and its Undo. */

const WORK = SET_UP_IDS.blocks.work;
const [MON, WED, SAT] = ["2026-10-12", "2026-10-14", "2026-10-17"];

function setup() {
  return createFixtureServer(
    resolveScenario("add-new-task"),
    () => new Date(SET_UP_NOW),
  );
}

type Server = ReturnType<typeof setup>;

async function snapshot(server: Server) {
  return {
    pool: await server.readPool(),
    week: await server.readWeek("2026-W42"),
  };
}

const item = {
  title: "[Pricing page: tighten the copy]",
  clientId: ADD_IDS.clients.alder,
  size: "medium",
  lengthMinMin: 60,
  lengthMaxMin: 120,
  dueOn: null,
} as const;

describe("C5: New task writes one work item, a slot a day, and nothing to Linear", () => {
  it("two days make one work item and two slots with the tier: sessions, not copies", async () => {
    const server = setup();
    const before = await server.readPool();
    const { id } = await server.createTask({
      item,
      tier: "primary",
      days: [
        { dateKey: MON, blockId: WORK },
        { dateKey: WED, blockId: WORK },
      ],
    });
    const after = await server.readPool();

    const made = after.workItems.filter(
      (row) => !before.workItems.some((old) => old.id === row.id),
    );
    expect(made).toHaveLength(1);
    expect(made[0]).toMatchObject({ id, title: item.title, size: "medium" });

    const sessions = after.slots.filter((slot) => slot.workItemId === id);
    expect(sessions.map((s) => [s.onDate, s.blockId, s.tier])).toEqual([
      [MON, WORK, "primary"],
      [WED, WORK, "primary"],
    ]);
    // After the block's own slots on the day.
    const monday = after.slots.filter(
      (s) => s.onDate === MON && s.blockId === WORK && s.workItemId !== id,
    );
    expect(sessions[0]!.sortOrder).toBeGreaterThan(
      Math.max(...monday.map((s) => s.sortOrder)),
    );
  });

  it("no days writes one work item with no slot and no Linear link (D-USE-57)", async () => {
    const server = setup();
    const { id } = await server.createTask({ item, tier: "primary", days: [] });
    const pool = await server.readPool();
    const made = pool.workItems.find((row) => row.id === id);
    expect(made).toMatchObject({
      linearIdentifier: null,
      linearConnectionId: null,
      linearIssueId: null,
    });
    expect(pool.slots.filter((slot) => slot.workItemId === id)).toEqual([]);
  });

  it("Undo removes the item and every session it wrote, and nothing else", async () => {
    const server = setup();
    const before = await snapshot(server);
    const { undo } = await server.createTask({
      item,
      tier: "secondary",
      days: [
        { dateKey: MON, blockId: WORK },
        { dateKey: WED, blockId: WORK },
      ],
    });
    await server.undo(undo);
    expect(await snapshot(server)).toEqual(before);
  });

  it("a day with no Work block is refused, and nothing lands", async () => {
    const server = setup();
    const before = await snapshot(server);
    await expect(
      server.createTask({
        item,
        tier: "primary",
        days: [
          { dateKey: MON, blockId: WORK },
          { dateKey: SAT, blockId: WORK },
        ],
      }),
    ).rejects.toEqual(new PlannerRefusal("not-on-date", NO_WORK_BLOCK));
    expect(await snapshot(server)).toEqual(before);
  });

  it("refuses what workItemInput refuses, in its words", async () => {
    const server = setup();
    await expect(
      server.createTask({
        item: { ...item, title: "" },
        tier: "primary",
        days: [],
      }),
    ).rejects.toBeInstanceOf(PlannerRefusal);
  });
});
