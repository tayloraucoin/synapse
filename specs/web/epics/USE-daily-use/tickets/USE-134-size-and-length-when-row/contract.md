---
id: "USE-134"
size: small
objective: "A work item's sheet shows When (\"Today, Work 9:30 ›\") directly under Tier, as drawn, inside the 402 view"
slice_type: "field order in a sheet; risks pushing the drawn fields below the fold"
non_negotiables:
  - "Match the Paper artboard that carries the cited state file; on-disk decisions (D-USE-*) win over a stale frame and are named."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
  - "Every state stays reachable by ?state= (canon C-P08)."
devs_call: "The smallest change that makes the capture match; whether it lands in the shared component, the screen or the fixture."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/size-and-length.md"
truth_files: "none: a fix toward the drawn state; no behaviour changes"
qa: Q1
reviewers:
  - assay
focus: []
planned_paths:
  - "apps/web/components/planner/item-sheet/"
  - "apps/web/lib/fixtures/scenarios/item-sheet.ts"
depends_on: []
out_of_scope:
  - "The minors in the same assay pass (spacing, glyphs, wording)"
criteria:
  - id: C1
    statement: "?state=item-size-and-length&sheet=item&id=<portal> at 402 shows Size, Length, Tier, then When \"Today, Work 9:30 ›\" in view, with Start and Done at the foot"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-134-size-and-length-when-row/evidence/size-and-length-402.png"
---

# Contract — USE-134 size-and-length-when-row

## Build notes

Drafted from the Paper assay of Day (Review the day, Block view, Item sheet) on 2026-10-18; fixes USE-65 C2.

- **What is wrong:** Assay against Paper: now-work / item view, size and length range runs Size, Length, Tier, When, Description, then Start and Done. Ours puts the linked item's Priority and Assignee under Tier, pushing When below the fold, and adds a "Portal sign-in" line under the Linear line. Either the scenario uses an unlinked item or When moves above Priority; say which in the build.
- **Approach:** compare the capture with the artboard named above (file 01M49AX02VV4SSBKNCN6NRTS6Y, board maps in `specs/web/epics/USE-daily-use/ux/boards/`), change the smallest thing, and recapture.
- **Decisions that apply:** those cited in the state file(s) above.
- **Gotchas:** capture on `/dev/parts?state=…` (item sheets add `&sheet=item&id=`); the host draws the shell's tab bar, which is not a difference.
- **Model:** Opus; a smaller model tends to restyle the shared component for every caller.
