import {
  parseDatabaseEnvironment,
  resolveOptionalMigrateDatabaseUrl,
  resolveOptionalRuntimeDatabaseUrl,
  type DbEnvironment,
} from "@syn/db/connection-env";
import { firstNonEmpty } from "@syn/utils";

/**
 * Collapses the tier-specific raw variables into the canonical values this app
 * actually uses. Read only by `env.ts`; nothing else imports this file.
 *
 * The tier grammar: `local` and `staging` both use the STAGING Supabase
 * project, `production` uses its own. That is what lets a laptop authenticate
 * against real staging users while its `public.*` data stays local.
 */

/** Raw env shape after t3-env validation — only read in `env.ts`. */
export type WebRawEnv = {
  DATABASE_ENVIRONMENT?: string;
  NODE_ENV: "development" | "test" | "production";
  LOCAL_DATABASE_URL?: string;
  LOCAL_DIRECT_DATABASE_URL?: string;
  SUPABASE_STAGING_TRANSACTION_POOLER_CONNECTION_URL?: string;
  SUPABASE_STAGING_SESSION_POOLER_CONNECTION_URL?: string;
  SUPABASE_LIVE_TRANSACTION_POOLER_CONNECTION_URL?: string;
  SUPABASE_LIVE_SESSION_POOLER_CONNECTION_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL_STAGING?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_STAGING?: string;
  SUPABASE_SERVICE_ROLE_KEY_STAGING?: string;
  SUPABASE_SECRET_KEY_STAGING?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_SECRET_KEY?: string;
  NEXT_PUBLIC_SITE_URL_LOCAL?: string;
  NEXT_PUBLIC_SITE_URL_STAGING?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_VAPID_PUBLIC_KEY?: string;
};

export type WebResolvedEnv = {
  databaseEnvironment: DbEnvironment;
  /** Canonical pooled URL consumed by `@syn/db` at runtime (port 6543). */
  databaseUrl: string | undefined;
  /** Canonical direct URL for drizzle-kit only (port 5432). */
  directDatabaseUrl: string | undefined;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
  supabaseServiceRoleKey: string | undefined;
  /** This app's public origin for the active tier. */
  siteUrl: string;
  vapidPublicKey: string | undefined;
};

/** Local and staging both use the staging Supabase project (see `SETUP.md` §3). */
function supabaseTierFor(
  databaseEnvironment: DbEnvironment,
): "staging" | "production" {
  return databaseEnvironment === "production" ? "production" : "staging";
}

function pickSupabasePublic(
  raw: WebRawEnv,
  tier: "staging" | "production",
): { url?: string; anonKey?: string } {
  if (tier === "staging") {
    return {
      url: raw.NEXT_PUBLIC_SUPABASE_URL_STAGING,
      anonKey: firstNonEmpty(
        raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_STAGING,
        raw.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING,
      ),
    };
  }
  return {
    url: raw.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: firstNonEmpty(
      raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      raw.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

function pickSupabaseServiceRole(
  raw: WebRawEnv,
  tier: "staging" | "production",
): string | undefined {
  if (tier === "staging") {
    return firstNonEmpty(
      raw.SUPABASE_SECRET_KEY_STAGING,
      raw.SUPABASE_SERVICE_ROLE_KEY_STAGING,
    );
  }
  return firstNonEmpty(raw.SUPABASE_SECRET_KEY, raw.SUPABASE_SERVICE_ROLE_KEY);
}

function normalizeAppUrl(url: string | undefined): string | undefined {
  const trimmed = url?.trim().replace(/\/$/, "");
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

/** The local origin is fixed, not configured — see `resolveSiteUrl`. */
const LOCAL_SITE_URL = "http://localhost:3000";

/**
 * THE LOCAL ORIGIN IS ALWAYS `http://localhost:3000`, whatever
 * `NEXT_PUBLIC_SITE_URL_LOCAL` says.
 *
 * The failure this prevents is specific and expensive: a stale staging or
 * production origin left in a local `.env.local` sends OAuth redirects and
 * email confirmation links to the deployed app, so a person developing
 * locally signs in — on the deployed site — and cannot tell from the browser
 * that anything went wrong. Adopted from `taylor-aucoin`, which learned it the
 * hard way.
 */
function resolveSiteUrl(raw: WebRawEnv, tier: DbEnvironment): string {
  if (tier === "local") return LOCAL_SITE_URL;
  if (tier === "staging") {
    return normalizeAppUrl(raw.NEXT_PUBLIC_SITE_URL_STAGING) ?? LOCAL_SITE_URL;
  }
  return normalizeAppUrl(raw.NEXT_PUBLIC_SITE_URL) ?? LOCAL_SITE_URL;
}

/**
 * Only the six tier URLs and the tier itself — deliberately not spread over
 * `process.env`. `@syn/db`'s resolvers fall back to a canonical `DATABASE_URL`
 * when one is present, and inheriting a stray one from the ambient environment
 * would let it silently outrank the tier this app resolved.
 */
function databaseProcessEnv(raw: WebRawEnv): NodeJS.ProcessEnv {
  return {
    DATABASE_ENVIRONMENT: raw.DATABASE_ENVIRONMENT,
    LOCAL_DATABASE_URL: raw.LOCAL_DATABASE_URL,
    LOCAL_DIRECT_DATABASE_URL: raw.LOCAL_DIRECT_DATABASE_URL,
    SUPABASE_STAGING_TRANSACTION_POOLER_CONNECTION_URL:
      raw.SUPABASE_STAGING_TRANSACTION_POOLER_CONNECTION_URL,
    SUPABASE_STAGING_SESSION_POOLER_CONNECTION_URL:
      raw.SUPABASE_STAGING_SESSION_POOLER_CONNECTION_URL,
    SUPABASE_LIVE_TRANSACTION_POOLER_CONNECTION_URL:
      raw.SUPABASE_LIVE_TRANSACTION_POOLER_CONNECTION_URL,
    SUPABASE_LIVE_SESSION_POOLER_CONNECTION_URL:
      raw.SUPABASE_LIVE_SESSION_POOLER_CONNECTION_URL,
  } as unknown as NodeJS.ProcessEnv;
}

export function resolveWebTierEnv(raw: WebRawEnv): WebResolvedEnv {
  const databaseEnvironment = parseDatabaseEnvironment(raw.DATABASE_ENVIRONMENT);
  const dbEnv = databaseProcessEnv(raw);
  const supabaseTier = supabaseTierFor(databaseEnvironment);
  const supabasePublic = pickSupabasePublic(raw, supabaseTier);

  return {
    databaseEnvironment,
    databaseUrl: resolveOptionalRuntimeDatabaseUrl(dbEnv),
    directDatabaseUrl: resolveOptionalMigrateDatabaseUrl(dbEnv),
    supabaseUrl: supabasePublic.url,
    supabaseAnonKey: supabasePublic.anonKey,
    supabaseServiceRoleKey: pickSupabaseServiceRole(raw, supabaseTier),
    siteUrl: resolveSiteUrl(raw, databaseEnvironment),
    vapidPublicKey: raw.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  };
}
