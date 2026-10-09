---
source:
  - docs/ux/epic1_setup_ux_architecture.md §1 AU-05, AU-06; §0.3, §9
  - docs/ux/ux-spec-v1.md §4.1
  - code 35d13df (app/(auth-pending)/reset/layout.tsx, reset/page.tsx, reset/_components/reset-form.tsx, app/auth/confirm/route.ts, app/logout/route.ts, lib/auth/session-expired.ts; packages/auth/src/cookies.ts)
status: draft
promoted:
---

# reset — auth

## Job

Set a new password from an emailed link, then make the person use it once on purpose. Done is `/signin` with the one-line confirmation and no session left on this device or any other that held the old one.

## Layout and components

`AuthFrame` (wordmark, `h1` _Choose a new password_, no trust line) holding the form: `Input` password _New password_ with the helper and the _Show_/_Hide_ button, `Input` password _Confirm password_ with its own _Show_/_Hide_, `Button` primary _Save password_ full width; then the offline line and the error (`FormMessage`). No links: the only ways out are saving or leaving. Primary action: _Save password_.

## States

The gate is the inverse of `(auth)`'s: `/auth/confirm` verifies the recovery link, signs the person in and redirects here, and that session is what the password change needs. No session is sent to `/forgot?notice=expired` (`forgot.md`). Any session renders (overview Open 1).

| State         | Key             | What shows                                                                                                                                                                                                                                                                                           | What the person can do | Copy                                                                                                       | Artboard | Evidence                                                             |
| ------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| empty         | `empty`         | N/A: the blank form is the screen                                                                                                                                                                                                                                                                    | —                      | _Choose a new password_ · _New password_ · _At least 8 characters._ · _Confirm password_ · _Save password_ | —        | seen (seed session)                                                  |
| loading       | `loading`       | The fieldset disabled, _Save password_ busy, label unchanged, through the change and the sign-out that follows it                                                                                                                                                                                    | Wait                   | —                                                                                                          | —        | inferred: reset-form.tsx                                             |
| error         | `error`         | The auth server's sentence under the form (`sign-in.md`'s table): the password policy, the rate limit, the fallback; the form keeps its values                                                                                                                                                       | Fix and save again     | per `sign-in.md`                                                                                           | —        | inferred: reset-form.tsx                                             |
| partial       | `partial`       | N/A                                                                                                                                                                                                                                                                                                  | —                      | —                                                                                                          | —        | —                                                                    |
| offline       | `offline`       | The fieldset disabled; the line under the form                                                                                                                                                                                                                                                       | Read; wait             | _You're offline — sign-in needs a connection._                                                             | —        | inferred: reset-form.tsx (same hook as sign-in, seen there)          |
| success       | `success`       | The password is changed, then the session is ended on purpose (a link that sat in an inbox is a weaker credential than the password just chosen), then the location is replaced with `/signin?notice=password-changed`; no _Signed out_ dialog, because the watcher is not mounted outside the shell | —                      | _Password changed. Sign in with the new one._ (on `/signin`)                                               | —        | inferred: reset-form.tsx (a save changes the seed password, D-WEB-7) |
| validation    | `validation`    | On submit, then live: the length rule under the first field, the match rule under the second                                                                                                                                                                                                         | Fix                    | _Passwords need at least 8 characters._ · _These don't match._                                             | —        | seen (both)                                                          |
| expired       | `expired`       | Never shown here: a dead link stops at `/auth/confirm`, which lands on `/signin?auth=link_expired&next=/reset` with the expired sentence (overview Open 5); arriving here with no session goes to `/forgot`                                                                                          | —                      | —                                                                                                          | —        | seen (no session); inferred: auth/confirm/route.ts                   |
| double tap    | `double-tap`    | A recovery link opened twice: the second verify fails but clears nothing, so the session the first click made survives and this form still renders                                                                                                                                                   | Save                   | —                                                                                                          | —        | inferred: auth/confirm/route.ts                                      |
| show password | `show-password` | Each field has its own 44px text button; both carry `new-password`                                                                                                                                                                                                                                   | Show, Hide             | _Show_ · _Hide_                                                                                            | —        | seen                                                                 |

Sign out (AU-06) is a routes row in `overview.md`: the _Sign out?_ dialog on the Settings index stops a running timer, sets the deliberate flag, and posts to `/logout`, which revokes the refresh token at the auth server and clears every `sb-*` cookie, then lands on `/signin` by a document load; GET is still answered for old links (overview Open 3). Its dialog, words and offline sentence belong to `settings/`.

## Words

As quoted. The helper repeats the only rule; no strength meter, no complexity advice unless the server's policy rejects the password (overview Open 2). The confirmation on `/signin` is past tense and a next step.

## Access

Order: wordmark, `h1`, _New password_, its _Show password_, the helper, _Confirm password_, its _Show password_, _Save password_, the offline line, the error. Both toggles are named _Show password_ / _Hide password_ with `aria-pressed`; the helper and each field error are linked by `aria-describedby`; a field error sets `aria-invalid`. One `h1`, `main#main`. Reduced motion: only the busy spinner moves.

## Instrumentation

None on the screen. `/auth/confirm` logs that a token was present, its type and where `next` points, and a failed verify's message and code; `/logout` logs nothing.

## Criteria

| ID            | When                                                    | Then                                                                                                                    | Evidence |
| ------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| C-WEB-reset-1 | `/reset` with a session at 390 and 1440, light and dark | The read order above; no links; one `h1`                                                                                | capture  |
| C-WEB-reset-2 | Submit empty, then two different passwords              | _Passwords need at least 8 characters._ under the first; _These don't match._ under the second                          | manual   |
| C-WEB-reset-3 | A matching pair saved                                   | Lands on `/signin` with _Password changed. Sign in with the new one._; no `sb-*` cookie remains; the old password fails | manual   |
| C-WEB-reset-4 | `/reset` with no session; a recovery link opened twice  | The first goes to `/forgot?notice=expired`; the second still shows this form                                            | manual   |
| C-WEB-reset-5 | `/logout` by POST from the dialog, and by GET           | Both land on `/signin` with no `sb-*` cookie and no _Signed out_ dialog                                                 | manual   |

## Decisions and open items

D-WEB-6 to D-WEB-8. Open 1, 2, 3, 5 in `overview.md`.
