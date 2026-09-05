# Tech stack — the canonical choices and their pinned versions

**Status: locked.** Every version below is the one resolved in `yarn.lock` on
2026-09-04. Changing a pinned row is a `TECHNICAL-DECISIONS.md` entry, not a
commit.

The stack is Conscious Connections', chosen on purpose and adopted here so both
products share one set of infrastructure fixes. Boring technology, exciting
product: every unit of novelty budget goes to the day model, the review
resolver, and the privacy grammar — never the plumbing.

---

## Runtime and toolchain

| Choice | Version | Why this, and not the newer thing |
|---|---|---|
| Node | **22** (`.nvmrc`, `engines.node >=22`) | The scaffold arrived on 24; 22 is what `drizzle-kit` and Storybook 8 are validated against. |
| Yarn Berry | **4.13.0** (`packageManager`) | `nodeLinker: node-modules`, one lockfile. Never npm or pnpm. |
| TypeScript | **5.9.2** (exact) | Not 7. `drizzle-kit`, `typescript-eslint`, and Storybook 8 are known-good here; TS 7 is a compiler rewrite, and nothing in Synapse needs it. See `TECHNICAL-DECISIONS.md`. |
| Turborepo | **2.10.12** | `globalEnv` is load-bearing: an undeclared variable fails the turbo lint. |
| ESLint | **9.39.5** flat config | Two passes: code quality per package, import boundaries from the root. |
| Prettier | **3.7+** with `@ianvs/prettier-plugin-sort-imports` | |

## Framework and rendering

| Choice | Version | Notes |
|---|---|---|
| Next.js | **16.3.4** App Router | **`proxy.ts`, not `middleware.ts`.** Session refresh only; route protection is in layouts. |
| React | **19.2.8** | Server Components by default; `"use client"` on line 1 of a leaf. |
| nuqs | **2.10.1** | URL state — a tab, a filter, an open sheet. |

## Styling

| Choice | Version | Notes |
|---|---|---|
| Tailwind | **4.3.3**, CSS-first | Tokens in `packages/config/tailwind/preset.css`, the only file where a hex may appear. |
| Radix (via shadcn) | **radix-ui 1.6.7** | The consolidated package, which is the current CLI's output. |
| CVA + `cn()` | `class-variance-authority` + `clsx` + `tailwind-merge` | Every `cva()` lives in a sibling `.variants.ts`. |
| next-themes | **0.4.6** | Class strategy on `<html>`, `storageKey: "syn:theme"`. Unpatched — CC's patch was checked and is not needed here. |
| lucide-react | **1.41.0** | Icons never appear without a text label (official spec §9.9). |
| sonner | **2.0.8** | One toast at a time, and only for undo. |
| Storybook | **8.6.18** on `@storybook/react-vite` | Not `@storybook/nextjs`: Next 16 removed `next/config`, which its preset still needs. |

## Data

| Choice | Version | Notes |
|---|---|---|
| Drizzle ORM | **0.45.2** (exact, pinned at the root) | Never bumped without a logged decision. The pin is what stops an agent emitting stale syntax. |
| drizzle-kit | **0.31.10** (exact) | `schemaFilter: ["public"]` — Supabase owns `auth`, `storage`, `realtime`, `vault`. |
| postgres.js | **3.4.9** | `prepare: false`, which the transaction pooler requires. |
| Supabase Postgres | — | Two hosted projects (staging, production) plus local. RLS deny-by-default, owner-private. |

## Identity

| Choice | Version | Notes |
|---|---|---|
| Supabase Auth via `@supabase/ssr` | **0.10.3** / `supabase-js` **2.115.0** | Google primary, email + password secondary, email confirmation required. No magic links (official spec §4.1). |

## The typed contract

| Choice | Version | Notes |
|---|---|---|
| tRPC | **11.18.0** + `superjson` **2.2.6** | Two procedure tiers. `AppRouter` is exported as a type — that is why tRPC is here, for the future Expo client. |
| TanStack Query | **5.102.8** | The server-data cache, and the only one. |
| React Hook Form + Zod | **7.87.0** / **zod 3.25.76** | Zod stays on **v3**: `@hookform/resolvers` and `@t3-oss/env-nextjs` are validated against it. |
| Zustand | **5.0.15** | Declared, with **no store on disk**. See `apps/web/lib/stores/README.md` for the rule and the one sanctioned escalation. |

## Delivery

| Choice | Notes |
|---|---|
| Vercel | One project, root `apps/web`. Production → `production` tier, Preview → `staging`. |
| Web Push | `web-push` **3.6.7**, VAPID, imported only in `@syn/api`. |
| GitHub Actions | `lint → lint:boundaries → check-types → build`, with no secrets. |

---

## Deliberately not in the stack

- **No AI.** Phase 1 has no model call, no `@syn/ai`, no inference budget. The
  coach is recorded as a future possibility in official spec §7.7 and is not
  designed.
- **No billing.** No Stripe, no entitlement, no paywall.
- **No marketing site**, no second app, no social surface.
- **No analytics or engagement telemetry.** Official spec §9.1 rules it out;
  §8.5 rules out the notifications that would feed it. A crash reporter is a
  later decision, and whatever is chosen must never receive item titles, notes,
  or reasons.
- **No tests — yet, and deliberately.** Tests are a finalization pass after
  human QA, not a slice obligation. Verification during a slice is
  `yarn lint && yarn lint:boundaries && yarn check-types && yarn build`, plus
  the ticket's own observable criteria.
- **No offline caching.** The service worker pushes and caches nothing; Phase 1
  blocks writes offline with the standard line (cross-cutting §6.1).
