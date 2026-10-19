import { estimationTypeOf, issueLength } from "@syn/utils";
import {
  linkToLinearInput,
  placeIssuesInput,
  placeSlotInput,
  slotRecord,
  workItemInput,
  workItemRecord,
  type LinearIssue,
  type LinearSnapshotPayload,
  type LinkToLinearInput,
  type PlaceIssuesInput,
  type WorkItemIdInput,
  type WorkItemRecord,
} from "@syn/validators";
import { refuse } from "../../errors";
import { CLOSED_STATE_TYPES } from "../linear/documents";
import { blockOn, parseOrRefuse } from "../planner/write-plan";
import { findWorkItem, NO_WORK_BLOCK } from "./items";
import { ALREADY_PLACED } from "./sessions";
import type { WorkJournal } from "./work-rows";

/**
 * A work item and its Linear issue (USE-101), ported from the fixture
 * `WorkServer` (`lib/fixtures/work/`) with its refusal words: From Linear's
 * place, Link and Unlink, and the sync's closed-issue pass. Each is a pure
 * plan over the caller's rows through the journal; the router applies it in
 * one transaction with one Undo, and the sync applies the closes in the
 * transaction that stores the snapshot. Nothing here writes to Linear: the
 * description and status reach Linear through USE-102's outbox.
 */

export const NO_ISSUE = "No Linear issue with that id.";
export const TICK_EACH_ONCE = "Tick each issue once.";
export const ALREADY_LINKED = "That task is in Linear already.";
export const ISSUE_TAKEN = "That issue is on another item already.";
export const NOT_IN_LINEAR = "That task is not in Linear.";

const CLOSED_TYPES = new Set(CLOSED_STATE_TYPES);

/** Each connection's latest snapshot, as the plans read it. */
export type LinearSnapshots = ReadonlyMap<string, LinearSnapshotPayload>;

function issuesOf(payload: LinearSnapshotPayload): LinearIssue[] {
  return [...payload.issues, ...payload.subIssues];
}

function findIssue(
  snapshots: LinearSnapshots,
  issueId: string,
): {
  connectionId: string;
  issue: LinearIssue;
  payload: LinearSnapshotPayload;
} {
  for (const [connectionId, payload] of snapshots) {
    const issue = issuesOf(payload).find((row) => row.id === issueId);
    if (issue) return { connectionId, issue, payload };
  }
  throw refuse("unknown", NO_ISSUE);
}

/** D-USE-36: the description, then the item's notes at its end. */
export function joinNotes(
  description: string | null,
  notes: string | null,
): string | null {
  const parts = [description, notes]
    .map((part) => part?.trim() ?? "")
    .filter((part) => part !== "");
  return parts.length === 0 ? null : parts.join("\n\n");
}

/**
 * From Linear (USE-52, D-USE-57): each ticked issue's work item, or the one
 * already linked, and a session in the tier on the date after the block's
 * own slots. An issue already on the date refuses them all. `id` is the
 * first item.
 */
export function planPlaceIssues(
  journal: WorkJournal,
  snapshots: LinearSnapshots,
  raw: PlaceIssuesInput,
): { id: string } {
  const input = parseOrRefuse(placeIssuesInput, raw);
  if (new Set(input.issueIds).size !== input.issueIds.length) {
    throw refuse("invalid", TICK_EACH_ONCE);
  }
  const block = journal.rows.blocks.find((b) => b.id === input.blockId);
  if (!block) throw refuse("unknown", "No block with that id.");
  if (block.kind !== "work" || !blockOn(block, input.dateKey)) {
    throw refuse("not-on-date", NO_WORK_BLOCK);
  }

  let sortOrder =
    journal.rows.slots
      .filter((s) => s.blockId === block.id && s.onDate === input.dateKey)
      .reduce((top, s) => Math.max(top, s.sortOrder), -1) + 1;
  let first: string | null = null;

  for (const issueId of input.issueIds) {
    const { connectionId, issue, payload } = findIssue(snapshots, issueId);
    const linked = journal.rows.workItems.find(
      (row) =>
        row.linearConnectionId === connectionId &&
        row.linearIssueId === issue.id &&
        row.archivedAt === null,
    );
    // Placed already: a second day is a session; the same date is refused.
    if (
      linked &&
      journal.rows.slots.some(
        (s) => s.workItemId === linked.id && s.onDate === input.dateKey,
      )
    ) {
      throw refuse("duplicate", ALREADY_PLACED);
    }
    const item =
      linked ??
      putIssueItem(
        journal,
        connectionId,
        issue,
        estimationTypeOf(payload.teams, issue.teamId),
        input.parentWorkItemId ?? null,
      );

    const slot = parseOrRefuse(placeSlotInput, {
      blockId: block.id,
      onDate: input.dateKey,
      sortOrder: sortOrder++,
      workItemId: item.id,
      tier: input.tier,
    });
    journal.put(
      "slots",
      slotRecord.parse({
        ...journal.stamps(),
        blockId: slot.blockId,
        onDate: slot.onDate,
        skipped: false,
        sortOrder: slot.sortOrder,
        blockItemId: null,
        todoId: null,
        workItemId: item.id,
        tier: slot.tier ?? null,
        lengthMin: null,
        tookMin: null,
        doneAt: null,
      }),
    );
    first ??= item.id;
  }

  return { id: first! };
}

function putIssueItem(
  journal: WorkJournal,
  connectionId: string,
  issue: LinearIssue,
  estimationType: string | null,
  parentWorkItemId: string | null,
): WorkItemRecord {
  const length = issueLength(issue.estimate, estimationType);
  const fields = parseOrRefuse(workItemInput, {
    title: issue.title,
    size: length.size,
    lengthMinMin: length.lengthMinMin,
    lengthMaxMin: length.lengthMaxMin,
  });
  return journal.put(
    "workItems",
    workItemRecord.parse({
      ...journal.stamps(),
      title: fields.title,
      notes: null,
      icon: null,
      size: fields.size ?? null,
      lengthMinMin: fields.lengthMinMin ?? null,
      lengthMaxMin: fields.lengthMaxMin ?? null,
      // Synapse's own date; Linear's due shows from the snapshot.
      dueOn: null,
      // Whose work it is resolves through the workspace (USE-9).
      clientId: null,
      parentWorkItemId,
      doneAt: null,
      doneSource: null,
      archivedAt: null,
      linearIdentifier: issue.identifier,
      linearConnectionId: connectionId,
      linearIssueId: issue.id,
    }),
  );
}

/**
 * Link a Linear issue (USE-68, D-USE-36): the item takes the issue's title,
 * size, length, project emoji and link, and its notes become the
 * description with the old notes at the end. One issue, one item.
 */
export function planLinkToLinear(
  journal: WorkJournal,
  snapshots: LinearSnapshots,
  raw: LinkToLinearInput,
): { id: string } {
  const { workItemId, connectionId, issueId } = parseOrRefuse(
    linkToLinearInput,
    raw,
  );
  const item = findWorkItem(journal, workItemId);
  if (item.linearIssueId !== null) throw refuse("invalid", ALREADY_LINKED);
  const payload = snapshots.get(connectionId);
  const issue = payload?.issues.find((row) => row.id === issueId);
  if (!payload || !issue) throw refuse("unknown", NO_ISSUE);
  if (
    journal.rows.workItems.some(
      (row) =>
        row.archivedAt === null &&
        row.linearConnectionId === connectionId &&
        row.linearIssueId === issueId,
    )
  ) {
    throw refuse("duplicate", ISSUE_TAKEN);
  }
  const project = payload.projects.find((row) => row.id === issue.projectId);
  const length = issueLength(
    issue.estimate,
    estimationTypeOf(payload.teams, issue.teamId),
  );
  journal.put(
    "workItems",
    workItemRecord.parse({
      ...item,
      title: issue.title,
      // [ASSUMPTION, the fixture's] With no estimate the item keeps its own size and length.
      ...(length.size === null
        ? {}
        : {
            size: length.size,
            lengthMinMin: length.lengthMinMin,
            lengthMaxMin: length.lengthMaxMin,
          }),
      // [ASSUMPTION, the fixture's] A project with no emoji leaves the item's icon.
      icon:
        project?.icon == null
          ? item.icon
          : { kind: "emoji", value: project.icon },
      notes: joinNotes(issue.description, item.notes),
      linearIdentifier: issue.identifier,
      linearConnectionId: connectionId,
      linearIssueId: issue.id,
      updatedAt: journal.stamp(),
    }),
  );
  return { id: workItemId };
}

/**
 * Unlink from Linear (USE-66): a plain item from here on, the issue's
 * description kept as its notes; the issue is never written.
 */
export function planUnlinkFromLinear(
  journal: WorkJournal,
  snapshots: LinearSnapshots,
  { workItemId }: WorkItemIdInput,
): { id: string } {
  const item = findWorkItem(journal, workItemId);
  if (item.linearIssueId === null || item.linearConnectionId === null) {
    throw refuse("invalid", NOT_IN_LINEAR);
  }
  const payload = snapshots.get(item.linearConnectionId);
  const description =
    (payload &&
      issuesOf(payload).find((row) => row.id === item.linearIssueId)
        ?.description) ??
    null;
  journal.put(
    "workItems",
    workItemRecord.parse({
      ...item,
      notes:
        description === null || description.trim() === ""
          ? item.notes
          : description,
      // [ASSUMPTION, the fixture's] The identifier goes too, so nothing links it again.
      linearIdentifier: null,
      linearConnectionId: null,
      linearIssueId: null,
      updatedAt: journal.stamp(),
    }),
  );
  return { id: workItemId };
}

/**
 * The sync's closed-issue pass (D-USE-115, D-USE-97): a placed item whose
 * issue the snapshot shows completed, canceled or duplicate is done, by
 * Linear, and every open session closes with it, all on one stamp so
 * Reopen finds exactly them. Returns the items it closed.
 */
export function planLinearCloses(
  journal: WorkJournal,
  connectionId: string,
  payload: LinearSnapshotPayload,
): string[] {
  const closedStates = new Set(
    payload.states
      .filter((state) => CLOSED_TYPES.has(state.type))
      .map((state) => state.id),
  );
  const stateOf = new Map(
    issuesOf(payload).map((issue) => [issue.id, issue.stateId]),
  );
  const at = journal.stamp();
  const closed: string[] = [];
  for (const item of journal.rows.workItems) {
    if (
      item.linearConnectionId !== connectionId ||
      item.linearIssueId === null ||
      item.doneAt !== null ||
      item.archivedAt !== null
    ) {
      continue;
    }
    const stateId = stateOf.get(item.linearIssueId);
    if (stateId === undefined || !closedStates.has(stateId)) continue;
    journal.put(
      "workItems",
      workItemRecord.parse({
        ...item,
        doneAt: at,
        doneSource: "linear",
        updatedAt: at,
      }),
    );
    for (const session of journal.rows.slots) {
      if (session.workItemId === item.id && session.doneAt === null) {
        journal.put(
          "slots",
          slotRecord.parse({ ...session, doneAt: at, updatedAt: at }),
        );
      }
    }
    closed.push(item.id);
  }
  return closed;
}
