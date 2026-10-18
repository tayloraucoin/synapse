---
size: small
objective: "An issue's size reads through its team's estimate scale, so an estimate Synapse wrote on an exponential or linear team reads back as the same size"
slice_type: "a pure mapping on the read side; risks a size that shifts after a write and a sync"
non_negotiables:
  - "One pure inverse beside estimateForTeam (services/linear/estimate.ts); every read of a size from an estimate goes through it."
  - "No estimate (or 0) stays unsized at 30 min."
devs_call: "Where the inverse lives so @syn/utils' callers can reach it; the tie rule on a scale USE-102 did not see."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/linear-status/index.md"
truth_files: "none: behaviour is the size dev note's; only the scale changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/linear/estimate.ts"
  - "packages/utils/src/work/linear-size.ts"
  - "packages/api/src/services/work/linear-items.ts"
  - "apps/web/lib/data/item-sheet-linear.ts"
depends_on:
  - "USE-102"
out_of_scope:
  - "Changing the size words or their ranges"
criteria:
  - id: C1
    statement: "On each of Linear's scales, a size written by estimateForTeam reads back as the same size"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Place, link and the Item sheet read an issue's size through its team's scale"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-112
---

# Contract — estimate-on-team-scale

## Build notes

Follow-up from USE-102. USE-102 writes a size card's estimate on the team's scale (`estimateForTeam`: exponential 1, 2, 4, 8, 16; linear 1 to 5; Fibonacci and t-shirt 1, 2, 3, 5, 8). The read side still assumes Fibonacci: `sizeOfEstimate` in `@syn/utils` takes the nearest of 1, 2, 3, 5, 8, so on an exponential team Large written as 8 reads back as Huge. The team's scale is in the snapshot (`teams[].estimationType`). Confirm the scales and t-shirt's stored values on Taylor's workspace first (USE-102 C5).
