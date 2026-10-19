---
source:
  - docs/ux/epic1_setup_ux_architecture.md §1 AU-04, AU-05 (the expired exit); §0.3
  - docs/ux/ux-spec-v1.md §4.1
  - code 35d13df (app/(auth)/forgot/page.tsx, forgot/_components/forgot-form.tsx, (auth-pending)/reset/layout.tsx, app/auth/confirm/route.ts)
status: draft
promoted:
---

# forgot — auth

## Job

Start a password reset without ever confirming whether the address has an account. Done is the sent state: the person knows a link is on its way if there is somewhere for it to go.

## Layout and components

The leaf owns the `AuthFrame` because the heading changes with the state. Idle: wordmark, `h1` _Reset your password_, the `lead`, the form (`Input` email, `Button` primary _Send reset link_ full width), the offline line and the expired line (`FormMessage`), the _Back to sign in_ link. Sent: `h1` _Check your email_, a `Text` body with the address in `strong`, `Button` secondary full width _Resend_, the offline line, _Back to sign in_. No trust line. Primary action: _Send reset link_; none on the sent screen.

## States

The recovery email links to `/auth/confirm?next=/reset`; opening it signs the person in and lands on `reset.md`. The auth server answers a known and an unknown address the same way, and so does this screen: every answer that reached the server shows the sent state; only a transport failure is different, because it says nothing about the address.

| State      | Key          | What shows                                                                                                                                                   | What the person can do  | Copy                                                                                                                                                | Artboard | Evidence                                                       |
| ---------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------- |
| empty      | `empty`      | N/A: the blank form is the screen; `?email=` prefills it when a caller sends one (none does, overview Open 4)                                                | —                       | _Reset your password_ · _Enter your email and we'll send a reset link._ · _Email_ · _Send reset link_ · _Back to sign in_                           | —        | seen (`?email=` by hand)                                       |
| loading    | `loading`    | The fieldset disabled, _Send reset link_ busy, label unchanged                                                                                               | Wait                    | —                                                                                                                                                   | —        | inferred: forgot-form.tsx                                      |
| error      | `error`      | N/A as a sentence about the address: a rejected address still shows the sent state; a transport failure shows the offline line on whichever screen asked     | —                       | —                                                                                                                                                   | —        | inferred: forgot-form.tsx                                      |
| partial    | `partial`    | N/A                                                                                                                                                          | —                       | —                                                                                                                                                   | —        | —                                                              |
| offline    | `offline`    | Idle: the fieldset disabled and the line under the form. Sent: _Resend_ disabled and the same line. Also shown after a request that never reached the server | Read                    | _You're offline — sign-in needs a connection._                                                                                                      | —        | seen (`navigator.onLine` forced); inferred: the transport case |
| success    | `success`    | The sent screen replaces the form: a new heading, the address in bold, _Resend_ cooling down thirty seconds then enabled; _Back to sign in_                  | Resend; Back to sign in | _Check your email_ · _If there's an account for_ **a@example.test**_, a reset link is on its way._ · _Resend in 30s_ · _Resend_ · _Back to sign in_ | —        | inferred: forgot-form.tsx (a send delivers mail, D-WEB-7)      |
| validation | `validation` | On submit, then live: one sentence under the field                                                                                                           | Fix                     | _That doesn't look like an email address._                                                                                                          | —        | seen                                                           |
| expired    | `expired`    | `?notice=expired`, where `/reset` sends anyone with no session: the idle form with the line under it; the form is otherwise ordinary (overview Open 5)       | Send again              | _That link has expired. Request a new one._                                                                                                         | —        | seen (`/reset` signed out → here)                              |
| signed in  | `signed-in`  | Never shown: the group gate sends a session to `/`                                                                                                           | —                       | —                                                                                                                                                   | —        | seen (→ `/setup/4`)                                            |

## Words

As quoted. _We_ appears once, in the lead, and is the auth server speaking about the email it sends (Epic 1 AU-04 verbatim). The sent body is conditional on purpose: _If there's an account for_ is the whole privacy of this screen. No count of sends, no _didn't arrive?_ line here; that belongs to `verify.md`.

## Access

Idle order: wordmark, `h1`, the lead, Email, _Send reset link_, the offline or expired line, _Back to sign in_. Sent order: wordmark, `h1`, the body, _Resend_ (disabled while cooling down; its label carries the countdown and is not live), the offline line, _Back to sign in_. The heading change is the announcement of the sent state: focus stays where it was, the new `h1` is first in the new tree. Alerts as `sign-in.md`. Reduced motion: only the busy spinner moves.

## Instrumentation

None today.

## Criteria

| ID             | When                                                                   | Then                                                                      | Evidence |
| -------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------- |
| C-WEB-forgot-1 | `/forgot` and `/forgot?notice=expired` at 390 and 1440, light and dark | The idle order; the expired line under the form only on the second        | capture  |
| C-WEB-forgot-2 | A known address and an unknown one submitted                           | Both show _Check your email_ with the address; nothing distinguishes them | manual   |
| C-WEB-forgot-3 | _Resend_ on the sent screen                                            | Disabled thirty seconds with the countdown, then enabled; sends again     | manual   |
| C-WEB-forgot-4 | `/reset` opened with no session                                        | Lands here with _That link has expired. Request a new one._               | manual   |

## Decisions and open items

D-WEB-6 to D-WEB-8. Open 4, 5 in `overview.md`.
