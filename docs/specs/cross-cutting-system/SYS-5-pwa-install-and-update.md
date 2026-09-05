# SYS-5 — PWA: the install offer and sheet SY-07, the update line SY-02, and standalone resume

**Epic:** SYS — Cross-cutting · **Phase 2** · Size: M
**Slice type:** Three platform behaviours over INF-9's service worker and manifest. The risk class is *a nag or a lost minute*: an install offer at first run, an update that reloads under a running timer, a resume that re-runs the entry tree mid-task.
**Vigil:** none. Induce: the offer before and after the third reviewed day; the update line with a waiting worker and a running timer; a background of 61 minutes.

**Status:** Not started

---

## Outcome

After the third reviewed day, a person who has not installed the app sees once *Synapse can be installed — it opens faster and gets reminders.* [*How*] with a dismiss that never returns; *How* opens numbered steps for their platform, or on Android triggers the browser's install prompt directly. When a new version is waiting, *A new version is ready.* [*Reload*] sits under the header until tapped — never interrupting, and a running timer survives the reload. Backgrounded for over an hour, the installed app re-runs the entry tree on return; under an hour it stays where it was. **Nothing else changes.**

## Why / intent

- **Cross-cutting §5.1** — not prompted at first run; offered once from Settings → Notifications on iOS (SET-9) and from a one-line status line on any platform after the third day with a reviewed day; the copy; *How* → per-platform steps (iOS: Share → Add to Home Screen; Android: the install prompt directly when available; desktop: the browser's install action); numbered steps, no screenshots; the manifest (INF-9). §13 call 4. §5.2 — standalone: resume where it was under an hour; after that re-run §4.2. §5.4 / SY-02 — *A new version is ready.* [*Reload*] non-dismissable, never interrupts, reload on tap only, a running timer survives (state persisted locally first). §5.3 — the platform differences, stated once.
- **Official spec §8.3** — iOS requires installation for push; the offer's *How* is the same steps sheet SET-9 built.
- **Ground truth:** INF-9's `service-worker-registration.tsx`, `sw.js`, `manifest.ts`, `lib/pwa/{install-detection,use-install-prompt}.ts` (`canShowInstallPrompt`, `useInstallPrompt` with the deferred `beforeinstallprompt`); `StatusLineSlot`'s `installOffer`/`onHowToInstall` and `updateReady`/`onReload` props with `InstallLine`/`UpdateLine` (built; `useDismissed("install", "forever")` inside the slot); `STORAGE_KEYS.INSTALL_DISMISSED_UNTIL` (unused — see below); SET-9's `PlatformStepsSheet kind="install"`; SYS-1's `shell.status.reviewedDayCount`; USE-3's timer store (server state — nothing local to persist); `resolveEntry` (client re-run = `router.replace("/")`).
- **What this slice is NOT (binding):** no offline caching in the service worker (Phase 2); no re-prompting after dismiss; no offer on first run or before three reviewed days; no auto-reload.

**Rulings this slice makes (labelled, logged):**

- **Install eligibility** = `reviewedDayCount >= 3` (server) ∧ `!isPWA()` ∧ the platform can install (`isIOS()` Safari, or `beforeinstallprompt` captured, or a desktop Chromium — `canShowInstallPrompt()` decides) ∧ not dismissed forever. The slot's `installOffer` prop is that boolean; the slot's own `useDismissed("install", "forever")` is the one dismissal mechanism — **`STORAGE_KEYS.INSTALL_DISMISSED_UNTIL` is removed** (an unused second key for the same fact; log it). Logged.
- ***How* on Android with a captured prompt calls `prompt()` directly**; everywhere else it opens `PlatformStepsSheet kind="install"` for the detected platform. Logged.
- **The update line's source is the waiting service worker**: `service-worker-registration.tsx` gains `updatefound` → `installed` with `navigator.serviceWorker.controller` present → publish `updateReady` (a tiny module-level store or the `ShellContext`); *Reload* posts `{ type: "SKIP_WAITING" }` to the waiting worker (`sw.js` gains a `message` listener calling `self.skipWaiting()`) and reloads on `controllerchange`. Before reloading: flush pending form drafts? (`useLocalDraft` already persists on change); the timer is a server row and needs no persistence — "state is persisted locally first" is satisfied because there is no local-only state in Phase 1; state this in the code. Logged.
- **Standalone resume**: a `ResumeGuard` leaf (in `shell-providers.tsx`) records `hiddenAt` on `visibilitychange` → hidden and, on visible, if `isPWA()` and `now − hiddenAt > 60 min`, `router.replace("/")` (the entry tree lands on today, or setup, or verify). Not applied in the browser tab (the document scopes it to standalone). Logged.
- **`shell.status.reviewedDayCount`** counts `days` with `reviewed_at IS NOT NULL` (SYS-1 declared the field; this ticket verifies it). Logged.

## Experience & states

### SY-07 Install

`ShellStatusLine` (SYS-1) gains `installOffer` and `onHowToInstall` per the ruling; the slot renders `InstallLine` (built) with its copy and dismiss. *How* → `prompt()` or the steps sheet. After a successful install (`appinstalled` event or `isPWA()` true on the next load), the line never shows.

### SY-02 Update

`ShellStatusLine` gains `updateReady` and `onReload`; the slot renders `UpdateLine` (non-dismissable, built). Reload → skip waiting → `controllerchange` → `location.reload()`; the person returns to the same URL (the browser's) — "where they were".

### Resume

As ruled. No surface.

**States (exhaustive):** install: not-eligible · eligible (line) · dismissed-forever · installed · steps-sheet · android-prompt. update: none · waiting (line) · reloading. resume: fresh · short-background (no-op) · long-background (re-run entry).

**Failure / edge states:** `beforeinstallprompt` never fires (already installed, or a browser without it) → the steps sheet · the waiting worker is gone by the time *Reload* is tapped (a third deploy) → `location.reload()` anyway · a long background during first run → the entry tree lands on the setup step (correct) · a running timer at reload → the row ticks again after reload from the session row (USE-3's re-seed); verify no session is lost.

## Non-negotiables (this slice)

- **Never offer install before the third reviewed day, during first run, or after a dismiss.**
- **Never reload without a tap. Never dismiss the update line.**
- **A running timer survives the reload** (verified against the session row).
- **The service worker still caches nothing.**
- **The device platform is read through `lib/pwa/install-detection.ts`** — no new UA sniffing.

## Data & AI

**Schema changes: none.** **Tables:** `days` (read via `shell.status`).

**Placement:** `components/page-frame/shell-status-line.tsx` extended (SYS-1's file — re-check SYS-1 AC 5); `app/_components/service-worker-registration.tsx` extended; `public/sw.js` `message` listener; `lib/pwa/update-ready.ts` (the tiny store or a context field); `components/resume-guard/` mounted in `shell-providers.tsx`; `STORAGE_KEYS.INSTALL_DISMISSED_UNTIL` removed from `@syn/constants` (grep for consumers first).

**tRPC / validators:** none new.

**AI notes:** **None.**

## Accessibility

- Both lines are `StatusLine` presets with labelled actions; the install line's dismiss is *Dismiss*.
- The steps sheet is an ordered list (SET-9).
- The update line has no dismiss — it is announced once when it appears and then sits.

## Acceptance criteria (observable — local tier over HTTPS or `localhost` (installable); Chrome desktop, Android Chrome, iOS Safari or UA overrides)

1. With two reviewed days, no install line; after the third `reviewed_at`, on a non-installed browser, the line *Synapse can be installed — it opens faster and gets reminders.* [*How*] appears under the header below any higher-priority line; dismiss removes it and it never returns (reload, new day). *(Vigil.)*
2. *How* on Android Chrome with a captured prompt shows the browser's install dialog; on iOS Safari and desktop it opens the steps sheet with the platform's numbered steps.
3. Installed (standalone), the line never appears even with the dismissal cleared.
4. Deploy a changed `sw.js` (or bump a comment) with the app open: within the registration's update check the line *A new version is ready.* [*Reload*] appears with no dismiss and nothing else changes; with a timer running, *Reload* reloads and the row ticks with the right elapsed after (the session row is intact). *(Vigil.)*
5. Standalone: background the app for 61 minutes (fake `hiddenAt` via a dev hook or the clock) and return → the app lands on `/` → `/today`; for 10 minutes → stays on the current screen. In a browser tab, no re-run either way.
6. `grep -rn "INSTALL_DISMISSED_UNTIL" apps packages` returns nothing; `sw.js` has no `caches.` call; `/sw.js` still serves with INF-9's headers.
7. During first run (`first_run_completed_at` null) with three reviewed days by SQL (an impossible but cheap state), no install line appears (the setup line wins and the eligibility also requires first run complete — add that condition; log it).
8. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `registration.addEventListener("updatefound", …)`; `newWorker.addEventListener("statechange", …)`; `installed` + `navigator.serviceWorker.controller` means a waiting update (not the first install).
- `navigator.serviceWorker.addEventListener("controllerchange", () => location.reload())` registered once, before posting `SKIP_WAITING`.
- The registration leaf already uses `updateViaCache: "none"`; call `registration.update()` on `visibilitychange` → visible so a long-open tab learns about a deploy.
- `useInstallPrompt` (INF-9) already captures `beforeinstallprompt` and exposes `prompt()`.

## Dev's call

The update-ready store shape · the `hiddenAt` storage (memory is fine; a reload resets the timer, which is correct because a reload re-runs the tree anyway).

## Out of scope

- **ST-07's iOS install line** — SET-9 (built).
- **Offline caching** — Phase 2.
- **The app mark** — INF-9's placeholder; Vesper/Taylor before launch.
- **N8** — Phase 2.

## Depends on

- **REV-2** — `reviewed_at` and the count. Complete in `../epic-3-review/PROGRESS.md`.
- **SET-9** — `PlatformStepsSheet kind="install"`. Complete in `../epic-1-setup/PROGRESS.md`.

## Recommended execution

**Sonnet.** Three small behaviours over existing plumbing with clear triggers. The failure mode of choosing down is an auto-reload or an offer before the third day — both are acceptance criteria.

---

### Kickoff (paste into the session)

> Build **SYS-5 — PWA: the install offer and sheet, the update line, and standalone resume** (attached spec). Model: **Sonnet**. **Never offer before the third reviewed day, during first run, or after a dismiss; never reload without a tap; a running timer survives; the service worker caches nothing.**
> Attach/read first, in order: this spec · cross-cutting §5.1–§5.4, §10 SY-02, SY-07, §13 call 4 · official spec §8.3 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · `apps/web/app/_components/service-worker-registration.tsx`, `public/sw.js`, `lib/pwa/*` (INF-9 — extend) · SYS-1 (`shell-status-line.tsx`, `shell-providers.tsx`) · SET-9 (`PlatformStepsSheet`) · `packages/ui/src/composed/feedback/status-line/presets.tsx` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md` (INF-9 lines).
> Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
