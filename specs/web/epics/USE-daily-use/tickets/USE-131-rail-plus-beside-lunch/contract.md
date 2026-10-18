---
id: "USE-131"
size: small
objective: "Review the day's rail + and its first-mornings callout sit beside the Lunch band, as drawn"
slice_type: "placement of a control on the time rail; risks the callout covering a block"
non_negotiables:
  - "Match the Paper artboard that carries the cited state file; on-disk decisions (D-USE-*) win over a stale frame and are named."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
  - "Every state stays reachable by ?state= (canon C-P08)."
devs_call: "The smallest change that makes the capture match; whether it lands in the shared component, the screen or the fixture."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/first-mornings.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/success.md"
waiver: "One surface, several of its state files drawn on the same row"
truth_files: "none: a fix toward the drawn state; no behaviour changes"
qa: Q1
reviewers:
  - assay
focus: []
planned_paths:
  - "apps/web/app/(shell)/today/review/_components/rail-plus.tsx"
depends_on: []
out_of_scope:
  - "The minors in the same assay pass (spacing, glyphs, wording)"
criteria:
  - id: C1
    statement: "?state=review-first-mornings and review-success at 402 show the + beside Lunch (12:00 to 13:00) and the callout over the Lunch band"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-131-rail-plus-beside-lunch/evidence/rail-plus-402.png"
---

# Contract — USE-131 rail-plus-beside-lunch

## Build notes

Drafted from the Paper assay of Day (Review the day, Block view, Item sheet) on 2026-10-18; fixes USE-37 C1.

- **What is wrong:** Assay against Paper: review-day / first mornings and success draw the rail + beside Lunch with the callout "Tap to add. Hold and drag up or down to pick the time." over the Lunch band. Ours puts the + beside 13:00 Work, so the callout covers Work. Find the rule the + follows (first free gap, or the drawn Lunch) in rail-plus.tsx and the state files.
- **Approach:** compare the capture with the artboard named above (file 01M49AX02VV4SSBKNCN6NRTS6Y, board maps in `specs/web/epics/USE-daily-use/ux/boards/`), change the smallest thing, and recapture.
- **Decisions that apply:** those cited in the state file(s) above.
- **Gotchas:** capture on `/dev/parts?state=…` (item sheets add `&sheet=item&id=`); the host draws the shell's tab bar, which is not a difference.
- **Model:** Opus; a smaller model tends to restyle the shared component for every caller.
