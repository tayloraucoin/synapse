# Environments, deployment, and the checklists

Three tiers. One rule underneath all of them: **the dangerous tier is never the
one you get by forgetting.** `DATABASE_ENVIRONMENT` defaults to `local`, and
every deployed environment sets it explicitly.

---

## 1. The tier table

| Tier | Postgres (`public.*`) | Supabase Auth project | Vercel environment | Who sets `DATABASE_ENVIRONMENT` |
|---|---|---|---|---|
| **local** | local Postgres on your machine | **staging** | Development (Vercel CLI) | you, in `packages/db/.env` and `apps/web/.env.local` — or nobody, since `local` is the default |
| **staging** | staging Supabase project | staging | **Preview** (every branch and PR) | the Vercel Preview environment |
| **production** | production Supabase project | production | **Production** (`main`) | the Vercel Production environment |

**Local borrows staging's auth on purpose.** A foreign key cannot span two
databases, and `public.users.id` → `auth.users(id)` is a real one — so the
database holding your `public.*` tables must also hold the `auth.users` you
sign in against. `packages/db/SETUP.md` §3 explains the three ways to satisfy
that; migration `0000`'s guarded block plus `ensureLocalUserFromSupabaseAuth`
is the offline one.

**The local site origin is always `http://localhost:3000`**, whatever
`NEXT_PUBLIC_SITE_URL_LOCAL` says. A stale staging origin in a local env file
sends OAuth redirects and email confirmation links to the deployed app, and the
browser gives no sign that anything went wrong.

---

## 2. Supabase checklist — run once per project (staging, then production)

- [ ] Create the project. Record the project ref (the `<ref>` in
      `https://<ref>.supabase.co`) — it is what `sb-<ref>-*` auth cookies are
      named after, and how you tell tiers apart in a browser.
- [ ] **Auth → Providers → Email:** enabled, **"Confirm email" ON.** Official
      spec §4.1 blocks the app on an unverified address; `isEmailVerified`
      is the app-layer assertion, and this toggle is the primary gate.
- [ ] **Auth → Providers → Google:** enabled, with the client ID and secret
      from Google Cloud. `[NEEDS VALUE AT BUILD — Taylor: one OAuth client with
      both projects' callback URLs registered, or one client per project.]`
- [ ] **Auth → URL Configuration → Site URL:** the tier's origin
      (`https://<staging-domain>` / `https://<production-domain>`).
- [ ] **Auth → URL Configuration → Redirect URLs:** add
      `<site>/auth/callback` and `<site>/auth/confirm`. On **staging only**,
      also add `http://localhost:3000/auth/callback` and
      `http://localhost:3000/auth/confirm` — local development authenticates
      against staging.
- [ ] **Auth → Email Templates:** point every link at
      `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<type>&next=<path>`.
      The default templates use a `#access_token` fragment flow this app does
      not implement.
- [ ] **Database:** a human runs `yarn db:migrate` then `yarn db:setup` with
      `DATABASE_ENVIRONMENT` set to this tier in `packages/db/.env`. Never an
      agent (see §6).
- [ ] **Verify** with the queries in `packages/db/SETUP.md` §6: RLS on for every
      `public` table, all three triggers present, the three buckets private.
- [ ] **Settings → API:** copy the project URL, the publishable/anon key, and
      the secret/service-role key into the Vercel matrix below.
- [ ] **Settings → Database:** copy the **transaction** pooler URL (`:6543`,
      runtime) and the **session** pooler URL (`:5432`, migrations). Not the
      "Direct connection" tab — that one is IPv6-only.

---

## 3. Vercel checklist

- [ ] One project, named `web`. **Root Directory: `apps/web`.**
- [ ] Build settings come from `apps/web/vercel.json` — leave the dashboard
      fields empty so the file stays the source of truth. It sets
      `installCommand` to `corepack enable && cd ../.. && yarn install --immutable`
      and `buildCommand` to `cd ../.. && yarn turbo run build --filter=web`,
      because Yarn workspaces install from the repo root.
- [ ] **Cron:** `apps/web/vercel.json` declares `/api/jobs/scheduler` at
      `*/15 * * * *`. **This needs the Pro plan** — Hobby runs crons daily at
      most, which would make official spec §8.2's N1 useless. Vercel sends the
      `CRON_SECRET` bearer automatically once the variable is set.
- [ ] **Remote cache:** add `TURBO_TOKEN` (secret) and `TURBO_TEAM` (variable)
      in GitHub repo settings so CI shares Vercel's Turbo cache.
- [ ] Set the environment matrix below. **Preview must never hold a production
      value** — that is the whole reason the variable names are tier-prefixed.

### The environment matrix

| Variable | Production | Preview | Development |
|---|---|---|---|
| `DATABASE_ENVIRONMENT` | `production` | `staging` | `local` |
| `SUPABASE_LIVE_TRANSACTION_POOLER_CONNECTION_URL` | ✅ | — | — |
| `SUPABASE_LIVE_SESSION_POOLER_CONNECTION_URL` | ✅ | — | — |
| `SUPABASE_STAGING_TRANSACTION_POOLER_CONNECTION_URL` | — | ✅ | — |
| `SUPABASE_STAGING_SESSION_POOLER_CONNECTION_URL` | — | ✅ | — |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | — | — |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | — | — |
| `SUPABASE_SECRET_KEY` | ✅ | — | — |
| `NEXT_PUBLIC_SUPABASE_URL_STAGING` | — | ✅ | — |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_STAGING` | — | ✅ | — |
| `SUPABASE_SECRET_KEY_STAGING` | — | ✅ | — |
| `NEXT_PUBLIC_SITE_URL` | ✅ | — | — |
| `NEXT_PUBLIC_SITE_URL_STAGING` | — | ✅ | — |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ✅ | ✅ | — |
| `VAPID_PRIVATE_KEY` | ✅ | ✅ | — |
| `VAPID_SUBJECT` | ✅ | ✅ | — |
| `CRON_SECRET` | ✅ | ✅ | — |

The VAPID pair is the **same on every tier**. Rotating the public key
invalidates every existing subscription silently — devices keep the old key and
the push service just rejects the send.

**Rotating any secret means redeploying.** `next.config.ts` bakes the resolved
values into the build through its `env` block, so changing a variable in the
dashboard does nothing until the next deployment.

---

## 4. GitHub checklist

- [ ] `.github/workflows/ci.yml` runs `lint → lint:boundaries → check-types →
      build` on every push to `main` and every pull request.
- [ ] Repo secrets: `TURBO_TOKEN`. Repo variables: `TURBO_TEAM`.
- [ ] **CI holds no database or Supabase credentials, and must not.** The build
      step sets `SKIP_ENV_VALIDATION=true`; `@syn/db`'s client is a lazy proxy
      that opens no connection at build time. A CI that needed a database could
      not run on a fork's pull request.
- [ ] Branch protection on `main`: require the `verify` job.
      `[PROVISIONAL — not yet enabled.]`

---

## 5. Local checklist

- [ ] Node 22 (`nvm use`), Yarn 4 (`corepack enable`), then `yarn install`.
- [ ] A local Postgres, and the `authenticated` / `service_role` roles plus
      grants from `packages/db/SETUP.md` §4.
- [ ] `packages/db/.env` — copy `packages/db/.env.example`; the two
      `LOCAL_*` URLs are all you need for `local`.
- [ ] `apps/web/.env.local` — copy `apps/web/.env.example`; fill the two
      `NEXT_PUBLIC_SUPABASE_*_STAGING` values so sign-in works.
- [ ] `yarn db:migrate && yarn db:setup` against the local database.
- [ ] `yarn web:dev` → `http://localhost:3000`. `yarn web:dev:local` binds to
      the LAN so a phone can reach it.
- [ ] Verify the way CI does before pushing:
      `yarn lint && yarn lint:boundaries && yarn check-types && yarn build`.

---

## 6. The rule about migrations

**An agent never runs `db:migrate`, `db:push`, `db:seed`, `db:setup`, or
`db:reset` against a hosted tier.** It authors the SQL and stops; a human reads
it and applies it. Migrations are one-way doors, and the review is the door.

Three independent guards, because a rule with one guard is a rule:

1. `packages/db/scripts/reset-local-db.ts` refuses any tier but `local`, before
   it reads a connection URL.
2. `DATABASE_ENVIRONMENT` defaults to `local`, so an unconfigured shell cannot
   reach a hosted database by omission.
3. `.claude/settings.json` (tracked, so every worktree inherits it) **denies**
   `db:reset`, `db:drop`, and any `DROP SCHEMA`/`DROP DATABASE`, and **asks**
   on `db:migrate`, `db:push`, `db:seed`, `db:setup`, and the raw
   `drizzle-kit migrate`/`push`.

### Where Turbo hashes env files

Claude Code's sandbox denies reading `**/.env` and `**/.env.local`, which is
right. Turbo reads every file it hashes, so an env file in `turbo.json`'s
`globalDependencies` made every task, `yarn lint` and `yarn check-types`
included, fail inside a sandboxed agent session with:

```
x I/O error while hashing …/apps/web/.env.local: Operation not permitted
```

Since MIG-3, no env file is a global dependency. Only `web#build` hashes them:
`apps/web/turbo.json` extends the root and appends `.env*` to the build
inputs, because Next loads `apps/web/.env*` inside that task and the bundle
embeds the collapsed `NEXT_PUBLIC_*` values. An edited `apps/web/.env.local`
still misses the build cache; a tier or value set in the shell or on Vercel
misses every task's cache through `globalEnv`. `packages/db/.env` feeds only
the `db:*` scripts, whose tasks are not cached, and the root `.env.local` is
loaded by nothing. So `yarn lint` and `yarn check-types` run sandboxed, and
`yarn build` (so `yarn verify`) runs unsandboxed on a machine that holds
`apps/web/.env.local`. `yarn check-turbo-env [--build]` proves the layout;
never put an env file back in `globalDependencies`, and never "fix" the
sandbox by letting it read the files.

---

## 7. Still to decide

- **Custom domain and DNS** — `[NEEDS VALUE AT BUILD — Taylor.]` Until then,
  the Vercel-assigned `*.vercel.app` origins are the site URLs.
- **Branded auth emails / Supabase SMTP** — a later runbook. The default
  Supabase sender works for staging.
- **Error tracking** — not in Phase 1. Official spec §9.1 rules out engagement
  analytics; a crash reporter is a separate decision, and whatever is chosen
  must never receive item titles, notes, or reasons.
