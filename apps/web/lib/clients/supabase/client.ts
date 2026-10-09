import {
  createBrowserClientFromCredentials,
  type AuthClient,
} from "@syn/auth/browser";
import { firstNonEmpty } from "@syn/utils";

/**
 * The browser Supabase client. The SDK call is `@syn/auth`'s; this file only
 * reads the credentials.
 *
 * WHY THE READS ARE APP-LOCAL AND NOT `@syn/auth`'s `createBrowserClient`:
 * that factory resolves the tier through dynamic property access
 * (`env[name]`), and Next cannot inline a dynamic lookup into a transpiled
 * workspace bundle — the browser would see `undefined` for both credentials
 * and throw at the first sign-in. This file reads the canonical names as
 * literals, which `next.config.ts` collapses the tier vars into via
 * `buildSupabaseEnvForNextConfig`, and hands them to
 * `createBrowserClientFromCredentials`. Do not "simplify" it back.
 */
function resolvePublicCredentials(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return { url, anonKey };
}

/** True when public Supabase credentials are inlined into the client bundle. */
export function hasSupabasePublicEnv(): boolean {
  const { url, anonKey } = resolvePublicCredentials();
  return Boolean(url && anonKey);
}

export function createClient(): AuthClient {
  const { url, anonKey } = resolvePublicCredentials();

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and a public Supabase key are required. " +
        "Set staging or production vars in apps/web/.env.local — see .env.example.",
    );
  }

  const cookieDomain = process.env.NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN?.trim();

  return createBrowserClientFromCredentials({
    url,
    anonKey,
    ...(cookieDomain ? { cookieDomain } : {}),
  });
}
