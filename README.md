# Synapse

Yarn 4 + Turborepo monorepo for Synapse — a habit-tracking PWA built on the promise that **only you can see your data, not the people who built this**. Web now, Expo later.

**For AI agents:** [`AGENTS.md`](AGENTS.md) is the canonical instruction spine — start there. (`CLAUDE.md` is a pointer to it.)

> **Foundation in progress.** The repository is being built out ticket by ticket from [`docs/specs/infrastructure/`](docs/specs/infrastructure/). Rows below marked *(INF-n)* do not exist yet; the ticket named is the one that lands them. Current state: INF-1 — the monorepo shape, the toolchain pins, the import-boundary lint, and one placeholder page.

## Essential docs

| Doc | Purpose |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | Agent spine — precedence, guardrails, workflow |
| [`docs/specs/infrastructure/README.md`](docs/specs/infrastructure/README.md) | **The foundation track** — process contract, precedence, locked scope, non-negotiables |
| [`docs/specs/infrastructure/00-build-order.md`](docs/specs/infrastructure/00-build-order.md) | Ordered build queue and critical path |
| [`docs/ux/habit_tracker_official_ux_spec_v1.md`](docs/ux/habit_tracker_official_ux_spec_v1.md) | Product behaviour source of truth (§0.3 rulings are signed) |
| [`docs/ux/`](docs/ux/) | Epic and cross-cutting UX architecture, component handoff |
| `docs/architecture/codebase-conventions.md` | The placement/naming/package-graph contract *(INF-11)* |
| `docs/architecture/tech-stack.md` | Canonical stack choices + pinned versions *(INF-11)* |
| `docs/developer-guides/` | Database setup, migrations, RLS, authentication *(INF-11)* |

## Repository layout

### Apps (`apps/`)

| App | Status | Role |
| --- | --- | --- |
| `web` | Active | The Synapse PWA — the only product surface in Phase 1 |
| `mobile` | Seam only | README placeholder — Expo in Phase 1.5 |

### Packages (`packages/`)

Shared libraries use the `@syn/*` scope.

| Package | Role |
| --- | --- |
| `@syn/config` | ESLint, Prettier, Tailwind preset, TSConfig bases (subpath exports) |
| `@syn/types`, `@syn/constants`, `@syn/utils`, `@syn/validators`, `@syn/observability` | Platform-pure capability layers *(INF-2)* |
| `@syn/ui` | Shared web components (Radix + Tailwind, Storybook-first) *(INF-3, INF-4)* |
| `@syn/db` | Drizzle schema, client, migrations, RLS *(INF-5)* |
| `@syn/auth` | Supabase Auth helpers *(INF-6)* |
| `@syn/api`, `@syn/hooks` | tRPC routers + services, shared headless hooks *(INF-8)* |

Phase 1 has no AI package, no billing, no marketing site.

## Prerequisites

- **Node 22** — use `.nvmrc` (`nvm use` or equivalent)
- **Yarn 4.13.0** — `corepack enable`, then `yarn install`

`yarn install` refuses to run if the `packageManager` field and your global Yarn disagree. The fix is `corepack enable`, not a global Yarn install.

## Commands

From the repo root:

```sh
yarn install
yarn dev              # all workspaces in dev mode
yarn web:dev          # the web app on :3000
yarn build            # build all workspaces
yarn lint             # code-quality lint, per package
yarn lint:boundaries  # import-boundary lint, from the root
yarn check-types      # tsc --noEmit, per package
yarn format           # prettier --write
```

Verify the way CI does, in this order:

```sh
yarn lint && yarn lint:boundaries && yarn check-types && yarn build
```

Database commands (`yarn db:generate`, `db:migrate`, `db:push`, `db:setup`, `db:reset`, `db:seed`, `db:seed-users`, `db:schema-reference`) are wired at the root and target `@syn/db` *(INF-5)*. Storybook (`yarn ui:storybook`) targets `@syn/ui` *(INF-3)*.

## Package alias

Workspace packages are referenced as `@syn/<name>` and resolved by Yarn workspaces — never by relative path across a package boundary. The import graph is layered and acyclic, enforced by `yarn lint:boundaries`:

`config` → `constants` / `types` / `observability` → `utils` → `validators` → `db` → `auth` → `api` → `hooks` → `ui` → `apps`
