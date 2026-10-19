---
id: "USE-126"
size: small
objective: "Review the day shows a short block's items as Paper draws them: Training at 42 to 57 min lists Drive to the YMCA, its workout and Drive home on two lines, not one line and \"+2 more\""
slice_type: "layout arithmetic in a shared pure function; risks overflowing a block, or changing Wellness's \"+2 more\" at 402"
non_negotiables:
  - "Match the Paper artboard that carries the cited state file; on-disk decisions (D-USE-*) win over a stale frame and are named."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
  - "Every state stays reachable by ?state= (canon C-P08)."
devs_call: "The smallest change that makes the capture match; whether it lands in the shared component, the screen or the fixture."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/first-edit.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/after-swap-undo.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/late.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/late-passed-open.md"
waiver: "One surface, several of its state files drawn on the same row"
truth_files: "none: a fix toward the drawn state; no behaviour changes"
qa: Q1
reviewers:
  - assay
focus: []
planned_paths:
  - "packages/utils/src/planner/bullet-grid.ts"
  - "packages/utils/src/planner/bullet-grid.test.ts"
  - "apps/web/app/(shell)/today/review/_components/"
depends_on: []
out_of_scope:
  - "The minors in the same assay pass (spacing, glyphs, wording)"
criteria:
  - id: C1
    statement: "bulletGrid gives a 42 to 57 minute block at 96 px an hour two bullet lines, so three items show with no \"+n more\"; Wellness at 55 min with five items still shows three and \"+2 more\""
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "?state=review-first-edit, review-after-swap-undo, review-late and review-late-passed-open at 402 show all three Training items on two lines"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-126-bullet-grid-short-block-lines/evidence/training-two-lines-402.png"
---

# Contract — USE-126 bullet-grid-short-block-lines

## Build notes

Drafted from the Paper assay of Day (Review the day, Block view, Item sheet) on 2026-10-18; fixes USE-37 C2, C3; USE-38 C1, C2.

- **What is wrong:** Assay against Paper (2026-10-18): Paper's review-day / first-edit, after swap, undo, late and late, passed open artboards draw Training with three items on two lines. Ours shows "Drive to the YMCA" and "+2 more". `bulletLines` budgets lines from the block's height less its padding and head, and a 42 to 57 minute block (about 67 to 91 px) gets one line.
- **Approach:** compare the capture with the artboard named above (file 01M49AX02VV4SSBKNCN6NRTS6Y, board maps in `specs/web/epics/USE-daily-use/ux/boards/`), change the smallest thing, and recapture.
- **Decisions that apply:** those cited in the state file(s) above.
- **Gotchas:** capture on `/dev/parts?state=…` (item sheets add `&sheet=item&id=`); the host draws the shell's tab bar, which is not a difference.
- **Model:** Opus; a smaller model tends to restyle the shared component for every caller.
