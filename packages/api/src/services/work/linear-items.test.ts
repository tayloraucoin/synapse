import { describe, expect, it } from "vitest";
import type {
  LinearIssue,
  LinearSnapshotPayload,
  SlotRecord,
  WorkItemRecord,
} from "@syn/validators";
import {
  block,
  slot,
  WEEKDAYS,
  workItem,
} from "../planner/planner-rows.fixture";
import { expectRefusal, NOW_ISO } from "../planner/write-plan.fixture";
import { applyChanges } from "../planner/write-rows";
import { memoryDb } from "../undo/memory-store.fixture";
import { undoChangesOf } from "../undo/undo";
import { NO_WORK_BLOCK } from "./items";
import {
  ALREADY_LINKED,
  ISSUE_TAKEN,
  NO_ISSUE,
  NOT_IN_LINEAR,
  planLinkToLinear,
  planPlaceIssues,
  planUnlinkFromLinear,
  TICK_EACH_ONCE,
} from "./linear-items";
import { ALREADY_PLACED } from "./sessions";
import { workJournal } from "./work.fixture";

/**
 * USE-101 C4: From Linear's place makes each issue's work item and its
 * session in one write; Link and Unlink write the item's Linear columns as
 * the fixture `WorkServer` does (`lib/fixtures/work/`).
 */

const ME = "00000000-0000-4000-a000-000000000001";
const CONNECTION = "00000000-0000-4000-8000-00000000c001";
const MON = "2026-10-19";
const SAT = "2026-10-17";

function issue(over: Partial<LinearIssue> = {}): LinearIssue {
  return {
    id: "issue-1",
    identifier: "SYN-1",
    title: "Linear sync",
    description: "Poll each workspace.",
    url: "https://linear.app/lighthouse/issue/SYN-1",
    stateId: "st-todo",
    priority: 2,
    estimate: 3,
    dueDate: null,
    labels: [],
    projectId: "project-synapse",
    teamId: "team-syn",
    parentId: null,
    assignedToMe: true,
    ...over,
  };
}

const payload: LinearSnapshotPayload = {
  issues: [
    issue(),
    issue({
      id: "issue-2",
      identifier: "SYN-2",
      title: "No estimate",
      estimate: null,
      projectId: null,
      description: null,
    }),
  ],
  subIssues: [
    issue({
      id: "issue-3",
      identifier: "SYN-3",
      title: "A sub-issue",
      parentId: "issue-1",
    }),
  ],
  teams: [{ id: "team-syn", key: "SYN", name: "Synapse", icon: null }],
  projects: [
    { id: "project-synapse", name: "Synapse", icon: "🧠", color: "#5e6ad2" },
  ],
  states: [
    {
      id: "st-todo",
      name: "Todo",
      type: "unstarted",
      position: 0,
      color: "#e2e2e2",
      teamId: "team-syn",
    },
  ],
};

const snapshots = new Map([[CONNECTION, payload]]);

const workBlock = () =>
  block({
    kind: "work",
    name: "Work",
    startsAt: "09:30",
    endsAt: "12:00",
    rrule: WEEKDAYS,
  });

describe("placeIssues (C-USE-101-4)", () => {
  it("creates each issue's work item and its session in one transaction", async () => {
    const work = workBlock();
    const earlier = slot({ blockId: work.id, onDate: MON, sortOrder: 0 });
    const db = memoryDb();
    const store = db.storeFor(ME);
    await store.insert("slots", structuredClone(earlier));

    const journal = workJournal({ blocks: [work], slots: [earlier] });
    const { id } = planPlaceIssues(journal, snapshots, {
      issueIds: ["issue-1", "issue-2"],
      dateKey: MON,
      blockId: work.id,
      tier: "urgent",
    });
    const changes = journal.changes();
    await db.transaction(() => applyChanges(store, changes));

    const items = db.rowsOf("workItems", ME) as unknown as WorkItemRecord[];
    expect(items).toHaveLength(2);
    const byIssue = new Map(items.map((row) => [row.linearIssueId, row]));
    expect(byIssue.get("issue-1")).toMatchObject({
      id,
      title: "Linear sync",
      size: "medium",
      lengthMinMin: 60,
      lengthMaxMin: 120,
      linearConnectionId: CONNECTION,
      linearIssueId: "issue-1",
      linearIdentifier: "SYN-1",
      notes: null,
      dueOn: null,
      clientId: null,
      doneAt: null,
    });
    // No estimate: unsized, 30 min exact.
    expect(byIssue.get("issue-2")).toMatchObject({
      size: null,
      lengthMinMin: 30,
      lengthMaxMin: 30,
    });

    const sessions = (db.rowsOf("slots", ME) as unknown as SlotRecord[]).filter(
      (row) => row.workItemId !== null,
    );
    expect(
      sessions.map((row) => [
        row.workItemId,
        row.sortOrder,
        row.tier,
        row.onDate,
      ]),
    ).toEqual([
      [byIssue.get("issue-1")!.id, 1, "urgent", MON],
      [byIssue.get("issue-2")!.id, 2, "urgent", MON],
    ]);
    // One write, one Undo: it takes back every row it made.
    expect(undoChangesOf(changes)).toHaveLength(4);
  });

  it("reuses the item already linked; a second day is a session, the same date refused", () => {
    const work = workBlock();
    const linked = workItem({
      linearConnectionId: CONNECTION,
      linearIssueId: "issue-1",
      linearIdentifier: "SYN-1",
    });
    const tue = slot({
      blockId: work.id,
      onDate: "2026-10-20",
      workItemId: linked.id,
    });

    const journal = workJournal({
      blocks: [work],
      workItems: [linked],
      slots: [tue],
    });
    const { id } = planPlaceIssues(journal, snapshots, {
      issueIds: ["issue-1"],
      dateKey: MON,
      blockId: work.id,
      tier: "primary",
    });
    expect(id).toBe(linked.id);
    expect(journal.rows.workItems).toHaveLength(1);

    expectRefusal(
      () =>
        planPlaceIssues(journal, snapshots, {
          issueIds: ["issue-1"],
          dateKey: MON,
          blockId: work.id,
          tier: "primary",
        }),
      "duplicate",
      ALREADY_PLACED,
    );
  });

  it("a sub-issue placed by itself is its issue's work item's child", () => {
    const work = workBlock();
    const parent = workItem({ linearIssueId: "issue-1" });
    const journal = workJournal({ blocks: [work], workItems: [parent] });
    planPlaceIssues(journal, snapshots, {
      issueIds: ["issue-3"],
      dateKey: MON,
      blockId: work.id,
      tier: "secondary",
      parentWorkItemId: parent.id,
    });
    expect(journal.rows.workItems.at(-1)).toMatchObject({
      linearIssueId: "issue-3",
      parentWorkItemId: parent.id,
    });
  });

  it("refuses as the fixture refuses", () => {
    const work = workBlock();
    const journal = workJournal({ blocks: [work] });
    const place = (over: Record<string, unknown>) => () =>
      planPlaceIssues(journal, snapshots, {
        issueIds: ["issue-1"],
        dateKey: MON,
        blockId: work.id,
        tier: "urgent",
        ...over,
      });
    expectRefusal(
      place({ issueIds: ["issue-1", "issue-1"] }),
      "invalid",
      TICK_EACH_ONCE,
    );
    expectRefusal(place({ issueIds: ["issue-9"] }), "unknown", NO_ISSUE);
    expectRefusal(place({ dateKey: SAT }), "not-on-date", NO_WORK_BLOCK);
    expect(journal.changes()).toEqual([]);
  });
});

/** USE-112 C2: an exponential team's 8 is Large, on place and on link. */
const exponential = new Map([
  [
    CONNECTION,
    {
      ...payload,
      issues: [issue({ estimate: 8 })],
      teams: [{ ...payload.teams[0]!, estimationType: "exponential" }],
    },
  ],
]);

describe("an issue's size on its team's scale (USE-112 C2)", () => {
  it("place reads the estimate on the team's scale", () => {
    const work = workBlock();
    const journal = workJournal({ blocks: [work] });
    planPlaceIssues(journal, exponential, {
      issueIds: ["issue-1"],
      dateKey: MON,
      blockId: work.id,
      tier: "urgent",
    });
    expect(journal.rows.workItems[0]).toMatchObject({
      size: "large",
      lengthMinMin: 120,
      lengthMaxMin: 240,
    });
  });

  it("link reads the estimate on the team's scale", () => {
    const item = workItem({ title: "Sync" });
    const journal = workJournal({ workItems: [item] });
    planLinkToLinear(journal, exponential, {
      workItemId: item.id,
      connectionId: CONNECTION,
      issueId: "issue-1",
    });
    expect(journal.rows.workItems[0]).toMatchObject({ size: "large" });
  });
});

describe("linkToLinear and unlinkFromLinear (C-USE-101-4)", () => {
  it("link takes the issue's title, size, project emoji and link, the notes after the description", () => {
    const item = workItem({ title: "Sync", notes: "My own notes." });
    const journal = workJournal({ workItems: [item] });
    planLinkToLinear(journal, snapshots, {
      workItemId: item.id,
      connectionId: CONNECTION,
      issueId: "issue-1",
    });
    expect(journal.rows.workItems[0]).toMatchObject({
      id: item.id,
      title: "Linear sync",
      size: "medium",
      lengthMinMin: 60,
      lengthMaxMin: 120,
      icon: { kind: "emoji", value: "🧠" },
      notes: "Poll each workspace.\n\nMy own notes.",
      linearIdentifier: "SYN-1",
      linearConnectionId: CONNECTION,
      linearIssueId: "issue-1",
      updatedAt: NOW_ISO,
    });
  });

  it("link with no estimate keeps the item's size; no project keeps its icon", () => {
    const item = workItem({
      size: "small",
      lengthMinMin: 30,
      lengthMaxMin: 60,
      icon: { kind: "emoji", value: "📝" },
    });
    const journal = workJournal({ workItems: [item] });
    planLinkToLinear(journal, snapshots, {
      workItemId: item.id,
      connectionId: CONNECTION,
      issueId: "issue-2",
    });
    expect(journal.rows.workItems[0]).toMatchObject({
      size: "small",
      lengthMinMin: 30,
      lengthMaxMin: 60,
      icon: { kind: "emoji", value: "📝" },
      linearIssueId: "issue-2",
    });
  });

  it("link refuses a linked item, a taken issue and an unknown one", () => {
    const linked = workItem({
      linearConnectionId: CONNECTION,
      linearIssueId: "issue-1",
    });
    const plain = workItem();
    const journal = workJournal({ workItems: [linked, plain] });
    const link = (workItemId: string, issueId: string) => () =>
      planLinkToLinear(journal, snapshots, {
        workItemId,
        connectionId: CONNECTION,
        issueId,
      });
    expectRefusal(link(linked.id, "issue-2"), "invalid", ALREADY_LINKED);
    expectRefusal(link(plain.id, "issue-1"), "duplicate", ISSUE_TAKEN);
    expectRefusal(link(plain.id, "issue-9"), "unknown", NO_ISSUE);
  });

  it("unlink keeps the description as the notes and clears every Linear column", () => {
    const item = workItem({
      notes: "Old notes.",
      linearConnectionId: CONNECTION,
      linearIssueId: "issue-1",
      linearIdentifier: "SYN-1",
    });
    const journal = workJournal({ workItems: [item] });
    planUnlinkFromLinear(journal, snapshots, { workItemId: item.id });
    expect(journal.rows.workItems[0]).toMatchObject({
      notes: "Poll each workspace.",
      linearIdentifier: null,
      linearConnectionId: null,
      linearIssueId: null,
      updatedAt: NOW_ISO,
    });

    // An issue with no description leaves the notes as they were.
    const bare = workItem({
      notes: "Mine.",
      linearConnectionId: CONNECTION,
      linearIssueId: "issue-2",
    });
    const second = workJournal({ workItems: [bare] });
    planUnlinkFromLinear(second, snapshots, { workItemId: bare.id });
    expect(second.rows.workItems[0]).toMatchObject({ notes: "Mine." });

    expectRefusal(
      () => planUnlinkFromLinear(second, snapshots, { workItemId: bare.id }),
      "invalid",
      NOT_IN_LINEAR,
    );
  });
});
