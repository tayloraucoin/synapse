// Cookie-bound server client for RSC, route handlers, and server actions.
// Never import this file from 'use client' components.

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import type { CookieMethodsServer, CookieOptionsWithName } from "@supabase/ssr";
import type { SupabaseClient, SupabaseClientOptions } from "@supabase/supabase-js";

import { getSupabaseCookieOptions } from "./cookies";
import { requireSupabasePublicCredentials } from "./env";

type CreateServerClientOptions = SupabaseClientOptions<"public"> & {
  cookies: CookieMethodsServer;
  cookieOptions?: CookieOptionsWithName;
  cookieEncoding?: "raw" | "base64url";
};

/**
 * Cookie-bound Supabase client for server contexts.
 * Pass cookie methods from next/headers or NextRequest/NextResponse adapters.
 */
export function createServerClient(
  cookies: CookieMethodsServer,
): SupabaseClient {
  const { url, anonKey } = requireSupabasePublicCredentials();
  const cookieOptions = getSupabaseCookieOptions();
  const options: CreateServerClientOptions = {
    cookies,
    ...(cookieOptions ? { cookieOptions } : {}),
  };
  return createSupabaseServerClient(url, anonKey, options);
}
