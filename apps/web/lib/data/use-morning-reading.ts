"use client";

import * as React from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type MutationOptions,
} from "@tanstack/react-query";
import type { ReadingListRecord } from "@syn/validators";
import type { FixtureServer } from "@/lib/fixtures/server";
import { FixtureOfflineError } from "./refusals";
import { useDataSource, useIsOffline } from "./source";

/**
 * Settings › Morning reading's data (USE-151): one read for both sections
 * (`morning.list`; D-USE-133) and every write the screen makes, so USE-152's
 * rows and USE-153's sheets only call them.
 *
 * Offline is read only (D-USE-129): the list comes from the persisted cache
 * and a write is refused before it is sent. The writes run with
 * `networkMode: "always"` and no offline-write key, so a write is never
 * paused, never persisted and never replayed later; one that loses the
 * connection mid-flight fails and shows its line. This departs from C4's
 * paused writes for this screen only, by the ledger's ruling.
 */

export function morningReadingQueryKey(scenario: string) {
  return ["morning-reading", scenario] as const;
}

type ReadingMethod =
  | "saveReadingPassage"
  | "saveReadingLink"
  | "reorderReading"
  | "turnReadingOff"
  | "turnReadingOn"
  | "deleteReadingRow";

export type ReadingCall = {
  [M in ReadingMethod]: { method: M; args: Parameters<FixtureServer[M]> };
}[ReadingMethod];

/**
 * The writes' options, shared by the hook and its test: refused offline
 * before the server is called, and never paused (D-USE-129).
 */
export function morningReadingMutationOptions(
  server: Pick<FixtureServer, ReadingMethod>,
  isOffline: () => boolean,
): MutationOptions<unknown, Error, ReadingCall> {
  return {
    networkMode: "always",
    retry: false,
    mutationFn: ({ method, args }) => {
      if (isOffline()) return Promise.reject(new FixtureOfflineError());
      return (server[method] as (...a: unknown[]) => Promise<unknown>)(...args);
    },
  };
}

export function useMorningReading() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const offline = useIsOffline();
  const scenario = source.scenario.name;
  const offlineRef = React.useRef(offline);
  offlineRef.current = offline;

  const query = useQuery<ReadingListRecord>({
    queryKey: morningReadingQueryKey(scenario),
    queryFn: () => source.server.readMorningReading(),
    // One region's error stays until Try again (error.md).
    retry: false,
  });

  const mutation = useMutation<unknown, Error, ReadingCall>({
    ...morningReadingMutationOptions(source.server, () => offlineRef.current),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: morningReadingQueryKey(scenario),
      });
      // Orient's reading: every key under ["morning", scenario].
      void queryClient.invalidateQueries({ queryKey: ["morning", scenario] });
    },
  });

  const write =
    <M extends ReadingMethod>(method: M) =>
    (...args: Parameters<FixtureServer[M]>) =>
      mutation.mutateAsync({ method, args } as ReadingCall) as ReturnType<
        FixtureServer[M]
      >;

  function retry() {
    source.server.recoverMorningReading();
    return queryClient.refetchQueries({
      queryKey: morningReadingQueryKey(scenario),
    });
  }

  return {
    ...query,
    list: query.data,
    /** Every write waits while this is true (D-USE-129). */
    offline,
    retry,
    savePassage: write("saveReadingPassage"),
    saveLink: write("saveReadingLink"),
    reorder: write("reorderReading"),
    turnOff: write("turnReadingOff"),
    turnOn: write("turnReadingOn"),
    remove: write("deleteReadingRow"),
  };
}
