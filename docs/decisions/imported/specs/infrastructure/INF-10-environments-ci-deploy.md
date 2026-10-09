# INF-10 — Environments, CI, Vercel, and agent permissions

**Epic:** INF — Infrastructure · **Phase 4** · Size: M
**Slice type:** Delivery and guardrails — the failure classes are a production build with staging credentials, a preview deploy pointed at the production database, and an agent with the power to run `db:reset` against a hosted tier.
**Vigil:** review by inducing — open a PR and confirm CI fails on a deliberate boundaries violation and on a type error; deploy a preview and confirm its Supabase project ref is the staging one.

**Status:** Complete (2026-09-04) — files landed and locally verified; **the GitHub, Vercel, and Supabase dashboard steps are Taylor's** (checklists in `docs/developer-guides/environments.md`)

---

## Outcome

Three tiers exist and are wired: **local** (local Postgres + staging Supabase Auth), **staging** (a Supabase project + Vercel preview deployments), **production** (a Supabase project + the Vercel production deployment). GitHub Actions runs `lint → lint:boundaries → check-types → build` on every push and PR, with Turbo remote cache. Vercel builds `apps/web` from the repo root with Yarn 4, sets `DATABASE_ENVIRONMENT` per environment, and carries the secret matrix. `.claude/settings.json` (tracked) allows the routine commands, asks on `db:migrate/push/seed/setup`, and denies `db:reset` and drops — CC's file. `.env.example` documents the whole surface. A PR template exists.

## Why / intent

- **README § Locked scope** — two hosted Supabase projects plus local; **§ Non-negotiables** — local can never reach production by omission; agents never run hosted migrations.
- **CC `.github/workflows/ci.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `apps/toolkit/vercel.json`, `.claude/settings.json`, `.env.example`, `docs/developer-guides/database-setup.md` (environments table), `AGENTS.md` § Shell command conventions and § Database commands.**
- **`taylor-aucoin/.env.example`** — the "local borrows staging credentials" commentary, adopted in INF-5/INF-7.
- **What this slice is NOT (binding):** no monitoring/observability vendor, no error tracker, no analytics, no custom domain decisions beyond recording them as `[NEEDS VALUE AT BUILD]`.
- **Ground truth:** `env.ts` declares the full variable surface (INF-7); `vercel.json` has the build commands (INF-7) and the cron (INF-9); `db:reset` refuses non-local (INF-5).

**Rulings this slice makes (labelled, logged):**

- **Vercel environments map to tiers:** Production → `DATABASE_ENVIRONMENT=production` + unprefixed Supabase vars + `SUPABASE_LIVE_*` URLs; Preview → `DATABASE_ENVIRONMENT=staging` + `*_STAGING` vars + `SUPABASE_STAGING_*` URLs; Development (Vercel CLI) → `local`. One Vercel project, `web`, root directory `apps/web`, CC's `installCommand`/`buildCommand`. Logged.
- **CI builds with `SKIP_ENV_VALIDATION=true` and no secrets** — the build must not need a database or a Supabase project to compile (CC's `env.ts` supports this; the lazy `db` proxy makes it possible). Preview deploys have real staging secrets. Logged.
- **Turbo remote cache via Vercel** (`TURBO_TOKEN` secret, `TURBO_TEAM` variable) — CC's `ci.yml` comment. Logged.
- **`.claude/settings.json` is CC's**, with the `ask` list (`db:migrate`, `db:push`, `db:seed`, `db:setup`, `drizzle-kit migrate/push`), the `deny` list (`db:reset`, `db:drop`, `supabase db reset`, `drizzle-kit drop`), the sandbox `allowedDomains` reduced to what Synapse uses (npm/yarn registries, GitHub, `*.supabase.co`, `*.supabase.com`, `*.vercel.app`, Google Fonts; **no** `api.anthropic.com`). Tracked in git; the `.gitignore` block from INF-1 already admits it. Logged.
- **Vercel plan:** the 15-minute cron (INF-9) requires Pro. `[NEEDS DECISION — Taylor: Pro plan, or a daily cron on Hobby with N4/N5/N6 accepting up-to-24h drift (which the spec does not accept)]`. Recorded, not resolved.

## Behaviour & states

**No surface.** Described by the pipelines.

### Files (exact)

- `.github/workflows/ci.yml` — copy CC's verbatim (Node from `.nvmrc`, `corepack enable`, `yarn install --immutable`, the four steps; `env: SKIP_ENV_VALIDATION: "true"` added to the Build step).
- `.github/PULL_REQUEST_TEMPLATE.md` — copy CC's, replacing its slice-track references with `docs/specs/<track>/`.
- `.claude/settings.json` — per the ruling.
- `.env.example` (root) — final form: header; Node; Database (the `DATABASE_ENVIRONMENT` explanation with **default `local`**, the six URLs, the `packages/db/.env` note); Supabase Auth (staging + production blocks, the tier rule); Web Push (VAPID generation note, `VAPID_SUBJECT`); Scheduler (`CRON_SECRET`); Site URLs (`NEXT_PUBLIC_SITE_URL[_LOCAL|_STAGING]`; local always localhost); `NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN` (unset in Phase 1 — one origin); Google OAuth (dashboard-only note). Every line either has a placeholder or is commented.
- `apps/web/.env.example` — the runtime subset (same names, no drizzle URLs).
- `docs/developer-guides/environments.md` — new (INF-11 indexes it): the tier table (tier · Postgres · Auth project · Vercel env · who sets `DATABASE_ENVIRONMENT`), the Supabase project checklist (create two projects; Auth: email confirm on, Google provider, Site URL, redirect allowlist; Storage: run `db:setup`; API keys into Vercel), the Vercel checklist (project, root, commands, env matrix by environment, cron, `TURBO_TOKEN`/`TURBO_TEAM`), the GitHub checklist (secrets, branch protection requiring the `verify` job `[PROVISIONAL]`), the local checklist (Postgres, `packages/db/.env`, `apps/web/.env.local`, `yarn db:migrate` locally, `yarn web:dev`), and the secret-rotation note ("rotating a secret means redeploying" — the env is baked at build).

**States (exhaustive):** push to any branch → CI runs and passes · a PR with a forbidden import → `lint:boundaries` fails the job · a PR with a type error → `check-types` fails · merge to `main` → Vercel production build with production tier · any branch → Vercel preview with staging tier · `yarn db:reset` in Claude Code → denied by settings · `yarn db:migrate` in Claude Code → prompts.

## Non-negotiables (this slice)

- **Preview deployments never carry production database URLs or production Supabase keys.**
- **`DATABASE_ENVIRONMENT` is set explicitly on every Vercel environment** — the `local` default is for laptops.
- **CI never has hosted database credentials.**
- **`.claude/settings.json` denies `db:reset` and any `drop`; asks on every hosted write.**
- **Secrets are never committed;** `.env.example` has placeholders only.

## Data & AI

**Schema changes: none.** **Tables:** none. **Placement:** repo root, `.github/`, `.claude/`, `apps/web/`, `docs/developer-guides/`. **tRPC / validators:** none. **AI notes: None.** **Instrumentation: none.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. A PR run of `.github/workflows/ci.yml` shows the four steps green; a scratch commit adding `import "@syn/api"` to `packages/utils/src/index.ts` fails `lint:boundaries`; a scratch `const x: number = "a"` fails `check-types`. Both scratch commits reverted. *(Vigil.)*
2. A Vercel preview deployment's HTML references `sb-<staging-ref>` after sign-in (cookie name), and `process.env.DATABASE_ENVIRONMENT` logged once in a scratch server component reads `staging`; the production deployment reads `production`. *(Vigil.)*
3. `.claude/settings.json` exists at the repo root, is tracked, and `git check-ignore .claude/settings.json` reports it is not ignored.
4. In a Claude Code session, `yarn db:reset` is refused by the harness; `yarn db:migrate` prompts.
5. `.env.example` lists exactly the variable names `apps/web/env.ts` declares plus the six drizzle URLs; no value is a real secret.
6. `docs/developer-guides/environments.md` exists with the five checklists.
7. Turbo remote cache hits appear in a second CI run (`cache hit` in the log).
8. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass locally with `SKIP_ENV_VALIDATION=true` and no `.env.local`.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Vercel's `installCommand` must `cd ../..` to the repo root for Yarn workspaces (CC's `vercel.json`); the root directory setting is `apps/web`.
- Branch protection is a GitHub setting, not a file; record it in `environments.md` as done/not done.
- The shared cookie domain (`NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN`) is a CC multi-app concern; Synapse leaves it unset until a second origin exists.

## Dev's call

Cron schedule string if Taylor picks Hobby · whether CI caches `.next/cache` · the PR template wording.

## Out of scope

- **Custom domain, DNS, email sender domain** — Taylor, recorded in `environments.md` as `[NEEDS VALUE AT BUILD]`. **Error tracking / analytics** — not in Phase 1 (spec §9.1: no engagement analytics; a crash reporter is a later decision). **Supabase SMTP and branded auth emails** — a later runbook (CC's `supabase-auth-email-setup.md` is the template).

## Depends on

- **INF-8** — a buildable app with the full env surface. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** File copies plus dashboard checklists; the risks are configuration and the acceptance criteria induce them.

---

### Build kickoff (paste into the session)

> Build **INF-10 — Environments, CI, Vercel, agent permissions** (attached spec). Model: **Sonnet**. **Three tiers wired to Vercel environments and two Supabase projects; CC's CI; CC's `.claude/settings.json`; a complete `.env.example` — previews never see production.**
> Attach/read first, in order: this spec · CC `.github/workflows/ci.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `.claude/settings.json`, `.env.example`, `apps/toolkit/vercel.json` · CC `docs/developer-guides/database-setup.md` · CC `AGENTS.md` § Shell command conventions · `~/lighthouse/taylor-aucoin/.env.example` (tier commentary) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Do the dashboard steps where credentials are available to you; otherwise write the checklist with exact values to enter. Close in three places; run `yarn lint && yarn lint:boundaries && yarn check-types && yarn build`.
