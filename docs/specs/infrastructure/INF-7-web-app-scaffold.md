# INF-7 — `apps/web` scaffold: env tiers, `next.config`, root layout, route skeleton, route builders, entry

**Epic:** INF — Infrastructure · **Phase 3** · Size: L
**Slice type:** App composition — the failure classes are a `process.env` read outside `env.ts`, a client component reading a non-literal env name, a route group that inherits the wrong layout, and a hardcoded path.

**Status:** Not started

---

## Outcome

`apps/web` is a Next 16 App Router app shaped like CC's toolkit: `env.ts` is the only `process.env` reader (t3-env + zod, tier-resolved); `next.config.ts` loads env, collapses tiers via `buildSupabaseEnvForNextConfig` and `buildDatabaseEnvForNextConfig`, transpiles `@syn/*`, serves `/sw.js` with CC's headers, and allows LAN dev origins; `proxy.ts` refreshes the session; the root layout mounts Geist + Newsreader, `ThemeProvider`, `Toaster`, `NuqsAdapter`, and (from INF-8) `TrpcProvider`; three route groups exist — `(auth)`, `(setup)`, `(shell)` — with placeholder pages at every route in the cross-cutting §4.1 table; `lib/routes.ts` has a builder for each; `lib/entry/resolve-entry.ts` implements the §4.2 decision tree; `(shell)/layout.tsx` gates on a verified session and runs the entry redirect; `not-found.tsx` and `error.tsx` exist. Every placeholder page renders its screen ID in a `Heading` and nothing else — feature epics replace them.

## Why / intent

- **Cross-cutting §4.1 (routes), §4.2 (entry decision tree), §4.3 (tab state), §2 (breakpoints, containers), §11 (landmarks).** **Epic 1 §0.4** — the IA. **Official spec §9.4** — the two typefaces.
- **CC `codebase-conventions.md` §3 (universal app rules), §3.1 (toolkit layout), §3.5 (tRPC vs handlers)**; **CC `apps/toolkit/{env.ts, next.config.ts, proxy.ts, app/layout.tsx, app/(app)/layout.tsx, lib/routes.ts, lib/onboarding/entry-state-to-route.ts, lib/env/resolve-tier-env.ts}`**; **CC `scripts/local-dev-origins.mjs`**.
- **v2 handoff §3.3** — the app tree (with the README path remap), §6.2 prose for `app/layout.tsx`.
- **What this slice is NOT (binding):** no screen content, no shell components (`AppShell`, `TabBar`, `Rail`, `AppHeader`, `StatusLine` — feature-track composites per the handoff), no tRPC (INF-8), no manifest/service worker (INF-9). `(shell)/layout.tsx` renders `children` inside a `main` with a skip link; the shell chrome arrives with Epic 2's first ticket.
- **Ground truth:** `@syn/ui` has tokens, `ThemeProvider`, `Toaster`, `Text` (INF-3/4); `@syn/db` and `@syn/auth` export the env builders (INF-5/6); `proxy.ts`, the auth routes, and the auth `lib/` files exist (INF-6).

**Rulings this slice makes (labelled, logged):**

- **`env.ts` is CC's toolkit `env.ts` reduced to Synapse's surface**: server — `DATABASE_ENVIRONMENT` (enum, **default `"local"`**), `NODE_ENV`, the six tier database URLs, `SUPABASE_SERVICE_ROLE_KEY[_STAGING]`, `SUPABASE_SECRET_KEY[_STAGING]`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET` (min 16), `GOOGLE_OAUTH_CLIENT_ID/SECRET` (optional; documented as dashboard-only); client — `NEXT_PUBLIC_SUPABASE_URL[_STAGING]`, `NEXT_PUBLIC_SUPABASE_ANON_KEY[_STAGING]`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY[_STAGING]`, `NEXT_PUBLIC_SITE_URL[_LOCAL|_STAGING]`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN`. Every Stripe, Resend, AI, marketing, referral, and `RELATIONSHIPS_URL` entry is deleted. `lib/env/resolve-tier-env.ts` is CC's with the same deletions and `siteUrl` resolution (local → `http://localhost:3000` regardless of what is set — taylor-aucoin's hard-won rule, adopted). Logged.
- **Route groups:** `(auth)` — no shell, centred column; `(setup)` — no shell, `StepFrame` later; `(shell)` — the signed-in frame. Matches CC's `(onboarding)` / `(app)` split and Epic 1 §0.4. Logged.
- **`(shell)/layout.tsx` is the auth gate** (CC `(app)/layout.tsx` pattern): cookie-bound server client → `getUser` → redirect `signInRoute(next)` if none → `requireVerifiedEmail` → `resolveEntry` (setup incomplete on the first three launches → `/setup/{step}`) → render. `(setup)/layout.tsx` gates on session only. `(auth)` has no gate but redirects a signed-in user to `/` (Epic 1 AU-01 "already signed in: never shown"). Logged.
- **Entry decision tree is `lib/entry/resolve-entry.ts`** (CC's `entry-state-to-route.ts` shape): input `{ user, profile: { firstRunCompletedAt, firstRunStep, launchCount } | null, intendedRoute }` → route string; the "first three launches" counter is a cookie `syn_launches` incremented by the layout `[VESPER CALL in the cross-cutting doc; the cookie is the cheapest honest implementation — cost if wrong: swap to a `users` column later]`. Logged.
- **Fonts through `next/font/google`** (INF-3 ruling): `Geist({ subsets:["latin"], variable:"--font-geist-sans" })`, `Newsreader({ subsets:["latin"], axes:["opsz"], variable:"--font-newsreader", style:["normal","italic"] })` on `<html className>`. Logged.
- **`allowedDevOrigins` from CC's `scripts/local-dev-origins.mjs`** (copied to `scripts/`), plus `print-local-urls.mjs` for `web:dev:local`. Logged.

## Behaviour & states

**Surfaces:** every route renders a placeholder; the observable behaviour is routing and gating.

### Files (exact)

- `apps/web/env.ts` — per the ruling; `export const env = { ...rawEnv, ...resolved }` and `export type Env`.
- `apps/web/lib/env/resolve-tier-env.ts` — CC's, reduced; exports `resolveWebTierEnv(raw)` returning `{ databaseEnvironment, databaseUrl, directDatabaseUrl, supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey, siteUrl, vapidPublicKey }`.
- `apps/web/next.config.ts` — CC toolkit's: `loadEnvConfig(root)`; `import "./env"`; `env: { ...supabaseEnv, ...databaseEnv, NEXT_PUBLIC_SITE_URL }`; `transpilePackages` = the eleven `@syn/*`; `headers()` for `/sw.js` (CC's three headers); `experimental.extensionAlias`; `turbopack.root` and `outputFileTracingRoot` = repo root; `images.dangerouslyAllowLocalIP` in dev, `localPatterns` for `/icons/**`; `allowedDevOrigins: getLocalDevOrigins()`. No redirects yet.
- `apps/web/app/layout.tsx` — CC toolkit's shape: fonts; `metadata` (`title: "Synapse"`, `description` = official spec §2.1 first clause, `appleWebApp.capable`); `viewport` (`themeColor` light `#FAFAF8` / dark `#151412` via the media-query form, `viewportFit: "cover"`); `<html lang="en" suppressHydrationWarning className={fonts}>`; `<body className="min-h-full bg-paper text-ink">`; `ThemeProvider` → `NuqsAdapter` → `TrpcProvider` (INF-8 adds; leave a marked slot) → `children`; `Toaster`. `ServiceWorkerRegistration` slot for INF-9.
- `apps/web/app/globals.css` — as INF-3 left it.
- `apps/web/app/page.tsx` — a server component that calls `resolveEntry` and `redirect()`s (`/` never renders).
- `apps/web/app/(auth)/layout.tsx` — centred `max-w-sm` column, redirects signed-in users to `/`.
- `apps/web/app/(auth)/{signin,signup,verify,forgot,reset,invite}/page.tsx` — placeholders (`Heading` "AU-01 Sign in", …).
- `apps/web/app/(setup)/layout.tsx` — session gate; `apps/web/app/(setup)/setup/[step]/page.tsx` — placeholder validating `step ∈ 1..5` (else `notFound()`).
- `apps/web/app/(shell)/layout.tsx` — the gate ruled above; renders a skip link (`<a href="#main">Skip to today's list</a>`, visually hidden until focus), `<main id="main">`, `children`. No chrome.
- `apps/web/app/(shell)/{today,today/schedule,day/[date],day/[date]/schedule,day/[date]/item/[id],review,review/day/[date],review/week/[week],review/week/[week]/habit/[id],review/history,settings,settings/{account,habits,habits/[id],templates,templates/[id],week,week/[week],categories,reasons,notifications,day,appearance,data,share,about}}/page.tsx` — placeholders naming their screen IDs; `[date]` validates `YYYY-MM-DD`, `[week]` validates `YYYY-Www`, else `notFound()`.
- `apps/web/app/not-found.tsx`, `apps/web/app/error.tsx` — SY-05 copy (*This page isn't here.* / *Something went wrong on this screen. Your changes are kept.*) with a `Button` to `todayRoute()`; `error.tsx` is a client component.
- `apps/web/lib/routes.ts` — one builder per §4.1 route: `homeRoute`, `signInRoute(next?)`, `signUpRoute`, `verifyRoute`, `forgotRoute`, `resetRoute`, `inviteRoute`, `logoutRoute`, `authCallbackRoute`, `authConfirmRoute`, `setupRoute(step)`, `todayRoute`, `todayScheduleRoute`, `dayRoute(date)`, `dayScheduleRoute(date)`, `dayItemRoute(date, id)`, `reviewRoute`, `reviewDayRoute(date)`, `reviewWeekRoute(week)`, `reviewWeekHabitRoute(week, id)`, `reviewHistoryRoute`, `settingsRoute`, `settingsAccountRoute`, `settingsHabitsRoute`, `settingsHabitRoute(id)`, `settingsTemplatesRoute`, `settingsTemplateRoute(id)`, `settingsWeekRoute(week?)`, `settingsCategoriesRoute`, `settingsReasonsRoute`, `settingsNotificationsRoute`, `settingsDayRoute`, `settingsAppearanceRoute`, `settingsDataRoute`, `settingsShareRoute`, `settingsAboutRoute`; each returns a string; a `?notice=` helper `withNotice(path, flag)` (CC's `appendAuthQuery`).
- `apps/web/lib/entry/resolve-entry.ts` — per the ruling.
- `apps/web/lib/hooks/use-media-query.ts` — not created; the app imports `useIsWide` from `@syn/ui` (CC has a duplicate it plans to converge; Synapse starts converged).
- `scripts/local-dev-origins.mjs`, `scripts/print-local-urls.mjs` — copy CC's. Root `package.json` `web:dev:local` = `node scripts/print-local-urls.mjs 3000 && turbo run dev:local --filter=web`.
- `apps/web/package.json` — dependencies `@syn/{api?,auth,constants,db,hooks?,observability,types,ui,utils,validators}` (api/hooks arrive in INF-8), `@t3-oss/env-nextjs ^0.13`, `next 16.3.4`, `next-themes`, `nuqs ^2`, `react`, `react-dom`, `zod ^3`; devDependencies as INF-1 plus `@types/node`.
- `apps/web/vercel.json` — copy CC toolkit's, filter `web`.
- `.env.example` (root) — CC's shape with only the variables `env.ts` declares; per-app note: `apps/web/.env.local` holds the runtime subset; `packages/db/.env` the drizzle-kit URLs.

**States (exhaustive):** signed out → any `(shell)` route → `/signin?next=…` · signed in, unverified → `/verify` · signed in, setup incomplete, launches ≤ 3 → `/setup/{step}` · otherwise → `/today` · signed in → `/signin` → `/` · bad `[date]`/`[week]`/`[step]` → `not-found` · thrown render error → `error.tsx` · `NEXT_PUBLIC_SUPABASE_URL` missing in the browser → the browser client's message (INF-6).

## Non-negotiables (this slice)

- **`process.env` is read in `env.ts` only** (plus the literal `NEXT_PUBLIC_*` reads in the app-local browser client, which is CC's documented exception).
- **Every path comes from `lib/routes.ts`.** A hardcoded `"/today"` anywhere in `apps/web` outside `routes.ts` is a defect.
- **Server Components default; `"use client"` line 1 in `_components/`.** `error.tsx` is the one client file this ticket writes.
- **`(shell)` gates; `proxy.ts` refreshes.** Never the reverse.
- **No shell chrome, no screen content.** Placeholders only.

## Data & AI

**Schema changes: none.** **Tables:** `users` (read: `first_run_step`, `first_run_completed_at` for the entry tree — through the singleton `db` in the layout? **No** — through `createRlsClient` from `getRequestAuthContext()`; the layout is server code and the RLS rule holds). **Placement:** CC §3.1 tree, README remap. **tRPC / validators:** none yet (INF-8). **AI notes: None.** **Instrumentation: none.**

## Accessibility

- Skip link is the first focusable element in `(shell)` (cross-cutting §11); `<main id="main">` is the landmark.
- `<html lang="en">`; `suppressHydrationWarning` only on `<html>` (theme class).
- Placeholders use `Heading as="h1"` so every page has exactly one `h1` from day one.

## Acceptance criteria (observable)

1. `grep -rn "process\.env" apps/web --include=*.ts --include=*.tsx | grep -v "apps/web/env.ts" | grep -v "lib/clients/supabase/client.ts" | grep -v "lib/env/resolve-tier-env.ts"` returns nothing.
2. `grep -rnE "href=\"/|redirect\(\"/|push\(\"/" apps/web/app apps/web/components apps/web/lib --include=*.tsx --include=*.ts | grep -v routes.ts` returns nothing.
3. Every route in cross-cutting §4.1 has a `page.tsx` that renders its screen ID; `lib/routes.ts` has a builder whose output matches each path.
4. Signed out, `GET /today` → 307 to `/signin?next=%2Ftoday`; signed in and verified with `first_run_completed_at` null and `syn_launches` ≤ 3 → 307 to `/setup/1`; with `syn_launches` 4 → 200 on `/today`. *(Vigil: cookie manipulation.)*
5. `/day/2026-13-40` and `/review/week/2026-W60` return the not-found page; `/setup/6` too.
6. `next.config.ts` emits `NEXT_PUBLIC_SUPABASE_URL` from the staging var when `DATABASE_ENVIRONMENT=local`, verified by `console.log` of `nextConfig.env` in a one-off run (not committed).
7. `/sw.js` (an empty placeholder file until INF-9) is served with `Content-Type: application/javascript`, `Cache-Control: no-cache, no-store, must-revalidate`, and the CSP header.
8. `<html>` carries both font variables and the theme class toggles with `ThemeControl` in a placeholder settings page.
9. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn web:build` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- CC's `env.ts` calls `loadEnvConfig` itself so scripts and `drizzle.config` can import it; keep that.
- `SKIP_ENV_VALIDATION=true` exists for builds without secrets (CI); INF-10 decides whether CI builds with staging secrets or skips.
- The `[date]` validator belongs in `@syn/validators` (`dateKeySchema`, `weekKeySchema`) so the API reuses it — add both there rather than inline.

## Dev's call

Placeholder page markup · whether `(auth)/layout.tsx` centres with `ScreenFrame` (not yet built) or a plain `div` · the launches cookie's `maxAge`.

## Out of scope

- **Shell chrome, `StepFrame`, `AuthFrame`, every composite** — feature tracks. **tRPC provider/adapter** — INF-8. **Manifest, service worker, install** — INF-9. **Vercel project and env matrix** — INF-10.

## Depends on

- **INF-3** — `@syn/ui` tokens, `ThemeProvider`, `Toaster`, `Text`. **INF-5** — `buildDatabaseEnvForNextConfig`, `createRlsClient`, `users`. **INF-6** — `buildSupabaseEnvForNextConfig`, `proxy.ts`, auth routes, `getRequestAuthContext`, `requireVerifiedEmail`. All Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The env collapse and the gate/entry logic are cross-file and easy to get subtly wrong (a client read of a non-literal name, a gate in the proxy). The route skeleton itself is mechanical.

---

### Build kickoff (paste into the session)

> Build **INF-7 — `apps/web` scaffold** (attached spec). Model: **Opus**. **CC's toolkit app composition for Synapse: one `env.ts`, tier collapse in `next.config.ts`, the session gate in `(shell)/layout.tsx`, every §4.1 route as a placeholder with a builder — no chrome, no content.**
> Attach/read first, in order: this spec · `docs/ux/synapse_navigation_and_system_ux_architecture.md` §2, §4, §11 · `docs/ux/epic1_setup_ux_architecture.md` §0.4 · CC `codebase-conventions.md` §3, §3.1, §3.5 · CC `apps/toolkit/{env.ts,next.config.ts,app/layout.tsx,app/(app)/layout.tsx,lib/routes.ts,lib/env/resolve-tier-env.ts,lib/onboarding/entry-state-to-route.ts,vercel.json}` · CC `scripts/{local-dev-origins,print-local-urls}.mjs` · `~/lighthouse/taylor-aucoin/lib/config/env/resolve-tier-env.ts` (the site-URL rule) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Reduce CC's env to Synapse's surface; default tier `local`; local site URL always localhost. Close in three places; run `yarn lint && yarn lint:boundaries && yarn check-types && yarn web:build`.
