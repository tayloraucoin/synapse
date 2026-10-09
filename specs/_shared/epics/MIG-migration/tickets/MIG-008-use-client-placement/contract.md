---
id: MIG-8
size: medium # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "Client leaves sit in _components/ as Synapse's conventions say, and the count of misplaced ones only falls"
slice_type: "structure; risks a sweep that breaks routes"
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
  - "tooling/check-client-placement.ts"
  - "client-placement.count"
  - "package.json"
  - "apps/web/app/**"
depends_on: [MIG-9] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "A bulk move"
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

# Contract — MIG-8 use-client-placement

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** 3, part 8 (signal V4).
- **What did not cross:** 137 of 322 "use client" files sit outside a _components/ or components/ folder (43%, assess.md V4). Synapse's own rule (AGENTS.md, Import boundaries): client leaves on line 1, in _components/.
- **Plan:** A check with a committed baseline count first, ratcheting down like verify.md 3.2's count; then one route at a time, each its own ticket, never as a sweep.
- **Conflict risk:** high for the moves (files the team edits); low for the check. Trigger: the check any time; the moves after the design layer settles each surface's states.
- **Estimate:** two hours for the check; about an hour per route. Estimates.
