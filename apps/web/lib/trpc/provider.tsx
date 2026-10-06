"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  httpBatchLink,
  TRPCClientError,
  type TRPCLink,
} from "@trpc/client";
import { observable } from "@trpc/server/observable";
import superjson from "superjson";

import type { AppRouter } from "@syn/api";

import { notifySessionExpired } from "@/lib/auth/session-expired";

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
        /*
         * SY-04's first detection. Every procedure in this app is protected, so
         * an `UNAUTHORIZED` from any of them means the session went — and the
         * link is the one place every request passes through, which is what
         * makes this one listener rather than an error branch in each caller.
         *
         * The latch inside `notifySessionExpired` is the ref guard the ticket
         * asks for: a batch of five failing calls raises the dialog once.
         */
        sessionExpiryLink,
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

/**
 * A pass-through link that watches for `UNAUTHORIZED` on the way back.
 *
 * It observes rather than intercepts: the error still reaches the caller, so a
 * screen that wanted to show its own message still can. This only raises the
 * dialog.
 */
const sessionExpiryLink: TRPCLink<AppRouter> = () => (options) =>
  observable((observer) => {
    const subscription = options.next(options.op).subscribe({
      next: (value) => observer.next(value),
      complete: () => observer.complete(),
      error: (error) => {
        if (
          error instanceof TRPCClientError &&
          error.data?.code === "UNAUTHORIZED"
        ) {
          notifySessionExpired();
        }
        observer.error(error);
      },
    });
    return () => subscription.unsubscribe();
  });
