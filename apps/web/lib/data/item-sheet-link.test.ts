import { describe, expect, it } from "vitest";
import { ITEM_SHEET_COPY } from "@/components/planner/item-sheet/copy";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { ITEM_SHEET_LINEAR_IDS } from "@/lib/fixtures/scenarios/item-sheet-linear";
import {
  DRAFT_NOTES,
  ITEM_SHEET_LINK_IDS,
} from "@/lib/fixtures/scenarios/item-sheet-link";
import { createFixtureServer } from "@/lib/fixtures/server";
import { ISSUE_TAKEN } from "@/lib/fixtures/work";
import { deriveToday } from "./derive-today";
import { joinIssue } from "./integration-records";
import {
  ALL_TAB,
  deriveLinkList,
  undoLink,
  writeLink,
} from "./item-sheet-link";
import { deriveWorkSheet } from "./item-sheet-work";

/**
 * USE-68, C1: Link a Linear issue against the fixture server. ENG-151
 * linked to [Draft the onboarding email] gives it the issue's title, size,
 * emoji and ids, and its notes go to the end of the description (on the item
 * and, through the outbox, in Linear); Undo puts the item back exactly and
 * the description with it. ENG-123, already on today, is greyed and refused.
 * The list reads as linear-search.md draws it, and search stays on the
 * device.
 */

const MONDAY = "2026-10-12";
const ID = ITEM_SHEET_LINK_IDS.draft;
const words = { onToday: ITEM_SHEET_COPY.link.onToday };

function setup(state = "item-linear-search") {
  const scenario = resolveScenario(state);
  const now = new Date(scenario.now);
  const server = createFixtureServer(scenario, () => now);

  async function read() {
    const records = await server.readToday(MONDAY);
    const today = deriveToday(records);
    const pool = await server.readPool();
    const linear = await server.readLinear();
    const record = today.records.workItems.find((row) => row.id === ID)!;
    const view = deriveWorkSheet({
      today,
      workItemId: ID,
      sessions: pool.slots,
      issue: joinIssue(linear, record),
    })!;
    const list = (tab = ALL_TAB, query = "") =>
      deriveLinkList({
        linear,
        workItems: today.records.workItems,
        slots: today.records.slots,
        dateKey: MONDAY,
        tab,
        query,
        words,
      });
    return { view, record, linear, list };
  }
  return { server, read };
}

const ids = (rows: readonly { identifier: string }[]) =>
  rows.map((row) => row.identifier);

describe("USE-68 C1: the list", () => {
  it("is open issues, Assigned to Taylor first, ENG-123 greyed where it sits", async () => {
    const { read } = setup();
    const { list, linear } = await read();
    const view = list();
    expect(view.workspaces.map((w) => w.label)).toEqual([
      "Lighthouse",
      "Studio",
    ]);
    expect(ids(view.assigned)).toEqual(["ENG-151", "ENG-142", "ENG-123"]);
    expect(ids(view.other)).toEqual(["STU-14"]);
    const [eng151, eng142, eng123] = view.assigned;
    expect(eng151).toMatchObject({
      title: "[Add retry queue metrics]",
      emoji: "🔄",
      meta: "Sync engine · ENG-151 · 30 min to 1 h",
      size: { points: 2, size: "small" },
    });
    expect(eng142).toMatchObject({
      meta: "Sync engine · ENG-142 · 1 to 2 h",
      size: { points: 3, size: "medium" },
    });
    expect(eng123).toMatchObject({
      meta: "ENG-123 · already on today, in Primary",
      size: null,
      onToday: "primary",
    });
    expect(view.other[0]).toMatchObject({
      emoji: "🌐",
      meta: "Website · STU-14 · 15 to 30 min",
      size: { points: 1, size: "quick" },
    });
    // A tab is one workspace; search is title or ID, any case.
    const studio = linear.connections.find(
      (c) => c.organizationName === "Studio",
    )!;
    expect(ids(list(studio.id).assigned)).toEqual([]);
    expect(ids(list(studio.id).other)).toEqual(["STU-14"]);
    expect(ids(list(ALL_TAB, "eng-14").assigned)).toEqual(["ENG-142"]);
    expect(ids(list(ALL_TAB, "BOOKING").other)).toEqual(["STU-14"]);
  });

  it("asks Linear nothing while typing", async () => {
    const { server, read } = setup();
    const { list } = await read();
    let reads = 0;
    const readLinear = server.readLinear.bind(server);
    server.readLinear = () => {
      reads += 1;
      return readLinear();
    };
    for (const query of ["r", "re", "ret", "retry"]) list(ALL_TAB, query);
    expect(reads).toBe(0);
  });
});

describe("USE-68 C1: the link and its Undo", () => {
  it("takes ENG-151's title, size, emoji and ids, and keeps the notes at the description's end", async () => {
    const { server, read } = setup();
    const before = await read();
    expect(before.record.notes).toBe(DRAFT_NOTES);
    const row = before.list().assigned[0]!;
    const written = await writeLink(server, before.view, row, before.linear);
    expect(written.joined).toBe(true);

    const after = await read();
    const description =
      "[Count retries per mutation and chart the queue depth.]";
    expect(after.record).toMatchObject({
      title: "[Add retry queue metrics]",
      size: "small",
      lengthMinMin: 30,
      lengthMaxMin: 60,
      icon: { kind: "emoji", value: "🔄" },
      notes: `${description}\n\n${DRAFT_NOTES}`,
      linearIdentifier: "ENG-151",
      linearConnectionId: row.connectionId,
      linearIssueId: row.issueId,
    });
    // No new work item: the same one, linked.
    expect(
      after.linear.workspaces
        .flatMap((w) => w.payload.issues)
        .find((i) => i.identifier === "ENG-151")?.description,
    ).toBe(`${description}\n\n${DRAFT_NOTES}`);
    expect(joinIssue(after.linear, after.record)?.identifier).toBe("ENG-151");
    // It leaves the list once linked (an item off today is left out; on today, greyed).
    expect(after.list().assigned[0]).toMatchObject({
      identifier: "ENG-151",
      onToday: "primary",
    });

    await undoLink(server, written);
    const undone = await read();
    expect(undone.record).toEqual(before.record);
    expect(
      undone.linear.workspaces
        .flatMap((w) => w.payload.issues)
        .find((i) => i.identifier === "ENG-151")?.description,
    ).toBe(description);
  });

  it("refuses ENG-123, already on today", async () => {
    const { server, read } = setup();
    const { view, list } = await read();
    const eng123 = list().assigned.find((r) => r.identifier === "ENG-123")!;
    await expect(
      server.linkToLinear({
        workItemId: view.item.id,
        connectionId: eng123.connectionId,
        issueId: eng123.issueId,
      }),
    ).rejects.toThrow(ISSUE_TAKEN);
    expect((await read()).record.linearIssueId).toBeNull();
  });

  it("with no notes, sends nothing to Linear", async () => {
    const { server, read } = setup();
    await server.editWorkItem({ id: ID, notes: null });
    const before = await read();
    const row = before.list().assigned[1]!;
    const written = await writeLink(server, before.view, row, before.linear);
    expect(written).toMatchObject({ joined: false });
    const after = await read();
    expect(after.linear.outbox.filter((r) => r.workItemId === ID)).toEqual([]);
    expect(after.record.title).toBe("[Flaky test in the sync suite]");
  });
});

describe("USE-68: Linear not connected, and the item from Now", () => {
  it("has no workspace to list when Linear is not connected", async () => {
    const scenario = resolveScenario("item-linear-off");
    const server = createFixtureServer(scenario, () => new Date(scenario.now));
    expect((await server.readLinear()).connections).toEqual([]);
  });

  it("keeps the item's own title beside the issue's", async () => {
    const scenario = resolveScenario("item-linear-from-now");
    const server = createFixtureServer(scenario, () => new Date(scenario.now));
    const records = await server.readToday(MONDAY);
    const linear = await server.readLinear();
    const item = records.workItems.find(
      (row) => row.id === ITEM_SHEET_LINK_IDS.review,
    )!;
    expect(item.title).toBe("[Answer the review comments]");
    expect(joinIssue(linear, item)).toMatchObject({
      identifier: "ENG-131",
      title: "[Address review on the sync PR]",
      status: { state: { name: "Todo" } },
    });
    expect(
      records.workItems.some((row) => row.id === ITEM_SHEET_LINEAR_IDS.item),
    ).toBe(true);
  });
});
