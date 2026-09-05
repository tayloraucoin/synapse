// EXAMPLE — requires DATABASE_URL at runtime (pooled Supabase URL, port 6543).
// Singleton runtime client. prepare:false is mandatory over the transaction pooler.
// See docs/architecture/drizzle-orm-conventions.md and .env.example.

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { resolveDbEnvironment, resolveRuntimeDatabaseUrl } from "./connection-env";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

let instance: Db | null = null;

function createDb(): Db {
  const sql = postgres(resolveRuntimeDatabaseUrl(), {
    prepare: false,
    // Local Supabase caps connections low; one shared pool for db + RLS.
    max: resolveDbEnvironment() === "local" ? 5 : 10,
  });
  return drizzle(sql, { schema });
}

/** Lazily initialized singleton. Safe to import at type-check time without a live DB. */
export function getDb(): Db {
  if (!instance) {
    instance = createDb();
  }
  return instance;
}

/**
 * Singleton runtime client (lazy proxy).
 * First query triggers connection using DATABASE_URL.
 */
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
