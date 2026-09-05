#!/usr/bin/env node
/**
 * Applies Supabase platform SQL (triggers, RLS enablement, storage buckets).
 * Run after drizzle-kit migrate. Idempotent.
 */
import "dotenv/config";
import { execSync } from "node:child_process";
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
] as const;

const migrateUrl = resolveMigrateDatabaseUrl();
const target = describeDatabaseUrl(migrateUrl);

console.log(
  `@syn/db db:setup — env=${resolveDbEnvironment()} host=${target.host} db=${target.database}`,
);

for (const file of files) {
  const filePath = path.join(setupDir, file);
  console.log(`  → ${file}`);
  execSync(`psql "${migrateUrl}" -v ON_ERROR_STOP=1 -f "${filePath}"`, {
    stdio: "inherit",
  });
}

console.log("@syn/db db:setup complete.");
