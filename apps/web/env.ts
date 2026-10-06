/**
 * THE ONLY `process.env` READER IN THIS APP.
 *
 * Two exceptions exist and both are documented where they live:
 * `lib/clients/supabase/client.ts` reads canonical `NEXT_PUBLIC_*` names as
 * literals (Next cannot inline a dynamic lookup into a browser bundle), and
 * `lib/env/resolve-tier-env.ts` is this file's own helper.
 *
 * Tier selection: `DATABASE_ENVIRONMENT=local|staging|production`, **defaulting
 * to `local`** — a shell with nothing set must not reach production (INF-5).
 *
 * Everything is `.optional()` on purpose: a type-check or a Storybook build
 * with no secrets must succeed, and the thing that actually needs a value
 * throws at the point of use with a message naming the variable. A required
 * schema here would turn every missing secret into the same opaque startup
 * failure. `SKIP_ENV_VALIDATION=true` exists for CI without secrets.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import { resolveWebTierEnv } from "./lib/env/resolve-tier-env";

const webRoot = path.dirname(fileURLToPath(import.meta.url));
loadEnvConfig(webRoot);

const rawEnv = createEnv({
  server: {
    DATABASE_ENVIRONMENT: z
      .enum(["local", "staging", "production"])
      .default("local"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // Postgres — tier-specific sources, resolved through @syn/db's connection-env.
    LOCAL_DATABASE_URL: z.string().url().optional(),
    LOCAL_DIRECT_DATABASE_URL: z.string().url().optional(),
    SUPABASE_STAGING_TRANSACTION_POOLER_CONNECTION_URL: z
      .string()
      .url()
      .optional(),
    SUPABASE_STAGING_SESSION_POOLER_CONNECTION_URL: z.string().url().optional(),
    SUPABASE_LIVE_TRANSACTION_POOLER_CONNECTION_URL: z.string().url().optional(),
    SUPABASE_LIVE_SESSION_POOLER_CONNECTION_URL: z.string().url().optional(),

    // Supabase service role — never exposed to a client bundle.
    SUPABASE_SERVICE_ROLE_KEY_STAGING: z.string().min(1).optional(),
    SUPABASE_SECRET_KEY_STAGING: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    SUPABASE_SECRET_KEY: z.string().min(1).optional(),

    // Web Push (VAPID) — the private half. INF-9 sends with it.
    VAPID_PRIVATE_KEY: z.string().min(1).optional(),
    VAPID_SUBJECT: z.string().min(1).optional(),

    // The scheduler route's bearer secret. Unset = the route answers 503 and
    // no scheduled notification is ever sent, which is the safe failure.
    CRON_SECRET: z.string().min(16).optional(),

    // Google OAuth is configured in the Supabase dashboard, not by this app.
    // Declared so a deploy that sets them does not trip t3-env's unknown-key
    // check, and so the names are discoverable from one place.
    GOOGLE_OAUTH_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL_STAGING: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_STAGING: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),

    // This app's public origin, per tier. The `local` value is ignored — see
    // resolveSiteUrl.
    NEXT_PUBLIC_SITE_URL_LOCAL: z.string().optional(),
    NEXT_PUBLIC_SITE_URL_STAGING: z.string().optional(),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

    NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1).optional(),

    // A shared registrable domain for the Supabase auth cookie. Unset = a
    // host-only cookie, which is correct for a single origin.
    NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN: z.string().optional(),

    // ST-00's version line. Stamped by next.config.ts from package.json and
    // the build date; never set by hand in an environment file.
    NEXT_PUBLIC_APP_VERSION: z.string().optional(),
    NEXT_PUBLIC_BUILD_DATE: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_ENVIRONMENT: process.env.DATABASE_ENVIRONMENT,
    NODE_ENV: process.env.NODE_ENV,
    LOCAL_DATABASE_URL: process.env.LOCAL_DATABASE_URL,
    LOCAL_DIRECT_DATABASE_URL: process.env.LOCAL_DIRECT_DATABASE_URL,
    SUPABASE_STAGING_TRANSACTION_POOLER_CONNECTION_URL:
      process.env.SUPABASE_STAGING_TRANSACTION_POOLER_CONNECTION_URL,
    SUPABASE_STAGING_SESSION_POOLER_CONNECTION_URL:
      process.env.SUPABASE_STAGING_SESSION_POOLER_CONNECTION_URL,
    SUPABASE_LIVE_TRANSACTION_POOLER_CONNECTION_URL:
      process.env.SUPABASE_LIVE_TRANSACTION_POOLER_CONNECTION_URL,
    SUPABASE_LIVE_SESSION_POOLER_CONNECTION_URL:
      process.env.SUPABASE_LIVE_SESSION_POOLER_CONNECTION_URL,
    SUPABASE_SERVICE_ROLE_KEY_STAGING:
      process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING,
    SUPABASE_SECRET_KEY_STAGING: process.env.SUPABASE_SECRET_KEY_STAGING,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    VAPID_SUBJECT: process.env.VAPID_SUBJECT,
    CRON_SECRET: process.env.CRON_SECRET,
    GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    NEXT_PUBLIC_SUPABASE_URL_STAGING:
      process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_STAGING:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_STAGING,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL_LOCAL: process.env.NEXT_PUBLIC_SITE_URL_LOCAL,
    NEXT_PUBLIC_SITE_URL_STAGING: process.env.NEXT_PUBLIC_SITE_URL_STAGING,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN:
      process.env.NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_BUILD_DATE: process.env.NEXT_PUBLIC_BUILD_DATE,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});

const resolved = resolveWebTierEnv(rawEnv);

/** Validated raw + tier-resolved env. Import `env` — never `process.env`. */
export const env = {
  ...rawEnv,
  ...resolved,
  vapidPrivateKey: rawEnv.VAPID_PRIVATE_KEY,
  vapidSubject: rawEnv.VAPID_SUBJECT,
  cronSecret: rawEnv.CRON_SECRET,
};

export type Env = typeof env;
