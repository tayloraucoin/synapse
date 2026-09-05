# Synapse — Agent Instructions

**This file is the canonical instruction spine for every agent (Claude Code, Cursor, any other).** `CLAUDE.md` files are one-line `@AGENTS.md` pointers — shared guidance is edited **only here** (see "Keeping instructions in sync" at the bottom).

## Start here (turn one)

1. **What this is:** a Yarn 4 + Turborepo monorepo — the Synapse habit-tracker PWA (`apps/web`), an Expo seam (`apps/mobile`, README only), and `@syn/*` capability packages. The conventions are Conscious Connections', copied and re-scoped — never imported.
2. **Read before coding, in order:** this file → `docs/specs/infrastructure/README.md` → your ticket spec → the UX source it cites in `docs/ux/`.
3. **Specs live in `docs/specs/`:** the current queue is `docs/specs/infrastructure/`. Process + kickoff contract: [`docs/specs/infrastructure/README.md`](docs/specs/infrastructure/README.md).
4. **Orient in the docs tree** via [`docs/README.md`](docs/README.md) (one line per document) and [`docs/architecture/directory-map.md`](docs/architecture/directory-map.md) (the generated tree, with a note on every load-bearing file).
5. **Verify work** the way CI does: `yarn lint && yarn lint:boundaries && yarn check-types && yarn build` (see Commands). There is **no test suite** — do not write tests during slices.
6. **Done means:** acceptance criteria met · verify commands pass · the spec's `Status:` line flipped · `PROGRESS.md` ticked · one `DEVIATIONS.md` line per divergence.
7. **Never re-litigate** the official UX spec §0.3 rulings or the v2 handoff §10/§12 decisions; on-disk reality + `DEVIATIONS.md` beat any stale spec string.
8. **Hard guardrails** below are non-negotiable — read them before your first write.

## Source precedence

When docs disagree, follow this order:

1. **Product behaviour** → `docs/ux/habit_tracker_official_ux_spec_v1.md` (its **§0.3 rulings are signed**), then the three epic documents and `docs/ux/synapse_navigation_and_system_ux_architecture.md` for their own screens, then `docs/ux/synapse_ui_component_needs_and_handoff_v2.md` for component contracts.
2. **Architecture & placement** → [`docs/architecture/codebase-conventions.md`](docs/architecture/codebase-conventions.md) (locked). Stack choices: [`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md).
3. **Domain guides** → [`docs/ai-guides/`](docs/ai-guides/) govern their domain (tokens, typography, classnames, components, copy, db/RLS, tRPC) and sit **below** the conventions doc but **above** ad-hoc judgment.
4. **App-specific rules** → the nearest [`AGENTS.md`](apps/web/AGENTS.md). **Wins on conflict** with the conventions doc for that app (route topology, scope).
5. **Ticket rulings** → each ticket's "Rulings this slice makes", summarised in [`TECHNICAL-DECISIONS.md`](docs/specs/infrastructure/TECHNICAL-DECISIONS.md).
6. **Shipped-work amendments** → [`DEVIATIONS.md`](docs/specs/infrastructure/DEVIATIONS.md) + `TECHNICAL-DECISIONS.md`. On-disk reality + these logs override any stale spec text.

## Hard guardrails

- **Never scaffold `apps/mobile/`** — it is a deliberate empty seam (README only).
- **`DEVIATIONS.md` and `TECHNICAL-DECISIONS.md` are append-only** — never edit or delete prior entries.
- **Migrations:** append-only under `packages/db/migrations/`; a human reviews the SQL before `db:migrate` is run against any hosted database. Never run `db:reset` or `db:push` against staging or production.
- **RLS is deny-by-default and user-private.** There are no admin-read policies on user data. Every user-scoped query runs through `ctx.rls.execute()`, never the singleton `db`.
- **Secrets never reach a browser bundle.** Server env is read through one `env.ts` per app; client code reads only `NEXT_PUBLIC_*` literals.
- **Never hand-edit the generated tree** in `docs/architecture/directory-map.md` — regenerate via `yarn directory-map`. If a new load-bearing file needs a note, add it to the `ANNOTATIONS` map in `scripts/generate-directory-map.mjs` first.
- **No git branches or PRs** as part of slice work; commit to the working branch with clear messages.
- **No tests during slices** — tests are a separate finalization pass after human QA.
- **Phase 1 has no AI, no billing, no marketing site, no social surface.** Seams are recorded, not scaffolded.
- **Product non-negotiables** (no streaks or scores, no numbers about the day on the tabs, colour never alone, nothing red on the tabs, no second person, notifications that never report a miss) are listed in [`apps/web/AGENTS.md`](apps/web/AGENTS.md) and bind every change to the app. They come from official spec §2.4 and §10.4.

## Commands

Setup: Node **22** (`.nvmrc`), Yarn **4.13.0** (`corepack enable && yarn install`). Env surface: [`.env.example`](.env.example); tiers and checklists in [`docs/developer-guides/environments.md`](docs/developer-guides/environments.md).

| Task | Command |
|------|---------|
| Verify (matches CI) | `yarn lint && yarn lint:boundaries && yarn check-types && yarn build` |
| Dev server | `yarn dev` (all) · `yarn web:dev` · `yarn web:dev:local` (LAN/phone) |
| Per-app checks | `yarn web:build` / `web:lint` / `web:typecheck` (same for `ui:*`) |
| Database | `yarn db:generate` · `db:migrate` · `db:push` · `db:setup` · `db:reset` · `db:seed` · `db:seed-users` · `db:schema-reference` |
| Storybook (`@syn/ui`) | `yarn ui:storybook` |
| Docs upkeep | `yarn directory-map` (regen the tree) · `yarn docs:check-links` (verify every markdown link) |
| Formatting | `yarn format` |

## Key docs (`docs/`)

Full index, one line per document: [`docs/README.md`](docs/README.md).

| Path | What |
|------|------|
| [`docs/ux/habit_tracker_official_ux_spec_v1.md`](docs/ux/habit_tracker_official_ux_spec_v1.md) | Product behaviour — the authority. **§0.3 rulings are signed.** §9 is the brand, §10 the copy. |
| [`docs/ux/`](docs/ux/) | The three epic documents, the cross-cutting document, and the v2 component handoff. Read the one that owns your screen. |
| [`docs/architecture/codebase-conventions.md`](docs/architecture/codebase-conventions.md) | Architecture & placement — the locked contract. |
| [`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md) | Canonical stack choices, pinned versions, and what is deliberately absent. |
| [`docs/architecture/directory-map.md`](docs/architecture/directory-map.md) | The full tree, generated (`yarn directory-map`). |
| [`docs/architecture/drizzle-orm-conventions.md`](docs/architecture/drizzle-orm-conventions.md) | The only Drizzle syntax permitted for schema work. |
| [`docs/ai-guides/`](docs/ai-guides/) | Domain conventions — tokens, typography, classnames, components, copy, db/RLS, tRPC. Index: [README](docs/ai-guides/README.md). |
| [`docs/developer-guides/`](docs/developer-guides/) | Environments, database setup, migrations, RLS, authentication. |
| [`docs/specs/infrastructure/`](docs/specs/infrastructure/) | The foundation track + `PROGRESS` / `DEVIATIONS` / `TECHNICAL-DECISIONS`. |
| [`packages/db/SCHEMA_REFERENCE.md`](packages/db/SCHEMA_REFERENCE.md) | Real column names, generated from the schema. Do not guess one. |
| [`docs/roles/`](docs/roles/) | Role prompts, and how to write one. |

### Domain guides — read before that kind of work

| Kind of work | Guide |
|--------------|-------|
| Which token to type for a colour, size, or duration | [`brand-tokens.md`](docs/ai-guides/brand-tokens.md) |
| Which typography component | [`typography-guidelines.md`](docs/ai-guides/typography-guidelines.md) |
| `className` / Tailwind patterns | [`classnames.md`](docs/ai-guides/classnames.md) |
| Component anatomy, props, stories | [`component-guidelines.md`](docs/ai-guides/component-guidelines.md) |
| Anything a person will read | [`copy-conventions.md`](docs/ai-guides/copy-conventions.md) |
| Schema & RLS authoring | [`db-and-rls-authoring.md`](docs/ai-guides/db-and-rls-authoring.md) + [`drizzle-orm-conventions.md`](docs/architecture/drizzle-orm-conventions.md) |
| Procedures, context, errors | [`trpc-foundation-patterns.md`](docs/ai-guides/trpc-foundation-patterns.md) |
| Auth, sessions, sign-in flows | [`authentication.md`](docs/developer-guides/authentication.md) |
| Deploying, tiers, secrets | [`environments.md`](docs/developer-guides/environments.md) |

## Monorepo map

### `apps/*`

| Path | What |
|------|------|
| [`apps/web/`](apps/web/) | The Synapse PWA — the only product surface in Phase 1. App-local rules: [`apps/web/AGENTS.md`](apps/web/AGENTS.md). |
| `apps/mobile/` | **Empty Expo seam** — README only. Do not scaffold. |

### `packages/*`

| Package | What |
|---------|------|
| `@syn/config` | ESLint, Prettier, the Tailwind token preset, shared tsconfigs. |
| `@syn/types` | Pure TypeScript types — the schema unions, the UI-state unions, the view models. |
| `@syn/constants` | Shared runtime values — storage keys, validation bounds, motion and undo windows. |
| `@syn/observability` | Dev logging. Nothing a person wrote ever passes through it. |
| `@syn/utils` | Pure helpers, grouped by domain. Every time formatter takes an explicit `timeZone`. |
| `@syn/validators` | Zod schemas for forms and tRPC — one definition, both consumers. |
| `@syn/db` | Drizzle schema, client, migrations, the RLS bridge. Rules: [`packages/db/AGENTS.md`](packages/db/AGENTS.md). |
| `@syn/auth` | Supabase Auth clients, session refresh, the AuthContext bridge. |
| `@syn/api` | tRPC routers, context, services — the typed contract. |
| `@syn/hooks` | Platform-pure headless hooks (web + the future Expo app). |
| `@syn/ui` | The web component library — Storybook-first, and the one web-only package. Rules: [`packages/ui/AGENTS.md`](packages/ui/AGENTS.md). |

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
5. **Refresh the directory map** — if the slice added, moved, or removed files, run `yarn directory-map`.
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

**Audit before you build.** `packages/ui/src/primitives/` already holds the full shadcn set, re-slotted; the v2 handoff §5 already has the contract for most composites. Building a second one is how a design system forks.

**Storybook-first:** new reusable UI belongs in `@syn/ui` with a `.stories.tsx` before any feature uses it. App-local composition stays in the app. `yarn ui:storybook`.

**Tokens by name; no hex outside `packages/config/tailwind/preset.css`.** See [`brand-tokens.md`](docs/ai-guides/brand-tokens.md).

## Briefing an agent session

Attach, in order: this file (or the nearest app `AGENTS.md`), the ticket spec, [`codebase-conventions.md`](docs/architecture/codebase-conventions.md), the relevant UX excerpt, and — for schema work — [`drizzle-orm-conventions.md`](docs/architecture/drizzle-orm-conventions.md).

**State the exact file paths before implementing.** Placement is decided by one question — who imports this? — and answering it first is what keeps the tree legible. The kickoff contract for a spec track is in its own README; the general shape is in [`docs/specs/spec-system-guide.md`](docs/specs/spec-system-guide.md).

## Keeping instructions in sync

- **This file is the only place shared agent guidance is written.** `CLAUDE.md` (root and per-app) must stay a one-line `@AGENTS.md` pointer — never add content there.
- App `AGENTS.md` files add **only** app-local rules (routes, scope, app conventions); they never restate or fork root guidance.
- If a doc moves, run `yarn docs:check-links` and `yarn directory-map` before committing.
- Superseded docs go to `docs/archive/` — never silently deleted, never edited to look current.
