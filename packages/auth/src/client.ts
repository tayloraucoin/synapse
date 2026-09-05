// Browser client factory. Import only from 'use client' components.
// Never import server.ts or middleware.ts from client code.

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabasePublicCredentials } from "./env";

/**
 * Cookie-free Supabase client for client components.
 * Uses NEXT_PUBLIC_* credentials resolved via env.ts (staging-aware).
 *
 * IMPORTANT: env.ts resolves credentials via dynamic property access, which
 * Next.js cannot inline into transpiled workspace bundles — so this factory
 * will throw on the client (browser bundles see undefined env). Apps should
 * provide an app-local browser client that reads canonical `process.env.*`
 * literals directly (see apps/web/lib/clients/supabase/client.ts) and use this only server-side.
 */
export function createBrowserClient(): SupabaseClient {
  const { url, anonKey } = requireSupabasePublicCredentials();
  return createSupabaseBrowserClient(url, anonKey);
}
