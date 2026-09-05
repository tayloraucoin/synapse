# SET-9 — Reasons and notification preferences: ST-06/06a, ST-07, and the in-context permission sheet

**Epic:** SET — Setup · **Phase 4** · Size: M
**Slice type:** Two preference surfaces and one moment. The risk class is *a permission asked at the wrong time* (official §8.3 is a rule about *when*, and the OS never lets you ask twice) and *a reason set that drifts from its defaults*.
**Vigil:** review the permission moment by inducing it — first fixed-time slot saved during first run (must not fire), after first run (fires once), after *Not now* (never again), on iOS in the browser (the install variant), after an OS denial (the ST-07 line, no re-prompt). QA states which of the five it exercised.

**Status:** Not started

---

## Outcome

A person can see the reasons the Day Review and the shift will offer, grouped under the three tiers with each tier's weight in words, add their own, relabel or archive most built-ins, and see that *Didn't do it* and *Other* are structural. They can see every reminder the product sends, each with its default, turn any off, set the review-reminder time and the week-build day and time, and read the line that nothing arrives after a day is complete. The first time they save a fixed-time item after first run, a small sheet asks — once — whether they want reminders. **The senders do not exist yet** (USE-8); the preferences are real and the jobs will read them.

## Why / intent

- **Official spec §3.10** — the default reason set with keys, labels, and tiers; free-entry reasons can be promoted from the Day Review (REV-2 uses `reason.keep`, provided here).
- **Official spec §8.2–§8.5** — the catalogue, defaults, and phases; permission "never requested at sign-up or first run", requested in context the first time a fixed-time slot is saved, with the exact sheet copy; denied at the OS → one line in Settings with a link to the OS steps, never re-prompt; iOS needs install first — say so plainly with *How to install*; §8.4 one toggle per row, the two time pickers, *Quiet after Day Complete* on and non-editable; §8.5 the never-sent list.
- **Epic 1 §7 (ST-06, ST-06a, ST-07) and §8.7** — every read, interact, state, and the permission flow's states; ST-06a's default tier *Planned it wrong* (`[VESPER CALL]`, signed); §9 reason label 1–40 unique → *You already have this reason.*
- **Ground truth:** SET-1's `reasons`, `notification_prefs`, `users.reminder_prompt_answered_at`, `week_build_reminder_*`, `review_reminder_time`, `DEFAULT_REASONS`, `NOTIFICATION_CATALOGUE`; INF-9's `subscribeToPush`, `isPushSupported`, `isVapidConfigured`, `/api/pwa/push/{subscribe,unsubscribe}`, `web_push_subscriptions`; `lib/pwa/install-detection.ts` (`isPWA`, `isIOS`); `@syn/types` `PermissionState`; `TierRadioRows` (with `lockedTier`), `NotificationRow`, `TimeField`, `NativeSelect`, `ListRow`, `GroupHeading`, `ArchivedSection`, `EllipsesMenu`, `ResponsiveSheet`, `StatusLine placement="inline"`, `Tag`, `Text`; SET-5's TP-03 and SET-6's WK-03 `onSaved`.
- **What this slice is NOT (binding):** no push is sent; no scheduler job is registered (USE-8). The `PermissionLine` status-line variant is **not** wired into the shell (Vesper ruling in SYS-1: ST-07's line is the only permission surface).

**Rulings this slice makes (labelled, logged):**

- **The reason set is seeded lazily and idempotently** by `ensureReasonSet(rls, userId)`, called by `reason.list` and by any service that reads reasons (REV-2, USE-6): `INSERT … ON CONFLICT (user_id, key) DO NOTHING` from `DEFAULT_REASONS`. No trigger. Logged.
- **User-added reasons get `key = slugify(label)`** with a numeric suffix on collision (`ran_long_2`); `misses.reason_key` is text, so renaming a label never touches a record. Logged.
- **Phase-2 rows are hidden in Phase 1** (N2, N3, N7, N8, N9). A switch that governs a sender that does not exist is a promise the product cannot keep; the rows appear with their senders. The catalogue's `phase` field drives it. `[PROVISIONAL — Vesper]`. Logged.
- **Notification times live on `users`** (`review_reminder_time` for N4, `week_build_reminder_weekday` + `week_build_reminder_time` for N6); `notification_prefs` holds only `enabled`. ST-07's N4 time is the same field ST-08 edits — one home. Logged.
- **Permission state is computed on the device, never stored** — `Notification.permission` × `isPushSupported()` × (`isIOS() && !isPWA()`) → `PermissionState`; the server knows only whether a live `web_push_subscriptions` row exists for the account. The one server fact about the ask is `reminder_prompt_answered_at`. Logged.
- **The permission sheet fires from `onSaved` of TP-03 and WK-03** when the saved item is `fixed_time`, `first_run_completed_at` is set, `reminder_prompt_answered_at` is null, and the device state is `not-asked` or `not-installed`. Both answers write `reminder_prompt_answered_at`. Logged.
- **The platform instruction sheet is shared:** `components/platform-steps-sheet/` with `kind: "notifications" | "install"` and per-platform numbered steps; SYS-5 reuses `install`. Steps copy: `[COPY — needs Vesper sign-off: the documents name the platforms and "numbered steps" but give no step text]`. Logged.

## Experience & states

### ST-06 Reasons (`/settings/reasons`)

`AppHeader` *Reasons*, `action` *Add*. Intro `Text as="p"`: *When something's missed, you pick a reason. The reason decides how it counts.* Three `GroupHeading`s that are the tier definitions: *Something came up — counts as done for the record* · *Planned it wrong — counts half* · *Didn't do it — counts as missed*. Rows (`ListRow`): label · `tag="default"` on built-ins · `trailing` `EllipsesMenu` with *Archive* (absent on structural rows) · `onClick` → ST-06a edit. `ArchivedSection` with *Restore*. Bottom line: *"Stayed on something more important" can count as done for the record when the thing you stayed on was at least as important and got done.* No drag, no move-between-groups.

### ST-06a Reason sheet

`ResponsiveSheet` *New reason* / *Edit reason*, dirty guard. *Reason* (`Input`, 1–40; unique → *You already have this reason.*) · *Counts as* (`TierRadioRows` without reasons — the three rows with their definition lines; default `scoping`; `lockedTier` when editing a structural built-in with the line *This one's tier can't change.*) · *Cancel* · *Save*.

### ST-07 Notifications (`/settings/notifications`)

`AppHeader` *Notifications*. Status line at top (`StatusLine placement="inline"` or a `Text` block with an action — use `StatusLine` with `variant="permission"` and the **screen's own text**, one of): `granted` → *Reminders are on for this device.* · `denied` → *Reminders are off. Turn them on in your device settings to get the times you set.* [*How*] · `not-installed` → *Install Synapse to your home screen to get reminders on iPhone.* [*How*] · `not-asked` / `unsupported` → *Reminders aren't turned on yet.* [*Turn on reminders*] (for `unsupported` on a desktop browser without push, the action is absent and the line stands `[COPY — needs Vesper sign-off: the document gives no unsupported-desktop sentence]`).

Rows, grouped by `GroupHeading`, each a `NotificationRow` (switch + optional value): *When an item starts* → *Fixed-time items, at the time you set* (N1) · *Reviews* → *Close out today* with `value` a `TimeField` bound to `review_reminder_time` (N4) · *Yesterday's pending items, the morning after* (N5) · *Planning* → *Next week isn't planned yet* with a weekday `NativeSelect` (Mon…Sun) and a `TimeField` (N6). Phase-2 groups and rows hidden. A closing `Text`: *Nothing arrives after you've marked a day complete, and nothing is ever sent about missed items.* Switches write `notification.setPref`; values write `user.updatePreferences`. Offline: switches disabled with the inline line (Phase 1).

*How* → `PlatformStepsSheet kind="notifications"` (denied) or `kind="install"` (not installed). *Turn on reminders* → `subscribeToPush()` → on `subscribed` the line becomes *Reminders are on for this device.*; on `denied`, the denied line.

### The permission sheet — `components/reminder-prompt/`

`ResponsiveSheet` (no title bar text; `title` for AT: *Reminders*), body *Want a reminder at {time} when this comes up? Reminders are only ever the times you set.* — **Turn on reminders** (primary) · **Not now** (ghost). `{time}` is the saved item's start as the row would show it. On iOS in the browser (`not-installed`): body *Reminders on iPhone need Synapse on your home screen.* `[COPY — needs Vesper sign-off]` · **How to install** (→ `PlatformStepsSheet kind="install"`) · **Not now**. Both primary and *Not now* write `user.updatePreferences({ reminderPromptAnsweredAt: now })`; *Turn on reminders* then calls `subscribeToPush()`; the OS prompt is the browser's. The hook `useReminderPrompt()` exposes `maybeOffer(item)`; TP-03 and WK-03 call it in `onSaved`.

**States (exhaustive):** ST-06: default-only · with additions · loading · offline. ST-06a: create · edit · structural-locked · saving · error · offline. ST-07: `granted` · `denied` · `not-asked` · `unsupported` · `not-installed` · loading · offline. Permission sheet: closed · open-standard · open-ios · subscribing · done.

**Failure / edge states:** `subscribeToPush` returns `error` (VAPID unset on the tier) → the line reads the denied variant? **No** — *Couldn't turn on reminders. Try again.* `[COPY — needs Vesper sign-off]` and `reminder_prompt_answered_at` is still written (the person answered) · a second device: `reminder_prompt_answered_at` set → no sheet, ST-07's line offers the switch · archiving a reason currently selected in an open Day Review elsewhere → no effect on the record.

## Non-negotiables (this slice)

- **Never ask during first run, never ask twice, never re-prompt after an OS denial.** The four-condition predicate is the whole rule.
- **`Didn't do it` and `Other` are structural**: tier locked, never archivable.
- **The tier phrases are official §10.2's**, verbatim, in every heading and helper: *counts as done for the record · counts half · counts as missed*.
- **No push is sent by this ticket.** A preference is a row, not an event.
- **Reason keys are stable and text; records never change when a label does.**

## Data & AI

**Schema changes: none.**

**Tables:** `reasons` (seed, CRUD, archive, restore) · `notification_prefs` (upsert) · `users` (update `review_reminder_time`, `week_build_reminder_*`, `reminder_prompt_answered_at`) · `web_push_subscriptions` (read: does a live row exist).

**Placement:** routers `packages/api/src/routers/{reason,notification}.ts` (rule 3); services `services/library/{ensure-reason-set,list-reasons,save-reason,archive-reason,keep-reason,to-view}.ts` (`ReasonView` mapping; `reasonsByTier()` returns the `Record<MissTier, ReasonView[]>` shape `TierRadioRows` and `DecisionPanel` take) and `services/notification/{list-prefs,set-pref}.ts`; validators `packages/validators/src/{reason,notification}.ts`; feature folders `components/reminder-prompt/` and `components/platform-steps-sheet/`; pages replace the two placeholders; `updatePreferencesInput` gains `weekBuildReminderWeekday`, `weekBuildReminderTime`, `reminderPromptAnsweredAt`.

**tRPC / validators:** `reason.list` → `{ byTier, archived }` · `reason.create` · `reason.update` · `reason.archive` · `reason.restore` · `reason.keep({ label, tier })` (REV-2's *Keep this reason*; returns the new `ReasonView`) · `notification.prefs` → the catalogue merged with rows · `notification.setPref({ kind, enabled })` · `notification.hasSubscription`.

**AI notes:** **None.**

## Accessibility

- The tier headings on ST-06 are `h2`s that read the definition in one sentence; the `default` tag is text.
- `TierRadioRows` is a radiogroup; the locked variant is `aria-disabled` with the line as its description, not silently unselectable.
- `NotificationRow` is switch + label + description, one Tab stop per switch; the value controls are separately labelled (*Close out today, time*).
- The permission sheet's primary is first in focus order (it is the only screen where the document puts the affirmative first); Esc counts as *Not now*.
- The platform steps are an ordered list; no screenshots (cross-cutting §5.1).

## Acceptance criteria (observable — local tier, smoke account; a browser with push support and an iOS Safari (or a UA override) for the install variant)

1. `/settings/reasons` on a fresh account shows the seven defaults under the three tier headings with `default` tags, *Archive* absent on *Didn't do it* and *Other*, and the closing line; `reasons` has seven rows for the user after the first visit and still seven after a reload (idempotent).
2. *Add* → *Fell asleep* under *Planned it wrong* (the default tier) saves with `key = fell_asleep`; a second *Fell asleep* shows *You already have this reason.*; editing *Slept in* to *Overslept* keeps `key = slept_in`.
3. Archiving *Not feeling well* moves it to *Archived (1)*; *Restore* returns it; opening *Didn't do it* shows the tier locked with *This one's tier can't change.*
4. `/settings/notifications` in a browser with permission not yet asked shows *Reminders aren't turned on yet.* [*Turn on reminders*]; the four Phase-1 rows with their defaults (N1 on, N4 on with the time, N5 on, N6 on with Sunday 18:00); no Phase-2 rows; the closing line.
5. Toggling *Fixed-time items* off upserts `notification_prefs (kind = item_start, enabled = false)`; changing *Close out today* to 21:30 writes `users.review_reminder_time` and `/settings/day` shows 21:30; changing the planning row writes `week_build_reminder_weekday/time`.
6. *Turn on reminders* → the OS prompt → allow → a `web_push_subscriptions` row exists and the line reads *Reminders are on for this device.*; deny → the denied line with *How* opening the notifications steps sheet.
7. On iOS Safari not installed, the line is the install variant and *How* opens the install steps sheet. *(Vigil — state the device or override.)*
8. During first run, saving a fixed-time slot in FR-03 shows no sheet; after first run, saving the first fixed-time slot in TP-03 shows the sheet with the item's time; **Not now** writes `reminder_prompt_answered_at` and no later save shows it; the same for a fixed one-off in WK-03. *(Vigil.)*
9. With `reminder_prompt_answered_at` set, ST-07's line still offers *Turn on reminders* (the switch path), and it works.
10. No file outside `lib/pwa/` and `components/reminder-prompt/` calls `Notification.requestPermission` (grep); `grep -rn "sendToUser\|SCHEDULED_JOBS" packages/api/src/services/notification` shows no new registration.
11. As user B, `reason.list` seeds and returns B's seven, none of A's additions.
12. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `PermissionState` derivation belongs in `apps/web/lib/pwa/permission-state.ts` (web-only; it reads `Notification` and the UA) — USE-8's landings and SYS-5 will read it too.
- `reason.list` returning `byTier` in the exact `Record<MissTier, ReasonView[]>` shape saves REV-2 and USE-6 a mapping step; include `other` under every tier? **No** — *Other* is one structural row whose `tier` is chosen at use; `TierRadioRows`/`ReasonChips` already append *Other* via `OTHER_REASON_KEY`. Exclude it from `byTier` and document that.
- The time picker's `value` in `NotificationRow` is `NotificationRowValue` — check the built type before choosing `TimeField` vs a native input inside it.
- The weekday select for N6: `NativeSelect` with Mon…Sun options mapping to 0–6; the document says "a day-and-time value → native pickers".

## Dev's call

The slug function's home (recommend `@syn/utils` `string.ts` — INF-2 dropped CC's `slugify` as unneeded; it is needed now, log it) · whether `notification.prefs` returns the catalogue copy or the client merges it (recommend server merge) · the platform-steps sheet's interim step text pending Vesper (write plausible steps, mark the file).

## Out of scope

- **Sending any notification, registering any job, the landings** — USE-8.
- **The shift's reason list and the Day Review's chooser** — USE-6, REV-2 consume `reason.list`.
- **The install status line and its timing** — SYS-5 (reuses the steps sheet).
- **The `PermissionLine` shell variant** — not wired anywhere (SYS-1 ruling).
- **Phase-2 rows** — appear with USE-8's Phase-2 senders.

## Depends on

- **SET-5** — TP-03's `onSaved` hook point. Complete in `PROGRESS.md`.
- **SET-6** — WK-03's `onSaved` hook point. Complete in `PROGRESS.md`.
- **SET-8** — ST-00 (the door) and `updatePreferencesInput`'s extension pattern. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** Two preference screens with fixed copy and one predicate stated in four conditions. The failure mode of choosing down is the permission ask firing during first run or twice; both are induced in the review list, so a diligent Sonnet with the list in hand catches them.

---

### Kickoff (paste into the session)

> Build **SET-9 — Reasons and notification preferences: ST-06/06a, ST-07, and the in-context permission sheet** (attached spec). Model: **Sonnet**. **Never ask during first run, never twice, never after an OS denial; `Didn't do it` and `Other` are structural; no push is sent here.**
> Attach/read first, in order: this spec · Epic 1 §7 (ST-06, ST-06a, ST-07), §8.7, §9 · official spec §3.10, §8.2–§8.5, §10.2 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · `apps/web/lib/pwa/{push-subscribe,install-detection}.ts` (reuse) · SET-5 and SET-6 (`onSaved` of TP-03 and WK-03) · SET-8 (`updatePreferencesInput` extension pattern) · `packages/constants/src/{default-reasons,notification-catalogue}.ts` · `packages/ui/src/composed/control/{tier-radio-rows,notification-row}/` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md` (INF-9 lines).
> Four strings the documents lack are marked for Vesper — write them in register, mark the file, do not invent more. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
