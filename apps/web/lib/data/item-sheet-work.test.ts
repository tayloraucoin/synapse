import { describe, expect, it } from "vitest";
import { ITEM_SHEET_COPY } from "@/components/planner/item-sheet/copy";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { ITEM_SHEET_IDS } from "@/lib/fixtures/scenarios/item-sheet";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { joinIssue } from "./integration-records";
import {
  deriveWorkSheet,
  lengthWords,
  stepLength,
  undoWorkSheetWrite,
  writeLength,
  writeMarkTaskDone,
  writeRemoveFromSynapse,
  writeSize,
} from "./item-sheet-work";

/**
 * A work item's Item sheet (USE-65, C1) against the fixture server, read
 * back through `deriveWorkSheet` as the sheet reads it: a size card writes
 * the size, its range and one Linear estimate; Exact is one length; Mark the
 * task done closes the task and every session; Remove from Synapse archives
 * it and writes nothing to Linear.
 */

const MONDAY = "2026-10-12";
const { portal: PORTAL, desk: DESK } = ITEM_SHEET_IDS.work;
const COPY = ITEM_SHEET_COPY.work;

function setup(state = "item-size-and-length") {
  const scenario = resolveScenario(state);
  const now = new Date(scenario.now);
  const server = createFixtureServer(scenario, () => now);
  async function sheet(id: string) {
    const today = deriveToday(await server.readToday(MONDAY));
    const pool = await server.readPool();
    const linear = await server.readLinear();
    const record = today.records.workItems.find((item) => item.id === id)!;
    const view = deriveWorkSheet({
      today,
      workItemId: id,
      sessions: pool.slots,
      issue: joinIssue(linear, record),
    });
    if (view === null) throw new Error(`No work item ${id}.`);
    return view;
  }
  const item = async (id: string) =>
    (await server.readToday(MONDAY)).workItems.find((row) => row.id === id)!;
  const outbox = async (id: string) =>
    (await server.readLinear()).outbox.filter((row) => row.workItemId === id);
  return { server, sheet, item, outbox };
}

describe("the sheet as read", () => {
  it("reads [Portal sign-in]'s scope, size and the top it plans with", async () => {
    const { sheet } = setup();
    const view = await sheet(PORTAL);
    expect(view.ready).toBe(true);
    expect(view.item).toMatchObject({
      title: "[Portal sign-in]",
      size: "medium",
      lengthMinMin: 60,
      lengthMaxMin: 120,
      linked: true,
    });
    expect(view.slot).toMatchObject({
      tier: "primary",
      blockName: "Work",
      startsAt: "09:30",
      today: true,
    });
    expect(view.session).toBeNull();
    // The day plans with the top of the range, never the bottom.
    expect(view.topMin).toBe(120);
    expect(
      COPY.helper(COPY.sizes.medium, lengthWords(view.topMin!), !view.exact),
    ).toBe(
      "Set from Medium; change it freely. The day plans with 2 h, the top of the range.",
    );
  });

  it("reads a session's place and the days Mark the task done closes", async () => {
    const { sheet } = setup("item-work-more-open");
    const view = await sheet(DESK);
    expect(view.session).toEqual({ n: 1, of: 3 });
    expect(view.otherSessions).toEqual(["2026-10-15", "2026-10-19"]);
    expect(COPY.menu.markDoneLine(["Wed", "Thu"], true)).toBe(
      "Closes Wed's and Thu's sessions and the Linear issue",
    );
    expect(COPY.menu.markDoneLine([], false)).toBeNull();
  });

  it("unsized with no length has no top", async () => {
    const { server, sheet } = setup();
    await server.editWorkItem({
      id: PORTAL,
      size: null,
      lengthMinMin: null,
      lengthMaxMin: null,
    });
    const view = await sheet(PORTAL);
    expect(view.topMin).toBeNull();
    expect(COPY.helper(null, null, false)).toBe("");
  });
});

describe("Size and Length (C1, C-USE-item-sheet-size-and-length-1)", () => {
  it("Medium writes its range and one estimate of 3 on a linked item", async () => {
    const { server, sheet, item, outbox } = setup();
    const before = await outbox(DESK);
    await writeSize(server, await sheet(DESK), "medium");
    expect(await item(DESK)).toMatchObject({
      size: "medium",
      lengthMinMin: 60,
      lengthMaxMin: 120,
    });
    const written = (await outbox(DESK)).slice(before.length);
    expect(written).toHaveLength(1);
    expect(written[0]!.kind).toBe("estimate");
    const linear = await server.readLinear();
    expect(joinIssue(linear, await item(DESK))?.estimate).toBe(3);
  });

  it("a Synapse-only item's size writes nothing to Linear", async () => {
    const { server, sheet, outbox } = setup();
    const invoice = (await server.readToday(MONDAY)).workItems.find(
      (row) => row.linearIssueId === null,
    )!;
    await writeSize(server, await sheet(invoice.id), "large");
    expect(await outbox(invoice.id)).toHaveLength(0);
  });

  it("Exact writes one length; a range never inverts", async () => {
    const { server, sheet, item } = setup();
    await writeLength(server, await sheet(PORTAL), { min: 45, max: 45 });
    expect(await item(PORTAL)).toMatchObject({
      lengthMinMin: 45,
      lengthMaxMin: 45,
    });
    expect((await sheet(PORTAL)).exact).toBe(true);
    await writeLength(server, await sheet(PORTAL), { min: 150, max: 90 });
    expect(await item(PORTAL)).toMatchObject({
      lengthMinMin: 150,
      lengthMaxMin: 150,
    });
  });

  it("steps by five minutes under 90, then by half hours", () => {
    expect(stepLength(60, 1)).toBe(65);
    expect(stepLength(85, 1)).toBe(90);
    expect(stepLength(90, 1)).toBe(120);
    expect(stepLength(100, 1)).toBe(120);
    expect(stepLength(120, -1)).toBe(90);
    expect(stepLength(90, -1)).toBe(85);
    expect(stepLength(5, -1)).toBeNull();
    expect([45, 60, 90, 120].map(lengthWords)).toEqual([
      "45 min",
      "1 h",
      "1 h 30",
      "2 h",
    ]);
  });
});

describe("··· (C1, C-USE-item-sheet-work-more-open-2)", () => {
  it("Mark the task done closes the task, every session and the issue", async () => {
    const { server, sheet, item, outbox } = setup("item-work-more-open");
    const view = await sheet(DESK);
    const write = await writeMarkTaskDone(server, view);
    expect((await item(DESK)).doneAt).not.toBeNull();
    for (const dateKey of [MONDAY, ...view.otherSessions]) {
      const sessions = (await server.readToday(dateKey)).slots.filter(
        (slot) => slot.workItemId === DESK,
      );
      expect(sessions.length).toBeGreaterThan(0);
      for (const session of sessions) expect(session.doneAt).not.toBeNull();
    }
    expect((await outbox(DESK)).at(-1)?.kind).toBe("done");

    // Undo opens it again and moves the issue back.
    await undoWorkSheetWrite(server, view, write);
    expect((await item(DESK)).doneAt).toBeNull();
    expect((await outbox(DESK)).at(-1)?.kind).toBe("reopen");
  });

  it("Remove from Synapse archives the item and writes nothing to Linear", async () => {
    const { server, sheet, item, outbox } = setup("item-work-more-open");
    const view = await sheet(DESK);
    const linearBefore = await server.readLinear();
    const issueBefore = joinIssue(linearBefore, await item(DESK));
    const rows = (await outbox(DESK)).length;

    await writeRemoveFromSynapse(server, view);
    const removed = await item(DESK);
    expect(removed.archivedAt).not.toBeNull();
    expect(await outbox(DESK)).toHaveLength(rows);
    const linearAfter = await server.readLinear();
    const issueAfter = joinIssue(linearAfter, removed);
    expect(issueAfter?.status.state.id).toBe(issueBefore?.status.state.id);
    expect(issueAfter?.estimate).toBe(issueBefore?.estimate);
  });
});
