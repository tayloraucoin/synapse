import type { LiveDomain } from "./domains";
import { callLive } from "./errors";

/**
 * Linear, live (USE-101): `linear.read` and Sync now. The read returns each
 * workspace's latest snapshot, a stale one synced first on the server (the
 * cadence: the pool opening, focus after two minutes, every five while
 * visible; `useLinearIssues`). Sync now forces it, the server refusing
 * within 30 s of the last. Polling only.
 *
 * USE-102 adds the outbox: a status, priority, description or estimate
 * (`linear.write`), the check (`linear.writeDone`) and Try again
 * (`linear.retry`). Each returns its row's view, settled by the server's
 * send after its transaction, so the fixture's sender has nothing to do
 * here. A refusal (not linked, no such status or row) is the planner's.
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

    writeLinearIssue: (input) =>
      callLive("planner", () => client.linear.write.mutate(input)),

    writeLinearDone: (input) =>
      callLive("planner", () => client.linear.writeDone.mutate(input)),

    retryLinearWrite: (id) =>
      callLive("planner", () => client.linear.retry.mutate({ id })),

    // The server sends each row after its own write; nothing waits here.
    sendLinearOutbox: () => undefined,
  }),
};
