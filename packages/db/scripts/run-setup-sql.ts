#!/usr/bin/env node
/**
 * Applies Supabase platform SQL (triggers, RLS enablement, storage buckets).
 * Run after drizzle-kit migrate. Idempotent.
 */
import "dotenv/config";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  describeDatabaseUrl,
  resolveDbEnvironment,
  resolveMigrateDatabaseUrl,
} from "../src/connection-env.ts";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const setupDir = path.join(packageRoot, "..", "supabase", "setup");

const files = [
  "01_init_functions.sql",
  "02_apply_triggers_rls.sql",
  "03_storage_buckets.sql",
  // Read-only; fails setup when the tier is not in the state the app needs (USE-138).
  "04_verify_setup.sql",
] as const;

const migrateUrl = resolveMigrateDatabaseUrl();
const target = describeDatabaseUrl(migrateUrl);

console.log(
  `@syn/db db:setup — env=${resolveDbEnvironment()} host=${target.host} db=${target.database}`,
);

for (const file of files) {
  const filePath = path.join(setupDir, file);
  console.log(`  → ${file}`);
  // The URL goes in as an argument, never inside a command string: a failed
  // execSync prints its command, password and all, and 04 fails setup on
  // purpose when a tier is not ready (USE-138).
  const run = spawnSync(
    "psql",
    [migrateUrl, "-v", "ON_ERROR_STOP=1", "-f", filePath],
    { stdio: "inherit" },
  );
  if (run.error || run.status !== 0) {
    console.error(
      `@syn/db db:setup — ${file} failed (exit ${run.status ?? run.error?.message}).`,
    );
    process.exit(1);
  }
}

console.log("@syn/db db:setup complete.");
