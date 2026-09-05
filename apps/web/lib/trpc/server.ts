import { cache } from "react";
import { cookies } from "next/headers";

import { createCaller, createContext } from "@syn/api";
import { createServerClient } from "@syn/auth";

/**
 * The server-side tRPC caller, for Server Components.
 *
 * A page never `fetch`es `/api/trpc` — it calls the router in-process, so
 * there is no HTTP round trip to the app's own server and no serialisation of
 * data that is about to be rendered. `cache()` gives one context and one
 * caller per request, so a layout and its page share the auth round trip.
 */
const createTRPCContext = cache(async () => {
  const cookieStore = await cookies();

  const supabase = createServerClient({
    getAll() {
      return cookieStore.getAll();
    },
    setAll() {
      // A server component cannot set cookies; proxy.ts refreshes the session.
    },
  });

  return createContext({ supabase });
});

export const getServerApi = cache(async () => {
  const ctx = await createTRPCContext();
  return createCaller(ctx);
});
