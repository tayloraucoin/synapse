// drizzle-kit config — uses resolveMigrateDatabaseUrl(). Never used at app runtime.
// Requires DB: set tier URLs in packages/db/.env before running db:generate / db:migrate / db:push.
// See docs/architecture/drizzle-orm-conventions.md

import "dotenv/config";

import { defineConfig } from "drizzle-kit";

import { resolveMigrateDatabaseUrl } from "./src/connection-env";

/**
 * CRITICAL — Supabase coexistence:
 * Supabase owns several Postgres schemas (auth, storage, realtime, vault, …) and
 * manages them itself. We declare a *reference-only* mirror of auth.users in
 * src/schema/auth.ts so our FKs resolve in TypeScript — but drizzle-kit must NEVER
 * generate or drop anything in those schemas. `schemaFilter: ['public']` scopes
 * introspection + migration generation to our own schema only.
 */
export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: resolveMigrateDatabaseUrl(),
  },
  // Only manage our own schema. Never touch Supabase-managed schemas.
  schemaFilter: ["public"],
  entities: {
    roles: {
      provider: "supabase",
    },
  },
  // Surface destructive changes explicitly rather than silently applying them.
  strict: true,
  verbose: true,
});
