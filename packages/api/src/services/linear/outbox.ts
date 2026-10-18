/**
 * The Linear outbox (USE-102, D-USE-113): a status, Done, Reopen, a
 * priority, the description or an estimate on a linked item reaches Linear
 * through a `linear_writes` row.
 *
 * SYNAPSE FIRST. Synapse's value (the issue in the workspace's latest
 * snapshot, and on the check `work_items.linear_prev_state_id`) and the
 * pending row are written in one transaction (`LinearOutboxStore.commit`).
 * The row is sent after that transaction resolves, in the same request
 * (`sendLinearWrite`); a Linear failure marks the row failed with its error
 * and never touches Synapse's value. A failed row reads "Not updated in
 * Linear." with Try again, which sends the same row again.
 *
 * ONE TRY. A send tries once (a 401 refreshes the token and tries once
 * more), then the row is sent or failed: no loop, so a rate limit is never
 * hammered. A row still pending a minute after its last claim (its request
 * died between commit and send) is sent by the next sync or the scheduler's
 * job (`sendDueLinearWrites`). A claim bumps `attempts` and `updated_at` on
 * a pending row only, and that pass claims only a row untouched for a
 * minute, so it never sends a row a request is still sending.
 *
 * SYNAPSE'S VALUE STANDS. A sync replaces the snapshot with Linear's, so it
 * lays each issue field's latest row back over it while that row is
 * pending or failed (`overlayUnsent`): a Reopen not yet sent is never
 * closed again by the sync it raced.
 *
 * ONLY THE SIX. `LINEAR_WRITE_KINDS` is the only list of kinds; the inputs
 * are strict, so a client, a firing time, work time or a session's Done is
 * refused before any row is written.
 */
import type { LINEAR_WRITE_KINDS, LINEAR_WRITE_STATES } from "@syn/constants";
import {
  linearDoneInput,
  linearIssueWriteInput,
  type LinearIssue,
  type LinearSnapshotPayload,
  type LinearWriteView,
} from "@syn/validators";
import { refuse } from "../../errors";
import { parseOrRefuse } from "../planner/write-plan";
import {
  createLinearClient,
  LinearUnauthorized,
  type LinearClient,
  type LinearIssueUpdate,
} from "./client";
import { estimateForTeam } from "./estimate";
import type { FetchLike } from "./oauth";

export type LinearWriteKind = (typeof LINEAR_WRITE_KINDS)[number];
export type LinearWriteState = (typeof LINEAR_WRITE_STATES)[number];

/** A row's payload: the one field its kind sets; the check keeps the state it left. */
export type LinearWritePayload =
  | { stateId: string; prevStateId?: string | null }
  | { priority: number }
  | { description: string | null }
  | { estimate: number | null };

export interface LinearWriteRow {
  id: string;
  workItemId: string;
  connectionId: string;
  issueId: string;
  kind: LinearWriteKind;
  state: LinearWriteState;
  payload: LinearWritePayload;
  attempts: number;
  lastError: string | null;
  createdAt: Date;
}

/** A linked, open work item and its workspace's latest snapshot. */
export interface LinkedItem {
  workItemId: string;
  connectionId: string;
  issueId: string;
  prevStateId: string | null;
  snapshot: LinearSnapshotPayload;
}

/** What one write commits: the row, and the check's kept state on its own issue. */
export interface LinearWritePlan {
  workItemId: string;
  connectionId: string;
  issueId: string;
  kind: LinearWriteKind;
  payload: LinearWritePayload;
  /** `work_items.linear_prev_state_id`; undefined leaves it. */
  prevStateId?: string | null;
}

export const NO_LINEAR_WRITE = "No Linear write with that id.";

/** The view the hook reads: a pending row shows "Moving to <status> in Linear…". */
export function linearWriteViewOf(row: LinearWriteRow): LinearWriteView {
  return {
    id: row.id,
    workItemId: row.workItemId,
    kind: row.kind,
    state: row.state,
    createdAt: row.createdAt.toISOString(),
  };
}

/* ------------------------------------------------------------ planning -- */

function issuesOf(snapshot: LinearSnapshotPayload): LinearIssue[] {
  return [...snapshot.issues, ...snapshot.subIssues];
}

function firstOfType(
  snapshot: LinearSnapshotPayload,
  teamId: string,
  type: string,
) {
  return snapshot.states
    .filter((s) => s.teamId === teamId && s.type === type)
    .sort((a, b) => a.position - b.position)[0];
}

function linkedIssue(linked: LinkedItem): LinearIssue {
  const issue = issuesOf(linked.snapshot).find((i) => i.id === linked.issueId);
  if (!issue) throw refuse("unknown", "No issue with that id.");
  return issue;
}

/** Status, priority, description or estimate: exactly one, on the linked issue. */
export function planLinearIssueWrite(
  linked: LinkedItem,
  raw: unknown,
): LinearWritePlan {
  const input = parseOrRefuse(linearIssueWriteInput, raw);
  const issue = linkedIssue(linked);
  const base = {
    workItemId: linked.workItemId,
    connectionId: linked.connectionId,
    issueId: issue.id,
  };
  if (input.stateId !== undefined) {
    if (
      !linked.snapshot.states.some(
        (s) => s.id === input.stateId && s.teamId === issue.teamId,
      )
    ) {
      throw refuse("unknown", "No status with that id.");
    }
    return { ...base, kind: "status", payload: { stateId: input.stateId } };
  }
  if (input.priority !== undefined) {
    return { ...base, kind: "priority", payload: { priority: input.priority } };
  }
  if (input.description !== undefined) {
    return {
      ...base,
      kind: "description",
      payload: { description: input.description },
    };
  }
  const team = linked.snapshot.teams.find((t) => t.id === issue.teamId);
  return {
    ...base,
    kind: "estimate",
    payload: {
      estimate: estimateForTeam(input.estimate ?? null, team?.estimationType),
    },
  };
}

/**
 * The check (the data contract, D-USE-97): done moves the issue to its
 * team's first completed state and keeps the one it left; undone moves it
 * back there (or, with none kept, to the first unstarted). With `issueId`,
 * a sub-issue of the linked issue: its kept state rides on its done row,
 * passed in as `subPrevStateId`.
 */
export function planLinearDoneWrite(
  linked: LinkedItem,
  raw: unknown,
  subPrevStateId: string | null = null,
): LinearWritePlan {
  const input = parseOrRefuse(linearDoneInput, raw);
  const parent = linkedIssue(linked);
  let issue = parent;
  if (input.issueId !== undefined) {
    const sub = linked.snapshot.subIssues.find(
      (row) => row.id === input.issueId && row.parentId === parent.id,
    );
    if (!sub) throw refuse("unknown", "No sub-issue with that id.");
    issue = sub;
  }
  const own = input.issueId === undefined;
  const kept = own ? linked.prevStateId : subPrevStateId;
  const current = linked.snapshot.states.find((s) => s.id === issue.stateId);
  const base = {
    workItemId: linked.workItemId,
    connectionId: linked.connectionId,
    issueId: issue.id,
  };

  if (input.done) {
    // Already completed (closed in Linear): the state it left stays the one kept.
    const prev = current?.type === "completed" ? kept : issue.stateId;
    const target = firstOfType(linked.snapshot, issue.teamId, "completed");
    if (!target) throw refuse("unknown", "No status to move to.");
    return {
      ...base,
      kind: "done",
      payload: { stateId: target.id, prevStateId: prev },
      ...(own ? { prevStateId: prev } : {}),
    };
  }
  const target =
    kept ?? firstOfType(linked.snapshot, issue.teamId, "unstarted")?.id;
  if (target === undefined) throw refuse("unknown", "No status to move to.");
  return {
    ...base,
    kind: "reopen",
    payload: { stateId: target },
    ...(own ? { prevStateId: null } : {}),
  };
}

/* ---------------------------------------------------- Synapse's value -- */

/** The issue field a payload sets, as the snapshot names it. */
function changeOf(payload: LinearWritePayload): Partial<LinearIssue> {
  if ("stateId" in payload) return { stateId: payload.stateId };
  return payload;
}

/** The snapshot with one row's value on its issue; an issue not in it is left. */
export function applyLinearWrite(
  snapshot: LinearSnapshotPayload,
  row: Pick<LinearWriteRow, "issueId" | "payload">,
): LinearSnapshotPayload {
  const change = changeOf(row.payload);
  const put = (issue: LinearIssue) =>
    issue.id === row.issueId ? { ...issue, ...change } : issue;
  return {
    ...snapshot,
    issues: snapshot.issues.map(put),
    subIssues: snapshot.subIssues.map(put),
  };
}

function fieldOf(kind: LinearWriteKind): string {
  return kind === "done" || kind === "reopen" ? "status" : kind;
}

/**
 * A fresh snapshot with Synapse's unsent values laid back over it: per
 * issue and field, the latest row, when it is pending or failed. A sent
 * row is Linear's now, so the snapshot already holds it (or a newer value
 * from Linear). `rows` are oldest first.
 */
export function overlayUnsent(
  snapshot: LinearSnapshotPayload,
  rows: readonly Pick<
    LinearWriteRow,
    "issueId" | "kind" | "state" | "payload"
  >[],
): LinearSnapshotPayload {
  const latest = new Map<string, (typeof rows)[number]>();
  for (const row of rows)
    latest.set(`${row.issueId}:${fieldOf(row.kind)}`, row);
  let next = snapshot;
  for (const row of latest.values()) {
    if (row.state !== "sent") next = applyLinearWrite(next, row);
  }
  return next;
}

/** `IssueUpdateInput` for a row: its one field. */
export function issueUpdateOf(
  row: Pick<LinearWriteRow, "kind" | "payload">,
): LinearIssueUpdate {
  const p = row.payload;
  switch (row.kind) {
    case "status":
    case "done":
    case "reopen":
      if ("stateId" in p) return { stateId: p.stateId };
      break;
    case "priority":
      if ("priority" in p) return { priority: p.priority };
      break;
    case "description":
      if ("description" in p) return { description: p.description };
      break;
    case "estimate":
      if ("estimate" in p) return { estimate: p.estimate };
      break;
  }
  throw new Error(`A ${row.kind} row with no value to send.`);
}

/* ------------------------------------------------------------- sending -- */

/** Where the outbox reads and writes; `outbox-store.ts` is the RLS one. */
export interface LinearOutboxStore {
  /** The linked, open work item and its latest snapshot; refused otherwise. */
  linked(workItemId: string): Promise<LinkedItem>;
  /** The state a sub-issue's last done row kept, for its Reopen. */
  lastDonePrevState(
    workItemId: string,
    issueId: string,
  ): Promise<string | null>;
  /** One transaction: Synapse's value, the kept state, the pending row. */
  commit(plan: LinearWritePlan, at: Date): Promise<LinearWriteRow>;
  /**
   * A pending row, claimed for one send (`attempts` + 1, `updated_at` at);
   * with `before`, only one untouched since then. Null otherwise.
   */
  claim(id: string, at: Date, before?: Date): Promise<LinearWriteRow | null>;
  settle(
    id: string,
    outcome: { state: "sent" | "failed"; lastError: string | null },
    at: Date,
  ): Promise<LinearWriteRow>;
  /**
   * Try again: a failed row goes pending (`requeued`); any other comes back
   * as it is; null when there is none.
   */
  requeue(
    id: string,
    at: Date,
  ): Promise<{ row: LinearWriteRow; requeued: boolean } | null>;
  /** Pending rows last claimed (or made) before `before`, oldest first. */
  due(before: Date): Promise<string[]>;
}

export interface LinearSendDeps {
  store: LinearOutboxStore;
  tokens: {
    accessToken(connectionId: string): Promise<string>;
    refresh(
      connectionId: string,
      options?: { rejected?: string },
    ): Promise<string>;
  };
  fetch: FetchLike;
  now?: () => Date;
  /** For the tests: the client a token opens. */
  client?: (accessToken: string) => Pick<LinearClient, "updateIssue">;
}

/** A pending row older than this is sent by the sync or the scheduler's job. */
export const LINEAR_SEND_DUE_MS = 60_000;

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Send one row, after the transaction that wrote it. Returns the settled
 * row, or null when it was not pending (sent, failed, or another sender's).
 */
export async function sendLinearWrite(
  id: string,
  deps: LinearSendDeps,
  before?: Date,
): Promise<LinearWriteRow | null> {
  const now = deps.now ?? (() => new Date());
  const row = await deps.store.claim(id, now(), before);
  if (!row) return null;
  const open =
    deps.client ?? ((token: string) => createLinearClient(token, deps));
  try {
    const update = issueUpdateOf(row);
    const token = await deps.tokens.accessToken(row.connectionId);
    try {
      await open(token).updateIssue(row.issueId, update);
    } catch (error) {
      if (!(error instanceof LinearUnauthorized)) throw error;
      const fresh = await deps.tokens.refresh(row.connectionId, {
        rejected: token,
      });
      await open(fresh).updateIssue(row.issueId, update);
    }
  } catch (error) {
    return deps.store.settle(
      id,
      { state: "failed", lastError: errorText(error) },
      now(),
    );
  }
  return deps.store.settle(id, { state: "sent", lastError: null }, now());
}

/** Every pending row a request left unsent: the sync's and the scheduler's pass. */
export async function sendDueLinearWrites(
  deps: LinearSendDeps,
): Promise<number> {
  const now = deps.now ?? (() => new Date());
  const before = new Date(now().getTime() - LINEAR_SEND_DUE_MS);
  const ids = await deps.store.due(before);
  let sent = 0;
  // One at a time, oldest first, so an issue's writes land in order.
  for (const id of ids) {
    const row = await sendLinearWrite(id, deps, before);
    if (row?.state === "sent") sent += 1;
  }
  return sent;
}

/** Status, priority, description or estimate: commit, then send. */
export async function writeLinearIssue(
  raw: unknown,
  deps: LinearSendDeps,
): Promise<LinearWriteView> {
  const now = deps.now ?? (() => new Date());
  const input = parseOrRefuse(linearIssueWriteInput, raw);
  const linked = await deps.store.linked(input.workItemId);
  const row = await deps.store.commit(
    planLinearIssueWrite(linked, input),
    now(),
  );
  return linearWriteViewOf((await sendLinearWrite(row.id, deps)) ?? row);
}

/** The check's side in Linear: commit, then send. */
export async function writeLinearDone(
  raw: unknown,
  deps: LinearSendDeps,
): Promise<LinearWriteView> {
  const now = deps.now ?? (() => new Date());
  const input = parseOrRefuse(linearDoneInput, raw);
  const linked = await deps.store.linked(input.workItemId);
  const subPrev =
    input.issueId === undefined
      ? null
      : await deps.store.lastDonePrevState(input.workItemId, input.issueId);
  const row = await deps.store.commit(
    planLinearDoneWrite(linked, input, subPrev),
    now(),
  );
  return linearWriteViewOf((await sendLinearWrite(row.id, deps)) ?? row);
}

/** Try again: the same failed row, sent again; never a second row. */
export async function retryLinearWrite(
  id: string,
  deps: LinearSendDeps,
): Promise<LinearWriteView> {
  const now = deps.now ?? (() => new Date());
  const found = await deps.store.requeue(id, now());
  if (!found) throw refuse("unknown", NO_LINEAR_WRITE);
  // Sent, or pending in another request's hands: shown as it is.
  if (!found.requeued) return linearWriteViewOf(found.row);
  return linearWriteViewOf((await sendLinearWrite(id, deps)) ?? found.row);
}
