#!/usr/bin/env node
/**
 * Local-only: drop and recreate the public schema, then migrate + setup + seed.
 *
 * The tier guard below is the whole point of this file. `db:reset` is
 * destructive by definition, so it refuses any tier but `local` before it
 * reads a URL — and the tier itself defaults to `local`, so a shell with
 * nothing set cannot reach a hosted database by omission.
 *
 * Agents never run this. Nor db:migrate, db:push, or db:seed against a hosted
 * tier — they author SQL and stop.
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

if (resolveDbEnvironment() !== "local") {
  console.error("@syn/db db:reset refused: DATABASE_ENVIRONMENT must be local.");
  process.exit(1);
}

const migrateUrl = resolveMigrateDatabaseUrl();
const target = describeDatabaseUrl(migrateUrl);
const packageRoot = path.dirname(fileURLToPath(import.meta.url));

console.log(
  `@syn/db db:reset — dropping public schema on ${target.host}/${target.database}`,
);

execSync(
  `psql "${migrateUrl}" -v ON_ERROR_STOP=1 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;"`,
  { stdio: "inherit" },
);

console.log("@syn/db db:reset — running migrations…");
execSync("yarn db:migrate", {
  cwd: path.join(packageRoot, ".."),
  stdio: "inherit",
});

console.log("@syn/db db:reset — running platform setup…");
execSync("yarn db:setup", {
  cwd: path.join(packageRoot, ".."),
  stdio: "inherit",
});

console.log("@syn/db db:reset — seeding…");
execSync("yarn db:seed", {
  cwd: path.join(packageRoot, ".."),
  stdio: "inherit",
});

console.log("@syn/db db:reset complete.");
