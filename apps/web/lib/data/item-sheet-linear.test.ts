import { describe, expect, it } from "vitest";
import { weekKeyOf } from "@syn/utils";
import { ITEM_SHEET_COPY } from "@/components/planner/item-sheet/copy";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { ITEM_SHEET_LINEAR_IDS } from "@/lib/fixtures/scenarios/item-sheet-linear";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { joinIssue, statesOfTeam } from "./integration-records";
import {
  deriveLinearView,
  retryLinear,
  sizeFromIssue,
  writeStatus,
  writeUnlink,
} from "./item-sheet-linear";
import { deriveWorkSheet } from "./item-sheet-work";
import { deriveTodayWork } from "./today-work";
import { deriveWeek } from "./use-week";
import { deriveWeekView } from "./week-view";

/**
 * USE-66, C1: a linked work item's Linear side against the fixture server,
 * read back as the sheet reads it. Each Lighthouse status picked writes one
 * outbox row and takes statusEffect's consequence here; Unlink keeps the
 * description as notes, clears the link, writes nothing to Linear, and Undo
 * puts it back. The lines under the Linear line read as the state files.
 */

const MONDAY = "2026-10-12";
const ID = ITEM_SHEET_LINEAR_IDS.item;
const SLOT = ITEM_SHEET_LINEAR_IDS.slot;
const COPY = ITEM_SHEET_COPY.linear;

function setup(state = "item-linear-linked") {
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
    const issue = joinIssue(linear, record);
    const lin =
      issue === null
        ? null
        : deriveLinearView({
            view,
            issue,
            states: statesOfTeam(linear, issue.team!.id),
            workspace:
              linear.connections.find((c) => c.id === issue.connectionId)
                ?.organizationName ?? "",
            item: record,
            offline: scenario.offline === true,
            timeZone: today.records.timeZone,
            words: {
              priorities: COPY.priorities,
              description: COPY.keptDescription,
              size: COPY.keptSize,
            },
          });
    const outbox = linear.outbox.filter((row) => row.workItemId === ID);
    return { view, record, lin, outbox, slots: pool.slots };
  }

  async function todayWork() {
    const week = deriveWeek(await server.readWeek(weekKeyOf(MONDAY)));
    const day =
      deriveWeekView({
        weekKey: weekKeyOf(MONDAY),
        week,
        pool: null,
        todayKey: MONDAY,
      }).days.find((d) => d.dateKey === MONDAY) ?? null;
    const linear = await server.readLinear();
    return deriveTodayWork({
      today: deriveToday(await server.readToday(MONDAY)),
      day,
      now,
      clientFor: () => null,
      issueFor: (item) => joinIssue(linear, item),
    });
  }

  async function pick(name: string) {
    const { view, lin } = await read();
    const status = lin!.statuses.find((s) => s.state.name === name)!;
    return writeStatus(server, view, status, lin!.done);
  }

  return { server, read, pick, todayWork };
}

describe("the linked sheet as read (C2's content)", () => {
  it("reads ENG-123's line, priority and description", async () => {
    const { read } = setup();
    const { view, lin } = await read();
    expect(view.ready).toBe(false);
    expect(lin).toMatchObject({
      identifier: "ENG-123",
      project: "Sync engine",
      workspace: "Lighthouse",
      priority: 2,
      size: "medium",
      line: null,
      done: false,
    });
    expect(lin!.current).toMatchObject({
      name: "In progress",
      type: "started",
    });
    // In progress is the first of five started: part filled, 1/6.
    expect(lin!.current.fill).toBeCloseTo(1 / 6);
    expect(lin!.description).toMatch(/^\[Retries fire twice/);
  });

  it("groups the workflow as in Linear, each with its consequence", async () => {
    const { read } = setup();
    const { lin } = await read();
    expect(
      lin!.groups.map((group) => [
        COPY.statusList.groups[group.key],
        group.options.map((o) => [o.name, COPY.statusList.effects[o.effect]]),
      ]),
    ).toEqual([
      ["Backlog", [["Backlog", null]]],
      [
        "Unstarted",
        [
          ["Blocked", "moves to Waiting"],
          ["Todo", null],
          ["Up next", null],
        ],
      ],
      [
        "Started",
        [
          ["In progress", "starts the timer"],
          ["Ongoing", "off today, back to the pool"],
          ["Paused", "moves to Waiting"],
          ["In review", "moves to Waiting"],
          ["Changes requested", null],
        ],
      ],
      [
        "Completed and canceled",
        [
          ["Done", "checks it off"],
          ["Canceled", "takes it off today"],
          ["Duplicate", "takes it off today"],
        ],
      ],
    ]);
  });

  it("Size follows Linear's estimate on read (size-and-length-2)", async () => {
    const { server, read } = setup();
    await server.writeLinearIssue({ workItemId: ID, estimate: 8 });
    const { lin, record } = await read();
    expect(lin!.size).toBe("huge");
    // The item's own column is the sheet's to write; the read follows Linear.
    expect(record.size).toBe("medium");
  });
});

describe("C1: each status picked", () => {
  it("writes exactly one outbox row per pick, Synapse's value first", async () => {
    const { read, pick } = setup();
    for (const name of ["Todo", "Up next", "Changes requested", "Backlog"]) {
      const before = (await read()).outbox.length;
      expect(await pick(name)).toBe("none");
      const { outbox, lin } = await read();
      expect(outbox.length).toBe(before + 1);
      expect(outbox.at(-1)).toMatchObject({ kind: "status" });
      expect(lin!.current.name).toBe(name);
    }
  });

  it("Paused moves it to Waiting at the block's foot", async () => {
    const { read, pick, todayWork } = setup();
    expect(await pick("Paused")).toBe("waiting");
    const { outbox, slots } = await read();
    expect(outbox).toHaveLength(1);
    // Nothing moves in Synapse: Today reads Waiting from the status.
    expect(slots.find((s) => s.id === SLOT)?.tier).toBe("primary");
    const work = await todayWork();
    expect(work.waiting.map((row) => row.id)).toContain(SLOT);
  });

  it("Canceled takes it off today", async () => {
    const { read, pick } = setup();
    expect(await pick("Canceled")).toBe("off_today");
    const { outbox, slots, view } = await read();
    expect(outbox).toHaveLength(1);
    expect(slots.some((s) => s.id === SLOT)).toBe(false);
    expect(view.slot).toBeNull();
  });

  it("Ongoing returns it to the pool", async () => {
    const { read, pick } = setup();
    expect(await pick("Ongoing")).toBe("to_pool");
    const { outbox, slots } = await read();
    expect(outbox).toHaveLength(1);
    expect(slots.filter((s) => s.workItemId === ID)).toEqual([]);
  });

  it("Done checks it off, and an open status unchecks it", async () => {
    const { read, pick } = setup();
    expect(await pick("Done")).toBe("check");
    let { outbox, record, lin } = await read();
    expect(outbox).toHaveLength(1);
    expect(record.doneAt).not.toBeNull();
    expect(lin!.done).toBe(true);

    await pick("In progress");
    ({ outbox, record, lin } = await read());
    expect(outbox).toHaveLength(2);
    expect(record.doneAt).toBeNull();
    expect(lin!.current.name).toBe("In progress");
  });

  it("In progress asks the work loop to start", async () => {
    const { pick, read } = setup();
    await pick("Todo");
    expect(await pick("In progress")).toBe("start");
    expect((await read()).outbox).toHaveLength(2);
  });
});

describe("C1: Unlink", () => {
  it("keeps the description as notes, clears the link, writes nothing to Linear", async () => {
    const { server, read } = setup();
    const before = await read();
    const written = await writeUnlink(server, before.view);
    const after = await read();
    expect(after.record).toMatchObject({
      notes: before.lin!.description,
      linearConnectionId: null,
      linearIssueId: null,
    });
    expect(after.lin).toBeNull();
    expect(after.view.item.linked).toBe(false);
    expect((await server.readLinear()).outbox).toEqual([]);

    // Undo puts the link back, and the notes as they were.
    await server.undo(written.undo);
    const undone = await read();
    expect(undone.record).toMatchObject({
      notes: null,
      linearConnectionId: before.record.linearConnectionId,
      linearIssueId: before.record.linearIssueId,
    });
    expect(undone.lin?.identifier).toBe("ENG-123");
  });
});

describe("the lines under the Linear line (C4's words)", () => {
  it("syncing reads Updating Linear", async () => {
    const { lin } = await setup("item-linear-syncing").read();
    expect(lin!.line).toEqual({ kind: "syncing" });
    expect(lin!.current.name).toBe("In review");
  });

  it("failed keeps In review here, and Try again sends the same row", async () => {
    const { server, read } = setup("item-linear-failed");
    const { lin, outbox } = await read();
    expect(lin!.line).toMatchObject({ kind: "failed", kept: "In review" });
    expect(COPY.failed("In review")).toBe(
      "Not updated in Linear. In review is kept here.",
    );
    expect(lin!.current.name).toBe("In review");
    await retryLinear(server, outbox[0]!.id);
    server.sendLinearOutbox();
    const after = await read();
    expect(after.outbox).toHaveLength(1);
    expect(after.outbox[0]!.state).toBe("sent");
    expect(after.lin!.line).toBeNull();
  });

  it("offline reads Updates Linear when back online", async () => {
    const { lin } = await setup("item-linear-offline").read();
    expect(lin!.line).toEqual({ kind: "offline" });
  });

  it("closed in Linear checks it here at 10:42", async () => {
    const { lin } = await setup("item-linear-done").read();
    expect(lin!.line).toEqual({ kind: "closed", at: "10:42" });
    expect(lin!.current.name).toBe("Done");
    expect(COPY.closed("10:42")).toBe(
      "Done in Linear. Checked off here too, at 10:42.",
    );
  });
});

/** USE-112 C2: the sheet's size reads the estimate on the issue's team's scale. */
describe("the sheet's size on the team's scale (USE-112)", () => {
  const view = { item: { size: "small" } } as Parameters<
    typeof sizeFromIssue
  >[0];
  const team = (estimationType: string | null) => ({
    id: "team-syn",
    key: "SYN",
    name: "Synapse",
    icon: null,
    estimationType,
  });

  it("an exponential team's 8 is Large; Fibonacci's is Huge", () => {
    expect(
      sizeFromIssue(view, { estimate: 8, team: team("exponential") }),
    ).toBe("large");
    expect(sizeFromIssue(view, { estimate: 8, team: team("fibonacci") })).toBe(
      "huge",
    );
    expect(sizeFromIssue(view, { estimate: 4, team: team("linear") })).toBe(
      "large",
    );
  });

  it("no estimate keeps the item's own size", () => {
    expect(
      sizeFromIssue(view, { estimate: null, team: team("exponential") }),
    ).toBe("small");
  });
});
