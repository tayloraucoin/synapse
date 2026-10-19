---
id: "USE-137"
size: small
objective: "In a Block view, a long item's row stops growing at the drawn tall-row height, so an overflowing block shows its end line, \"Runs 12 min past 8:00.\" and the item past it within the phone view"
slice_type: "row geometry in a shared view; risks the rail times drifting from the rows, or short rows changing"
non_negotiables:
  - "Match the Paper artboard block-view / overflow / 402 / light; on-disk decisions (D-USE-*) win over a stale frame and are named."
  - "Rows under 15 min keep their present heights (none under 56 px); the rail times stay beside their rows."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
  - "Every state stays reachable by ?state= (canon C-P08)."
devs_call: "The cap or the slower growth past about 15 min, and whether the free region follows the same scale."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/block-view/states/overflow.md"
truth_files: "none: a fix toward the drawn state; no behaviour changes"
qa: Q1
reviewers:
  - assay
focus: []
planned_paths:
  - "apps/web/components/planner/block-view/geometry.ts"
  - "apps/web/components/planner/block-view/geometry.test.ts"
depends_on: []
out_of_scope:
  - "The minors in the same assay pass: the compact pill selects (USE-49 C5, C11), the Free until scale in a new block (C2)"
criteria:
  - id: C1
    statement: "A 30 minute row is no taller than the drawn tall row (about 140 px); rows of 15 min or less keep their heights"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "?state=block-view-overflow at 402 shows the dashed 8:00 line, \"Runs 12 min past 8:00.\" in full, Journal and + Add to Wellness above the fold"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-137-block-view-long-row-height-cap/evidence/overflow-402.png"
---

# Contract — USE-137 block-view-long-row-height-cap

## Build notes

Drafted from the Paper assay of Day (USE-49's Set-my-days editing states) on 2026-10-18; fixes USE-49 C3.

- **What is wrong:** `rowHeightPx` in `geometry.ts` grows linearly at 9.6 px a minute, so Stretch (30 min) draws about 288 px. Paper's `block-view / overflow / 402 / light` draws it as a tall row of about 140 px. Ours pushes the dashed 8:00 line to the fold, half-clips "Runs 12 min past 8:00." and puts Journal off-screen. USE-48's Block view from the day shares the geometry.
- **Approach:** cap or slow the growth past about 15 min, and recapture on `/dev/parts?state=block-view-overflow`.
- **Decisions that apply:** those cited in overflow.md.
- **Gotchas:** the host draws the shell's tab bar, which is not a difference.
- **Model:** Opus; a smaller model tends to rescale every row.
