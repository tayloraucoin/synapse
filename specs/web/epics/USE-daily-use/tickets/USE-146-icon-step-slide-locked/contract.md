---
id: USE-146
size: small
objective: "The icon step stays inside the New block sheet but slides in from the right and back out, and the sheet's height is locked while it is open, so tab switches and search never resize the drawer"
slice_type: "motion and layout inside a sheet; risks motion that ignores reduced motion and a height that jumps"
non_negotiables:
  - "Duration and easing from preset tokens (--dur-sheet, --ease-settle); none under prefers-reduced-motion."
  - "The step stays inside the sheet (Taylor, 2026-10-19), back on the left."
  - "Height locked at the moment the step opens; released when it closes."
devs_call: "How the lock is applied; the default is the drawer content's measured height held while the step shows."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/icon-picker/index.md"
  - "C-USE-icon-picker-1"
truth_files: "none: the epic's own ux/ ledger is amended in the same commit (interactions/icon-picker/index.md); it promotes to specs/web/ux/ with USE"
qa: Q1
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/components/planner/new-block-sheet/new-block-sheet.tsx"
  - "apps/web/components/planner/sheet-step.tsx"
  - "specs/web/epics/USE-daily-use/ux/interactions/icon-picker/index.md"
depends_on: []
out_of_scope:
  - "The other sheets' icon steps (the item and to-do sheets), which can take SheetStep later"
criteria:
  - id: C1
    statement: "The step's wrapper carries the slide on the duration token and none under reduced motion; the drawer's height holds across the Emoji and Icon tabs"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-146-icon-step-slide-locked/evidence/"
---

# Contract — USE-146 icon-step-slide-locked

## Build notes

Fix 5 of Taylor's review of 2026-10-19.

- **Approach:** `SheetStep` (apps/web/components/planner/sheet-step.tsx): on mount it reads the closest drawer or sheet content's height and holds it as an inline height until unmount; its child enters with `animate-in slide-in-from-right` and leaves with `slide-out-to-right` on `--dur-sheet` before the sheet's fields return.
- **Model:** Opus 5.5.
