// Dev/staging seed only. Not exported from the public API.
// Requires a migrated database. Run: yarn db:seed (from the @syn/db workspace).
//
// To go live:
// 1. Set tier URLs in packages/db/.env (see connection-env.ts)
// 2. yarn db:generate && yarn db:migrate (a human runs the migrate)
// 3. yarn db:setup && yarn db:seed

import "dotenv/config";

import { getDb, type Db } from "../client";

async function seed(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("@syn/db seed: refused to run in production.");
  }

  const db: Db = getDb();
  void db;

  // Nothing to seed yet. The foundation has no domain tables; the Epic 1
  // track adds the starter habits and the default reason set (official spec
  // §3.10) as seed functions imported here.

  console.log("@syn/db seed: nothing to seed — no domain tables yet.");
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
