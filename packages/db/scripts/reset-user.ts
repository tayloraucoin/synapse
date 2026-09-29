#!/usr/bin/env node
/**
 * Local + staging only: return one person to a just-signed-up state without
 * touching their auth identity, so first run can be walked again.
 *
 * A signup's whole footprint in `public` is the shadow row `handle_new_user()`
 * writes — `(id, email)` and column defaults. Everything else (reasons
 * included, SET-9) is created by the app afterwards, and every user table
 * cascades from `public.users`. So a reset is: delete the shadow row, put the
 * same bare row back. `auth.users` is never touched, so the session survives.
 *
 * `web_push_subscriptions` is `ON DELETE set null`, so it is cleared first
 * rather than left ownerless. `feedback_messages` is left to go anonymous, as
 * it would on account deletion. Storage objects (avatar, icons, passage
 * images) are not removed — the rows that pointed at them are gone.
 *
 * Usage:
 *   yarn workspace @syn/db db:reset-user you@example.com
 *   or set RESET_USER_EMAIL in packages/db/.env and run `yarn db:reset-user`.
 *
 * Agents never run this. It deletes a person's data on a hosted tier.
 */
import "dotenv/config";
import postgres from "postgres";

import {
  describeDatabaseUrl,
  resolveDbEnvironment,
  resolveMigrateDatabaseUrl,
} from "../src/connection-env.ts";

const tier = resolveDbEnvironment();

if (tier === "production" || process.env.NODE_ENV === "production") {
  console.error("@syn/db db:reset-user refused: never against production.");
  process.exit(1);
}

const email = (process.argv[2] ?? process.env.RESET_USER_EMAIL ?? "").trim();

if (!email) {
  console.error(
    "@syn/db db:reset-user: pass an email, or set RESET_USER_EMAIL in packages/db/.env.",
  );
  process.exit(1);
}

const migrateUrl = resolveMigrateDatabaseUrl();
const target = describeDatabaseUrl(migrateUrl);

console.log(
  `@syn/db db:reset-user — env=${tier} host=${target.host} db=${target.database} user=${email}`,
);

const sql = postgres(migrateUrl, { max: 1, prepare: false });

try {
  const userId = await sql.begin(async (tx) => {
    const [row] = await tx<{ id: string }[]>`
      select id from public.users where email = ${email}
    `;
    if (row === undefined) {
      return null;
    }

    await tx`delete from public.web_push_subscriptions where user_id = ${row.id}`;
    await tx`delete from public.users where id = ${row.id}`;
    // Exactly what handle_new_user() writes — nothing more.
    await tx`
      insert into public.users (id, email, created_at, updated_at)
      values (${row.id}, ${email}, now(), now())
    `;
    return row.id;
  });

  if (userId === null) {
    console.error(`@syn/db db:reset-user: no public.users row for ${email}.`);
    process.exitCode = 1;
  } else {
    console.log(`@syn/db db:reset-user complete — ${userId} is back to first run.`);
  }
} finally {
  await sql.end();
}
