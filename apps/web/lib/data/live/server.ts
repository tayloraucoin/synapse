import { writeTodoSlot } from "@/lib/data/write-todo-slot";
import type { FixtureServer } from "@/lib/fixtures/server";
import type { TrpcClient } from "@/lib/trpc/client";
import { LIVE_DOMAINS, type LiveMethods } from "./domains";

/**
 * The live server (USE-90, USE-108): the fixture server's shape, every
 * method from the live domains, so a hook swaps servers and keeps its name,
 * arguments and return. There is no fallback: the assignment below is a
 * type error while any method is neither a domain's nor fixture-only.
 */

const noop = () => {};

/** The fixtures' retries and reconnects: a live retry is a refetch. */
const FIXTURE_ONLY = {
  recover: noop,
  recoverReading: noop,
  recoverTodos: noop,
  reconnect: noop,
  recoverConnections: noop,
  recoverCalendars: noop,
  recoverMorningReading: noop,
} satisfies Partial<FixtureServer>;

export function createLiveServer(client: TrpcClient): FixtureServer {
  const wired = Object.assign(
    {},
    ...LIVE_DOMAINS.map((domain) => domain.methods(client)),
  ) as LiveMethods;
  const server: FixtureServer = {
    ...FIXTURE_ONLY,
    ...wired,
    // Two live calls behind the queue's one write (USE-111).
    writeTodoSlot: (input) => writeTodoSlot(wired, input),
  };
  return server;
}
