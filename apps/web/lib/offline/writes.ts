import type { MutationKey, QueryClient } from "@tanstack/react-query";

/**
 * The writes that run offline (USE-106; C4, D-USE-82): the clock's slot
 * events, the work writes and the planner's block and item writes. A paused
 * mutation is persisted with its key and variables only, so after a reload
 * its function is found here, by key, never in a hook's closure.
 *
 * The key is `["writes", <write>, <scenario>]`: the default is registered on
 * the first two, and the scenario tells the replay which source to send
 * through. Every offline write shares one scope per scenario, so TanStack
 * runs them one at a time, in the order they were made.
 */

export const OFFLINE_WRITES = ["slotEvents", "work", "planner"] as const;
export type OfflineWrite = (typeof OFFLINE_WRITES)[number];

/** A server call as a paused mutation stores it: its method and its arguments. */
export interface WriteCall {
  method: string;
  args: readonly unknown[];
}

/** What a write's default sends: the hook's variables, through the scenario's source. */
export type SendWrite = (
  write: OfflineWrite,
  scenario: string,
  variables: unknown,
) => Promise<unknown>;

export function offlineWriteKey(write: OfflineWrite, scenario: string) {
  return ["writes", write, scenario] as const;
}

/** The options a hook spreads into `useMutation`, in place of a `mutationFn`. */
export function offlineWrite(write: OfflineWrite, scenario: string) {
  return {
    mutationKey: offlineWriteKey(write, scenario),
    scope: { id: `writes:${scenario}` },
  };
}

/** Whether a mutation is one of these writes, the only ones persisted. */
export function isOfflineWriteKey(key: MutationKey | undefined): boolean {
  return (
    key?.[0] === "writes" &&
    (OFFLINE_WRITES as readonly unknown[]).includes(key[1]) &&
    typeof key[2] === "string"
  );
}

/**
 * One default per write, registered before the cache is restored, so a
 * hydrated paused mutation resumes. `networkMode: "online"` pauses a write
 * before it is sent while the browser is offline [ASSUMPTION, against the
 * contract's `offlineFirst`: that sends once and, with no retry, fails
 * rather than pausing].
 */
export function registerOfflineWrites(
  queryClient: QueryClient,
  send: SendWrite,
): void {
  for (const write of OFFLINE_WRITES) {
    queryClient.setMutationDefaults(["writes", write], {
      networkMode: "online",
      mutationFn: (variables: unknown, context) => {
        const scenario = context.mutationKey?.[2];
        if (typeof scenario !== "string") {
          return Promise.reject(new Error(`${write}: no scenario in its key`));
        }
        return send(write, scenario, variables);
      },
    });
  }
}
