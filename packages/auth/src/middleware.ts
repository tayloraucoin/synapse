// Session refresh helper for app proxy.ts (Next.js 16+).
// Route protection stays in the app — this only refreshes auth cookies.

import type { CookieMethodsServer } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseUrl } from "./env";
import { createServerClient } from "./server";

function supabaseProjectRefFromUrl(url: string): string | null {
  try {
    const [ref] = new URL(url).hostname.split(".");
    return ref || null;
  } catch {
    return null;
  }
}

/** Drop auth cookies from other Supabase projects (e.g. after tier / env switch). */
function purgeForeignSupabaseAuthCookies(
  request: NextRequest,
  response: NextResponse,
  activeRef: string,
): void {
  const prefix = `sb-${activeRef}-`;
  for (const { name } of request.cookies.getAll()) {
    if (!name.startsWith("sb-") || name.startsWith(prefix)) continue;
    request.cookies.delete(name);
    response.cookies.delete(name);
  }
}

/**
 * Refreshes the Supabase session and returns a NextResponse with updated
 * cookies. Called from `apps/web/proxy.ts` on every matched request.
 *
 * THIS IS THE ONLY PLACE SESSIONS REFRESH. Route protection lives in layouts,
 * never here: a proxy that redirects is a proxy that runs on every asset
 * request and has to be taught what an asset is.
 *
 * The foreign-cookie purge matters more than it looks. Local and staging both
 * point at the staging Supabase project while production points at its own, so
 * switching tiers on one machine leaves `sb-<other-ref>-*` cookies behind that
 * the SDK will happily try to refresh against the wrong project.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const activeRef = supabaseProjectRefFromUrl(getSupabaseUrl());
  if (activeRef) {
    purgeForeignSupabaseAuthCookies(request, response, activeRef);
  }

  const cookies: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => {
        request.cookies.set(name, value);
      });
      response = NextResponse.next({ request });
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
    },
  };

  const supabase = createServerClient(cookies);
  await supabase.auth.getUser();

  return response;
}
