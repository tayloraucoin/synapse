import type { FixtureServer } from "@/lib/fixtures/server";
import type { TrpcClient } from "@/lib/trpc/client";
import { LIVE_DOMAINS, type LiveDomain } from "./domains";
import { UnwiredDomain } from "./errors";

/**
 * The live server (USE-90): the fixture server's shape, its methods from the
 * live domains, so a hook swaps servers and keeps its name, arguments and
 * return. A method no domain answers goes to `fallback` (the default
 * scenario's fixture server, outside production) or, with none, rejects as
 * `UnwiredDomain`.
 */

/** The fixtures' retries and reconnect: a live retry is a refetch. */
const FIXTURE_ONLY = new Set<string>([
  "recover",
  "recoverReading",
  "recoverTodos",
  "reconnect",
]);

const noop = () => {};

export interface LiveServerOptions {
  domains?: readonly LiveDomain[];
  /** The unwired methods' server, or null in a production build. */
  fallback: (() => FixtureServer) | null;
}

export function createLiveServer(
  client: TrpcClient,
  { domains = LIVE_DOMAINS, fallback }: LiveServerOptions,
): FixtureServer {
  const wired: Record<string, unknown> = {};
  for (const domain of domains) Object.assign(wired, domain.methods(client));

  return new Proxy({} as FixtureServer, {
    get(_target, key) {
      // Not a thenable, and no symbol is a method.
      if (typeof key !== "string" || key === "then") return undefined;
      if (Object.hasOwn(wired, key)) return wired[key];
      if (FIXTURE_ONLY.has(key)) return noop;
      if (fallback) {
        const server = fallback();
        const value = server[key as keyof FixtureServer];
        return typeof value === "function" ? value.bind(server) : value;
      }
      return () => Promise.reject(new UnwiredDomain(key));
    },
  });
}

