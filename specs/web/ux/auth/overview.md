---
source:
  - docs/ux/epic1_setup_ux_architecture.md §0.3–§0.5, §1 (AU-01 to AU-06), §8.1, §9
  - docs/ux/ux-spec-v1.md §4.1
  - code 35d13df (apps/web/app/(auth), (auth-pending), auth, logout, proxy.ts, lib/auth, lib/routes.ts; packages/auth/src)
status: draft
promoted:
---

# auth — overview

## Frame

Five screens and three handlers that get a person into their own private space with the least ceremony that keeps it private, and out again on purpose. The person arrives tired with one hand free, curious from a friend's link, or from an email on a device that never had the app open. One form per screen, one primary action, the alternate route as a text link; nothing counts and nothing says which half of a credential was wrong. Every state row was seen at 390, 834 and 1440, light and dark, or is marked inferred with its file (D-WEB-7).

## Routes and surfaces

Two route groups (SET-2, 2026-09-05) and three handlers; each surface file names its own entries.

| Route                      | Gate                                                                                                                         | Exit to                                                                                    | Surface file           |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------- |
| `(auth)` `/signin`         | a session is sent to `/`, the entry tree decides                                                                             | `?next=` or `/`; `/signup`; `/forgot`; `/verify` on the unverified error                   | `sign-in.md`           |
| `(auth)` `/signup`         | same gate                                                                                                                    | `/verify`; `/signin`                                                                       | `sign-up.md`           |
| `(auth)` `/invite`         | same gate; the shared link, a redirect                                                                                       | `/signup?notice=invite`                                                                    | `sign-up.md` row       |
| `(auth)` `/forgot`         | same gate                                                                                                                    | its own sent state; `/signin`                                                              | `forgot.md`            |
| `(auth-pending)` `/verify` | a verified session is sent to `/`; unverified and no session render                                                          | `/` once a confirmed session is seen; `/signup`; `/signin`                                 | `verify.md`            |
| `(auth-pending)` `/reset`  | no session goes to `/forgot?notice=expired`; any session renders (Open 1)                                                    | `/signin?notice=password-changed`, signed out                                              | `reset.md`             |
| `/auth/confirm`            | handler, GET: every emailed link (`token_hash`, `type`, `next`)                                                              | `next` signed in; a bad or used link → `/signin?auth=link_expired` with `next`             | this row; `reset.md`   |
| `/auth/callback`           | handler, GET: Google's return (`code`, `next`)                                                                               | `next` signed in; no code → `/signin?auth=missing_code`; a failed exchange → `?auth=error` | this row; `sign-in.md` |
| `/logout`                  | the Settings index's _Sign out?_ dialog (AU-06) posts here; GET kept (Open 3); revokes the token, clears every `sb-*` cookie | `/signin` by a document load, no dialog (system-states `signed-out`)                       | this row               |

`proxy.ts` refreshes the session on every page except `/signin`, `/logout`, `/auth/*` and `/api/*`, and records the path the shell gate turns into `?next=`.

## Navigation and shell

No shell, tab bar, header or skip link: one centred column in `main#main`, the wordmark as text, one `h1`; the trust line on sign-in and sign-up only. A session lands by `_global/navigation.md`'s entry tree (unverified email → `/verify` first); a session ending under an open page is `_global/system-states.md`'s _Signed out_ dialog, which `/logout` and Delete account suppress.

## Decision log

| ID      | Decision                                                                                                                         | Why                                   | Date       |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ---------- |
| D-WEB-6 | Six files: this overview and one per AU screen; `/invite` is a row in `sign-up.md`; AU-06 is a row here, its dialog is Settings' | Handlers have no states               | 2026-10-09 |
| D-WEB-7 | A delivered email and Google's screen are `inferred: <file>`, never walked; everything else was seen                             | Local auth borrows staging's Supabase | 2026-10-09 |
| D-WEB-8 | Every auth-server sentence is quoted once, in `sign-in.md`; the other files cite that table                                      | A sentence written twice drifts       | 2026-10-09 |

## Open

Each item: the code's behaviour (the default), then the spec's text and section.

1. `[NEEDS DECISION]` Any session renders `/reset`, not only the recovery session. Default: any session. Spec: AU-05 "Entry: reset link"; SET-2 (2026-09-05) ruled AC1 ("a signed-in visit to any of them redirects to `/`") cannot hold on `/reset`.
2. `[NEEDS DECISION]` Three strings carry `[COPY — needs Vesper sign-off]`: the failed-Google line in `(auth)/_components/copy.ts`, and the password-policy and server-fault lines in `packages/auth/src/auth-errors.ts`. Default: as written. Spec: none is in Epic 1 §1 or §9; SET-2 (2026-09-05) logged the first.
3. `[NEEDS DECISION]` `/logout` answers GET as well as POST. Default: kept, new callers POST. Spec: AU-06 is a dialog's submit; INF-6 (2026-09-04).
4. `[NEEDS DECISION]` _Forgot your password?_ links to `/forgot` bare; `/forgot` reads `?email=` but nothing sends it. Default: not carried. Spec: AU-01 "carrying the email if typed"; AU-04 "prefilled".
5. `[NEEDS DECISION]` A dead recovery link lands on `/signin?auth=link_expired&next=/reset`; only `/reset` opened with no session goes to `/forgot?notice=expired`. Default: as is. Spec: AU-05 "expired link → AU-04 with _That link has expired. Request a new one._"
6. `[NEEDS DECISION]` _Use a different email_ brings the name back, never the password. Default: name only. Spec: AU-03 "name and password retained in memory"; SET-2 (2026-09-05).
7. `[NEEDS DECISION]` The sign-up name goes to the auth server as metadata; nothing reads it into the account's display name (the new-user trigger inserts id and email only), and a Google account arrives with none. Default: as is. Spec: AU-02 "Used as `display_name`"; AU-01 "display name prefilled from Google". `[inferred from source: packages/db/supabase/setup/01_init_functions.sql]`
