# SET-8 — Settings core: the index ST-00, Account ST-01 with sign-out, Day & time ST-08, Appearance ST-09, Share ST-11

**Epic:** SET — Setup · **Phase 4** · Size: M
**Slice type:** Five settled screens over account scalars — one index, three forms, one share action. The risk class is *a second entry tree or a second theme source*: the index guessing the resume step, appearance stored in two places that disagree.
**Vigil:** none.

**Status:** Complete (2026-09-05)

---

## Outcome

The header avatar opens a Settings index that routes to every section with a one-line description and live counts, shows *Setup isn't finished — continue* while first run is owed, and offers *Sign out* with the dialog that says the data stays. Account lets a person change their photo, name, email (with verification), and password, or see *You sign in with Google.* Day & time holds the wake time, the wake-up habit, the day close (00:00–06:00, applies tomorrow), the review reminder, and the zone. Appearance is the System/Light/Dark control, stored on the account. Share offers the invite link through the Web Share API or a copy. **Reasons, Notifications, Your data, and About** are other tickets (SET-9, SET-10, SYS-3); their index rows link to placeholders until then.

## Why / intent

- **Official spec §4.6, §9.8** — the settings list; the avatar in exactly two places (32px header, 64px account); initials by default; the photo through the icon pipeline.
- **Epic 1 §7 (ST-00, ST-01, ST-08, ST-09, ST-11) and §1 AU-06** — every row, description, field, helper, and dialog string. §13.1: day close bounded 00:00–06:00 with the 03:00 working default (still awaiting Taylor's one-line confirmation — build the bound and default as stated; `[PROVISIONAL — Taylor]`).
- **Cross-cutting §7.3, §7.5** — a zone switch and a day-close change take effect from tomorrow; the helper says *Applies from tomorrow.* The pending-pair on `users` (SET-1) is the mechanism; USE-1 applies it.
- **Cross-cutting §5.1** — the install offer lives on Settings → Notifications on iOS (SET-9) and the status line (SYS-5); **not** here.
- **INF-3 / INF-7** — `ThemeProvider` (next-themes, `storageKey: "syn:theme"`) and `ThemeControl` exist; `users.theme` exists; nothing yet reconciles them.
- **Ground truth:** `user.me` / `user.updatePreferences` (INF-8), `user.setAvatar` / `removeAvatar` (SET-3), `useIconUpload` + `ImageCropper`, `SettingsRow`, `Avatar`, `ConfirmDialog`, `TimeField`, `TimezoneSelect` + `TIMEZONE_REGIONS`, `ThemeControl` + `useAppTheme`, `AppHeader`, `ScreenFrame`, `TrustLine`, `Input`, `Button`, `StatusLine`, `useOnline`, `inviteRoute()`, `lib/auth/*`, `/logout`.
- **What this slice is NOT (binding):** it does not build ST-06, ST-07, ST-10, SY-01; it does not build the shell's avatar button (SYS-1 renders `AppHeader`'s avatar from `user.me`); it does not apply the pending pair (USE-1).

**Rulings this slice makes (labelled, logged):**

- **`users.theme` is the cross-device source; next-themes is the per-device cache.** ST-09 writes both on change; on sign-in and on `user.me` load the app calls `setTheme(user.theme)` once if it differs from the stored one (a small client leaf in the shell layout, `theme-sync.tsx`, shipped here). Logged (`TECHNICAL-DECISIONS.md`).
- **Day close and time zone write the pending pair, never the live column.** `user.updatePreferences({ pendingDayCloseTime, pendingTimezone })` sets the value and `…_from = tomorrow's day key` (server-side, from USE-1's `resolveDayKey` once Complete; until then, from the calendar date + 1 in the stored zone — `[REVISIT: USE-1]`, log it). ST-08 displays the pending value when present. Logged.
- **Email change goes through Supabase's double-confirmation** (`updateUser({ email })` with `emailRedirectTo` to `/auth/confirm?next=/settings/account`); the shadow row's `email` follows via the existing sync trigger. Logged.
- **Password change re-authenticates with the current password first** (`signInWithPassword` with the session's email, then `updateUser({ password })`); the *That's not your current password.* error comes from the first call. Logged.
- **The password field promotes to `@syn/ui`** as `PasswordField` (SET-2's group-local leaf was the third consumer; ST-01 is the fourth — promote, story it, and replace SET-2's import; re-check SET-2's AC 1). Logged.
- **ST-11's link is the tier's site URL + `inviteRoute()`**, read from `NEXT_PUBLIC_SITE_URL` through the provider's existing resolution. No token, no counter. Logged.
- **Sign-out flushes nothing in Phase 1** (timers arrive in USE-3, which adds the flush and the offline line to the same dialog — noted there). Logged.

## Experience & states

### ST-00 Settings index (`/settings`)

`AppHeader` *Settings*, `onBack` → the tab that opened it (`router.back()` when the referrer is in-app, else `todayRoute()`). A top card: `Avatar size={64}` (name / image) · display name · email — one `ListRow` linking to `/settings/account`. Then `SettingsRow`s in the document's order with their descriptions:

- *Setup isn't finished — continue* — only while `first_run_completed_at` is null; `href = setupRoute(first_run_step ?? 1)`
- *Habits* — *{n} habits* · *Templates* — *{n} templates* · *Week* — *{this week: n days planned}* · *Categories* — *{n}* · *Reasons* — *What you can pick when something's missed* · *Notifications* — *Reminders are only the times you set* · *Day & time* — *Wake time, day close, time zone* · *Appearance* — *System / Light / Dark* · *Your data* — *Export or delete everything* · *Share the app* · *About* — *Version, feedback, keyboard shortcuts* (SY-01's row, last before Sign out)
- *Calendar* is hidden (Phase 2).
- Footer: *Sign out* (ghost) → AU-06 dialog · version line (`Text variant="caption" tone="secondary"`: `{version} · {build date}` from `NEXT_PUBLIC_APP_VERSION` / build-time constants — add both to `env.ts` and `next.config.ts` as the one reader; `[NEEDS VALUE AT BUILD: how the version is stamped — read `package.json` version and the git short SHA at build]`).

Counts come from one procedure, `shell.settingsCounts` (habits, templates, categories, planned days this week), cached; while loading they render as `SkeletonBlock` inline; **offline shows cached counts, never a spinner in a row** (cross-cutting G5).

### ST-01 Account (`/settings/account`)

`AppHeader` *Account*, `onBack`. `Avatar size={64}` with *Change photo* (file input → `ImageCropper` → `useIconUpload` → `user.setAvatar`) and *Remove photo* when set. Form (`useSynapseForm(accountFormSchema)`): *Name* (`Input`, 1–40, required — `displayNameSchema`) · *Email* (`Input type="email"`; on change and save: `updateUser({ email })` then the line *Check {new email} to confirm the change. Your current email works until then.*) · *Password*: a row *Change password* (ghost) revealing *Current password* · *New password* (helper *At least 8 characters.*) · *Confirm* · *Update password* (secondary); errors *That's not your current password.* / *These don't match.* · footer *Save changes* (primary, disabled until dirty) · a separate section *Sign out* (ghost button). Google-only account (`app_metadata.provider === "google"` and no email identity): the Password section reads *You sign in with Google.* with no fields.

AU-06 dialog (`ConfirmDialog`): *Sign out?* / *Your data stays in your account.* — **Stay signed in** · **Sign out** → `POST /logout` (existing) → `/signin`. Offline: the body becomes *You're offline — a running timer won't be saved until you're back. Sign out anyway?* (render the string now; USE-3 makes the timer real).

### ST-08 Day & time (`/settings/day`)

`AppHeader` *Day & time*. Fields (`useSynapseForm(dayTimeFormSchema)`): *Usual wake time* (`TimeField`, helper *Used as the start time for new templates.*) · *Wake-up habit* (a `SettingsRow`-like value row: the flagged habit's title or *None*, helper *Marking it done sets the day's wake time. Set this on a habit.*, `href = settingsHabitsRoute() + "?type=habit"` — SET-4's filter) · *Day closes at* (`TimeField min="00:00" max="06:00"`, helper *Anything undone at this time waits for you to review. Nothing is marked missed on its own.* + *Applies from tomorrow.* when changed) · *Review reminder* (`TimeField`, helper *Also under Notifications.*) · *Time zone* (`TimezoneSelect`, helper *Applies from tomorrow.* when changed) · *Save changes*. Validation: day close outside 00:00–06:00 → the field's `min`/`max` and a zod message `[COPY — needs Vesper sign-off: §9 gives the bound, no sentence]`.

### ST-09 Appearance (`/settings/appearance`)

`AppHeader` *Appearance*. `ThemeControl` with `helperText` *Follows your device unless you choose.* Selection applies immediately (next-themes) **and** calls `user.updatePreferences({ theme })`; no save button.

### ST-11 Share the app (`/settings/share`)

`AppHeader` *Share the app*. Body *Synapse is free. Anyone you share it with gets their own private list — you can't see theirs and they can't see yours.* · the link as `Text` (selectable) · `navigator.share` available → *Share* (primary) with `{ title: "Synapse", url }`; else *Copy link* (primary) → clipboard → *Copied.* for 2 s (`aria-live="polite"`). `TrustLine` at the bottom (Epic 1 §12: *Trust line — … ST-11*). Nothing else.

**States (exhaustive):** ST-00: loading counts · loaded · offline (cached counts) · setup-owed. ST-01: idle · dirty · saving · saved (return to idle; the row shows the new value — no toast) · email-change-pending · password-section-open · password-error · uploading · google-only · offline. ST-08: idle · dirty · saving · pending-values · error · offline. ST-09: applied. ST-11: share-available · copy-fallback · copied.

**Failure / edge states:** avatar upload fails → the hook's sentence, the old avatar stays · email change to an address already in use → Supabase's error mapped to *There's already an account with this email.* · the display name save fails → *Couldn't save. Try again.* with the form intact · `navigator.share` rejects (user cancelled) → nothing happens, no error.

## Non-negotiables (this slice)

- **No second entry tree.** ST-00's resume row reads `first_run_step`; it never computes what `resolveEntry` computes.
- **Day close and zone never write the live column.** The pending pair only.
- **The avatar appears in exactly two places** — the header (SYS-1) and ST-01. No status dot, no ring.
- **Counts never show a spinner in a row.**
- **Every string is Epic 1 §7 verbatim.** Three strings the document lacks are marked above.
- **The theme has one source of truth across devices** (`users.theme`) and one per device (next-themes); they are reconciled, never both authoritative.

## Data & AI

**Schema changes: none.**

**Tables:** `users` (read; update `display_name`, `theme`, `usual_wake_time`, `review_reminder_time`, `pending_*`) · `user_avatars` (via SET-3's procedures) · `habits` (read the anchor's title) · `habits`, `templates`, `categories`, `days` (counts).

**Placement:** pages replace the five placeholders; leaves in each route's `_components/`; `theme-sync.tsx` in `app/(shell)/_components/`; `shell.settingsCounts` on the `shell` router (created by SYS-1; add the procedure) with `services/shell/settings-counts.ts`; `updatePreferencesInput` extended (`theme` exists; add `reviewReminderTime` exists; add `pendingDayCloseTime`, `pendingTimezone`) in `packages/validators/src/user.ts`; `accountFormSchema`, `passwordChangeSchema`, `dayTimeFormSchema` in `packages/validators/src/account.ts`; `PasswordField` promoted to `packages/ui/src/composed/control/password-field/` with a story.

**tRPC / validators:** `user.me` (read) · `user.updatePreferences` (extended) · `user.setAvatar` / `removeAvatar` (SET-3) · `shell.settingsCounts` (new) · Supabase client calls for email and password.

**AI notes:** **None.**

## Accessibility

- The index is a list of links; each `SettingsRow` announces title and description; the resume row is first when present.
- The avatar's image has the person's name as alt; the *Change photo* control is a labelled file input, not a click on the image.
- The password section's reveal moves focus to *Current password*.
- `ThemeControl` is already a labelled radiogroup; the helper is associated with it.
- *Copied.* is a polite live region; *Share* falls back visibly, not silently.

## Acceptance criteria (observable — local tier, smoke account)

1. `/settings` shows the top card with initials (no image yet), the rows in the document's order with live counts (*10 habits*, *1 templates*, …), no *Calendar* row, *Sign out*, and a version line; while first run is owed the resume row appears first and links to the stored step.
2. *Sign out* → the dialog with the document's strings → **Sign out** ends the session and lands on `/signin`; **Stay signed in** closes it. Offline, the dialog body is the offline variant.
3. `/settings/account`: *Change photo* → crop → save → the 64px avatar shows the image and `user_avatars` has the row; the header avatar (once SYS-1 renders it) shows the same; *Remove photo* clears both.
4. Changing the name and saving updates `users.display_name` and the index card; *Save changes* is disabled until dirty.
5. Changing the email shows *Check {new email} to confirm the change. Your current email works until then.*; the confirmation link updates `auth.users.email` and the shadow row; signing in with the old email fails afterwards.
6. *Change password* with a wrong current password → *That's not your current password.*; mismatched confirm → *These don't match.*; a correct change signs in with the new password afterwards.
7. A Google-only account sees *You sign in with Google.* and no password fields (create one via OAuth to verify, or state that this was verified by forcing the provider check).
8. `/settings/day`: saving a day close of 05:00 writes `pending_day_close_time = '05:00'` and `pending_day_close_time_from = tomorrow` and leaves `day_close_time` unchanged; the field shows 05:00 with *Applies from tomorrow.*; 07:00 is rejected by the field bound; the zone behaves the same through `pending_timezone`. *(Mason.)*
9. *Wake-up habit* shows the anchor's title (or *None*) and links to the library filtered to Habits.
10. `/settings/appearance`: choosing *Dark* flips `<html class>` at once and writes `users.theme = 'dark'`; signing in on a second browser applies dark on first load without touching the control. *(Mason.)*
11. `/settings/share` shows the invite URL for the tier; in a browser without `navigator.share`, *Copy link* copies it and shows *Copied.* for 2 s; the trust line is present.
12. `grep -rn "process.env" apps/web/app/\(shell\)/settings` returns nothing (the version comes through `env.ts`).
13. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Version stamping: `next.config.ts` can set `NEXT_PUBLIC_APP_VERSION` and `NEXT_PUBLIC_BUILD_DATE` from `package.json` and `new Date().toISOString().slice(0, 10)` at build; declare both in `env.ts`'s `client` block and read them there. Vercel also exposes `VERCEL_GIT_COMMIT_SHA` — do not read it directly (turbo's env lint, INF-8's precedent).
- The theme sync leaf: `useAppTheme()` gives `theme`/`setTheme`; compare against `user.me.theme` once per session (a ref), never in a loop.
- `shell.settingsCounts` is four `COUNT(*)` queries in one `rls.execute` — cheap, and the index is the only caller.
- The email-change line: Supabase sends to both addresses when "secure email change" is on; the copy assumes the new one is what the person checks, which is right in either mode.

## Dev's call

The `router.back()` heuristic for ST-00's back · whether the password section is a `CollapsiblePanel` or conditional render · the version-stamp mechanism within the constraint above · `Copied.` timing implementation.

## Out of scope

- **Reasons (ST-06), Notifications (ST-07)** — SET-9.
- **Your data (ST-10)** — SET-10.
- **About & feedback (SY-01)** — SYS-3; the index row links to the placeholder.
- **Applying the pending pair** — USE-1.
- **The header avatar button** — SYS-1.
- **Timer flush on sign-out** — USE-3.

## Depends on

- **SET-3** — `user.setAvatar`, `removeAvatar`, the upload rail. Complete in `PROGRESS.md`.
- **SYS-1** — the `shell` router and the chrome the index renders inside. Complete in `../cross-cutting-system/PROGRESS.md`.

## Recommended execution

**Sonnet.** Settled screens with precise copy and existing rails. The two things that need care — the pending pair and the theme reconciliation — are stated as rulings with acceptance criteria. Not Composer: the email and password flows have error branches Supabase does not name the way the document does.

---

### Kickoff (paste into the session)

> Build **SET-8 — Settings core: ST-00, ST-01 with sign-out, ST-08, ST-09, ST-11** (attached spec). Model: **Sonnet**. **Day close and zone write only the pending pair; `users.theme` is the cross-device theme source; the index never re-derives the entry tree; counts never spin.**
> Attach/read first, in order: this spec · Epic 1 §7 (ST-00, ST-01, ST-08, ST-09, ST-11), §1 AU-06, §9, §13 · official spec §4.6, §9.8 · cross-cutting §7.3, §7.5, §9.3 (G5) · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · SET-3 (the avatar procedures — reuse) · SET-2 (the password field to promote) · `packages/api/src/services/user/preferences.ts` and `routers/user.ts` (extend, don't fork) · `packages/ui/src/composed/control/theme-control/` and `hooks/use-theme.ts` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Every string is Epic 1 §7 verbatim in a `copy.ts`; three gaps are marked. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
