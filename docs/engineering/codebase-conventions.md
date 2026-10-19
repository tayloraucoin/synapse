---
title: Codebase conventions
description: Read before placing, naming or importing any code, adding a package, or reading an environment variable; the placement, naming and package-graph contract.
layer: engineering
status: adopted
thread: scaffold
role: Mason
date: 2026-10-01
last_reviewed: 2026-10-08
supersedes:
load_when: ui-build, spec
---

# Codebase Conventions

The placement, naming, and package-graph contract. It is written as imperatives so an agent holding only this file and a ticket places code the same way a person would. Where the code and this document disagree, one of them is a defect — fix whichever is wrong, in the same change.

Distilled from the Synapse and Conscious Connections conventions and scaled down to what this repository actually contains. A product cloned from here grows this document as it grows packages; it does not import the larger versions wholesale.

## 0. The rules

1. **Placement is decided by one question: who imports this?** (§1)
2. **Apps import packages. Packages never import apps. Apps never import each other.** Enforced by `yarn lint:boundaries`. (§4)
3. **Never suppress a boundaries error.** An upward import means the boundary is wrong.
4. **Server Components by default.** A client component is a deliberate leaf with `"use client"` on line 1. (§6)
5. **Tokens by name.** No colour literal outside `packages/config/tailwind/preset.css`. (§6)
6. **Environment is read in one place per workspace:** each app's `env.ts` and each package's `scripts/env.ts`. One tier switch picks every tiered key. `apps/web/env.ts` is the first. (§5)
7. **Docs are markdown under `docs/`.** The docs app renders them and owns none. (§7)
8. **Decisions with real alternatives get a ledger line, and a record when the reason needs more than a line.** Records are immutable. (§7)
9. **A seam ships with a default consumer or a README that states its convention.** (record 0010)
10. **Verify before calling it done:** `yarn verify`.

## 1. Placement: who imports this?

- **One consumer → co-locate** it next to that consumer. A component used by one route lives in that route's `_components/`; a helper used by one app lives in that app's `lib/`.
- **Several consumers → the lowest tier that holds them all.** A component is placed by its importer set, one rung at a time. A section is a first-level folder under `app/` (`admin/`, `experimental/`):
  1. one route segment imports it: that segment's `_components/`;
  2. several segments of one section import it (`admin/experiments/` and `admin/experiments/[slug]/`): the `_components/` of the deepest segment that contains every importer;
  3. importers in more than one section, or any file of the app's root segment (`layout`, `page`, `not-found`, …): `apps/<app>/components/<domain>/` (§3);
  4. both apps import it: `@pem/ui`, and only if it imports nothing but `@pem/config` and `@pem/ui`. A domain-aware component fails that test: its presentational part goes to `@pem/ui`, taking data as props, and each app keeps a thin wrapper.
- **Kind never moves a file.** A generic-looking component with one importer stays beside it; a predicted second consumer is not a consumer.
- **Move in the PR that changes the importer set**, up or down. A file whose importers drop back moves down; a file with none is deleted.
- **Moving later is a one-time cost; packaging early is a cost paid on every change.** When unsure, co-locate.
- **The default stack is the exception.** Its packages (§4) are placed by [record 0010](../decisions/records/0010-starter-ships-default-stack.md), not by this count. A product's own code is still placed by it.

Worked examples from this repo: `buttonVariants` is used by `apps/web` (the home page link) and `apps/docs` (the sidebar and the 404 page), so it lives in `@pem/ui`. The markdown renderer is used only by the doc page, so it belongs in `apps/docs/app/[[...slug]]/_components/markdown.tsx`. `ChoiceGroup` looks generic, but its three importers all sit in `experimental/[slug]/review/_components/`, so it stays there; it becomes a `@pem/ui` candidate only when `apps/docs` imports it.

## 2. Top-level structure

```
apps/         deployable Next.js apps — one folder per app
packages/     shared @pem/* workspaces
docs/         the practice and the documentation tree (markdown, source of truth)
tooling/      repo scripts run with Node's type stripping (lint:docs, budget, gen:agents, directory-map)
.claude/      path rules, generated subagents, skills
AGENTS.md     the agent contract; CLAUDE.md imports it and docs/index.md
turbo.json    task graph; per-app turbo.json files extend it ("extends": ["//"])
eslint.config.mjs   boundaries lint only — code-quality lint is per workspace
```

## 3. Apps

Both apps use the App Router and share one internal layout:

```
apps/<app>/
  app/                 routes — page.tsx, layout.tsx, route.ts, … — and their private _components/ and _lib/
    <segment>/_components/   components only that segment's subtree imports (private folder, not a route)
    <segment>/_lib/          non-component modules only that segment imports (private folder)
  components/<domain>/ components imported across sections of this app; chrome in shell/
  lib/                 non-component modules used only by this app
  next.config.ts       agentRules: false · transpilePackages · turbopack root
```

- **`apps/web`** — the demo app that proves the toolkit (`apps/web/AGENTS.md`); in a product cloned from here, the product.
- **`apps/docs`** — a reader for `AGENTS.md`, `docs/**/*.md` and the demo's filled examples. Every page is statically generated from those files at build time; the sidebar groups by the `layer` frontmatter field, `docs/research/` is searchable but not in the sidebar, and frontmatter renders above each page (record 0007). Relative `.md` links are rewritten to routes; links to other repo files render inert with the path in their title. Its `turbo.json` lists the content roots as build inputs, so editing a doc invalidates the cached build.
- **`tooling/`** — not a workspace. Scripts run directly on Node 22 (`node tooling/<script>.ts`), type-checked by `yarn check-types:tooling`. Its consumer is the root scripts, so its shared module stays in `tooling/lib/`. One exception: `apps/web/next.config.ts` imports `tooling/local-dev-origins.ts` (STK-19), a dev-server helper with no runtime reach. The boundaries lint does not cover `tooling/`, so no other app or package file imports from it.

A route's own modules sit beside it in a private `_lib/` folder when nothing else imports them, as its components sit in `_components/`. Every webhook is one folder, `app/api/webhooks/<vendor>/`: `route.ts` reads the request, and `_lib/` holds the verification, dispatch, handlers and ledger binding (`apps/web/app/api/webhooks/stripe/_lib/`), so removing a vendor deletes one folder. A new webhook adds its own reviewer rows in `toolkit.json` for the domain it touches; warden already reaches every one through `**/webhooks/**`. A module other code also imports, such as the Stripe client in `lib/billing/`, stays in `lib/`.

Components climb the §1 ladder: the route's `_components/`, then the section's deepest common `_components/`, then `components/<domain>/`, then `@pem/ui`. There is no `app/_components/` at the app root; what the root segment or several sections import lives in `components/`. Experiment designs in `apps/web/app/experimental/_experiments/<slug>/` are placed by the sandbox's own rule (`specs/web/epics/LAB-experimental-sandbox/technical/placement.md`), not by this ladder.

- **Every file in `components/` sits in a sub-folder** named for a domain noun (`experiments/`, `people/`). App chrome (the shell, providers, the theme toggle) goes in `shell/`.
- **No type-named folders** (`ui/`, `common/`, `shared/`, `forms/`, `misc/`), in `components/` or under `_components/`: they are the catch-alls §8 bans.
- **A route `_components/` may take domain sub-folders**, as `apps/web/app/experimental/[slug]/_components/` does (`gate/`, `pins/`, `pin-list/`).
- **A `lib/` folder groups by subject once it passes 30 files**, tests included: the `lib/` form of the rule above. Each sub-folder is named for the subject that owns its modules, and each module keeps its test beside it. One `shared/` is allowed here, unlike the type-named folders above, because §1's question decides what goes in it: only what two or more sibling folders, or the app's root config files (`env.ts`, `next.config.ts`), import. A runtime split such as `client/` sits beside the subject folders. The split moves files with `git mv`, updates every import and changes no behaviour, and a sub-folder that passes 30 files splits again. Example: `apps/web/lib/sandbox/` (64 files) became `gate/`, `admin/`, `experiment/`, `review/`, `shared/` and `client/`.

## 4. Packages and the import graph

The default stack ([record 0010](../decisions/records/0010-starter-ships-default-stack.md)). Layer order, low → high:

`config → constants, env, brand, observability → validators → db → auth → email, ai → services → api → ui → apps`

A package imports only packages below it, and only along the edges in `packages/config/eslint/boundaries.js`. Every edge not listed there is disallowed. An `@pem/*` import is resolved through its package's `exports`, and one that does not resolve fails the lint. A package that is not built yet has no edges; the ticket that builds it adds them and turns its row to built.

| Package              | Role                                                                                                                                                                                                                                                                       | May import                                                  | Status        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------- |
| `@pem/config`        | ESLint (code quality + boundaries), Prettier, Tailwind tokens, tsconfig bases — exposed as subpath exports                                                                                                                                                                 | nothing                                                     | built         |
| `@pem/constants`     | Shared constants, one file per subject (`README.md`)                                                                                                                                                                                                                       | `config`                                                    | built         |
| `@pem/env`           | The pure per-tier picker (§5)                                                                                                                                                                                                                                              | `config`                                                    | built         |
| `@pem/brand`         | The brand source: name, URLs, contact, assets, the two theme colours, the font (D-STK-9)                                                                                                                                                                                   | `config`                                                    | built         |
| `@pem/observability` | `createLogger` (redacts secret-like keys), the error-reporter seam, the analytics stub                                                                                                                                                                                     | `config`                                                    | built         |
| `@pem/validators`    | Zod schemas, one per operation and one file per domain, read by forms, procedures and services; `fieldErrors`                                                                                                                                                              | `config`                                                    | built         |
| `@pem/db`            | Schema, migrations, policies                                                                                                                                                                                                                                               | `config`, `env`                                             | built         |
| `@pem/auth`          | Server, browser and admin clients, `updateSession`, the request seam (`AuthContext`); client-safe subpaths `config`, `browser`, `redirect`                                                                                                                                 | `config`, `db`, `observability`                             | built         |
| `@pem/email`         | Sending through Resend, the default template; the local tier logs instead of sending                                                                                                                                                                                       | `config`, `env`, `brand`, `observability`                   | built         |
| `@pem/ai`            | The AI SDK and Anthropic: extraction, streamed chat and one-shot generate; versioned prompts, dated model ids, local fixtures                                                                                                                                              | `config`, `env`, `observability`                            | built         |
| `@pem/services`      | Transport-free server logic: each function takes `ctx` (user, role, the RLS-scoped db) and raw input, validates it, and throws only the domain errors in `errors.ts`                                                                                                       | `config`, `validators`, `db`, `ai`                          | built         |
| `@pem/api`           | Transport only (D-STK-8): tRPC procedures in three tiers (public, protected, admin), each body one service call; the context resolves a cookie session or a bearer token to one `ctx.user`; the one domain-error mapper; query hooks at `@pem/api/react`, never in `hooks` | `config`, `observability`, `validators`, `auth`, `services` | built         |
| `@pem/ui`            | Shared web components                                                                                                                                                                                                                                                      | `config`                                                    | built         |
| `@pem/catalog`       | The shelf beside the kit: blocks, ecosystem items, custom lifts; imported by nothing, shown in the workshop (CS-07)                                                                                                                                                        | `config`, `ui`                                              | built (CAT-3) |
| `apps/*`             | Deployable apps                                                                                                                                                                                                                                                            | every package above                                         | built         |

**AI is reached two ways** (D-STK-12): a service takes an `Ai` from its caller, and the app's streaming route in `apps/web/app/api/ai/` calls `@pem/ai` directly. No other app file may import it (the `web-ai-route` element in `boundaries.js`), and only `@pem/ai` imports `ai` and `@ai-sdk/*`.

**Services are transport-free** (D-STK-8): `@pem/services` imports no `next`, `react` or `@trpc/*`, enforced in `boundaries.js` (`TRANSPORT_FREE`). A service never reads `process.env` and never reaches the unscoped database singleton; the transport builds its `ctx` with `createServiceContext` and maps the domain errors to its own shape.

**Each vendor SDK has one owner** (D-STK-16): only that package imports it, and everything else goes through the owner's exports. `SDK_OWNERS` in `boundaries.js` enforces it; `postgres` and `drizzle-kit` belong to `db`, `@supabase/*` to `auth`, `resend` to `email`, `ai` and `@ai-sdk/*` to `ai`.

**README seams.** `utils`, `types` and `hooks` ship as folders holding only a README that states their convention and what turns each into a package (`packages/<name>/README.md`). Each becomes a package with its first module and takes its place in the order then. There is no `lib` or `helpers` package (§8).

**Packages ship TypeScript source.** No build step: each package's `exports` points at `src/`, and each app compiles them through `transpilePackages` in `next.config.ts`.

**Subpath exports, not barrels.** `@pem/ui` exposes one entry per component (`@pem/ui/button`, `@pem/ui/cn`). A new component adds its own `exports` entry. Inside the package, components sit in `primitives/<kind>/<name>/` or `composed/<kind>/<name>/`; the layout is [`packages/ui/AGENTS.md`](../../packages/ui/AGENTS.md), enforced by `yarn check-ui-layout`.

**Adding a package** (only when §1 says so, or a ticket builds a row of the table above):

1. Create `packages/<name>/` with `package.json` (`"name": "@pem/<name>"`), `tsconfig.json` extending a `@pem/config` base, and `eslint.config.mjs`.
2. Add it to `ELEMENTS` and `PACKAGE_IMPORTS` in `packages/config/eslint/boundaries.js`, and to the importing apps' `transpilePackages`.
3. Add a row to the table above, or turn its row to built. A package outside the default stack also needs a ledger line and a record in `docs/decisions/records/`, because the package boundary is a one-way door. The default stack's packages are already recorded in record 0010.

## 5. Environment variables

`apps/web/env.ts` is the first reader (STK-4). The contract (record 0010):

- **One tier switch:** `DATABASE_ENVIRONMENT`, one of `local | staging | production`. The example files set `local`: a Postgres on the developer's own machine, prepared by `yarn db:setup:local`, with no Docker (`docs/runbooks/add/docker-local-database.md` swaps Docker's database in) and no Supabase project. The apps treat unset as `local`; the database scripts refuse unset, naming the variable. It never defaults to production. It says which backing services this process talks to: the database, the Supabase project, the Stripe keys and the site URLs all follow it.
- **Suffix grammar:** a tiered variable ends in `_LOCAL` or `_STAGING`; unsuffixed is production. For example, `EXAMPLE_API_URL_STAGING` is read when the switch is `staging`.
- **Where the code runs is derived, never set.** It comes from the platform's own `VERCEL_ENV`: `production` or `preview` is a deployment, and anything else, unset included, is local. Running locally fixes the site URL to localhost and picks the local Stripe webhook secret.
- **The picker is pure.** `@pem/env` holds the per-tier picker (`@pem/env/pick`), the switch (`/tier`), the key-mode guard (`/key-mode`) and the site URL rule (`/site-url`). It never reads `process.env`; its lint rejects a read.
- **The readers.** Each app's `env.ts` (t3-env, zod) and each package's `scripts/env.ts` are the only modules that read `process.env`, validated with a schema. Everything else imports the resolved `env`.
- Client code reads only `NEXT_PUBLIC_*` names. Secrets never reach a browser bundle: `next.config.ts`'s `env` block holds only the collapsed `NEXT_PUBLIC_*` values, through `nextPublicEnv` (`@pem/env/next-public`), and `yarn check-client-bundle` (in `yarn verify`) builds the app with every server-only variable set to a sentinel and fails if one reaches what the browser receives.
- Every variable is listed in `turbo.json` (`globalEnv` or the task's `env`) so its value in the process environment is part of every task's cache key, and in a root `.env.example`. A value Next reads from the `.env.local` in `apps/web` never reaches that key (the file is loaded inside the task), so `web#build` hashes `apps/web/.env*` through its own `inputs` (`apps/web/turbo.json`); no other task reads an env file, and `turbo.json` hashes none globally (EN-15).

## 6. Components and styling

- **Server Components are the default.** A client component is a leaf: `"use client"` on line 1, as small as the interactivity it owns, placed by its importers like any component (§1). Example: `apps/docs/components/shell/docs-nav.tsx` is client-side only because it reads the current path; the sidebar that builds its tree stays a Server Component.
- **Tokens by name.** Colours, radii, and other design values are custom properties in `packages/config/tailwind/preset.css`, exposed as Tailwind utilities (`bg-background`, `text-muted-foreground`). Raw values anywhere else are a defect.
- **Variants with `cva`, merging with `cn`.** A component that has visual variants exports its `cva` definition alongside it (`buttonVariants`) so a link can wear the style without becoming a button.
- **Each app's `app/globals.css`** imports, in order: `tailwindcss`, `@pem/config/tailwind/preset.css`, `@pem/ui/styles/globals.css` (which registers `@pem/ui` as a Tailwind source).

## 7. Docs and decisions

- **Markdown under `docs/` is the source of truth.** One folder per layer (`decisions/`, `design/`, `engineering/`, …), each file carrying the frontmatter `yarn lint:docs` enforces. The map agents read is [`docs/index.md`](../index.md); the front door for people is [`docs/README.md`](../README.md), and every folder has a `README.md` landing page (PR-12).
- **Names** follow [record 0006](../decisions/records/0006-file-naming-and-filing.md): ASCII kebab-case; a folder's landing page is its `README.md`, and `docs/index.md` is the one `index.md`.
- **Links are relative paths to `.md` files.** They must work raw; the docs app adapts to them, never the reverse.
- **Diagrams are Mermaid, written in the markdown** as a fenced block tagged `mermaid`: GitHub and the docs app both draw it, and the source diffs like text. A diagram earns its place where it replaces prose that is hard to follow, never beside prose that already reads. Folder trees stay as text in a plain code block. Image files are only for what cannot be code, such as screenshots; none exist yet, and diagrams never get an image export or a `public/` folder.
- **Decisions** (CF-06): one line in [`ledger.md`](../decisions/ledger.md); a [record](../decisions/records/) from [`decision.template.md`](../decisions/decision.template.md) when the reason needs more than a line, immutable once accepted, reversed only by a new record that names it in `supersedes`; amendments to files in [`changelog.md`](../decisions/changelog.md).

## 8. Naming

| Kind               | Convention                                                                  | Example                                   |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------- |
| Files and folders  | kebab-case                                                                  | `docs-nav.tsx`, `codebase-conventions.md` |
| Components         | PascalCase, named export                                                    | `export function NavLink`                 |
| Default exports    | Only where Next requires them (`page`, `layout`, `not-found`, config files) | `export default function DocPage`         |
| Functions          | verb-first camelCase                                                        | `getAllDocs`, `resolveDocLink`            |
| Workspace packages | `@pem/<name>`                                                               | `@pem/ui`                                 |

A name that needs a comment to explain it is the wrong name. No catch-all modules (`helpers`, `misc`, `utils.ts` at an app root).
