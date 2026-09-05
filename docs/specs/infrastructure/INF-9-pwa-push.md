# INF-9 — PWA: manifest, service worker, install detection, push subscription, the scheduler route

**Epic:** INF — Infrastructure · **Phase 3** · Size: M
**Slice type:** Platform plumbing — the failure classes are a service worker that caches (Phase 1 has no offline contract), a push payload carrying user content, and a scheduler route callable without its secret.

**Status:** Complete (2026-09-04) — device-level AC1/AC3/AC4 pending a deployed tier

---

## Outcome

Synapse is installable as a standalone PWA with the official spec §9.8 mark, registers a push-only service worker, can subscribe a device to Web Push and store the subscription against the user, can send a push from the server through `@syn/api`, and exposes a bearer-guarded scheduler route that Vercel Cron calls every fifteen minutes. The install-detection helpers, the install-prompt hook, the PWA-mode cookie, and the push-subscribe client helper are CC's, copied. Nothing here shows a prompt, a banner, or a status line — those are the `InstallSheet`, `ReminderPermissionSheet`, and `StatusLine` composites in the feature tracks. Nothing here schedules a *Synapse* notification — the N1/N4/N5/N6 jobs are the feature tech spec's; this ticket lands the `runScheduledJobs` skeleton they plug into.

## Why / intent

- **Official spec §8** (notifications: principles, catalogue, permission in context, plumbing: Web Push VAPID via a service worker, a cron scanning due items, time zone from `users.timezone`); **cross-cutting §5** (install, standalone behaviour, platform differences, update available), **§9.3 W-3 in CC's mobile watchlist** (payloads content-free, deep-link via route builders).
- **CC `apps/toolkit/{app/manifest.ts, public/sw.js, app/_components/service-worker-registration.tsx, app/_components/pwa-mode-sync.tsx, lib/pwa/*, app/api/pwa/push/{subscribe,unsubscribe}/route.ts, app/api/jobs/scheduler/route.ts}`**, **CC `packages/api/src/services/notifications/web-push.ts`**, **CC `next.config.ts` `/sw.js` headers** (INF-7 landed them).
- **What this slice is NOT (binding):** no caching or offline (Phase 2 — cross-cutting §6); no notification *content* or job (the feature tech spec); no UI.
- **Ground truth:** `web_push_subscriptions` exists (INF-5); `getRequestAuthContextFromRequest` exists (INF-6); `/sw.js` headers exist (INF-7); `@syn/api` owns `web-push` (INF-8).

**Rulings this slice makes (labelled, logged):**

- **The service worker is push-only, no caching**, exactly CC's `sw.js`. The `tag` is `syn-push`; `renotify` stays. Offline caching is a Phase 2 ticket with its own contract (cross-cutting §6.1). Logged.
- **Payloads are `{ title, body?, url }` built from route builders**, never a message body with a person's note; the spec's catalogue bodies (*Immediate wake up · 7:00*) are item titles and times, which are the user's own words on their own device — permitted; a preflight note in N1's body is permitted by spec §8.2 and is the one content field. Logged.
- **Scheduler:** Vercel Cron → `GET /api/jobs/scheduler` with `Authorization: Bearer $CRON_SECRET` every 15 minutes (`apps/web/vercel.json` `crons`). CC's route shape; `runScheduledJobs()` in `@syn/api/services/jobs/run-scheduled-jobs.ts` is a registry of named jobs that returns `{ job, count }[]` — empty registry here. `[REVISIT: spec §8.6 said "a Supabase cron Edge Function"; CC's precedent is a Vercel Cron hitting a route handler, and it keeps the job code in `@syn/api` where the RLS bridge and route builders are. Adopted for that reason; the spec's line is a plumbing note, not a ruling.]` Logged.
- **Manifest values:** `name`/`short_name` "Synapse", `display: standalone`, `orientation: portrait` (cross-cutting §5.1 — landscape on wide is a CSS matter, not a manifest one), `theme_color` and `background_color` = `--paper` light hex (`#FAFAF8`), `start_url: "/"`, `scope: "/"`, icons 192/512 + maskable. The mark itself is `[NEEDS VALUE AT BUILD]` — official spec §9.8 gives a direction ("filled neutral-800 circle on neutral-50 with a single accent-500 rule across its lower third"), not a file; the ticket ships a generated placeholder at those specs and logs it. Logged.

## Behaviour & states

**Surfaces:** none in-app; the OS install sheet and OS notification are the observable surfaces.

### Files (exact)

- `apps/web/app/manifest.ts` — CC's shape with the values above; icons at `/icons/icon-192.png`, `/icons/icon-512.png` (+ maskable variants), `categories: ["productivity", "lifestyle"]`.
- `apps/web/public/icons/*` — the placeholder mark at 192, 512, and a `favicon.ico`/`apple-touch-icon` set; `apps/web/app/layout.tsx` metadata `icons` + `appleWebApp` (INF-7's metadata gains the icon fields).
- `apps/web/public/sw.js` — CC's verbatim; strings renamed; default `title: "Synapse"`.
- `apps/web/app/_components/service-worker-registration.tsx`, `pwa-mode-sync.tsx` — copy CC's; mount both in the root layout (`PwaModeSync` sets the `syn_pwa_mode` cookie).
- `apps/web/lib/pwa/install-detection.ts`, `lib/pwa/use-install-prompt.ts`, `lib/pwa/push-subscribe.ts` — copy CC's; the `SYN` names; `push-subscribe.ts` POSTs to `/api/pwa/push/subscribe`.
- `apps/web/lib/pwa/get-the-app-cookie.ts` — not copied (CC-specific).
- `apps/web/app/api/pwa/push/subscribe/route.ts`, `unsubscribe/route.ts` — copy CC's; auth via `getRequestAuthContextFromRequest(request)` (INF-6's raw-`Request` variant, per W-1); body validated by `webPushSubscribeInput` from `@syn/validators` (INF-2); upsert on `endpoint` through `auth.rls.execute`.
- `packages/api/src/services/notifications/web-push.ts` — copy CC's (`sendWebPush`, `isVapidConfigured`, `WebPushPayload`); `VAPID_SUBJECT` falls back to `VAPID_MAILTO_SUBJECT` from `@syn/constants` (INF-2 left it `[NEEDS VALUE AT BUILD]`).
- `packages/api/src/services/notifications/fan-out.ts` — `sendToUser(userId, payload)`: loads the user's non-revoked subscriptions through a service-role RLS context, sends to each, revokes on 404/410. Content-free payload rule in the doc block.
- `packages/api/src/services/jobs/run-scheduled-jobs.ts` — the registry (`SCHEDULED_JOBS: readonly ScheduledJob[] = []`, `runScheduledJobs()`); exported from `@syn/api`.
- `apps/web/app/api/jobs/scheduler/route.ts` — copy CC's (503 when `CRON_SECRET` unset; 401 on a bad bearer; `{ results }`).
- `apps/web/vercel.json` — add `"crons": [{ "path": "/api/jobs/scheduler", "schedule": "*/15 * * * *" }]` (Vercel injects the bearer via `CRON_SECRET` on Pro; INF-10 documents the plan tier).
- `apps/web/env.ts` already declares `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET` (INF-7); `.env.example` gains the `npx web-push generate-vapid-keys` note (CC's).

**States (exhaustive):** browser without SW support → registration no-ops · SW registered (`navigator.serviceWorker.ready`) · push unsupported (iOS not installed) → `subscribeToPush()` returns `"unsupported"` · permission denied → `"denied"` · granted → subscription upserted, `"subscribed"` · a push arrives → OS notification with `title/body`, click opens or focuses the `url` · scheduler called without bearer → 401 · with bearer, empty registry → `{ results: [] }` · a stale subscription (410) → `revoked_at` set.

## Non-negotiables (this slice)

- **No caching in the service worker.**
- **Push payloads carry no free-text user content except the preflight note spec §8.2 names**; URLs come from `lib/routes.ts` builders.
- **The scheduler route refuses without `CRON_SECRET`** (503) and without the bearer (401).
- **Subscriptions are written through RLS as the user; sends read them through an explicit service-role context** — never the singleton `db`.
- **`web-push` is imported only in `@syn/api`** (boundaries rule).

## Data & AI

**Schema changes: none** (`web_push_subscriptions` is INF-5's). **Tables:** `web_push_subscriptions` (owner upsert/revoke via RLS; service-role read for fan-out). **Placement:** CC's paths; `services/notifications/`, `services/jobs/` per CC §4.2. **tRPC / validators:** none new (`webPushSubscribeInput` exists). **AI notes: None.** **Instrumentation: none.**

## Accessibility

**None — no in-app surface.** The OS notification is the OS's.

## Acceptance criteria (observable)

1. Lighthouse "Installable" passes on staging; Chrome offers install; iOS Safari's Add to Home Screen produces a standalone app with the icon and `#FAFAF8` splash.
2. `curl -sI https://<staging>/sw.js` shows `content-type: application/javascript`, `cache-control: no-cache, no-store, must-revalidate`; the file contains no `caches.` call.
3. From an installed staging PWA, `subscribeToPush()` after granting permission inserts a `web_push_subscriptions` row for the user with `platform` set; calling it again with the same endpoint updates, not duplicates.
4. `sendToUser(userId, { title: "Test", url: "/today" })` from a one-off script delivers an OS notification whose click opens `/today` in the installed app. *(Vigil: also send to a revoked endpoint and confirm `revoked_at` is set.)*
5. `GET /api/jobs/scheduler` → 401 without the bearer; 200 `{ results: [] }` with it; 503 when `CRON_SECRET` is unset locally.
6. `grep -rn "caches\." apps/web/public/sw.js` returns nothing; `grep -rln "web-push" apps packages | grep -v packages/api` returns nothing.
7. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn web:build` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- iOS needs `appleWebApp.capable` and the standalone display mode before `PushManager` exists; CC's `isPWA()` covers the detection.
- Vercel Cron on the Hobby plan runs at most daily; the 15-minute schedule needs Pro — INF-10 records the plan.
- `web-push` TTL 86400 is CC's; a reminder about a 7:00 item that arrives at 9:00 is noise — the feature tech spec sets a tight TTL per job.

## Dev's call

Icon generation tooling · whether `fan-out.ts` batches sends with `Promise.allSettled` (recommended) · the `syn_pwa_mode` cookie's use before any server branches on it (it can stay unused).

## Out of scope

- **`InstallSheet`, `ReminderPermissionSheet`, the install/permission/update status lines** — feature tracks (v2 handoff §5.10, §8.2). **N1/N4/N5/N6 jobs and payload copy** — the feature tech spec, registered into `SCHEDULED_JOBS`. **Offline caching, background sync, `SyncIssuesSheet`** — Phase 2. **Update-available detection** — with the first offline ticket (needs `updateViaCache` reasoning).

## Depends on

- **INF-8** — `@syn/api` package and `getRequestAuthContextFromRequest`. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** Copies with a small new registry; the two risks (caching, content in payloads) are grep-checkable.

---

### Build kickoff (paste into the session)

> Build **INF-9 — PWA and push plumbing** (attached spec). Model: **Sonnet**. **CC's manifest, push-only service worker, install and push helpers, subscribe routes, `sendWebPush` + fan-out, and a bearer-guarded scheduler with an empty job registry — no caching, no UI, no content in payloads.**
> Attach/read first, in order: this spec · `docs/ux/habit_tracker_official_ux_spec_v1.md` §8, §9.8 · `docs/ux/synapse_navigation_and_system_ux_architecture.md` §5 · CC `apps/toolkit/{app/manifest.ts,public/sw.js,app/_components/service-worker-registration.tsx,app/_components/pwa-mode-sync.tsx,lib/pwa/*,app/api/pwa/push/*/route.ts,app/api/jobs/scheduler/route.ts,vercel.json}` · CC `packages/api/src/services/notifications/web-push.ts` · CC `docs/architecture/mobile/mobile-readiness-watchlist.md` W-1, W-3 · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Close in three places; run `yarn lint && yarn lint:boundaries && yarn check-types && yarn web:build`.
