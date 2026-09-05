# USE-8 — Notifications: the four Phase-1 jobs (N1, N4, N5, N6), payloads, grouping, quiet after complete, and the landings PN-01/04/05/06

**Epic:** USE — In Use · **Phase 4** · Size: L
**Slice type:** Scheduled work with a privacy contract and exactly-once delivery, plus deep links that must land in the right state. The risk class is *trust-breaking*: a payload that says something the person did not write, a reminder after a day was closed, a double send, a landing that opens the wrong day.
**Vigil:** **full review** — read every payload builder against official §8.1 and §8.5 (nothing about a miss, a streak, a percentage, or absence); induce a double scan (run the route twice within a minute); induce a send after *Day Complete*; tap every landing signed in and signed out; a grouped push. QA states each.

**Status:** Not started

> **Vigil — payload and delivery review.** The catalogue is the whole vocabulary. If a sentence reaches a lock screen that is not one of the four Phase-1 rows' titles and bodies, this ticket failed.

---

## Outcome

At the minute a fixed-time item starts, the person's phone says *Immediate wake up · 7:00* with the preflight note as the body if there is one — with *Start* and *Done* actions where the platform supports them. At the review-reminder time, *Close out today* / *3 items to decide on* with *Review* and *Later*. The morning after an auto-close, *Yesterday has 3 items to review*. On Sunday evening, *Next week isn't planned yet* if it is not. Nothing arrives after a day is marked complete. Items at the same minute collapse into one notification. Each notification lands in the right state: the List scrolled to the item with its sheet open, the Day Review, the week build. A push that arrives while the app is open surfaces nothing beyond the row's state word. **N2, N3, N7, N8, N9 do not exist** (Phase 2).

## Why / intent

- **Official spec §8.1** — a notification is a scheduled fact, delivered once, at the time assigned, in the person's own words; never a miss, a streak, a percentage, or how long since the app was opened. §8.2 — the catalogue: N1 at `scheduled_start` for fixed-time items (hard or soft), title *{title} · {time}*, body the preflight note or nothing, actions Start · Done, default on; N4 at `review_reminder_time` only if the day has undone items and isn't closed, *Close out today* / *{n} items to decide on*, Review · Later (snooze 60 min, once); N5 the morning after an auto-close at `anchor_time + 60`, once, *Yesterday has {n} items to review*, Review; N6 Sunday 18:00 local (editable), only if next week is unplanned, *Next week isn't planned yet*, Plan. Grouping: same start minute → one notification listing both titles; multitask groups send one. §8.4 — quiet after Day Complete. §8.5 — never sent. §8.6 — actions deep-link to the item sheet; time zone from `users.timezone`, not the server.
- **Epic 2 §9 (PN-01…06)** — every landing: PN-01 body tap → LS-01 scrolled to the item with IT-01 open; *Start* → timer started, IT-01 open; *Done* → done, IT-01 not opened, the row done with undo; PN-04 → DR-01 (*Review*), *Later* snoozes once; PN-05 → DR-01 for yesterday; PN-06 → WK-01 next week; foregrounded → no system notification, the row simply becomes *now*; grouped → LS-01 scrolled to the first, no actions; signed out → AU-01 then the landing.
- **Cross-cutting §5.3** — iOS: no action buttons on older versions, the body tap still lands correctly.
- **Ground truth:** INF-9's `apps/web/public/sw.js` (push + click; one tag), `sendToUser` / `WebPushPayload` (`title`, `body`, `icon`, `badge`, `url`), `runScheduledJobs`, `/api/jobs/scheduler` (15-minute cron), `web_push_subscriptions`; SET-9's `notification.prefs` (`enabled` per kind) and `users.review_reminder_time`, `week_build_reminder_*`; USE-1's `resolveDayKey`, `dayWindow`, `readPreferences` (pending pair), `closeDay`; REV-2's pending state (`completion_state = pending_review`, `days.closed_at`, `close_reason = auto`); SET-6's `week.get(...).status`; USE-3's `?sheet=item`, `timer.start`; USE-2's `item.setDone`; `dayRoute`, `reviewDayRoute`, `settingsWeekRoute`; `formatClock`.
- **What this slice is NOT (binding):** no Phase-2 kinds; no in-app notification centre; no badge count (a number about the day); no "you haven't opened the app".

**Rulings this slice makes (labelled, logged):**

- **Exactly-once via `notification_deliveries`** (migration `0003`, `serviceRoleOnlyPolicies`): `(user_id, kind, target_id, scheduled_for)` unique; a job inserts `ON CONFLICT DO NOTHING` and sends only when the insert returned a row. Logged (`TECHNICAL-DECISIONS.md`).
- **One payload builder** `services/notification/build-payload.ts` with one function per kind, typed to the catalogue, producing `{ title, body, url, actions?, tag }`; the builders are the only place notification copy exists and each cites its §8.2 row. The service worker gains an `actions` array and per-action `notificationclick` handling (a bare `sw.js` edit — re-check INF-9's AC 5/6). Logged.
- **The scan window is `[now − 15 min, now)` per user in the user's effective zone**, run every 15 minutes, with `scheduled_for` truncated to the minute; a missed cron tick sends late rather than never (the delivery key prevents a second send). Logged.
- **Quiet after Day Complete**: no N1 for a day whose `closed_at` is set; no N4 for a closed day (the catalogue already says so); N5 only for `close_reason = auto`. Logged.
- **Grouping**: N1 targets sharing a `scheduled_for` minute (or a `multitask_id`) collapse into one delivery with `target_id = <first item id>` and a title listing the titles joined by *·*, no actions, `url` = the day scrolled to the first (`?item=<id>` without opening the sheet: `?focus=<id>`). Logged.
- **Landings are URLs the payload carries**: PN-01 `dayRoute(date)?sheet=item&id=…` (today's date resolves to `/today` via SYS-1's redirect — build the URL with `todayRoute()` when the day is today at send time); PN-01 *Start* → `…?sheet=item&id=…&action=start`; *Done* → `…?action=done&id=…` (the List runs `item.setDone` on mount with the undo, then strips the param); PN-04 `reviewDayRoute(date)`; PN-04 *Later* → the service worker posts to `/api/pwa/push/snooze` (a new route handler — a browser-shaped call from the SW; conventions §3.5) which inserts a delivery for `+60 min` once (a `snoozed` column on the delivery row; refused a second time); PN-05 `reviewDayRoute(yesterday)`; PN-06 `settingsWeekRoute(nextWeekKey)`. The List and the Review read `action`/`focus`/`id` from nuqs, act once, and replace the URL. Logged.
- **Foregrounded**: the service worker checks `clients.matchAll({ type: "window" })` for a focused client on the app's origin and, when one is focused, posts a message instead of showing a notification; the client ignores it (the row's state word already changed on the minute). Logged.
- **TTL per kind**: N1 15 minutes, N4 2 hours, N5 6 hours, N6 12 hours (INF-9's `ttlSeconds` option — "a 7:00 reminder surfacing at 21:00 is noise"). Logged.

## Behavior & states

**No new surface.** Four jobs, one payload module, one SW edit, one snooze route, and three landing behaviours in existing surfaces.

### The jobs (`services/jobs/`)

Each iterates users (the same per-user service-role pattern as USE-1's auto-close), applies `readPreferences`, and computes in the user's effective zone:

- `notify-item-start.ts` (N1): `day_items` on today's day (by `resolveDayKey`) with `time_mode = fixed_time`, `assignment_state = assigned`, `completion_state = upcoming`, `scheduled_start` in the window, day not closed, pref `item_start` enabled (default on). Group by minute/multitask. Payload: title `{title} · {clock}`, body `notes_preflight ?? ""`, actions Start · Done, url per the ruling.
- `notify-review-reminder.ts` (N4): today's `review_reminder_time` in the window, day exists and not closed, undone assigned items > 0, pref `review_reminder`. Title *Close out today*, body *{n} items to decide on*, actions Review · Later.
- `notify-pending-review.ts` (N5): yesterday's day `close_reason = auto` with `pending_review` items, `anchor_time + 60` in the window, pref `pending_review`. Title *Yesterday has {n} items to review*, action Review.
- `notify-week-build.ts` (N6): the user's `week_build_reminder_weekday`/`time` in the window, next week's status `unplanned` (via SET-6's week service), pref `week_build`. Title *Next week isn't planned yet*, action Plan.

Every send goes through `notification_deliveries` first, then `sendToUser(userId, payload, { ttlSeconds })`.

### Service worker

`sw.js`: `options.actions = payload.actions ?? []`; `notificationclick` reads `event.action` and opens `payload.actionUrls[event.action] ?? payload.url`; the focused-client check for foreground suppression; the tag stays `syn-push` (grouping is done by the job). `renotify: true` stays.

### The snooze route

`POST /api/pwa/push/snooze` with `{ deliveryId }`, authenticated by the subscription's endpoint? The SW has no session cookie access… it does (same origin, `credentials: "include"`). Use the session. Insert a second delivery `scheduled_for = now + 60 min` with `snoozed = true` if none exists for that target; the N4 job's window check picks it up (the job also queries snoozed rows due in the window). Once only.

### Landings (in existing surfaces)

- `/today?sheet=item&id=X` — USE-3 already opens the sheet; add scroll-to-row on mount when `id` is present.
- `?action=start` — the sheet calls `timer.start` once on mount if the item is not active, then removes the param.
- `?action=done&id=X` — the List calls `item.setDone` once on mount with the undo window, then removes the param.
- `?focus=X` — the List scrolls to the row, no sheet.
- `/review/day/{date}` — REV-2's page; nothing to add.
- `/settings/week/{week}` — SET-6's page; nothing to add.
- Signed out: the shell's gate sends to `/signin?next=<landing>` and back (INF-7) — verify only.

**States (exhaustive), per delivery:** due · inserted (sent) · duplicate-suppressed · pref-off · quiet (day closed) · snoozed · foreground-suppressed · subscription-gone (INF-9 revokes).

**Failure / edge states:** the cron misses a tick → the next scan's window is still 15 minutes and the item is sent late (state the ceiling in the closing note) — **ruling:** N1 sends only if `scheduled_for ≥ now − 15 min`; older due items are recorded as `skipped` deliveries and not sent (a 7:00 reminder at 7:40 is noise; the row already says *passed*) · a user with no subscription → the delivery row is still written (so a later subscription does not replay the past) · the zone switches at the boundary → `readPreferences` applied first, so the window is computed in the new zone from that day.

## Non-negotiables (this slice)

- **Every payload is one of the four catalogue rows, in the person's own words** (the item's title, the preflight note). No adjective, no count except the ones the catalogue writes, no *you*.
- **Nothing after Day Complete. Nothing about a miss. Nothing about absence.**
- **Exactly once per `(user, kind, target, minute)`.**
- **Time zone from the user's effective zone, never the server's.**
- **Prefs are honoured**: a disabled kind is never built.
- **The service worker still caches nothing.**
- **No payload contains an id that is not needed for the landing, and never an email.**

## Data & AI

**Schema changes: one table** — `notification/notification-deliveries.ts`: `id`, `created_at`, `kind` (`notification_kind`), `scheduled_for` timestamptz, `sent_at` null, `snoozed` boolean default false, `skipped` boolean default false, `target_id` uuid null (item, day, or null for N6 with the week key in `target_key text`), `target_key` text null, `user_id` FK cascade; `UNIQUE (user_id, kind, target_id, target_key, scheduled_for)`; `serviceRoleOnlyPolicies`. Migration `0003`, journalled; a human applies. Log in `DEVIATIONS.md`.

**Tables:** `notification_deliveries` (service-role write) · `day_items`, `days`, `users`, `notification_prefs`, `web_push_subscriptions` (read under the named bypass).

**Placement:** jobs in `services/jobs/` registered in `SCHEDULED_JOBS`; `services/notification/build-payload.ts`; `apps/web/public/sw.js` (edit); `apps/web/app/api/pwa/push/snooze/route.ts`; landing param handling in `components/day-list/` and `components/item-sheet/` (extend; re-check USE-2 AC 1 and USE-3 AC 1); `notification_deliveries` row types exported.

**tRPC / validators:** none new (the snooze route validates its body with `snoozeInput` in `packages/validators/src/push.ts`).

**AI notes:** **None.**

## Accessibility

- Notification titles read naturally with the time last (*Immediate wake up · 7:00*); the body is the person's note.
- Landing scrolls put the row in view and move focus to it (a `tabIndex={-1}` focus on the row), so a screen-reader user lands on the item, not the header.

## Acceptance criteria (observable — local tier with a real VAPID pair and an installed PWA or desktop Chrome; the scheduler route called by hand with the bearer; a fixed clock via SQL-shifted times)

1. An item at 07:00 with a preflight note: calling the scheduler at 07:03 delivers *{title} · 7:00* with the note as the body and *Start* / *Done* actions (desktop Chrome); a `notification_deliveries` row exists; calling again at 07:08 sends nothing (the row conflicts). *(Vigil.)*
2. Two items at 07:00 (or a multitask pair) → one notification titled *{a} · {b} · 7:00* with no actions; tapping lands on the List scrolled to the first with no sheet. *(Vigil.)*
3. With `notification_prefs (item_start, false)` no N1 is sent and no delivery row is written… **or** is written as skipped? — write nothing (a pref-off is not a delivery). *(Vigil.)*
4. A closed day (`closed_at` set) sends no N1 and no N4 at any time. *(Vigil.)*
5. At `review_reminder_time` with two undone items: *Close out today* / *2 items to decide on* with *Review* / *Later*; *Review* lands on `/review/day/{today}`; *Later* posts to the snooze route, a second delivery an hour later is sent once, and a second *Later* on that one does nothing. *(Vigil.)*
6. The morning after an auto-close (USE-1's job run first) at `anchor_time + 60`: *Yesterday has {n} items to review* → `/review/day/{yesterday}`; a manual close (`close_reason = manual`) sends no N5.
7. At Sunday 18:00 (or the person's setting) with next week unplanned: *Next week isn't planned yet* → `/settings/week/{next}`; with next week planned, nothing.
8. Tapping N1's body lands on the List scrolled to the row with the sheet open; *Start* lands with the timer running; *Done* lands with the row done and *Undo* showing and no sheet. *(Vigil.)*
9. With the app focused when a push arrives, no system notification appears; the row already reads *now*. *(Vigil.)*
10. Signed out, tapping a landing goes to `/signin?next=…` and then to the landing after sign-in.
11. Every string in `build-payload.ts` appears in official §8.2's four Phase-1 rows or is the item's own title/note (read the file). *(Vigil.)*
12. Times in every payload use the user's zone: a user in `Europe/London` with an item at 07:00 London is notified at 07:00 London (SQL-shift the user's zone and confirm the window math). *(Mason.)*
13. `sw.js` still contains no `caches.` call; `/sw.js` still serves with INF-9's headers.
14. Migration `0003` applies cleanly after `0002`; the journal has its entry; `SCHEMA_REFERENCE.md` regenerated.
15. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Window math per user: compute `todayKey` and the window instants once per user; N1's candidate query is `scheduled_start >= $from AND scheduled_start < $to` over today's day only.
- The per-user loop over all users every 15 minutes is fine at Synapse's scale; note the revisit trigger (INF-9's) in the closing note.
- Action URLs in the payload: `actionUrls: { start: "...", done: "..." }` alongside `url`; the SW reads `event.action`.
- Focus check in the SW: `clients.matchAll({ type: "window", includeUncontrolled: true })` then `some(c => c.focused)`.
- For PN-01 *Done* from the notification, the List's mount handler must run **after** the query resolves (the item must be in the cache to patch optimistically) — do the mutation directly and invalidate.

## Dev's call

Whether skipped deliveries are rows or just absent (recommend rows with `skipped = true` — they answer "why wasn't I told") · the TTLs' exact values within the stated intent · batching of `sendToUser` calls.

## Out of scope

- **N2, N3, N7, N8, N9** — Phase 2, with SET-9's hidden rows.
- **A notification centre or badge count** — never.
- **Persistent timer notification** — Phase 2 (N8).
- **Email or SMS** — never.

## Depends on

- **USE-3** — `?sheet=item`, `timer.start`. Complete in `PROGRESS.md`.
- **REV-2** — the pending-review state and the review route. Complete in `../epic-3-review/PROGRESS.md`.
- **SET-6** — next week's status. Complete in `../epic-1-setup/PROGRESS.md`.
- **SET-9** — `notification_prefs`, the times. Complete in `../epic-1-setup/PROGRESS.md`.

## Recommended execution

**Opus.** Exactly-once, zone-correct scheduling with a privacy vocabulary and deep links into three surfaces. A cheaper model sends twice on an overlapping window, or builds a body with a count the catalogue does not have, and that reaches a lock screen.

---

### Kickoff (paste into the session)

> Build **USE-8 — Notifications: the four Phase-1 jobs, payloads, grouping, quiet after complete, and the landings** (attached spec). Model: **Opus**. **Every payload is a catalogue row in the person's words; nothing after Day Complete; exactly once per target minute; the user's zone, never the server's.**
> Attach/read first, in order: this spec · official spec §8.1–§8.6 · Epic 2 §9 (PN-01…06), §12 call 9 · cross-cutting §5.3 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · `apps/web/public/sw.js`, `packages/api/src/services/notifications/{fan-out,web-push}.ts`, `services/jobs/run-scheduled-jobs.ts`, `app/api/jobs/scheduler/route.ts` (INF-9 — extend, don't fork) · USE-1 (`resolveDayKey`, `readPreferences`, the per-user job pattern) · USE-3 (`?sheet=item`, `timer.start`) · USE-2 (`item.setDone`) · SET-9 (`notification.prefs`) · SET-6 (`week.get`) · REV-2 (pending state) · `packages/db/AGENTS.md` (for `0003`) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `../epic-1-setup/DEVIATIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md` (INF-9 lines).
> Author `0003`, journal it, verify locally, stop before any hosted migrate. Run every Vigil path and state each. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
