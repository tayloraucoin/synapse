#!/usr/bin/env node
/**
 * Create test users via Supabase Auth Admin API (staging project by default).
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

/** Mirrors @syn/auth env resolution — scripts cannot import auth (boundaries §6.2). */
function getSupabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const tier = resolveDbEnvironment(env);
  if (tier === "local" || tier === "staging") {
    return firstNonEmpty(env.NEXT_PUBLIC_SUPABASE_URL_STAGING);
  }
  return (env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
}

function getSupabaseServiceRoleKey(env: NodeJS.ProcessEnv = process.env): string {
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
console.log(
  `@syn/db seed-users — env=${tier}, auth=${tier === "production" ? "production" : "staging"}`,
);

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
