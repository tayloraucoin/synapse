---
source:
  - docs/ux/epic1_setup_ux_architecture.md §1 AU-02, §8.1, §9; ST-11
  - docs/ux/ux-spec-v1.md §4.1
  - code 35d13df (app/(auth)/signup/, app/(auth)/invite/page.tsx, (auth)/_components/copy.ts; @syn/constants STORAGE_KEYS; @syn/validators auth-credentials.ts)
status: draft
promoted:
---

# sign-up — auth

## Job

Give a curious, uncommitted person a private space for the three facts an account needs, in two minutes, asking for nothing else. Done is the account existing and the person on `/verify` knowing which inbox to open.

## Layout and components

`AuthFrame` (wordmark, `h1` _Create an account_, the invite line as `lead` only from the shared link, trust line on) holding `OAuthButton` (Google), `AuthDivider` _or_, the form (`Input` _Your name_ with `maxLength` 40, `Input` email, `Input` password with helper and the _Show_/_Hide_ button, `Button` primary _Create account_ full width), then the offline line, the existing-account line, the error (`FormMessage`), and the footer `Text` with the _Sign in_ link. Primary action: _Create account_.

`/invite` is a redirect to `/signup?notice=invite`, never a screen: no token, no referral count, one extra sentence (Epic 1 ST-11, v1 §4.1).

## States

| State            | Key                | What shows                                                                                                                                                                                         | What the person can do | Copy                                                                                                                                                                  | Artboard | Evidence                                                      |
| ---------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| empty            | `empty`            | N/A: the blank form is the screen; the name is prefilled only on return from `/verify`                                                                                                             | —                      | —                                                                                                                                                                     | —        | —                                                             |
| loading          | `loading`          | The fieldset and the Google button disabled, _Create account_ busy, label unchanged; Google: that button busy, the browser leaves                                                                  | Wait                   | —                                                                                                                                                                     | —        | inferred: sign-up-form.tsx                                    |
| error            | `error`            | The auth server's sentence under the form (`sign-in.md`'s table): the password policy, a server fault, the rate limit, the fallback                                                                | Fix and resend         | per `sign-in.md`                                                                                                                                                      | —        | inferred: sign-up-form.tsx                                    |
| partial          | `partial`          | N/A: one call                                                                                                                                                                                      | —                      | —                                                                                                                                                                     | —        | —                                                             |
| offline          | `offline`          | The fieldset and the Google button disabled; the line under the form                                                                                                                               | Read; wait             | _You're offline — sign-in needs a connection._                                                                                                                        | —        | inferred: sign-up-form.tsx (same hook as sign-in, seen there) |
| success          | `success`          | The address and the name go to session storage (never the URL, never the password); the location is replaced with `/verify`; no session exists until the email is confirmed                        | —                      | —                                                                                                                                                                     | —        | inferred: sign-up-form.tsx                                    |
| validation       | `validation`       | On submit, then live per field                                                                                                                                                                     | Fix                    | _Add a name — it's just what the app calls you._ (empty or over 40 after trim) · _That doesn't look like an email address._ · _Passwords need at least 8 characters._ | —        | seen (all three)                                              |
| existing account | `existing-account` | The auth server answers an existing address with a success whose identities are empty, so no error is shown to an outsider; the line under the form with an inline link; the form keeps its values | Sign in instead        | _There's already an account with this email._ · _Sign in instead_                                                                                                     | —        | seen (the seeded address)                                     |
| invite           | `invite`           | From `/invite` only: one sentence under the heading; the form is the same form                                                                                                                     | —                      | _Someone shared Synapse with you. It's free, and your list is private to you._                                                                                        | —        | seen (`/invite` → `/signup?notice=invite`)                    |
| name retained    | `name-retained`    | Back from `/verify`'s _Use a different email_: the name is filled from session storage, email and password are blank (overview Open 6)                                                             | Change the email       | —                                                                                                                                                                     | —        | seen (storage set by hand)                                    |
| show password    | `show-password`    | As `sign-in.md`; this field carries `new-password` and the helper                                                                                                                                  | Show, Hide             | _At least 8 characters._                                                                                                                                              | —        | seen                                                          |
| signed in        | `signed-in`        | Never shown: the group gate sends a session to `/`; `/invite` too                                                                                                                                  | —                      | —                                                                                                                                                                     | —        | seen (`/invite` → `/setup/4`)                                 |
| Google           | `oauth`            | The same `/auth/callback` as sign-in, with no `next`; the identity's email arrives confirmed, so the entry tree takes the new account to setup; no name is carried (overview Open 7)               | —                      | —                                                                                                                                                                     | —        | inferred: sign-up-form.tsx, session.ts                        |

The confirmation email links to `/auth/confirm?next=/`; the person lands signed in on any browser, including one that never had this tab open, and the entry tree sends a new account to `/setup/1` (`_global/navigation.md`).

## Words

As quoted: _Create an account_ · the invite line · _Continue with Google_ · _or_ · _Your name_ · _Email_ · _Password_ · _At least 8 characters._ · _Create account_ · _Already have an account?_ _Sign in_ · the trust line. No complexity rule, no strength meter, no plan or tier anywhere (v1 §4.1). The existing-account line names the fact and the door, nothing about the other person.

## Access

Order: wordmark, `h1`, the invite line, the Google button, _or_, _Your name_ (`autocomplete=name`), Email, Password with _Show password_ (`new-password`), the helper linked by `aria-describedby`, _Create account_, the offline line, the existing-account line and its link, the error, the footer link, the trust line. Alerts and field errors as `sign-in.md`. Reduced motion: only the busy spinner moves.

## Instrumentation

None on the screen; `describeAuthError` as `sign-in.md`.

## Criteria

| ID              | When                                            | Then                                                                                              | Evidence |
| --------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------- |
| C-WEB-sign-up-1 | `/invite` at 390 and 1440, light and dark       | Lands on `/signup?notice=invite`; the invite line under the heading; the read order above         | capture  |
| C-WEB-sign-up-2 | Submit empty                                    | The three field sentences, none while typing before the first submit                              | manual   |
| C-WEB-sign-up-3 | Submit an address that already has an account   | _There's already an account with this email._ with _Sign in instead_; no other error; values kept | manual   |
| C-WEB-sign-up-4 | A successful submit, then the browser's storage | Only the email and the name under `syn:auth-pending-*`; no password anywhere; `/verify` shown     | manual   |
| C-WEB-sign-up-5 | `/signup` with a session                        | Redirects to `/`                                                                                  | manual   |

## Decisions and open items

D-WEB-6 to D-WEB-8. Open 2, 6, 7 in `overview.md`.
