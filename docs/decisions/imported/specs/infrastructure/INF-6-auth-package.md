# INF-6 — `@syn/auth`: Supabase Auth factories, session refresh, the RLS context bridge, and the callback routes

**Epic:** INF — Infrastructure · **Phase 2** · Size: L
**Slice type:** Identity rail — the failure classes are a server client imported into a client bundle (cookie APIs leak), a service-role key reaching the browser, or a tier mismatch that signs a user into the wrong Supabase project.
**Vigil:** review by inducing the misuse — attempt to import `@syn/auth/server` from a `"use client"` file and confirm the build fails; set `DATABASE_ENVIRONMENT=production` locally with only staging vars and confirm `requireSupabasePublicCredentials` throws rather than falling through.

**Status:** Complete (2026-09-04) — code done and locally verified; **Supabase dashboard setup + AC4–AC7 pending Taylor**

---

## Outcome

`@syn/auth` is CC's package with the CC-specific gates removed: browser/server/admin client factories, `updateSession` for `proxy.ts`, `getUser`/`getSession`/`isEmailVerified`/`verifiedEmail`, `buildAuthContext`/`buildServiceRoleAuthContext`, tier-aware env resolution with `buildSupabaseEnvForNextConfig`, cookie helpers, and `mapAuthError`. The web app has the two callback route handlers (`/auth/callback` for the PKCE code, `/auth/confirm` for email `token_hash` links), a `/logout` handler, the app-local browser client, and the request-auth helper. Google OAuth and email+password are enabled on the staging and production Supabase projects with the redirect allowlist set. The auth *screens* (AU-01…05) are not built here — Epic 1 owns them; this ticket makes them possible.

## Why / intent

- **Official spec §4.1** — Google sign-in primary, email + password secondary, verify-pending blocks, no magic links (`[VESPER CALL]` in the spec); **Epic 1 §1** — the five auth screens and AU-06; **cross-cutting §4.1–4.2** — routes and the entry decision tree; **§9.3 G3 / SY-04** — session expiry.
- **CC `codebase-conventions.md` §4.4, §6.3 (auth context flow)**; **CC `docs/developer-guides/authentication.md`**; **CC `packages/auth/src/*`**; **CC `apps/toolkit/{proxy.ts, app/auth/callback/route.ts, app/auth/confirm/route.ts, app/logout/route.ts, lib/auth/*, lib/clients/supabase/client.ts}`**.
- **What this slice is NOT (binding):** no auth UI; no beta-access, legal-acceptance, or entitlement gates (CC-specific); no `(shell)/layout.tsx` route protection (INF-7 places the gate; Epic 1 fills the redirects).
- **Ground truth:** `@syn/db` exports `ensureLocalUserFromSupabaseAuth`, `createRlsClient`, `db`, `users`; `@syn/types` exports `AuthContext` with `role: "guest" | "service_role"`.

**Rulings this slice makes (labelled, logged):**

- **Auth tier follows `DATABASE_ENVIRONMENT`** exactly as CC: `local` and `staging` → the staging Supabase project (`*_STAGING` vars); `production` → the unprefixed vars. Combined with INF-5's `local` default, a laptop with nothing set signs into staging. Logged.
- **Email confirmation is required** on both Supabase projects ("Confirm email" on), matching the spec's verify-pending block; `isEmailVerified` gates the shell (INF-7). Logged.
- **Google OAuth via Supabase's provider**, redirect to `<origin>/auth/callback`; the Google client is shared between staging and production projects `[PROVISIONAL — Taylor: one Google Cloud OAuth client with both Supabase callback URLs registered, or two clients]`. Logged.
- **The password reset lands on `/reset`** (`AU-05`) through `/auth/confirm?type=recovery&next=/reset`, sets the session, and `AU-05` then calls `updateUser({ password })` — CC's `reset-password` flow. Logged.
- **`mapAuthError` returns Synapse's copy** (Epic 1 §1 strings: *That email and password don't match.* · *This email isn't verified yet.* · *Too many attempts. Try again in a few minutes.* · *There's already an account with this email.* · *That link has expired. Request a new one.*) keyed by Supabase error code; the strings live in `packages/auth/src/auth-errors.ts` as CC does. `[Copy lives in a package, not `copy.ts` beside a component — CC precedent; the auth screens read it.]` Logged.

## Behaviour & states

**No surface.** Described by the routes' observable behaviour.

### Files (exact)

**`packages/auth/`**
- `package.json` — copy CC's; rename; dependencies `@syn/db`, `@syn/types`, `@syn/utils`, `@supabase/ssr ^0.10`, `@supabase/supabase-js ^2.49`; peer `next >=16`.
- `src/env.ts` — copy CC's verbatim (`usesStagingSupabase`, `getSupabaseUrl`, `getSupabaseAnonKey`, `getSupabaseServiceRoleKey`, `buildSupabaseEnvForNextConfig`, `requireSupabasePublicCredentials`), including the dynamic-access caveat comment.
- `src/client.ts`, `src/server.ts`, `src/middleware.ts` (`updateSession` with the foreign-cookie purge), `src/session.ts` (`getSession`, `getUser`, `isEmailVerified`, `verifiedEmail`), `src/cookies.ts`, `src/admin.ts` — copy CC's verbatim.
- `src/context.ts` — copy CC's; `AppUserRole = "guest"`; delete `isAppAdminRole`; `buildAuthContext(user)` returns `{ userId: user.id, role: "guest" }`; keep `buildServiceRoleAuthContext`.
- `src/auth-errors.ts` — CC's `mapAuthError` shape with the Synapse strings above.
- `src/index.ts` — CC's export list minus `isAppAdminRole`.
- `tsconfig.json`, `eslint.config.mjs` — CC's. Root `tsconfig.json` references gain `./packages/auth`.

**`apps/web/`** (the parts of INF-7 this ticket must land because they are auth):
- `proxy.ts` — copy CC's: skip paths `/signin`, `/logout`, `/auth/*`, `/api/*`; set `x-next-path`; call `updateSession`; the same `matcher`.
- `lib/clients/supabase/client.ts` — copy CC's app-local browser client (reads canonical `process.env.NEXT_PUBLIC_*` literals; the doc block explains why not `@syn/auth`'s `createBrowserClient`).
- `lib/auth/auth-redirect-response.ts` — copy CC's `appendAuthQuery`, `createSupabaseForResponse`, and a reduced `provisionUserFromSession` that only calls `ensureLocalUserFromSupabaseAuth` (no entitlement, no beta, no referral cookie).
- `lib/auth/get-request-user.ts`, `lib/auth/get-request-context.ts` — copy CC's (a cookie-bound client from `next/headers`, `getUser`, `buildAuthContext`, `createRlsClient`) — these are what INF-8's route handlers use; W-1 in CC's mobile watchlist prefers raw-`Request` auth for new handlers, so `get-request-context.ts` also exports a `getRequestAuthContextFromRequest(request: Request)` variant that parses the cookie header (CC's tRPC route does this inline).
- `lib/auth/require-verified-email.ts` — copy CC's (redirects to `/verify` when `!isEmailVerified(user)`).
- `app/auth/callback/route.ts`, `app/auth/confirm/route.ts` — copy CC's; imports renamed; `loginRoute()` → `signInRoute()`; the `EMAIL_OTP_TYPES` list kept.
- `app/logout/route.ts` — copy CC's (signs out, clears `sb-*` cookies via `clearSupabaseAuthCookies`, redirects to `/signin`).
- `lib/routes.ts` gains `signInRoute(next?)`, `signUpRoute()`, `verifyRoute()`, `forgotRoute()`, `resetRoute()`, `inviteRoute()`, `logoutRoute()`, `authCallbackRoute()`, `authConfirmRoute()` (INF-7 owns the full file; this ticket may create it with these entries).
- `env.ts` and `next.config.ts` — INF-7 owns them; this ticket adds nothing there but records in its closing note which `NEXT_PUBLIC_SUPABASE_*` names INF-7 must declare (they are the CC list).

**Supabase dashboard (human, documented in `docs/developer-guides/authentication.md` by INF-11; steps recorded in this ticket's closing note):** both projects — Email provider on with confirmation required; Google provider on with the shared client id/secret; Site URL = the tier's `NEXT_PUBLIC_SITE_URL`; Redirect URLs allowlist = `<site>/auth/callback`, `<site>/auth/confirm`, plus `http://localhost:3000/auth/*` on staging only; email templates point links at `/auth/confirm?token_hash={{ .TokenHash }}&type=...&next=...` (CC's runbook `supabase-auth-email-setup.md`).

**States (exhaustive):** signed out → `/` → INF-7's entry logic redirects to `/signin` · Google button → Supabase → `/auth/callback?code=…` → session cookies set → redirect to `next` (default `/`) · email signup → `/verify` → email link → `/auth/confirm?type=signup` → session → `/` · forgot → `/auth/confirm?type=recovery&next=/reset` → `/reset` · sign out → `/logout` → cookies cleared → `/signin` · expired/invalid `code` or `token_hash` → `/signin?auth=error` (SY-04 copy lands with Epic 1's `NoticeLine`) · a stale `sb-<other-ref>-*` cookie after a tier switch → purged by `updateSession`.

**Failure / edge states:** `NEXT_PUBLIC_SUPABASE_URL` unset on the client → the browser client throws with CC's message naming `.env.example` · staging vars set, tier `production` → `requireSupabasePublicCredentials` throws at first server use; the build still passes because the env block only emits non-empty values (`SKIP_ENV_VALIDATION` for CI without secrets is INF-10's call).

## Non-negotiables (this slice)

- **`server.ts`/`admin.ts`/`middleware.ts` are never imported from a `"use client"` file.** The boundaries lint cannot see this; the doc blocks and the acceptance grep enforce it.
- **The service-role key never enters the browser bundle**; only `NEXT_PUBLIC_*` names are read client-side, as literals.
- **`getUser`, not `getSession`, for authorisation** (validates the JWT server-side — CC's rule).
- **Sessions refresh only in `proxy.ts`**; route protection lives in layouts (INF-7), never in the proxy.
- **No magic-link sign-in** (spec §4.1); the `magiclink` OTP type is accepted by `/auth/confirm` only because Supabase's recovery/confirm flows share the endpoint.
- **Local and staging use the staging project; production uses production.**

## Data & AI

**Schema changes: none** (the `users` shadow row is created by INF-5's trigger; `ensureLocalUserFromSupabaseAuth` covers local). **Tables:** `users` (trigger insert; local stub insert into `auth.users` in the `local` tier only). **Placement:** `packages/auth/**` per CC §4.4; app files per CC toolkit paths. **tRPC / validators:** none (INF-8). **AI notes: None.** **Instrumentation: none.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. `packages/auth/src/index.ts` exports exactly CC's surface minus `isAppAdminRole`; `buildAuthContext(user).role === "guest"`.
2. `grep -rl "use client" apps/web packages/ui | xargs grep -l "@syn/auth/server\|@syn/auth/middleware\|@syn/auth/admin\|from \"@syn/auth\"" ` returns nothing (client files import only the app-local browser client). *(Vigil.)*
3. With staging vars only and `DATABASE_ENVIRONMENT=production`, a server-side `requireSupabasePublicCredentials()` throws CC's message; with `DATABASE_ENVIRONMENT=local` it returns the staging URL. *(Vigil.)*
4. On staging: Google sign-in from `http://localhost:3000` lands on `/auth/callback`, sets `sb-<staging-ref>-*` cookies, redirects to `/`, and a `public.users` row exists for the new user.
5. Email signup sends a confirmation whose link hits `/auth/confirm?type=signup`, establishes a session, and redirects to `next`; a tampered `token_hash` redirects to `/signin?auth=error`.
6. `/logout` clears every `sb-*` cookie and redirects to `/signin`.
7. `updateSession` purges an `sb-<other-ref>-` cookie planted manually.
8. `mapAuthError` returns the five Synapse strings for the corresponding Supabase codes, verified by a story-less unit check in the ticket thread (no test file committed).
9. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- CC's `env.ts` warns that dynamic `process.env[name]` access is not inlined by Next into workspace bundles — which is why the browser client is app-local and reads literals. Do not "simplify" this.
- Supabase publishable/secret keys vs anon/service-role: CC's `firstNonEmpty` accepts both; keep both env names.
- `verifiedEmail()` exists in CC for partner-seat matching; Synapse has no such flow but the helper is harmless — keep it for the invite link (`/invite` → AU-02).

## Dev's call

Whether `get-request-context.ts` exports one function with an overload or two named functions (recommended: two, `getRequestAuthContext()` for `next/headers` callers and `getRequestAuthContextFromRequest(request)` for handlers) · the `x-next-path` header name (CC's).

## Out of scope

- **AU-01…05 screens, `AuthFrame`, `OAuthButton`** — Epic 1 track. **Entry decision tree and shell gate** — INF-7. **Session-expired dialog (SY-04)** — the system-screens ticket in a feature track. **Google Cloud console setup** — Taylor (human).

## Depends on

- **INF-5** — `ensureLocalUserFromSupabaseAuth`, `createRlsClient`, `db`, `users`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Cookie-bound clients, PKCE exchange on a redirect response, and the client/server import boundary are exactly where a cheaper model produces something that works in `next dev` and leaks in production.

---

### Build kickoff (paste into the session)

> Build **INF-6 — `@syn/auth`** (attached spec). Model: **Opus**. **CC's auth package and callback routes, tier-aware, with no beta/legal/entitlement gates; server clients never in client bundles; service keys never in the browser.**
> Attach/read first, in order: this spec · CC `docs/developer-guides/authentication.md` · CC `codebase-conventions.md` §4.4, §6.3 · CC `packages/auth/src/*` · CC `apps/toolkit/{proxy.ts,lib/clients/supabase/client.ts,lib/auth/*,app/auth/callback/route.ts,app/auth/confirm/route.ts,app/logout/route.ts}` · `docs/ux/epic1_setup_ux_architecture.md` §1, §9 (the error strings) · `docs/ux/synapse_navigation_and_system_ux_architecture.md` §4 · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Copy CC; strip beta, legal, entitlement, referral; role is `guest`. Do the Supabase dashboard steps yourself only where the project's keys are in `.env.local`; otherwise write the checklist for Taylor in your closing note. Close in three places; run `yarn lint && yarn lint:boundaries && yarn check-types && yarn build`.
