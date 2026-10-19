#!/usr/bin/env node
/**
 * Create test users via Supabase Auth Admin API (staging project by default;
 * the local Supabase stack when the local tier opts in, WEB-2).
 * The handle_new_user trigger creates public.users shadow rows on hosted Postgres.
 *
 * The one file outside @syn/auth that imports @supabase/* (MIG-7): named in
 * RESTRICTED_EXTERNAL_EXCEPTIONS (packages/config/eslint/boundaries.js) and
 * reached by a mason and a warden reviewer glob in toolkit.json.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { firstNonEmpty } from "@syn/utils";
import { resolveDbEnvironment } from "../src/connection-env.ts";

/**
 * TODO(INF-5): Taylor supplies the local smoke-test address. Never a real
 * third party's — this creates an account and can send mail. A `.test` domain
 * is deliberate: it cannot resolve, so a stray verification email goes nowhere.
 * [NEEDS VALUE AT BUILD]
 */
const users = [
  { email: "dev@synapse.test", password: "dev-password-change-me" },
] as const;

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Mirrors @syn/auth's getLocalSupabaseUrl: the local stack's URL when the
 * local tier opts in, "" otherwise; a URL that is not this machine's is refused.
 */
function getLocalSupabaseUrl(env: NodeJS.ProcessEnv): string {
  if (resolveDbEnvironment(env) !== "local") return "";
  const url = (env.NEXT_PUBLIC_SUPABASE_URL_LOCAL ?? "").trim();
  if (!url) return "";
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    // Refused below.
  }
  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(
      `@syn/db seed-users: NEXT_PUBLIC_SUPABASE_URL_LOCAL must point at this machine; it is "${url}".`,
    );
  }
  return url;
}

/** Mirrors @syn/auth env resolution — scripts cannot import auth (boundaries §6.2). */
function getSupabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const local = getLocalSupabaseUrl(env);
  if (local) return local;
  const tier = resolveDbEnvironment(env);
  if (tier === "local" || tier === "staging") {
    return firstNonEmpty(env.NEXT_PUBLIC_SUPABASE_URL_STAGING);
  }
  return (env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
}

function getSupabaseServiceRoleKey(
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (getLocalSupabaseUrl(env)) {
    return firstNonEmpty(
      env.SUPABASE_SECRET_KEY_LOCAL,
      env.SUPABASE_SERVICE_ROLE_KEY_LOCAL,
    );
  }
  const tier = resolveDbEnvironment(env);
  if (tier === "local" || tier === "staging") {
    return firstNonEmpty(
      env.SUPABASE_SECRET_KEY_STAGING,
      env.SUPABASE_SERVICE_ROLE_KEY_STAGING,
      env.SUPABASE_SECRET_KEY,
      env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }
  return firstNonEmpty(env.SUPABASE_SECRET_KEY, env.SUPABASE_SERVICE_ROLE_KEY);
}

const url = getSupabaseUrl();
const serviceKey = getSupabaseServiceRoleKey();

if (!url || !serviceKey) {
  console.error(
    "@syn/db seed-users: set Supabase URL + service role key for the active auth tier.",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const tier = resolveDbEnvironment();
const authSource = LOCAL_HOSTS.has(new URL(url).hostname)
  ? "local stack"
  : tier === "production"
    ? "production"
    : "staging";
console.log(`@syn/db seed-users — env=${tier}, auth=${authSource}`);

for (const user of users) {
  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
  });

  if (error) {
    console.error(`  ✗ ${user.email}: ${error.message}`);
    continue;
  }

  console.log(`  ✓ ${user.email} → ${data.user?.id}`);
}
