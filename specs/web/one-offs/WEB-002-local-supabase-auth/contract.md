---
id: WEB-2
size: small
objective: "The local tier can sign in against a Supabase stack on this machine (Postgres and Auth in Docker), so the dev account signs in at localhost and an agent can walk any signed-in screen without a hosted project"
slice_type: "dev tooling and the auth env resolver; risks the staging or production branch of the resolver changing, a local key reaching a hosted tier, the auth.users stub fighting the real auth schema, and a setup that only works on one laptop"
non_negotiables:
  - "Opt-in: the local tier uses local Auth only when NEXT_PUBLIC_SUPABASE_URL_LOCAL is set; unset, it reads staging exactly as today. The staging and production branches of getSupabaseUrl and its key readers are unchanged."
  - "The local URL is honoured only for a localhost or 127.0.0.1 host; anything else is refused with a sentence naming the variable."
  - "Every Supabase client still comes through @syn/auth (MIG-7); the browser reads only NEXT_PUBLIC_* literals; secret keys stay server-side."
  - "The dev account is created through auth.admin.createUser, confirmed, never by a raw INSERT into auth.users (SETUP.md §3)."
  - "Migrations run unchanged against the local stack: 0000's auth.users stub guard sees the real auth schema and skips."
  - "No hosted database is touched; db:reset and db:push stay local-only (house rules)."
devs_call: "The Supabase CLI as a root devDependency or a documented install; the script names (db:local:up, db:local:down); whether the local keys live in .env.example as Supabase's published local demo values or are printed by the up script; ports kept at the CLI defaults (54321 API, 54322 Postgres, which LOCAL_DATABASE_URL already uses)."
cites:
  - "packages/db/SETUP.md"
truth_files: "none: developer tooling, no product behaviour changes"
qa: Q1 # touches auth env resolution; dev-only and opt-in, so Q1 per the operator's QA spend, flagged once
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "supabase/config.toml"
  - "package.json"
  - "yarn.lock"
  - "packages/auth/src/env.ts"
  - "tests/local-supabase-auth.test.ts"
  - "apps/web/env.ts"
  - "apps/web/next.config.ts"
  - "apps/web/lib/env/resolve-tier-env.ts"
  - "packages/db/src/connection-env.ts"
  - "packages/db/scripts/seed-users.ts"
  - "packages/db/SETUP.md"
  - ".env.example"
  - "specs/web/one-offs/WEB-002-local-supabase-auth/evidence/"
depends_on: []
out_of_scope:
  - "Google OAuth on the local stack (email and password only)"
  - "A placeholder user or any auth bypass in (shell)/layout.tsx"
  - "Seeding app data beyond the dev account (each surface's fixtures)"
  - "CI running against the local stack"
criteria:
  - id: C1
    statement: "With DATABASE_ENVIRONMENT=local and NEXT_PUBLIC_SUPABASE_URL_LOCAL set, getSupabaseUrl and the key readers return the _LOCAL values; with it unset they return the _STAGING values, as today"
    evidence: test
    command: "yarn test:root"
  - id: C2
    statement: "Staging and production resolve exactly as before, whatever _LOCAL holds; a non-localhost _LOCAL URL throws a sentence naming the variable"
    evidence: test
    command: "yarn test:root"
  - id: C3
    statement: "From a clean checkout with Docker running: db:local:up, then db:migrate and db:seed against local, bring up the stack, apply every migration and create the confirmed dev account (steps and output in the evidence)"
    evidence: manual
    reason: "needs Docker on the operator's machine; the agent runs it and records the log"
  - id: C4
    statement: "In the browser pane at localhost:3000, the seeded dev account signs in, lands on /today, and sign-out returns to /signin; no request goes to a *.supabase.co host"
    evidence: capture
    path: "specs/web/one-offs/WEB-002-local-supabase-auth/evidence/local-signin.txt"
  - id: C5
    statement: "Types, lint and boundaries pass for @syn/auth, @syn/db and the web app"
    evidence: check
    command: "yarn check-types"
---

# Contract — local-supabase-auth

## Build notes

Drafted from USE-4's build (2026-10-13): the shell is behind sign-in, and the `local` tier signs in against the hosted staging project, so an agent cannot walk a signed-in screen. The operator chose a fully local Supabase over an auth bypass.

- **Approach:**
  1. `supabase init` at the root (`supabase/config.toml` only); CLI default ports. Email confirmations off locally, so the seeded account signs in at once; Mailpit catches anything else.
  2. Scripts: `db:local:up` (`supabase start`) and `db:local:down` (`supabase stop`).
  3. In `@syn/auth`'s `env.ts`: under the `local` tier, read `NEXT_PUBLIC_SUPABASE_URL_LOCAL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_LOCAL` and `SUPABASE_SECRET_KEY_LOCAL` when the URL is set, otherwise staging as now. Mirror the variables in `apps/web/env.ts`, `next.config.ts`'s env collapse and `resolve-tier-env.ts`.
  4. `seed-users.ts` resolves the same way, so `db:seed` creates the dev account on the local stack.
  5. `SETUP.md` §3 gains Option D, the local stack, and becomes the recommended offline path; `.env.example` gets the three variables, commented.
- **Gotchas:**
  - `LOCAL_DATABASE_URL` already points at 54322, the CLI's Postgres. Check that 0000's guarded `auth.users` stub skips when `auth` exists, and that `ensureLocalUserFromSupabaseAuth()` still writes the `public.users` row.
  - The browser client reads `process.env.NEXT_PUBLIC_*` literals (`lib/clients/supabase/client.ts`); the collapse in `next.config.ts` has to land the local values there.
  - `proxy.ts`'s cookie domain: leave `NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN` unset locally.
- **Model:** Opus 5.5 at medium.
