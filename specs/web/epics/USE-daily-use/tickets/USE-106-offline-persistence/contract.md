---
size: medium
objective: "Taps made offline survive a reload or a killed app and replay in order with their own times when the signal comes back, and the last-read day shows offline"
slice_type: "client-side persistence of the query cache and paused mutations, with two new dependencies; risks a tap replayed twice or out of order, a mutation that cannot resume after a reload, and personal data left readable in the browser after sign-out"
non_negotiables:
  - "New dependencies are Taylor's call and Quartermaster pins them exactly (C4): @tanstack/react-query-persist-client, @tanstack/query-async-storage-persister and idb-keyval, or what Quartermaster rules instead."
  - "Every mutation that can run offline has a mutationKey and a setMutationDefaults mutationFn, so a paused mutation resumes after a reload."
  - "Paused mutations replay in the order they were made, one at a time; a slot event keeps its own at and client_event_id, so a replay the server already has is a no-op."
  - "Sign-out clears the persisted cache and the paused queue."
  - "Fixture scenarios are never persisted: ?state= runs with no persister."
  - "docs/architecture/tech-stack.md's 'No offline caching' line is amended in this ticket."
devs_call: "The cache's buster and maxAge; which queries are dehydrated (recommended: today, week, pool, todos, connections, account); the IndexedDB key."
cites:
  - "specs/web/epics/USE-daily-use/ux/dev-notes/timers-across-devices.md"
truth_files: "none: offline behaviour is the ledger's (each surface's offline state); only its persistence changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/offline/"
  - "apps/web/lib/trpc/provider.tsx"
  - "apps/web/lib/data/"
  - "apps/web/package.json"
  - "yarn.lock"
  - "docs/architecture/tech-stack.md"
  - "apps/web/e2e/"
depends_on:
  - "USE-94"
  - "USE-95"
  - "USE-99"
out_of_scope:
  - "Opening the installed app with no signal: USE-107's app-shell cache"
  - "Realtime: out of bounds (C3)"
criteria:
  - id: C1
    statement: "Offline, Start then Prompt sent then Done on a work item, a reload, then back online: the server receives the three events once each, in order, with the times they were tapped"
    evidence: manual
    reason: "a journey; Taylor approved Playwright at the wave 3 gate (2026-10-16); the first of USE-106 and USE-107 to build adds it and test:e2e, then records this through yarn contract:add"
  - id: C2
    statement: "Every mutation the hooks run offline is registered with setMutationDefaults under its mutationKey"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "With the signal off and the app reloaded, Today shows the last-read day with its offline line"
    evidence: capture
    path: "apps/web/e2e/__captures__/offline-reload-402.png"
  - id: C4
    statement: "Sign-out empties the persisted cache and the paused mutations"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
id: USE-106
---

# Contract — offline-persistence

## Build notes

C4, the first of two tickets. Technical: "persists TanStack's cache and its paused mutations to IndexedDB: taps made offline survive a reload or a killed app, replay in order with their own times, and the last-read data shows."

- **Decisions that apply:**
  - C4 as above. The persister and its storage library are new dependencies, so Quartermaster pins them here.
  - D-USE-82, with D-USE-56: offline, each surface's drawn offline state shows, and what can be done offline is done and queued.
  - Data contract: offline writes and the last-read data live in IndexedDB through TanStack's persister, replayed in order on reconnect.
- **Approach:**
  - `lib/offline/persister.ts`: `createAsyncStoragePersister` over `idb-keyval` (`get`, `set`, `del`).
  - `provider.tsx` swaps `QueryClientProvider` for `PersistQueryClientProvider` with `onSuccess: () => queryClient.resumePausedMutations()`, only when the source is live.
  - `lib/offline/mutations.ts`: one `setMutationDefaults` per offline write, keyed by the hook's mutation key. A paused mutation stores only its variables; its function must be found by key after a reload.
  - The hooks pass `mutationKey` and call `mutate(variables)`. They never close over a function the replay cannot find.
  - Order: `networkMode: "offlineFirst"`, and one `scope: { id: "writes" }` across the offline writes, so TanStack runs them serially in order. `use-planner-writes.ts`' own ordered queue was built for this; fold it into the scope rather than keep two queues.
- **Journey (test-shape):** `apps/web/e2e/offline.spec.ts` uses Playwright's `context.setOffline`, with the live source stubbed by a route mock that records requests in order. No test writes to staging. If the e2e runner is absent, add `test:e2e` to `apps/web/package.json` in Quartermaster's ruling.
- **Gotchas:**
  - `dehydrateOptions.shouldDehydrateMutation` must keep paused mutations, which is the default.
  - Clear on sign-out from the same place that signs out (`@syn/auth`'s client hook), never in a component.
  - The persisted cache is personal data on the device. Never persist the integration views' token-free records beyond `maxAge` (recommend 7 days).
- **Gate, 2026-10-16:** Taylor approved the persister, idb-keyval and `@playwright/test`. Quartermaster pins each exactly. `test:e2e` goes in `apps/web/package.json`, with its config beside it.
- **Model:** Opus 5.5 at medium. A smaller model persists the cache but leaves mutations as closures, so nothing replays after a reload.
