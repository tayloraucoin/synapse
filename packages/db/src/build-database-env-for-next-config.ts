import {
  resolveDbEnvironment,
  resolveOptionalRuntimeDatabaseUrl,
} from "./connection-env";

/**
 * Collapse tier-specific Postgres URLs into canonical runtime env for Next.js.
 * Mirrors `buildSupabaseEnvForNextConfig` from @syn/auth.
 *
 * Reads tier vars from the app's `.env.local` (or CI env) and injects only what
 * @syn/db needs at runtime — not every possible SUPABASE_* / LOCAL_* var.
 */
export function buildDatabaseEnvForNextConfig(
  env: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const out: Record<string, string> = {
    DATABASE_ENVIRONMENT: resolveDbEnvironment(env),
  };

  const databaseUrl = resolveOptionalRuntimeDatabaseUrl(env);
  if (databaseUrl) {
    out.DATABASE_URL = databaseUrl;
  }

  return out;
}
