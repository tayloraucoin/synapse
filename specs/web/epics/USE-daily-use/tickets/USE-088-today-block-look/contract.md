---
id: "USE-88"
size: small
objective: "Today's own name, icon and colour for a block (Block view's Rename and Icon and colour from the day) live in block_changes for the date, so they sync across devices and reach Now, Schedule and Review the day, replacing USE-48's device-only look"
slice_type: "a schema column set and its fixture write; risks a today-only rename that reaches the usual block, a look lost on another device, and a migration run against a hosted database unreviewed"
non_negotiables:
  - "The usual block never changes: the look is the date's block_changes row only."
  - "No migration here: the columns come in 0015 (USE-87); the schema is not edited by this ticket."
  - "RLS stays deny-by-default and user-private; every query through ctx.rls.execute()."
devs_call: "Column names and types; whether a cleared name falls back to the block's."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/block-view/states/header-menu.md"
truth_files: "none: day/block-view/ is promoted with USE"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/validators/src/planner.ts"
  - "apps/web/lib/fixtures/planner/"
  - "apps/web/lib/data/use-today-block-look.ts"
  - "apps/web/app/(shell)/today/block/"
depends_on:
  - "USE-48"
  - "USE-87"
out_of_scope:
  - "Editing mode's Rename and Icon and colour (every such weekday): the Block view editing tickets"
criteria:
  - id: C1
    statement: "A rename from the day writes the date's block_changes name; the usual block's name is unchanged and next week's occurrence reads the usual name"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "An icon and colour picked from the day reads on Now, Schedule and Review the day for that date only"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
---

# Contract — today-block-look

## Build notes

- USE-48 keeps Block view's Rename and Icon and colour from the day on the device (`useTodayBlockLook`, localStorage keyed by date and block), since `block_changes` has no name, icon or colour. 0015 (USE-87, wave 3 gate) gives the date's change those columns (`block_changes.name`, `icon`, `colour`); this ticket moves the look there: `useTodayBlockLook` goes.
- The day's readers (`readDay`, `deriveToday`, the week read) take the change's name and icon over the block's on that date.
- **Model:** Opus 5.5 at medium.
