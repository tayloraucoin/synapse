---
size: small
objective: "Every domain reads and writes live, the fixture fallback is gone from the live path, and the fixtures remain only as the ?state= source outside production"
slice_type: "the wave's close-out; risks a method still falling back to fixtures unnoticed, and the captures losing their states"
non_negotiables:
  - "No FixtureServer method is unwired: the live server implements every one, or the method is fixture-only (recover, reconnect) and a no-op live."
  - "The fallback to the default scenario is removed; an unknown method is a type error, not a runtime fallback."
  - "?state= still renders every registered scenario and part outside production."
  - "A production build contains no fixture module."
devs_call: "How the bundle check is written (a build manifest grep, or a webpack/turbopack stats read)."
cites:
  - "specs/web/epics/USE-daily-use/ux/dev-notes/timers-across-devices.md"
truth_files: "none: no behaviour changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/data/source.ts"
  - "apps/web/lib/data/live/"
  - "apps/web/lib/data/source.test.ts"
  - "apps/web/lib/data/imports.test.ts"
depends_on:
  - "USE-93"
  - "USE-96"
  - "USE-97"
  - "USE-102"
  - "USE-103"
  - "USE-104"
  - "USE-105"
out_of_scope:
  - "Deleting the fixtures: they stay (Technical's README)"
criteria:
  - id: C1
    statement: "The live server implements every FixtureServer method, checked by the type: no domain falls back"
    evidence: check
    command: "yarn check-types"
  - id: C2
    statement: "The production build's client chunks contain no module from lib/fixtures"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Each registered ?state= name still resolves to its scenario in a development build"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "At 402 and at 1024 on staging, Today, Week, Set my days, Review the day, Settings and the pool each show Taylor's own data, with no fixture names anywhere"
    evidence: manual
    reason: "staging only; Taylor's walk at the end of the wave"
id: USE-108
---

# Contract — live-everywhere

## Build notes

The last wave 3 ticket. USE-90 added the live server with a per-domain fallback, so the app ran while wave 3 landed one domain at a time. This ticket removes the fallback.

- **Approach:**
  - `createLiveServer` is typed `FixtureServer` with no `Partial`, so an unwired method fails `check-types` (C1).
  - `LIVE_DOMAINS` and the fallback go.
  - Fixture-only methods stay no-ops.
  - `source.ts` imports the fixture server dynamically, behind the non-production check, so a production build cannot include it (C2).
- **Per path:**
  - `source.test.ts`: C3.
  - C2: read `.next` after `yarn build`, or assert on the dynamic import's condition. The builder's call, but it must fail if a fixture module reaches a client chunk.
- **Model:** Opus 5.5 at medium.
