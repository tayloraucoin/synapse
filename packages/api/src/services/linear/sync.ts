/**
 * One sync of a Linear workspace into `linear_snapshots` (USE-101).
 * Polling only, never a webhook. Network calls run outside any
 * transaction; what a sync learns is written in one (`LinearSyncStore`).
 *
 * Per connection:
 * 1. Refused without a request while Linear's rate limit holds (the reset
 *    time is kept in `last_sync_error`), while it waits on Reconnect, or
 *    within 30 s of its last sync: the last snapshot stands.
 * 2. Fetched: the open assigned issues, the placed ones by id (so a closed
 *    one is seen) and every team's states, each page parsed. A 401 refreshes
 *    the token once and fetches again.
 * 3. Stored in one transaction: the snapshot, the closed-issue pass
 *    (D-USE-115: a placed issue completed, canceled or duplicate closes the
 *    task, `done_source` linear, and every open session, D-USE-97) and
 *    `last_synced_at`.
 *
 * A failure past the token (a refused call, a payload that does not parse)
 * sets `last_sync_error` and leaves the last snapshot as it was. RATELIMITED
 * is never retried in a loop: the sync stops and records the reset time.
 *
 * Cadence (the data contract): the client reads on opening the pool, on
 * focus after two minutes and every five while visible, and `linear.read`
 * syncs a connection whose snapshot is two minutes old first; Sync now
 * forces it. One sync per connection at a time in this instance.
 */
import type { LinearSnapshotPayload } from "@syn/validators";
import {
  createLinearClient,
  LinearApiError,
  LinearPayloadError,
  LinearRateLimited,
  LinearUnauthorized,
  type LinearClient,
} from "./client";
import type { FetchLike } from "./oauth";
import { LINEAR_RECONNECT_MESSAGE, LinearReconnectNeeded } from "./refresh";
import { snapshotOf } from "./snapshot";

/** The server refuses a sync this soon after the last (per connection). */
export const LINEAR_MIN_GAP_MS = 30_000;
/** A read syncs first when the snapshot is older than this. */
export const LINEAR_STALE_MS = 2 * 60_000;
export const LINEAR_SYNC_FAILED_MESSAGE = "Not synced";
const RATE_LIMITED = "Rate limited until ";

export function rateLimitedMessage(resetAt: Date): string {
  return `${RATE_LIMITED}${resetAt.toISOString()}`;
}

/** The reset time a rate-limited sync recorded; null for any other state. */
export function rateLimitedUntil(lastSyncError: string | null): Date | null {
  if (!lastSyncError?.startsWith(RATE_LIMITED)) return null;
  const at = new Date(lastSyncError.slice(RATE_LIMITED.length));
  return Number.isNaN(at.getTime()) ? null : at;
}

export interface LinearConnectionState {
  id: string;
  lastSyncedAt: Date | null;
  lastSyncError: string | null;
}

/** Where a sync reads and writes; `services/linear/sync-store.ts` is the RLS one. */
export interface LinearSyncStore {
  /** The caller's connections, or the one named. */
  connections(connectionId?: string): Promise<LinearConnectionState[]>;
  /** The Linear ids of the connection's placed items still open in Synapse. */
  placedIssueIds(connectionId: string): Promise<string[]>;
  /** One transaction: the snapshot, the closed-issue pass, `last_synced_at`. */
  writeSync(
    connectionId: string,
    payload: LinearSnapshotPayload,
    at: Date,
  ): Promise<{ closed: string[] }>;
  markSyncError(connectionId: string, message: string): Promise<void>;
}

export interface LinearSyncDeps {
  store: LinearSyncStore;
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
  client?: (accessToken: string) => LinearClient;
}

export type LinearSyncResult =
  | { outcome: "synced"; closed: string[] }
  | { outcome: "recent" | "rate-limited" | "reconnect" | "failed" };

async function fetchSnapshot(
  client: LinearClient,
  placedIds: readonly string[],
): Promise<LinearSnapshotPayload> {
  const { viewerId, issues } = await client.assignedIssues();
  const assigned = new Set(issues.map((issue) => issue.id));
  const missing = placedIds.filter((id) => !assigned.has(id));
  const placed = missing.length > 0 ? await client.issuesById(missing) : [];
  const teams = await client.teamStates();
  return snapshotOf({ viewerId, assigned: issues, placed, teams });
}

export async function syncLinearConnection(
  connection: LinearConnectionState,
  deps: LinearSyncDeps,
  options: { force?: boolean } = {},
): Promise<LinearSyncResult> {
  const now = deps.now?.() ?? new Date();
  const until = rateLimitedUntil(connection.lastSyncError);
  if (until && until.getTime() > now.getTime()) {
    return { outcome: "rate-limited" };
  }
  if (connection.lastSyncError === LINEAR_RECONNECT_MESSAGE) {
    return { outcome: "reconnect" };
  }
  const since = connection.lastSyncedAt
    ? now.getTime() - connection.lastSyncedAt.getTime()
    : Infinity;
  if (since < LINEAR_MIN_GAP_MS) return { outcome: "recent" };
  if (!options.force && since < LINEAR_STALE_MS) return { outcome: "recent" };

  const open =
    deps.client ?? ((token: string) => createLinearClient(token, deps));
  const placedIds = await deps.store.placedIssueIds(connection.id);

  let payload: LinearSnapshotPayload;
  try {
    const token = await deps.tokens.accessToken(connection.id);
    try {
      payload = await fetchSnapshot(open(token), placedIds);
    } catch (error) {
      if (!(error instanceof LinearUnauthorized)) throw error;
      const fresh = await deps.tokens.refresh(connection.id, {
        rejected: token,
      });
      payload = await fetchSnapshot(open(fresh), placedIds);
    }
  } catch (error) {
    if (error instanceof LinearReconnectNeeded) return { outcome: "reconnect" };
    if (error instanceof LinearRateLimited) {
      await deps.store.markSyncError(
        connection.id,
        rateLimitedMessage(error.resetAt),
      );
      return { outcome: "rate-limited" };
    }
    if (
      error instanceof LinearApiError ||
      error instanceof LinearPayloadError ||
      error instanceof LinearUnauthorized
    ) {
      await deps.store.markSyncError(connection.id, LINEAR_SYNC_FAILED_MESSAGE);
      return { outcome: "failed" };
    }
    throw error;
  }

  const { closed } = await deps.store.writeSync(connection.id, payload, now);
  return { outcome: "synced", closed };
}

const inFlight = new Map<string, Promise<LinearSyncResult>>();

/**
 * Sync every connection (or the one named) that is due: stale, or any
 * past the 30 s floor with `force` (Sync now).
 */
export async function syncLinear(
  deps: LinearSyncDeps,
  options: { connectionId?: string; force?: boolean } = {},
): Promise<LinearSyncResult[]> {
  const connections = await deps.store.connections(options.connectionId);
  return Promise.all(
    connections.map((connection) => {
      const running = inFlight.get(connection.id);
      if (running) return running;
      const started = syncLinearConnection(connection, deps, options).finally(
        () => inFlight.delete(connection.id),
      );
      inFlight.set(connection.id, started);
      return started;
    }),
  );
}
