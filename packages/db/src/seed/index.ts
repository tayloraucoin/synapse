// Dev/staging seed only. Not exported from the public API.
// Requires a migrated database. Run: yarn db:seed (from the @syn/db workspace).
//
// To go live:
// 1. Set tier URLs in packages/db/.env (see connection-env.ts)
// 2. yarn db:generate && yarn db:migrate (a human runs the migrate)
// 3. yarn db:setup && yarn db:seed
//
// This seed uses the SINGLETON `db`, which bypasses RLS. That is correct here
// and nowhere in the app: a seed is a system path with no session to scope by.
// It writes only to the smoke-test account, which must already exist — run
// `yarn db:seed-users` first, so the `auth.users` insert fires
// `handle_new_user()` and the shadow row appears exactly as it will in
// production.

import "dotenv/config";

import { eq } from "drizzle-orm";

import { getDb, type Db } from "../client";
import { users } from "../schema";
import { seedStarterLibrary } from "./seed-library";
import { seedDefaultReasons } from "./seed-reasons";
import { seedMorningTemplate } from "./seed-template";

/** Matches `scripts/seed-users.ts`. A `.test` domain cannot resolve. */
const SMOKE_ACCOUNT_EMAIL = "dev@synapse.test";

async function seed(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("@syn/db seed: refused to run in production.");
  }

  const db: Db = getDb();

  const [account] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, SMOKE_ACCOUNT_EMAIL))
    .limit(1);

  if (account === undefined) {
    console.log(
      `@syn/db seed: no account for ${SMOKE_ACCOUNT_EMAIL} — run \`yarn db:seed-users\` first. Nothing seeded.`,
    );
    return;
  }

  const library = await seedStarterLibrary(db, account.id);
  const reasonCount = await seedDefaultReasons(db, account.id);
  const template = await seedMorningTemplate(db, account.id);

  console.log(`@syn/db seed — ${SMOKE_ACCOUNT_EMAIL}`);
  console.log(`  categories inserted: ${library.categories}`);
  console.log(`  habits inserted:     ${library.habits}`);
  console.log(`  reasons inserted:    ${reasonCount}`);
  console.log(`  templates inserted:  ${template.template}`);
  console.log(`  slots inserted:      ${template.slots}`);
  console.log("  (0 across the board on a re-run means idempotent, not broken)");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
