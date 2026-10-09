---
source:
  - docs/ux/epic1_setup_ux_architecture.md §1 AU-03; §0.3
  - docs/ux/ux-spec-v1.md §4.1 (verify-pending blocks the app)
  - code 35d13df (app/(auth-pending)/layout.tsx, verify/layout.tsx, verify/page.tsx, verify/_components/verify-panel.tsx, lib/auth/require-verified-email.ts; packages/auth/src/session.ts isEmailVerified)
status: draft
promoted:
---

# verify — auth

## Job

Hold a person who is waiting for an email without losing them: say which inbox, offer one resend, and notice on its own when the link was opened somewhere else. Done is a confirmed session, which `/auth/confirm` creates on whichever device opened the link.

## Layout and components

`AuthFrame` (wordmark, `h1` _Check your email_, no trust line: the promise was made on the screen before) holding a `Text` body with the address in `strong`, `Button` secondary full width _Resend the link_, then the advice line, the offline line and the resend error (`FormMessage`), two text links _Use a different email_ and _Sign in_, and a caption `Text` note. Primary action: none; the resend is secondary because the email already sent is the primary thing.

## States

Three gates in one layout: no session renders (the ordinary case, just signed up); a session with an unverified email renders (what the shell gate sends here, before setup or any tab); a verified session is sent to `/`. The address comes from the session when there is one, else from session storage, else the fallback word. A `?next=` carried here is not read: a confirmed session goes to `/` and the entry tree decides.

| State              | Key               | What shows                                                                                                                                                          | What the person can do         | Copy                                                                                                                                                                                                                                                 | Artboard | Evidence                                                     |
| ------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| empty              | `empty`           | No address known (storage cleared, no session): the body names _your email_ and the resend is disabled, because there is nothing to send to                         | Use a different email; Sign in | _We sent a sign-in link to_ **your email**_. Open it on this device to continue._                                                                                                                                                                    | —        | seen                                                         |
| loading            | `loading`         | N/A: the screen renders with no fetch; a resend is the button's own busy moment, label unchanged                                                                    | —                              | —                                                                                                                                                                                                                                                    | —        | —                                                            |
| error              | `error`           | A failed resend: the auth server's sentence under the button (`sign-in.md`'s table, the rate limit being the likely one)                                            | Wait, try again                | per `sign-in.md`                                                                                                                                                                                                                                     | —        | inferred: verify-panel.tsx                                   |
| partial            | `partial`         | N/A                                                                                                                                                                 | —                              | —                                                                                                                                                                                                                                                    | —        | —                                                            |
| offline            | `offline`         | The resend disabled and the line under it; the instruction still stands; the links still work                                                                       | Read                           | _You're offline — sign-in needs a connection._                                                                                                                                                                                                       | —        | seen (`navigator.onLine` forced)                             |
| success            | `success`         | A confirmed session is seen on focus or when the tab becomes visible (no timer): the location is replaced with `/`; also the gate on a fresh load                   | —                              | —                                                                                                                                                                                                                                                    | —        | seen (verified seed session → `/`); inferred: the focus poll |
| waiting            | `waiting`         | The ordinary state: the address in bold from storage (no session) or the session; the resend enabled                                                                | Resend; the two links          | _Check your email_ · _We sent a sign-in link to_ **a@example.test**_. Open it on this device to continue._ · _Resend the link_ · _Use a different email_ · _Sign in_ · _Didn't get it? Check spam, or wait a minute — they sometimes take a moment._ | —        | seen                                                         |
| sent               | `sent`            | After a resend: the label reads _Sent_ for two seconds, then counts down thirty seconds, then returns; the label is `aria-live="off"` so the ticks are not read out | Wait                           | _Sent_ · _Resend in 24s_ · _Resend the link_                                                                                                                                                                                                         | —        | inferred: verify-panel.tsx                                   |
| third send         | `third-send`      | From the third resend on, a line under the button stops promising and offers the way out                                                                            | Use a different email          | _Sent again. If it still doesn't arrive, try a different email._                                                                                                                                                                                     | —        | inferred: verify-panel.tsx                                   |
| different email    | `different-email` | _Use a different email_ goes to `/signup` with the name filled and the email blank (`sign-up.md`, overview Open 6)                                                  | —                              | —                                                                                                                                                                                                                                                    | —        | seen                                                         |
| unverified session | `unverified`      | What `requireVerifiedEmail` sends here from any shell load; the session's address is the one named; the resend sends the sign-up confirmation again                 | Resend; Sign in                | as waiting                                                                                                                                                                                                                                           | —        | inferred: require-verified-email.ts, verify/page.tsx         |
| verified session   | `verified`        | Never shown: the gate sends it to `/`                                                                                                                               | —                              | —                                                                                                                                                                                                                                                    | —        | seen                                                         |

## Words

As quoted above. The address is the one thing in bold. The note is quiet, not muted: it reads at caption size in the secondary tone because muted fails AA there (SET-2, 2026-09-05). No count of sends is ever shown; the third-send line is advice, not a tally.

## Access

Order: wordmark, `h1`, the body, _Resend the link_ (disabled when offline, cooling down or with no address), the advice line, the offline line, the error, _Use a different email_, _Sign in_, the note. The countdown button is `aria-live="off"`; the `FormMessage` lines are `role="alert"`, polite. One `h1`, `main#main`. Reduced motion: nothing moves.

## Instrumentation

None today; the focus poll calls the auth server and logs nothing.

## Criteria

| ID             | When                                                                         | Then                                                                                        | Evidence |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------- |
| C-WEB-verify-1 | `/verify` with `syn:auth-pending-email` set, at 390 and 1440, light and dark | The address in bold, the resend enabled, the read order above                               | capture  |
| C-WEB-verify-2 | `/verify` with no session and no storage                                     | _your email_ in the body; the resend disabled; both links live                              | manual   |
| C-WEB-verify-3 | A resend                                                                     | _Sent_ for two seconds, then _Resend in 30s_ counting down; the third shows the advice line | manual   |
| C-WEB-verify-4 | A verified session on `/verify`; an unverified one on `/today`               | The first lands on `/` and the entry tree; the second lands here                            | manual   |

## Decisions and open items

D-WEB-6 to D-WEB-8. Open 6 in `overview.md`.
