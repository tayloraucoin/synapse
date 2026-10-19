# Synapse

A habit-tracking PWA built on the promise that **only you can see your data, not the people who built this**. Web now, Expo later. It is built the practice's way: Product Engineering Mastery (PEM), adopted in place ([`docs/pem/`](docs/pem/README.md)).

## Where to start

| You are                      | Open                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| A person                     | [`docs/README.md`](docs/README.md), organised by the question you arrive with      |
| Asking how the layers relate | [`docs/index.md`](docs/index.md), the map agents read                              |
| Asking what is being built   | [`specs/_status.md`](specs/_status.md), the live state of every ticket             |
| An AI agent                  | [`AGENTS.md`](AGENTS.md), the contract; `CLAUDE.md` imports it and `docs/index.md` |

This README only gets you running.

## Prerequisites

| Tool | Version | Set up                                 |
| ---- | ------- | -------------------------------------- |
| Node | 22      | `.nvmrc` (`nvm use`)                   |
| Yarn | 4.13.0  | `corepack enable`, then `yarn install` |

`yarn install` refuses to run if the `packageManager` field and your global Yarn disagree. The fix is `corepack enable`, not a global Yarn install. Environment variables: [`.env.example`](.env.example).

## Run it

```sh
yarn install
yarn doctor       # is this machine ready? names the fix for anything broken
yarn web:dev      # the app, at http://localhost:3000
yarn docs:dev     # docs/ and specs/ as a site, at http://localhost:3001
yarn verify       # everything CI runs
```

- **On a phone:** `yarn web:dev:local` binds the app to every interface and prints its LAN URLs.
- **Database:** the commands are wired at the root and target `@syn/db`; see [`packages/db/SETUP.md`](packages/db/SETUP.md). An agent never runs one against a hosted tier; it authors the SQL and a person applies it.
- **Storybook:** `yarn ui:storybook` is the design system's workshop.

## Layout

| Path                | What                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `apps/web`          | The Synapse PWA, the only product surface in Phase 1                                      |
| `apps/docs`         | Renders `docs/` and `specs/` in the browser                                               |
| `apps/mobile`       | A seam: README only, Expo in Phase 1.5                                                    |
| `packages/config`   | `@syn/config` — ESLint (code, boundaries), Prettier, the Tailwind preset, tsconfig bases  |
| `packages/types`, `constants`, `utils`, `validators`, `observability` | Platform-pure capability layers         |
| `packages/db`       | `@syn/db` — Drizzle schema, client, migrations, the RLS bridge                            |
| `packages/auth`     | `@syn/auth` — Supabase Auth clients, session refresh                                      |
| `packages/api`, `packages/hooks` | `@syn/api` (tRPC routers and services), `@syn/hooks` (platform-pure hooks)   |
| `packages/ui`       | `@syn/ui` — shared web components (Radix + Tailwind, Storybook-first)                     |
| `docs/`             | The practice and Synapse's own docs. Start at [`docs/index.md`](docs/index.md)            |
| `specs/`            | Tickets, contracts and the living UX truth (`specs/web/ux/`)                              |
| `tooling/`          | The checks `yarn verify` runs, the hooks in `.claude/settings.json`, and `yarn doctor`    |
| `.claude/`          | Path rules, generated subagents (`agents/`, never edited by hand), skills                 |

Phase 1 has no AI package, no billing, no marketing site.
