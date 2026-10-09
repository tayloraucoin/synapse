---
id: MIG-15
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "The auth module reads its environment only through packages/auth/src/env.ts"
slice_type: "configuration seam; risks a cookie setting read differently per tier"
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
  - "packages/auth/src/cookies.ts"
  - "packages/auth/src/env.ts"
  - "packages/auth/eslint-suppressions.json"
out_of_scope:
  - "Changing any variable's name or value"
depends_on: [ MIG-6 ] # work-ids that must be built first (their own criteria PASS)
criteria:
  - id: C1
    statement: "[FILL: what is true when this is done, observable by a user or caller]"
    evidence: check
    command: "[FILL: yarn <script>]"
---

# Contract — env-seam-auth

## Build notes

Drafted by MIG-6 on 2026-10-09; the criteria are written when the ticket starts.

- **First of the moves:** MIG-7 (the auth SDK seam) builds on it; add this ticket to MIG-7's `depends_on` when MIG-7 starts.
- **Frozen:** `src/cookies.ts`, 3 reads. No client importer (Warden).
- **Done when:** the workspace's `eslint-suppressions.json` entries below are gone, pruned in the commit that moves the reads (`yarn lint -- --prune-suppressions`, never alone), and the file is deleted once empty. Counts are the lint run's on 2026-10-09.
