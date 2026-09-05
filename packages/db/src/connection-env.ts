/**
 * Resolves Postgres connection URLs from DATABASE_ENVIRONMENT and tier-specific env vars.
 * Apps and drizzle-kit should use these helpers — do not hardcode DATABASE_URL / DIRECT_DATABASE_URL.
 */

export type DbEnvironment = "local" | "staging" | "production";

function requireEnv(name: string, env: NodeJS.ProcessEnv): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(
      `@syn/db: Set ${name} for DATABASE_ENVIRONMENT=${resolveDbEnvironment(env)} (see packages/db/.env).`,
    );
  }
  return value;
}

/**
 * Preferred: `DATABASE_ENVIRONMENT=local|staging|production`.
 *
 * DEFAULTS TO `local`, not `production` — this is the one place Synapse
 * deliberately diverges from Conscious Connections' copy of this file.
 *
 * The failure this prevents: a laptop, a CI job, or a script with nothing set
 * silently opening a connection to the production database. Defaulting to
 * `production` makes the dangerous tier the one you get by forgetting; making
 * it `local` means forgetting costs you a connection error, which is the
 * failure you want. Vercel sets `DATABASE_ENVIRONMENT` explicitly for every
 * environment (INF-10), so no deployed surface relies on this default.
 */
export function resolveDbEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): DbEnvironment {
  const normalized = env.DATABASE_ENVIRONMENT?.trim().toLowerCase();
  if (
    normalized === "local" ||
    normalized === "staging" ||
    normalized === "production"
  ) {
    return normalized;
  }
  return "local";
}

/** Parse DATABASE_ENVIRONMENT from a raw string (app env.ts tier resolution). */
export function parseDatabaseEnvironment(raw?: string): DbEnvironment {
  return resolveDbEnvironment(
    raw !== undefined ? { ...process.env, DATABASE_ENVIRONMENT: raw } : process.env,
  );
}

/**
 * Runtime queries — transaction pooler (port 6543) on hosted tiers; local uses LOCAL_DATABASE_URL.
 */
export function resolveRuntimeDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const canonical = env.DATABASE_URL?.trim();
  if (canonical) {
    return canonical;
  }

  const tier = resolveDbEnvironment(env);

  switch (tier) {
    case "local":
      return requireEnv("LOCAL_DATABASE_URL", env);
    case "staging":
      return requireEnv("SUPABASE_STAGING_TRANSACTION_POOLER_CONNECTION_URL", env);
    case "production":
      return requireEnv("SUPABASE_LIVE_TRANSACTION_POOLER_CONNECTION_URL", env);
  }
}

/**
 * Migrations / drizzle-kit — session pooler (port 5432) on hosted tiers; local uses LOCAL_DIRECT_DATABASE_URL.
 * Despite the historical name, this is NOT the Supabase "Direct connection" tab (IPv6-only).
 */
export function resolveMigrateDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const canonical = env.DIRECT_DATABASE_URL?.trim();
  if (canonical) {
    return canonical;
  }

  const tier = resolveDbEnvironment(env);

  switch (tier) {
    case "local":
      return requireEnv("LOCAL_DIRECT_DATABASE_URL", env);
    case "staging":
      return requireEnv("SUPABASE_STAGING_SESSION_POOLER_CONNECTION_URL", env);
    case "production":
      return requireEnv("SUPABASE_LIVE_SESSION_POOLER_CONNECTION_URL", env);
  }
}

/** Like resolveRuntimeDatabaseUrl but returns undefined when the tier URL is unset. */
export function resolveOptionalRuntimeDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  try {
    return resolveRuntimeDatabaseUrl(env);
  } catch {
    return undefined;
  }
}

/** Like resolveMigrateDatabaseUrl but returns undefined when the tier URL is unset. */
export function resolveOptionalMigrateDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  try {
    return resolveMigrateDatabaseUrl(env);
  } catch {
    return undefined;
  }
}

export type DatabaseEnvironmentValueMap = Record<
  DbEnvironment,
  string | undefined
>;

export type ResolveByDatabaseEnvironmentOptions = {
  environment?: {
    databaseEnvironment?: string;
  };
} & DatabaseEnvironmentValueMap;

/**
 * Picks one tier value based on DATABASE_ENVIRONMENT. Throws when unset (go-live guard).
 */
export function resolveByDatabaseEnvironment<const TKey extends string>(
  keyName: TKey,
  {
    environment,
    local,
    staging,
    production,
  }: ResolveByDatabaseEnvironmentOptions,
): Record<TKey, string> {
  const databaseEnvironment = resolveDbEnvironment(
    environment?.databaseEnvironment
      ? {
          ...process.env,
          DATABASE_ENVIRONMENT: environment.databaseEnvironment,
        }
      : process.env,
  );

  const values: DatabaseEnvironmentValueMap = { local, staging, production };
  const value = values[databaseEnvironment]?.trim();

  if (!value) {
    throw new Error(
      `resolveByDatabaseEnvironment: empty value for "${databaseEnvironment}" (${keyName})`,
    );
  }

  return { [keyName]: value } as Record<TKey, string>;
}

/** Like resolveByDatabaseEnvironment but returns undefined when the tier value is unset. */
export function resolveOptionalByDatabaseEnvironment<const TKey extends string>(
  keyName: TKey,
  options: ResolveByDatabaseEnvironmentOptions,
): Record<TKey, string | undefined> {
  try {
    return resolveByDatabaseEnvironment(keyName, options);
  } catch {
    return { [keyName]: undefined } as Record<TKey, string | undefined>;
  }
}

/** Human-readable migrate target for confirmation prompts — no credentials. */
export function describeDatabaseUrl(urlString: string): {
  database: string;
  host: string;
  port: string;
} {
  try {
    const url = new URL(urlString);
    return {
      host: url.hostname,
      port: url.port || "5432",
      database: url.pathname.replace(/^\//, "") || "postgres",
    };
  } catch {
    return { host: "unknown", port: "unknown", database: "unknown" };
  }
}
