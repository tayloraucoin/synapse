---
size: small
objective: "The installed app opens with no signal: the service worker serves the app shell and its static assets from a cache, and the persisted data fills it"
slice_type: "a service-worker cache; risks a stale shell served after a deploy, an authenticated API response cached, and a worker update that never takes"
non_negotiables:
  - "Only the shell and same-origin static assets are cached: never /api/*, never a tRPC response, never an auth route, never a cross-origin request."
  - "Each deploy gets a new cache name, and the old caches are deleted on activate."
  - "Push handling in sw.js is unchanged."
  - "The existing update-ready flow (lib/pwa/update-ready.ts) still offers the new version."
devs_call: "Navigation strategy (recommended: network first, falling back to the cached shell); how the cache name carries the build id."
cites:
  - "specs/web/epics/USE-daily-use/ux/account/install-sheet/words-and-access.md"
  - "C-USE-install-sheet-1"
truth_files: "none: no surface changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/public/sw.js"
  - "apps/web/next.config.ts"
  - "apps/web/lib/pwa/"
  - "apps/web/e2e/"
depends_on:
  - "USE-106"
out_of_scope:
  - "The data offline: USE-106"
criteria:
  - id: C1
    statement: "With the app loaded once and the network then off, a reload of /today renders the shell and the last-read day"
    evidence: manual
    reason: "a service-worker journey; Taylor approved Playwright (2026-10-16); USE-106 adds test:e2e, and this ticket records it through yarn contract:add"
  - id: C2
    statement: "No request to /api/ or to another origin is put in the cache"
    evidence: manual
    reason: "a service-worker journey; Taylor approved Playwright (2026-10-16); USE-106 adds test:e2e, and this ticket records it through yarn contract:add"
  - id: C3
    statement: "After a new build, activate deletes the previous cache and the update-ready prompt appears"
    evidence: manual
    reason: "a service-worker journey; Taylor approved Playwright (2026-10-16); USE-106 adds test:e2e, and this ticket records it through yarn contract:add"
  - id: C4
    statement: "On Taylor's iPhone, the installed app opens in airplane mode"
    evidence: manual
    reason: "an installed PWA on iOS; operator check"
id: USE-107
---

# Contract — app-shell-cache

## Build notes

C4's second ticket: "adds an app-shell cache to `sw.js`, so the installed app opens with no signal." `sw.js` today (150 lines) handles push and caches nothing.

- **Approach:**
  - On `install`, precache `/today` (the shell's document) and the build's static chunks. Read the list from a small manifest written at build time, or cache on first fetch.
  - On `fetch`, handle only same-origin GETs:
    - navigations: network first, then the cached shell;
    - `/_next/static/*`: cache first;
    - everything else: pass through.
  - On `activate`, delete caches whose name is not the current one, then `clients.claim()`.
- **The one-way door:** `apps/web/public/sw.js` (one-way-doors.md: the service worker gains an app-shell cache, C4).
- **Gotchas:**
  - Next's App Router documents depend on the RSC payload. A cached `/today` document must render offline with the client data from USE-106's persisted cache. Check that the page boots from cache, with no server data at all.
  - Never cache a response with `Set-Cookie` or a `Cache-Control: private`.
- **Gate, 2026-10-16:** Taylor approved the persister, idb-keyval and `@playwright/test`. Quartermaster pins each exactly. `test:e2e` goes in `apps/web/package.json`, with its config beside it.
- **Model:** Opus 5.5 at medium. A smaller model caches every GET, tRPC included.
