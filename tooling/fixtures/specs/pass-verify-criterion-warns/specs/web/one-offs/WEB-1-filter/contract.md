---
id: WEB-1
size: small
objective: Filter the records table by status.
slice_type: UI behavior on an existing surface; the risk is a broken empty state.
non_negotiables:
  - Filtering never hides the empty state's action.
devs_call: The control's placement within the toolbar.
cites:
  - tooling/fixtures/specs/pass-verify-criterion-warns/specs/web/ux/records/table.md
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
    statement: The whole chain passes (history; a frozen criterion is never rewritten).
    evidence: check
    command: yarn verify
  - id: C3
    statement: The filter reads well to a person.
    evidence: manual
    reason: a judgment of wording
---

# Contract — WEB-1 filter

## Notes

Synthetic fixture.
