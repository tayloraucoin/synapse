---
id: MIG-14
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "Coverage cannot fall below what Synapse's workspace suites measure today"
slice_type: "test infrastructure; risks a threshold set by guess"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "packages/*/package.json"
  - "packages/*/vitest.config.ts"
  - "turbo.json"
out_of_scope:
  - "Patch coverage: it needs a hosted service, which is Taylor's call"
  - "Any threshold before a measurement exists"
depends_on: [ MIG-5 ] # work-ids that must be built first (their own criteria PASS)
criteria:
  - id: C1
    statement: "[FILL: what is true when this is done, observable by a user or caller]"
    evidence: check
    command: "[FILL: yarn <script>; a package.json script that runs this criterion's check]"
---

# Contract — coverage-thresholds

## Build notes

Drafted by MIG-5 on 2026-10-09; the criteria are written when the ticket starts.

- **What MIG-5 left:** Vitest 5.0.3 runs `@syn/utils` through `yarn test` (Turbo); no workspace measures coverage, and turbo.json's `test` task already lists `coverage/**` as an output.
- **Plan:** measure first: `@vitest/coverage-v8` at the Vitest version, a per-workspace coverage run, and the numbers recorded. Then thresholds per workspace at the measured value rounded down to the whole percent, raised only by a deliberate change and never lowered without a ledger line.
- **Trigger:** the third feature ticket that adds tests, or Taylor's call. Before that the measurement is one workspace and says little.
- **Operator:** patch coverage (coverage of the changed lines in a pull request) needs a hosted service and an account; [NEEDS DECISION] Taylor's, and out of scope here.
