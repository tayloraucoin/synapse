---
id: MIG-16
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "Observability takes its settings from its caller and reads no environment itself"
slice_type: "configuration seam; reaches the browser through app/error.tsx"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "MIG-migration assess V3"
  - "[FILL: decision and criterion IDs]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "packages/observability/src/**"
  - "packages/observability/eslint-suppressions.json"
  - "apps/web/env.ts"
out_of_scope:
  - "Changing any variable's name or value"
depends_on: [ MIG-6 ] # work-ids that must be built first (their own criteria PASS)
criteria:
  - id: C1
    statement: "[FILL: what is true when this is done, observable by a user or caller]"
    evidence: check
    command: "[FILL: yarn <script>]"
---

# Contract — env-seam-observability

## Build notes

Drafted by MIG-6 on 2026-10-09; the criteria are written when the ticket starts.

- **Frozen:** `src/logging.ts` 3, `src/is-dev.ts` 1.
- **Warden:** the package reaches the browser through `apps/web/app/error.tsx`; `SYN_LOG_DEBUG` is not public, so it is undefined there today (harmless). Shape: the caller passes a `debug` flag (and the dev flag) in; the package keeps no `env.ts`.
- **Done when:** the workspace's `eslint-suppressions.json` entries below are gone, pruned in the commit that moves the reads (`yarn lint -- --prune-suppressions`, never alone), and the file is deleted once empty. Counts are the lint run's on 2026-10-09.
