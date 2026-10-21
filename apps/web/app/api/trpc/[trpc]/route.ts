import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createContext } from "@syn/api";
import { createServerClient } from "@syn/auth";

/**
 * The tRPC fetch adapter — the rail every client-side query and mutation
 * arrives on.
 *
 * Cookies come from the request header rather than `next/headers` so the
 * handler depends on what it was handed. It does not write cookies back:
 * `proxy.ts` refreshes this request before it arrives, so the token here is
 * already live and the refreshed cookies are on the proxy's response.
 */

function parseCookieHeader(
  cookieHeader: string,
): { name: string; value: string }[] {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const index = part.indexOf("=");
      if (index === -1) return { name: part, value: "" };
      return {
        name: part.slice(0, index),
        value: decodeURIComponent(part.slice(index + 1)),
      };
    });
}

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const cookieHeader = req.headers.get("cookie");
      const supabase = createServerClient({
        getAll() {
          return cookieHeader ? parseCookieHeader(cookieHeader) : [];
        },
        setAll() {
          // See the note above: proxy.ts refreshed this request already.
        },
      });

      return createContext({ supabase });
    },
  });

export { handler as GET, handler as POST };
