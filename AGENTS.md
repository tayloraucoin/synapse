# Synapse — agent contract

The canonical instructions for every agent (Claude Code, Cursor, Codex). `CLAUDE.md` is a shim that imports this file and `docs/index.md`. Shared guidance is written only here.

## Start here

1. **What this is:** the Synapse habit-tracker PWA (`apps/web`), the docs reader (`apps/docs`), an Expo seam (`apps/mobile`, README only) and `@syn/*` packages, worked the practice's way (PEM `62d344b`; adjustments in [`docs/pem/`](docs/pem/README.md)).
2. **Current work:** `specs/_status.md`.
3. **Read [`docs/index.md`](docs/index.md) first, every session.** It is the map: the layers, the precedence ladder, what loads always, by path, by trigger and never, and the token budget.
4. **Before any UI work, read [`docs/design/canon.md`](docs/design/canon.md)** and the design layer, `apps/web/docs/design/`. In Claude Code, `.claude/rules/ui.md` also fires on UI files.
5. **State the exact file paths before implementing.** Placement is decided by one question, who imports this ([`docs/engineering/codebase-conventions.md`](docs/engineering/codebase-conventions.md) §1), with Synapse's adjustments under Engineering boundaries.
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

Node **22** (`.nvmrc`), Yarn **4.13.0** (`corepack enable && yarn install`); use `yarn`, never `npm` or `pnpm`. Env surface: [`.env.example`](.env.example).

| Task | Command |
| --- | --- |
| Verify (matches CI) | `yarn verify` · `yarn verify:fast` (changed files) |
| Dev servers | `yarn dev` · `yarn web:dev` (:3000) · `yarn web:dev:local` (LAN) · `yarn docs:dev` (:3001) |
| Database | `yarn db:generate` · `db:migrate` · `db:push` · `db:setup` · `db:reset` · `db:seed` |
| Tickets, docs | `yarn contract:init` · `status` · `check-specs` · `budget` · `gen:agents` · `directory-map` |
| Code checks | `yarn lint` · `lint:boundaries` · `check-types` · `build` · `format` · `ui:storybook` |

## UI vocabulary (the constraint)

- **Only components from `@syn/ui`** (and a product's own primitives once ruled in its `components.md`).
- **Only tokens** from `packages/config/tailwind/preset.css`: no raw color, spacing, radius, shadow, font or duration values.
- **The slop tells are banned by ID** — canon §2, A-01 to A-20. Cite the ID in prompts and reviews.
- Every reachable state is designed and reachable by `?state=` (canon C-P08).

## Engineering boundaries

- **Apps import packages; packages never import apps; apps never import each other.** Enforced by `yarn lint:boundaries` (`packages/config/eslint/boundaries.js`, with the layer order and restricted third-party deps). Never suppress a boundaries error; an upward import means the boundary is wrong.
- Workspace packages are imported as `@syn/<name>`, never by relative path.
- Server Components by default; a client leaf has `"use client"` on line 1, placed by its importers.
- Each workspace's `env.ts` is its only `process.env` reader.
- **Synapse's adjustments to the conventions** (until recorded): services live in `@syn/api` (`packages/api/src/services/`), not a services package; `@syn/ui` may import `@syn/hooks`; `@syn/ui` keeps its barrel beside the subpaths; page data comes through the tRPC server caller (`apps/web/lib/trpc/server.ts`), never raw `@syn/db` in pages or client components.
- **Platform split:** logic shared and platform-pure; rendering platform-specific. `@syn/ui` is the one web-only package; headless hooks are shared in `@syn/hooks`, web-only hooks live in `apps/web/lib/hooks/`.

## House rules (record 0001)

- **Never re-litigate** the official UX spec §0.3 rulings or the v2 handoff §10/§12 decisions; on-disk reality + `DEVIATIONS.md` beat any stale spec string.
- **Never scaffold `apps/mobile/`** — it is a deliberate empty seam (README only).
- **Migrations:** append-only under `packages/db/migrations/`; a human reviews the SQL before `db:migrate` is run against any hosted database. Never run `db:reset` or `db:push` against staging or production.
- **RLS is deny-by-default and user-private.** There are no admin-read policies on user data. Every user-scoped query runs through `ctx.rls.execute()`, never the singleton `db`.
- **Secrets never reach a browser bundle.** Server env is read through one `env.ts` per app; client code reads only `NEXT_PUBLIC_*` literals.
- **Phase 1 has no AI, no billing, no marketing site, no social surface.** Seams are recorded, not scaffolded.
- **Product non-negotiables** (no streaks or scores, no numbers about the day on the tabs, colour never alone, nothing red on the tabs, no second person, notifications that never report a miss) are listed in [`apps/web/docs/product-rules.md`](apps/web/docs/product-rules.md) and bind every change to the app. They come from official spec §2.4 and §10.4.
- If a doc moves, run `yarn docs:check-links` and `yarn directory-map` before committing.
- Superseded docs go to `docs/archive/` — never silently deleted, never edited to look current.

## Keeping instructions in sync

- `CLAUDE.md` holds only imports and Claude-only lines. App-level files (`apps/web/AGENTS.md`, `packages/*/AGENTS.md`) add only app-local rules and never restate this one.
