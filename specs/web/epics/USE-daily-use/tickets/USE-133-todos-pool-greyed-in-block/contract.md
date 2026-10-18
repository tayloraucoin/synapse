---
id: "USE-133"
size: small
objective: "From To-dos in a To-dos block lists what is already in the block greyed with \"In Errands\", with the chips and rows as drawn"
slice_type: "a picker's list on fixtures; risks adding a to-do twice"
non_negotiables:
  - "Match the Paper artboard that carries the cited state file; on-disk decisions (D-USE-*) win over a stale frame and are named."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
  - "Every state stays reachable by ?state= (canon C-P08)."
devs_call: "The smallest change that makes the capture match; whether it lands in the shared component, the screen or the fixture."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/block-view/states/todos-pool.md"
truth_files: "none: a fix toward the drawn state; no behaviour changes"
qa: Q1
reviewers:
  - assay
focus: []
planned_paths:
  - "apps/web/app/(shell)/days/block/"
  - "apps/web/lib/fixtures/scenarios/block-view-work-todos.ts"
depends_on: []
out_of_scope:
  - "The minors in the same assay pass (spacing, glyphs, wording)"
criteria:
  - id: C1
    statement: "?state=block-view-todos-pool at 402 shows Groceries greyed with no checkbox and \"In Errands\", the chips All types, Errand, Home, the rows as todos-pool.md lists them, and the footer unchanged"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-133-todos-pool-greyed-in-block/evidence/todos-pool-402.png"
---

# Contract — USE-133 todos-pool-greyed-in-block

## Build notes

Drafted from the Paper assay of Day (Review the day, Block view, Item sheet) on 2026-10-18; fixes USE-50 C4.

- **What is wrong:** Assay against Paper: the todos-pool artboard lists Groceries greyed with "In Errands" trailing. Ours leaves out to-dos already in the block, adds a Home row "Hang the shelf", orders the chips Home, Errand, and gives Return the parcel a meta line the state file leaves off.
- **Approach:** compare the capture with the artboard named above (file 01M49AX02VV4SSBKNCN6NRTS6Y, board maps in `specs/web/epics/USE-daily-use/ux/boards/`), change the smallest thing, and recapture.
- **Decisions that apply:** those cited in the state file(s) above.
- **Gotchas:** capture on `/dev/parts?state=…` (item sheets add `&sheet=item&id=`); the host draws the shell's tab bar, which is not a difference.
- **Model:** Opus; a smaller model tends to restyle the shared component for every caller.
