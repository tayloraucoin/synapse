# INF-1 — Monorepo re-base: from the `create-turbo` scaffold to CC's shape

**Epic:** INF — Infrastructure (the system foundation) · **Phase 0** · Size: L
**Slice type:** Repo-shape and toolchain — no product code. The failure class is silent drift: a scope, a version, or a lint rule that differs from CC and forces every later ticket to carry the difference.
**Mason review:** the version pins in "Rulings" — confirm or counter-propose in `TECHNICAL-DECISIONS.md` before INF-2 starts.

**Status:** Complete (2026-09-04)

> **Mason — pins review.** The scaffold arrived on TypeScript 7.0.2, Node ≥24, ESLint 10, Prettier 3.9.6. This ticket pins the CC-validated set instead (TS 5.9.2, Node 22, ESLint 9, Prettier 3.7). Review the reasoning; if TS 7 is wanted, say so before INF-2, because `typescript-eslint`, `drizzle-kit`, and Storybook 8 are only known-good against 5.9 in CC.

---

## Outcome

The repo is a Yarn 4 Turborepo shaped exactly like CC: `apps/web` (the product), `apps/mobile` (a README seam), `packages/config` (eslint, prettier, tailwind preset, tsconfig bases as subpath exports), and the `@syn/*` scope everywhere. `yarn install`, `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, and `yarn build` all pass on a tree that contains one placeholder page. Root `AGENTS.md`, `README.md`, and `CLAUDE.md` exist as skeletons so the next ticket's agent has a spine. No package under `packages/` other than `config` exists yet — INF-2 creates the leaves; nothing here anticipates them beyond the boundaries rule.

## Why / intent

- **README § Locked scope** — Turborepo + Yarn 4, `@syn/*`, `apps/web` + `apps/mobile` seam. CC `codebase-conventions.md` §2 (top-level structure), §4.11 (`packages/config`), §7 (naming).
- **CC `tech-stack.md`** — the stack contract; every version below is CC's unless the ruling says otherwise.
- **What this slice is NOT (binding):** it does not create `packages/{types,constants,…}` (INF-2), does not write the token file (INF-3), does not add Next config beyond what compiles (INF-7). It removes `apps/docs` outright — there is no docs app in CC; documentation lives in `docs/`.
- **Ground truth (on disk today):** `apps/web`, `apps/docs`, `packages/ui` (three demo components), `packages/eslint-config`, `packages/typescript-config`, all `@repo/*`, root `package.json` with `devEngines.packageManager` yarn 4.13.0 and `engines.node >= 24`. A single commit, `7826c63 Initial commit from create-turbo`.

**Rulings this slice makes (labelled, logged):**

- **Scope is `@syn/*`.** CC uses `@cc/*` (brand initials); Synapse uses the same grammar. `@repo/*` is the scaffold's placeholder and is removed. Logged.
- **Pins follow CC, not the scaffold:** TypeScript `5.9.2` (exact), Node `22` (`.nvmrc`, `engines.node >= 22`), ESLint `^9.39`, `typescript-eslint ^8.50`, Prettier `^3.7` + `@ianvs/prettier-plugin-sort-imports ^4.7`, Turbo `^2.9` (the scaffold's `^2.10.12` satisfies this and stays), Yarn `4.13.0`. Reason: CC's `drizzle-kit 0.31.10`, `typescript-eslint`, and Storybook 8 are validated against TS 5.9; TS 7's compiler is a one-way door for `drizzle-kit`'s TS parsing and for `@storybook/react-vite`, and nothing in Synapse needs it. `[REVISIT: when CC bumps TS, Synapse follows in the same week.]` Logged.
- **`packages/config` replaces `packages/eslint-config` + `packages/typescript-config`.** One config package with subpath exports (`@syn/config/eslint/*`, `@syn/config/prettier`, `@syn/config/tailwind/preset.css`, `@syn/config/tsconfig/*`), exactly CC `packages/config/package.json`. Logged.
- **`apps/docs` is deleted, `apps/mobile` is a README seam.** CC has no docs app; CC's `apps/mobile` is a README that says "do not scaffold". Logged.
- **`packages/ui` from the scaffold is emptied, not deleted.** Its three demo components (`button.tsx`, `card.tsx`, `code.tsx`) and the `./*` wildcard export go; the package folder stays so INF-3 fills it. CC's rule: no `"./*"` wildcard exports on `@cc/ui` (conventions §4B). Logged.
- **The boundaries lint lands now, with the full layer list**, even though most layers do not exist yet. `eslint-plugin-boundaries` zones match by path pattern; an absent folder is simply never matched. Landing it first means every later package is born under the rule. Logged.

## Behaviour & states

**No surface.** Described by the state of the tree after the ticket.

### Files to create or replace (exact)

**Root**

- `package.json` — copy CC's root `package.json` and edit: `name: "synapse"`; keep `scripts.build/dev/lint/lint:boundaries/format/check-types`; add `web:dev`, `web:dev:local`, `web:build`, `web:start`, `web:lint`, `web:typecheck` (filter `web`); add `ui:lint`, `ui:typecheck`, `ui:storybook`, `ui:build-storybook`; add `db:generate/migrate/push/setup/reset/seed/seed-users/schema-reference` (filter `@syn/db`) — these scripts point at packages later tickets create; Turbo tolerates a filter with no matching task at this point, and the root `lint:boundaries` script runs from the root. Drop every `marketing:*`, `toolkit:*`, `observability:*` line. `devDependencies`: `@syn/config: "workspace:*"`, `@ianvs/prettier-plugin-sort-imports`, `drizzle-kit 0.31.10`, `drizzle-orm 0.45.2` (both exact — CC pins Drizzle at the root, §2), `eslint ^9.39.1`, `prettier ^3.7.4`, `turbo ^2.9.12`, `typescript 5.9.2`. `engines.node: ">=22"`. `packageManager: "yarn@4.13.0"`. `workspaces: ["apps/*", "packages/*"]`. Remove `devEngines`.
- `turbo.json` — copy CC's; strip every `globalEnv` entry that names Stripe, Resend, MailerLite, Anthropic, OpenAI, Langfuse, `RELATIONSHIPS`, `TOOLKIT`, `RESEARCH`, `INTERNAL_CHECKOUT`, `AFFILIATE`. Keep: `NODE_ENV`, `SYN_LOG_DEBUG`, `NEXT_PUBLIC_SYN_LOG_DEBUG`, `DATABASE_ENVIRONMENT`, `DATABASE_URL`, `MIGRATE_DATABASE_URL`, `LOCAL_DATABASE_URL`, `LOCAL_DIRECT_DATABASE_URL`, the four `SUPABASE_{STAGING,LIVE}_{TRANSACTION,SESSION}_POOLER_CONNECTION_URL`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`, `SKIP_ENV_VALIDATION`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_URL_LOCAL`, `NEXT_PUBLIC_SITE_URL_STAGING`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL_STAGING`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_STAGING`, `SUPABASE_SECRET_KEY`, `SUPABASE_SECRET_KEY_STAGING`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY_STAGING`, `NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN`. Keep all task definitions (`build`, `dev`, `dev:local`, `start`, `lint`, `lint:boundaries`, `check-types`, `storybook`, `build-storybook`, `test`, `db:*`).
- `.nvmrc` → `22`. `.yarnrc.yml` → `nodeLinker: node-modules`. `.npmrc` → delete (Yarn ignores it; the scaffold's is empty).
- `.gitignore` — copy CC's, replacing the `apps/toolkit/public/emoji/` line with `apps/web/public/emoji/`. Keep the `.claude/*` + `!.claude/settings.json` block; keep the Yarn Berry block.
- `tsconfig.json` (root) — CC's shape: `{ "files": [], "references": [{ "path": "./apps/web" }, { "path": "./packages/ui" }] }`; later tickets append references.
- `eslint.config.mjs` (root) — copy CC's verbatim, changing `@cc/config/eslint/boundaries` → `@syn/config/eslint/boundaries`.
- `prettier.config.mjs` — copy CC's verbatim (double quotes, semicolons, trailing commas, 80 columns, the import-order list with `^@syn/` replacing `^@cc/`).
- `AGENTS.md` — a skeleton with CC's section headings (Start here · Source precedence · Hard guardrails · Commands · Key docs · Monorepo map · Environment & tooling · Import boundaries · Shell command conventions · Keeping instructions in sync). Fill the Commands, Environment, Import boundaries, and Shell command conventions sections from CC's now (they are true from this ticket on); leave Key docs and Monorepo map as tables with the rows this track will create, marked "lands in INF-n". INF-11 completes it.
- `CLAUDE.md` → the single line `@AGENTS.md`.
- `README.md` — copy CC's shape: what this is, essential docs table (pointing at `docs/ux/` and `docs/specs/infrastructure/`), repository layout, prerequisites, commands. Truthful to this ticket's state; INF-11 finalises.

**`packages/config/`** — copy CC's `packages/config/` wholesale (`eslint/{base,next,react-internal,boundaries,spacing}.js`, `prettier/index.js`, `tsconfig/{base,nextjs,react-library}.json`, `package.json`, plus an empty `tailwind/preset.css` carrying only a header comment "filled by INF-3"). Edits: `package.json` name `@syn/config`; `boundaries.js`: `workspacePackage(type, folder)` matches `node_modules/@syn/${folder}/**`; `APP_TYPES = ["app-web", "app-mobile"]`; `boundaries/elements` lists `workspaceApp("app-web","web")`, `workspaceApp("app-mobile","mobile")` and the eleven packages `config, constants, types, observability, utils, validators, db, auth, api, hooks, ui` (drop `ai`); `PACKAGE_IMPORTS`: delete the `ai` row and remove `"ai"` from the `api` row; `APP_IMPORTS`: drop `ai`; `RESTRICTED_EXTERNAL`: keep `drizzle-orm` (owners `db, api, app-web`), `postgres` (`db`), `drizzle-kit` (`db`), `web-push` (`api`), `frimousse` (`ui`); delete the `ai`, `@ai-sdk/anthropic`, `langfuse`, `stripe`, `resend`, `fuse.js` rows; delete the `apps → ai` disallow loop. `boundaries/include` lists `node_modules/@syn/**/*`, `node_modules/web/**/*`, `node_modules/mobile/**/*`.

**`apps/web/`** — keep the scaffold's `app/` folder but replace its contents with the minimum that compiles: `app/layout.tsx` (a plain `<html lang="en"><body>` shell, no fonts yet — INF-7 owns the real layout), `app/page.tsx` (one line of text: "Synapse"), `app/globals.css` (`@import "tailwindcss";` only — INF-3 adds the preset import). `package.json`: name `web`, scripts `dev` (`next dev --port 3000`), `dev:local` (`next dev -H 0.0.0.0`), `build`, `start`, `lint` (`eslint --max-warnings 0`), `check-types` (`next typegen && tsc --noEmit`); dependencies `next 16.3.4`, `react 19.2.8`, `react-dom 19.2.8`; devDependencies `@syn/config: "*"`, `@tailwindcss/postcss ^4`, `tailwindcss ^4`, `@types/node ^22`, `@types/react ^19`, `@types/react-dom ^19`, `eslint ^9.39.1`, `typescript 5.9.2`. `tsconfig.json` extends `@syn/config/tsconfig/nextjs.json` with CC toolkit's `compilerOptions` (`incremental`, `jsx: react-jsx`, `moduleResolution: bundler`, `declaration: false`, `declarationMap: false`, `paths: { "@/*": ["./*"] }`) and CC's `include` list. `eslint.config.mjs` → `import { nextJsConfig } from "@syn/config/eslint/next-js"; export default nextJsConfig;`. `postcss.config.mjs` with `@tailwindcss/postcss`. `next.config.ts` (TypeScript, not the scaffold's `.js`): the minimal `NextConfig` with `turbopack.root` and `outputFileTracingRoot` set to the repo root as CC does — INF-7 adds the env collapse. Delete `page.module.css`, the demo SVGs in `public/`, and `app/fonts/` (fonts arrive in INF-7 via `next/font`).

**`apps/mobile/README.md`** — copy CC's `apps/mobile/README.md`, reworded for Synapse: an Expo seam for Phase 1.5; consumes `@syn/{api,validators,types,constants,hooks,auth}`; UI rebuilt with NativeWind or typed style maps over the token constants; do not scaffold before web is validated. No `package.json`.

**`packages/ui/`** — delete `src/*.tsx`; `package.json` becomes `@syn/ui` with an empty `exports` map (`"."` → `./src/index.ts`), `type: "module"`, scripts `lint`, `check-types`, `storybook`, `build-storybook`, devDependencies `@syn/config`, `eslint`, `typescript 5.9.2`; `src/index.ts` exports nothing yet (a comment). `tsconfig.json` extends `@syn/config/tsconfig/react-library.json` with CC's `packages/ui/tsconfig.json` options. `eslint.config.mjs` as CC's.

**Delete:** `apps/docs/`, `packages/eslint-config/`, `packages/typescript-config/`.

**States (exhaustive):** fresh clone → `corepack enable && yarn install` succeeds with the lockfile committed · `yarn lint` passes · `yarn lint:boundaries` passes (zero files match a forbidden edge) · `yarn check-types` passes · `yarn build` produces `apps/web/.next` · `yarn dev` serves "Synapse" on :3000.

**Failure / edge states:** `yarn install` refuses because `packageManager` and the global Yarn disagree → the fix is `corepack enable`, and `README.md` says so. Turbo warns about undeclared env vars → add them to `globalEnv`, never suppress the rule.

## Non-negotiables (this slice)

- **`@syn/*` everywhere; no `@repo/*` string survives** in any file, including the lockfile.
- **Exact Drizzle pins at the root** (`drizzle-orm 0.45.2`, `drizzle-kit 0.31.10`) even though no package uses them yet — the pin is the anchor.
- **Yarn, never npm or pnpm.** Delete any `package-lock.json` that appears.
- **The boundaries lint runs from the repo root** and is wired into `yarn lint:boundaries` from this ticket on.
- **`apps/mobile` is a README** — no `package.json`, no `app/`.

## Data & AI

**Schema changes: none.** **Tables:** none. **Placement:** as listed above; Vesper's call, mirroring CC §2 and §4.11. **tRPC / validators:** none. **AI notes: None.** **Instrumentation: none.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. `grep -r "@repo/" --include=package.json --include=*.ts --include=*.tsx --include=*.mjs --include=*.json . --exclude-dir=node_modules` returns nothing.
2. `apps/docs`, `packages/eslint-config`, `packages/typescript-config` do not exist; `apps/mobile/README.md` exists and `apps/mobile/package.json` does not.
3. `packages/config/package.json` is `@syn/config` and exports `./eslint/base`, `./eslint/next-js`, `./eslint/react-internal`, `./eslint/boundaries`, `./prettier`, `./tailwind/preset.css`, `./tsconfig/base.json`, `./tsconfig/nextjs.json`, `./tsconfig/react-library.json`.
4. Root `package.json` pins `typescript` to `5.9.2`, `drizzle-orm` to `0.45.2`, `drizzle-kit` to `0.31.10`, declares `packageManager: yarn@4.13.0` and `engines.node >=22`; `.nvmrc` reads `22`.
5. `yarn install --immutable` succeeds on a clean clone with the committed `yarn.lock`.
6. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, and `yarn build` pass.
7. `yarn dev` renders "Synapse" at `http://localhost:3000`.
8. Root `AGENTS.md`, `CLAUDE.md` (`@AGENTS.md`), and `README.md` exist; `AGENTS.md` has every CC section heading and its Shell command conventions section is complete.
9. `TECHNICAL-DECISIONS.md` carries the pins decision with Mason's confirmation or counter-proposal.

## Likely-relevant technical notes (ADVISORY — dev decides)

- CC's `tsconfig/base.json` uses `module: NodeNext`; apps and React libraries override to `ESNext` + `Bundler`. Keep that split — it is why relative imports omit extensions.
- Turbo's `eslint-plugin-turbo` rule `no-undeclared-env-vars` is what makes the `globalEnv` list load-bearing; CC keeps it at `warn`.
- CC's root `eslint.config.mjs` only runs boundaries; code-quality lint runs per package. Keep both passes separate as CC does — merging them makes disable-comments fight.

## Dev's call

The exact `.gitignore` ordering · whether `apps/web/next.config.ts` sets `reactStrictMode` (CC does not) · the wording of the `apps/mobile` README.

## Out of scope

- **Leaf packages** — INF-2. **Tokens, fonts, theme** — INF-3. **Primitives** — INF-4. **Env tiers and next.config collapse** — INF-7. **CI workflow and Vercel** — INF-10. **The full `AGENTS.md`/docs index** — INF-11.

## Depends on

**No slice dependencies.**

## Recommended execution

**Opus.** The value is in getting forty small decisions consistent with CC on the first pass; a cheaper model will leave a `@repo` string, a TS 7 pin, or a missing `globalEnv` entry that every later ticket inherits.

---

### Build kickoff (paste into the session)

> Build **INF-1 — Monorepo re-base** (attached spec). Model: **Opus**. **Reshape the `create-turbo` scaffold into CC's monorepo exactly: `@syn/*`, `packages/config`, CC's pins, the boundaries lint, and skeleton agent docs — nothing else.**
> Attach/read first, in order: this spec · `docs/specs/infrastructure/README.md` · CC `AGENTS.md` · CC `docs/architecture/codebase-conventions.md` §0, §2, §4.11, §6, §7 · CC `docs/architecture/tech-stack.md` · CC root `package.json`, `turbo.json`, `tsconfig.json`, `eslint.config.mjs`, `prettier.config.mjs`, `.gitignore` · CC `packages/config/**` · CC `apps/toolkit/{package.json,tsconfig.json,eslint.config.mjs,next.config.ts}` · CC `apps/mobile/README.md` · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Copy from CC, rename the scope, strip what the spec names. Do not keep anything from the scaffold except `apps/web`'s existence. Pin TS 5.9.2 and Node 22 unless Mason's counter-proposal is in `TECHNICAL-DECISIONS.md`. Close in three places; run `yarn lint && yarn lint:boundaries && yarn check-types && yarn build`.
