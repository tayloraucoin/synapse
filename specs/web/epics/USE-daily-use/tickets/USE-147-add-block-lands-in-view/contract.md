---
id: USE-147
size: small
objective: "Add block opens the new block's Block view with the add row focused, in place of closing to the column"
slice_type: "navigation after a write; risks landing on the wrong week or date and a stale sheet param"
non_negotiables:
  - "USE-46's stopgap in sheet-host.tsx goes."
  - "The usual week lands on daysBlockRoute(id, { weekday }); a dated week on daysBlockRoute(id, { date })."
  - "The add row is open and focused (C-USE-new-block-sheet-wellness-2)."
devs_call: "none"
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/states/wellness.md"
  - "C-USE-new-block-sheet-wellness-2"
truth_files: "none: the cited state already says this; the code catches up"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/_components/sheet-host.tsx"
  - "apps/web/components/planner/new-block-sheet/new-block-sheet.tsx"
  - "apps/web/components/planner/new-block-sheet/added-route.ts"
  - "apps/web/components/planner/new-block-sheet/added-route.test.ts"
depends_on: []
out_of_scope:
  - "A transition between blocks, which has no Block view and still closes to the column"
criteria:
  - id: C1
    statement: "addedRoute gives the usual weekday's or the date's block route for a block, and null for a transition"
    evidence: test
    command: "yarn workspace web test"
---

# Contract — USE-147 add-block-lands-in-view

## Build notes

Fix 6 of Taylor's review of 2026-10-19.

- **Approach:** `onAdded(id, form, scope)` in sheet-host closes the sheet's params and `router.push(daysBlockRoute(…))`; Block view's `isNew` already opens the add row focused on an empty block.
- **Model:** any.
