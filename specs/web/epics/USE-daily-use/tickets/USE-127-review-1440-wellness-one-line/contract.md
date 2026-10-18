---
id: "USE-127"
size: small
objective: "At 1440 Review the day's Wellness reads three bullets and \"+2 more\" on one line in fixed cells, as drawn"
slice_type: "responsive layout of a shared grid; risks the 402 layout"
non_negotiables:
  - "Match the Paper artboard that carries the cited state file; on-disk decisions (D-USE-*) win over a stale frame and are named."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
  - "Every state stays reachable by ?state= (canon C-P08)."
devs_call: "The smallest change that makes the capture match; whether it lands in the shared component, the screen or the fixture."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/success.md"
truth_files: "none: a fix toward the drawn state; no behaviour changes"
qa: Q1
reviewers:
  - assay
focus: []
planned_paths:
  - "packages/utils/src/planner/bullet-grid.ts"
  - "apps/web/app/(shell)/today/review/_components/"
depends_on: []
out_of_scope:
  - "The minors in the same assay pass (spacing, glyphs, wording)"
criteria:
  - id: C1
    statement: "?state=review-success at 1440 shows Wellness as Pee and weigh, Water, Start the cold bath and \"+2 more\" on one line in fixed cells; 402 unchanged"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-127-review-1440-wellness-one-line/evidence/success-1440.png"
---

# Contract — USE-127 review-1440-wellness-one-line

## Build notes

Drafted from the Paper assay of Day (Review the day, Block view, Item sheet) on 2026-10-18; fixes USE-31 C2.

- **What is wrong:** Assay against Paper: review-day / success / 1440 draws Wellness's bullets on one line with "+2 more" (USE-31 C2's words). Ours lays all five bullets over two lines with no "+2 more".
- **Approach:** compare the capture with the artboard named above (file 01M49AX02VV4SSBKNCN6NRTS6Y, board maps in `specs/web/epics/USE-daily-use/ux/boards/`), change the smallest thing, and recapture.
- **Decisions that apply:** those cited in the state file(s) above.
- **Gotchas:** capture on `/dev/parts?state=…` (item sheets add `&sheet=item&id=`); the host draws the shell's tab bar, which is not a difference.
- **Model:** Opus; a smaller model tends to restyle the shared component for every caller.
