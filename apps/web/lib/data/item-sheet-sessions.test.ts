import { describe, expect, it } from "vitest";
import { weekOf } from "@/components/work/add/new-task/form";
import { issueId } from "@/lib/fixtures/integrations/workspaces";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { ITEM_SHEET_IDS } from "@/lib/fixtures/scenarios/item-sheet";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { joinIssue, subIssuesOf } from "./integration-records";
import {
  allSessionsFits,
  dayFit,
  deriveSubIssues,
  firingPanel,
  subIssueTop,
  writeAddSessionDay,
  writeCheckSubIssue,
  writeDropSession,
  writePlaceSubIssue,
} from "./item-sheet-sessions";
import { deriveWorkSheet, writeTier } from "./item-sheet-work";
import { deriveSetUpDay } from "./use-set-up-day";

/**
 * A session's Item sheet (USE-67, C1) against the fixture server, read back
 * as the sheet reads it: All sessions moves every session's tier and This
 * session only Mon 12's; × removes that day's slot only; Add a day places a
 * session; checking a placed sub-issue sets its doneAt and writes one done
 * outbox row, seen under its issue too. Nothing else reaches Linear.
 */

const MONDAY = "2026-10-12";
const { desk: DESK, portal: PORTAL } = ITEM_SHEET_IDS.work;
const SUB_ITEM = ITEM_SHEET_IDS.sessions.subItem;
const SYN_214 = issueId("SYN-214");

function setup(state = "item-tier-and-sessions") {
  const scenario = resolveScenario(state);
  const now = new Date(scenario.now);
  const server = createFixtureServer(scenario, () => now);
  async function read() {
    const today = deriveToday(await server.readToday(MONDAY));
    const pool = await server.readPool();
    const linear = await server.readLinear();
    const record = today.records.workItems.find((row) => row.id === DESK)!;
    const view = deriveWorkSheet({
      today,
      workItemId: DESK,
      sessions: pool.slots,
      issue: joinIssue(linear, record),
    })!;
    const slots = [...pool.slots, ...today.records.slots];
    const subIssues = deriveSubIssues({
      subs: subIssuesOf(linear, record),
      workItems: today.records.workItems,
      slots,
    });
    return { today, view, linear, slots, subIssues };
  }
  async function week() {
    const records = await server.readWeek(weekOf(MONDAY).key);
    return records.days.map((day) => deriveSetUpDay(day, records.timeZone));
  }
  const outbox = async () => (await server.readLinear()).outbox;
  return { server, read, week, outbox, scenario };
}

const tiers = (view: {
  sessions: { dateKey: string; tier: string | null }[];
}) => Object.fromEntries(view.sessions.map((row) => [row.dateKey, row.tier]));

describe("the session's sheet as read", () => {
  it("lists Mon 12 (this one), Wed 14 and Thu 15, and the two sub-issues", async () => {
    const { read } = setup();
    const { view, subIssues } = await read();
    expect(view.session).toEqual({ n: 1, of: 3 });
    expect(tiers(view)).toEqual({
      "2026-10-12": "secondary",
      "2026-10-14": "primary",
      "2026-10-15": "secondary",
    });
    expect(view.sessions.find((row) => row.thisOne)?.dateKey).toBe(MONDAY);
    expect(subIssues.map((sub) => [sub.title, sub.done])).toEqual([
      ["[Rail tabs: Today, Week, Schedule]", true],
      ["[Firing in place on the row]", false],
    ]);
    expect(subIssues[1]!.placed?.dateKey).toBe("2026-10-15");
  });

  it("names each other session whose tier would change under All", async () => {
    const { read, week, scenario } = setup();
    const { view, today, slots } = await read();
    const fits = allSessionsFits({
      view,
      tier: "primary",
      days: await week(),
      workItems: today.records.workItems,
      slots,
      timeZone: scenario.records.timeZone,
    });
    // Wed 14 is already Primary: only Thu 15 changes.
    expect(fits.map((row) => row.dateKey)).toEqual(["2026-10-15"]);
    expect(fits[0]!.fit?.runsTo).toMatch(/^\d{1,2}:\d{2}$/);
  });
});

describe("C1: the writes, through the fixture server", () => {
  it("All sessions moves every session's tier; This session only Mon 12's", async () => {
    const { server, read } = setup();
    const before = await read();
    await writeTier(server, before.view, "urgent", "this");
    expect(tiers((await read()).view)).toEqual({
      "2026-10-12": "urgent",
      "2026-10-14": "primary",
      "2026-10-15": "secondary",
    });

    const again = setup();
    await writeTier(again.server, (await again.read()).view, "primary", "all");
    expect(tiers((await again.read()).view)).toEqual({
      "2026-10-12": "primary",
      "2026-10-14": "primary",
      "2026-10-15": "primary",
    });
    expect(await again.outbox()).toHaveLength(0);
  });

  it("× removes that day's slot only; the task and Linear stay", async () => {
    const { server, read, outbox } = setup();
    const { view } = await read();
    const wed = view.sessions.find((row) => row.dateKey === "2026-10-14")!;
    const written = await writeDropSession(server, view, wed.slotId);
    expect(written).not.toBeNull();
    const after = await read();
    expect(after.view.sessions.map((row) => row.dateKey)).toEqual([
      "2026-10-12",
      "2026-10-15",
    ]);
    expect(after.view.session).toEqual({ n: 1, of: 2 });
    const task = after.today.records.workItems.find((row) => row.id === DESK)!;
    expect(task.doneAt).toBeNull();
    expect(task.archivedAt).toBeNull();
    expect(await outbox()).toHaveLength(0);
    // This one has no ×.
    const mon = view.sessions.find((row) => row.thisOne)!;
    expect(await writeDropSession(server, after.view, mon.slotId)).toBeNull();
    // Undo puts the day back.
    await server.undo(written!.undo);
    expect((await read()).view.sessions).toHaveLength(3);
  });

  it("Add a day places a session in that day's Work block", async () => {
    const { server, read, week } = setup();
    const { view } = await read();
    const fri = (await week()).find((day) => day.date === "2026-10-16")!;
    const work = fri.blocks.find((entry) => entry.block.kind === "work")!;
    await writeAddSessionDay(
      server,
      view,
      { dateKey: "2026-10-16", blockId: work.block.id, tier: "stretch" },
      9,
    );
    const after = await read();
    expect(tiers(after.view)["2026-10-16"]).toBe("stretch");
    expect(after.view.session).toEqual({ n: 1, of: 4 });
  });

  it("checking a placed sub-issue sets its doneAt and writes one done row, seen under its issue", async () => {
    const { server, read, outbox } = setup();
    const { view, subIssues } = await read();
    const sub = subIssues.find((row) => row.issueId === SYN_214)!;
    expect(sub.workItemId).toBe(SUB_ITEM);
    const written = await writeCheckSubIssue(server, view, sub, true);

    const after = await read();
    const item = after.today.records.workItems.find((r) => r.id === SUB_ITEM)!;
    expect(item.doneAt).not.toBeNull();
    // Its slot on Thu 15 closes with it: the row there reads done.
    const thu = after.today.records.slots.find(
      (row) => row.workItemId === SUB_ITEM,
    );
    expect(thu === undefined || thu.doneAt !== null).toBe(true);
    // Under its issue, the checkbox reads Linear's state: checked.
    expect(after.subIssues.find((row) => row.issueId === SYN_214)?.done).toBe(
      true,
    );
    const rows = (await outbox()).filter((row) => row.kind === "done");
    expect(rows).toHaveLength(1);
    expect(rows[0]!.workItemId).toBe(SUB_ITEM);
    // The issue itself is untouched.
    const parent = after.today.records.workItems.find((r) => r.id === DESK)!;
    expect(parent.doneAt).toBeNull();

    await written.undo?.();
    const undone = await read();
    expect(
      undone.today.records.workItems.find((r) => r.id === SUB_ITEM)!.doneAt,
    ).toBeNull();
    expect(undone.subIssues.find((r) => r.issueId === SYN_214)?.done).toBe(
      false,
    );
  });

  it("checking a sub-issue not yet placed writes Linear's row on its issue's item", async () => {
    const { server, read, outbox } = setup("item-sub-issue-alone");
    const { view, subIssues } = await read();
    const sub = subIssues.find((row) => row.issueId === SYN_214)!;
    expect(sub.workItemId).toBeNull();
    await writeCheckSubIssue(server, view, sub, true);
    expect(
      (await read()).subIssues.find((r) => r.issueId === SYN_214)?.done,
    ).toBe(true);
    const rows = await outbox();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ workItemId: DESK, kind: "done" });
  });

  it("Place on a day by itself: its own item under the issue and a slot on Thu 15", async () => {
    const { server, read, week, outbox, scenario } = setup(
      "item-sub-issue-alone",
    );
    const { view, subIssues, today } = await read();
    const sub = subIssues.find((row) => row.issueId === SYN_214)!;
    const days = await week();
    const thu = days.find((day) => day.date === "2026-10-15")!;
    const work = thu.blocks.find((entry) => entry.block.kind === "work")!;
    const fit = dayFit({
      days,
      dateKey: "2026-10-15",
      tier: "secondary",
      topMin: subIssueTop(sub.estimate),
      workItems: today.records.workItems,
      timeZone: scenario.records.timeZone,
    });
    expect(fit?.runsTo).toMatch(/^\d{1,2}:\d{2}$/);

    await writePlaceSubIssue(server, view, sub, {
      dateKey: "2026-10-15",
      blockId: work.block.id,
      tier: "secondary",
    });
    const after = await read();
    const placed = after.subIssues.find((row) => row.issueId === SYN_214)!;
    expect(placed.placed).toMatchObject({
      dateKey: "2026-10-15",
      tier: "secondary",
    });
    const item = after.today.records.workItems.find(
      (row) => row.id === placed.workItemId,
    )!;
    expect(item.parentWorkItemId).toBe(DESK);
    // Still a checkbox under its issue, and nothing went to Linear.
    expect(after.subIssues).toHaveLength(2);
    expect(await outbox()).toHaveLength(0);
  });
});

describe("the firing panel", () => {
  it("reads 22 min firing, the prompt at 11:58 and 40 min worked before it", async () => {
    const scenario = resolveScenario("item-while-firing");
    const now = new Date(scenario.now);
    const server = createFixtureServer(scenario, () => now);
    const today = deriveToday(await server.readToday(MONDAY));
    const slot = today.records.slots.find((row) => row.workItemId === PORTAL)!;
    const clock = today.clock.slots.get(slot.id);
    const dayEnd = new Date("2026-10-13T04:00:00-04:00");
    expect(firingPanel(clock, now, dayEnd, scenario.records.timeZone)).toEqual({
      firing: "22 min",
      sentAt: "11:58",
      worked: "40 min",
    });
  });
});
