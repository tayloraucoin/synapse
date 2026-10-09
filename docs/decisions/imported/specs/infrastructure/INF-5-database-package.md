# INF-5 — `@syn/db`: Drizzle, connection tiers, the RLS bridge, the shadow `users` table, platform SQL

**Epic:** INF — Infrastructure · **Phase 2** · Size: L
**Slice type:** Data foundation — the one-way doors. The failure classes are: a migration that touches a Supabase-managed schema, an RLS bridge that runs as the table owner (bypassing every policy), or a tier default that points a laptop at production.
**Mason review:** the two design calls routed below (`users` columns; `web_push_subscriptions` placement). Recommended designs are stated; counter-propose in `TECHNICAL-DECISIONS.md`.
**Vigil:** review by *inducing* the tier failures — run `db:reset` with `DATABASE_ENVIRONMENT=staging` and confirm it refuses; run a user-scoped query through the singleton `db` and confirm RLS denies it under `SET LOCAL role authenticated`.

**Status:** Complete (2026-09-04) — code and migration done and verified locally; **staging `db:migrate` + `db:setup` pending Taylor**

> **Mason — migration review.** This ticket generates migration `0000` and hand-edits it (the `CREATE SCHEMA IF NOT EXISTS "auth"` guard CC documents). A human reviews the SQL and runs `yarn db:migrate` against staging; the agent never runs `db:migrate`, `db:push`, or `db:reset` against a hosted tier. Two calls are yours: (1) the `users` shadow columns for Phase 1 (recommended below); (2) whether `web_push_subscriptions` lands here or in INF-9 (recommended: here, because it is the only table INF-9 needs and INF-9 should not generate a migration).

---

## Outcome

`@syn/db` exists with CC's exact shape: `drizzle.config.ts` scoped to `public`, `connection-env.ts` resolving pooled and session URLs from `DATABASE_ENVIRONMENT`, a lazy singleton `db`, a `migrate-client.ts` that is never imported at runtime, `createRlsClient(authContext)` that sets `app.user_id`/`app.user_role` and `SET LOCAL role authenticated` inside a transaction, the reference-only `auth.users` mirror, the shadow `public.users` table, `web_push_subscriptions`, the RLS helper fragments and policy factories (owner-private only), the platform SQL (functions, triggers, RLS enablement, storage buckets `avatars`, `icons`, `exports`), the `db:*` scripts, `SETUP.md`, and `SCHEMA_REFERENCE.md` generation. Migration `0000` is generated, hand-guarded, and applied to **staging** by a human. **No domain table** (habits, templates, days, items, misses, shifts, reasons) exists — those come from the feature epics' tech spec using the patterns this ticket lands.

## Why / intent

- **Official spec §3** — the data model this package will hold; §3.1 `User` names the Phase-1 user fields; §9.1 pillar 5 and §10.5 the trust line that shapes RLS. **Cross-cutting §8** — record integrity. **README § Non-negotiables** — Supabase owns `auth.*`; RLS deny-by-default and user-private; local can never reach production by omission.
- **CC `codebase-conventions.md` §4.1**, **CC `docs/architecture/drizzle-orm-conventions.md`** (pinned syntax — the only Drizzle syntax an agent may use), **CC `docs/ai-guides/db-and-rls-authoring.md`**, **CC `packages/db/SETUP.md`** (the `auth.users` ownership lesson and the local-uses-staging-auth trap), **CC `docs/developer-guides/{database-setup,migrations,rls}.md`**.
- **What this slice is NOT (binding):** no domain tables; no seed data beyond a smoke-test user; no Realtime publication (Phase 2 offline/sync decides); no `ensureDevEntitlement`/beta-access helpers (CC-specific).
- **Ground truth:** `@syn/types` exports `AuthContext` (INF-2); `drizzle-orm 0.45.2` and `drizzle-kit 0.31.10` are pinned at the root (INF-1).

**Rulings this slice makes (labelled, logged):**

- **Tier default is `local`, not `production`.** CC's `resolveDbEnvironment` defaults to `production`; `taylor-aucoin`'s `resolveAppTier` defaults to `local` with the stated reason (a laptop with nothing set must never reach production). Synapse takes the safer default; Vercel sets `DATABASE_ENVIRONMENT` explicitly per environment (INF-10). `[PROVISIONAL — Taylor]` because it diverges from CC. Logged.
- **RLS is owner-private everywhere.** The only policy factory Synapse needs is CC's `ownerPrivateCrudPolicies` (owner is the only reader and writer, admins included) — it is the code form of *not the people who built this*. `ownerRowPolicies`, `coupleScopedPolicies`, `catalogAdminWritePolicies`, `holderScopedPolicies` are **not** copied. `serviceRoleOnlyPolicies` and `catalogReadPolicies` are copied for system tables and future read-only catalogues (the curated icon list, IANA zones, if they ever move to the DB). Logged.
- **`AuthContextRole` is `guest | service_role`.** No `admin`/`super_admin`; `app.user_role` is set but only ever `guest` for a person and `service_role` for a system path. Logged.
- **`users` shadow columns for Phase 1** (Mason call, recommended): `id` (PK = FK to `auth.users`, cascade), `created_at`, `updated_at`, `deleted_at`, `display_name text`, `email text` (mirrored by trigger), `timezone text not null default 'UTC'`, `day_close_time time not null default '03:00'`, `review_reminder_time time not null default '21:00'`, `wake_anchor_habit_id uuid` (nullable, **no FK yet** — `habits` does not exist; the feature tech spec adds the FK in its migration), `first_run_step smallint`, `first_run_completed_at timestamptz`, `theme text not null default 'system'`. Everything else in spec §3.1 (`notification_prefs`, `avatar`) is a satellite table the epic spec defines. Logged.
- **Local development = local Postgres for `public.*` + staging Supabase Auth**, CC's Option C-with-a-twist (`SETUP.md` §3): `ensureLocalUserFromSupabaseAuth` inserts the stub `auth.users` row on first authenticated request so the FK resolves. Copied as-is. Logged.
- **Storage buckets:** `avatars` (5 MB, image/jpeg|png|webp), `icons` (custom habit icons — same limits; official spec §4.3 "upload image, stored per user"), `exports` (100 MB, application/json|zip). All private. `audio` and `grounding-photos` are not created. Logged.

## Behaviour & states

**No surface.** Described by the state of the database and the package.

### Files (exact)

- `packages/db/package.json` — copy CC's; rename; dependencies `@syn/types`, `@syn/utils`, `@supabase/supabase-js ^2.49`, `drizzle-orm 0.45.2`, `postgres ^3.4`; devDependencies `@syn/config`, `@types/node ^22`, `dotenv ^16`, `drizzle-kit 0.31.10`, `eslint`, `tsx ^4`, `typescript 5.9.2`; the same `db:*` scripts (`db:generate`, `db:migrate`, `db:push`, `db:setup`, `db:reset`, `db:seed`, `db:seed-users`, `db:schema-reference`); `exports` `.`, `./connection-env`, `./build-database-env-for-next-config`.
- `packages/db/drizzle.config.ts` — copy CC's verbatim (`schemaFilter: ["public"]`, `entities.roles.provider: "supabase"`, `strict`, `verbose`, `dotenv/config`).
- `packages/db/.gitignore` — `.env`. `packages/db/.env.example` — the six tier URLs with placeholders (CC's names, verbatim).
- `packages/db/src/connection-env.ts` — copy CC's; change `resolveDbEnvironment`'s fallback to `"local"`; keep every exported function name.
- `packages/db/src/build-database-env-for-next-config.ts` — copy CC's.
- `packages/db/src/client.ts` — copy CC's (lazy proxy singleton, `prepare: false`, pool `max` 5 local / 10 hosted).
- `packages/db/src/migrate-client.ts` — copy CC's.
- `packages/db/src/rls.ts` — copy CC's; the `pgRole` branch maps `service_role` → `service_role`, everything else → `authenticated`.
- `packages/db/src/schema/auth.ts` — copy CC's verbatim.
- `packages/db/src/schema/enums.ts` — header comment only (the colocation rule); no enums yet.
- `packages/db/src/schema/rls/helpers.ts` — copy CC's `appUserId`, `appUserRole`, `isOwner`, `denyAuthenticated`, `allowAuthenticatedRead`, `dualContextUserId`, `dualContextIsOwner`; drop `isAppAdmin`, `isAppSuperAdmin`, `ownerOrAdmin`, every couple helper.
- `packages/db/src/schema/rls/standard-policies.ts` — copy CC's `ownerPrivateCrudPolicies`, `serviceRoleOnlyPolicies`, `catalogReadPolicies`; nothing else.
- `packages/db/src/schema/user/users.ts` — CC's file shape (doc block, column order per drizzle conventions §4: `id/createdAt/updatedAt`, then non-FK alphabetical, then FKs), the columns ruled above, indexes `users_email_idx`, and policies: `select`/`update` via `isOwner(table.id)`, `insert`/`delete` `denyAuthenticated` (the trigger inserts; deletion is `auth.admin.deleteUser` → cascade). `usersRelations` with the `webPushSubscriptions` many.
- `packages/db/src/schema/user/index.ts`, `packages/db/src/schema/notification/web-push-subscriptions.ts` (copy CC's; the `devicePlatformEnum` moves into this file as a one-table enum `"ios" | "android" | "web"`; policies `ownerPrivateCrudPolicies`), `packages/db/src/schema/notification/index.ts`, `packages/db/src/schema/index.ts` (auth, enums, user, notification, rls).
- `packages/db/src/local-dev/ensure-local-user-from-supabase-auth.ts` — copy CC's.
- `packages/db/src/index.ts` — CC's export surface (`db`, `getDb`, `createRlsClient`, the connection-env functions, `buildDatabaseEnvForNextConfig`, `ensureLocalUserFromSupabaseAuth`, `* from schema`, and `User`/`NewUser`/`WebPushSubscription`/`NewWebPushSubscription` via `$inferSelect`/`$inferInsert`).
- `packages/db/supabase/setup/01_init_functions.sql` — copy CC's `pgcrypto`, `update_updated_at_column()`, `handle_new_user()` (inserting `id`, `email` into `public.users`), `handle_user_email_sync()`; drop `app_user_couple_ids`.
- `packages/db/supabase/setup/02_apply_triggers_rls.sql` — copy CC's verbatim (data-driven loops; `on_auth_user_created`, `on_auth_user_email_updated`, `set_updated_at` on every table, RLS enabled on every `public` table).
- `packages/db/supabase/setup/03_storage_buckets.sql` — CC's shape with the three Synapse buckets.
- `packages/db/scripts/{run-setup-sql.ts,reset-local-db.ts,seed-users.ts,generate-schema-reference.mjs}` — copy CC's; `reset-local-db.ts` keeps its `local`-only refusal; `seed-users.ts` creates one user via `auth.admin.createUser` (`[NEEDS VALUE AT BUILD]` — the email Taylor wants for local testing; never a real third party).
- `packages/db/src/seed/index.ts` — CC's skeleton (refuses in production; no seed functions yet — a comment says the feature epics add them).
- `packages/db/SETUP.md` — CC's, reworded (project name, the three buckets, the tier default).
- `packages/db/tsconfig.json`, `eslint.config.mjs` — CC's. Root `tsconfig.json` references gain `./packages/db`.
- **Migration:** `yarn db:generate` → `packages/db/migrations/0000_<name>.sql` + `meta/`; hand-edit per CC `SETUP.md` §1 (`CREATE SCHEMA IF NOT EXISTS "auth"`; the `auth.users` stub `IF NOT EXISTS`). Applied to staging by a human (`yarn db:migrate` with `DATABASE_ENVIRONMENT=staging` in `packages/db/.env`), then `yarn db:setup`.

**States (exhaustive):** `yarn check-types` passes with no database · `yarn db:generate` emits `0000` · human `db:migrate` against staging succeeds · `db:setup` creates functions, triggers, RLS, buckets · `db:reset` refuses on `staging`/`production` · a `createRlsClient({ userId: A, role: "guest" }).execute(tx => tx.select().from(users))` returns only A's row · the same query through `db` (owner role) returns everything — which is why procedures never use it.

**Failure / edge states:** `drizzle-kit generate` re-emits the un-guarded `CREATE SCHEMA "auth"` on every regeneration of `0000` — documented in `SETUP.md`, re-checked in the acceptance criteria. Missing `_journal.json` entry for a hand-authored migration → `db:migrate` "succeeds" silently; the parity check in CC's `migrations.md` is copied into INF-11's guide.

## Non-negotiables (this slice)

- **`schemaFilter: ["public"]`; never emit DDL for `auth`, `storage`, `realtime`, `vault`.**
- **The agent never runs `db:migrate`, `db:push`, `db:seed`, or `db:reset` against a hosted tier.** It authors SQL and stops; a human runs it. (`.claude/settings.json` in INF-10 encodes this; until then it is a rule.)
- **User-scoped queries go through `ctx.rls.execute()`**; the singleton `db` is for the RLS bridge and system paths.
- **No admin-read policy on any user-data table.**
- **Runtime = transaction pooler `:6543` with `prepare: false`; migrations = session pooler `:5432`.**
- **Migrations are append-only and committed with `meta/`.**

## Data & AI

**Schema changes: described** — migration `0000`: `public.users` (columns above, `users_email_idx`, four policies), `public.web_push_subscriptions` (CC's columns, `web_push_subscriptions_endpoint_idx` unique, `web_push_subscriptions_user_id_idx`, owner-private policies), enum `device_platform`. Human-review migration; log in `DEVIATIONS.md` when applied.

**Tables:** `users` (trigger insert · owner read/update) · `web_push_subscriptions` (owner CRUD).

**Placement:** `packages/db/**` per CC §4.1; Vesper's mirroring of CC, Mason's two calls routed above.

**tRPC / validators:** none. **AI notes: None.** **Instrumentation: none.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. `packages/db/drizzle.config.ts` contains `schemaFilter: ["public"]`; `packages/db/migrations/0000_*.sql` contains `CREATE SCHEMA IF NOT EXISTS "auth"` and creates `users` and `web_push_subscriptions` in `public` with the columns and policies above. *(Mason.)*
2. `resolveDbEnvironment({})` returns `"local"`; `resolveDbEnvironment({ DATABASE_ENVIRONMENT: "production" })` returns `"production"`.
3. `yarn db:reset` with `DATABASE_ENVIRONMENT=staging` in `packages/db/.env` exits 1 with CC's refusal message. *(Vigil.)*
4. On staging, after human `db:migrate` + `db:setup`: `select relrowsecurity from pg_class where relname in ('users','web_push_subscriptions')` is true for both; `select tgname from pg_trigger where tgname in ('on_auth_user_created','set_updated_at')` returns both; `select id from storage.buckets` includes `avatars`, `icons`, `exports`, all `public = false`.
5. Creating a user with `auth.admin.createUser` on staging produces a `public.users` row with the same `id` and `email`, `timezone = 'UTC'`, `day_close_time = '03:00'`. *(Vigil.)*
6. Through `createRlsClient({ userId: <A>, role: "guest" })`, `select * from users` returns exactly A's row; through the singleton `db`, it returns all rows. *(Vigil.)*
7. `SCHEMA_REFERENCE.md` is generated and lists both tables.
8. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- CC's `client.ts` proxy pattern is what lets `@syn/db` be imported at type-check time without a database; keep it.
- `wake_anchor_habit_id` without an FK is deliberate and temporary; the feature tech spec's first migration adds `REFERENCES habits(id) ON DELETE SET NULL`.
- Supabase's newer "publishable"/"secret" key names coexist with anon/service-role; CC's `firstNonEmpty` handles both — carried in INF-6.

## Dev's call

Index naming beyond CC's `<table>_<col>_idx` · whether `theme` is a `pgEnum` (`system|light|dark`) or `text` with a CHECK (recommended: `pgEnum` in `users.ts`, one-table scope) · the smoke-test email.

## Out of scope

- **Domain tables** (habits, categories, templates, slots, week plans, days, day items, misses, shifts, reasons, timer sessions) — the feature epics' tech spec, built on this package.
- **Realtime publication** — Phase 2 offline/sync.
- **Seed content** (starter habits, default reason set) — the Epic 1 track.
- **`@syn/auth`** — INF-6, which consumes `ensureLocalUserFromSupabaseAuth` and `AuthContext`.

## Depends on

- **INF-2** — `@syn/types` (`AuthContext`), `@syn/utils`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Every file is a copy, but three of them are one-way doors (the migration guard, the RLS bridge's role switch, the tier default), and the Supabase-coexistence rules are exactly the kind of thing a cheaper model "fixes" by removing the guard that makes them work.

---

### Build kickoff (paste into the session)

> Build **INF-5 — `@syn/db`** (attached spec). Model: **Opus**. **CC's Drizzle package with owner-private RLS, a `local` tier default, the shadow `users` and `web_push_subscriptions` tables, and platform SQL — you author migration `0000`; a human applies it.**
> Attach/read first, in order: this spec · CC `docs/architecture/drizzle-orm-conventions.md` · CC `docs/ai-guides/db-and-rls-authoring.md` · CC `packages/db/SETUP.md` · CC `packages/db/{package.json,drizzle.config.ts,tsconfig.json}` · CC `packages/db/src/{connection-env,build-database-env-for-next-config,client,migrate-client,rls,index}.ts` · CC `packages/db/src/schema/{auth.ts,index.ts,rls/*,user/users.ts,notification/web-push-subscriptions.ts}` · CC `packages/db/src/local-dev/ensure-local-user-from-supabase-auth.ts` · CC `packages/db/supabase/setup/*.sql` · CC `packages/db/scripts/*` · `docs/ux/ux-spec-v1.md` §3.1 · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Copy CC; strip couples, admins, beta, entitlements; owner-private policies only; default tier `local`. Generate and hand-guard `0000`, then STOP and hand the SQL to a human for `db:migrate` on staging. Close in three places; run `yarn lint && yarn lint:boundaries && yarn check-types && yarn build`.
