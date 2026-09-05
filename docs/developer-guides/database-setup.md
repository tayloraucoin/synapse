# Database setup

`@syn/db` uses **Drizzle ORM** on Supabase Postgres (or local Postgres for dev). Connection URLs are resolved from `DATABASE_ENVIRONMENT` — see `packages/db/src/connection-env.ts`.

## Environment files

| File | Purpose |
|------|---------|
| `packages/db/.env` | Canonical DB secrets for drizzle-kit CLI (`db:migrate`, `db:generate`, `db:setup`) |
| `apps/*/.env.local` | App runtime — tier URL vars for the active `DATABASE_ENVIRONMENT` |

**Next.js apps** collapse tier vars into canonical `DATABASE_URL` at build time via `buildDatabaseEnvForNextConfig()` from `@syn/db` (same pattern as `buildSupabaseEnvForNextConfig` from `@syn/auth`).

| `DATABASE_ENVIRONMENT` | Runtime (transaction pooler `:6543`) | Migrations (session pooler `:5432`) |
|------------------------|--------------------------------------|-------------------------------------|
| `local` | `LOCAL_DATABASE_URL` | `LOCAL_DIRECT_DATABASE_URL` |
| `staging` | `SUPABASE_STAGING_TRANSACTION_POOLER_CONNECTION_URL` | `SUPABASE_STAGING_SESSION_POOLER_CONNECTION_URL` |
| `production` | `SUPABASE_LIVE_TRANSACTION_POOLER_CONNECTION_URL` | `SUPABASE_LIVE_SESSION_POOLER_CONNECTION_URL` |

Append `?sslmode=require` to hosted URLs.

## Connection methods (Supabase dashboard)

| Tab | Port | Use |
|-----|------|-----|
| Transaction pooler | 6543 | App runtime |
| Session pooler | 5432 | Migrations (`drizzle-kit`) |
| Direct connection | 5432 | GUI tools only (IPv6-only) |

## Local development

1. Install Postgres locally; create database `conscious_connections`.
2. Set `DATABASE_ENVIRONMENT=local` and `LOCAL_*` URLs in `packages/db/.env`.
3. Set staging Supabase auth vars (`*_STAGING` — used for both `local` and `staging` tiers).
4. Run setup (see [migrations.md](./migrations.md)). Storage buckets are created only on Supabase-hosted DBs; local `db:setup` skips them safely.

**Auth vs Postgres are independent:** local dev uses **local Postgres** for app data and **staging Supabase Auth** for login. On first authenticated request, `ensureLocalUserFromSupabaseAuth()` inserts a stub `auth.users` row so the `public.users` FK resolves. See [authentication.md](./authentication.md) for the full auth flow, env vars, and per-app wiring.

## Hosted staging / production

1. Create Supabase project; enable automatic RLS in dashboard.
2. Copy all three connection strings per project into `packages/db/.env`.
3. `yarn db:migrate` → `yarn db:setup` → (optional) `yarn db:seed-users` then `yarn db:seed`.

## Scripts

```bash
yarn db:migrate      # Apply Drizzle migrations
yarn db:setup        # Triggers, RLS enablement, storage buckets
yarn db:seed-users   # Create auth users via Admin API
yarn db:seed         # Dev/staging app data
yarn db:reset        # Local only: drop public + migrate + setup + seed
```
