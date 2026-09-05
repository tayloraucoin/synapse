import { type NextRequest, NextResponse } from "next/server";

import { clearSupabaseAuthCookies, createServerClient } from "@syn/auth";

import { signInRoute } from "@/lib/routes";

export const dynamic = "force-dynamic";

/**
 * Sign out (AU-06).
 *
 * Two steps, both needed: `signOut()` revokes the refresh token at the auth
 * server, and `clearSupabaseAuthCookies` removes every `sb-*` cookie from this
 * browser. Doing only the first leaves a cookie the SDK will try to refresh;
 * doing only the second leaves a live token that another device still holds.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}${signInRoute()}`);

  const supabase = createServerClient({
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
    },
  });

  await supabase.auth.signOut();
  clearSupabaseAuthCookies(
    { getAll: () => request.cookies.getAll() },
    {
      set: (name, value, options) => {
        response.cookies.set(name, value, options);
      },
    },
  );

  return response;
}
