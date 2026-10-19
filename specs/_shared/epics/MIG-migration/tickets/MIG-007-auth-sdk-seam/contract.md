---
id: MIG-7
size: medium # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "Every Supabase SDK call sits behind the auth or db module and is reached by a reviewer glob"
slice_type: "auth topology; risks an unreviewed path to identity or data"
non_negotiables:
  - "No change to RLS policies or migrations, and no new admin (service-role) read."
  - "No user-scoped query through the singleton db; every one still runs through ctx.rls.execute()."
  - "No secret reaches a client bundle: the browser path carries only NEXT_PUBLIC_* literals, read where they are read today."
  - "Behaviour unchanged: sign-in, sign-out and the session refresh in proxy.ts work as before."
  - "An exception is named once, in the boundaries config, and a mason and a warden reviewer glob both reach it."
  - "tooling/check-stack.ts is the toolkit's file byte for byte; no boundaries error is suppressed."
devs_call: "Wrap, move or name each importer; the shape of the client-safe entry @syn/auth exports; how the restriction is enforced and tested."
cites:
  - "MIG-migration assess V5 (SDK importers)"
truth_files: "none: the seam moves imports and types; no screen, copy or flow changes"
qa: Q3 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers:
  - mason
  - warden
focus:
  - "the three importers: each behind a module or a named exception (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "apps/web/lib/clients/supabase/client.ts"
  - "apps/web/lib/auth/get-request-context.ts"
  - "apps/web/lib/auth/require-verified-email.ts"
  - "apps/web/package.json"
  - "packages/api/src/context.ts"
  - "packages/api/package.json"
  - "packages/db/scripts/seed-users.ts"
  - "packages/auth/**"
  - "packages/config/eslint/boundaries.js"
  - "toolkit.json"
  - "tooling/check-stack.ts"
  - "docs/developer-guides/remove-supabase-auth.md"
  - "docs/developer-guides/authentication.md"
  - "scripts/check-auth-seam.test.mjs"
depends_on: [MIG-6] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Billing, email and AI families (none in Phase 1)"
  - "Vendor dashboard changes (Operator)"
  - "The env reads in packages/auth/src/cookies.ts and seed-users.ts (MIG-15, MIG-18)"
criteria:
  - id: C1
    statement: "No file imports @supabase/* outside packages/auth and the one named exception, packages/db/scripts/seed-users.ts; a new import anywhere else is a lint:boundaries error"
    evidence: test
    command: "yarn test:auth-seam --test-name-pattern C1"
  - id: C2
    statement: "Every @supabase/* importer, the exception included, is reached by a mason and a warden reviewer glob in toolkit.json"
    evidence: test
    command: "yarn test:auth-seam --test-name-pattern C2"
  - id: C3
    statement: "toolkit.json carries the auth stack entry, yarn verify runs check-stack, and check-stack passes"
    evidence: test
    command: "yarn test:auth-seam --test-name-pattern C3"
  - id: C4
    statement: "yarn lint:boundaries is green over the repo with the restriction on"
    evidence: check
    command: "yarn lint:boundaries"
  - id: C5
    statement: "In the running app, the seeded account dev@synapse.test signs in, keeps its session across a reload and a return later (the proxy refresh), and signs out; an invalid session cookie lands on sign-in with no error; an unverified account is sent to /verify"
    evidence: manual
    reason: "It needs the running app against the hosted staging auth project; recorded as a walk of the app"
  - id: C6
    statement: "The browser entry @syn/auth/browser reaches no server-only module (env, server, admin, session, middleware, cookies) and no environment read, and the app's browser client imports it rather than the barrel"
    evidence: test
    command: "yarn test:auth-seam --test-name-pattern C6"
  - id: review:mason
    statement: Mason reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run mason <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
---

# Contract — MIG-7 auth-sdk-seam

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** 3, part 6 (signal V5).
- **What did not cross:** 3 of 12 SDK-importing files match no reviewer glob (assess.md): apps/web/lib/clients/supabase/client.ts (@supabase/ssr, @supabase/supabase-js), packages/api/src/context.ts (@supabase/supabase-js), packages/db/scripts/seed-users.ts (@supabase/supabase-js). The imports reviewer rows for @supabase/* (mason, warden) keep every change at the right level until then.
- **Plan:** Read the toolkit's docs/runbooks/remove/supabase-auth.md and supabase-database.md (in the toolkit checkout (/Users/taylor/lighthouse/product-engineering-mastery)) backwards as the checklist of what the module must own; move or wrap each of the three importers behind @syn/auth or @syn/db (or name it an accepted exception with a reviewer glob); then add the auth stack entry to toolkit.json and install check-stack into verify with it. Operator: Supabase dashboard settings if an endpoint changes.
- **Conflict risk:** high for the call sites (auth). Trigger: Taylor opens it; one family only (auth).
- **Estimate:** one to two days. An estimate.

### At start (2026-10-09)

- **Today's importers:** 9 files in `packages/auth/src/`, two type-only importers in `apps/web/lib/auth/` (`User`), and the three above.
- **`apps/web/lib/clients/supabase/client.ts`: wrap.** It keeps its literal `NEXT_PUBLIC_*` reads (MIG-6's exempt file; Next inlines literals only), the cookie domain among them. It hands them to `createBrowserClientFromCredentials`, a new client-safe subpath `@syn/auth/browser` (`src/browser.ts`) that imports only the SDK and `./context`'s types (C6).
- **`packages/api/src/context.ts` and the two `apps/web/lib/auth/` files: wrap the types.** `@syn/auth/context` re-exports `AuthUser` and `AuthClient` (today's `User` and `SupabaseClient`), so no caller names the vendor.
- **`packages/db/scripts/seed-users.ts`: the one named exception.** It is the local auth mirror's seeder and lives in `@syn/db` (toolkit D-STK-6). `@syn/db` cannot import `@syn/auth`, and its tier default (`local`) differs from `@syn/auth`'s, so moving it would change what it seeds. Named in the boundaries config and reached by a mason and a warden glob in `toolkit.json`.
- **Enforcement:** `@supabase/*` joins `RESTRICTED_EXTERNAL` in `packages/config/eslint/boundaries.js` with `auth` as owner; the exception is a per-file override that changes only that one restriction. `lint:boundaries` is already in verify.
- **Stack:** the `auth` entry in `toolkit.json` (files, env, dependencies, boundaries), and its runbook `docs/developer-guides/remove-supabase-auth.md`, written for Synapse because `validateStack` requires the path to exist; host-owned, since `docs/runbooks/` is the toolkit's byte-for-byte folder. `tooling/check-stack.ts` copied byte for byte from the toolkit at `62d344b`; `check-stack` runs in verify after `check-refs`, as in the toolkit.
- **Order against the env-seam moves:** MIG-7, then MIG-15 and MIG-19. MIG-15's note asks the reverse, but this ticket touches none of `cookies.ts`'s reads; MIG-19 rewires `client.ts`'s literal reads into `lib/env/public.ts`, on top of this wrap. Each of them adds MIG-7 to its own `depends_on` when it starts. MIG-18 moves `seed-users.ts`'s reads; the exception here names the file, not its reads, so the order there is free.
- **Built before the gate:** the code was in the tree before this pre-flight ran (the first run read the unfilled contract). The as-built says so.
- **Not this ticket:** method calls on the client the module returns (`supabase.auth.signInWithPassword` in the auth forms) stay where they are; the seam is the import.
