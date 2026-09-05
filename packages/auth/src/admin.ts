// SERVER ONLY — service-role client. Never import from 'use client' components;
// the service key must never reach a browser bundle (same discipline as server.ts).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

const MISSING_ADMIN_CREDENTIALS_MSG =
  "@syn/auth: NEXT_PUBLIC_SUPABASE_URL and a service-role key are required for " +
  "the admin client. Set staging or production vars in .env — see .env.example.";

/**
 * Service-role Supabase client for explicit admin paths (GoTrue admin API,
 * e.g. `auth.admin.generateLink`). Stateless: no session persistence, no
 * token refresh. Callers own the authorization decision — pair with
 * `buildServiceRoleAuthContext` discipline: explicit, rare, server-only.
 */
export function createAdminClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!url || !serviceRoleKey) {
    throw new Error(MISSING_ADMIN_CREDENTIALS_MSG);
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
