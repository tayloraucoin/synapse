/**
 * @syn/db — Drizzle schema, singleton client, migrations, RLS bridge.
 *
 * Public API: `db`, `createRlsClient`, schema tables + relations, inferred row
 * types. Not exported: `migrate-client` and `seed`, which are scripts.
 *
 * The rule the rest of the codebase inherits from this file: a user-scoped
 * query goes through `createRlsClient(...).execute()`. The exported `db`
 * connects as the table owner and bypasses every policy; it exists for the
 * bridge itself and for system paths, and a procedure that reaches for it is
 * unpoliced, not fast.
 */

export { buildDatabaseEnvForNextConfig } from "./build-database-env-for-next-config";
export { db, getDb, type Db } from "./client";
export {
  describeDatabaseUrl,
  parseDatabaseEnvironment,
  resolveByDatabaseEnvironment,
  resolveDbEnvironment,
  resolveMigrateDatabaseUrl,
  resolveOptionalByDatabaseEnvironment,
  resolveOptionalMigrateDatabaseUrl,
  resolveOptionalRuntimeDatabaseUrl,
  resolveRuntimeDatabaseUrl,
  type DatabaseEnvironmentValueMap,
  type DbEnvironment,
  type ResolveByDatabaseEnvironmentOptions,
} from "./connection-env";
export { createRlsClient, type RlsClient } from "./rls";
export {
  ensureLocalUserFromSupabaseAuth,
  type EnsureLocalUserFromSupabaseAuthInput,
} from "./local-dev/ensure-local-user-from-supabase-auth";

export * from "./schema";

import { users, webPushSubscriptions } from "./schema";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type WebPushSubscription = typeof webPushSubscriptions.$inferSelect;
export type NewWebPushSubscription = typeof webPushSubscriptions.$inferInsert;
