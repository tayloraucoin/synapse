/**
 * Shared SQL fragments for pgPolicy definitions.
 *
 * Policies read the session variables `createRlsClient()` sets in `src/rls.ts`.
 * A policy written against anything else — `auth.uid()` alone, a join through
 * an unpoliced table — is a policy that does not hold on the path the app
 * actually uses.
 *
 * THERE ARE NO ADMIN HELPERS. Conscious Connections has `isAppAdmin`,
 * `isAppSuperAdmin`, and `ownerOrAdmin`; Synapse has none of them, because
 * Synapse's promise is that only the person can see their own data — not the
 * people who built this. A helper that admits an admin read is a helper
 * someone will eventually reach for.
 */
import { sql, type SQL } from "drizzle-orm";

export const appUserId = sql`current_setting('app.user_id', true)`;
export const appUserRole = sql`current_setting('app.user_role', true)`;

/** Owner column equals the authenticated app user. */
export function isOwner(ownerColumn: SQL): SQL {
  return sql`${ownerColumn} = ${appUserId}::uuid`;
}

/**
 * Dual-context user id — for tables the browser would read through Supabase
 * Realtime (postgres_changes).
 *
 * Realtime evaluates RLS in the SUBSCRIBER'S JWT context: `auth.uid()` is set,
 * `app.user_id` is not — that variable exists only inside the server bridge's
 * transactions. A policy written against `app.user_id` alone therefore denies
 * every row to every Realtime subscriber, silently, with the channel still
 * reporting SUBSCRIBED. Any table subscribed to via postgres_changes MUST use
 * these dual-context helpers.
 *
 * Nothing in Phase 1 subscribes; these are here so the Phase 2 offline/sync
 * work does not have to rediscover the trap.
 */
export const dualContextUserId = sql`COALESCE(NULLIF(current_setting('app.user_id', true), '')::uuid, auth.uid())`;

/** `isOwner`, readable in both the server-bridge and JWT (Realtime) contexts. */
export function dualContextIsOwner(ownerColumn: SQL): SQL {
  return sql`${ownerColumn} = ${dualContextUserId}`;
}

/** Deny all access for the authenticated role (service_role bypasses via SET LOCAL). */
export const denyAuthenticated = sql`false`;

/** Any authenticated app user may read. */
export const allowAuthenticatedRead = sql`true`;
