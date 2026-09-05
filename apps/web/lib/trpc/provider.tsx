"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import { trpc } from "./client";

/**
 * TanStack Query is the server-data cache, and the only one. Nothing that came
 * from the API goes into Context or Zustand — see `lib/stores/README.md`.
 */

/**
 * In the browser a relative URL is correct and avoids guessing the origin. On
 * the server — a client component rendered during SSR — a relative URL has no
 * base, so the canonical site origin is used.
 *
 * `NEXT_PUBLIC_SITE_URL` is read as a LITERAL, which is the same documented
 * exception as `lib/clients/supabase/client.ts`: Next inlines a literal
 * `process.env.NEXT_PUBLIC_*` into the client bundle and cannot inline
 * anything else. `next.config.ts` emits it from `env.siteUrl`, so the tier
 * rules still decide the value — including "local is always localhost:3000".
 *
 * Conscious Connections reads `VERCEL_URL` and `PORT` here instead. Both are
 * undeclared env vars that the turbo lint rightly flags, and both are guesses
 * at an origin this app already knows.
 */
function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

interface TrpcProviderProps {
  children: React.ReactNode;
}

export function TrpcProvider({ children }: TrpcProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Thirty seconds: long enough that switching tabs does not refetch
            // the day, short enough that a change made on another device shows
            // up without a reload.
            staleTime: 30_000,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          // superjson must be set on BOTH the link and the server's initTRPC
          // or `Date`s arrive as strings and every time in the app is wrong by
          // a type. CC learned this one the hard way.
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
