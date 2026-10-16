import type { FixtureServer } from "@/lib/fixtures/server";
import type { TrpcClient } from "@/lib/trpc/client";

/**
 * A domain served live (USE-90): the server methods it answers, each a call
 * through the tRPC client with its refusal mapped (`callLive`). Wave 3's
 * tickets (USE-91 to USE-105) add one module each beside this file and list
 * it in `LIVE_DOMAINS`; a method no live domain answers falls back to the
 * fixtures outside production and fails as `UnwiredDomain` in a build.
 */
export interface LiveDomain {
  name: string;
  methods: (client: TrpcClient) => Partial<FixtureServer>;
}

export const LIVE_DOMAINS: readonly LiveDomain[] = [];
