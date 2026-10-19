---
id: WEB-1
size: small
objective: Filter the records table by status.
slice_type: UI behavior on an existing surface; the risk is a broken empty state.
non_negotiables:
  - Filtering never hides the empty state's action.
devs_call: The control's placement within the toolbar.
cites:
  - tooling/fixtures/specs/fail-check-command-not-a-script/specs/web/ux/records/table.md
  - REC-T1
truth_files: "none: the fixture changes no living UX file"
reviewers: []
planned_paths:
  - apps/web/lib/records/filter.ts
depends_on: []
out_of_scope:
  - Saved filters.
criteria:
  - id: C1
    statement: Filtering by status keeps only matching rows.
    evidence: test
    command: yarn test:tooling --test-name-pattern C1
  - id: C2
    statement: Always green.
    evidence: check
    command: "true"
---

# Contract — WEB-1 filter

## Notes

Synthetic fixture.
