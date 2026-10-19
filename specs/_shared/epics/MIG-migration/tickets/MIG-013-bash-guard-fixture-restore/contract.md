---
id: MIG-13
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "The bash-guard fixture is the toolkit's, byte for byte"
slice_type: "harness; risks an allow case that no longer matches a host prefix"
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
  - "tooling/hooks/fixtures/bash-guard.json"
out_of_scope:
  - "Editing any imported body"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
criteria:
  - id: C1
    statement: "[FILL: what is true when this is done, observable by a user or caller]"
    evidence: test
    command: "[FILL: yarn <script>; a package.json script that runs this criterion's test]"
  - id: C2
    statement: "[FILL]"
    evidence: check
    command: "[FILL: yarn <script>]"
---

# Contract — MIG-13 bash-guard-fixture-restore

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; split out of MIG-11 on 2026-10-09, which kept part (a). The criteria are written when the ticket starts. The lines below are MIG-11's part (c), moved verbatim.

- **Layer:** 3, part 12.
- **What did not cross:** (c) six allow-case commands in tooling/hooks/fixtures/bash-guard.json were retargeted from the toolkit's PJ:/DOC-2: to SYN:/WEB-2: because the fixture context cannot set prefixes (a toolkit finding).
- **Plan:** (c) when the toolkit's fixture context carries prefixes, copy its bash-guard.json byte for byte again.
- **Conflict risk:** low. Trigger: (c) the toolkit fix lands.
- **Estimate:** minutes for (c). Estimates.
