---
source:
  - docs/ux/epic1_setup_ux_architecture.md §1 AU-01, §0.3, §9
  - docs/ux/ux-spec-v1.md §4.1
  - code 35d13df (app/(auth)/signin/, (auth)/_components/, app/auth/callback/route.ts, lib/auth/describe-auth-error.ts; packages/auth/src/auth-errors.ts; @syn/utils sanitizeNextPath)
status: draft
promoted:
---

# sign-in — auth

## Job

Get a returning person back into their space in one form, in any state: email and password, or Google. Done is a session and the entry tree deciding where they land; the screen never guesses `/today`.

## Layout and components

`AuthFrame` (wordmark, `h1` _Sign in_, trust line on) holding, in order: the arrival notice (`FormMessage`, only when one applies), `OAuthButton` (Google, secondary weight, full width), `AuthDivider` _or_, the form (`Input` email, `Input` password with the _Show_/_Hide_ text button, the _Forgot your password?_ link, `Button` primary _Sign in_ full width), then the offline line and the submit error (`FormMessage`), the footer `Text` with the _Create an account_ link. Primary action: _Sign in_. The Google button is first in reading order and secondary in weight (Epic 1 AU-01).

## States

The entry tree, not this screen, decides where a session goes: `?next=` is honoured only when it starts with `/` and not `//`, and `/` counts as none; anything else is dropped, never shown.

| State          | Key             | What shows                                                                                                                                                                        | What the person can do          | Copy                                                                                                                                                                                                                                                                              | Artboard | Evidence                                     |
| -------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------- |
| empty          | `empty`         | N/A: the blank form is the screen; nothing is fetched                                                                                                                             | —                               | —                                                                                                                                                                                                                                                                                 | —        | —                                            |
| loading        | `loading`       | Submit: the fieldset and the Google button disabled, _Sign in_ busy, label unchanged. Google: that button busy, its mark hidden, the form disabled, then the browser leaves       | Wait                            | —                                                                                                                                                                                                                                                                                 | —        | inferred: sign-in-form.tsx                   |
| error          | `error`         | The auth server's sentence under the form (table below); the unverified one carries _Resend the link_, which keeps the typed email in session storage and goes to `/verify?next=` | Fix and resend; Resend the link | the table below                                                                                                                                                                                                                                                                   | —        | seen (wrong credentials); inferred: the rest |
| partial        | `partial`       | N/A: one call                                                                                                                                                                     | —                               | —                                                                                                                                                                                                                                                                                 | —        | —                                            |
| offline        | `offline`       | The fieldset and the Google button disabled; the line under the form; cleared when the browser reports online                                                                     | Read; wait                      | _You're offline — sign-in needs a connection._                                                                                                                                                                                                                                    | —        | seen (`navigator.onLine` forced)             |
| success        | `success`       | The location is replaced with `?next=`, else `/`; a shell load with setup owed lands on `/setup/{step}`                                                                           | —                               | —                                                                                                                                                                                                                                                                                 | —        | seen (`?next=/settings/about` → `/setup/4`)  |
| validation     | `validation`    | On submit, then live per field: a sentence under each field, ink, a hairline; nothing marked while typing                                                                         | Fix                             | _That doesn't look like an email address._ · _Passwords need at least 8 characters._ (presence only here)                                                                                                                                                                         | —        | seen                                         |
| arrival notice | `notice`        | Above the Google button, from a closed set of flags; an unknown flag shows nothing; cleared on the next submit or Google tap                                                      | Read                            | `notice=password-changed` _Password changed. Sign in with the new one._ · `notice=account-deleted` _Your account was deleted._ · `auth=link_expired` _That link has expired. Request a new one._ · `auth=error` or `auth=missing_code` _Couldn't sign in with Google. Try again._ | —        | seen (all four)                              |
| show password  | `show-password` | A 44px text button inside the field toggles it to text; the name flips                                                                                                            | Show, Hide                      | _Show_ · _Hide_                                                                                                                                                                                                                                                                   | —        | seen                                         |
| signed in      | `signed-in`     | Never shown: the group gate sends a session to `/`                                                                                                                                | —                               | —                                                                                                                                                                                                                                                                                 | —        | seen (→ `/setup/4`)                          |
| Google return  | `oauth-return`  | `/auth/callback` exchanges the code and lands on `next` signed in; a new Google identity goes through the entry tree like any first session (overview Open 7)                     | —                               | —                                                                                                                                                                                                                                                                                 | —        | inferred: auth/callback/route.ts             |

Every sentence the auth server can produce (`mapAuthError`; the other four files cite this table):

| Auth server answer                                      | Sentence                                                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `user_already_exists`, "already registered"             | _There's already an account with this email._                                                                 |
| `invalid_credentials`, "invalid login credentials"      | _That email and password don't match._ (never which half)                                                     |
| `email_not_confirmed`                                   | _This email isn't verified yet._ + _Resend the link_                                                          |
| `over_request_rate_limit`, `over_email_send_rate_limit` | _Too many attempts. Try again in a few minutes._                                                              |
| `otp_expired`, "expired", "invalid token"               | _That link has expired. Request a new one._                                                                   |
| `weak_password`, "password should"                      | _That password doesn't meet the requirements. Try a longer one, or add a number or symbol._ (overview Open 2) |
| `unexpected_failure`, "database error"                  | _Couldn't create the account. Try again in a moment._ (overview Open 2)                                       |
| anything else                                           | _Something went wrong. Try again._ (the raw message is logged in development only)                            |

## Words

As quoted: _Synapse_ · _Sign in_ · _Continue with Google_ · _or_ · _Email_ · _Password_ · _Forgot your password?_ · _Sign in_ · _New here?_ _Create an account_ · the trust line _Only you can see your data. Not the people who built this, not anyone you invite._ A statement and a next step; no exclamation, no apology, no code; a notice says what happened, never to whom.

## Access

Order: wordmark (plain text), `h1`, the notice, the Google button, _or_ (its rules `aria-hidden`), Email, Password, _Show password_ / _Hide password_ (`aria-pressed`), the forgot link, _Sign in_, the offline line, the error, the footer link, the trust line. Labels are visible, never placeholders; a field error sets `aria-invalid` and is linked by `aria-describedby`; every `FormMessage` is `role="alert"`, polite, rendered only when it has something to say. Email mode sets the email keyboard; password carries `current-password`. One `h1`, `main#main`. Reduced motion: only the busy spinner moves.

## Instrumentation

None on the screen. `describeAuthError` logs an unmapped error's code and message in development, never the email or password; `/auth/callback` logs that a code was present and where `next` points, and a failed exchange's message and code.

## Criteria

| ID              | When                                                      | Then                                                                                | Evidence |
| --------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- |
| C-WEB-sign-in-1 | `/signin` at 390 and 1440, light and dark                 | The read order above; one `h1`; the trust line last                                 | capture  |
| C-WEB-sign-in-2 | Submit empty, then a wrong password                       | The two field sentences; then _That email and password don't match._ under the form | manual   |
| C-WEB-sign-in-3 | `?next=/review`, `?next=https://x.test`, `?next=//x.test` | After sign-in: `/review` (or the entry tree's own stop); `/`; `/`                   | manual   |
| C-WEB-sign-in-4 | Each of the four notice flags, and `?notice=bogus`        | The matching sentence above the Google button; nothing for the unknown flag         | manual   |
| C-WEB-sign-in-5 | `navigator.onLine` false                                  | Both buttons disabled; the offline line; both return when online                    | manual   |

## Decisions and open items

D-WEB-6 to D-WEB-8. Open 2, 4, 5, 7 in `overview.md`.
