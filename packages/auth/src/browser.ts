// Browser client factory, client-safe: reached through `@syn/auth/browser`.
// Imports nothing server-only and resolves no environment itself.

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { AuthClient } from "./context";

export type { AuthClient };

/** The public credentials a browser client is built from. Never a secret. */
export type PublicAuthCredentials = {
  url: string;
  anonKey: string;
  cookieDomain?: string;
};

/**
 * Cookie-backed Supabase client for client components, built from
 * credentials the caller has already read.
 *
 * WHY IT TAKES CREDENTIALS RATHER THAN READING THEM: Next inlines only a
 * literal `NEXT_PUBLIC_*` environment read into a browser bundle, and this
 * package resolves the tier through dynamic access (`env.ts`), which the
 * browser would see as undefined. The app reads the literals
 * (apps/web/lib/clients/supabase/client.ts) and passes them here, so the SDK
 * call stays in this module.
 */
export function createBrowserClientFromCredentials({
  url,
  anonKey,
  cookieDomain,
}: PublicAuthCredentials): AuthClient {
  return createSupabaseBrowserClient(url, anonKey, {
    ...(cookieDomain ? { cookieOptions: { domain: cookieDomain } } : {}),
  });
}
