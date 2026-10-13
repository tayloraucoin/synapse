// Supabase Auth credentials follow DATABASE_ENVIRONMENT (same rule as @syn/db):
// - local: staging Supabase credentials (*_STAGING vars) + local Postgres
// - staging: staging Supabase credentials
// - production: production Supabase credentials (unprefixed vars)
//
// Apps collapse tier-specific vars into canonical names via buildSupabaseEnvForNextConfig()
// in next.config.ts env block. Server/runtime resolution uses DATABASE_ENVIRONMENT + tier
// vars (*_STAGING vs unprefixed) — never production NEXT_PUBLIC_* when tier is staging.
//
// NOTE: This module resolves env via dynamic property access, which Next.js cannot inline
// into transpiled workspace bundles — browser bundles will see undefined. Client components
// must use an app-local browser client that reads canonical process.env.* literals directly
// (see apps/web/lib/clients/supabase/client.ts).

import { firstNonEmpty } from "@syn/utils";

/** Staging Supabase project for local + staging tiers; production otherwise. */
function usesStagingSupabase(env: NodeJS.ProcessEnv = process.env): boolean {
  const tier =
    env.DATABASE_ENVIRONMENT?.trim().toLowerCase() ||
    env.NEXT_PUBLIC_DATABASE_ENVIRONMENT?.trim().toLowerCase();
  return tier === "local" || tier === "staging";
}

/** Project URL from Supabase dashboard (Settings → API). */
export function getSupabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  if (usesStagingSupabase(env)) {
    return firstNonEmpty(env.NEXT_PUBLIC_SUPABASE_URL_STAGING);
  }
  return (env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
}

/**
 * Publishable (preferred) or legacy anon key for browser + cookie-bound server clients.
 * @see https://supabase.com/docs/guides/api/api-keys
 */
export function getSupabaseAnonKey(env: NodeJS.ProcessEnv = process.env): string {
  if (usesStagingSupabase(env)) {
    return firstNonEmpty(
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_STAGING,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING,
    );
  }
  return firstNonEmpty(
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Server-only service role / secret key. Never expose to browser bundles. */
export function getSupabaseServiceRoleKey(
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (usesStagingSupabase(env)) {
    return firstNonEmpty(
      env.SUPABASE_SECRET_KEY_STAGING,
      env.SUPABASE_SERVICE_ROLE_KEY_STAGING,
      env.SUPABASE_SECRET_KEY,
      env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }
  return firstNonEmpty(
    env.SUPABASE_SECRET_KEY,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/**
 * Next.js `env` block helper: collapse staging vs production into canonical names
 * so runtime code reads NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.
 *
 * Usage in apps/<app>/next.config.ts:
 *   import { buildSupabaseEnvForNextConfig } from "@syn/auth";
 *   env: { ...buildSupabaseEnvForNextConfig() }
 */
export function buildSupabaseEnvForNextConfig(
  env: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const out: Record<string, string> = {};

  const url = getSupabaseUrl(env);
  if (url) out.NEXT_PUBLIC_SUPABASE_URL = url;

  const anonKey = getSupabaseAnonKey(env);
  if (anonKey) {
    out.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey;
    out.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = anonKey;
  }

  const serviceKey = getSupabaseServiceRoleKey(env);
  if (serviceKey) {
    out.SUPABASE_SERVICE_ROLE_KEY = serviceKey;
    out.SUPABASE_SECRET_KEY = serviceKey;
  }

  const tier = env.DATABASE_ENVIRONMENT?.trim().toLowerCase();
  if (tier) {
    out.DATABASE_ENVIRONMENT = tier;
    out.NEXT_PUBLIC_DATABASE_ENVIRONMENT = tier;
  }

  const cookieDomain = env.NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN?.trim();
  if (cookieDomain) {
    out.NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN = cookieDomain;
  }

  return out;
}

const MISSING_PUBLIC_SUPABASE_MSG =
  "@syn/auth: NEXT_PUBLIC_SUPABASE_URL and a public Supabase key are required. " +
  "Set staging or production vars in .env — see .env.example.";

/** Throws when public Supabase credentials are missing (go-live guard). */
export function requireSupabasePublicCredentials(
  env: NodeJS.ProcessEnv = process.env,
): { url: string; anonKey: string } {
  const url = getSupabaseUrl(env);
  const anonKey = getSupabaseAnonKey(env);
  if (!url || !anonKey) {
    throw new Error(MISSING_PUBLIC_SUPABASE_MSG);
  }
  return { url, anonKey };
}
