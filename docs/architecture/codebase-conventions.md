# Synapse — Codebase Conventions

> **This document is the contract between the developer and the AI coding agent.** Given only this file and a feature ticket, an agent must place, name, and pattern-match new code correctly — without correction. Every rule is a direct imperative. When a decision had alternatives, the decision is stated first and the rationale second. Trees and tables are authoritative.

**Status:** Locked unless a line is flagged `[REVISIT]`.
**Primary audience:** AI coding agents (Cursor, Claude Code).
**Secondary audience:** The developer and future contributors.
**Read alongside:** [`tech-stack.md`](./tech-stack.md) (canonical stack — never contradict it), [`docs/ux/ux-design-handoff-v1.3.md`](../ux/ux-spec-v1.md) (product/IA source of truth), [`drizzle-orm-conventions.md`](./drizzle-orm-conventions.md) (pinned ORM syntax anchor).

---

## 0. THE TEN RULES (read first)

1. **Placement is decided by one question: who imports this?** One app → it lives in that app. Two+ apps or the future `mobile-relationships` app → it lives in `packages/`.
2. **`apps/` is composition. `packages/` is capability.** Apps hold routing, layout, and wiring — nothing else.
3. **The package graph is strictly layered and acyclic.** Apps depend on everything; packages never import an app or a higher layer (§6).
4. **tRPC is the default for all client-initiated data operations.** It is the one typed contract web and mobile both consume. Exceptions are explicit (§3.5).
5. **Shared packages are React-Native-portable by construction.** No `next/*`, no DOM, no web-only deps in `types`, `constants`, `utils`, `validators`, `hooks`. `ui` is the one deliberately web-only package.
6. **All filenames are kebab-case.** Identifiers inside files keep their normal casing (`PascalCase` components, `useX` hooks, `camelCase` functions). Filename casing and identifier casing are decoupled on purpose (§7).
7. **Server Components are the unmarked default. Client Components are marked by `'use client'` on line 1 and live in a `_components/` folder.** No `.client.tsx` suffix.
8. **A value that survives at runtime is a constant (`@syn/constants` or its domain). A declaration erased at compile time is a type (`@syn/types`).** A `const` is never a type; a `type`/`interface` is never a constant.
9. **Procedures and route handlers stay thin.** Multi-step logic lives in a service function they call, never inline in the resolver (§3.5).
10. **When unsure, do not invent a location. Match the nearest existing pattern, or stop and ask the developer.**

---

## 1. ORGANIZATIONAL PHILOSOPHY

Internalize these before reading any tree. They are the _why_ behind every _where_.

### 1.1 The single most important rule: ask who consumes it

Before placing any file, trace its consumer.

- Consumed by **one app** → it lives **inside that app**.
- Consumed by **two or more apps**, or by the future `mobile` app → it lives in **`packages/`**.
- Consumed by **web and React Native equally** → it must be **platform-agnostic** and free of web-only dependencies.

The monorepo exists for one reason: so the eventual Expo port is a re-skin, not a rewrite. That only holds if everything two products will share already lives in `packages/`, portable, from day one.

### 1.2 The apps/ ↔ packages/ boundary

| `apps/*` owns                      | `packages/*` owns                                                 |
| ---------------------------------- | ----------------------------------------------------------------- |
| Routing, layouts, page shells      | Business logic, data access, the typed API contract               |
| App-specific component composition | The shared component vocabulary (`ui`)                            |
| Wiring providers together          | Auth, AI pipeline, DB client, validators, types, constants, hooks |
| Reading typed env vars             | Anything portable to React Native                                 |
| App-local glue no one else needs   | Anything a second consumer would want                             |

If a file in an app holds logic that is not about _this app's routes or layout_, it is misplaced. Lift it into the package that owns its domain.

### 1.3 Co-location vs. centralization

**Co-locate by default. Extract on the second consumer.**

- A feature's route, server shell, client leaves, local actions, and local types live together under the route segment. Proximity is documentation.
- A helper, type, component, or hook starts local to the feature that needs it first.
- The moment a **second import site** appears — a second route, a second app, or the mobile target — extract it to the right package. Not before.
- **Extract immediately (exception):** anything the `mobile` app will provably need — domain logic, validators, types, constants, the tRPC contract, hooks — goes straight to `packages/` at first use, because the whole monorepo thesis depends on that logic being portable before the port begins.

### 1.4 How the system handles growth

| Stays stable as the codebase scales        | Evolves freely                                   |
| ------------------------------------------ | ------------------------------------------------ |
| The `packages/` list and their boundaries  | Route segments and features inside each app      |
| The `@syn/*` alias surface                  | The internal file layout of any one feature      |
| The dependency direction (apps → packages) | The set of components inside `ui`                |
| The layered package graph (§6)             | Prompts, validators, types, constants (additive) |
| Naming conventions (§7)                    | Which model string each AI touchpoint uses       |

Adding a feature must never require touching a package boundary or an alias. If it does, the boundary was drawn wrong — flag it, do not route around it.

### 1.5 How naming carries the documentation burden

The primary reader is an AI agent that has never seen this repo. A file's location and name must convey three things without opening it: its **kind** (a `use-…` file is a hook, a `…/prompts/…` file is an AI prompt, `route.ts` is an HTTP handler), its **scope** (its location says shared vs. app-local), and its **consumer** (`@syn/db` schema files read as tables; `@syn/hooks` files read as shared React state). If a name needs a comment to explain its kind, rename it.

---

## 2. TOP-LEVEL MONOREPO STRUCTURE

`synapse/
├── apps/                      # Deployable applications. One Vercel project each. Composition only.
│   ├── web/                   # The Synapse PWA — the only product surface in Phase 1.
│   └── mobile/                # Empty Expo / React Native seam. Phase 1.5. No build at MLP.
│
├── packages/                  # Shared internal libraries. Everything portable lives here.
│   ├── db/                    # Drizzle schema, singleton client, migrations, RLS bridge, seed.
│   ├── api/                   # tRPC routers + context + services. THE typed contract web & mobile consume.
│   ├── ai/                    # Vercel AI SDK wrappers, prompt modules, compress→reason pipeline, Langfuse.
│   ├── auth/                  # Supabase Auth client factories, session/user helpers, RLS-context bridge.
│   ├── ui/                    # Shared web components (Radix + Tailwind). Storybook-first. WEB-ONLY at MLP.
│   ├── validators/            # Zod schemas: form input, tRPC I/O, AI-output parsing. Shared client+server.
│   ├── types/                 # Pure TS types, interfaces, type-level enums. Zero runtime. Zero deps.
│   ├── constants/             # Shared RUNTIME values: storage keys, route URLs, style/motion constants, limits.
│   ├── hooks/                 # Shared React hooks. Platform-agnostic — must run on web AND React Native.
│   ├── utils/                 # Pure, framework-free functions. No React, no DB, no I/O. (See §5.)
│   └── config/               # Build config: eslint, prettier, tailwind preset, base tsconfig. Subpath exports.
│
├── .turbo/                    # Turbo local cache. Git-ignored. Never edited by hand.
├── turbo.json                 # Pipeline definitions: build/dev/lint/test/db:* task graph + cache rules.
├── package.json               # Root workspace config. PINS drizzle-orm + drizzle-kit to EXACT versions.
├── yarn.lock                  # Single lockfile for the whole workspace. Never hand-edit.
├── tsconfig.json              # Root tsconfig referencing @syn/config/tsconfig base.
├── .env.example               # The documented env-var surface. Real .env.* files are git-ignored.
├── .nvmrc                     # Pinned Node version — parity across dev, CI, Vercel.
└── README.md                  # Orientation only. Points agents at this doc + the stack + UX docs.`

### Why each top-level entry lives where it does

| Entry                 | Contains                                         | Why here                                                                  | Wrong elsewhere because                                                                       |
| --------------------- | ------------------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `apps/`               | Deployable Next.js / Expo apps                   | The only things Vercel deploys; leaves of the dependency graph            | Shared logic here is unreachable by a second app and by mobile — the monorepo's purpose fails |
| `packages/`           | Shared importable libraries                      | Everything two products share sits above any single app                   | Cross-app imports are banned (§6); logic stuck in an app must be duplicated                   |
| `packages/config`     | eslint, prettier, tailwind preset, base tsconfig | One source for build config, consumed via subpaths                        | Per-app config drifts; tokens redefined per app diverge                                       |
| `turbo.json`          | Task pipeline + cache rules                      | Turbo needs root visibility of all workspaces                             | Per-app pipelines lose topological `^build` ordering                                          |
| `package.json` (root) | Workspace globs + **pinned** Drizzle             | Drizzle is pre-1.0; the pin is the anchor against AI-emitted stale syntax | Per-app pins drift between apps sharing `@syn/db`                                              |
| `.env.example`        | The documented env surface                       | One canonical list of every variable any app needs                        | Per-app env docs lose the single source of truth                                              |

> **Imperative:** Never add a new top-level directory. New runtime capability → a folder under `packages/`. New product surface → a folder under `apps/`. If neither fits, stop and ask the developer.

---

## 3. APPS DIRECTORY — FULL BREAKDOWN

Universal rules inside **every** app (do not repeat per app):

- **Server Components are the default and carry no marker.** A `page.tsx`/`layout.tsx` is a Server Component unless it cannot be.
- **Client Components are marked two ways, always:** `'use client'` as the literal **first line**, and placement in a `_components/` folder. **No filename suffix.**
- **Push the client boundary to the leaf.** Pages stay server shells that fetch data; interactivity is pushed into small client leaves. Never make a whole page a client component for one widget.
- **`_`prefixed folders are private** (opt out of routing): `_components/`, `_actions/`, `_lib/`. Use them for segment-local code that must not become a route.
- **Env vars are read in exactly one file per app: `env.ts`,** typed with `@t3-oss/env-nextjs` + Zod. `process.env` is never read anywhere else in app code. Each app's `next.config.ts` imports `./env` (side-effect) after `loadEnvConfig` so malformed/missing vars fail the build.
- **Page data fetching goes through the tRPC server caller** (`lib/trpc/server.ts`), never `fetch('/api/...')` and never a raw `@syn/db` import in a page.

### 3.1 `apps/web/` — the web app shell

**Purpose:** the Synapse PWA — a private habit and day planner. The only product surface in Phase 1, and where all feature work lands.

**Future target:** `apps/mobile` (Expo, Phase 1.5) is a second thin shell over the same `packages/*`. That is the whole reason for the platform split in §4A: the port is a re-skin, not a rewrite.

**Route tree:** The authoritative v1 route topology lives in [`apps/web/AGENTS.md`](../../apps/web/AGENTS.md) — **build to that map, not to any tree in this document.** (An earlier UX-handoff route excerpt lived here and drifted badly; it was removed 2026-07-05. On-disk `apps/web/app/` + the app AGENTS map are the truth.) The durable rules: three surfaces — `(onboarding)/` distraction-free, `(app)/` tab shell, and immersive `/tool/{slug}/*` outside the shell; route builders in `lib/routes.ts`, never hardcoded paths; streaming AI under `app/api/ai/*`; auth callback at `auth/callback/route.ts`.

**App-level layout (stable):**

`apps/web/
├── components/ # APP-LEVEL shared components (used by 2+ routes in THIS app).
│ └── start-session-cta.tsx # 'use client' — the persistent fight CTA.
├── lib/ # APP-LOCAL utilities/glue across this app's routes.
│ ├── trpc/
│ │ ├── server.ts # Server-side tRPC caller for RSC data fetching.
│ │ └── client.ts # 'use client' — tRPC React client + provider hookup.
│ ├── routes.ts # APP-LOCAL typed route builders (e.g. sessionRoute(id)).
│ └── realtime.ts # App-local Supabase Realtime channel helpers.
├── types/ # APP-LOCAL types shared across this app, not other apps.
├── public/
├── env.ts # THE ONLY place process.env is read in app code. t3-env + Zod.
├── proxy.ts # Supabase session refresh (Next 16 — not middleware.ts).
├── next.config.ts # loadEnvConfig + @syn/db/@syn/auth env helpers; imports ./env for build-time validation.
├── tsconfig.json # Extends @syn/config/tsconfig (nextjs).
└── package.json`

**Key structural decisions (tools):**

| Decision                    | Rule                                                                                                                  | Rationale                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Entry routing               | One server decision in `lib/entry/resolve-entry.ts` (cross-cutting §4.2) — no client redirects | Exact routes per `apps/web/AGENTS.md` |
| Lane grouping               | Onboarding lanes live under `(onboarding)/` with their own nav-less layout (v1 ships Path B only) | Onboarding must not inherit the tab bar |
| Session is full-screen      | The live session (`/tool/{slug}/chat/[id]`) lives **outside** `(app)`, with its own immersive layout | The session is a focused mode; bottom tabs must not compete (UX §6.5) |
| Brain-dump is session state | No separate brain-dump route; entry redirects into the chat route, whose first render is the brain-dump input | `BrainDumpInput` is a session component (UX §5.2), not a screen |
| Results are session-scoped  | Summary/resolution render inside the chat route; archive at `/tool/{slug}/chats` | Results are artifacts of a session; keep the conversion hook beside it |
| Persistent fight CTA        | A component in the `(app)` layout, not a route                                                                        | UX §5.1 — it is panic-accessible, not a tab                                                              |
| Server actions vs tRPC      | tRPC for anything `mobile` will call; server actions only for web-only mutations, co-located in `_actions/`           | See §3.5                                                                                                 |
| Local vs shared types       | View/prop types → co-located `*.types.ts`; cross-route-in-app → `apps/web/types/`; cross-app → `@syn/types`  | Locality first; promote on the second consumer                                                           |
| Styles                      | Global directives + token CSS vars in `globals.css`; styling via Tailwind + `cva`; tokens from the shared preset only | One token source; no per-app drift                                                                       |
| Env access                  | `env.ts` (t3-env + Zod); `next.config.ts` imports `./env` so missing vars fail the build; tier helpers from `@syn/db` / `@syn/auth` wire canonical vars into `nextConfig.env` | Compile-time safety; no stray `process.env` in app code |

### 3.4 `apps/mobile/` — Expo seam (empty at MLP)

`apps/mobile/
└── README.md   # Expo app in Phase 1.5. Consumes @syn/{api,validators,types,constants,hooks,auth}. UI rebuilt with NativeWind. Do not scaffold before web is validated.`

**Rule (load-bearing):** Every piece of logic written now that mobile will need — domain logic, validators, types, constants, the tRPC contract, hooks — must already live in `packages/`, free of web-only deps (no `next/*`, no Radix, no DOM). If you are about to write such logic inside `tools`, stop and put it in the right package. This is how the port stays a re-skin.

### 3.5 tRPC default — and the explicit exceptions

**Mental model:** tRPC is for your own clients (web + future Expo) calling you in request/response. It is **not** a transport for streaming, real-time, or third-party callbacks. Every exception falls out of that one line.

**Default:** All client-initiated reads and writes are tRPC procedures (queries for reads, mutations for writes).

**Exceptions — do NOT use tRPC; use the named rail:**

| Case                                                                    | Use instead                                                                 | Why                                                                                                                                                                           |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Streaming AI output (GetPerspective 3-layer, CoachPrivately draft)      | **Route handler** `app/api/ai/.../route.ts` streaming via the Vercel AI SDK | Token streaming; the stack doc puts AI calls on route handlers. Structured/JSON AI jobs (InsightExtraction, SessionSummary, compress) stay in tRPC so mobile gets them typed. |
| Real-time (presence, typing, live message delivery)                     | **Supabase Realtime** channels                                              | Postgres change streams + broadcast. _Posting_ a message is a tRPC mutation; _receiving_ the live stream is a Realtime subscription.                                          |
| Supabase auth callbacks                                                 | **Route handlers** `apps/web/app/auth/{callback,confirm}/route.ts`    | Inbound from a provider you handed a URL — not a caller you control.                                                                                                          |
| The scheduler                                                           | **Route handler** `apps/web/app/api/jobs/scheduler/route.ts`          | A cron with a bearer secret and no session.                                                                                                                                   |
| Web-push subscribe / unsubscribe                                        | **Route handlers** `apps/web/app/api/pwa/push/*/route.ts`             | The shape is a browser API's, posted straight from the service-worker flow.                                                                                                   |
| Supabase OAuth callback; one-tap data-export download                   | **Route handler**                                                           | Need raw HTTP responses / `Content-Disposition` headers.                                                                                                                      |
| Web-only convenience mutation with no shared logic (e.g. feedback note) | **Server action** in the segment's `_actions/`                              | Genuinely web-only and Expo will never call it. If Expo _might_ call it, it's a tRPC mutation instead.                                                                        |

**Multi-step logic (the important convention):** procedures and route handlers stay **thin** — validate input, call a service, return. Multi-step orchestration lives in a **service function** in `@syn/api/services/`, written to be called from anywhere: a procedure today, a scheduled job tomorrow. A resolver and a cron can then share one implementation. Never cram branching logic into a resolver body.

**Durable / long-running flows** (Phase 2 SuggestedUpdates, PeriodicCheckIn) exceed a request lifecycle: a tRPC procedure _triggers_ the job; the job runs on Vercel cron (MLP) / Trigger.dev (Phase 2). It never runs synchronously inside the procedure.

**tRPC gotchas to bake in:** one router per domain merged in a root `appRouter`; export the `AppRouter` _type_ (the reason tRPC exists — Expo consumes it); attach auth + the Supabase RLS context once in `context.ts`; validate every input with a `@syn/validators` schema; use `createCaller` in Server Components and the React client in client components (never hand-rolled `fetch`); set up the `superjson` transformer at init so Dates/enums survive the wire.

---

## 4. PACKAGES DIRECTORY — FULL BREAKDOWN

Universal package rules:

- **Every package has a single public entry: `src/index.ts`** (a barrel). What it re-exports is the **public API**; everything else is internal. Apps import `@syn/db`, never `@syn/db/src/schema/user/users`. **Exception:** `@syn/ui` and `@syn/config` use **subpath exports** (`@syn/ui/button`, `@syn/config/tailwind`) for tree-shaking and consumer clarity.
- **Each `package.json` declares only the deps it actually imports.** No "just in case" deps.
- **`types`, `constants`, `utils`, `validators`, `hooks` must be platform-agnostic** — importable by `mobile` unchanged. No `next/*`, no DOM, no Node-only built-ins.

### 4.1 `packages/db` — Drizzle schema, client, migrations

**Purpose:** Single source of truth for the database. Drizzle owns schema and migrations (ignore Supabase dashboard migrations). Exposes the singleton client, inferred row types, and the RLS-scoped query path.
**Consumers:** `@syn/api` (primary), `@syn/auth` (user lookups), seed and gated `db:migrate` tooling. **Never** imported by an app page/component.

`packages/db/
├── src/
│   ├── schema/
│   │   ├── auth.ts                  # reference-only auth.users shadow (not migrated)
│   │   ├── enums.ts                 # cross-directory pgEnum definitions only
│   │   ├── index.ts                 # top-level schema barrel
│   │   ├── user/                    # users, profiles, preferences, notifications, …
│   │   ├── user/                    # the shadow users table (+ its one-table enums)
│   │   ├── notification/            # web_push_subscriptions
│   │   ├── <domain>/                # habits, templates, days, items, misses, … (feature tech spec)
│   │   ├── chat-session/            # chat_sessions, messages, ai_interactions, …
│   │   ├── agreement/               # agreements, suggested_updates, comments, …
│   │   ├── notification/            # notifications
│   │   ├── safety/                  # safety_flags, crisis_resources, prompt_templates
│   │   └── future/                  # compatibility_assessments, compatibility_responses
│   ├── client.ts                    # Singleton runtime client (postgres-js, transaction pooler, prepare:false)
│   ├── migrate-client.ts            # Direct/session-mode client for drizzle-kit. NEVER used at runtime.
│   ├── rls.ts                       # create-rls-client(authContext): user-scoped client that sets request auth
│   ├── seed/                        # Modular dev/staging seed (index.ts orchestrator + per-context files)
│   └── index.ts                     # PUBLIC API barrel + $inferSelect/$inferInsert types
├── migrations/                      # drizzle-kit SQL output. Committed. Append-only.
│   └── meta/                        # drizzle-kit journal + snapshots. Machine-owned.
├── supabase/setup/                  # Platform SQL: triggers, RLS enablement, storage buckets
├── drizzle.config.ts                # schemaFilter: ['public'], DIRECT_DATABASE_URL
├── SETUP.md                         # Environment + run-order guide
├── SCHEMA_REFERENCE.md              # Full schema reference
├── tsconfig.json
└── package.json                     # PINNED drizzle-orm + drizzle-kit (exact versions).`

**Singleton rule:** create the runtime client once in `client.ts`; export it; never instantiate elsewhere. Set `prepare: false` over the transaction pooler (6543). Migrations use `migrate-client.ts` against the direct connection (5432).
**Import extensions:** relative imports across `packages/*/src` omit file extensions (`import { users } from "../user/users"`).
**Export surface:** `db` (singleton), `createRlsClient`, `* from schema` (tables + relations), and **inferred row types** via `$inferSelect`/`$inferInsert`. Not exported: `migrate-client`, `seed`.
**Belongs / does not:** ✅ tables, relations, enums, indexes, client, RLS bridge, seed, migrations. ❌ business logic (→ `@syn/api`), Zod validation (→ `@syn/validators`), app imports.

### 4.2 `packages/api` — the tRPC contract + services

**Purpose:** The typed API contract web and Expo both consume, and the orchestration layer that assembles db + auth + ai into business operations.
**Consumers:** all apps, `@syn/hooks` (type inference).

`packages/api/
├── src/
│   ├── trpc.ts                      # initTRPC, context type, publicProcedure / protectedProcedure builders
│   ├── context.ts                   # createContext: attaches session/user (@syn/auth) + RLS-scoped db handle
│   ├── root.ts                      # appRouter — merges all domain routers. Exports AppRouter type.
│   ├── routers/                     # One router per domain. THIN resolvers.
│   │   ├── user/preferences.ts       # the account-preferences read + write
│   ├── services/                    # Multi-step business logic the routers call.
│   │   ├── notifications/            # web-push send + per-user fan-out
│   │   └── jobs/                     # the scheduled-job registry
│   └── index.ts                     # exports appRouter, AppRouter type, createContext, createCaller
├── tsconfig.json
└── package.json`

**Procedure rules:** `protectedProcedure` for anything touching a person's data — it is what narrows `ctx.rls` to non-null, so forgetting the gate is a type error. Validate every input with a `@syn/validators` schema. **Belongs here:** business rules ("what should the system do"). Not in `db` (dumb data access), not in apps (dumb composition).

### 4.4 `packages/auth` — Supabase Auth

**Purpose:** Client/server/middleware Supabase Auth factories, session/user helpers, the typed user context, and the RLS-context bridge to `@syn/db`.
**Consumers:** apps (helpers + `proxy.ts`), `@syn/api` (context).

`packages/auth/src/
├── client.ts          # createBrowserClient — for client components
├── server.ts          # createServerClient — RSC/route handlers/server actions (cookie-bound)
├── middleware.ts      # updateSession — token refresh for app proxy.ts (Next 16)
├── session.ts         # getSession(), getUser() — server-side, typed
├── context.ts         # the typed AuthContext shape passed into tRPC + RLS
└── index.ts`

**Rules:** client (`client.ts`) and server (`server.ts`) helpers stay in separate files so the cookie-bound server client never gets imported into a `'use client'` component. The RLS bridge is the canonical authed DB path; service-role/admin access bypasses RLS **explicitly**, never by default.

### 4.5 `packages/ui` — shared component library (web-only)

**Purpose:** The shared web component vocabulary (Radix + Tailwind, shadcn-scaffolded). Built **Storybook-first**, in isolation, before feature work — a locked vocabulary is the biggest lever against AI UI variance.
**Consumers:** `tools`, `marketing`. **Not** `mobile` (Radix does not run in RN).

`packages/ui/
├── src/
│   ├── primitives/                  # thin shadcn/Radix wrappers (kebab, matching shadcn output)
│   │   ├── button/
│   │   │   ├── button.tsx            # export function Button() — cva variants
│   │   │   ├── button.variants.ts    # cva() variant defs beside the component
│   │   │   ├── button.stories.tsx    # Storybook — mandatory documentation surface
│   │   │   └── index.ts
│   │   ├── dialog/ · input/
│   ├── composed/                    # multi-primitive product components
│   │   ├── insight-card/ · message-bubble/
│   ├── lib/cn.ts                    # class-merge (clsx + tailwind-merge). UI-internal.
│   └── index.ts                     # subpath-exported public components
├── .storybook/
├── tsconfig.json
└── package.json`

**Rules:** one folder per component (component + variants + story + index). Story mandatory. Tokens come from `@syn/config/tailwind`; never hardcode hex. **`ui` is web-only at MLP** — platform-agnostic logic goes in `@syn/hooks`/`@syn/utils`/`@syn/types`, which port. When mobile arrives, rebuild the thin UI layer with NativeWind, importing the same logic packages. Do not adopt a cross-platform UI lib (Tamagui) pre-emptively `[REVISIT]`.

**Platform-agnostic content in `@syn/ui` (extraction candidates):** Pure constants, strings, or logic that a future native UI would also need do **not** belong in `@syn/ui` — they belong in `@syn/constants`, `@syn/utils`, or `@syn/types`. The following are known candidates for future extraction (do not import them from shared/native-bound code as if they were portable):

- `src/lib/cn.ts` — web styling helper (Tailwind class merge)
- `src/branding/tokens.ts` — design token constants
- `src/composed/*/copy.ts` — customer-facing string constants
- `src/primitives/control/input/input-format.ts` — input formatting logic

### 4.6 `packages/validators` — Zod schemas

**Purpose:** All Zod schemas: form input, tRPC I/O, AI-output parsing. The shared runtime-validation layer.
**Consumers:** `@syn/api` (procedure inputs), apps (forms via `useSynapseForm`), `@syn/hooks` (resolvers).

`packages/validators/src/
├── session.ts        # postMessageInput, endSessionInput, perspectiveOutput (AI shape)
├── profile.ts        # insightInput, agreementInput, consent-tier schemas
├── user.ts           # account preferences
├── keys.ts           # the YYYY-MM-DD and YYYY-Www route keys
├── billing.ts        # checkout input, webhook payload guards
├── ai-output.ts      # schemas the AI pipeline parses non-streaming JSON against
└── index.ts`

**Rules:** a schema used by both a form and a procedure is defined **once** here and imported by both. Export both the schema and its `z.infer` type. Platform-agnostic only.

### 4.7 `packages/types` — shared TypeScript types

**Purpose:** Pure TS types, interfaces, and type-level enums. **Zero runtime. Zero deps.Consumers:** nearly everything.

`packages/types/src/
├── domain/
│   ├── perspective.ts    # the three-layer reflection shape consumed by UI
│   └── view.ts           # the view models components receive — never a DB row
├── enums.ts              # type-level string-literal unions (NOT pgEnums, NOT runtime values)
└── index.ts`

**Qualifies:** ✅ a shape used by 2+ packages/apps, not derivable from the DB schema or a Zod validator. ❌ component prop types (inline in the `.tsx`), single-feature view-models (co-located `*.types.ts`), DB row types (use `@syn/db`'s `$inferSelect`), `z.infer` of a validator (export from `@syn/validators`).
**Naming:** `PascalCase`, **no `I`/`T` prefixes**. `…Input`/`…Output` (in validators), `…Props` (in components). `@syn/db` owns **row** types; `@syn/types` owns **domain/UI** types. Never duplicate a row type here.

### 4.8 `packages/constants` — shared runtime values

**Purpose:** Shared **runtime** constant values — the things that are _not_ types. Storage keys, route/URL constants, style/motion constants consumed in JS, business limits, query-key factories.
**Consumers:** apps, `@syn/hooks`, `@syn/ui`, `@syn/api`.

`packages/constants/src/
├── storage-keys.ts   # localStorage/sessionStorage key registry (collision-safe, single source)
├── urls.ts           # shared external URLs (e.g. canonical web-checkout URL)
├── motion.ts         # animation durations (ms), easing — consumed by Framer Motion in JS
├── z-index.ts        # the z-index scale used in TS
├── limits.ts         # business limits (FREE_TIER_SESSIONS_PER_MONTH = 1, severity thresholds)
├── query-keys.ts     # TanStack Query key factories
└── index.ts`

**The constant-vs-type rule (memorize):** if a value survives at runtime — something you could `console.log` — it is a **constant** and lives here (or in its domain package). If it is erased at compile time — an `interface`, `type`, or type-level enum — it is a **type** and lives in `@syn/types`. A `const` is never a type; a `type`/`interface` is never a constant.
**Boundary with config:** Tailwind design _tokens_ (colors, fonts) live in `@syn/config/tailwind`. Style _values consumed in TS/JS_ (durations, z-index, breakpoint px for matchMedia) live here.
**Domain exception:** domain-coupled constants stay with their domain — this app's route builders in `apps/web/lib/routes.ts`, the design tokens in `packages/config/tailwind/preset.css`. `@syn/constants` is for **shared, domain-neutral** values.
**Naming:** `SCREAMING_SNAKE_CASE` for primitive constants; `as const` objects for grouped maps (`SESSION_TYPE = { JOINT: 'joint', SOLO: 'solo' } as const`). Files kebab-case.

### 4.9 `packages/hooks` — shared React hooks (headless logic only)

**Purpose:** Platform-pure React hooks — **logic and data orchestration only**, runnable on web **and** React Native. See §4A for the platform-split rule.
**Consumers:** `tools`, `mobile` (future).

`packages/hooks/src/
├── tools/<slug>/             # headless tool logic (future layout per §4B)
├── use-conflict-session.ts   # typed interface / headless stub (live wiring in app)
├── use-zod-form.ts
└── index.ts`

**Rules (§4A):** `@syn/hooks` must contain **no** `window`/`document`/`navigator`/`next/*` and **no** web transport bindings (tRPC client instance, Supabase Realtime channel setup). Those hooks live in the consuming web app: `apps/<app>/lib/hooks/`.

**Intended pattern (not a deviation):** Live tRPC + Realtime hooks (`useSessionMessages`, `useSessionPresence`, etc.) correctly live in `apps/web/lib/hooks/` because they bind to the app-local tRPC client. `@syn/hooks` holds the portable headless logic and typed interfaces both platforms share; web shells wire transport in the app.

### 4.10 `packages/utils` — pure helper functions

**Purpose:** Pure, framework-free functions. **No React, no DB, no I/O, no side effects.** Deterministic input→output only.
**Consumers:** anything (safe everywhere, including RN).

`packages/utils/src/
├── date.ts     # formatDate, relativeTime
├── string.ts   # truncate, slugify, pluralize
├── array.ts    # groupBy, uniqueBy
├── number.ts   # clamp, formatCurrency
├── scroll.ts   # WEB-ONLY leaf — see note below
└── index.ts`

**Known web-only leaf:** `scroll.ts` uses `window`/`document` for `scrollIntoView`. It remains exported from `@syn/utils` for web consumers but **must not** be imported by shared or native-bound code. Prefer keeping future DOM helpers web-local in `apps/<app>/lib/` when possible.

**Junk-drawer prevention (enforced):** (1) **purity is the membership test** — touches React/DB/network/DOM/env/time-as-side-effect → it does **not** belong here; (2) **grouped by domain file**, never one-file-per-function, and a `misc.ts`/`helpers.ts` file is **banned**; (3) **domain-coupled helper** → its domain package (`@syn/api`), not here; (4) a third file about one domain means that domain wants its own package — flag it.

### 4.11 `packages/config` — build configuration

**Purpose:** eslint, prettier, the Tailwind design-token preset, and the base tsconfig — consumed via subpaths.
**Consumers:** every app and package (build-time).

`packages/config/
├── eslint/
│   ├── base.js              # core rules
│   ├── next.js              # Next.js app rules (export: @syn/config/eslint/next-js)
│   ├── react-internal.js    # React library rules (@syn/ui)
│   └── boundaries.js        # import-boundary rules enforcing §6 (root eslint.config.mjs)
├── prettier/index.js
├── tailwind/preset.css      # THE design tokens (velvet-and-candlelight). Tailwind 4 CSS-first; apps import via @import.
├── tsconfig/
│   ├── base.json            # strict, noUncheckedIndexedAccess
│   ├── nextjs.json
│   └── react-library.json
└── package.json             # subpath exports: @syn/config/eslint/*, prettier, tailwind/preset.css, tsconfig/*`

**Turbo task names:** packages and apps use `check-types` (not `typecheck`) for `tsc --noEmit`.

**Extend, never override:** apps extend these bases and add only app-specific content globs. Redefining tokens, core lint rules, or compiler strictness per app is banned; an override requires a comment explaining why.

**Known `process.env` exceptions in packages (follow-up: parameterize via consumer config):** `@syn/observability` reads `NODE_ENV` / `SYN_LOG_DEBUG` at module init in `logging.ts`; `@syn/api` reads VAPID keys at module init in `services/notifications/web-push.ts`. `@syn/db` and `@syn/auth` accept an optional `env` parameter defaulting to `process.env` — apps wire canonical vars through `env.ts` / `next.config.ts`.

---

## 4A. PLATFORM-SPLIT ARCHITECTURE (web ↔ React Native)

**THE GOVERNING RULE:** Logic is platform-agnostic and shared; rendering is platform-specific and split.

A rendered component (web or native) is a **thin shell** over shared headless logic. Business rules, state machines, and data orchestration **never** live inside a component — they live in `@syn/hooks`, `@syn/api` services, and related shared packages.

### Shared / RN-safe ("the brains")

Importable by web **and** native unchanged — zero `next/*`, zero DOM APIs, zero Node-only built-ins:

| Package | Role |
| ------- | ---- |
| `@syn/types`, `@syn/constants`, `@syn/validators`, `@syn/utils` | Pure types, runtime values, validation, helpers |
| `@syn/db` | Schema + client (server-side) |
| `@syn/auth`, `@syn/api` | Auth, and the typed contract + services |
| `@syn/hooks` | **Headless** hook logic only (§4.9) |

### Web-only

**`@syn/ui`** — Radix + Tailwind + `next/*`. Definitionally web. Marketing and the tools app consume it; React Native cannot.

### Native-only (future — do not create now)

**`@syn/ui-native`** — a **separate package** (not a subfolder of `@syn/ui`) holding all React Native rendering. The boundary must be physically unviolatable: `@syn/ui` cannot run in RN, so native UI gets its own package when the Expo shell is built.

### Hooks rule (sharpens §4.9)

| Location | What belongs |
| -------- | ------------ |
| `@syn/hooks` | Platform-pure logic + data orchestration — no DOM, no web transport |
| `apps/<app>/lib/hooks/` | Web-only hooks: tRPC client binding, Realtime subscriptions, `useMediaQuery`, PWA APIs |

Live precedent: `useSessionMessages`, `useSessionPresence` in `apps/web/lib/hooks/` — **intended pattern**, codified here.

### Component / logic seam

- **Web screen:** composes `@syn/ui` components + shared `@syn/hooks` logic (+ app-local web hooks for transport).
- **Future native screen:** composes `@syn/ui-native` components + the **same** `@syn/hooks` logic.

Adding a platform = new dumb components over existing brains — **never** a logic rewrite.

---

## 5. THE UTIL / LIB / CONSTANTS HIERARCHY — DEFINITIVE RULES

The most common source of codebase entropy. Resolve every "where does this helper go?" with the procedure below.

### 5.1 The vocabulary

| Term          | Definition                                                           | Home                                                                            |
| ------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **util**      | A **pure function** — deterministic, no React/DB/I/O/side effects    | `@syn/utils` (if shared) or app `lib/` (if app-local)                            |
| **constant**  | A **runtime value** — storage key, URL, duration, limit, key factory | `@syn/constants` (if shared, domain-neutral) or its domain package or app `lib/` |
| **type**      | A **compile-erased declaration** — `type`/`interface`/type-enum      | `@syn/types` (if shared) or co-located `*.types.ts`                              |
| **hook**      | A **React hook** — uses React state/effects                          | `@syn/hooks` (if platform-agnostic + shared) or app `lib/` (if web-only)         |
| **service**   | **Multi-step business logic** the API/route calls                    | `@syn/api/services/`                                                              |
| **lib (app)** | App-local glue — trpc client, route builders, realtime setup         | `apps/<app>/lib/`                                                               |

There is no `@syn/lib`. The omnibus `lib` package is deliberately not used — it becomes a god-package that defeats tree-shaking, invalidates the whole build cache on any change, and hides the dependency graph. Split by concern instead.

### 5.2 Promotion rule

A helper **starts local** to the feature that needs it first (segment `_lib/`). It is **promoted to the app's `lib/`** on a second route in the same app, and **promoted to a `packages/*`** on a second app or a mobile need. Never pre-promote.

### 5.3 Granularity

Group by domain, not one-file-per-function: `date.ts` holds every date util. A file exceeding ~200 lines or mixing two clear domains splits. A `helpers.ts`/`misc.ts`/`utils.ts` catch-all file is banned in every package and app.

### 5.4 Function naming verbs

| Verb                 | Use when                                                    | Example                                      |
| -------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| `formatX`            | value → display string                                      | `formatDate`, `formatCurrency`               |
| `parseX`             | string/raw → structured value                               | `parseSessionId`                             |
| `getX`               | retrieve/derive (sync, no I/O)                              | `getInitials`                                |
| `loadX`              | cached server read for a Server Component                   | `loadSessions`, `loadQuestionnaire`          |
| `listX`              | read returning a collection (async)                         | `listInsights`                                 |
| `ensureX`            | idempotent "make it so" (create-if-missing)                 | `ensureDevEntitlement`                       |
| `requireX` / `assertX` | guard that **throws** on failure — prefix signals the request can abort | `requireAdmin`, `assertOwnsSession` |
| `fetchX`             | retrieve over I/O (async) — lives in api/service, not utils | `fetchDayItems`                              |
| `transformX` / `toX` | shape A → shape B                                           | `toInsightCard`, `transformAnswersToProfile` |
| `isX` / `hasX`       | boolean predicate                                           | `isSubscribed`, `hasApproved`                |
| `useX`               | React hook                                                  | `useConflictSession`                         |

### 5.5 Worked examples (apply the procedure)

| Need                                              | Goes to                                            | Why                                                                       |
| ------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| Format a date for display in the UI               | `@syn/utils/date.ts`                                | Pure, deterministic, no deps, multiple consumers                          |
| Fetch a user from the DB                          | `@syn/api` procedure backed by `@syn/db`             | Data access + I/O — never a util; mobile needs it typed → tRPC            |
| Resolve an item's priority (override ?? life default) | `@syn/api/services/` or the day view builder    | Domain-coupled to the day model — not a generic util                      |
| A `localStorage` key for the unsent draft message | `@syn/constants/storage-keys.ts`                    | Runtime value; central registry prevents key collisions                   |
| The animation duration for the grounding motion   | `@syn/constants/motion.ts`                          | Runtime style value consumed in JS (Framer Motion) — not a Tailwind token |
| The free-tier limit (1 session/month)             | `@syn/constants/limits.ts`                          | Shared business constant                                                  |
| A typed builder for `/session/[id]`               | `apps/web/lib/routes.ts`                 | App-specific route — local to this app                                    |
| A React hook managing conflict-session state      | `@syn/hooks/use-conflict-session.ts`                | Core product hook, identical on mobile → shared + platform-agnostic       |
| A web-only `useMediaQuery` hook                   | `apps/web/lib/use-media-query.ts`        | DOM-bound — cannot port to RN, stays app-local                            |
| A Zod schema for the Make-a-Request form          | `@syn/validators/profile.ts`                        | Shared by the form and the tRPC mutation                                  |
| `cn()` class merger                               | `@syn/ui/src/lib/cn.ts`                             | UI-internal styling helper                                                |
| Apply a shift: recompute, cut, write the misses   | `@syn/api/services/day/shift.ts`                    | Multi-step service — keep it out of the resolver                          |
| The VAPID public key                              | `apps/web/env.ts` → the client bundle               | Environment-specific — not a generic constant                             |
| The TS type of the three-layer reflection         | `@syn/types/domain/perspective.ts`                  | Compile-erased shape shared across packages                               |

---

## 6. CROSS-DIRECTORY INTERACTION RULES

The dependency graph, made explicit. Lower layers never import higher ones; this is what keeps the graph acyclic.

### 6.1 Layered order (low → high)

`config            (build-time only; not a runtime import)
constants  types  (zero-dependency leaves; no runtime ↔ no runtime)
utils             (may import constants, types)
validators        (may import constants, types)
db                (may import constants, types; exports row types)
auth              (may import db, constants, types)
ai                (may import validators, utils, constants, types — NOT db; context arrives as args)
api               (may import db, auth, ai, validators, constants, types — the orchestration layer)
hooks             (may import api types, validators, constants, types)
ui                (may import utils, constants, types — presentation only; NOT api/db/auth/hooks-data)
apps              (may import everything)

Platform split (§4A): shared layers above are RN-safe except @syn/ui (web) and future @syn/ui-native (native).
Web-only hooks and transport wiring live in apps/<app>/lib/hooks/, not in @syn/hooks.`

### 6.2 Import matrix (rows import columns; ✓ allowed, ✗ forbidden)

| ↓ imports →    | config | constants | types | utils | validators | db    | auth | ai      | api | hooks | ui  | apps |
| -------------- | ------ | --------- | ----- | ----- | ---------- | ----- | ---- | ------- | --- | ----- | --- | ---- |
| **utils**      | ✓      | ✓         | ✓     | –     | ✗          | ✗     | ✗    | ✗       | ✗   | ✗     | ✗   | ✗    |
| **validators** | ✓      | ✓         | ✓     | ✓     | –          | ✗     | ✗    | ✗       | ✗   | ✗     | ✗   | ✗    |
| **db**         | ✓      | ✓         | ✓     | ✓     | ✗          | –     | ✗    | ✗       | ✗   | ✗     | ✗   | ✗    |
| **auth**       | ✓      | ✓         | ✓     | ✓     | ✗          | ✓     | –    | ✗       | ✗   | ✗     | ✗   | ✗    |
| **ai**         | ✓      | ✓         | ✓     | ✓     | ✓          | ✗     | ✗    | –       | ✗   | ✗     | ✗   | ✗    |
| **api**        | ✓      | ✓         | ✓     | ✓     | ✓          | ✓     | ✓    | ✓       | –   | ✗     | ✗   | ✗    |
| **hooks**      | ✓      | ✓         | ✓     | ✓     | ✓          | ✗     | ✗    | ✗       | ✓\* | –     | ✗   | ✗    |
| **ui**         | ✓      | ✓         | ✓     | ✓     | ✗          | ✗     | ✗    | ✗       | ✗   | ✗     | –   | ✗    |
| **apps**       | ✓      | ✓         | ✓     | ✓     | ✓          | ✓\*\* | ✓    | ✗\*\*\* | ✓   | ✓     | ✓   | –    |

- `hooks` imports the `AppRouter` **type** from `api` for inference, not its runtime.
  ** apps import `@syn/db` only inside server code (RSC/route handlers/server actions), never in client components — and prefer the tRPC caller over raw db. \

**Hard bans (memorize):** `apps/* → apps/*` (✗ cross-app imports), `packages/* → apps/*` (✗), and any import that points **up** the layer list.

### 6.3 How specific flows cross boundaries

- **Circular dependencies** are prevented by the layering plus the `@syn/config/eslint/boundaries.js` import rules (`yarn lint:boundaries`). Internal package-layer edges and restricted third-party SDKs (`drizzle-orm`/`postgres`, `ai`/`@ai-sdk/*`, `web-push`, `stripe`/`resend`/`fuse.js`) are enforced with `checkAllOrigins: true`. If you need an upward import, the boundary is wrong — refactor, do not suppress the lint rule.
- **Two apps needing slightly different logic:** put the shared core in a package and **parameterize** it; app-specific divergence stays in the app. Never fork the package.
- **DB access from RSC vs. route handlers vs. server actions:** identical path in all three — go through `@syn/api` (the tRPC `createCaller` for RSC; procedures for handlers/actions), which sets the RLS context via `@syn/auth` + `@syn/db`'s `createRlsClient`. Drop to a raw `@syn/db` query only inside a procedure/service, never in a component. There is no client-side difference: the auth context must always be applied.
- **Auth context flow:** `proxy.ts` refreshes the session → `@syn/auth` `getSession`/`getUser` reads it server-side → tRPC `context.ts` attaches the user → `protectedProcedure` enforces it and sets the RLS context → policies apply. Client components receive the user from a provider seeded by the server layout.

---

## 7. FILE & FOLDER NAMING CONVENTIONS

**The governing rule: all filenames and folders are kebab-case. Identifiers inside files keep their normal casing.** Filename casing and identifier casing are decoupled on purpose — the file `day-item-row.tsx` exports `function DayItemRow()`. This is chosen because (1) it matches shadcn/ui output, so installed components never create a mixed-casing seam; (2) it is case-sensitivity-safe between macOS (case-insensitive) and Linux CI (case-sensitive); (3) one uniform filename rule is the most legible for an AI agent.

### 7.1 Folders

| Rule             | Detail                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Casing           | **kebab-case** always (`radial-action-menu/`, `insight-card/`)                                                                                   |
| Plurality        | **plural** for collections (`components/`, `hooks/`, `routers/`, `prompts/`); **singular** for a single feature/segment (`session/`, `profile/`) |
| Private folders  | `_components/`, `_actions/`, `_lib/` — leading underscore = opt out of routing                                                                   |
| Route groups     | `(onboarding)`, `(app)` — parentheses = grouping without a URL segment                                                                           |
| Dynamic segments | `[session-id]`, `[layer]` — kebab inside brackets                                                                                                |

### 7.2 Files

| Kind                     | Filename                                             | Identifier inside                                     |
| ------------------------ | ---------------------------------------------------- | ----------------------------------------------------- |
| React component          | `session-thread-view.tsx`                            | `export function SessionThreadView()`                 |
| Component variants       | `button.variants.ts`                                 | `export const buttonVariants = cva(...)`              |
| Hook                     | `use-conflict-session.ts`                            | `export function useConflictSession()`                |
| Pure util                | `format-date.ts`                                     | `export function formatDate()`                        |
| Type module              | `day-item-view.ts`                                   | `export interface DayItemView`                        |
| Co-located feature types | `session.types.ts`                                   | local `…Props` / view-model types                     |
| Constants module         | `storage-keys.ts`                                    | `export const STORAGE_KEYS = {...} as const`          |
| Zod validator            | `session.ts` (in validators)                         | `export const postMessageInput = z.object(...)`       |
| AI prompt module         | `conflict-coach.ts`                                  | `export const conflictCoachPrompt`                    |
| tRPC router              | `session.ts` (in routers)                            | `export const sessionRouter`                          |
| Service                  | `perspective.ts` (in services)                       | `export async function generatePerspective()`         |
| Server action            | `end-session.ts`                                     | `'use server'` + `export async function endSession()` |
| Route handler            | `route.ts`                                           | Next.js required name; `export function POST()`       |
| Next special files       | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` | Next.js required names                                |
| Test                     | `format-date.test.ts`                                | co-located beside the file under test                 |
| Story                    | `button.stories.tsx`                                 | co-located in the component folder                    |
| Barrel                   | `index.ts`                                           | re-exports a package's public API                     |

### 7.3 Specific conventions

- **Types:** use a co-located `.types.ts` when a feature has several view/prop types; keep a single component's prop type **inline** in its `.tsx`. Shared shapes → `@syn/types`.
- **Constants:** `SCREAMING_SNAKE_CASE` for primitive identifiers; `as const` objects for grouped maps. File is kebab-case regardless.
- **Hooks:** `use-` filename prefix and `useX` identifier, always.
- **Server actions:** verb-named, in the segment's `_actions/`, first line `'use server'`.
- **Index/barrel files:** use at a **package root** (the public API). **Avoid deep internal barrels** inside a package — they invite circular deps and weaken tree-shaking. Inside an app feature, prefer direct imports over per-folder `index.ts`.
- **Client/server signal:** **no `.client`/`.server` filename suffix.** Server is the unmarked default; client is `'use client'` line 1 + `_components/` placement.

---

## 8. COMPONENT CONVENTIONS

### 8.1 When JSX becomes a component

Extract a component when any is true: it is **reused**, it exceeds ~30 lines of JSX, it owns **state/effects**, or it marks a **server→client boundary**. Otherwise keep it inline.

### 8.2 Anatomy (the fixed order)

tsx

`'use client'; // only if this is a client component — line 1

import { ... } from 'react';
import { Button } from '@syn/ui/button';

interface MessageBubbleProps { // 1. props interface directly above the component
body: string;
author: 'person' | 'coach';
}

export function MessageBubble({ body, author }: MessageBubbleProps) { // 2. named function
// ...
}`

### 8.3 Decisions

- **Named exports, not default.** Every component, hook, and util is a **named export**. Rationale: stable autocomplete, safe renames across the repo, no import-name drift, and grep-ability. The **only** default exports are the ones Next.js forces (`page.tsx`, `layout.tsx`, `error.tsx`, etc.).
- **Variants via `cva` + `cn`.** Define variants in a `.variants.ts` beside the component; merge classes with `cn()`. Do not hand-roll conditional class strings.
- **Promotion to `@syn/ui`:** a component moves from app-local to `@syn/ui` when a **second app or route** needs it **and** it is presentational (no data fetching, no app-specific business logic). Data-bound components stay in the app.
- **Compound components:** expose subcomponents as properties of the parent (`InsightCard.Header`, `InsightCard.Body`) and keep them in one component folder.
- **Server vs client signal:** pages/layouts stay server shells; interactive pieces are client leaves in `_components/` with `'use client'` line 1. No filename suffix.
- **Component-specific types:** the props `interface` lives **inline** in the `.tsx`. Promote to `.types.ts` only when a sibling needs the same type, to `@syn/types` only when another package does.

---

## 9. STATE MANAGEMENT CONVENTIONS

One tool per kind of state. Do not reach for a heavier tool than the kind requires.

| Kind of state                                             | Tool                                                                                                    | Where                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Server state** (anything from the DB/API)               | **TanStack Query** via the tRPC client                                                                  | hooks in `@syn/hooks` / app `lib/trpc` |
| **Form state**                                            | **React Hook Form** + `zodResolver` using `@syn/validators` schemas                                      | the form's client component           |
| **URL state** (filters, selected tab, deep-linkable view) | **nuqs** (`useQueryState`)                                                                              | the route's client component          |
| **Local component state**                                 | `useState` / `useReducer`                                                                               | the component                         |
| **Global client state** (rare)                            | **React Context** for session/user/theme; **Zustand** only if a genuine cross-tree client store appears | app providers                         |

**Rules:**

- **Server data never goes in global state.** TanStack Query owns it — it is the cache. Copying server data into Context/Zustand creates two sources of truth.
- **Derived values are computed, not stored.** Do not put in state what can be derived from existing state during render.
- **URL state for anything shareable or deep-linkable** — the UX deep-links from notifications (suggested update, agreement due), so the targeted view's selection belongs in the URL via nuqs, not component state.
- **Form state stays in React Hook Form**, validated by the same Zod schema the tRPC mutation uses — client and server validate identically.
- **Never put in global state:** server data, secrets/tokens, raw PII beyond what a single interaction needs, or anything derivable. Realtime/session liveness is server state (TanStack Query + Supabase Realtime), not a global store.
- **Live session sync** is Supabase Realtime feeding the TanStack Query cache (invalidate/patch on change events), not a bespoke websocket store.

---

## 9A. ERROR HANDLING CONVENTIONS

A consistent error strategy is part of the logic layer, not an afterthought.

- **Throw typed domain errors from services**, not bare strings. Use a small error taxonomy with a shared base (e.g. `AppError` with a `code` field) and specific subclasses (`SessionConflictError`, `NotAuthorizedError`). **Shared** errors → `packages/utils/src/errors.ts` (or a dedicated module re-exported from `@syn/utils`). **App-local** errors → `apps/<app>/lib/errors.ts`. Never throw raw `Error("…")` for domain outcomes you expect to handle at a boundary.
- **Throw deep, catch at the boundary.** Services and multi-step logic in `@syn/api/services/` throw; the _entry seam_ catches and shapes the response. Boundaries: Server Action wrapper, route handler (`route.ts`), or tRPC `errorFormatter`. Do not litter try/catch through the service core.
- **Never leak raw db or provider errors to the client.** Map known domain errors to safe messages/codes at the boundary; everything else becomes a generic 500 plus a logged trace.
- **Log at the boundary via `@syn/observability`**, with request/user context — not scattered `console.log` deep in services. One structured log per failed operation beats many breadcrumbs.
- **`Result` vs `throw`:** default to **`throw`** (composes with React/Next error boundaries and tRPC's error channel). Use `Result<T, E>` only for _expected, branchy_ outcomes the caller must handle inline (e.g. validation the UI renders as a field error). Do not make every function return a `Result` — that's friction on the common path.

---

## 10. HOW TO BRIEF CURSOR (AI AGENT INTERFACE)

This section is for the developer. It is the meta-layer that makes the rest of this document operational.

### 10.1 Context to attach every session

Always attach, in this order: **this conventions doc**, **`tech-stack.md`**, the **UX handoff** (or the relevant excerpt), **`drizzle-orm-conventions.md`** (pinned ORM syntax), and the **specific ticket**. For UI work, also attach the relevant Storybook component or its file.

### 10.2 Standard opening block (paste at the start of a session)

`You are building inside the Synapse Turborepo (yarn workspaces,
Next.js App Router, TypeScript strict, Drizzle, tRPC, Supabase, Tailwind + Radix).

Follow codebase-conventions.md exactly. Non-negotiables:

- Decide file placement by "who imports this?" One app → in the app. Two+ apps
  or mobile → packages/. (§1, §6)
- All filenames kebab-case; identifiers keep normal casing. (§7)
- Server Components default; client = 'use client' line 1 + \_components/ folder;
  no .client suffix. (§3, §8)
- tRPC for all client-initiated data ops; exceptions only per §3.5 (streaming AI
  = route handler; realtime = Supabase; webhooks/callbacks = route handler).
- Thin resolvers/handlers; multi-step logic → a service in @syn/api/services. (§3.5)
- Constants (runtime values) → @syn/constants or domain; types (compile-erased)
  → @syn/types. A const is never a type. (§4.8, §8)
- Named exports only (except Next-required default exports). (§8.3)
- Respect the import matrix; never import up a layer or across apps. (§6)
- Pinned Drizzle: never change drizzle-orm/drizzle-kit versions; use the syntax in
  drizzle-orm-conventions.md.

Before writing, state: (1) which files you will create/edit and their exact paths,
(2) which packages you will import from. Wait for my confirmation on placement, then implement.`

### 10.3 Ticket format

`TICKET: <short imperative title>
SURFACE: <route / package / component this touches, e.g. apps/web/session>
GOAL: <one paragraph — what the user can do after this is built>
ACCEPTANCE CRITERIA:

- <observable behavior 1>
- <observable behavior 2>
  DATA: <new/changed schema, validators, or types — or "none">
  AI: <touchpoint involved + streaming or structured — or "none">
  OUT OF SCOPE: <explicitly what NOT to build>`

### 10.4 Telling Cursor where code goes

Do not let the agent choose placement freely. Paste the relevant **§11 cheat-sheet rows** for the categories the ticket touches, and require it to echo back the exact file paths before implementing. If the ticket adds a shared type, name the package (`@syn/types`); if it adds a runtime constant, name it (`@syn/constants`); if it adds a mutation, state tRPC vs. server action per §3.5.

### 10.5 Correction language (use verbatim)

- _"Wrong location. Per §6, packages cannot import from apps. Move this to `@syn/<x>` and import it back into the app."_
- _"That is a runtime value, not a type. Per §4.8 it goes in `@syn/constants`, not `@syn/types`."_
- _"This resolver has multi-step logic. Per §3.5, extract it to a service in `@syn/api/services/` and call it from the thin procedure."_
- _"This is a client component. Per §8, add `'use client'` on line 1 and move it into `_components/`. Remove the `.client` suffix."_
- _"Rename to kebab-case per §7. Keep the identifier `PascalCase`."_
- _"Default export not allowed here (§8.3). Use a named export."_
- _"Streaming AI does not go through tRPC (§3.5). Move it to a route handler that calls the service."_

### 10.6 New session vs. continue

**Start a new session** when switching to an unrelated surface, when the context window is saturated with stale exploration, or after a large refactor changed the ground truth. **Continue** within a single feature/ticket so the agent retains the local patterns it just established. Re-attach this doc at the start of every new session — never rely on it persisting.

### 10.7 Pre-accept checklist (run before accepting AI output)

1. **Location** — is each file in the path §11 prescribes?
2. **Naming** — kebab filenames; correct identifier casing; `use-` for hooks; `route.ts` for handlers?
3. **Imports** — resolving from the right `@syn/*` packages; no up-layer or cross-app imports (§6)?
4. **Server/client** — server default; client leaves marked `'use client'` line 1 in `_components/`?
5. **tRPC discipline** — thin resolver; logic in a service; exceptions handled per §3.5?
6. **Constant vs type** — runtime values in `@syn/constants`, types in `@syn/types`?
7. **Validation** — every tRPC input and form uses a `@syn/validators` Zod schema?
8. **Exports** — named exports (except Next-forced defaults)?
9. **Pattern match** — does it mirror the adjacent files in the same folder?
10. **RLS/auth** — does any new DB access run through a protected procedure that sets the RLS context?

---

## 11. WHAT GOES WHERE — QUICK REFERENCE

Paste this table at the top of a Cursor session. Every category, its canonical location, a kebab example.

| Code type                        | Location                                                     | Example file              |
| -------------------------------- | ------------------------------------------------------------ | ------------------------- |
| Shared UI component              | `packages/ui/src/primitives/<name>/` or `…/composed/<name>/` | `button.tsx`              |
| App-level shared component       | `apps/web/components/`                             | `start-session-cta.tsx`   |
| Feature-local client component   | `apps/web/app/**/_components/`                     | `session-thread-view.tsx` |
| App page                         | `apps/web/app/**/page.tsx`                         | `page.tsx`                |
| App layout                       | `apps/web/app/**/layout.tsx`                       | `layout.tsx`              |
| Database schema                  | `packages/db/src/schema/`                                    | `session.ts`              |
| DB client (singleton)            | `packages/db/src/client.ts`                                  | `client.ts`               |
| Migration                        | `packages/db/migrations/`                                    | `0001_add_agreements.sql` |
| tRPC router                      | `packages/api/src/routers/`                                  | `session.ts`              |
| Service (multi-step logic)       | `packages/api/src/services/`                                 | `perspective.ts`          |
| Server action (web-only)         | `apps/web/app/**/_actions/`                        | `end-session.ts`          |
| Route handler (webhook/callback) | `apps/<app>/app/api/**/route.ts`                             | `route.ts`                |
| Streaming AI endpoint            | `apps/web/app/api/ai/**/route.ts`                  | `route.ts`                |
| Shared type                      | `packages/types/src/` (or `domain/`)                         | `view.ts`                 |
| App-local feature type           | co-located `*.types.ts`                                      | `session.types.ts`        |
| Shared runtime constant          | `packages/constants/src/`                                    | `storage-keys.ts`         |
| App-local route builder          | `apps/web/lib/routes.ts`                           | `routes.ts`               |
| Zod validator                    | `packages/validators/src/`                                   | `profile.ts`              |
| Shared pure util                 | `packages/utils/src/`                                        | `format-date.ts`          |
| Typed domain error               | `packages/utils/src/errors.ts` (shared) or `apps/<app>/lib/errors.ts` (local) | `session-conflict-error.ts` |
| App-local util/glue              | `apps/web/lib/`                                    | `realtime.ts`             |
| Shared React hook (portable)     | `packages/hooks/src/`                                        | `use-conflict-session.ts` |
| Web-only hook                    | `apps/web/lib/`                                    | `use-media-query.ts`      |
| Supabase auth helper             | `packages/auth/src/`                                         | `session.ts`              |
| RLS-scoped DB client             | `packages/db/src/rls.ts`                                     | `rls.ts`                  |
| Env var access (typed)           | `apps/<app>/env.ts` (+ `import "./env"` in `next.config.ts`) | `env.ts`                  |
| Tailwind token preset            | `packages/config/tailwind/preset.css`                        | `preset.css`              |
| ESLint / tsconfig base           | `packages/config/{eslint,tsconfig}/`                         | `base.json`               |
| Storybook story                  | beside the component                                         | `button.stories.tsx`      |
| Test                             | beside the file under test                                   | `format-date.test.ts`     |

---

_End of document. This is the canonical codebase-conventions source of truth for Synapse. Keep it paired with `tech-stack.md` and the UX-handoff doc. Update a rule here only by editing this file, and re-attach it at the start of every AI build session._
