# Synapse — Agent Instructions

**This file is the canonical instruction spine for every agent (Claude Code, Cursor, any other).** `CLAUDE.md` files are one-line `@AGENTS.md` pointers — shared guidance is edited **only here** (see "Keeping instructions in sync" at the bottom).

> **Skeleton (INF-1).** The Commands, Environment & tooling, Import boundaries, and Shell command conventions sections below are complete and binding from this ticket on. The Key docs and Monorepo map tables list what this infrastructure track will create, each row marked with the ticket that lands it. INF-11 completes this file.

## Start here (turn one)

1. **What this is:** a Yarn 4 + Turborepo monorepo — the Synapse habit-tracker PWA (`apps/web`), an Expo seam (`apps/mobile`, README only), and `@syn/*` capability packages. The conventions are Conscious Connections', copied and re-scoped — never imported.
2. **Read before coding, in order:** this file → `docs/specs/infrastructure/README.md` → your ticket spec → the UX source it cites in `docs/ux/`.
3. **Specs live in `docs/specs/`:** the current queue is `docs/specs/infrastructure/`. Process + kickoff contract: [`docs/specs/infrastructure/README.md`](docs/specs/infrastructure/README.md).
4. **Orient in the docs tree** via `docs/README.md` and `docs/architecture/directory-map.md` — *lands in INF-11*.
5. **Verify work** the way CI does: `yarn lint && yarn lint:boundaries && yarn check-types && yarn build` (see Commands). There is **no test suite** — do not write tests during slices.
6. **Done means:** acceptance criteria met · verify commands pass · the spec's `Status:` line flipped · `PROGRESS.md` ticked · one `DEVIATIONS.md` line per divergence.
7. **Never re-litigate** the official UX spec §0.3 rulings or the v2 handoff §10/§12 decisions; on-disk reality + `DEVIATIONS.md` beat any stale spec string.
8. **Hard guardrails** below are non-negotiable — read them before your first write.

## Source precedence

When docs disagree, follow this order:

1. **Product behaviour** → `docs/ux/habit_tracker_official_ux_spec_v1.md` (its **§0.3 rulings are signed**), then the three epic documents and `docs/ux/synapse_navigation_and_system_ux_architecture.md` for their own screens, then `docs/ux/synapse_ui_component_needs_and_handoff_v2.md` for component contracts.
2. **Architecture & placement** → `docs/architecture/codebase-conventions.md` — *lands in INF-11; until then, Conscious Connections' locked copy at `~/lighthouse/conscious-connections/conscious-connections/docs/architecture/codebase-conventions.md` governs, read through the `@cc/*` → `@syn/*` rename.*
3. **Domain guides** → `docs/ai-guides/` — *lands in INF-11; until then, CC's `docs/ai-guides/*`.*
4. **Ticket rulings** → each ticket's "Rulings this slice makes", summarised in `docs/specs/infrastructure/TECHNICAL-DECISIONS.md`.
5. **Shipped-work amendments** → `docs/specs/infrastructure/DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`. On-disk reality + these logs override any stale spec text.

## Hard guardrails

- **Never scaffold `apps/mobile/`** — it is a deliberate empty seam (README only).
- **`DEVIATIONS.md` and `TECHNICAL-DECISIONS.md` are append-only** — never edit or delete prior entries.
- **Migrations:** append-only under `packages/db/migrations/`; a human reviews the SQL before `db:migrate` is run against any hosted database. Never run `db:reset` or `db:push` against staging or production.
- **RLS is deny-by-default and user-private.** There are no admin-read policies on user data. Every user-scoped query runs through `ctx.rls.execute()`, never the singleton `db`.
- **Secrets never reach a browser bundle.** Server env is read through one `env.ts` per app; client code reads only `NEXT_PUBLIC_*` literals.
- **Never hand-edit the generated tree** in `docs/architecture/directory-map.md` — regenerate via `yarn directory-map` (*lands in INF-11*).
- **No git branches or PRs** as part of slice work; commit to the working branch with clear messages.
- **No tests during slices** — tests are a separate finalization pass after human QA.
- **Phase 1 has no AI, no billing, no marketing site, no social surface.** Seams are recorded, not scaffolded.

## Commands

Setup: Node **22** (`.nvmrc`), Yarn **4.13.0** (`corepack enable && yarn install`). Env surface: `.env.example` (*lands in INF-7*).

| Task | Command |
|------|---------|
| Verify (matches CI) | `yarn lint && yarn lint:boundaries && yarn check-types && yarn build` |
| Dev server | `yarn dev` (all) · `yarn web:dev` · `yarn web:dev:local` (LAN/phone) |
| Per-app checks | `yarn web:build` / `web:lint` / `web:typecheck` (same for `ui:*`) |
| Database | `yarn db:generate` · `db:migrate` · `db:push` · `db:setup` · `db:reset` · `db:seed` · `db:seed-users` · `db:schema-reference` |
| Storybook (`@syn/ui`) | `yarn ui:storybook` |
| Docs upkeep | `yarn directory-map` · `yarn docs:check-links` (*land in INF-11*) |
| Formatting | `yarn format` |

## Key docs (`docs/`)

Full index: `docs/README.md` — *lands in INF-11*.

| Path | What | Status |
|------|------|--------|
| `docs/ux/habit_tracker_official_ux_spec_v1.md` | Product behaviour — source of truth; **§0.3 rulings are signed** | On disk |
| `docs/ux/epic1_setup_ux_architecture.md` | Setup epic screens | On disk |
| `docs/ux/epic2_in_use_ux_architecture.md` | In-Use epic screens | On disk |
| `docs/ux/epic3_review_ux_architecture.md` | Review epic screens | On disk |
| `docs/ux/synapse_navigation_and_system_ux_architecture.md` | Cross-cutting navigation and system surfaces | On disk |
| `docs/ux/synapse_ui_component_needs_and_handoff_v2.md` | Component contracts; §3.5 fixes the type unions, §6.2 is the token map | On disk |
| `docs/specs/infrastructure/` | This track's tickets + `PROGRESS` / `DEVIATIONS` / `TECHNICAL-DECISIONS` logs | On disk |
| `docs/architecture/codebase-conventions.md` | Architecture & placement (locked contract) | Lands in INF-11 |
| `docs/architecture/tech-stack.md` | Canonical stack choices + pinned versions | Lands in INF-11 |
| `docs/architecture/directory-map.md` | Generated monorepo tree (`yarn directory-map`) | Lands in INF-11 |
| `docs/architecture/drizzle-orm-conventions.md` | Drizzle schema syntax & conventions | Lands in INF-11 |
| `docs/ai-guides/` | Domain conventions for agents | Lands in INF-11 |
| `docs/developer-guides/` | DB setup, migrations, RLS, authentication | Lands in INF-11 |

## Monorepo map

### `apps/*`

| Path | What | Status |
|------|------|--------|
| `apps/web/` | The Synapse PWA — the only product surface in Phase 1. | Scaffolded in INF-1; real shell in INF-7 |
| `apps/mobile/` | **Empty Expo seam** — README only. Do not scaffold. | On disk |

### `packages/*`

| Package | What | Status |
|---------|------|--------|
| `@syn/config` | ESLint, Prettier, Tailwind preset, shared tsconfigs. | On disk (INF-1) |
| `@syn/constants` | Shared runtime constants. | Lands in INF-2 |
| `@syn/types` | Pure TypeScript domain types. | Lands in INF-2 |
| `@syn/observability` | Dev logging helpers. | Lands in INF-2 |
| `@syn/utils` | Pure helper functions. | Lands in INF-2 |
| `@syn/validators` | Zod schemas for forms and tRPC. | Lands in INF-2 |
| `@syn/db` | Drizzle schema, client, migrations, RLS. | Lands in INF-5 |
| `@syn/auth` | Supabase Auth clients, session refresh, AuthContext bridge. | Lands in INF-6 |
| `@syn/api` | tRPC routers, context, services — the typed contract. | Lands in INF-8 |
| `@syn/hooks` | Shared headless React hooks (web + future mobile). | Lands in INF-8 |
| `@syn/ui` | Web component library — Storybook-first. | Emptied in INF-1; filled in INF-3/INF-4 |

There is no `@syn/ai` package in Phase 1, and none is anticipated.

## Environment & tooling

- **Package manager:** Yarn Berry **v4** (`packageManager: yarn@4.13.0`). Use **`yarn`**, never `npm` or `pnpm`.
- **Node:** **22** (`.nvmrc`; root `engines.node >= 22`).
- **TypeScript:** **5.9.2**, pinned exactly at the root. Not TypeScript 7 — see `TECHNICAL-DECISIONS.md`.
- **Drizzle:** `drizzle-orm 0.45.2` and `drizzle-kit 0.31.10`, pinned exactly at the root. Never bump without a logged decision.
- **Next.js 16 session refresh:** `apps/*/proxy.ts` calls `@syn/auth` `updateSession`. **Not `middleware.ts`.**
- **Next.js 16 is not the Next.js you remember.** APIs, conventions, and file structure differ from most training data — `middleware.ts` is gone, `next/config` is gone, params and `cookies()`/`headers()` are async, and the caching defaults changed. Read the relevant guide under `node_modules/next/dist/docs/` before writing app code, and heed deprecation notices. Next's own generator would write this warning into `apps/web/AGENTS.md` on every `next dev`; that generator is disabled (`agentRules: false` in `apps/web/next.config.ts`) so the spine has one home, and this bullet is the warning it would have written.

## Import boundaries

Enforced by `yarn lint:boundaries` (root `eslint.config.mjs` + `packages/config/eslint/boundaries.js`). Internal package-layer edges plus restricted third-party deps (`drizzle-orm`/`postgres`/`drizzle-kit` → data layers; `web-push` → `@syn/api`; `frimousse` → `@syn/ui`).

**Platform split:** logic shared and platform-pure; rendering platform-specific. `@syn/ui` is the one web-only package; headless hooks are shared in `@syn/hooks`, web-only hooks live in `apps/web/lib/hooks/`. This is what makes the future Expo app a re-skin rather than a rewrite.

- **Apps → packages only.** No `apps/*` → `apps/*` imports.
- **Page data:** the tRPC server caller (`apps/web/lib/trpc/server.ts`). Never raw `@syn/db` in pages or client components.
- **Server Components** are the default. Client leaves: `"use client"` on **line 1**, in `_components/`. No `.client.tsx` suffix.
- **Env:** one `env.ts` per app — the only `process.env` reader.
- **Never suppress a boundaries error.** If you need an upward import, the boundary is wrong; refactor it or flag it.

Layer order (low → high): `config` → `constants` / `types` / `observability` → `utils` → `validators` → `db` → `auth` → `api` → `hooks` → `ui` → `apps`.

## Build-slice workflow

The full working contract (kickoff, dependency checks, completion protocol) is [`docs/specs/infrastructure/README.md`](docs/specs/infrastructure/README.md); in short:

1. **Before starting** — read your ticket spec and confirm its `## Depends on` entries show **Complete** in `docs/specs/infrastructure/PROGRESS.md`.
2. **Implement** against the spec. Its acceptance criteria are the definition of done.
3. **Verify** — `yarn lint && yarn lint:boundaries && yarn check-types && yarn build` must pass.
4. **Mark complete in three places** — the spec's `Status:` line, the `PROGRESS.md` row + checklist, and a `DEVIATIONS.md` line per divergence (`YYYY-MM-DD · <ticket-id> · <what changed> · <why>`). Architectural choices with real alternatives go to `TECHNICAL-DECISIONS.md`. Then tick `00-build-order.md`.
5. **Refresh the directory map** if files were added, moved, or removed (*once INF-11 lands the script*).
6. **Commits** — commit to the working branch with clear messages. No branches, no PRs.
7. **Tests** — do not write tests as part of a slice.

## Shell command conventions

Certain Bash patterns trigger mandatory manual approval regardless of allowlist configuration, which interrupts unattended runs. Avoid all of the following:

- **No heredocs** (`python3 - <<'EOF' ... EOF`, `cat >> file <<'EOF' ... EOF`). Use the Edit tool for every file change — specs, `PROGRESS.md`, `DEVIATIONS.md`, `TECHNICAL-DECISIONS.md`, code, everything.
- **No command substitution** (`$(...)`, backticks) inside any Bash call. Use Grep/Glob tools directly instead of shelling out to `grep`/`find`.
- **No piping status checks through grep** (e.g. `yarn lint | grep -cE " error "`). Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types` plain and read their own output.
- **One command per Bash call** — never chain with `&&`, `;`, or newlines. A slice close-out is several separate calls: Edit tool per doc file, then separate Bash calls for `yarn lint`, `yarn lint:boundaries`, `git add -A`, `git commit`.
- **No shell loops or conditionals** (`for f in ...; do ... done`, `while`, `until`, `if [ ... ]`). The command parser bails on them and prompts unconditionally. Issue N separate Bash calls, or use the Grep/Glob tools.
- **Never `cd <path> && git ...`** — `cd` combined with `git` is a hardcoded prompt, because running git in a new directory can execute that directory's hooks. Use `git -C <path> ...` instead.
- **No environment-variable prefixes** (`PORT=4123 yarn dev`, `PATH="..." yarn build`). Only a fixed set of known-safe variables is stripped before permission matching; anything else defeats every allow rule. If a command genuinely needs an env var, `export` it in a separate call or add it to `.claude/settings.json` `env`.
- **Commit messages:** use repeated `-m "..."` flags for multi-paragraph messages, never a heredoc or `$(cat ...)`.
- **Permissions are configured, not accumulated.** Durable rules live in `.claude/settings.json` (tracked, repo-scoped) and `~/.claude/settings.json` (machine-wide). `.claude/settings.local.json` is disposable scratch — never treat "Yes, don't ask again" as configuration.
- **Database commands:** `db:reset` is denied outright. `db:migrate` / `db:push` / `db:seed` prompt every time by design — the founder runs migrations. Author the SQL and journal entry, then stop.

## UI

**Storybook-first:** new reusable UI belongs in `@syn/ui` with a `.stories.tsx` before feature use. App-local composition stays in the app.

## Briefing an agent session

Attach, in order: this file, the ticket spec, the conventions doc, the relevant UX excerpt, and the Drizzle conventions for schema work. State exact file paths before implementing.

## Keeping instructions in sync

- **This file is the only place shared agent guidance is written.** `CLAUDE.md` (root and per-app) must stay a one-line `@AGENTS.md` pointer — never add content there.
- App `AGENTS.md` files add **only** app-local rules (routes, scope, app conventions); they never restate or fork root guidance.
- If a doc moves, run `yarn docs:check-links` and `yarn directory-map` before committing (*both land in INF-11*).
- Superseded docs go to `docs/archive/` — never silently deleted, never edited to look current.
