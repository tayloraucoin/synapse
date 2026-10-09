---
id: WEB-1
size: small
objective: Filter the records table by status.
slice_type: UI behavior on an existing surface; the risk is a broken empty state.
non_negotiables:
  - Filtering never hides the empty state's action.
devs_call: The control's placement within the toolbar.
cites:
  - tooling/fixtures/specs/pass-q2-draft-second-reviewer-warns/specs/web/ux/records/table.md
  - REC-T1
truth_files: "none: the fixture changes no living UX file"
qa: Q2
reviewers:
  - assay
  - mason
focus: []
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
    statement: Tooling types pass.
    evidence: check
    command: yarn check-types:tooling
---

# Contract — WEB-1 filter

## Notes

Synthetic fixture: a Tickets-stage draft (never started) that names a second reviewer at Q2 with no focus line. check-specs warns and names it; contract:init would refuse the start.
