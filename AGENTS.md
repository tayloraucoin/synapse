# Synapse — agent contract

The canonical instructions for every agent (Claude Code, Cursor, Codex). `CLAUDE.md` is a shim that imports this file and `docs/index.md`. Shared guidance is written only here.

## Start here

1. **What this is:** a Yarn 4 + Turborepo monorepo — the Synapse habit-tracker PWA (`apps/web`), an Expo seam (`apps/mobile`, README only), and `@syn/*` capability packages. It works the practice's way since record 0001 (toolkit `62d344b`).
2. **Current work:** `specs/_status.md`; the migration's gaps are drafted in `specs/_shared/epics/MIG-migration/`.
3. **Read [`docs/index.md`](docs/index.md) first, every session.** It is the map and the precedence ladder.
4. **Before any UI work, read [`docs/design/canon.md`](docs/design/canon.md)**; `.claude/rules/ui.md` fires on UI files.
5. **State the exact file paths before implementing.** Placement is decided by one question, who imports this ([`docs/architecture/codebase-conventions.md`](docs/architecture/codebase-conventions.md)).
6. **Verify the way CI does:** `yarn verify`.

## Work loop

- **Work starts at the prompt builder** ([`docs/workflows/prompt-builder.md`](docs/workflows/prompt-builder.md), `tk-prompt`): it settles the track, cast, QA level, pace, involvement and branch with the operator, then prints the prompt. Handed work with no prompt and no ticket, run the builder first; tiny work takes its fast lane.
- **The track sets the path** ([`docs/workflows/tracks/`](docs/workflows/tracks/README.md)). A ticket and contract exist when the track or the operator calls for one (`yarn contract:init`); otherwise the prompt is the brief.
- **The QA level sets proof, review and paperwork** ([`docs/workflows/qa-levels.md`](docs/workflows/qa-levels.md)). Q0: nothing extra. Q1: run the criteria; verify at the close. Q2: plus one fresh-context reviewer, findings in the thread. Q3 (money, auth, schema, personal data, agent permissions): proofs checked for staleness before a merge, the specialists the operator confirmed, review files kept. Only tooling writes `results.json`. Flag a critical path below Q3 once; raise a named part on request.
- **Take the work to done yourself** (`tk-batch`), one ticket per thread: build; the operator looks; on "harden", prove, review, verify once; report in six lines at most. You run every command and decide what is reversible; stop only as the chosen involvement says. The operator gets what a person alone can do: a choice that cannot be undone, money, growing scope, a credential, a protected file, the merge. Never hand the operator a command to run.
- **Stay in your own work.** Never re-prove, re-review or commit another ticket's files; a commit to a shared file reopens nothing.
- **Never filed:** prompt files, evidence logs, review files below Q3.
- **`specs/<app>/ux/` is the living truth** of how the app works now. Work that changes behaviour updates it in the same change; an epic proposes in its own `ux/` and shipping promotes it.

## Commands

Setup: Node **22** (`.nvmrc`), Yarn **4.13.0** (`corepack enable && yarn install`). Env surface: [`.env.example`](.env.example); tiers and checklists in [`docs/developer-guides/environments.md`](docs/developer-guides/environments.md).

| Task                | Command                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| Verify (matches CI) | `yarn verify` · `yarn verify:fast` (changed files)                                                          |
| Dev server          | `yarn dev` (all) · `yarn web:dev` · `yarn web:dev:local` (LAN/phone)                                        |
| Per-app checks      | `yarn web:build` / `web:lint` / `web:typecheck` (same for `ui:*`)                                           |
| Database            | `yarn db:generate` · `db:migrate` · `db:push` · `db:setup` · `db:reset` · `db:seed` · `db:schema-reference` |
| Storybook           | `yarn ui:storybook`                                                                                         |
| Tickets and status  | `yarn contract:init` · `yarn status` · `yarn check-specs`                                                   |
| Docs upkeep         | `yarn directory-map` · `yarn docs:check-links` · `yarn budget` · `yarn gen:agents`                          |
| Formatting          | `yarn format`                                                                                               |

## UI vocabulary (the constraint)

Only `@syn/ui` components and the preset's tokens (`.claude/rules/house-ui.md`). The slop tells are banned by ID (canon §2, A-01 to A-20); every reachable state is designed (C-P08).

## Import boundaries

Enforced by `yarn lint:boundaries` (root `eslint.config.mjs` + `packages/config/eslint/boundaries.js`). Internal package-layer edges plus restricted third-party deps (`drizzle-orm`/`postgres`/`drizzle-kit` → data layers; `web-push` → `@syn/api`; `frimousse` → `@syn/ui`).

**Platform split:** logic shared and platform-pure; rendering platform-specific. `@syn/ui` is the one web-only package; headless hooks are shared in `@syn/hooks`, web-only hooks live in `apps/web/lib/hooks/`. This is what makes the future Expo app a re-skin rather than a rewrite.

- **Apps → packages only.** No `apps/*` → `apps/*` imports.
- **Page data:** the tRPC server caller (`apps/web/lib/trpc/server.ts`). Never raw `@syn/db` in pages or client components.
- **Server Components** are the default. Client leaves: `"use client"` on **line 1**, in `_components/`. No `.client.tsx` suffix.
- **Env:** one `env.ts` per app — the only `process.env` reader.
- **Never suppress a boundaries error.** If you need an upward import, the boundary is wrong; refactor it or flag it.

Layer order (low → high): `config` → `constants` / `types` / `observability` → `utils` → `validators` → `db` → `auth` → `api` → `hooks` → `ui` → `apps`.

## House rules

Carried verbatim from the instructions before the practice (record 0001).

- **Never re-litigate** the official UX spec §0.3 rulings or the v2 handoff §10/§12 decisions; on-disk reality + `DEVIATIONS.md` beat any stale spec string.
- **Never scaffold `apps/mobile/`** — it is a deliberate empty seam (README only).
- **Migrations:** append-only under `packages/db/migrations/`; a human reviews the SQL before `db:migrate` is run against any hosted database. Never run `db:reset` or `db:push` against staging or production.
- **RLS is deny-by-default and user-private.** There are no admin-read policies on user data. Every user-scoped query runs through `ctx.rls.execute()`, never the singleton `db`.
- **Secrets never reach a browser bundle.** Server env is read through one `env.ts` per app; client code reads only `NEXT_PUBLIC_*` literals.
- **Phase 1 has no AI, no billing, no marketing site, no social surface.** Seams are recorded, not scaffolded.
- **Product non-negotiables** (no streaks or scores, no numbers about the day on the tabs, colour never alone, nothing red on the tabs, no second person, notifications that never report a miss) are listed in [`apps/web/docs/product-rules.md`](apps/web/docs/product-rules.md) and bind every change to the app. They come from official spec §2.4 and §10.4.
- **Package manager:** Yarn Berry **v4** (`packageManager: yarn@4.13.0`). Use **`yarn`**, never `npm` or `pnpm`.
- **Next.js 16 session refresh:** `apps/*/proxy.ts` calls `@syn/auth` `updateSession`. **Not `middleware.ts`.**
- If a doc moves, run `yarn docs:check-links` and `yarn directory-map` before committing.
- Superseded docs go to `docs/archive/` — never silently deleted, never edited to look current.

## Keeping instructions in sync

- `CLAUDE.md` holds only imports and Claude-only lines. App-level files (`apps/web/AGENTS.md`, `packages/*/AGENTS.md`) add only local rules and never restate this one.
