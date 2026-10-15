"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LinearIssueWriteInput, WorkItemRecord } from "@syn/validators";
import {
  joinIssue,
  lastSyncedOf,
  statesOfTeam,
  type LinearRecords,
} from "./integration-records";
import { useDataSource } from "./source";
import { poolQueryKey } from "./use-pool";
import { todayQueryKey } from "./use-today";
import { weekQueryKey } from "./use-week";

/**
 * Linear on fixtures (USE-56). `useLinearIssues` is the one snapshot query
 * (USE-52 reads it for From Linear); `useLinear` joins each work item to its
 * issue and sends the writes. Synapse's value is shown at once and stands; a
 * failed row is the item's `write`, and `retry` sends it again. Wave 3 swaps
 * the query and mutation functions for the Linear router.
 */

export function linearQueryKey(scenario: string) {
  return ["linear", scenario] as const;
}

/** While a row is pending, read again until the sender has settled it. */
const SETTLE_POLL_MS = 400;

export function useLinearIssues() {
  const source = useDataSource();
  return useQuery<LinearRecords>({
    queryKey: linearQueryKey(source.scenario.name),
    queryFn: () => source.server.readLinear(),
    refetchInterval: (query) =>
      query.state.data?.outbox.some((row) => row.state === "pending")
        ? SETTLE_POLL_MS
        : false,
  });
}

type Item = Pick<WorkItemRecord, "id" | "linearConnectionId" | "linearIssueId">;

export function useLinear() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const scenario = source.scenario.name;
  const query = useLinearIssues();
  const records = query.data;

  const invalidateLinear = () =>
    queryClient.invalidateQueries({ queryKey: linearQueryKey(scenario) });

  const write = useMutation({
    mutationFn: (input: LinearIssueWriteInput) =>
      source.server.writeLinearIssue(input),
    onSettled: invalidateLinear,
  });
  const done = useMutation({
    mutationFn: (input: { workItemId: string; done: boolean }) =>
      source.server.writeLinearDone(input),
    onSettled: invalidateLinear,
  });
  const retry = useMutation({
    mutationFn: (id: string) => source.server.retryLinearWrite(id),
    onSettled: invalidateLinear,
  });
  const sync = useMutation({
    mutationFn: (connectionId?: string) =>
      source.server.syncLinear(connectionId),
    // A sync can close a placed task and its sessions (D-USE-97).
    onSettled: () => {
      for (const queryKey of [
        linearQueryKey(scenario),
        todayQueryKey(scenario),
        weekQueryKey(scenario),
        poolQueryKey(scenario),
      ]) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  return {
    ...query,
    /** The issue behind a work item; null for a Synapse-only one. */
    issueFor: (item: Item) => (records ? joinIssue(records, item) : null),
    /** A team's statuses for the status sheet, each with its fill and effect. */
    statesFor: (teamId: string) =>
      records ? statesOfTeam(records, teamId) : [],
    notInPool: records?.notInPool ?? [],
    connections: records?.connections ?? [],
    lastSyncedAt: records ? lastSyncedOf(records.connections) : null,
    setStatus: (workItemId: string, stateId: string) =>
      write.mutateAsync({ workItemId, stateId }),
    /** Priority, description or estimate, one at a time. */
    writeIssue: write.mutateAsync,
    /** The check's side in Linear: Done, or back to the status it left. */
    setDone: (workItemId: string, isDone: boolean) =>
      done.mutateAsync({ workItemId, done: isDone }),
    retry: retry.mutateAsync,
    syncNow: (connectionId?: string) => sync.mutateAsync(connectionId),
    isSyncing: sync.isPending,
  };
}
