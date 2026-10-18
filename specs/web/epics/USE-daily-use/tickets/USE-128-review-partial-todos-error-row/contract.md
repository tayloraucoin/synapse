---
id: "USE-128"
size: small
objective: "When only the to-dos fail, Review the day's tray row reads \"To-dos didn't load.\" with Try again, while the column and Ready, go show as success"
slice_type: "one region's error state on fixtures; risks the failed region taking the day down, or a tray that waits forever"
non_negotiables:
  - "Match the Paper artboard that carries the cited state file; on-disk decisions (D-USE-*) win over a stale frame and are named."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
  - "Every state stays reachable by ?state= (canon C-P08)."
devs_call: "The smallest change that makes the capture match; whether it lands in the shared component, the screen or the fixture."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/partial.md"
truth_files: "none: a fix toward the drawn state; no behaviour changes"
qa: Q1
reviewers:
  - assay
focus: []
planned_paths:
  - "apps/web/lib/fixtures/scenarios/review-day.ts"
  - "apps/web/app/(shell)/today/review/_components/"
depends_on: []
out_of_scope:
  - "The minors in the same assay pass (spacing, glyphs, wording)"
criteria:
  - id: C1
    statement: "?state=review-partial-todos at 402 shows the tray row \"To-dos didn't load.\" with Try again, and the column and Ready, go as success"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-128-review-partial-todos-error-row/evidence/partial-todos-402.png"
  - id: C2
    statement: "Try again on the tray refetches only the to-dos"
    evidence: test
    command: "yarn test"
---

# Contract — USE-128 review-partial-todos-error-row

## Build notes

Drafted from the Paper assay of Day (Review the day, Block view, Item sheet) on 2026-10-18; fixes USE-34 C3.

- **What is wrong:** Assay: ?state=review-partial-todos still shows the tray as two skeleton bars after 8 s in a real browser, with no error row and no Try again. The to-dos query looks stuck loading (retrying, or the scenario fails it as loading).
- **Approach:** compare the capture with the artboard named above (file 01M49AX02VV4SSBKNCN6NRTS6Y, board maps in `specs/web/epics/USE-daily-use/ux/boards/`), change the smallest thing, and recapture.
- **Decisions that apply:** those cited in the state file(s) above.
- **Gotchas:** capture on `/dev/parts?state=…` (item sheets add `&sheet=item&id=`); the host draws the shell's tab bar, which is not a difference.
- **Model:** Opus; a smaller model tends to restyle the shared component for every caller.
