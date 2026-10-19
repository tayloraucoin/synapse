# SYS-3 — About & feedback, the error pages, and session expired: SY-01, SY-04, SY-05, and the two legal pages

**Epic:** SYS — Cross-cutting · **Phase 1** · Size: M
**Slice type:** Four small system surfaces with fixed copy. The risk class is *a leak or a dead end*: list data in a feedback message, a stack trace on screen, a session-expired dialog that loses a running timer, a legal link to nowhere.
**Vigil:** review the feedback payload (nothing from the list — read the insert), the session-expired path with a running timer, and the error page's logging (a digest, never a message with content).

**Status:** Complete (2026-09-06)

---

## Outcome

Settings → About tells a friend what this is (*A private daily list…*), shows the version, and offers one way to say something back — a message, an optional switch to include the screen and version, *Send*, *Sent. Thanks.* — with keyboard shortcuts listed on wide and two legal links. A dead link says *This page isn't here.* with a door to today; an unrecoverable error says *Something went wrong on this screen.* with *Reload* and *Open today* and never a code. A lapsed session says *Signed out* / *Sign in again to continue. Anything you changed is kept on this device.* and returns the person to where they were, telling them a running timer will be saved when they sign in. **The legal pages exist with the trust line and wait for Taylor's copy.**

## Why / intent

- **Cross-cutting §10 SY-01** — every read: header *About* · *Synapse* · *{version} · {build date}* · the body · *Feedback* with its body, *Message* (1000), the switch *Include which screen I'm on and my app version* (on; helper *Nothing from your list is included.*), *Send*, *Sent. Thanks.* · *Keyboard shortcuts* (wide only) as a plain table · *Legal* — *Privacy* · *Terms* (`[OPEN: copy]`) · the trust line. Interacts: *Write something first.*; Send → the builder's inbox, no ticketing. States: sending · sent · error (*Couldn't send. Try again, or email {address}.*) · offline (Send disabled). §13 call 8.
- **SY-04** — the dialog over whatever was open; never while a timer runs if the refresh can be silent; otherwise the timer keeps running locally and the dialog says so.
- **SY-05** — the two variants, verbatim; never a stack trace or an error code in the copy.
- **§3.1** — the shortcut list is "listed on About → Keyboard"; SYS-4 binds the keys; this ticket renders the list from a shared constant.
- **Official spec §4.1** — the trust line's treatment everywhere it appears; §9.3 — nothing red here.
- **Ground truth:** `app/{error,not-found}.tsx` (SY-05's copy already in plain markup — INF-7); `ErrorPage` composite; SET-1's `feedback_messages` (insert-only for the author); `CONTACT_EMAIL` (empty — `[NEEDS VALUE AT BUILD]`); `NEXT_PUBLIC_APP_VERSION` / build date (SET-8's version stamping); `useOnline`; `Textarea`, `Switch`, `Button`, `Text`, `TrustLine`, `AlertDialog` parts, `Kbd`/`KbdGroup`, `ScreenFrame prose`, `SettingsRow`; `FEEDBACK_MAX = 1000`; USE-3's timer store; `@syn/auth` `createBrowserClient` (`onAuthStateChange`); the tRPC client's error link.
- **What this slice is NOT (binding):** no ticketing, no email pipeline (the row is the inbox in Phase 1 — `[PENDING — Taylor: an email forward from the table if wanted]`), no key binding (SYS-4), no legal copy.

**Rulings this slice makes (labelled, logged):**

- **Feedback is a tRPC mutation `feedback.send({ message, includeContext })`** inserting `feedback_messages` with `screen_path` and `app_version` only when the switch is on; the server reads the path from the input (the client sends `window.location.pathname` stripped of query — never the query, which can carry an item id). Conventions §3.5 lists "feedback note" as a server-action candidate; **tRPC is chosen** because the future mobile app has the same screen. Logged.
- **The legal pages are `/legal/privacy` and `/legal/terms`**, public (outside the three groups), rendering `AppHeader`-less `ScreenFrame prose` with an `h1`, the trust line, and — until Taylor supplies copy — a single line *This page is being written.* `[COPY — needs Vesper sign-off]` and a `[PENDING — Taylor: legal copy]` comment. `legalPrivacyRoute()` / `legalTermsRoute()` added to `lib/routes.ts`; `apps/web/AGENTS.md`'s route map gains two rows (a logged edit). The About links render always (the pages exist). **If SYS-6 (the landing page) has shipped, this ticket also adds the two links (*Privacy* · *Terms*) to the landing footer per `docs/ux/landing-page-ux.md` §3.7, using `LANDING_COPY.footer`.** Logged.
- **The shortcut list is data**: `apps/web/lib/keyboard/shortcuts.ts` exports `SHORTCUTS: Shortcut[]` (the `@syn/ui` `Shortcut` shape — `keys`, `label`) for §3.1 and §3.2; About renders it in a table on wide; SYS-4 binds the same list and opens `ShortcutsDialog` with it. Logged.
- **Session expiry is detected in two places and shown by one dialog**: the tRPC link's `onError` for `UNAUTHORIZED`, and `supabase.auth.onAuthStateChange` → `SIGNED_OUT` while the app believed it was signed in. A `SessionExpiredDialog` mounted once in the shell providers (SYS-1) opens with the copy; **Sign in** → `signInRoute(currentPath)`; the timer variant reads the store's running state. `proxy.ts` refreshes silently on navigation, so the dialog appears only when a refresh actually failed. Logged.
- **`error.tsx` and `not-found.tsx` render `ErrorPage`** (`variant`, `onOpenToday`, `onReload`) — one home for the copy; the existing plain markup is replaced; the digest is logged, never shown (already so). A `(shell)/not-found.tsx` is **not** added: the root one is correct and the document gives one page. Logged.

## Experience & states

### SY-01 About (`/settings/about`)

`AppHeader` *About*, `onBack`. `ScreenFrame prose`. *Synapse* (`Text variant="row-title" weight={500}`) · *{version} · {build date}* (`Text variant="caption" tone="secondary"`) · body *A private daily list. Habits, tasks, appointments, and deep work in one place, closed honestly each night.* · `GroupHeading` *Feedback* · body *Something broken or confusing? Say so — it goes to the person who builds this.* · `Textarea label="Message" maxLength={FEEDBACK_MAX}` · `Switch` *Include which screen I'm on and my app version* (default on) with helper *Nothing from your list is included.* · `Button` *Send* (primary) · after send the form is replaced by *Sent. Thanks.* (`Text`) · `GroupHeading` *Keyboard shortcuts* (wide only, `hidden wide:block`) with a two-column table of `KbdGroup` · label from `SHORTCUTS` · `GroupHeading` *Legal* with two text links *Privacy* · *Terms* · `TrustLine` at the bottom.

*Send* with an empty message → *Write something first.* under the field (client-side; the validator too). Error → *Couldn't send. Try again, or email {address}.* — `{address}` is `CONTACT_EMAIL`; when empty, the sentence ends at *Try again.* `[Dev's call, logged: never render an empty address]`. Offline → *Send* disabled with the standard line.

### SY-04 Session expired

`AlertDialog` (no dismiss by scrim; one action): title *Signed out* · description *Sign in again to continue. Anything you changed is kept on this device.* · when the timer store has a running item, a second line *A running timer will be saved when you sign in.* · action **Sign in** → `router.replace(signInRoute(pathname + search))`. Opens on the two detections; never opens on the `(auth)` group.

### SY-05 Error pages

`not-found.tsx` → `ErrorPage variant="not-found" onOpenToday`; `error.tsx` → `ErrorPage variant="unrecoverable" onReload={reset} onOpenToday`, logging `digest` only. Both keep `main#main` and a single `h1` (the composite's).

### Legal pages

`app/legal/privacy/page.tsx`, `app/legal/terms/page.tsx`: `ScreenFrame prose` · `Heading` *Privacy* / *Terms* · the pending line · `TrustLine`. No shell, no gate (public). `[PENDING — Taylor: copy]`.

**States (exhaustive):** About: idle · invalid (empty) · sending · sent · error · offline. SY-04: closed · open · open-with-timer. SY-05: not-found · unrecoverable. Legal: pending.

**Failure / edge states:** `feedback.send` fails with `UNAUTHORIZED` (the session lapsed mid-typing) → SY-04 opens; the typed message is kept in the form (component state survives the dialog) · two `UNAUTHORIZED` errors in a burst → one dialog (a ref guard) · an error boundary inside a sheet → Next's nearest `error.tsx` is the root one (the sheet closes with the page) — acceptable for Phase 1; note a `[REVISIT: a `(shell)/error.tsx` that keeps the chrome]`.

## Non-negotiables (this slice)

- **Nothing from the list reaches `feedback_messages`.** Message, screen path (no query), version. The insert has three content columns and no more.
- **Never a stack trace or an error code on screen.**
- **The session dialog never loses a running timer** — the store keeps running; the sentence says so.
- **No key binding here** (SYS-4); the list is data.
- **Every string is cross-cutting §10 verbatim**; two gaps are marked.

## Data & AI

**Schema changes: none** (`feedback_messages` exists from SET-1).

**Tables:** `feedback_messages` (insert, owner-only `withCheck`).

**Placement:** router `feedback.ts` (rule 3) with `services/system/send-feedback.ts`; validators `packages/validators/src/feedback.ts` (`feedbackInput`: message 1–1000 → *Write something first.*, `includeContext` boolean, `screenPath` string without `?`); page `app/(shell)/settings/about/page.tsx` replaces the placeholder with leaves in `_components/`; `lib/keyboard/shortcuts.ts`; `components/session-expired-dialog/` mounted in `shell-providers.tsx` (SYS-1's file — extend; re-check SYS-1 AC 1); `app/{error,not-found}.tsx` edited; `app/legal/{privacy,terms}/page.tsx` new; `lib/routes.ts` + `apps/web/AGENTS.md` route rows.

**tRPC / validators:** `feedback.send` (mutation).

**AI notes:** **None.**

## Accessibility

- The feedback form: the textarea is labelled *Message*; the switch's helper is its description; *Sent. Thanks.* is announced (`role="status"`).
- The shortcuts table has a caption (*Keyboard shortcuts*) and `<th>` headers (*Keys*, *Action*); `KbdGroup` renders keys as `<kbd>`.
- SY-04 is `role="alertdialog"` with focus on **Sign in**; Esc does nothing (the only way out is signing in — the document gives one action).
- The error pages keep one `h1` and a focusable primary.

## Acceptance criteria (observable — compact and wide)

1. `/settings/about` renders every read in the document's order; the version line shows the stamped version and build date; the shortcuts table appears at 1024px and not at 375px; the two legal links open pages with the heading and the trust line.
2. *Send* with an empty message shows *Write something first.*; with text and the switch on, a `feedback_messages` row exists with `message`, `screen_path = /settings/about`, `app_version`, and `user_id`; with the switch off, `screen_path` and `app_version` are null; *Sent. Thanks.* replaces the form. *(Vigil — read the row.)*
3. As user A, `SELECT` on `feedback_messages` through the RLS bridge returns zero rows (insert-only); the singleton `db` sees the row.
4. Offline, *Send* is disabled with the standard line; a forced server error shows *Couldn't send. Try again.* (address empty) or with *, or email {address}* once `CONTACT_EMAIL` is set.
5. `/nope` renders `ErrorPage not-found` with *This page isn't here.* / *The link may be old, or the day it points to hasn't been planned.* / **Open today**; a thrown render error (a scratch `throw` behind a query flag, removed after) renders the unrecoverable variant with **Reload** · **Open today** and the digest in the dev log only. *(Vigil.)*
6. Expire the session (delete the refresh token in Supabase or clear the cookie's server row) then trigger a tRPC call: SY-04 opens with the two sentences; with a running timer, the third; **Sign in** → `/signin?next=<the path>` → after sign-in, back on that path. *(Vigil.)*
7. Two rapid `UNAUTHORIZED` errors open one dialog; the dialog never opens on `/signin`.
8. `grep -rn "search\|query" packages/api/src/services/system/send-feedback.ts` shows nothing reading a query string; `packages/validators/src/feedback.ts` rejects a `screenPath` containing `?`.
9. `apps/web/AGENTS.md`'s route map lists `/legal/privacy` and `/legal/terms` with their builders; `yarn docs:check-links` passes.
10. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- The tRPC link's `onError`: wrap the `httpBatchLink` with a small `onErrorLink` (tRPC 11 supports a custom link) that calls `sessionExpired.open()` on `UNAUTHORIZED` — one place, in `lib/trpc/provider.tsx` (INF-8's file; re-check its AC).
- `onAuthStateChange('SIGNED_OUT')` fires on `/logout` too — guard with "the app believed it was signed in and did not initiate the sign-out".
- The shortcuts table on wide only: CSS (`hidden wide:block`), not `useIsWide`, so the server render is right.

## Dev's call

Whether *Sent. Thanks.* offers a way to send another (recommend a small *Send another* ghost after 3 s — **no**, not in the document; leave it) · the ref-guard implementation · the legal pages' interim line pending Vesper.

## Out of scope

- **Binding the keys, the `?` dialog** — SYS-4.
- **Email forwarding of feedback** — `[PENDING — Taylor]`.
- **Legal copy** — Taylor.
- **A shell-level error boundary that keeps the chrome** — `[REVISIT]`.

## Depends on

- **SYS-1** — the shell, `shell-providers.tsx`, `PageFrame`. Complete in `PROGRESS.md`.
- **SET-8** — the Settings index row, the version stamp. Complete in `../epic-1-setup/PROGRESS.md`.

## Recommended execution

**Sonnet.** Four small surfaces with fixed copy and three induced checks. The failure mode of choosing down is a query string in the feedback path — the validator and the grep both catch it.

---

### Kickoff (paste into the session)

> Build **SYS-3 — About & feedback, the error pages, and session expired** (attached spec). Model: **Sonnet**. **Nothing from the list in a feedback row; never a code on screen; the session dialog never loses a running timer; the shortcut list is data, not bindings.**
> Attach/read first, in order: this spec · cross-cutting §3.1, §3.2, §10 (SY-01, SY-04, SY-05), §13 call 8 · official spec §4.1 (trust surface), §9.3 · `apps/web/AGENTS.md` (route map — amend) · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · `apps/web/app/{error,not-found}.tsx` (re-render through `ErrorPage`) · `packages/ui/src/composed/{layout/error-page,feedback/shortcuts-dialog,display/trust-line}/` · SYS-1 (`shell-providers.tsx`) · SET-8 (the version stamp) · `apps/web/lib/trpc/provider.tsx` (the error link) · `packages/db/SCHEMA_REFERENCE.md` (system group) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
