# INF-8 — `@syn/api`, `@syn/hooks`, client wiring, and the client-state conventions

**Epic:** INF — Infrastructure · **Phase 3** · Size: M
**Slice type:** The typed contract and its rails — the failure classes are a procedure that reads through the singleton `db` (RLS bypassed), a hook in `@syn/hooks` that touches the DOM or the tRPC client instance, and server data copied into a client store.

**Status:** Complete (2026-09-04)

---

## Outcome

`@syn/api` is CC's tRPC package with Synapse's two procedure tiers (`publicProcedure`, `protectedProcedure`), a context that resolves the Supabase user into an `AuthContext` and an RLS client, superjson, CC's error formatter, and one real router — `user` — with `me` (reads the caller's shadow row) and `updatePreferences` (theme, timezone, day-close, review time; validated by `@syn/validators`). `@syn/hooks` is platform-pure and holds `useZodForm`/`fieldErrorProps`/`visibleFieldError`. `apps/web` has the fetch adapter at `/api/trpc/[trpc]`, `lib/trpc/{client,provider,server}.ts`, `TrpcProvider` mounted in the root layout, and `lib/stores/` with the Zustand convention documented and no store yet. The placeholder `/settings/appearance` page reads `user.me` through the server caller and renders `ThemeControl` — the first end-to-end signed-in read through RLS.

## Why / intent

- **CC `codebase-conventions.md` §3.5 (tRPC default and exceptions), §4.2 (`@cc/api`), §4.9 (`@cc/hooks`), §4A (platform split), §9 (state management: one tool per kind), §9A (errors).** **CC `docs/ai-guides/trpc-foundation-patterns.md`** — the copy-paste reference for context, tiers, `TRPCError` codes, and the RLS rule. **CC `packages/api/src/{trpc,context,root,index}.ts`**, **CC `apps/toolkit/{lib/trpc/*, app/api/trpc/[trpc]/route.ts}`**, **CC `packages/hooks/src/{use-zod-form,index}.ts`**.
- **Official spec §3.1** — the user fields `updatePreferences` writes; **Epic 1 ST-08/ST-09** — the settings that read them.
- **The founder's "same zustand store"** — CC declares `zustand ^5` in the toolkit and its conventions §9 say React Context first, Zustand only on escalation; CC has **no** Zustand store on disk today. Synapse adopts the same rule and the same dependency, and names the first sanctioned escalation (below).
- **What this slice is NOT (binding):** no domain routers (habits, templates, days, review — the feature tech spec), no server actions, no Realtime, no Zustand store file.
- **Ground truth:** INF-6 landed `getRequestAuthContext()`; INF-7 landed the root layout with a marked `TrpcProvider` slot and the placeholder pages.

**Rulings this slice makes (labelled, logged):**

- **Two procedure tiers only.** `publicProcedure` and `protectedProcedure` (requires `ctx.authContext` and `ctx.rls`). No `coupleProcedure`, `adminProcedure`, beta gate. Logged.
- **Context shape:** `{ supabase, user, authContext, rls }` — CC's minus `coupleId`/`coupleRole`; `createContext` calls `ensureLocalUserFromSupabaseAuth` as CC does (harmless on hosted tiers; required locally). Logged.
- **`TRPCError` conventions are CC's**: `UNAUTHORIZED` in middleware only; `NOT_FOUND` for a row absent within the caller's scope; `BAD_REQUEST` when input passes zod but fails a rule. Copied into `trpc.ts`'s header. Logged.
- **Zustand: the rule and the first escalation.** Rule (CC §9): server data never goes in a client store; URL state in nuqs; forms in RHF; local state in `useState`; cross-tree client state in Context; Zustand only when a Context would re-render a wide tree at high frequency. **The first sanctioned Zustand store is the running-timer tick** (`useTimerStore` — elapsed seconds at 1 Hz consumed by the item row, the item sheet, the tab title, and a future persistent notification) — created by Epic 2's timer ticket, not here. `lib/stores/README.md` records this so no one reaches for Zustand first. Logged.
- **`useZodForm` defaults stay CC's (blur-first) at the package level**; Synapse forms pass `mode: "onSubmit"` (Epic 1 §0.3) — the handoff's D6 — so the package remains a verbatim copy and the product rule lives at the call sites (a one-line `useSynapseForm` wrapper in `apps/web/lib/forms/use-synapse-form.ts` fixes the modes). Logged.

## Behaviour & states

**Surface:** `/settings/appearance` placeholder becomes the smoke test.

### Files (exact)

**`packages/api/`**
- `package.json` — CC's; rename; dependencies `@syn/{auth,constants,db,observability,types,utils,validators}`, `@supabase/supabase-js`, `@trpc/server ^11.4`, `superjson ^2.2`, `web-push ^3.6` (INF-9 uses it; declared here because the boundaries rule owns `web-push` to `api`), `zod ^3`.
- `src/trpc.ts` — CC's `initTRPC` with superjson and the `errorFormatter` that logs unhandled 500s via `@syn/observability` (`describeCause` copied); `isAuthed` middleware; exports `router`, `createCallerFactory`, `middleware`, `publicProcedure`, `protectedProcedure`. Delete `isCoupled`, `isAdmin`, `isCoupleWritable`, `isBetaAuthed`.
- `src/context.ts` — CC's reduced per the ruling; `Context`, `CreateContextInput`, `createContext`.
- `src/routers/user.ts` — `userRouter = router({ me: protectedProcedure.query(...), updatePreferences: protectedProcedure.input(updatePreferencesInput).mutation(...) })`; both through `ctx.rls.execute(tx => …)`; `me` returns `{ id, email, displayName, timezone, dayCloseTime, reviewReminderTime, theme, firstRunStep, firstRunCompletedAt }`; `NOT_FOUND` if the shadow row is missing.
- `src/services/user/preferences.ts` — the multi-step write (`updatePreferences(rls, userId, input)`) so the resolver stays thin (CC §3.5 rule 9).
- `src/root.ts` — `appRouter = router({ user: userRouter })`, `AppRouter`, `createCaller`.
- `src/index.ts` — exports `appRouter`, `AppRouter`, `createContext`, `createCaller`, `Context`.
- `tsconfig.json`, `eslint.config.mjs` — CC's. Root `tsconfig.json` references gain `./packages/api`, `./packages/hooks`.

**`packages/validators/src/user.ts`** (INF-2's package; this ticket adds one module): `updatePreferencesInput = z.object({ displayName?, timezone?, dayCloseTime?, reviewReminderTime?, theme? }).partial()` composed from INF-2's `themePreferenceSchema`, `timezoneSchema`, `clockTimeSchema`; `dateKeySchema`, `weekKeySchema` (INF-7's advisory).

**`packages/hooks/`**
- `package.json` — CC's; rename; dependencies `@syn/{constants,types,validators}`, `@hookform/resolvers ^3.10`, `react-hook-form ^7.66`, `zod ^3`; devDependencies add `@syn/api` (type-only), `@tanstack/react-query ^5`, `@trpc/react-query ^11`, `react`; peers as CC.
- `src/use-zod-form.ts` — copy CC's verbatim. `src/index.ts` — exports it. Nothing else yet (CC's example hooks are CC-domain).
- `tsconfig.json`, `eslint.config.mjs` — CC's.

**`apps/web/`**
- `lib/trpc/client.ts` — CC's (`createTRPCReact<AppRouter>()`).
- `lib/trpc/provider.tsx` — CC's `TrpcProvider` (QueryClient `staleTime` 30 s, `httpBatchLink` to `/api/trpc`, superjson).
- `lib/trpc/server.ts` — CC's `getServerApi` (cached, cookie-bound).
- `app/api/trpc/[trpc]/route.ts` — CC's fetch adapter (cookie header parsed for the server client).
- `app/layout.tsx` — mount `TrpcProvider` in the slot INF-7 left.
- `lib/forms/use-synapse-form.ts` — `export function useSynapseForm<T>(props) { return useZodForm({ ...props, mode: "onSubmit", reValidateMode: "onChange" }); }` + re-export of `fieldErrorProps`.
- `lib/stores/README.md` — the Zustand rule and the first-escalation note; `lib/stores/.gitkeep`.
- `app/(shell)/settings/appearance/page.tsx` — server component: `const api = await getServerApi(); const me = await api.user.me();` → renders `Heading` "ST-09 Appearance" and `<ThemeControl />` (client) — the theme itself is `next-themes` + `localStorage`; persisting `theme` to `users.theme` through `user.updatePreferences` is the Epic 1 ST-09 ticket's job, not this smoke test's.
- `package.json` — add `@syn/api`, `@syn/hooks`, `@tanstack/react-query ^5.90`, `@trpc/client ^11.4`, `@trpc/react-query ^11.4`, `@trpc/server ^11.4`, `superjson ^2.2`, `react-hook-form ^7.66`, `@hookform/resolvers ^3.10`, `zustand ^5`.

**States (exhaustive):** signed in → `/settings/appearance` renders the user's row through RLS · signed out → the layout redirects before the caller runs · `user.me` for a user whose shadow row is missing → `NOT_FOUND` (locally impossible after `ensureLocalUserFromSupabaseAuth`; on hosted tiers only if the trigger failed) · `updatePreferences` with `theme: "purple"` → zod `BAD_REQUEST` at the adapter · an unhandled DB error → one structured log line, client sees "Internal Server Error".

## Non-negotiables (this slice)

- **Every user-scoped read/write uses `ctx.rls.execute()`.** The singleton `db` appears in `context.ts` (bootstrap) and nowhere else in `@syn/api`.
- **Resolvers are thin**; multi-step logic is a `services/` function.
- **`@syn/hooks` imports no `next/*`, DOM, tRPC client instance, or Supabase client** — `AppRouter` as a type only.
- **No server data in Zustand or Context.** TanStack Query is the cache.
- **`AppRouter` is exported as a type** from `@syn/api` — it is why tRPC exists here (the future Expo client).

## Data & AI

**Schema changes: none.** **Tables:** `users` (RLS read via `me`; RLS update via `updatePreferences`). **Placement:** CC §4.2, §4.9, §3.1 (`lib/trpc`), §3.5. **tRPC / validators:** `user.me`, `user.updatePreferences`; `updatePreferencesInput`, `dateKeySchema`, `weekKeySchema` in `@syn/validators`. **AI notes: None.** **Instrumentation: none.**

## Accessibility

**None beyond INF-3's `ThemeControl`, reused unchanged.**

## Acceptance criteria (observable)

1. `packages/api/src/trpc.ts` exports exactly `router`, `createCallerFactory`, `middleware`, `publicProcedure`, `protectedProcedure`; `grep -rn "coupleProcedure\|adminProcedure\|beta" packages/api` returns nothing.
2. `grep -rn "\bdb\." packages/api/src/routers packages/api/src/services` returns nothing (only `context.ts` touches the singleton).
3. `grep -rEn "from ['\"](next|@trpc/client|@supabase)|window\.|document\." packages/hooks/src` returns nothing.
4. Signed in on staging, `/settings/appearance` renders the caller's `display_name` (or email) from `user.me`; a second user's row is never returned (verify with two accounts). *(Vigil.)*
5. `POST /api/trpc/user.updatePreferences` with `{ theme: "dark" }` updates `users.theme` for the caller and returns; with `{ theme: "purple" }` returns a `BAD_REQUEST` zod error; signed out returns `UNAUTHORIZED`.
6. `useSynapseForm` produces a form that shows no field error until submit, then live per field (checked in a Storybook-less scratch page, not committed).
7. `lib/stores/README.md` exists; `grep -rln "from \"zustand\"" apps/web packages` returns nothing.
8. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- CC's fetch adapter cannot set cookies on the response; that is fine because `proxy.ts` refreshes — do not "fix" it.
- `superjson` on both link and init is required or `Date`s arrive as strings; CC's error was exactly this once.
- Keep `createCaller` for RSC reads (`getServerApi`) — pages never `fetch("/api/trpc")`.

## Dev's call

The shape of `me`'s return (flat vs nested) · whether `updatePreferences` returns the updated row or `{ ok: true }` (recommended: the row, so the client cache updates in one round trip) · the `lib/stores/README.md` wording.

## Out of scope

- **Domain routers and validators** — the feature tech spec. **Server actions** — none in Phase 1 (CC §3.5: only for web-only mutations Expo will never call; Synapse has none yet). **Realtime** — Phase 2 sync. **The timer Zustand store** — Epic 2's timer ticket. **Persisting `theme` from `ThemeControl`** — Epic 1 ST-09.

## Depends on

- **INF-7** — the root layout slot, `getRequestAuthContext`, the placeholder pages, `@syn/validators` (INF-2). Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** The files are near-verbatim copies with a reduced surface, and the one real router is small; the RLS rule is the risk and criterion 2 catches it.

---

### Build kickoff (paste into the session)

> Build **INF-8 — `@syn/api`, `@syn/hooks`, client wiring** (attached spec). Model: **Sonnet**. **CC's tRPC package with two tiers and one `user` router through RLS; platform-pure hooks; the fetch adapter, provider, and server caller; the Zustand rule written down and no store built.**
> Attach/read first, in order: this spec · CC `docs/ai-guides/trpc-foundation-patterns.md` · CC `codebase-conventions.md` §3.5, §4.2, §4.9, §4A, §9, §9A · CC `packages/api/src/{trpc,context,root,index}.ts` and one small router (e.g. `routers/user.ts`) · CC `packages/hooks/src/{use-zod-form,index}.ts` + `package.json` · CC `apps/toolkit/{lib/trpc/*,app/api/trpc/[trpc]/route.ts}` · `docs/ux/habit_tracker_official_ux_spec_v1.md` §3.1 · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Every user read/write through `ctx.rls.execute()`. Close in three places; run `yarn lint && yarn lint:boundaries && yarn check-types && yarn build`.
