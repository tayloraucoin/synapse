---
id: "USE-130"
size: small
objective: "While Review the day loads, Ready, go is a light muted button reading \"Loading the day\" in muted text, as drawn"
slice_type: "a disabled button's look; risks a disabled control that reads as live"
non_negotiables:
  - "Match the Paper artboard that carries the cited state file; on-disk decisions (D-USE-*) win over a stale frame and are named."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
  - "Every state stays reachable by ?state= (canon C-P08)."
devs_call: "The smallest change that makes the capture match; whether it lands in the shared component, the screen or the fixture."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/loading.md"
truth_files: "none: a fix toward the drawn state; no behaviour changes"
qa: Q1
reviewers:
  - assay
focus: []
planned_paths:
  - "apps/web/app/(shell)/today/review/_components/review-day-frame.tsx"
depends_on: []
out_of_scope:
  - "The minors in the same assay pass (spacing, glyphs, wording)"
criteria:
  - id: C1
    statement: "?state=review-loading at 402 shows Ready, go on --color-fill-muted with \"Loading the day\" in muted text, disabled"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-130-review-loading-ready-go-muted/evidence/loading-402.png"
---

# Contract — USE-130 review-loading-ready-go-muted

## Build notes

Drafted from the Paper assay of Day (Review the day, Block view, Item sheet) on 2026-10-18; fixes USE-34 C1.

- **What is wrong:** Assay against Paper: review-day / loading draws the disabled Ready, go on --color-fill-muted with a muted label. Ours is the default disabled primary, a mid-grey fill.
- **Approach:** compare the capture with the artboard named above (file 01M49AX02VV4SSBKNCN6NRTS6Y, board maps in `specs/web/epics/USE-daily-use/ux/boards/`), change the smallest thing, and recapture.
- **Decisions that apply:** those cited in the state file(s) above.
- **Gotchas:** capture on `/dev/parts?state=…` (item sheets add `&sheet=item&id=`); the host draws the shell's tab bar, which is not a difference.
- **Model:** Opus; a smaller model tends to restyle the shared component for every caller.
