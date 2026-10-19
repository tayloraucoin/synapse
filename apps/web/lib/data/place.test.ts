import { describe, expect, it } from "vitest";
import { PlannerRefusal } from "@/lib/fixtures/planner";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { WEEK_IDS, WEEK_NOW } from "@/lib/fixtures/scenarios/week";
import { createFixtureServer } from "@/lib/fixtures/server";
import {
  PLACE_WORDS,
  sessionAfterPlacing,
  timeDropTier,
  workBlocksOf,
  writePlace,
} from "./place";
import { deriveWeek } from "./use-week";

/** C2 (USE-75): placing from the pool through the work writes, and its Undo. */

const ALD17 = WEEK_IDS.workItems.ald17;
const MORNING = WEEK_IDS.blocks.workMorning;
const [MON, TUE, WED] = ["2026-10-12", "2026-10-13", "2026-10-14"];

function setup() {
  return createFixtureServer(
    resolveScenario("week-drop"),
    () => new Date(WEEK_NOW),
  );
}

type Server = ReturnType<typeof setup>;

/** Every row a placing can touch: the pool, the week and Linear's side. */
async function records(server: Server) {
  const [pool, week, linear] = await Promise.all([
    server.readPool(),
    server.readWeek("2026-W42"),
    server.readLinear(),
  ]);
  return { pool, week, linear };
}

const datesOf = async (server: Server, workItemId: string) =>
  (await server.readPool()).slots
    .filter((slot) => slot.workItemId === workItemId)
    .map((slot) => slot.onDate)
    .sort();

describe("C2: a second day is a session of the one item", () => {
  it("places ALD-17 on Tue, beside Mon and Wed, as session 2 of 3 of the same item", async () => {
    const server = setup();
    const before = await server.readPool();
    expect(await datesOf(server, ALD17)).toEqual([MON, WED]);

    await writePlace(
      server,
      { workItemId: ALD17 },
      { dateKey: TUE, blockId: MORNING, tier: "primary" },
      before.slots,
    );

    const after = await server.readPool();
    // No copy: the same items, one more slot, and it is ALD-17's.
    expect(after.workItems.map((i) => i.id)).toEqual(
      before.workItems.map((i) => i.id),
    );
    expect(after.slots).toHaveLength(before.slots.length + 1);
    expect(await datesOf(server, ALD17)).toEqual([MON, TUE, WED]);
    expect(sessionAfterPlacing([MON, WED], TUE)).toEqual({ n: 2, of: 3 });
    expect(PLACE_WORDS.addedSession(2, 3)).toBe("Added as session 2 of 3.");
  });

  it("lands after the block's own slots on the date", async () => {
    const server = setup();
    const { slots } = await server.readPool();
    await writePlace(
      server,
      { workItemId: ALD17 },
      { dateKey: TUE, blockId: MORNING, tier: "primary" },
      slots,
    );
    const tue = (await server.readPool()).slots.filter(
      (s) => s.onDate === TUE && s.blockId === MORNING,
    );
    const placed = tue.find((s) => s.workItemId === ALD17)!;
    expect(placed.sortOrder).toBe(
      Math.max(...tue.filter((s) => s !== placed).map((s) => s.sortOrder)) + 1,
    );
  });

  it("refuses ALD-17 on Mon again, and writes nothing", async () => {
    const server = setup();
    const before = await records(server);
    await expect(
      writePlace(
        server,
        { workItemId: ALD17 },
        { dateKey: MON, blockId: MORNING, tier: "secondary" },
        before.pool.slots,
      ),
    ).rejects.toBeInstanceOf(PlannerRefusal);
    expect(await records(server)).toEqual(before);
  });

  it("takes a Linear issue not in the pool into the pool as a work item, and writes nothing to Linear", async () => {
    const server = setup();
    const before = await records(server);
    const issue = before.linear.notInPool.find(
      (i) => i.identifier === "KES-71",
    )!;
    expect(issue).toBeDefined();

    await writePlace(
      server,
      { issueId: issue.id },
      { dateKey: TUE, blockId: MORNING, tier: "primary" },
      before.pool.slots,
    );

    const after = await records(server);
    const made = after.pool.workItems.filter(
      (row) => !before.pool.workItems.some((old) => old.id === row.id),
    );
    expect(made.map((row) => [row.linearIdentifier, row.size])).toEqual([
      ["KES-71", null],
    ]);
    // Unsized takes 30 min [ASSUMPTION, as add/index.md].
    expect(made[0]!.lengthMaxMin).toBe(30);
    expect(
      after.pool.slots.filter((s) => s.workItemId === made[0]!.id),
    ).toMatchObject([{ onDate: TUE, blockId: MORNING, tier: "primary" }]);
    expect(after.linear.outbox).toEqual(before.linear.outbox);
    expect(after.linear.outbox).toHaveLength(0);
    expect(after.linear.workspaces).toEqual(before.linear.workspaces);
  });
});

describe("C2: Undo after each placing leaves the records as before", () => {
  it("takes back a session", async () => {
    const server = setup();
    const before = await records(server);
    const { undo } = await writePlace(
      server,
      { workItemId: ALD17 },
      { dateKey: TUE, blockId: MORNING, tier: "primary" },
      before.pool.slots,
    );
    await server.undo(undo);
    expect(await records(server)).toEqual(before);
  });

  it("takes back a Linear issue's item and its slot", async () => {
    const server = setup();
    const before = await records(server);
    const issue = before.linear.notInPool.find(
      (i) => i.identifier === "KES-71",
    )!;
    const { undo } = await writePlace(
      server,
      { issueId: issue.id },
      { dateKey: TUE, blockId: MORNING, tier: "primary" },
      before.pool.slots,
    );
    await server.undo(undo);
    expect(await records(server)).toEqual(before);
  });

  it("takes back a chip moved to another day, and one sent back to the pool", async () => {
    const server = setup();
    const before = await records(server);
    const wed = before.pool.slots.find(
      (s) => s.workItemId === ALD17 && s.onDate === WED,
    )!;
    const moved = await server.moveWork({ slotId: wed.id, dateKey: TUE });
    expect(await datesOf(server, ALD17)).toEqual([MON, TUE]);
    await server.undo(moved.undo);
    expect(await records(server)).toEqual(before);

    const unplaced = await server.unplaceWork({ slotId: wed.id });
    expect(await datesOf(server, ALD17)).toEqual([MON]);
    await server.undo(unplaced.undo);
    expect(await records(server)).toEqual(before);
  });
});

describe("C-USE-place-from-the-pool-3: a Time lens drop files under the day's first tier with room", () => {
  async function day(server: Server, dateKey: string) {
    const week = deriveWeek(await server.readWeek("2026-W42"));
    return week.days.find((d) => d.date === dateKey)!;
  }

  it("files a Medium item on Friday's empty morning under Primary", async () => {
    const server = setup();
    const fri = await day(server, "2026-10-16");
    expect(
      timeDropTier({
        day: fri,
        blockId: workBlocksOf(fri)[0]!.block.id,
        item: { size: "medium", lengthMaxMin: null },
      }),
    ).toBe("primary");
  });

  it("passes Primary at its usual two on Monday and files under Secondary", async () => {
    const server = setup();
    const mon = await day(server, MON);
    // Monday holds [Portal sign-in] and [Alder intro] in Primary.
    expect(
      timeDropTier({
        day: mon,
        blockId: WEEK_IDS.blocks.workLate,
        item: { size: "quick", lengthMaxMin: null },
      }),
    ).toBe("secondary");
  });

  it("has no tier with room for a Huge item with no top", async () => {
    const server = setup();
    const fri = await day(server, "2026-10-16");
    expect(
      timeDropTier({
        day: fri,
        blockId: workBlocksOf(fri)[0]!.block.id,
        item: { size: "huge", lengthMaxMin: null },
      }),
    ).toBeNull();
  });
});
