import { cache } from "react";
import { cookies } from "next/headers";

import { createServerClient, getUser, type AuthUserResult } from "@syn/auth";

/**
 * Memoised per-request Supabase user lookup.
 *
 * React's `cache()` dedupes this across every server component in one render
 * pass, so a layout and the page it renders share one `auth.getUser()` round
 * trip instead of one each — and `getUser` is a network call to the auth
 * server, not a cookie decode, which is exactly why it is the one to memoise.
 *
 * `proxy.ts` runs in an earlier request phase, outside the RSC render, and is
 * not covered by this cache.
 */
export const getRequestUser = cache(async (): Promise<AuthUserResult> => {
  const cookieStore = await cookies();
  const supabase = createServerClient({
    getAll() {
      return cookieStore.getAll();
    },
    setAll() {
      // A server component cannot set cookies. Refresh happens in proxy.ts.
    },
  });
  return getUser(supabase);
});
