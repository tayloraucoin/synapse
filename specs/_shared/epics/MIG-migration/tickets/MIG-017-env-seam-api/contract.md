---
id: MIG-17
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "The api module reads its environment only through a packages/api/src/env.ts"
slice_type: "configuration seam; risks the VAPID private key"
non_negotiables:
  - "No variable's name or value changes; .env.example stays as it is."
  - "The keys are read when a push is sent or asked about, never at import, so a build or test with no secrets still passes."
  - "The suppressions file is pruned in the commit that moves the reads, and deleted once empty; nothing else is suppressed."
  - "web-push.ts reads nothing from process.env."
devs_call: "How web-push.ts takes the values from readApiEnv (a small reader beside ensureConfigured), and the test's shape."
cites:
  - "MIG-migration assess V3"
  - "MIG-6 C2 (exact suppression counts)"
truth_files: "none: configuration seam; no surface or behaviour changes" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: []
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "packages/api/src/services/notifications/web-push.ts"
  - "packages/api/src/env.ts"
  - "packages/api/eslint-suppressions.json"
  - "packages/api/src/services/notifications/web-push.test.ts"
out_of_scope:
  - "Changing any variable's name or value"
depends_on: [ MIG-6 ] # work-ids that must be built first (their own criteria PASS)
criteria:
  - id: C1
    statement: "yarn lint is green with packages/api/eslint-suppressions.json deleted: web-push.ts reads no environment variable, and env.ts reads the three"
    evidence: check
    command: "yarn lint"
  - id: C2
    statement: "Web Push is unconfigured without the VAPID pair and a send throws naming both keys; set, it is configured, read when asked"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The env-seam tests still pass: the counts are exact with the api workspace's file gone"
    evidence: test
    command: "yarn test:env-seam"
  - id: C4
    statement: "Types check across the workspaces"
    evidence: check
    command: "yarn check-types"
---

# Contract — env-seam-api

## Build notes

Drafted by MIG-6 on 2026-10-09; the criteria were written when it started (2026-10-18), to unblock USE-92 and USE-100, which depend on it.

- **Frozen:** `src/services/notifications/web-push.ts`, 3 reads (`VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` among them). Server-only: the app's imports of `@syn/api` in client files are type-only (Warden).
- `src/env.ts` exists since USE-100 (the integrations' keys); this ticket adds the three VAPID reads to it. It is a Warden row in toolkit.json.
- **Done when:** the workspace's `eslint-suppressions.json` entries below are gone, pruned in the commit that moves the reads (`yarn lint -- --prune-suppressions`, never alone), and the file is deleted once empty. Counts are the lint run's on 2026-10-09.
