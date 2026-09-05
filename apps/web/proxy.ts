/**
 * Session refresh only. Route protection lives in the shell layout (INF-7).
 *
 * Next 16 names this `proxy.ts`, not `middleware.ts`.
 *
 * WHY PROTECTION IS NOT HERE: a proxy runs on every matched request, so a
 * redirect written here has to know about assets, prefetches, and the auth
 * routes themselves — and gets one of them wrong. A layout knows exactly which
 * subtree it guards.
 */

import { updateSession } from "@syn/auth";
import { NextRequest, NextResponse } from "next/server";

import { logoutRoute, signInRoute } from "./lib/routes";

const SKIP_PATHS = new Set([signInRoute(), logoutRoute()]);
const SKIP_PREFIXES = ["/auth/", "/api/"];

function shouldSkipProxy(pathname: string): boolean {
  if (SKIP_PATHS.has(pathname)) return true;
  return SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(request: NextRequest) {
  if (shouldSkipProxy(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  const requestHeaders = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;

  // Lets a server component know the path it is rendering for, which is what
  // a sign-in redirect needs to build its `next`.
  requestHeaders.set("x-next-path", `${pathname}${request.nextUrl.search}`);

  const enrichedRequest = new NextRequest(request, { headers: requestHeaders });

  return updateSession(
    enrichedRequest as unknown as Parameters<typeof updateSession>[0],
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2)$).*)",
  ],
};
