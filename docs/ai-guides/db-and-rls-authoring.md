# Database and RLS authoring (AI agents)

Read this before changing `@syn/db` schema, migrations, or RLS policies.

## Hard rules

- **Do not bump** `drizzle-orm` or `drizzle-kit` without explicit developer approval.
- **Never** generate or drop Supabase-managed schemas (`auth`, `storage`, `realtime`, `vault`).
- **Migrations are append-only** — never edit applied SQL in shared environments.
- **Policies live in schema** — use `pgPolicy()` colocated with the table, not ad-hoc SQL files.
- **Every migration `.sql` must have a `_journal.json` entry** — hand-authored SQL (when `db:generate` is blocked) still requires registering the tag in `migrations/meta/_journal.json` before `yarn db:migrate`. See `docs/developer-guides/migrations.md` § Hand-authored migrations.

## Adding a table

1. Create `packages/db/src/schema/<domain>/<table>.ts` following `drizzle-orm-conventions.md`.
2. Export from domain `index.ts` and `schema/index.ts`.
3. Add RLS policies in the table's `(table) => [...]` callback using builders from `schema/rls/standard-policies.ts`.
4. Export `$inferSelect` / `$inferInsert` types from `packages/db/src/index.ts`.
5. Run `yarn db:generate` (interactive terminal) and `yarn db:migrate`.
6. Run `yarn db:schema-reference` to regenerate `packages/db/SCHEMA_REFERENCE.md`.

## Hand-authored migration checklist

Use when `db:generate` cannot emit the migration (snapshot collision, complex data backfill, etc.):

- [ ] SQL file in `packages/db/migrations/NNNN_*.sql`
- [ ] Matching entry in `migrations/meta/_journal.json` (`tag` = filename without `.sql`; `when` > previous entry)
- [ ] Deviation logged in slice `DEVIATIONS.md`
- [ ] Parity check passes (`migrations.md` — journal vs `.sql` file count)
- [ ] `yarn db:migrate` run against intended `DATABASE_ENVIRONMENT`; row appears in `drizzle.__drizzle_migrations`


- [ ] Table uses `ownerPrivateCrudPolicies` unless it is a shipped catalogue (`catalogReadPolicies`) or system bookkeeping (`serviceRoleOnlyPolicies`). **There is no admin-read policy in this schema and no factory that would make one** — the product's promise is that only the person can see their data, not the people who built it.
- [ ] Policies use `current_setting('app.user_id', true)` — not bare `auth.uid()` — **unless the table is Realtime-read** (next rule).
- [ ] `authenticatedRole` from `drizzle-orm/supabase` as the grantee.
- [ ] App queries use `ctx.rls.execute()` — not the singleton `db` for user-scoped data.

## Realtime-read tables (postgres_changes)

Supabase Realtime evaluates RLS **per subscriber in the JWT context**: `auth.uid()` is set, `app.user_id` is not (that variable exists only inside the server bridge's transactions). A policy written against `app.user_id` alone silently filters every event for every subscriber while the channel still reports SUBSCRIBED — this shipped as a live defect on `messages` (see TECHNICAL-DECISIONS 2026-07-27, migration `0071`). Any table a client subscribes to via `postgres_changes` MUST:

- [ ] Use the **dual-context helpers** from `schema/rls/helpers.ts` (`dualContextUserId` / `dualContextIsOwner`) — identity is `COALESCE(app.user_id, auth.uid())`.
- [ ] **Never inline-subquery another RLS-guarded table** in the policy — the subquery runs under that table's RLS in the same JWT context and re-breaks delivery one layer down. Use a `SECURITY DEFINER` lookup instead. Nothing in Synapse needs one yet — every table hangs directly off `users` — but a join table would.
- [ ] Be in the `supabase_realtime` publication **via migration** (idempotent `DO` block — see `0071`), never dashboard-only.
- [ ] Full receive-path architecture: `docs/developer-guides/session-realtime-sync.md`.

## Connection env

- Do not add `DATABASE_URL` to `.env` — use `DATABASE_ENVIRONMENT` + tier-specific `SUPABASE_*` / `LOCAL_*` vars.
- Runtime = transaction pooler `:6543`; migrations = session pooler `:5432`.

## References

- `docs/architecture/drizzle-orm-conventions.md`
- `docs/developer-guides/database-setup.md`
- `docs/developer-guides/migrations.md`
- `docs/developer-guides/rls.md`
- `packages/db/SCHEMA_REFERENCE.md` §6
