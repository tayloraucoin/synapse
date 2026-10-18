import type { LiveDomain } from "./domains";

/**
 * Linear, live (USE-101): `linear.read` and Sync now. The read returns each
 * workspace's latest snapshot, a stale one synced first on the server (the
 * cadence: the pool opening, focus after two minutes, every five while
 * visible; `useLinearIssues`). Sync now forces it, the server refusing
 * within 30 s of the last. Polling only. The status, done and reopen
 * writes are USE-102's outbox, so they stay unwired (the fixtures in
 * development). Read-only here, and it refuses nothing, so no refusal is
 * mapped.
 */
export const linearDomain: LiveDomain = {
  name: "linear",
  methods: (client) => ({
    readLinear: () => client.linear.read.query(),

    async syncLinear(connectionId) {
      await client.linear.sync.mutate(
        connectionId === undefined ? undefined : { connectionId },
      );
    },
  }),
};
