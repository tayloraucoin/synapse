# SET-2 — Auth: sign in, create account, verify, forgot, reset, the invite line, and sign-out

**Epic:** SET — Setup · **Phase 1** · Size: L
**Slice type:** Five forms over Supabase Auth flows that already have their server rails. The risk class is *a person locked out or let in wrong*: an unverified session that reaches the shell, a `next` that becomes an open redirect, an error string that reveals which of email or password was wrong.
**Vigil:** review by inducing the failure paths — wrong password · unverified email · rate limit · expired reset link · offline mid-submit · an OAuth return for a brand-new Google identity. QA states which of those six it exercised.

**Status:** Not started

> **Vigil — failure-path review.** The happy path is Supabase's. What this slice owns is every sentence a person reads when it is not the happy path, and every redirect. Verify AC 4–9 by inducing, not by reading.

---

## Outcome

A person can create a private account with a name, an email, and a password, verify the address from the email, sign in and out, recover a forgotten password, and arrive from a shared invite link at a screen that says the app is free and their list is private. Google sign-in works for a returning and a brand-new identity. Every error is the document's sentence, never Supabase's. After this ships, the `(auth)` group's five placeholder pages are real; **first run (SET-7) does not exist yet**, so a new account lands on the placeholder `/setup/1` page — that is correct and expected. No shell chrome yet (SYS-1).

## Why / intent

- **Official spec §4.1** — Google primary, email + password secondary, no magic links (`[VESPER CALL]`, signed), email confirmation required, block until verified, no marketing copy, no plan or tier anywhere. **Every string** in AU-01…06 is Epic 1 §1, verbatim.
- **Epic 1 AU-01** — the wrong-credentials error is deliberately not field-specific: *That email and password don't match.* Reveal nothing about which one.
- **Epic 1 AU-04** — *Send reset link* "always succeeds visibly regardless of account existence". An enumeration oracle is a privacy hole.
- **Cross-cutting §4.2** — entry decision tree: no session → `/signin` (remember the intended route); session but unverified → `/verify`. INF-7's `resolveEntry` and the `(shell)`/`(setup)`/`(auth)` layouts already do the gating; this slice **must not add a second gate**.
- **Ground truth (consumed, never rebuilt):** `apps/web/app/(auth)/layout.tsx` (redirects a signed-in person to `/`), `app/auth/callback/route.ts` (OAuth PKCE), `app/auth/confirm/route.ts` (email `token_hash`), `app/logout/route.ts`, `lib/auth/*`, `lib/clients/supabase/client.ts` (the browser client), `@syn/auth` (`mapAuthError` from `@syn/auth/errors`, `createBrowserClient`), `@syn/validators` `auth-credentials.ts` (every field rule with its copy already in place), `lib/forms/use-synapse-form.ts`, `@syn/ui`'s `AuthFrame`, `OAuthButton`, `Input`, `Button`, `TrustLine`, `HelperText`, `StatusLine` (`placement="inline"`), `lib/hooks/use-online.ts`.
- **What this slice is NOT (binding):** it does not touch `proxy.ts`, the layouts' gates, or `resolveEntry`. It does not build ST-01's account screen (SET-8) — AU-06's sign-out *dialog* is SET-8's because it lives there; this slice ships only the `/logout` handler's client trigger where AU-01's flows need it (none do).

**Rulings this slice makes (labelled, logged):**

- **Auth forms call Supabase from the browser client, not through tRPC.** Sign-in, sign-up, resend, forgot, and reset are `supabase.auth.*` calls whose cookies the SSR client manages; a tRPC hop would put the session write on the wrong side. This follows `docs/developer-guides/authentication.md`. Logged.
- **The invite line is a query flag on `/signup`, and `/invite` is a server redirect to it.** `inviteRoute()` exists; the page at `/invite` renders `redirect(withNotice(signUpRoute(), "invite"))`, and AU-02 shows its line when `notice=invite`. One form, not two. Logged.
- **`next` is honoured only through `sanitizeNextPath`.** The sign-in page reads `?next=` and passes it to the callback and to the post-sign-in `router.replace`; it never interpolates a raw value. Logged.
- **Post-sign-in destination is `/` (the entry tree), never a hard-coded `/today`.** `resolveEntry` decides between `/verify`, `/setup/{n}`, and `/today`; a page that guesses is a second entry tree. Logged.
- **The verify screen polls the session on `visibilitychange` and `focus`, not on an interval.** AU-03's "link opened on another device" case; a 5-second interval is a battery cost for a rare event. Logged.

## Experience & states

Every screen is a `(auth)` group page (Server Component) rendering one client leaf in `app/(auth)/<screen>/_components/<screen>-form.tsx`. The frame is `AuthFrame` with `trustLine` on AU-01 and AU-02 only (Epic 1 §12: *Trust line — AU-01/02, ST-10, ST-11*).

### AU-01 Sign in (`/signin`)

Reads, in order (Epic 1 AU-01): wordmark *Synapse* (the `AuthFrame` heading region) · heading *Sign in* · `OAuthButton` *Continue with Google* · divider *or* · *Email* · *Password* with show/hide (*Show*/*Hide* as a text button, not an icon alone) · link *Forgot your password?* → `forgotRoute()` carrying the typed email as `?email=` · primary *Sign in* · footer *New here?* [*Create an account*] · trust line.

Behaviour: `useSynapseForm(signInInput)`. Submit → `supabase.auth.signInWithPassword`. Success → `router.replace("/")` (the entry tree). Errors under the form: wrong credentials → *That email and password don't match.* · unverified → *This email isn't verified yet.* [*Resend the link*] → AU-03 with the email · rate-limited → *Too many attempts. Try again in a few minutes.* Map through `mapAuthError`; anything unmapped shows the non-leaking fallback. Google → `signInWithOAuth({ provider: "google", options: { redirectTo: <origin>/auth/callback?next=<sanitised next> } })`; loading state on that button only.

`?auth=error` / `?auth=missing_code` (set by the callback on failure) render one line above the form: *Couldn't sign in with Google. Try again.* `[COPY — needs Vesper sign-off; not in the document]`.

### AU-02 Create account (`/signup`)

Reads: wordmark · heading *Create an account* · **only with `notice=invite`:** *Someone shared Synapse with you. It's free, and your list is private to you.* · *Continue with Google* · *or* · *Your name* · *Email* · *Password* with helper *At least 8 characters.* · primary *Create account* · footer *Already have an account?* [*Sign in*] · trust line.

Behaviour: `useSynapseForm(signUpInput)`. Submit → `supabase.auth.signUp({ email, password, options: { data: { display_name }, emailRedirectTo: <origin>/auth/confirm?next=/ } })`. Existing account → *There's already an account with this email.* [*Sign in instead*] (Supabase returns a fake success for existing emails when confirmation is on — detect via `identities.length === 0` and show this line; note it in the code). Success → `router.replace(verifyRoute())` with the email carried in `sessionStorage` under `STORAGE_KEYS`' new `AUTH_PENDING_EMAIL` key (add it; `syn:auth-pending-email`), never in the URL.

### AU-03 Check your email (`/verify`)

Reads: heading *Check your email* · *We sent a sign-in link to* **{email}**. *Open it on this device to continue.* · secondary *Resend the link* (cooldown label *Resend in 24s*, 30 s; after three sends: *Sent again. If it still doesn't arrive, try a different email.*) · links *Use a different email* → `/signup` (name and password kept in memory for the session only — the same `sessionStorage` key family; **never the password** — rule: name only; the password is retyped) · *Sign in* · muted note *Didn't get it? Check spam, or wait a minute — they sometimes take a moment.*

When arrived from AU-01's unverified branch, the same screen with the email from the form. When there is a session whose email is unverified (the `(shell)` gate sends people here), the email comes from `getRequestUser()`.

Behaviour: *Resend* → `supabase.auth.resend({ type: "signup", email })`; label *Sent* for 2 s then the countdown. On `visibilitychange`/`focus`, `supabase.auth.getSession()`; if the session's `email_confirmed_at` is set, `router.replace("/")`.

### AU-04 Forgot password (`/forgot`)

Reads (idle): heading *Reset your password* · *Enter your email and we'll send a reset link.* · *Email* (prefilled from `?email=`) · primary *Send reset link* · link *Back to sign in*. Sent state: heading *Check your email* · *If there's an account for* **{email}**, *a reset link is on its way.* · secondary *Resend* (30 s) · *Back to sign in*.

Behaviour: `supabase.auth.resetPasswordForEmail(email, { redirectTo: <origin>/auth/confirm?next=/reset })`. The sent state renders **regardless of the result** (AU-04's rule); a network failure shows the offline line instead.

### AU-05 Reset password (`/reset`)

Reads: heading *Choose a new password* · *New password* with *At least 8 characters.* · *Confirm password* · primary *Save password*. Errors: `resetPasswordInput`'s own. Expired link (no recovery session present) → `router.replace(forgotRoute())` with the line *That link has expired. Request a new one.* carried as `notice=expired`. Success → `supabase.auth.updateUser({ password })`, then sign out and `router.replace(signInRoute())` with `notice=password-changed` rendering *Password changed. Sign in with the new one.* on AU-01.

`/auth/confirm` already exchanges the `token_hash`; confirm that a `type=recovery` link lands on `/reset` with a session — if the existing handler does not distinguish recovery from signup, extend it (it is INF-6's file; re-check INF-6's AC on the signup path).

### AU-06 Sign out

The `/logout` route handler exists. This slice adds nothing visible; SET-8 renders the dialog in ST-01 and posts to it.

### `/invite`

A Server Component that `redirect`s to `withNotice(signUpRoute(), "invite")`.

**States (exhaustive), every form:** idle · submitting (primary `busy`, label unchanged) · field error (under the field, after first submit; `visibleFieldError`) · form error (one line under the form) · offline (`AuthFrame offline` → form disabled + *You're offline — sign-in needs a connection.*) · success (redirect). AU-03 adds: sending · sent · cooldown · three-sends. AU-04 adds: sent. AU-05 adds: expired.

**Failure / edge states:** OAuth return with an unverified email (cannot happen with Google; handle by the gate anyway) · a person on `/verify` with no email known (no session, no `sessionStorage`) → show the screen with *your email* in place of the address and both links · `next` containing a protocol or `//` → sanitised to `/`.

## Non-negotiables (this slice)

- **The wrong-credentials error never says which was wrong.** One sentence, form-level.
- **Forgot-password never reveals whether an account exists.** The sent state renders on every non-network outcome.
- **No password is ever written to storage of any kind.** The "retained in memory" affordance keeps the name only.
- **`next` passes through `sanitizeNextPath` every time it is read.** From `searchParams`, from the callback, from a form.
- **No second gate.** Pages do not check the session; the layouts do.
- **Every string is Epic 1 §1's.** Two strings the document lacks are marked above for Vesper.

## Data & AI

**Schema changes: none.**

**Tables:** `auth.users` (Supabase, via the client) · `users` (read by `getRequestUser` for the verify screen's email).

**Placement:** pages in `apps/web/app/(auth)/{signin,signup,verify,forgot,reset,invite}/page.tsx`; leaves in each `_components/`; the show/hide password field is a route-group-local leaf `app/(auth)/_components/password-field.tsx` (three consumers in one group — co-locate, do not promote to `@syn/ui` yet; note the promotion trigger: ST-01 is the fourth consumer, SET-8 promotes it then). Copy in `app/(auth)/_components/copy.ts` (one file for the group). `STORAGE_KEYS.AUTH_PENDING_EMAIL` in `@syn/constants`.

**tRPC / validators:** none new. Validators: `signInInput`, `signUpInput`, `forgotPasswordInput`, `resetPasswordInput` from `@syn/validators` (exist).

**AI notes:** **None.**

## Accessibility

- One `h1` per screen: `AuthFrame`'s heading. The wordmark is not a heading.
- The show/hide control is a button with a visible text label and `aria-pressed`; it does not steal focus from the field.
- Form-level errors render in a `role="alert"` region placed *after* the primary in DOM order but visually above it? **No** — render it where it is read: under the form, before the footer, with `aria-live="polite"`; on submit failure move focus to the first invalid field (`useSynapseForm`'s default), or to the alert when no field is invalid.
- The *Resend in 24s* countdown updates text, not a live region — it must not announce every second (`aria-live="off"`).
- Autocomplete attributes exactly as the document names them (`email`, `current-password`, `new-password`, `name`).

## Acceptance criteria (observable — against a Supabase project with Google enabled and confirmation required; state which)

1. `/signin`, `/signup`, `/verify`, `/forgot`, `/reset` render the document's strings in the document's order; a signed-in visit to any of them redirects to `/` (existing gate).
2. Create account with a new email → `/verify` shows that email; the confirmation email's link → `/auth/confirm` → `/` → the placeholder `/setup/1` (first run owed). *(Vigil.)*
3. Sign in with the verified account → `/` → `/today` placeholder (or `/setup/1` while first run is owed).
4. Wrong password → *That email and password don't match.*; wrong email with a valid-looking password → the **same** sentence. *(Vigil.)*
5. Sign in with an unverified account → *This email isn't verified yet.* [*Resend the link*] → `/verify` with the email; *Resend the link* sends and shows *Sent* then the countdown. *(Vigil.)*
6. `/forgot` with an email that has no account renders the sent state identically to one that does. *(Vigil.)*
7. A recovery link lands on `/reset` with a session; saving a new password signs out and shows *Password changed. Sign in with the new one.* on `/signin`; an expired recovery link lands on `/forgot` with *That link has expired. Request a new one.* *(Vigil.)*
8. `/signin?next=/settings/habits` → after sign-in, `/settings/habits`; `/signin?next=https://evil.example` → `/`. *(Vigil.)*
9. Offline (DevTools) on any form: the form is disabled and the offline line shows; going online re-enables it without a reload. *(Vigil.)*
10. `/invite` → `/signup?notice=invite` shows the invite line; `/signup` alone does not.
11. *Continue with Google* with a new Google identity → `/auth/callback` → `/` → `/setup/1`; with an existing one → `/today`. *(Vigil — state whether this was run.)*
12. `grep -rn "password" apps/web/app/\(auth\)` shows no storage write of a password field's value.
13. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Supabase's "user already exists" on `signUp` with confirmations on: the response is a user with an empty `identities` array and no error. Do not rely on the error path.
- `resend({ type: "signup" })` is rate-limited by Supabase (60 s by default); the 30 s UI cooldown plus a mapped rate-limit message covers the gap.
- `mapAuthError` (INF-6) already maps five codes; extend it there — never in the leaf — if a code you meet is unmapped.
- Read `docs/developer-guides/authentication.md` for the dashboard settings (redirect allow-list must include `/auth/callback` and `/auth/confirm` on every tier).

## Dev's call

Whether the OAuth error line and the password-changed line are `notice` query flags or `sessionStorage` (recommend `notice`; they are not sensitive) · countdown implementation · where the group-local `copy.ts` splits per screen.

## Out of scope

- **The sign-out dialog and the account screen** — SET-8 (ST-01, AU-06).
- **First run** — SET-7. A new account lands on the placeholder step page.
- **Shell chrome** — SYS-1. Auth screens never have it.
- **Email change verification** — SET-8 (ST-01).
- **Session-expired dialog SY-04** — SYS-3.
- **Deleting an account** — SET-10.

## Depends on

- **No slice dependencies.** INF-6, INF-7, INF-8 are Complete in `../infrastructure/PROGRESS.md`. Runs in parallel with SET-1.

## Recommended execution

**Sonnet.** The mechanisms are Supabase's and the copy is fixed; the work is careful wiring of six failure paths against a precise list. Not Composer: the enumeration and open-redirect rules are exactly the kind of thing a mechanical pass gets right on the happy path and wrong on the fourth error branch.

---

### Kickoff (paste into the session)

> Build **SET-2 — Auth: sign in, create account, verify, forgot, reset, the invite line, and sign-out** (attached spec). Model: **Sonnet**. **Never reveal which credential was wrong or whether an account exists; never store a password; every `next` is sanitised; no second gate.**
> Attach/read first, in order: this spec · Epic 1 §1 (AU-01…06) and §9 · official spec §4.1 · cross-cutting §4.2 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/developer-guides/authentication.md` · `apps/web/app/(auth)/layout.tsx`, `app/auth/{callback,confirm}/route.ts`, `app/logout/route.ts`, `lib/auth/*`, `lib/clients/supabase/client.ts` (reuse, don't fork) · `packages/validators/src/auth-credentials.ts` · `packages/ui/src/composed/layout/auth-frame/` and `control/oauth-button/` · `docs/specs/README.md` § Placement rules · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md` (INF-6 lines).
> Copy is Epic 1 §1 verbatim in a `copy.ts`; two strings the document lacks are marked for Vesper — do not invent more. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
