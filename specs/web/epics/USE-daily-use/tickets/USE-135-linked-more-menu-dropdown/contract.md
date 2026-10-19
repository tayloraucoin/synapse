---
id: "USE-135"
size: small
objective: "A linked item's ··· opens a DropdownMenu over the open sheet with one rule before Unlink from Linear, as drawn"
slice_type: "a menu's form on the phone; risks two forms of the same menu"
non_negotiables:
  - "Match the Paper artboard that carries the cited state file; on-disk decisions (D-USE-*) win over a stale frame and are named."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
  - "Every state stays reachable by ?state= (canon C-P08)."
devs_call: "The smallest change that makes the capture match; whether it lands in the shared component, the screen or the fixture."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/linear-more-open.md"
truth_files: "none: a fix toward the drawn state; no behaviour changes"
qa: Q1
reviewers:
  - assay
focus: []
planned_paths:
  - "apps/web/components/planner/item-sheet/work-more.tsx"
depends_on: []
out_of_scope:
  - "The minors in the same assay pass (spacing, glyphs, wording)"
criteria:
  - id: C1
    statement: "?state=item-linear-more-open&sheet=item&id=<linked> at 402 shows a DropdownMenu from ··· over the open sheet: \"[Fix the sync retry], today only\", Move to…, Not today (circle-slash), one rule, Unlink from Linear with its line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-135-linked-more-menu-dropdown/evidence/linear-more-open-402.png"
---

# Contract — USE-135 linked-more-menu-dropdown

## Build notes

Drafted from the Paper assay of Day (Review the day, Block view, Item sheet) on 2026-10-18; fixes USE-66 C5.

- **What is wrong:** Assay against Paper: item-sheet / Linear linked, ··· open and linear-more-open.md draw a DropdownMenu over the still-open sheet with one rule before Unlink. Ours closes the sheet and shows a bottom action sheet (work-more-open.md's form, USE-65) with rules after Move to… and Not today, and a calendar-x Not today. If the action-sheet form should win everywhere, Taylor rules and linear-more-open.md and its artboard change instead.
- **Approach:** compare the capture with the artboard named above (file 01M49AX02VV4SSBKNCN6NRTS6Y, board maps in `specs/web/epics/USE-daily-use/ux/boards/`), change the smallest thing, and recapture.
- **Decisions that apply:** those cited in the state file(s) above.
- **Gotchas:** capture on `/dev/parts?state=…` (item sheets add `&sheet=item&id=`); the host draws the shell's tab bar, which is not a difference.
- **Model:** Opus; a smaller model tends to restyle the shared component for every caller.
