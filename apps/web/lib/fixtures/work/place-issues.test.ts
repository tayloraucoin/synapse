import { describe, expect, it } from "vitest";
import { issueLength, sizeOfEstimate } from "@/lib/data/linear-size";
import { PlannerRefusal } from "@/lib/fixtures/planner";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { FROM_LINEAR_IDS } from "@/lib/fixtures/scenarios/from-linear";
import { SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";

/** C2 (USE-52): From Linear's write through the fixture server, and its Undo. */

const { monday: MON, work: WORK } = FROM_LINEAR_IDS;
const TUE = "2026-10-13";
const SAT = "2026-10-17";

function setup() {
  return createFixtureServer(
    resolveScenario("from-linear-by-size"),
    () => new Date(SET_UP_NOW),
  );
}

describe("C2: the size sets the length, the estimate the size", () => {
  it("maps Linear's points to the five words, the nearest on another scale", () => {
    expect([1, 2, 3, 5, 8].map((p) => sizeOfEstimate(p))).toEqual([
      "quick",
      "small",
      "medium",
      "large",
      "huge",
    ]);
    expect(sizeOfEstimate(4)).toBe("medium");
    expect(sizeOfEstimate(13)).toBe("huge");
    expect(sizeOfEstimate(null)).toBeNull();
    expect(sizeOfEstimate(0)).toBeNull();
  });

  it("takes the size's range; no estimate is 30 min", () => {
    expect(issueLength(2)).toEqual({
      size: "small",
      lengthMinMin: 30,
      lengthMaxMin: 60,
    });
    expect(issueLength(8)).toEqual({
      size: "huge",
      lengthMinMin: 240,
      lengthMaxMin: null,
    });
    expect(issueLength(null)).toEqual({
      size: null,
      lengthMinMin: 30,
      lengthMaxMin: 30,
    });
  });
});

describe("C2: adding ticked issues makes a work item each and slots it in the tier", () => {
  it("creates one linked item per issue with its size's range, each slotted in Primary on Mon 12", async () => {
    const server = setup();
    const before = await server.readPool();
    await server.placeIssues({
      issueIds: [...FROM_LINEAR_IDS.ticked, FROM_LINEAR_IDS.noEstimate],
      dateKey: MON,
      blockId: WORK,
      tier: "primary",
    });
    const after = await server.readPool();

    const made = after.workItems.filter(
      (row) => !before.workItems.some((old) => old.id === row.id),
    );
    expect(
      made.map((row) => [
        row.linearIdentifier,
        row.size,
        row.lengthMinMin,
        row.lengthMaxMin,
      ]),
    ).toEqual([
      ["ENG-151", "small", 30, 60],
      ["ENG-142", "medium", 60, 120],
      ["SYN-224", null, 30, 30],
    ]);
    for (const row of made) {
      expect(row.linearConnectionId).not.toBeNull();
      expect(row.linearIssueId).toBe(`issue-${row.linearIdentifier}`);
    }

    const slots = after.slots.filter((slot) =>
      made.some((row) => row.id === slot.workItemId),
    );
    expect(slots.map((s) => [s.onDate, s.blockId, s.tier])).toEqual([
      [MON, WORK, "primary"],
      [MON, WORK, "primary"],
      [MON, WORK, "primary"],
    ]);
    // After the block's own slots, in the order ticked.
    const own = after.slots.filter(
      (s) => s.onDate === MON && s.blockId === WORK && !slots.includes(s),
    );
    expect(slots[0]!.sortOrder).toBeGreaterThan(
      Math.max(...own.map((s) => s.sortOrder)),
    );
    expect(slots.map((s) => s.sortOrder)).toEqual(
      [...slots.map((s) => s.sortOrder)].sort((a, b) => a - b),
    );
  });

  it("one Undo takes back every item and slot", async () => {
    const server = setup();
    const before = await server.readPool();
    const { undo } = await server.placeIssues({
      issueIds: [...FROM_LINEAR_IDS.ticked],
      dateKey: MON,
      blockId: WORK,
      tier: "primary",
    });
    await server.undo(undo);
    const after = await server.readPool();
    expect(after.workItems.map((r) => r.id)).toEqual(
      before.workItems.map((r) => r.id),
    );
    expect(after.slots.map((s) => s.id)).toEqual(before.slots.map((s) => s.id));
  });
});

describe("C2: an issue already on that date is refused", () => {
  it("refuses ENG-123 on Mon 12, where it sits in Primary, and lands nothing", async () => {
    const server = setup();
    const before = await server.readPool();
    await expect(
      server.placeIssues({
        issueIds: [FROM_LINEAR_IDS.ticked[0], FROM_LINEAR_IDS.syncSpec],
        dateKey: MON,
        blockId: WORK,
        tier: "primary",
      }),
    ).rejects.toBeInstanceOf(PlannerRefusal);
    const after = await server.readPool();
    expect(after.workItems).toHaveLength(before.workItems.length);
    expect(after.slots).toHaveLength(before.slots.length);
  });

  it("places it on another date as a session of the same item", async () => {
    const server = setup();
    const before = await server.readPool();
    const linked = before.workItems.find(
      (r) => r.linearIdentifier === "ENG-123",
    )!;
    await server.placeIssues({
      issueIds: [FROM_LINEAR_IDS.syncSpec],
      dateKey: TUE,
      blockId: WORK,
      tier: "primary",
    });
    const after = await server.readPool();
    expect(after.workItems).toHaveLength(before.workItems.length);
    expect(
      after.slots
        .filter((s) => s.workItemId === linked.id)
        .map((s) => s.onDate),
    ).toEqual([MON, TUE]);
  });

  it("refuses the same issue twice in one add, and a day with no Work block", async () => {
    const server = setup();
    await expect(
      server.placeIssues({
        issueIds: [FROM_LINEAR_IDS.ticked[0], FROM_LINEAR_IDS.ticked[0]],
        dateKey: MON,
        blockId: WORK,
        tier: "primary",
      }),
    ).rejects.toBeInstanceOf(PlannerRefusal);
    await expect(
      server.placeIssues({
        issueIds: [FROM_LINEAR_IDS.ticked[0]],
        dateKey: SAT,
        blockId: WORK,
        tier: "primary",
      }),
    ).rejects.toBeInstanceOf(PlannerRefusal);
  });
});

describe("C2: nothing is written to Linear (D-USE-57)", () => {
  it("leaves the outbox empty and the snapshot as it was", async () => {
    const server = setup();
    const before = await server.readLinear();
    await server.placeIssues({
      issueIds: [...FROM_LINEAR_IDS.ticked],
      dateKey: MON,
      blockId: WORK,
      tier: "primary",
    });
    const after = await server.readLinear();
    expect(after.outbox).toEqual(before.outbox);
    expect(after.outbox).toHaveLength(0);
    expect(after.workspaces).toEqual(before.workspaces);
    // Placed issues leave the not-in-pool list; nothing else changes.
    expect(after.notInPool.map((i) => i.identifier)).not.toContain("ENG-151");
  });
});
