# Synapse — Database Setup

`@syn/db` — Drizzle ORM + PostgreSQL on Supabase, in a Turborepo. This document covers the three tiers, the Supabase-managed schemas you do **not** create, the exact run order, and the local-versus-staging-auth trap.

---

## 0. The rule that comes before everything

**An agent never runs `db:migrate`, `db:push`, `db:seed`, or `db:reset` against a hosted tier.** It authors the SQL and stops; a human reads the SQL and applies it. Migrations are one-way doors, and the review is the door.

Two guards back that rule up:

- `db:reset` refuses any tier but `local`, before it reads a connection URL.
- `DATABASE_ENVIRONMENT` **defaults to `local`**, so a shell with nothing configured cannot reach a hosted database by omission. (Conscious Connections defaults to `production`; Synapse deliberately does not — see `TECHNICAL-DECISIONS.md`.)

---

## 1. The one thing that causes headaches: who owns `auth.users`

Supabase **automatically creates and manages** several Postgres schemas the moment a project exists. You do not create or migrate these — Supabase does:

| Schema | What is in it | Who manages it |
|---|---|---|
| `auth` | `auth.users`, `auth.sessions`, `auth.identities`, … | **Supabase Auth** |
| `storage` | `storage.buckets`, `storage.objects` | **Supabase Storage** |
| `realtime` | replication bookkeeping | **Supabase Realtime** |
| `vault`, `extensions`, … | secrets, extensions | **Supabase** |
| `public` | **everything in this package** | **us** |

`auth.users` is the canonical user record (id, email, encrypted password, provider identities, confirmation state). **We never write to it, never store passwords, and never migrate it.** Our `public.users` is a *shadow* table whose primary key **is** a foreign key to `auth.users(id)`. It exists so the rest of the schema can foreign-key to a `public` row with app-specific columns while Supabase Auth stays the source of truth for identity.

Two pieces make that work, and both are in this package:

1. **`src/schema/auth.ts`** declares a **reference-only** mirror of `auth.users` (`pgSchema('auth')`) — just enough for `.references(() => authUsers.id)` to type-check. It is not a table we manage.
2. **`handle_new_user()`** (`supabase/setup/01_init_functions.sql`) inserts the matching `public.users` row **automatically** whenever Supabase inserts an `auth.users` row — on signup, magic link, OAuth, or `auth.admin.createUser()`. The app never inserts into `public.users`; the database does.

### Two drizzle-kit gotchas (already handled — know why)

- **`drizzle.config.ts` pins `schemaFilter: ["public"]`** so `push` and `pull` never diff or drop a Supabase-managed schema.
- **`drizzle-kit generate` ignores `schemaFilter`** and still emits `CREATE SCHEMA "auth"` plus a stub `auth.users`, because our schema references them. On Supabase both already exist, so the raw statements abort the migration. `migrations/0000_*.sql` is **hand-edited** to wrap them in an `IF NOT EXISTS` block — a no-op on Supabase, a working stub on vanilla Postgres. **Re-apply that edit every time you regenerate the first migration.**

---

## 2. Tiers

| Tier | App database | Auth source | How |
|---|---|---|---|
| **Local** | local Postgres | **staging** Supabase Auth | see §3 — this is the trap |
| **Staging** | staging Supabase project | staging Supabase Auth | standard |
| **Production** | production Supabase project | production Supabase Auth | standard |

Each tier has its own URLs in `packages/db/.env` (see `.env.example`). Use the **session pooler (port 5432)** for migrations and the **transaction pooler (6543)** for app runtime — `client.ts` already sets `prepare: false`, which the transaction pooler requires.

---

## 3. The local-uses-staging-auth trap (and how not to get bitten)

> **Goal:** develop against *real* staging users, so logins and JWTs just work, while keeping app data isolated and disposable.

The trap is a hard Postgres rule: **a foreign key cannot span two databases.** `public.users.id` → `auth.users(id)` is a real FK, so whatever database holds your `public.*` tables **must also hold the `auth.users` you authenticate against**. Put `public.*` in a local Postgres and `auth.users` in staging and the migration fails with *"relation auth.users does not exist"* — or you drop the FK and silently lose referential integrity.

Three clean ways to satisfy "local app data + staging auth", in order of preference:

### Option A (recommended) — a Supabase branch off staging
Use a Supabase preview/dev branch of the staging project. You get a real `auth` schema seeded from staging plus an isolated `public` you can wipe freely. The FK stays inside one database, logins use real users, and resets never touch staging.

### Option B — point local entirely at staging
Set the local URLs to the staging database and never run a destructive migration from a laptop. Simplest auth story, no data isolation. A stopgap, not a workflow.

### Option C — fully local Postgres, with the auth stub
Run a local Postgres. Migration `0000`'s guarded block creates a minimal `auth.users` stub so the FK resolves, and `ensureLocalUserFromSupabaseAuth()` (`src/local-dev/`) inserts the stub row on the first authenticated request, so a staging JWT can be used against local data. This is the offline path.

**Never raw-INSERT into `auth.users` on a hosted tier.** Supabase's own invariants (encrypted_password, confirmation tokens, identities) would not be set, and local logins would behave unlike staging. Always go through `auth.admin.createUser()` so the trigger fires and the shadow row appears exactly the way it will in production.

---

## 4. Run order (every tier)

```bash
# 0. Set DATABASE_ENVIRONMENT + tier URLs in packages/db/.env (see .env.example).

# 1. Apply Drizzle migrations — creates public.* tables, enums, FKs, and RLS policies.
yarn db:migrate

# 2. Apply Supabase platform SQL (idempotent):
yarn db:setup

# 3. Seed an auth user, then app data:
yarn db:seed-users
yarn db:seed
```

**Local reset:** `yarn db:reset` drops `public`, then re-runs migrate + setup + seed. It refuses any tier but `local`.

Order matters: the migration must create `public.users` before `db:setup` wires the `auth.users → public.users` trigger. Step 2 also enables RLS on every `public` table (deny-by-default); the policies themselves come from the Drizzle `pgPolicy` declarations in the migration.

### On a bare local Postgres

`db:setup` needs the `authenticated` and `service_role` roles that Supabase provides. Create them once:

```sql
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
```

Without the grants, RLS will appear to "work" by denying everything, which looks the same as a correct policy and is not.

### Regenerating migrations

```bash
yarn db:generate
```

After regenerating the **first** migration, re-apply the `IF NOT EXISTS` guard from §1 — drizzle-kit reintroduces the un-guarded version every time.

**Every hand-authored migration needs a `meta/_journal.json` entry.** Without one, `db:migrate` reports success and applies nothing, which is the quietest way to be wrong about the state of a database.

---

## 5. What Supabase creates versus what we create

- **Supabase (never migrate):** `auth.*`, `storage.*`, `realtime.*`, `vault.*`. The `auth.users → public.users` trigger is ours; the `auth.users` row it reacts to is Supabase's.
- **Ours:** every table in `public` (2 today), both enums, the `update_updated_at_column()`, `handle_new_user()`, and `handle_user_email_sync()` functions, the `set_updated_at`, `on_auth_user_created`, and `on_auth_user_email_updated` triggers, RLS enablement on every `public` table, and the three private storage buckets (`avatars`, `icons`, `exports`).

---

## 6. Verifying a tier after setup

```sql
-- RLS on every public table
select relname, relrowsecurity from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r';

-- the triggers exist
select tgname, tgrelid::regclass from pg_trigger where not tgisinternal;

-- the buckets exist and are private
select id, public from storage.buckets;
```

Then the one that matters: create a user with `auth.admin.createUser()` and confirm a `public.users` row appears with the same `id` and `email`, `timezone = 'UTC'`, and `day_close_time = '03:00'`. If it does not, the trigger did not fire and nothing downstream will work.
